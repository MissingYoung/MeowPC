
<script setup lang="ts">

import { ref, onMounted, onActivated, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { statsApi, adoptionApi, userApi } from '@/lib/api'
import type { PublicStatsData } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'vue-sonner'
import {
  ArrowRight,
  Cat,
  FileText,
  Search,
  Heart,
  TrendingUp,
  CheckCircle2,
  Syringe,
  Lock,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-vue-next'
// 用户中心相关逻辑
const router = useRouter()
const userStore = useUserStore()

// 登出确认弹窗
const isLogoutDialogOpen = ref(false)
const handleLogout = () => {
  isLogoutDialogOpen.value = true
}
const confirmLogout = () => {
  isLogoutDialogOpen.value = false
  userStore.logout()
  router.push('/login')
}

// 修改密码弹窗相关
const isPasswordDialogOpen = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordLoading = ref(false)
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const resetPasswordForm = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  showOldPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}
const handleChangePassword = async () => {
  const { oldPassword, newPassword, confirmPassword } = passwordForm.value
  if (!oldPassword) return toast.warning('请输入原密码')
  if (!newPassword) return toast.warning('请输入新密码')
  if (newPassword.length < 6) return toast.warning('新密码至少6位')
  if (newPassword !== confirmPassword) return toast.warning('两次密码输入不一致')
  if (oldPassword === newPassword) return toast.warning('新密码不能与原密码相同')
  passwordLoading.value = true
  try {
    await userApi.changePassword({
      oldPassword,
      newPassword,
      confirmPassword
    })
    isPasswordDialogOpen.value = false
    resetPasswordForm()
    userStore.logout()
    toast.success('修改密码成功，请重新登录')
    router.push('/login')
  } catch (e) {
    toast.error(e.message || '密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}

// 统计数据
const publicStats = ref<PublicStatsData | null>(null)
// 未审核领养申请数
const pendingAdoptionCount = ref(0)

// 绝育率（动态计算，保留整数）
const neuteredRate = computed(() => {
  if (!publicStats.value || publicStats.value.totalCats === 0) return '0%'
  const rate = (publicStats.value.neuteredCats / publicStats.value.totalCats) * 100
  return Math.round(rate) + '%'
})

// 统计卡片数据
const stats = computed(() => [
  { label: '在校猫咪', value: String(publicStats.value?.residentCats || 0), icon: Search },
  { label: '待领养', value: String(publicStats.value?.residentCats || 0), icon: Heart },
  { label: '已领养', value: String(publicStats.value?.adoptedCats || 0), icon: CheckCircle2 },
  { label: '绝育率', value: neuteredRate.value, icon: Syringe },
])

// 加载数据
const fetchStats = async () => {
  try {
    const [statsData, adoptionData] = await Promise.all([
      statsApi.getPublicStats(),
      adoptionApi.getAdoptionList({ status: 'PENDING', page: 1, size: 1 })
    ])
    publicStats.value = statsData
    // 获取待审核申请的总数
    pendingAdoptionCount.value = adoptionData?.total || 0
  } catch (e) {
    console.error('获取统计数据失败', e)
  }
}

// 页面挂载和激活时刷新数据
onMounted(fetchStats)
onActivated(fetchStats)

// 业务管理卡片数据
const manageCards = [
  { 
    title: '猫咪档案管理', 
    desc: '管理猫咪资料、健康状况和日志。',
    icon: Cat,
    bg: 'bg-[#F3F4F6]', // 浅灰色
    action: '管理猫咪',
    path: '/admin/cats'
  },
  { 
    title: '领养流程管理', 
    desc: '审核领养申请和面试记录。',
    icon: FileText,
    bg: 'bg-[#FEF3C7]', // 浅黄色
    action: '审核申请',
    path: '/admin/adoptions'
  },
 
]
</script>

<template>
  <div class="space-y-10">
    
    <!-- 顶部区域：欢迎语 & 核心数据 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- 欢迎横幅 -->
      <div class="lg:col-span-2 bg-[#5CD6C2] border-2 border-black rounded-xl p-10 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col justify-between relative overflow-hidden group min-h-[280px]">
        <!-- 装饰圆圈 (移除复杂动画) -->
        <div class="absolute -right-10 -top-10 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
        
        <div class="relative z-10 space-y-4">
          <h1 class="text-5xl font-black tracking-tight">欢迎回来, 管理员! 👋</h1>
          <p class="font-medium text-xl text-black/80 max-w-xl leading-relaxed">
            今天还有 <span class="font-bold underline decoration-black decoration-2">{{ pendingAdoptionCount }} 个领养申请</span> 未处理。
          </p>
        </div>
        
        <div class="flex flex-wrap items-center gap-5 mt-8 relative z-10">
          <router-link to="/admin/adoptions">
            <button class="bg-black text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center hover:bg-gray-800 transition-transform active:scale-95 border-2 border-black shadow-[4px_4px_0px_rgba(255,255,255,0.5)]">
              进入审核中心
              <ArrowRight class="w-5 h-5 ml-3" stroke-width="3" />
            </button>
          </router-link>
        </div>
      </div>

      <!-- 核心统计卡片 -->
      <div class="bg-[#FACC15] border-2 border-black rounded-xl p-8 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all min-h-[280px]">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-base font-bold uppercase tracking-wider mb-2">已登记猫咪总数</div>
            <div class="text-7xl font-black">{{ publicStats?.totalCats || 0 }}</div>
          </div>
          <div class="p-4 bg-black text-white rounded-xl">
            <TrendingUp class="w-8 h-8" />
          </div>
        </div>
        
        <div class="mt-8 space-y-3">
          <div class="flex justify-between text-sm font-bold">
            <span>绝育率</span>
            <span>{{ neuteredRate }}</span>
          </div>
          <div class="w-full bg-white border-2 border-black rounded-full h-6 overflow-hidden relative">
            <div class="bg-black h-full rounded-full absolute top-0 left-0" :style="{ width: neuteredRate }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 次要统计网格 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all duration-200"
      >
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-bold text-gray-500 uppercase tracking-wide">{{ stat.label }}</span>
          <component :is="stat.icon" class="w-6 h-6" stroke-width="2.5" />
        </div>
        <div class="text-4xl font-black">{{ stat.value }}</div>
      </div>
    </div>

    <!-- 工作台 -->
    <div class="pt-4">
      <div class="flex items-center mb-8">
        <div class="w-3 h-10 bg-black mr-4 rounded-full"></div>
        <h2 class="text-2xl font-black flex items-center">工作台</h2>
        <div class="flex gap-4 ml-6">
          <Button
            @click="isPasswordDialogOpen = true"
            class="px-6 py-2 rounded-full border-2 border-black font-bold text-base bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-colors flex items-center gap-2"
          >
            <Lock class="w-4 h-4" />
            修改密码
          </Button>
          <Button
            @click="handleLogout"
            class="px-6 py-2 rounded-full border-2 border-black font-bold text-base bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-colors flex items-center gap-2"
          >
            <LogOut class="w-4 h-4" />
            退出登录
          </Button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        <div 
          v-for="card in manageCards" 
          :key="card.title"
          class="bg-white border-2 border-black rounded-xl p-8 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all group flex flex-col h-full min-h-[240px]"
        >
          <div :class="[card.bg, 'w-16 h-16 rounded-xl border-2 border-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[2px_2px_0px_rgba(0,0,0,1)]']">
            <component :is="card.icon" class="w-8 h-8 text-black" stroke-width="2.5" />
          </div>
          <h3 class="text-xl font-black mb-3">{{ card.title }}</h3>
          <p class="text-base text-gray-500 font-medium mb-8 flex-1 leading-relaxed">{{ card.desc }}</p>
          <router-link :to="card.path" class="mt-auto">
            <button class="w-full py-3 rounded-xl border-2 border-black font-bold text-base hover:bg-black hover:text-white transition-colors flex items-center justify-center bg-transparent group-hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              {{ card.action }}
              <ArrowRight class="w-4 h-4 ml-2" stroke-width="3" />
            </button>
          </router-link>
        </div>
      </div>
      <!-- 修改密码弹窗 -->
      <Dialog v-model:open="isPasswordDialogOpen" @update:open="(open) => !open && resetPasswordForm()">
        <DialogContent class="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
          </DialogHeader>
          <div class="flex flex-col gap-4 py-4">
            <!-- 原密码 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">原密码</label>
              <div class="relative">
                <Input 
                  v-model="passwordForm.oldPassword"
                  :type="showOldPassword ? 'text' : 'password'"
                  placeholder="请输入原密码"
                  class="pr-10"
                />
                <button 
                  type="button"
                  @click="showOldPassword = !showOldPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Eye v-if="!showOldPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
            <!-- 新密码 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">新密码</label>
              <div class="relative">
                <Input 
                  v-model="passwordForm.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="请输入新密码（至少6位）"
                  class="pr-10"
                />
                <button 
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Eye v-if="!showNewPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
            <!-- 确认新密码 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">确认新密码</label>
              <div class="relative">
                <Input 
                  v-model="passwordForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="请再次输入新密码"
                  class="pr-10"
                />
                <button 
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Eye v-if="!showConfirmPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              @click="isPasswordDialogOpen = false"
              :disabled="passwordLoading"
            >
              取消
            </Button>
            <Button 
              @click="handleChangePassword"
              :disabled="passwordLoading"
              class="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {{ passwordLoading ? '提交中...' : '确认修改' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <!-- 登出确认对话框 -->
      <ConfirmDialog
        v-model:open="isLogoutDialogOpen"
        title="退出登录"
        description="确定要退出当前账号吗？"
        confirm-text="退出"
        variant="warning"
        @confirm="confirmLogout"
      />
    </div>

  </div>
</template>

