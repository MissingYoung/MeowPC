<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { Button } from '@/components/ui/button';
import { CampusMap } from '@/types';

import forkIcon from '@/assets/icons/fork.svg';
import foundIcon from '@/assets/icons/found.svg';
import likeIcon from '@/assets/icons/like.svg';
import medalIcon from '@/assets/icons/medal.svg';
import paperIcon from '@/assets/icons/paper.svg';
import cameraIcon from '@/assets/icons/camera.svg';
import fishIcon from '@/assets/icons/fish.svg';
import { LogOut, Pencil } from 'lucide-vue-next';
const router=useRouter()
const userStore=useUserStore()

//初始化数据
onMounted(()=>{
  if(userStore.token){
    userStore.fetchUserInfo();
  }
})

//登出
const handleLogout=()=>{
    if(confirm('确定要登出吗')){
        userStore.logout()
        router.push('/login')
    }
}

//校区计算属性
const campusName = computed(() => {
  const info = userStore.userInfo
  // 如果没登录/没数据，或者是 undefined，返回默认值
  if (!info || info.campus === undefined) {
    return '未知校区'
  }
  //  查表，如果查不到，也显示未知
  const idx = typeof info.campus === 'number' ? info.campus : Number(info.campus)
  if (Number.isNaN(idx)) return '未知校区'
  return CampusMap[idx] || '未知校区'
})

const user =computed(() => userStore.userInfo)
</script>

<template>
  <div class="flex flex-col gap-6 p-6 min-h-full">
    
    <!-- 1. 顶部个人信息卡片 (橙色背景) -->
    
    <div class="w-full bg-[#FF9F1C] rounded-2xl p-8 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
      
      <!-- 左侧：头像与信息 -->
      <div class="flex items-center gap-6 z-10">
        <!-- 头像外圈 -->
        <div class="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden bg-white">
          <img 
            :src="user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'" 
            class="w-full h-full object-cover"
          />
        </div>
        
        <div class="flex flex-col gap-2">
          <h1 class="text-3xl font-bold tracking-wide">{{ user?.name || '爱吃鱼的猫' }}</h1>
          <p class="text-white/90 text-sm font-medium">{{ campusName || '未知校区' }}</p>
          
          <!-- 等级胶囊 -->
          <div class="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold w-fit mt-1">
            <span class="mr-1">👑</span>
            Lv.{{ user?.level || 1 }} {{ user?.levelTitle || '新晋铲屎官' }}
          </div>
        </div>
      </div>

      <!-- 右侧：编辑按钮 -->
      <Button 
        class="bg-white text-[#FF9F1C] hover:bg-white/90 border-none font-bold rounded-xl px-6 py-2 shadow-sm z-10 flex items-center gap-2"
      >
        <Pencil class="w-4 h-4" />
        <router-link to="/editProfile" class="ml-2">编辑资料</router-link>
      </Button>

      <!-- 背景装饰圆圈  -->
      <div class="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>

    <!-- 2. 数据统计  -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <!-- 卡片 1: 累计投喂 -->
      <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <!-- 图标容器 -->
        <div class="w-10 h-10 bg-blue-100 text-blue-500 rounded-lg flex items-center justify-center">
          <img :src="forkIcon" class="w-5 h-5" />
        </div>
        <div>
          <div class="text-3xl font-extrabold text-gray-900">{{ user?.stats.feedCount  }}</div>
          <div class="text-xs text-gray-400 mt-1">累计投喂</div>
        </div>
      </div>

      <!-- 卡片 2: 发现新猫 -->
      <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <div class="w-10 h-10 bg-green-100 text-green-500 rounded-lg flex items-center justify-center">
          <img :src="foundIcon" class="w-5 h-5" />
        </div>
        <div>
          <div class="text-3xl font-extrabold text-gray-900">{{ user?.stats.found }}</div>
          <div class="text-xs text-gray-400 mt-1">发现新猫</div>
        </div>
      </div>

      <!-- 卡片 3: 获赞认可 -->
      <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <div class="w-10 h-10 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center">
          <img :src="likeIcon" class="w-5 h-5" />
        </div>
        <div>
          <div class="text-3xl font-extrabold text-gray-900">{{ user?.stats.receivedLikes  }}</div>
          <div class="text-xs text-gray-400 mt-1">获赞认可</div>
        </div>
      </div>

      <!-- 卡片 4: 发布动态 -->
      <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <div class="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
          <img :src="cameraIcon" class="w-5 h-5" />
        </div>
        <div>
          <div class="text-3xl font-extrabold text-gray-900">{{ user?.stats.momentCount }}</div>
          <div class="text-xs text-gray-400 mt-1">发布动态</div>
        </div>
      </div>

    </div>

    <!-- 3. 小鱼干余额  -->
    <div class="w-full bg-[#2D2D2D] rounded-xl p-8 text-white relative shadow-md overflow-hidden group">
      <div class="relative z-10">
        <div class="text-xs text-yellow-500/80 font-medium mb-2">小鱼干余额 (积分)</div>
        <div class="text-5xl font-black text-[#F3B72E] tracking-wider font-mono">
          {{ user?.currency || 850 }}
        </div>
      </div>
      
      <!-- 右下角装饰鱼 SVG -->
      <img :src="fishIcon" class="w-24 h-24 absolute -bottom-3 -right-4 opacity-80 group-hover:opacity-90 transition-opacity mr-6" />
    </div>

    <!-- 4. 功能入口  -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- 领养申请 -->
      <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between cursor-pointer hover:shadow-md transition-shadow">
        <div class="flex gap-4">
          <div class="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-2xl">
            <img :src="paperIcon" class="w-6 h-6" />
          </div>
          <div class="flex flex-col justify-center">
            <h3 class="font-bold text-gray-800 text-lg">领养申请</h3>
            <span class="text-xs text-gray-400 mt-1">查看申请进度</span>
          </div>
        </div>
        <!-- 标签 -->
        <span class="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded">审核中</span>
      </div>

      <!-- 荣誉勋章 -->
      <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between cursor-pointer hover:shadow-md transition-shadow">
        <div class="flex gap-4">
          <div class="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center text-2xl">
            <img :src="medalIcon" class="w-6 h-6" />
          </div>
          <div class="flex flex-col justify-center">
            <h3 class="font-bold text-gray-800 text-lg">荣誉勋章</h3>
            <span class="text-xs text-gray-400 mt-1">查看获得详情</span>
          </div>
        </div>
      </div>

    </div>

    <!-- 5. 退出登录 -->
    <div class="flex justify-center mt-4">
      <button 
        @click="handleLogout" 
        class="flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm font-bold transition-colors py-2  rounded-lg"
      >
        <LogOut class="w-4 h-4 text-center" />
        退出登录
      </button>
    </div>

  </div>
</template>