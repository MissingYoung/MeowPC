
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
// 引入图标 (这里以 lucide-vue-next 为例，完美契合这种粗线条风格)
import { 
  LayoutDashboard, 
  Cat, 
  Heart, 
  LifeBuoy, 
  ShieldCheck, 
  Users, 
  Settings,
  Search,
  Bell
} from 'lucide-vue-next'

const route = useRoute()

// 计算当前路由，用于高亮侧边栏
// 这里假设你的路由路径是 /admin/dashboard 这种格式
const currentRoute = computed(() => route.path)

// 侧边栏菜单配置数据 
const menuGroups =[
  {
    title: '主页',
    items:[
      { name: '控制台', path: '/admin/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: '业务管理',
    items:[
      { name: '猫咪档案', path: '/admin/cats', icon: Cat },
      { name: '领养申请', path: '/admin/adoptions', icon: Heart },
      { name: 'SOS 救援', path: '/admin/sos', icon: LifeBuoy }
    ]
  },
  {
    title: '内容中心',
    items:[
      { name: '内容审核', path: '/admin/audit', icon: ShieldCheck }
    ]
  },
  {
    title: '系统',
    items:[
      { name: '用户管理', path: '/admin/users', icon: Users },
      { name: '系统设置', path: '/admin/settings', icon: Settings }
    ]
  }
]
</script>




<template>
  <div class="flex h-screen w-full bg-[#F3F4F6] overflow-hidden font-sans">
    
    <!-- 侧边栏 (Sidebar)=-->
    <aside class="w-64 flex flex-col bg-white border-r-2 border-black flex-shrink-0 z-20">
      
      <!-- Logo 区域 -->
      <div class="h-16 flex items-center px-6 border-b-2 border-black">
        <!-- 替换为你的猫咪 Logo 图标 -->
        <svg class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3.1-9-7.56c0-1.25.5-2.4 1.1-3.48 0 0-1.93-6.42-.53-7 1.4-.58 4.5 0 6.28 2 .67-.18 1.34-.27 2-.27z"></path>
          <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"></path>
          <path d="M9 13h.01"></path>
          <path d="M15 13h.01"></path>
        </svg>
        <span class="text-xl font-black tracking-tight">SDU Meow</span>
      </div>

      <!-- 导航菜单区域 -->
      <nav class="flex-1 overflow-y-auto py-4 px-4 space-y-6">
        <div v-for="group in menuGroups" :key="group.title">
          <div class="text-xs text-gray-500 font-bold mb-2 px-2">{{ group.title }}</div>
          <ul class="space-y-1">
            <li v-for="item in group.items" :key="item.path">
              <router-link 
                :to="item.path"
                class="flex items-center px-3 py-2.5 rounded-lg border-2 transition-colors duration-200 group"
                :class="[
                  currentRoute === item.path 
                    ? 'bg-[#5CD6C2] border-black text-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)]' 
                    : 'border-transparent text-gray-700 hover:bg-gray-100 hover:text-black hover:border-gray-200'
                ]"
              >
                <component 
                  :is="item.icon" 
                  class="w-5 h-5 mr-3" 
                  :stroke-width="currentRoute === item.path ? 2.5 : 2"
                />
                <span class="text-sm">{{ item.name }}</span>
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- 底部用户信息 -->
      <div class="h-20 border-t-2 border-black flex items-center px-4 bg-white">
        <div class="w-10 h-10 rounded-full bg-[#FACC15] border-2 border-black flex items-center justify-center font-black text-black mr-3 flex-shrink-0">
          AD
        </div>
        <div class="flex flex-col overflow-hidden">
          <span class="text-sm font-black truncate">超级管理员</span>
          <span class="text-xs text-gray-500 truncate">admin@sdumeow.com</span>
        </div>
      </div>
    </aside>

    <!--  右侧主体区域 -->
    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- 顶部栏 (Header) -->
      <header class="h-16 bg-white border-b-2 border-black flex items-center justify-between px-6 z-10 flex-shrink-0">
        
        <!-- 左侧搜索框 -->
        <div class="flex-1 max-w-md">
          <div class="relative flex items-center">
            <Search class="w-4 h-4 absolute left-3 text-gray-500" stroke-width="2.5" />
            <input 
              type="text" 
              placeholder="搜索猫咪、用户或内容..." 
              class="w-full pl-9 pr-4 py-2 text-sm bg-white border-2 border-black rounded-full focus:outline-none focus:ring-0 focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-shadow placeholder-gray-500 font-medium"
            >
          </div>
        </div>

        <!-- 右侧操作区 -->
        <div class="flex items-center space-x-6 ml-4">
          <!-- 消息通知 -->
          <button class="relative p-1 hover:bg-gray-100 rounded-full transition-colors">
            <Bell class="w-5 h-5" stroke-width="2.5" />
            <span class="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          <!-- 顶部头像 -->
          <div class="w-8 h-8 rounded-full bg-[#FACC15] border-2 border-black flex items-center justify-center font-black text-sm cursor-pointer">
            AD
          </div>
        </div>
      </header>

      <!-- 路由视图 (Main Content) -->
      <main class="flex-1 overflow-auto p-6 bg-[#F3F4F6]">
        <!-- 你的具体页面内容会被渲染在这里 -->
        <router-view />
      </main>
      
    </div>
  </div>
</template>



<style scoped>

/* 隐藏滚动条但保留滚动功能  */
aside nav::-webkit-scrollbar {
  width: 4px;
}
aside nav::-webkit-scrollbar-track {
  background: transparent;
}
aside nav::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
</style>