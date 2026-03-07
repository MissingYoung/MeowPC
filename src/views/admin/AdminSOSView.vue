<script setup lang="ts">
import { ref, onMounted, reactive, watch, computed } from 'vue'
import { sosApi } from '@/lib/api'
import { type SOSItem, type SOSQueryParams, CampusMap } from '@/types'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { 
  MapPin, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Cat,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

// 状态定义
const loading = ref(false)
const allSOSList = ref<SOSItem[]>([]) // 所有数据
const pageSize = 10 // 每页显示数量
const currentPage = ref(1)
const selectedStatus = ref('') // 状态筛选

// 处理对话框状态
const resolveDialogOpen = ref(false)
const resolving = ref(false)
const selectedSOS = ref<SOSItem | null>(null)
const replyForm = reactive({
  status: 'RESOLVED',
  reply: ''
})

// 状态字典
const statusMap: Record<string, { label: string; class: string; icon: any }> = {
  PENDING: { label: '待处理', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESSED: { label: '已处理', class: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  REJECTED: { label: '已驳回', class: 'bg-red-100 text-red-800', icon: AlertCircle }
}

// 状态选项卡
const statusTabs = [
  { label: '全部请求', value: '' },
  { label: '待处理', value: 'PENDING' },
  { label: '已处理', value: 'PROCESSED' }
]

const campusMap = CampusMap

// 过滤后的列表
const filteredList = computed(() => {
  let list = allSOSList.value
  if (selectedStatus.value) {
    list = list.filter(item => item.status === selectedStatus.value)
  }
  // 按状态排序：未处理(PENDING)优先显示
  return list.sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1
    return 0
  })
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize) || 1)

// 分页后的列表
const sosList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredList.value.slice(start, end)
})

// 分页页码列表
const paginationPages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i)
      pages.push('...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...')
      for (let i = total - 3; i <= total; i++) pages.push(i)
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...', total)
    }
  }
  return pages
})

// 获取所有数据（一次性加载）
const fetchList = async () => {
  loading.value = true
  try {
    const res = await sosApi.getSOSList({ page: 1, size: 1000 } as SOSQueryParams)
    allSOSList.value = res.items || []
  } catch (error) {
    console.error('Failed to fetch SOS list:', error)
    toast.error('获取SOS列表失败，请重试')
  } finally {
    loading.value = false
  }
}

// 切换状态时重置页码
watch(selectedStatus, () => {
  currentPage.value = 1
})

// 打开处理对话框
const handleOpenResolveDialog = (item: SOSItem) => {
  selectedSOS.value = item
  replyForm.status = 'RESOLVED'
  replyForm.reply = ''
  resolveDialogOpen.value = true
}

// 关闭处理对话框
const handleCloseResolveDialog = () => {
  resolveDialogOpen.value = false
  selectedSOS.value = null
  replyForm.status = 'RESOLVED'
  replyForm.reply = ''
}

// 提交处理
const handleSubmitResolve = async () => {
  if (!selectedSOS.value) return
  if (!replyForm.reply.trim()) {
    toast.error('请输入回复信息')
    return
  }

  resolving.value = true
  try {
    await sosApi.resolveSOS(selectedSOS.value.id, {
      status: replyForm.status,
      reply: replyForm.reply
    })
    toast.success('SOS 请求已处理')
    handleCloseResolveDialog()
    fetchList()
  } catch (error) {
    console.error('Failed to resolve SOS:', error)
    toast.error('处理失败，请重试')
  } finally {
    resolving.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 顶部标题与操作栏 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">SOS 救援管理</h1>
        <p class="text-muted-foreground mt-2">
          查看并处理来自用户的猫咪求助信息。
        </p>
      </div>
    </div>

    <!-- 状态选项卡 -->
    <div class="flex gap-2 bg-white p-4 rounded-lg border shadow-sm">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        @click="selectedStatus = tab.value"
        :class="[
          'px-4 py-2 rounded-full text-sm font-bold transition-colors border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]',
          selectedStatus === tab.value
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 数据列表 -->
    <div class="bg-white border-2 border-black rounded-xl shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center text-gray-500">
        加载中...
      </div>

      <!-- Empty State -->
      <div v-else-if="sosList.length === 0" class="p-8 text-center text-gray-500">
        暂无求助信息
      </div>

      <!-- Data Table -->
      <table v-else class="w-full text-sm text-left">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-6 py-3 font-bold text-gray-500">相关猫咪</th>
            <th class="px-6 py-3 font-bold text-gray-500">位置/校区</th>
            <th class="px-6 py-3 font-bold text-gray-500">症状描述</th>
            <th class="px-6 py-3 font-bold text-gray-500">上报人</th>
            <th class="px-6 py-3 font-bold text-gray-500">状态</th>
            <th class="px-6 py-3 font-bold text-gray-500">时间</th>
            <th class="px-6 py-3 font-bold text-gray-500 text-right">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="item in sosList" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img v-if="item.imageURLs && item.imageURLs.length > 0" :src="item.imageURLs[0]" class="w-full h-full object-cover" />
                  <Cat v-else class="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <div class="font-bold text-gray-900">{{ item.catName || '未知猫咪' }}</div>
                  <div class="text-xs text-gray-500 truncate max-w-[120px]">ID: {{ item.catId || '-' }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-1.5 text-gray-900">
                  <MapPin class="w-3.5 h-3.5 text-gray-400" />
                  <span class="font-bold">{{ item.location }}</span>
                </div>
                <span class="text-xs text-gray-500 px-5">{{ campusMap[item.campus] ?? '未知校区' }}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="max-w-[200px]">
                <div class="flex flex-wrap gap-1 mb-1">
                  <span v-for="tag in item.symptoms" :key="tag" class="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px] border border-red-100">
                    {{ tag }}
                  </span>
                </div>
                <p class="text-gray-500 truncate" :title="item.description">{{ item.description }}</p>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="font-bold text-gray-900">{{ item.reporterName }}</div>
              <div class="text-xs text-gray-500">ID: {{ item.reporterId }}</div>
            </td>
            <td class="px-6 py-4">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                :class="statusMap[item.status]?.class || 'bg-gray-100 text-gray-800'"
              >
                {{ statusMap[item.status]?.label || item.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-500">
              {{ item.create_time ? new Date(item.create_time).toLocaleDateString() : '-' }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-end">
                <button 
                  @click="handleOpenResolveDialog(item)"
                  class="inline-flex items-center px-2.5 py-0.5 bg-blue-500 text-white font-bold text-xs rounded-full border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-blue-600 transition-all duration-150 min-w-[48px] min-h-[24px]"
                  style="height: 24px; min-height: 24px;"
                >
                  处理
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页组件 -->
      <div v-if="filteredList.length > pageSize" class="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
        <span class="text-sm text-gray-500">
          共 {{ filteredList.length }} 条记录，第 {{ currentPage }}/{{ totalPages }} 页
        </span>
        <Pagination :total="filteredList.length" :items-per-page="pageSize" :sibling-count="1" show-edges :default-page="currentPage">
          <PaginationContent class="flex items-center gap-1">
            <PaginationPrevious 
              :disabled="currentPage <= 1"
              @click="currentPage > 1 && (currentPage = currentPage - 1)"
              class="h-8 px-3 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
            >
              <ChevronLeft class="h-4 w-4" />
              上一页
            </PaginationPrevious>

            <template v-for="(page, index) in paginationPages" :key="index">
              <PaginationEllipsis v-if="page === '...'" class="px-2 text-gray-400" />
              <PaginationItem v-else :value="page as number">
                <Button
                  variant="outline"
                  size="sm"
                  :class="[
                    'h-8 w-8 rounded-md',
                    currentPage === page ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' : 'hover:bg-gray-50'
                  ]"
                  @click="currentPage = page as number"
                >
                  {{ page }}
                </Button>
              </PaginationItem>
            </template>

            <PaginationNext 
              :disabled="currentPage >= totalPages"
              @click="currentPage < totalPages && (currentPage = currentPage + 1)"
              class="h-8 px-3 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
            >
              下一页
              <ChevronRight class="h-4 w-4" />
            </PaginationNext>
          </PaginationContent>
        </Pagination>
      </div>
    </div>

    <!-- 处理 SOS 对话框 -->
    <div v-if="resolveDialogOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <!-- 对话框头部 -->
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-lg font-semibold">处理 SOS 请求</h2>
          <button 
            @click="handleCloseResolveDialog"
            class="text-gray-400 hover:text-gray-600"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 对话框内容 -->
        <div class="p-6 space-y-4">
          <!-- 相关信息 -->
          <div v-if="selectedSOS" class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">
              <span class="font-medium">猫咪：</span>{{ selectedSOS.catName || '未知猫咪' }}
            </p>
            <p class="text-sm text-gray-600 mt-1">
              <span class="font-medium">位置：</span>{{ selectedSOS.location }}
            </p>
            <p class="text-sm text-gray-600 mt-1">
              <span class="font-medium">校区：</span>{{ campusMap[selectedSOS.campus] ?? '未知' }}
            </p>
          </div>

          <!-- 处理状态 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-2">处理状态</label>
            <select 
              v-model="replyForm.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="RESOLVED">已解决</option>
              <option value="PROCESSING">处理中</option>
            </select>
          </div>

          <!-- 回复信息 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-2">管理员回复</label>
            <textarea 
              v-model="replyForm.reply"
              placeholder="请输入回复信息..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="4"
            />
          </div>
        </div>

        <!-- 对话框底部 -->
        <div class="flex gap-2 p-6 border-t bg-gray-50 rounded-b-lg">
          <button 
            @click="handleCloseResolveDialog"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button 
            @click="handleSubmitResolve"
            :disabled="resolving"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ resolving ? '处理中...' : '提交处理' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
