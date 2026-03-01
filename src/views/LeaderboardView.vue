<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { catApi } from '@/lib/api'
import { CampusMap, type LeaderboardType, type LeaderboardItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Crown, MapPin, Info, CheckCircle2 } from 'lucide-vue-next'


const currentTab = ref<LeaderboardType>('popularity')
const list = ref<LeaderboardItem[]>([])
const loading = ref(false)

// 榜单选项配置
const tabs: { key: LeaderboardType; label: string }[] = [
  { key: 'popularity', label: '人气榜' },
  { key: 'appearance', label: '颜值榜' },
  { key: 'gluttony', label: '吃货榜' },
  { key: 'fight', label: '战力榜' } 
]

// --- 数据计算  ---
const topThree = computed(() => {
  // 安全检查：如果 list 不是数组，直接返回空，防止崩盘
  if (!Array.isArray(list.value) || list.value.length === 0) return []
  
  const first = list.value[0]
  const second = list.value[1]
  const third = list.value[2]
  return [second, first, third].filter(Boolean)
})

// 剩余列表 
const restList = computed(() => {
  if (!Array.isArray(list.value)) return []
  return list.value.slice(3)
})

//单位列表
const scoreUnit =computed(()=>{
  switch(currentTab.value){
    case 'popularity':
      return '票'
    case 'appearance':
      return '颜值分'
    case 'gluttony':
      return '贪吃值'
    case 'fight':
      return '战力值'
    default:
      return '票'
  }
})

//请求函数
const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await catApi.getLeaderboard(currentTab.value, 50)
    
    console.log(' 调试数据:', res) 

   
    
    //  http.ts 拦截器已经脱了一层壳，返回的是 res.data
    // 那么此时 res 就是 { items: [...] }
    if (res && Array.isArray(res.items)) {
      list.value = res.items
    }
    //  http.ts 拦截器没脱壳，或者结构是 res.data.items
    else if (res && res.data && Array.isArray(res.data.items)) {
      list.value = res.data.items
    }
    //  暴力兼容，直接是数组
    else if (Array.isArray(res)) {
      list.value = res
    }
    else {
      list.value = []
      console.warn(' 未找到数组数据')
    }

  } catch (error) {
    console.error('请求失败:', error)
    list.value = []
  } finally {
    loading.value = false
  }
}

// 切换 Tab 时自动刷新
watch(currentTab, () => {
  fetchData()
})

onMounted(() => {
  fetchData()
})


// 领奖台皇冠颜色
const getCrownColor = (index: number) => {
  if (index === 1) return 'text-yellow-400 drop-shadow-md' // 金 (第1名在数组中间，index为1)
  if (index === 0) return 'text-gray-300'    // 银
  return 'text-orange-600'   // 铜
}
</script>

<template>
  <div class="min-h-full p-6 w-full max-w-7xl mx-auto flex flex-col gap-6">
    
    <!-- 1. 顶部 Banner -->
    <div class="w-full h-48 bg-gradient-to-r from-[#FF9F1C] to-[#FFB74D] rounded-2xl flex flex-col items-center justify-center text-white shadow-lg relative overflow-hidden">
      <!-- 装饰背景 -->
      <div class="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      
      <div class="z-10 flex flex-col items-center">
        <Crown class="w-10 h-10 mb-2 fill-yellow-200 text-yellow-100" />
        <h1 class="text-3xl font-black tracking-widest mb-1">全校封神榜</h1>
        <p class="text-white/80 text-sm font-medium tracking-wide">人气猫咪排行榜，为你揭晓最可爱的喵星人</p>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="flex justify-center">
      <div class="bg-white p-1 rounded-full shadow-sm border border-gray-100 flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="currentTab = tab.key"
          class="px-8 py-2 rounded-full text-sm font-bold transition-all duration-300"
          :class="currentTab === tab.key ? 'bg-white text-[#FF9F1C] shadow-md ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      
      <!-- 左侧：主要内容 -->
      <div class="flex flex-col gap-8">
        
        <!--  领奖台 (Top 3) -->
        <div v-if="topThree.length > 0" class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative">
          <!-- 背景光晕 -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-yellow-100/50 blur-[60px] rounded-full"></div>

          <div class="relative flex justify-center items-end gap-4 md:gap-12 pb-4">
            
            <!-- 循环渲染 2-1-3 名 -->
            <div 
              v-for="(cat, index) in topThree" 
              :key="cat.id||cat.catId"
              class="flex flex-col items-center transition-transform hover:-translate-y-2 duration-300 cursor-pointer group"
              :class="index === 1 ? 'z-10 -mt-8' : 'z-0'"
              @click="$router.push(`/cat/${cat.id||cat.catId}`)"
            >
              <!-- 皇冠 -->
              <Crown 
                class="w-8 h-8 mb-2 animate-bounce" 
                :class="getCrownColor(index)"
                :style="{ animationDuration: index === 1 ? '2s' : '3s' }"
              />
              
              <!-- 头像 -->
              <div 
                class="rounded-full border-4 shadow-lg overflow-hidden relative"
                :class="[
                  index === 1 ? 'w-28 h-28 border-[#FFD700]' : 'w-20 h-20',
                  index === 0 ? 'border-gray-300' : '',
                  index === 2 ? 'border-orange-200' : ''
                ]"
              >
                <img :src="cat.avatar" class="w-full h-full object-cover bg-gray-100" />
                
                <!-- 排名角标 -->
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm border border-gray-100 whitespace-nowrap">
                  NO.{{ index === 1 ? 1 : (index === 0 ? 2 : 3) }}
                </div>
              </div>

              <!-- 信息 -->
              <div class="text-center mt-5">
                <h3 class="font-bold text-gray-800 text-lg group-hover:text-[#FF9F1C] transition-colors">{{ cat.name }}</h3>
                <div class="text-[#FF9F1C] font-bold text-sm mt-1">
                  {{ cat.value }} <span class="text-xs text-gray-400 font-normal">{{ scoreUnit }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- 剩余排名列表 (4-10+) -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 class="font-bold text-gray-800">排行榜</h3>
            <span class="text-xs text-gray-400">实时更新</span>
          </div>

          <div class="divide-y divide-gray-50">
            <div 
              v-for="(cat, index) in restList" 
              :key="cat.id||cat.catId"
              class="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              @click="$router.push(`/cat/${cat.id||cat.catId}`)"
            >
              <!-- 排名序号 -->
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 shrink-0"
                :class="index < 3 ? 'bg-[#FFD700] text-white' : 'text-gray-500'"
              >
                {{ index + 4 }}
              </div>

              <!-- 头像 -->
              <img :src="cat.avatar" class="w-12 h-12 rounded-full object-cover border border-gray-100 mr-4 bg-gray-100" />

              <!-- 信息 -->
              <div class="flex-1">
                <div class="font-bold text-gray-800 group-hover:text-[#FF9F1C]">{{ cat.name }}</div>
                <div class="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin class="w-3 h-3" />
                  {{ cat.campus || '未知校区' }}
                </div>
              </div>

              <!-- 票数 -->
              <div class="text-right">
                <div class="font-bold text-gray-900">{{ cat.value }} {{ scoreUnit }}</div>
              </div>
            </div>
          </div>
          
          <!-- 加载更多 -->
          <div class="p-4 text-center border-t border-gray-50">
            <Button variant="outline" class="text-xs h-9 rounded-full px-6 text-gray-500 hover:text-[#FF9F1C]">
              加载更多 <span class="ml-1">↓</span>
            </Button>
          </div>
        </div>

      </div>

      <!-- 右侧：侧边栏 -->
      <div class="flex flex-col gap-6 sticky top-6">
        
        <!-- 规则卡片 -->
        <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div class="flex items-center gap-2 mb-4 text-[#FF9F1C]">
            <Info class="w-5 h-5" />
            <h3 class="font-bold">投票规则</h3>
          </div>
          <ul class="space-y-3 text-xs text-gray-500">
            <li class="flex gap-2 items-start">
              <CheckCircle2 class="w-4 h-4 text-yellow-400 shrink-0" />
              <span>每日 00:00 统计投票数</span>
            </li>
            <li class="flex gap-2 items-start">
              <CheckCircle2 class="w-4 h-4 text-yellow-400 shrink-0" />
              <span>每个用户每天最多投 3 票</span>
            </li>
            <li class="flex gap-2 items-start">
              <CheckCircle2 class="w-4 h-4 text-yellow-400 shrink-0" />
              <span>系统自动剔除刷票检测</span>
            </li>
            <li class="flex gap-2 items-start">
              <CheckCircle2 class="w-4 h-4 text-yellow-400 shrink-0" />
              <span>投票结果实时更新</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  </div>
</template>