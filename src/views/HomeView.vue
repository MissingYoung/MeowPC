<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button';
import { catApi, userApi } from '@/lib/api';
import { useUserStore } from '@/stores/user';
import type { CatListItem, CheckinResult } from '@/types';
import { toast } from 'vue-sonner';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { ChevronLeft, ChevronRight, Gift, Calendar, Zap } from 'lucide-vue-next';

import StatsBanner from '@/components/StatsBanner.vue';
import ShortcutGrid from '@/components/ShortcutGrid.vue';
import CatCard from '@/components/CatCard.vue';


//数据
const catList = ref<CatListItem[]>([]);
const selectedCategory = ref('全部')
const pageSize = 20 // 每页显示数量

const categories = ['全部', '三花', '橘猫', '奶牛', '纯色', '长毛', '短毛']

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 签到相关
const checkinLoading = ref(false)
const checkinResult = ref<CheckinResult | null>(null)

// 执行签到
const handleCheckin = async () => {
  if (!userStore.token) {
    toast.warning('请先登录后再签到')
    router.push('/login')
    return
  }
  checkinLoading.value = true
  try {
    const res = await userApi.checkin()
    checkinResult.value = res
    if (res?.todayChecked) {
      toast.info('今天已经签过到啦~')
    } else {
      toast.success(`签到成功！获得 ${res?.rewards?.currency || 0} 小鱼干，${res?.rewards?.experience || 0} 经验值`)
      // 刷新用户信息以更新小鱼干余额
      userStore.fetchUserInfo()
    }
  } catch (error: any) {
    toast.error(error?.message || '签到失败，请稍后重试')
  } finally {
    checkinLoading.value = false
  }
}

// 从路由获取当前页码
const currentPage = computed({
  get: () => parseInt(String(route.query.page || '1'), 10),
  set: (val) => {
    router.push({
      query: { ...route.query, page: String(val) }
    })
  }
})

// 过滤后的猫咪列表（不含分页）
const filteredCats = computed(() => {
  const cats = catList.value || []
  // 先按分类过滤
  let arr = cats
  if (selectedCategory.value !== '全部') {
    arr = arr.filter(c => {
      if (!c.color) return false
      const color = String(c.color || '')
      if (selectedCategory.value === '纯色') {
        return color.includes('纯') || color.includes('纯色')
      }
      return color.includes(selectedCategory.value)
    })
  }
  // 再按顶部搜索 query 过滤（模糊匹配 名字/花色/校区）
  const q = String(route.query.search || '').trim().toLowerCase()
  if (q) {
    arr = arr.filter(c => {
      const name = String(c.name || '').toLowerCase()
      const color = String(c.color || '').toLowerCase()
      const campus = String(c.campus || '').toLowerCase()
      return name.includes(q) || color.includes(q) || campus.includes(q)
    })
  }
  return arr
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredCats.value.length / pageSize) || 1)

// 分页后的显示列表
const displayedCats = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredCats.value.slice(start, end)
})

// 分页页码列表
const paginationPages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value
  const maxPagesToShow = 5

  if (total <= maxPagesToShow + 2) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      for (let i = 1; i <= Math.min(maxPagesToShow, total); i++) pages.push(i)
      if (total > maxPagesToShow) pages.push('...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...')
      for (let i = total - maxPagesToShow + 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...', total)
    }
  }
  return pages
})

// 切换分类时重置页码
watch(selectedCategory, () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1
  }
})

// 搜索内容变化时重置页码
watch(() => route.query.search, () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1
  }
})

const loading = ref(true);

//获取数据
const fetchCats=async()=>{
    console.log('开始请求猫咪列表...') // 1. 确认函数执行了
  loading.value = true
  try{
    const data= await catApi.getCatList({ page: 1, pageSize: 1000 }); // 加载全部数据
      console.log('请求成功，拿到数据:', data)
    if(data&&data.items){
      catList.value=data.items;
    }
  }catch(e){
    console.error(e);
  }finally{
    loading.value=false;
  }
}

onMounted(()=>{
  fetchCats();
}); 

</script>



<template>
  <div class="flex flex-col  w-full min-h-full">
    <div class="grid grid-cols-1 lg:grid-cols-[3.7fr_1fr] gap-6 items-start">
      <section class="flex flex-col gap-6  rounded-xl ">
        <StatsBanner />
        <ShortcutGrid />

        <!--猫咪列表-->
        
        <div class="flex gap-3 ">
          <!--分类筛选-->
          <template v-for="cat in categories" :key="cat">
            <Button @click="selectedCategory = cat"
              :class="['px-3 py-1 border-2 rounded-full text-sm', selectedCategory===cat ? 'bg-primary text-black border-primary' : 'bg-white text-black border-gray-200 hover:bg-primary']">
              {{ cat }}
            </Button>
          </template>
        </div>
        <!--列网表格-->
        <div v-if="loading" class="text-center py-10 text-gray-500">加载中...🐱</div>
        <div v-else-if="displayedCats.length === 0" class="text-center py-10 text-gray-500">暂无符合条件的猫咪</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <CatCard v-for="cat in displayedCats" :key="cat.id" :cat="cat" />
        </div>

        <!-- 分页组件 -->
        <div v-if="!loading && filteredCats.length > pageSize" class="flex justify-center mt-6">
          <Pagination :total="filteredCats.length" :items-per-page="pageSize" :sibling-count="1" show-edges :default-page="currentPage">
            <PaginationContent class="flex items-center gap-1">
              <PaginationPrevious 
                :disabled="currentPage <= 1"
                @click="currentPage > 1 && (currentPage = currentPage - 1)"
                class="h-9 px-3 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft class="h-4 w-4" />
                <span class="hidden sm:inline">上一页</span>
              </PaginationPrevious>

              <template v-for="(page, index) in paginationPages" :key="index">
                <PaginationEllipsis v-if="page === '...'" class="px-3 text-gray-400" />
                <PaginationItem v-else :value="page as number">
                  <Button
                    variant="outline"
                    size="sm"
                    :class="[
                      'h-9 w-9 rounded-md',
                      currentPage === page ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-gray-50'
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
                class="h-9 px-3 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span class="hidden sm:inline">下一页</span>
                <ChevronRight class="h-4 w-4" />
              </PaginationNext>
            </PaginationContent>
          </Pagination>
        </div>

        <!-- 总数提示 -->
        <div v-if="!loading && filteredCats.length > 0" class="text-center text-sm text-gray-500 mt-2">
          共 {{ filteredCats.length }} 只猫咪，当前第 {{ currentPage }}/{{ totalPages }} 页
        </div>
      </section>
    
      <aside class="flex flex-col gap-6">
        <!-- 每日签到卡片 -->
        <div class="w-full rounded-2xl bg-gradient-to-br from-[#FFB347] to-[#FFCC33] p-5 shadow-lg">
          <h3 class="text-white text-lg font-bold mb-2 flex items-center gap-2">
            <Calendar class="w-5 h-5" />
            每日签到
          </h3>
          <p class="text-white/80 text-sm mb-4">签到可获得小鱼干和经验值~</p>
          
          <!-- 签到结果展示 -->
          <div v-if="checkinResult" class="bg-white/20 rounded-xl p-3 mb-4 backdrop-blur-sm">
            <div class="grid grid-cols-2 gap-3 text-white text-sm">
              <div class="flex items-center gap-2">
                <Calendar class="w-4 h-4" />
                <span>累计签到 <strong>{{ checkinResult.totalDays }}</strong> 天</span>
              </div>
              <div class="flex items-center gap-2">
                <Zap class="w-4 h-4" />
                <span>连续签到 <strong>{{ checkinResult.continuousDays }}</strong> 天</span>
              </div>
            </div>
            <div v-if="!checkinResult.todayChecked" class="mt-2 pt-2 border-t border-white/20 text-white/90 text-xs">
              本次获得: 🐟 {{ checkinResult.rewards?.currency }} 小鱼干 | ⚡ {{ checkinResult.rewards?.experience }} 经验
            </div>
          </div>

          <!-- 签到按钮 -->
          <Button 
            @click="handleCheckin"
            :disabled="checkinLoading || checkinResult?.todayChecked"
            class="w-full bg-white text-[#FF9F1C] hover:bg-white/90 font-bold rounded-xl py-3 shadow-sm flex items-center justify-center gap-2"
          >
            <Gift class="w-5 h-5" />
            {{ checkinLoading ? '签到中...' : (checkinResult?.todayChecked ? '今日已签到' : '立即签到') }}
          </Button>

          <!-- 查看签到记录按钮 -->
          <router-link to="/checkin-history" class="block mt-3">
            <Button 
              variant="outline"
              class="w-full bg-white text-[#FF9F1C]  hover:bg-white/90 hover:text-[#FF9F1C] font-bold rounded-xl py-2 text-sm flex items-center justify-center gap-2"
            >
              <Calendar class="w-4 h-4" />
              查看签到记录
            </Button>
          </router-link>
        </div>
      </aside>
    </div>
  </div>
</template>