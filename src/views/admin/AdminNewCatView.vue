<script setup lang="ts">
import { ref, onMounted, reactive, watch, computed } from 'vue'
import { adminNewCatApi } from '@/lib/api'
import { CampusMap, type NewCatItem, type NewCatQueryParams } from '@/types'
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
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  MapPin,
  User,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

// 状态定义
const loading = ref(false)
const allNewCatList = ref<NewCatItem[]>([]) // 所有数据
const pageSize = 10 // 每页显示数量
const currentPage = ref(1)
const selectedStatus = ref('') // 状态筛选

// 详情弹窗状态
const detailDialogOpen = ref(false)
const selectedItem = ref<NewCatItem | null>(null)

// 审核弹窗状态
const approveDialogOpen = ref(false)
const approving = ref(false)
const approveItem = ref<NewCatItem | null>(null)
const approveForm = reactive({
  officialName: ''
})

// 状态选项卡
const statusTabs = [
  { label: '全部线索', value: '' },
  { label: '待审核', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' }
]

// 状态字典
const statusMap: Record<string, { label: string; class: string; icon: any }> = {
  PENDING: { label: '待审核', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
  APPROVED: { label: '已通过', class: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  REJECTED: { label: '已驳回', class: 'bg-red-100 text-red-800', icon: XCircle }
}

// 过滤后的列表
const filteredList = computed(() => {
  if (!selectedStatus.value) return allNewCatList.value
  return allNewCatList.value.filter(item => item.status === selectedStatus.value)
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize) || 1)

// 分页后的列表
const newCatList = computed(() => {
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
    const res = await adminNewCatApi.getNewCatList({ page: 1, pageSize: 1000 })
    allNewCatList.value = res.items || []
  } catch (error) {
    console.error('Failed to fetch new cat list:', error)
    toast.error('获取新喵线索列表失败，请重试')
  } finally {
    loading.value = false
  }
}

// 切换状态时重置页码
watch(selectedStatus, () => {
  currentPage.value = 1
})

// 查看详情
const handleViewDetails = (item: NewCatItem) => {
  selectedItem.value = item
  detailDialogOpen.value = true
}

// 关闭详情弹窗
const handleCloseDetail = () => {
  detailDialogOpen.value = false
  selectedItem.value = null
}

// 打开审核弹窗
const handleProcess = (item: NewCatItem) => {
  // 关闭详情弹窗（如果打开的话）
  detailDialogOpen.value = false
  selectedItem.value = null
  
  approveItem.value = item
  // 预填入临时名称作为正式名称
  approveForm.officialName = item.tempName || ''
  approveDialogOpen.value = true
}

// 关闭审核弹窗
const handleCloseApprove = () => {
  approveDialogOpen.value = false
  approveItem.value = null
  approveForm.officialName = ''
}

// 提交审核
const handleSubmitApprove = async () => {
  if (!approveItem.value) return
  if (!approveForm.officialName.trim()) {
    toast.error('请输入猫咪正式名称')
    return
  }

  approving.value = true
  try {
    const submittedName = approveForm.officialName.trim()
    const itemId = approveItem.value.id
    
    await adminNewCatApi.approveNewCat(itemId, {
      officialName: submittedName
    })
    
    // 本地更新列表中对应项的状态
    const itemIndex = allNewCatList.value.findIndex(item => item.id === itemId)
    if (itemIndex !== -1) {
      const targetItem = allNewCatList.value[itemIndex]
      if (targetItem) {
        targetItem.status = 'APPROVED'
      }
    }
    
    toast.success('审核通过，猫咪已正式入库！')
    handleCloseApprove()
  } catch (error) {
    console.error('Failed to approve new cat:', error)
    toast.error('审核失败，请重试')
  } finally {
    approving.value = false
  }
}

onMounted(() => {
  fetchList()
})

// 格式化校区名称
const formatCampus = (campus: string | number): string => {
  if (typeof campus === 'number') {
    return CampusMap[campus] || String(campus)
  }
  // 如果已经是中文名称，直接返回
  if (campus && !(/^\d+$/.test(campus))) {
    return campus
  }
  // 如果是数字字符串，转为数字后查找
  const num = parseInt(campus, 10)
  return CampusMap[num] || campus
}

// 格式化时间
const formatTime = (timeStr: string): string => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div class="space-y-6">
    <!-- 顶部标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">新喵线索审核</h1>
        <p class="text-muted-foreground mt-2">
          查看和审核用户提交的发现新猫线索。
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
          'px-4 py-2 rounded-full text-sm font-medium transition-colors',
          selectedStatus === tab.value
            ? 'bg-amber-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 数据列表 -->
    <div class="bg-white rounded-lg border shadow-sm overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center text-gray-500">
        加载中...
      </div>

      <!-- Empty State -->
      <div v-else-if="newCatList.length === 0" class="p-8 text-center text-gray-500">
        暂无新喵线索
      </div>

      <!-- Data Table -->
      <table v-else class="w-full text-sm text-left">
        <thead class="bg-amber-50 border-b">
          <tr>
            <th class="px-6 py-3 font-medium text-gray-700">线索 ID</th>
            <th class="px-6 py-3 font-medium text-gray-700">猫咪信息</th>
            <th class="px-6 py-3 font-medium text-gray-700">发现位置</th>
            <th class="px-6 py-3 font-medium text-gray-700">提交人</th>
            <th class="px-6 py-3 font-medium text-gray-700">提交时间</th>
            <th class="px-6 py-3 font-medium text-gray-700">当前状态</th>
            <th class="px-6 py-3 font-medium text-gray-700 text-right">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="item in newCatList" :key="item.id" class="hover:bg-gray-50 transition-colors">
            <!-- 线索 ID -->
            <td class="px-6 py-4">
              <span class="font-medium text-gray-900">#{{ item.id.substring(0, 8).toUpperCase() }}</span>
            </td>

            <!-- 猫咪信息 -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    v-if="item.images && item.images.length > 0"
                    :src="item.images[0]"
                    :alt="item.tempName || '新猫'"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <ImageIcon class="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ item.tempName || '未命名' }}</div>
                  <div class="text-xs text-gray-500">毛色：{{ item.color }}</div>
                </div>
              </div>
            </td>

            <!-- 发现位置 -->
            <td class="px-6 py-4">
              <div class="flex items-start gap-1">
                <MapPin class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div class="font-medium text-gray-900">{{ formatCampus(item.campus) }}</div>
                  <div class="text-xs text-gray-500">{{ item.location }}</div>
                </div>
              </div>
            </td>

            <!-- 提交人 -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <User class="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ item.submitterName }}</div>
                  <div class="text-xs text-gray-500">ID: {{ item.submitterId }}</div>
                </div>
              </div>
            </td>

            <!-- 提交时间 -->
            <td class="px-6 py-4 text-gray-600">
              {{ formatTime(item.createTime) }}
            </td>

            <!-- 当前状态 -->
            <td class="px-6 py-4">
              <span
                class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border"
                :class="statusMap[item.status]?.class || 'bg-gray-100 text-gray-800'"
              >
                <component :is="statusMap[item.status]?.icon || Clock" class="w-3.5 h-3.5" />
                {{ statusMap[item.status]?.label || item.status }}
              </span>
            </td>

            <!-- 操作 -->
            <td class="px-6 py-4 text-right">
              <div class="flex gap-2 justify-end">
                <button
                  v-if="item.status === 'PENDING'"
                  @click="handleProcess(item)"
                  class="px-3 py-1 bg-amber-500 text-white rounded-md text-xs font-medium hover:bg-amber-600"
                >
                  处理
                </button>
                <button
                  @click="handleViewDetails(item)"
                  class="px-3 py-1 border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 flex items-center gap-1"
                >
                  <Eye class="w-3.5 h-3.5" />
                  查看详情
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
                    currentPage === page ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600' : 'hover:bg-gray-50'
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

    <!-- 详情弹窗 -->
    <div v-if="detailDialogOpen && selectedItem" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <!-- 对话框头部 -->
        <div class="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 class="text-lg font-semibold">新喵线索详情</h2>
          <button
            @click="handleCloseDetail"
            class="text-gray-400 hover:text-gray-600"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 对话框内容 -->
        <div class="p-6 space-y-6 overflow-y-auto">
          <!-- 图片展示 -->
          <div v-if="selectedItem.images && selectedItem.images.length > 0">
            <h3 class="text-sm font-medium text-gray-700 mb-3">猫咪照片</h3>
            <div class="grid grid-cols-3 gap-3">
              <div 
                v-for="(img, idx) in selectedItem.images" 
                :key="idx"
                class="aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                <img :src="img" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <!-- 基础信息 -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-xs text-gray-500 mb-1">临时名称</p>
              <p class="font-medium text-gray-900">{{ selectedItem.tempName || '未命名' }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-xs text-gray-500 mb-1">毛色特征</p>
              <p class="font-medium text-gray-900">{{ selectedItem.color }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-xs text-gray-500 mb-1">所在校区</p>
              <p class="font-medium text-gray-900">{{ formatCampus(selectedItem.campus) }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-xs text-gray-500 mb-1">详细位置</p>
              <p class="font-medium text-gray-900">{{ selectedItem.location }}</p>
            </div>
          </div>

          <!-- 提交信息 -->
          <div class="bg-amber-50 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-gray-700 mb-3">提交信息</h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-gray-500">提交人：</span>
                <span class="font-medium">{{ selectedItem.submitterName }}</span>
              </div>
              <div>
                <span class="text-gray-500">提交人ID：</span>
                <span class="font-medium">{{ selectedItem.submitterId }}</span>
              </div>
              <div>
                <span class="text-gray-500">提交时间：</span>
                <span class="font-medium">{{ formatTime(selectedItem.createTime) }}</span>
              </div>
              <div>
                <span class="text-gray-500">当前状态：</span>
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="statusMap[selectedItem.status]?.class || 'bg-gray-100 text-gray-800'"
                >
                  {{ statusMap[selectedItem.status]?.label || selectedItem.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- 标签 -->
          <div v-if="selectedItem.tags && selectedItem.tags.length > 0">
            <h3 class="text-sm font-medium text-gray-700 mb-3">特征标签</h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="tag in selectedItem.tags" 
                :key="tag"
                class="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
              >
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- 对话框底部 -->
        <div class="flex justify-end gap-3 p-6 border-t bg-gray-50 flex-shrink-0">
          <button
            @click="handleCloseDetail"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            关闭
          </button>
          <button
            v-if="selectedItem.status === 'PENDING'"
            @click="handleProcess(selectedItem)"
            class="px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600"
          >
            处理线索
          </button>
        </div>
      </div>
    </div>

    <!-- 审核弹窗 -->
    <div v-if="approveDialogOpen && approveItem" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <!-- 对话框头部 -->
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-lg font-semibold">审核新喵线索</h2>
          <button
            @click="handleCloseApprove"
            class="text-gray-400 hover:text-gray-600"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 对话框内容 -->
        <div class="p-6 space-y-4">
          <!-- 线索信息预览 -->
          <div class="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
            <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                v-if="approveItem.images && approveItem.images.length > 0"
                :src="approveItem.images[0]"
                :alt="approveItem.tempName || '新猫'"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <ImageIcon class="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ approveItem.tempName || '未命名' }}</p>
              <p class="text-sm text-gray-500">毛色：{{ approveItem.color }}</p>
              <p class="text-sm text-gray-500">{{ formatCampus(approveItem.campus) }} · {{ approveItem.location }}</p>
            </div>
          </div>

          <!-- 正式名称输入 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-2">
              猫咪正式名称 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="approveForm.officialName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="请输入猫咪的正式名称"
            />
            <p class="text-xs text-gray-400 mt-1">审核通过后，猫咪将以此名称正式入库</p>
          </div>
        </div>

        <!-- 对话框底部 -->
        <div class="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            @click="handleCloseApprove"
            :disabled="approving"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            取消
          </button>
          <button
            @click="handleSubmitApprove"
            :disabled="approving || !approveForm.officialName.trim()"
            class="px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ approving ? '提交中...' : '通过并入库' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
