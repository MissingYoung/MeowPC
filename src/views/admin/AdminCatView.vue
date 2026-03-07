<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PenSquare, FileText, Trash2, Sparkles } from 'lucide-vue-next'
import { catApi } from '@/lib/api'
import EditCatDialog from '@/components/EditCatDialog.vue'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { AdminCatItem } from '@/types'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()

// 编辑对话框状态
const editDialogOpen = ref(false)
const selectedCatForEdit = ref<AdminCatItem | null>(null)

// 删除确认弹窗
const deleteDialogOpen = ref(false)
const deleteCatId = ref<string>('')
const deleteCatName = ref<string>('')

// 状态和常量定义
const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '在校', value: '在校' },
  { label: '毕业/领养', value: '毕业' },
  { label: '休学/生病', value: '休学' },
  { label: '喵星', value: '喵星' }
]

const COLOR_OPTIONS = [
  { label: '全部', value: '' },
  { label: '橘猫', value: '橘猫' },
  { label: '狸花', value: '狸花' },
  { label: '三花/玳瑁', value: '三花' },
  { label: '奶牛/黑白', value: '奶牛' },
  { label: '纯色', value: '纯色' }
]

// 数据状态
const loading = ref(false)
const allCats = ref<AdminCatItem[]>([])
const pageSize = 10

// 从路由 query 获取过滤条件
const selectedStatus = computed({
  get: () => String(route.query.status || ''),
  set: (val) => {
    // 设置应用内导航标记
    sessionStorage.setItem('adminCatNavigation', 'true')
    router.push({
      query: { ...route.query, status: val || undefined, page: '1' }
    })
  }
})

const selectedColor = computed({
  get: () => String(route.query.color || ''),
  set: (val) => {
    // 设置应用内导航标记
    sessionStorage.setItem('adminCatNavigation', 'true')
    router.push({
      query: { ...route.query, color: val || undefined, page: '1' }
    })
  }
})

const searchText = computed({
  get: () => String(route.query.search || ''),
  set: (val) => {
    // 设置应用内导航标记
    sessionStorage.setItem('adminCatNavigation', 'true')
    router.push({
      query: { ...route.query, search: val || undefined, page: '1' }
    })
  }
})



// 获取所有猫咪数据（一次性加载）
const fetchAllCats = async () => {
  loading.value = true
  try {
    const res = await catApi.getAdminCatList({
      page: 1,
      pageSize: 1000, // 一次性加载所有数据
      status: '',
      color: '',
      search: ''
    })
    if (res) {
      allCats.value = res.items
    }
  } catch (error) {
    console.error('Failed to fetch cats:', error)
  } finally {
    loading.value = false
  }
}



// 过滤逻辑（参照 HomeView）
const filteredCats = computed(() => {
  let cats = allCats.value || []

  // 按状态过滤
  if (selectedStatus.value) {
    cats = cats.filter(c => c.status.includes(selectedStatus.value))
  }

  // 按花色过滤
  if (selectedColor.value) {
    cats = cats.filter(c => {
      if (!c.color) return false
      const color = String(c.color || '')
      if (selectedColor.value === '纯色') {
        return color.includes('纯')
      }
      return color.includes(selectedColor.value)
    })
  }

  // 按搜索文本过滤（模糊匹配 名字/花色/常驻地）
  const q = searchText.value.trim().toLowerCase()
  if (q) {
    cats = cats.filter(c => {
      const name = String(c.name || '').toLowerCase()
      const color = String(c.color || '').toLowerCase()
      const location = String(c.locationName || '').toLowerCase()
      return name.includes(q) || color.includes(q) || location.includes(q)
    })
  }

  return cats
})

// 分页数据
const paginatedCats = computed(() => {
  const pageNum = parseInt(String(route.query.page || '1'), 10)
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  return filteredCats.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredCats.value.length / pageSize)
})

const currentPageNum = computed(() => {
  return parseInt(String(route.query.page || '1'), 10)
})

// 事件处理
const handleAddCat = () => {
  selectedCatForEdit.value = null
  editDialogOpen.value = true
}

const handleEdit = (cat: AdminCatItem) => {
  selectedCatForEdit.value = cat
  editDialogOpen.value = true
  // 异步获取完整数据
  catApi.getCatDetail(cat.id).then(fullCatData => {
    if (fullCatData && selectedCatForEdit.value?.id === cat.id) {
      // 确保还是同一只猫，防止用户快速切换
      selectedCatForEdit.value = {
        ...selectedCatForEdit.value,
        description: fullCatData.description || '',
        attributes: fullCatData.attributes,
      } as AdminCatItem
    }
  }).catch(error => {
    console.warn('获取猫咪详情失败，使用列表数据', error)
  })
}

const handleEditSuccess = async () => {
  // 编辑成功后，关闭对话框并刷新列表
  editDialogOpen.value = false
  selectedCatForEdit.value = null
  // 重新加载全部猫咪数据
  await fetchAllCats()
}

const handleDelete = (id: string, name: string) => {
  deleteCatId.value = id
  deleteCatName.value = name
  deleteDialogOpen.value = true
}

const confirmDelete = async () => {
  deleteDialogOpen.value = false
  try {
    await catApi.deleteCat(deleteCatId.value)
    toast.success('删除成功')
    await fetchAllCats()
  } catch (error) {
    toast.error('删除失败')
  } finally {
    deleteCatId.value = ''
    deleteCatName.value = ''
  }
}

const handlePageChange = (page: number) => {
  router.push({
    query: { ...route.query, page: String(page) }
  })
}

// 页面挂载时加载数据
onMounted(() => {
  // 检查是否是从应用内导航过来（通过 sessionStorage 标记）
  const isFromSearch = sessionStorage.getItem('adminCatSearchNavigation') === 'true'
  const isFromPageNav = sessionStorage.getItem('adminCatNavigation') === 'true'
  
  if (isFromSearch) {
    // 从 AdminLayout 搜索过来：清除标记，保留搜索参数，加载数据
    sessionStorage.removeItem('adminCatSearchNavigation')
  } else if (isFromPageNav) {
    // 从页面内筛选導航过来：清除标记，保留所有参数（包括搜索）
    sessionStorage.removeItem('adminCatNavigation')
  } else if (route.query.search) {
    // 手动刷新页面（没有任何导航标记但有搜索参数）：清空搜索条件
    router.replace({
      path: route.path,
      query: {
        status: route.query.status,
        color: route.query.color,
        page: '1'
      }
    })
  }
  
  // 加载全部猫咪数据
  fetchAllCats()
})

// 辅助函数：状态颜色映射
const getStatusColorClass = (status: string) => {
  if (status.includes('在校')) return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200'
  if (status.includes('毕业') || status.includes('领养')) return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100 border-cyan-200'
  if (status.includes('生病') || status.includes('未绝育')) return 'bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200'
  if (status.includes('喵星')) return 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200'
  return ''
}

const getNeuteredColorClass = (isNeutered: boolean) => {
  return isNeutered
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : 'bg-orange-100 text-orange-800 border-orange-200'
}



</script>

<template>
  <div class="p-6 space-y-6">
    <!-- 筛选区域 -->
    <div class="bg-white p-4 border-2 border-black rounded-xl shadow-[6px_6px_0px_rgba(0,0,0,1)]">
      <!-- 顶部：状态筛选 + 发现新猫按钮 -->
      <div class="flex items-center justify-between gap-4 mb-4">
        <div class="flex items-center gap-4 flex-1">
          <span class="text-sm font-medium text-gray-500 whitespace-nowrap min-w-max">状态</span>
          <div class="flex flex-wrap gap-2">
            <Button v-for="item in STATUS_OPTIONS" :key="item.label" variant="outline" size="sm" :class="{
              'bg-primary text-primary-foreground hover:bg-primary/90': selectedStatus === item.value,
              'hover:bg-accent': selectedStatus !== item.value
            }" class="rounded-full px-4 h-8 transition-all border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold" @click="selectedStatus = item.value">
              {{ item.label }}
            </Button>
          </div>
        </div>

        <!-- 发现新猫按钮 -->
        <Button class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 h-9 whitespace-nowrap flex-shrink-0" @click="handleAddCat">
          <Sparkles class="w-4 h-4" />
          <span class="font-bold">发现新猫</span>
        </Button>
      </div>

      <!-- 花色筛选 -->
      <div class="flex items-center gap-4">
        <span class="text-sm font-medium text-gray-500 whitespace-nowrap min-w-max">花色</span>
        <div class="flex flex-wrap gap-2">
          <Button v-for="item in COLOR_OPTIONS" :key="item.label" variant="outline" size="sm" :class="{
            'bg-primary text-primary-foreground hover:bg-primary/90': selectedColor === item.value,
            'hover:bg-accent': selectedColor !== item.value
          }" class="rounded-full px-4 h-8 transition-all border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold" @click="selectedColor = item.value">
            {{ item.label }}
          </Button>
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="border-2 border-black rounded-xl bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden">
      <Table>
        <TableHeader class="bg-gray-50/50">
          <TableRow>
            <TableHead class="w-[80px] font-bold">头像</TableHead>
            <TableHead class="font-bold">姓名</TableHead>
            <TableHead class="font-bold">花色</TableHead>
            <TableHead class="font-bold">状态</TableHead>
            <TableHead class="font-bold">常驻地</TableHead>
            <TableHead class="font-bold">绝育</TableHead>
            <TableHead class="text-right font-bold">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow>
              <TableCell colspan="8" class="h-24 text-center">
                加载中...
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="paginatedCats.length === 0">
            <TableRow>
              <TableCell colspan="8" class="h-24 text-center text-muted-foreground">
                暂无数据
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-for="cat in paginatedCats" :key="cat.id" class="hover:bg-gray-50/50">
            <TableCell>
              <Avatar class="h-10 w-10 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <AvatarImage :src="cat.avatar" :alt="cat.name" class="object-cover" />
                <AvatarFallback class="font-bold">{{ cat.name.charAt(0) }}</AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell class="font-bold">{{ cat.name }}</TableCell>
            <TableCell class="font-bold">{{ cat.color || '-' }}</TableCell>
            <TableCell>
              <Badge variant="outline" class="border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] px-2 py-0.5 font-bold"
                :class="getStatusColorClass(cat.status)">
                <span class="mr-1" v-if="cat.status.includes('在校')"></span>
                <span class="mr-1" v-else-if="cat.status.includes('毕业')"></span>
                <span class="mr-1" v-else-if="cat.status.includes('生病')"></span>
                {{ cat.status }}
              </Badge>
            </TableCell>
            <TableCell class="font-bold">{{ cat.locationName || '-' }}</TableCell>
            <TableCell>
              <Badge variant="outline" class="border-2 border-black rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] px-2 py-0.5 font-bold"
                :class="getNeuteredColorClass(cat.isNeutered)">
                {{ cat.isNeutered ? '已绝育' : '未绝育' }}
              </Badge>
            </TableCell>

            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <Button variant="outline" size="icon" class="h-8 w-8 border-2 border-black rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold" @click="handleEdit(cat)" title="编辑">
                  <PenSquare class="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" class="h-8 w-8 border-2 border-black rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold" @click="router.push(`/cat/${cat.id}`)"
                  title="查看详情">
                  <FileText class="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon"
                  class="h-8 w-8 border-2 border-black rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200" @click="handleDelete(cat.id, cat.name)"
                  title="删除">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- 分页 -->
    <div class="flex justify-end py-4">
      <div v-if="filteredCats.length > 0" class="flex items-center gap-4">
        <Button variant="outline" size="sm" :disabled="currentPageNum <= 1"
          @click="handlePageChange(currentPageNum - 1)"
          class="border-2 border-black rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold">
            上一页
          </Button>

        <div class="text-sm text-gray-600">
          第 {{ currentPageNum }} 页 / 共 {{ totalPages }} 页 (共 {{ filteredCats.length }} 条)
        </div>

        <Button variant="outline" size="sm" :disabled="currentPageNum >= totalPages"
          @click="handlePageChange(currentPageNum + 1)"
          class="border-2 border-black rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold">
            下一页
          </Button>
      </div>

      <div v-else class="text-xs text-gray-400">
        暂无数据
      </div>
    </div>
  </div>

  <!-- 编辑猫咪对话框 -->
  <EditCatDialog
    :open="editDialogOpen"
    :cat-data="selectedCatForEdit"
    @update:open="editDialogOpen = $event"
    @success="handleEditSuccess"
  />

  <!-- 删除确认弹窗 -->
  <ConfirmDialog
    v-model:open="deleteDialogOpen"
    title="删除猫咪"
    :description="`确定要删除猫咪「${deleteCatName}」吗？此操作不可恢复。`"
    confirm-text="删除"
    variant="danger"
    @confirm="confirmDelete"
  />
</template>