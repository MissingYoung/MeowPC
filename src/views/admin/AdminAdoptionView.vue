<script setup lang="ts">
import { ref, onMounted, reactive, watch, computed } from 'vue'
import { adoptionApi } from '@/lib/api'
import { type AdoptionItem, type AdoptionQueryParams } from '@/types'
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
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import {
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  X
} from 'lucide-vue-next'

// 状态定义
const loading = ref(false)
const allAdoptionList = ref<AdoptionItem[]>([]) // 所有数据
const pageSize = 10 // 每页显示数量
const currentPage = ref(1)
const selectedStatus = ref('') // 状态筛选

// 详情弹窗状态
const detailDialogOpen = ref(false)
const selectedDetail = ref<AdoptionItem | null>(null)

// 审核对话框状态
const auditDialogOpen = ref(false)
const auditing = ref(false)
const selectedAdoption = ref<AdoptionItem | null>(null)
const auditForm = reactive({
  status: 'INTERVIEW',
  reason: ''
})

// 住房情况字典
const housingMap: Record<string, string> = {
  OWN_HOUSE: '自有住房',
  RENT_WHOLE: '整租',
  RENT_SHARE: '合租',
  DORM: '宿舍',
  WITH_PARENT: '和父母同住'
}

// 养猫经验字典
const experienceMap: Record<string, string> = {
  NEWBIE: '新手',
  EXPERIENCED: '有经验',
  MULTI_CAT: '多猫家庭'
}

// 审核状态选项
const auditStatusOptions = [
  { label: '面试中', value: 'INTERVIEW' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已完成', value: 'COMPLETED' }
]

// 状态选项卡
const statusTabs = [
  { label: '全部申请', value: '' },
  { label: '未审核', value: 'PENDING' },
  { label: '面试中', value: 'INTERVIEW' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已完成', value: 'COMPLETED' }
]

// 状态字典
const statusMap: Record<string, { label: string; class: string; icon: any }> = {
  PENDING: { label: '未审核', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
  APPROVED: { label: '已通过', class: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  REJECTED: { label: '已驳回', class: 'bg-red-100 text-red-800', icon: XCircle },
  INTERVIEW: { label: '面试中', class: 'bg-blue-100 text-blue-800', icon: Clock },
  COMPLETED: { label: '已完成', class: 'bg-gray-100 text-gray-800', icon: CheckCircle2 }
}

// 过滤后的列表
const filteredList = computed(() => {
  if (!selectedStatus.value) return allAdoptionList.value
  return allAdoptionList.value.filter(item => item.status === selectedStatus.value)
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize) || 1)

// 分页后的列表
const adoptionList = computed(() => {
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
    const res = await adoptionApi.getAdoptionList({ page: 1, size: 1000 } as AdoptionQueryParams)
    allAdoptionList.value = res.items || []
  } catch (error) {
    console.error('Failed to fetch adoption list:', error)
    toast.error('获取领养申请列表失败，请重试')
  } finally {
    loading.value = false
  }
}

// 切换状态时重置页码
watch(selectedStatus, () => {
  currentPage.value = 1
})

// 打开审核对话框
const handleOpenAuditDialog = (item: AdoptionItem) => {
  selectedAdoption.value = item
  auditForm.status = 'INTERVIEW'
  auditForm.reason = ''
  auditDialogOpen.value = true
}

// 关闭审核对话框
const handleCloseAuditDialog = () => {
  auditDialogOpen.value = false
  selectedAdoption.value = null
  auditForm.status = 'INTERVIEW'
  auditForm.reason = ''
}

// 提交审核
const handleSubmitAudit = async () => {
  if (!selectedAdoption.value) return
  if (!auditForm.reason.trim()) {
    toast.error('请输入审核理由')
    return
  }

  auditing.value = true
  try {
    await adoptionApi.auditAdoption(selectedAdoption.value.id, {
      status: auditForm.status,
      reason: auditForm.reason
    })
    toast.success('领养申请已处理')
    handleCloseAuditDialog()
    fetchList()
  } catch (error) {
    console.error('Failed to audit adoption:', error)
    toast.error('审核失败，请重试')
  } finally {
    auditing.value = false
  }
}

onMounted(() => {
  fetchList()
})

// 查看详情
const handleViewDetails = (item: AdoptionItem) => {
  selectedDetail.value = item
  detailDialogOpen.value = true
}

// 关闭详情弹窗
const handleCloseDetail = () => {
  detailDialogOpen.value = false
  selectedDetail.value = null
}

// 从详情弹窗打开审核
const handleAuditFromDetail = () => {
  if (selectedDetail.value) {
    const item = selectedDetail.value
    handleCloseDetail()
    handleOpenAuditDialog(item)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 顶部标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">领养申请审核</h1>
        <p class="text-muted-foreground mt-2">
          查看和处理用户的猫咪领养申请。
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
            ? 'bg-teal-500 text-white'
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
      <div v-else-if="adoptionList.length === 0" class="p-8 text-center text-gray-500">
        暂无领养申请
      </div>

      <!-- Data Table -->
      <table v-else class="w-full text-sm text-left">
        <thead class="bg-green-100 border-b">
          <tr>
            <th class="px-6 py-3 font-bold text-gray-700">申请 ID</th>
            <th class="px-6 py-3 font-bold text-gray-700">申请人</th>
            <th class="px-6 py-3 font-bold text-gray-700">目标猫咪</th>
            <th class="px-6 py-3 font-bold text-gray-700">联系方式</th>
            <th class="px-6 py-3 font-bold text-gray-700">申请时间</th>
            <th class="px-6 py-3 font-bold text-gray-700">当前状态</th>
            <th class="px-6 py-3 font-bold text-gray-700 text-right">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="item in adoptionList" :key="item.id" class="hover:bg-gray-50 transition-colors">
            <!-- 申请 ID -->
            <td class="px-6 py-4">
              <span class="font-bold text-gray-900">#{{ item.id.substring(0, 8).toUpperCase() }}</span>
            </td>

            <!-- 申请人 -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img
                  v-if="item.userAvatar"
                  :src="item.userAvatar"
                  :alt="item.userName"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <div v-else class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                  {{ item.userName?.charAt(0) || 'U' }}
                </div>
                <div>
                  <div class="font-bold text-gray-900">{{ item.userName }}</div>
                  <div class="text-xs text-gray-500">ID: {{ item.userId }}</div>
                </div>
              </div>
            </td>

            <!-- 目标猫咪 -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <img
                  v-if="item.catAvatar"
                  :src="item.catAvatar"
                  :alt="item.catName"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <div v-else class="w-8 h-8 rounded-full bg-gray-200"></div>
                <span class="font-bold text-gray-900">{{ item.catName }}</span>
              </div>
            </td>

            <!-- 联系方式 -->
            <td class="px-6 py-4">
              <div class="text-sm text-gray-600">
                <div class="font-bold">{{ item.contact.phone }}</div>
                <div class="text-xs text-gray-500">{{ item.contact.wechat }}</div>
              </div>
            </td>

            <!-- 申请时间 -->
            <td class="px-6 py-4 text-gray-600">
              <span class="font-bold">{{ new Date(item.createTime).toLocaleDateString() }}</span>
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
                  v-if="item.status !== 'REJECTED' && item.status !== 'COMPLETED'"
                  @click="handleOpenAuditDialog(item)"
                  class="px-3 py-1 bg-teal-500 text-white rounded-md text-xs font-medium hover:bg-teal-600"
                >
                  审核
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
                    currentPage === page ? 'bg-teal-500 text-white border-teal-500 hover:bg-teal-600' : 'hover:bg-gray-50'
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

    <!-- 审核领养申请对话框 -->
    <div v-if="auditDialogOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <!-- 对话框头部 -->
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-lg font-semibold">审核领养申请</h2>
          <button
            @click="handleCloseAuditDialog"
            class="text-gray-400 hover:text-gray-600"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 对话框内容 -->
        <div class="p-6 space-y-4">
          <!-- 申请信息 -->
          <div v-if="selectedAdoption" class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">
              <span class="font-medium">申请人：</span>{{ selectedAdoption.userName }}
            </p>
            <p class="text-sm text-gray-600 mt-1">
              <span class="font-medium">目标猫咪：</span>{{ selectedAdoption.catName }}
            </p>
            <p class="text-sm text-gray-600 mt-1">
              <span class="font-medium">申请时间：</span>{{ new Date(selectedAdoption.createTime).toLocaleDateString() }}
            </p>
          </div>

          <!-- 审核状态 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-2">审核状态</label>
            <select
              v-model="auditForm.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option v-for="option in auditStatusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- 审核理由 -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-2">审核理由</label>
            <textarea
              v-model="auditForm.reason"
              placeholder="请输入审核理由..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows="4"
            />
          </div>
        </div>

        <!-- 对话框底部 -->
        <div class="flex gap-2 p-6 border-t bg-gray-50 rounded-b-lg">
          <button
            @click="handleCloseAuditDialog"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="handleSubmitAudit"
            :disabled="auditing"
            class="flex-1 px-4 py-2 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ auditing ? '处理中...' : '提交审核' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 查看详情弹窗 -->
    <div v-if="detailDialogOpen && selectedDetail" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <!-- 弹窗头部 -->
        <div class="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 class="text-lg font-semibold">领养申请详情</h2>
          <button @click="handleCloseDetail" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="p-6 space-y-6">
          <!-- 申请信息 -->
          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <span
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border"
              :class="statusMap[selectedDetail.status]?.class || 'bg-gray-100 text-gray-800'"
            >
              <component :is="statusMap[selectedDetail.status]?.icon || Clock" class="w-3.5 h-3.5" />
              {{ statusMap[selectedDetail.status]?.label || selectedDetail.status }}
            </span>
            <span class="text-sm text-gray-500">
              申请编号：#{{ selectedDetail.id.substring(0, 8).toUpperCase() }}
            </span>
            <span class="text-sm text-gray-500">
              申请时间：{{ new Date(selectedDetail.createTime).toLocaleString() }}
            </span>
          </div>

          <!-- 申请人信息 -->
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <div class="w-1 h-4 bg-teal-500 rounded"></div>
              申请人信息
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-xs text-gray-500 mb-1">用户名</p>
                <p class="font-medium text-gray-900">{{ selectedDetail.userName }}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-xs text-gray-500 mb-1">用户 ID</p>
                <p class="font-medium text-gray-900">{{ selectedDetail.userId }}</p>
              </div>
            </div>
          </div>

          <!-- 目标猫咪 -->
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <div class="w-1 h-4 bg-teal-500 rounded"></div>
              目标猫咪
            </h3>
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <img
                v-if="selectedDetail.catAvatar"
                :src="selectedDetail.catAvatar"
                :alt="selectedDetail.catName"
                class="w-16 h-16 rounded-lg object-cover"
              />
              <div v-else class="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                <span class="text-gray-400 text-2xl">🐱</span>
              </div>
              <div>
                <p class="font-medium text-gray-900 text-lg">{{ selectedDetail.catName }}</p>
                <p class="text-sm text-gray-500">ID: {{ selectedDetail.catId.substring(0, 8) }}</p>
              </div>
            </div>
          </div>

          <!-- 领养条件 -->
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <div class="w-1 h-4 bg-teal-500 rounded"></div>
              领养条件
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-xs text-gray-500 mb-1">住房情况</p>
                <p class="font-medium text-gray-900">{{ housingMap[selectedDetail.info?.housing] || selectedDetail.info?.housing || '-' }}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-xs text-gray-500 mb-1">养猫经验</p>
                <p class="font-medium text-gray-900">{{ experienceMap[selectedDetail.info?.experience] || selectedDetail.info?.experience || '-' }}</p>
              </div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg mt-4">
              <p class="text-xs text-gray-500 mb-2">喂养计划</p>
              <p class="text-gray-900 whitespace-pre-wrap">{{ selectedDetail.info?.plan || '未填写' }}</p>
            </div>
          </div>

          <!-- 联系方式 -->
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <div class="w-1 h-4 bg-teal-500 rounded"></div>
              联系方式
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-xs text-gray-500 mb-1">手机号</p>
                <p class="font-medium text-gray-900">{{ selectedDetail.contact?.phone || '-' }}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-xs text-gray-500 mb-1">微信</p>
                <p class="font-medium text-gray-900">{{ selectedDetail.contact?.wechat || '-' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 弹窗底部 -->
        <div class="flex gap-2 p-6 border-t bg-gray-50 sticky bottom-0">
          <button
            @click="handleCloseDetail"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            关闭
          </button>
          <button
            v-if="selectedDetail.status === 'PENDING' || selectedDetail.status === 'INTERVIEW'|| selectedDetail.status === 'APPROVED'"
            @click="handleAuditFromDetail"
            class="flex-1 px-4 py-2 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600"
          >
            审核此申请
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
