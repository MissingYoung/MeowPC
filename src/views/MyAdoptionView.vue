<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { adoptionApi } from '@/lib/api'
import type { MyAdoptionItem } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { ArrowLeft, Clock, CheckCircle2, XCircle, MessageCircle, FileCheck } from 'lucide-vue-next'

const router = useRouter()

// 状态定义
const loading = ref(false)
const adoptionList = ref<MyAdoptionItem[]>([])
const pageSize = 10
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const selectedStatus = ref('')

// 状态选项卡
const statusTabs = [
  { label: '全部', value: '' },
  { label: '待审核', value: 'PENDING' },
  { label: '面试中', value: 'INTERVIEW' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已拒绝', value: 'REJECTED' },
  { label: '已完成', value: 'COMPLETED' }
]

// 状态配置
const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  PENDING: { label: '待审核', class: 'bg-yellow-100 text-yellow-700', icon: Clock },
  INTERVIEW: { label: '面试中', class: 'bg-blue-100 text-blue-700', icon: MessageCircle },
  APPROVED: { label: '已通过', class: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  REJECTED: { label: '已拒绝', class: 'bg-red-100 text-red-700', icon: XCircle },
  COMPLETED: { label: '已完成', class: 'bg-gray-100 text-gray-700', icon: FileCheck }
}

// 获取列表
const fetchAdoptions = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: currentPage.value,
      size: pageSize
    }
    if (selectedStatus.value) {
      params.status = selectedStatus.value
    }
    const res = await adoptionApi.getMyAdoptions(params)
    adoptionList.value = res?.items || []
    totalPages.value = res?.pages || 1
    total.value = res?.total || 0
  } catch (error) {
    console.error('获取领养申请失败:', error)
  } finally {
    loading.value = false
  }
}

// 切换状态筛选
const handleStatusChange = (status: string) => {
  selectedStatus.value = status
  currentPage.value = 1
  fetchAdoptions()
}

// 分页
const handlePrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchAdoptions()
  }
}

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchAdoptions()
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchAdoptions()
}

// 计算可见页码
const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 返回上一页
const goBack = () => {
  router.push('/userCenter')
}

// 跳转猫咪详情
const goToCatDetail = (catId: string) => {
  router.push(`/cat/${catId}`)
}

onMounted(() => {
  fetchAdoptions()
})
</script>

<template>
  <div class="main-h-full bg-gray-50 rounded-xl shadow-sm p-6">
    <div class="max-w-4xl mx-auto p-6">
      <!-- 顶部返回 -->
      <div class="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" @click="goBack" class="flex items-center gap-2">
          <ArrowLeft class="w-4 h-4" />
          返回个人中心
        </Button>
        <h1 class="text-2xl font-bold text-gray-800">我的领养申请</h1>
      </div>

      <!-- 状态筛选 -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            @click="handleStatusChange(tab.value)"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedStatus === tab.value
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- 列表内容 -->
      <div class="bg-white rounded-xl shadow-sm">
        <!-- 加载中 -->
        <div v-if="loading" class="p-12 text-center text-gray-400">
          加载中...
        </div>

        <!-- 空状态 -->
        <div v-else-if="adoptionList.length === 0" class="p-12 text-center">
          <div class="text-gray-400 text-6xl mb-4">📋</div>
          <p class="text-gray-500">暂无领养申请记录</p>
        </div>

        <!-- 列表 -->
        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="item in adoptionList"
            :key="item.id"
            class="p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-4">
              <!-- 猫咪头像 -->
              <img
                :src="item.catAvatar"
                :alt="item.catName"
                class="w-16 h-16 rounded-xl object-cover cursor-pointer hover:ring-2 hover:ring-orange-300 transition-all"
                @click="goToCatDetail(item.catId)"
              />

              <!-- 信息区 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span
                    class="font-bold text-gray-800 cursor-pointer hover:text-orange-500"
                    @click="goToCatDetail(item.catId)"
                  >
                    {{ item.catName }}
                  </span>
                  <!-- 状态标签 -->
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                      statusConfig[item.status]?.class || 'bg-gray-100 text-gray-600'
                    ]"
                  >
                    <component
                      :is="statusConfig[item.status]?.icon"
                      class="w-3 h-3"
                    />
                    {{ statusConfig[item.status]?.label || item.status }}
                  </span>
                </div>
                <div class="text-sm text-gray-400">
                  申请时间：{{ item.createTime?.slice(0, 10) }}
                </div>
                <!-- 拒绝原因 -->
                <div
                  v-if="item.status === 'REJECTED' && item.reason"
                  class="mt-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg"
                >
                  拒绝原因：{{ item.reason }}
                </div>
              </div>

              <!-- 操作区 -->
              <Button
                variant="outline"
                size="sm"
                @click="goToCatDetail(item.catId)"
              >
                查看猫咪
              </Button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div
          v-if="totalPages > 1"
          class="p-4 border-t border-gray-100 flex items-center justify-between"
        >
          <div class="text-sm text-gray-500">
            共 {{ total }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
          </div>
          <Pagination :items-per-page="pageSize" :total="total">
            <PaginationContent class="flex items-center gap-1">
              <PaginationPrevious
                :disabled="currentPage === 1"
                @click="handlePrevPage"
                class="cursor-pointer"
              />
              <PaginationItem
                v-for="page in visiblePages"
                :key="page"
                :value="page"
                @click="goToPage(page)"
                :class="[
                  'px-3 py-1 rounded cursor-pointer text-sm',
                  currentPage === page
                    ? 'bg-orange-500 text-white'
                    : 'hover:bg-gray-100'
                ]"
              >
                {{ page }}
              </PaginationItem>
              <PaginationNext
                :disabled="currentPage === totalPages"
                @click="handleNextPage"
                class="cursor-pointer"
              />
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  </div>
</template>
