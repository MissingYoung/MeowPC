<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { adminUserApi } from '@/lib/api'
import { CampusMap, type AdminUserItem, type AdminUserDetail, type UserQueryParams } from '@/types'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem
} from '@/components/ui/pagination'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

// 状态定义
const loading = ref(false)
const allUserList = ref<AdminUserItem[]>([]) // 所有数据
const pageSize = 10 // 每页显示数量
const currentPage = ref(1)
const searchText = ref('') // 搜索关键字
const detailOpen = ref(false)
const detailLoading = ref(false)
const detailUser = ref<AdminUserDetail | null>(null)
const actionLoadingId = ref<number | null>(null)

// 封禁确认弹窗
const banDialogOpen = ref(false)
const banTargetUser = ref<AdminUserItem | null>(null)

// 列表补充：部分字段（角色/学号/等级）列表接口未返回，尝试拉详情补齐
const enrichUserList = async (items: AdminUserItem[]): Promise<AdminUserItem[]> => {
  const needs = items.map((item) => {
    const needRole = !item.permission && !item.role && !item.roleName
    const needSid = !item.sid && !item.studentId
    const needLevel = item.level === undefined && item.levelTitle === undefined
    return { needRole, needSid, needLevel }
  })

  // 如果都不需要补充，直接返回
  if (needs.every((n) => !n.needRole && !n.needSid && !n.needLevel)) {
    return items
  }

  const enriched = await Promise.allSettled(
    items.map(async (item, index) => {
      const { needRole, needSid, needLevel } = needs[index] ?? {
        needRole: false,
        needSid: false,
        needLevel: false
      }
      if (!needRole && !needSid && !needLevel) return item
      try {
        const detail = await adminUserApi.getUserDetail(item.id)
        return { ...item, ...detail }
      } catch (error) {
        console.warn('补充用户详情失败', item.id, error)
        return item
      }
    })
  )

  const merged = enriched.map((res, index) =>
    res.status === 'fulfilled' ? (res.value as AdminUserItem) : items[index]
  ) as AdminUserItem[]

  return merged
}

// 获取用户列表 (加载全部数据)
const fetchUserList = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: 1,
      size: 1000 // 加载所有数据，前端分页
    }

    const res = await adminUserApi.getUserList(params as UserQueryParams)
    const rawItems = res.items || []
    allUserList.value = await enrichUserList(rawItems)
  } catch (error) {
    console.error('Failed to fetch user list:', error)
    toast.error('获取用户列表失败，请重试')
  } finally {
    loading.value = false
  }
}

// 根据搜索关键字过滤
const filteredList = computed(() => {
  if (!searchText.value.trim()) {
    return allUserList.value
  }
  const keyword = searchText.value.toLowerCase()
  return allUserList.value.filter(
    (user) =>
      user.name?.toLowerCase().includes(keyword) ||
      user.studentId?.toLowerCase().includes(keyword)
  )
})

// 计算总页数
const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize))

// 当前页显示的数据
const userList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredList.value.slice(start, end)
})

// 分页页码列表
const paginationPages = computed(() => {
  const pages: (number | 'ellipsis')[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 4) pages.push('ellipsis')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 3) pages.push('ellipsis')
    pages.push(total)
  }
  return pages
})

// 搜索时重置页码
watch(searchText, () => {
  currentPage.value = 1
})

// 查看详情（弹窗）
const handleViewDetail = async (userId: string | number) => {
  detailOpen.value = true
  detailLoading.value = true
  detailUser.value = null
  try {
    detailUser.value = await adminUserApi.getUserDetail(userId)
  } catch (error) {
    toast.error('获取用户详情失败')
  } finally {
    detailLoading.value = false
  }
}

// 封禁/解封用户
const handleToggleBan = (user: AdminUserItem) => {
  if (actionLoadingId.value !== null) return
  banTargetUser.value = user
  banDialogOpen.value = true
}

const confirmToggleBan = async () => {
  const user = banTargetUser.value
  if (!user) return
  
  const isBanned = user.status?.toUpperCase() === 'BANNED'
  const actionText = isBanned ? '解封' : '封禁'
  
  banDialogOpen.value = false
  actionLoadingId.value = Number(user.id)
  try {
    await adminUserApi.toggleBan(user.id)
    toast.success(`${actionText}成功`)
    await fetchUserList()
  } catch (error) {
    toast.error(`${actionText}失败`)
  } finally {
    actionLoadingId.value = null
    banTargetUser.value = null
  }
}

// 挂载时获取数据
onMounted(() => {
  fetchUserList()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">用户管理</h1>
        <p class="text-gray-600">仅展示基础信息，可点击查看详情</p>
      </div>

      <!-- 结果统计 -->
      <div class="mb-4 text-sm text-gray-600">
        共 <span class="font-semibold text-gray-900">{{ filteredList.length }}</span> 个用户
      </div>

      <!-- 用户列表表格 -->
          <div class="bg-white border-2 border-black rounded-xl shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div class="p-0">
          <div v-if="loading" class="p-8 text-center text-gray-500">
            加载中...
          </div>
          <div v-else-if="userList.length === 0" class="p-8 text-center text-gray-500">
            暂无用户数据
          </div>
          <div v-else class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>用户</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>学号</TableHead>
                  <TableHead>等级</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="user in userList" :key="user.id" class="hover:bg-gray-50">
                      <!-- ID -->
                      <TableCell class="border-b-2 border-black">
                        <span class="text-sm text-gray-700">#{{ user.id }}</span>
                      </TableCell>

                      <!-- 用户信息 -->
                  <TableCell>
                    <div class="flex items-center gap-3">
                      <Avatar class="w-8 h-8 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        <AvatarImage v-if="user.avatar" :src="user.avatar" :alt="user.name" />
                        <AvatarFallback>{{ user.name.charAt(0) }}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p class="font-medium text-gray-900">{{ user.name }}</p>
                      </div>
                    </div>
                  </TableCell>

                      <!-- 角色/权限 -->
                      <TableCell class="border-b-2 border-black">
                        <span class="inline-block border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] px-2 py-1 text-sm text-gray-700 bg-white">{{ user.permission || user.role || user.roleName || '未知' }}</span>
                      </TableCell>

                      <!-- 学号 -->
                      <TableCell class="border-b-2 border-black">
                        <span class="text-sm text-gray-700">{{ user.sid || user.studentId || '未提供' }}</span>
                      </TableCell>

                      <!-- 等级 -->
                      <TableCell class="border-b-2 border-black">
                        <span class="inline-block border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] px-2 py-1 text-sm bg-primary text-gray-700">Lv.{{ user.level ?? user.levelTitle ?? '-' }}</span>
                      </TableCell>

                      <!-- 状态 -->
                      <TableCell class="border-b-2 border-black">
                        <Badge variant="outline" class="border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] px-2 py-1">{{ user.status || 'NORMAL' }}</Badge>
                      </TableCell>

                      <!-- 操作 -->
                      <TableCell class="border-b-2 border-black">
                        <div class="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" :disabled="loading" @click="handleViewDetail(user.id)"
                            class="border-2 border-black rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold">
                            查看详情
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            :disabled="loading || actionLoadingId === Number(user.id) || (user.permission?.toUpperCase?.() === 'ADMIN' || user.role?.toUpperCase?.() === 'ADMIN')"
                            @click="handleToggleBan(user)"
                            class="border-2 border-black rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold"
                          >
                            {{ (user.status?.toUpperCase() === 'BANNED') ? '解封' : '封禁' }}
                          </Button>
                        </div>
                      </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="mt-6 flex justify-center" v-if="totalPages > 1">
        <Pagination :total="filteredList.length" :items-per-page="pageSize" :page="currentPage">
          <PaginationContent class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              class="h-9 w-9"
              :disabled="currentPage <= 1"
              @click="currentPage > 1 && (currentPage = currentPage - 1)"
            >
              <ChevronLeft class="h-4 w-4" />
            </Button>

            <template v-for="(page, index) in paginationPages" :key="`page-${page}-${index}`">
              <PaginationItem v-if="page === 'ellipsis'" :value="index">
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem v-else :value="page as number">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-9 w-9"
                  :class="currentPage === page ? 'bg-purple-500 text-white hover:bg-purple-600' : ''"
                  @click="currentPage = page as number"
                >
                  {{ page }}
                </Button>
              </PaginationItem>
            </template>

            <Button
              variant="ghost"
              size="icon"
              class="h-9 w-9"
              :disabled="currentPage >= totalPages"
              @click="currentPage < totalPages && (currentPage = currentPage + 1)"
            >
              <ChevronRight class="h-4 w-4" />
            </Button>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  </div>

  <!-- 详情弹窗 -->
  <Dialog v-model:open="detailOpen">
    <DialogContent class="max-w-lg p-0 overflow-hidden">
      <!-- 顶部背景 + 头像 -->
      <div class="relative bg-[#5CD6C2] pt-8 pb-12 px-6">
        <DialogHeader class="text-white">
          <DialogTitle class="text-xl font-bold text-white">用户详情</DialogTitle>
        </DialogHeader>
      </div>
      
      <!-- 头像浮动卡片 -->
      <div class="relative px-6 -mt-10">
        <!-- 加载骨架屏 -->
        <div v-if="detailLoading" class="animate-pulse">
          <div class="flex items-end gap-4 mb-6">
            <div class="w-20 h-20 bg-gray-300 rounded-full border-4 border-white shadow-lg"></div>
            <div class="flex-1 pb-2 space-y-2">
              <div class="h-5 bg-gray-200 rounded w-28"></div>
              <div class="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
          <div class="space-y-4 pb-6">
            <div class="flex gap-2">
              <div class="h-6 bg-gray-200 rounded-full w-16"></div>
              <div class="h-6 bg-gray-200 rounded-full w-20"></div>
              <div class="h-6 bg-gray-200 rounded-full w-14"></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="h-16 bg-gray-100 rounded-xl"></div>
              <div class="h-16 bg-gray-100 rounded-xl"></div>
              <div class="h-16 bg-gray-100 rounded-xl"></div>
              <div class="h-16 bg-gray-100 rounded-xl"></div>
            </div>
          </div>
        </div>
        
        <!-- 详情内容 -->
        <div v-else-if="detailUser" class="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <!-- 头像和基本信息 -->
          <div class="flex items-end gap-4 mb-5">
            <Avatar class="w-20 h-20 border-4 border-white shadow-lg ring-2 ring-amber-200">
              <AvatarImage v-if="detailUser.avatar" :src="detailUser.avatar" :alt="detailUser.name" />
              <AvatarFallback class="text-2xl font-bold bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700">
                {{ detailUser.name?.charAt(0) || 'U' }}
              </AvatarFallback>
            </Avatar>
            <div class="flex-1 pb-1">
              <p class="text-xl font-bold text-gray-900">{{ detailUser.name }}</p>
              <p v-if="detailUser.nickname" class="text-sm text-gray-500">{{ detailUser.nickname }}</p>
              <p class="text-xs text-gray-400 mt-0.5">ID: {{ detailUser.id }}</p>
            </div>
          </div>
          
          <!-- 标签组 -->
          <div class="flex flex-wrap gap-2 mb-5">
            <Badge 
              :class="detailUser.permission === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-100'"
              variant="outline"
            >
              {{ detailUser.permission === 'ADMIN' ? '管理员' : '普通用户' }}
            </Badge>
            <Badge variant="outline" class="bg-green-50 text-green-600 border-green-100">
              Lv.{{ detailUser.level ?? 1 }} {{ detailUser.title || '' }}
            </Badge>
            <Badge 
              :class="detailUser.status === 'BANNED' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'"
              variant="outline"
            >
              {{ detailUser.status === 'BANNED' ? '已封禁' : '正常' }}
            </Badge>
          </div>
          
          <!-- 信息卡片网格 -->
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p class="text-xs text-gray-400 mb-1">学号</p>
              <p class="text-sm font-semibold text-gray-800">{{ detailUser.sid || detailUser.studentId || '未绑定' }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p class="text-xs text-gray-400 mb-1">校区</p>
              <p class="text-sm font-semibold text-gray-800">{{ detailUser.campus !== undefined ? CampusMap[Number(detailUser.campus)] || '未知' : '未知' }}</p>
            </div>
            <div class="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <p class="text-xs text-amber-500 mb-1">小鱼干</p>
              <p class="text-sm font-bold text-amber-600">{{ detailUser.currency ?? 0 }}</p>
            </div>
            <div class="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p class="text-xs text-blue-400 mb-1">经验值</p>
              <p class="text-sm font-bold text-blue-600">{{ detailUser.exp ?? 0 }} / {{ detailUser.nextExp ?? '-' }}</p>
            </div>
          </div>
          
          <!-- 统计数据 -->
          <div v-if="detailUser.stats" class="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100 mb-4">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">用户统计</p>
            <div class="grid grid-cols-4 gap-2 text-center">
              <div>
                <p class="text-lg font-bold text-gray-800">{{ detailUser.stats.feedCount ?? 0 }}</p>
                <p class="text-xs text-gray-400">投喂</p>
              </div>
              <div>
                <p class="text-lg font-bold text-gray-800">{{ detailUser.stats.foundNewCatCount ?? detailUser.stats.found ?? 0 }}</p>
                <p class="text-xs text-gray-400">发现</p>
              </div>
              <div>
                <p class="text-lg font-bold text-gray-800">{{ detailUser.stats.momentCount ?? 0 }}</p>
                <p class="text-xs text-gray-400">动态</p>
              </div>
              <div>
                <p class="text-lg font-bold text-gray-800">{{ detailUser.stats.receivedLikes ?? 0 }}</p>
                <p class="text-xs text-gray-400">获赞</p>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="py-8 text-center text-gray-500">暂无数据</div>
      </div>
    </DialogContent>
  </Dialog>

  <!-- 封禁/解封确认对话框 -->
  <ConfirmDialog
    v-model:open="banDialogOpen"
    :title="banTargetUser?.status?.toUpperCase() === 'BANNED' ? '解封用户' : '封禁用户'"
    :description="`确认${banTargetUser?.status?.toUpperCase() === 'BANNED' ? '解封' : '封禁'}用户「${banTargetUser?.name}」吗？`"
    :confirm-text="banTargetUser?.status?.toUpperCase() === 'BANNED' ? '解封' : '封禁'"
    :variant="banTargetUser?.status?.toUpperCase() === 'BANNED' ? 'default' : 'danger'"
    @confirm="confirmToggleBan"
  />
</template>