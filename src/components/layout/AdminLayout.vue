
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// 引入图标 (这里以 lucide-vue-next 为例，完美契合这种粗线条风格)
import { 
  LayoutDashboard, 
  Cat, 
  Heart, 
  LifeBuoy, 
  PawPrint, 
  Users,
  Search,
  X
} from 'lucide-vue-next'
import { catApi, adminUserApi } from '@/lib/api'
import type { CatListItem, AdminUserItem } from '@/types'

const route = useRoute()
const router = useRouter()

// 计算当前路由，用于高亮侧边栏
// 这里假设你的路由路径是 /admin/dashboard 这种格式
const currentRoute = computed(() => route.path)

// 检查是否在业务管理页面（猫咪档案、领养申请、SOS救援）
const isBusinessPage = computed(() => {
  return (
    route.path.includes('/admin/cats') ||
    route.path.includes('/admin/adoptions') ||
    route.path.includes('/admin/sos')
  )
})

// 搜索相关状态
const searchQuery = ref('')
const catSuggestions = ref<CatListItem[]>([])
const userSuggestions = ref<AdminUserItem[]>([])
const allCats = ref<CatListItem[]>([])
const allUsers = ref<AdminUserItem[]>([])
let debounceTimer: number | null = null

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
      { name: '新喵线索', path: '/admin/new-cats', icon: PawPrint }
    ]
  },
  {
    title: '系统管理',
    items:[
      { name: '用户管理', path: '/admin/users', icon: Users }
    ]
  }
]

// 挂载时加载猫咪列表和用户列表
onMounted(async () => {
  try {
    const [catRes, userRes] = await Promise.all([
      catApi.getCatList({ page: 1, pageSize: 1000 }),
      adminUserApi.getUserList({ page: 1, size: 100 })
    ])
    allCats.value = catRes?.items || []
    
    // 获取用户列表后，补充缺失的学号字段
    const userItems = userRes?.items || []
    // 对于缺少学号的用户，尝试获取详情补充
    const enrichedUsers = await Promise.allSettled(
      userItems.map(async (user) => {
        const hasSid = user.sid || user.studentId
        if (hasSid) return user
        try {
          const detail = await adminUserApi.getUserDetail(user.id)
          return { ...user, sid: detail.sid, studentId: detail.studentId, email: detail.email }
        } catch {
          return user
        }
      })
    )
    allUsers.value = enrichedUsers.map((res, i) =>
      res.status === 'fulfilled' ? res.value : userItems[i]
    )
  } catch (e) {
    console.error('加载数据失败', e)
  }
})

// 搜索函数 - 支持多个字段
const doSearch = (keyword: string) => {
  if (!keyword || keyword.trim().length === 0) {
    catSuggestions.value = []
    userSuggestions.value = []
    return
  }

  const q = String(keyword || '').trim().toLowerCase()
  
  // 搜索猫咪
  catSuggestions.value = allCats.value
    .filter(c => {
      const name = String(c.name || '').toLowerCase()
      const color = String(c.color || '').toLowerCase()
      const campus = String(c.campus || '').toLowerCase()
      const location = String((c as any).locationName || '').toLowerCase()
      return name.includes(q) || color.includes(q) || campus.includes(q) || location.includes(q)
    })
    .slice(0, 5) // 限制建议数量
  
  // 搜索用户 - 支持ID、昵称、角色、学号
  userSuggestions.value = allUsers.value
    .filter(u => {
      const id = String(u.id || '').toLowerCase()
      const name = String(u.name || '').toLowerCase()
      const role = String(u.role || u.roleName || u.permission || '').toLowerCase()
      const sid = String(u.sid || u.studentId || '').toLowerCase()
      const email = String(u.email || '').toLowerCase()
      // 从邮箱中提取学号（格式: 学号@mail.sdu.edu.cn）
      const sidFromEmail = email.includes('@') ? email.split('@')[0] : ''
      
      // 学号匹配：支持直接匹配 sid字段、studentId字段、或从邮箱提取的学号
      const sidMatch = (sid && sid.includes(q)) || sidFromEmail.includes(q)
      
      // 角色关键词映射（支持中英文搜索）
      const roleKeywords: Record<string, string[]> = {
        'admin': ['admin', '管理员', '管理', 'administrator'],
        'user': ['user', '用户', '普通用户', 'member']
      }
      // 检查角色关键词匹配
      let roleMatch = role.includes(q)
      for (const [roleKey, keywords] of Object.entries(roleKeywords)) {
        if (keywords.some(kw => kw.includes(q) || q.includes(kw))) {
          if (role.toLowerCase().includes(roleKey) || role === '') {
            // 如果角色字段包含角色关键词，或者角色字段为空时默认为普通用户
            if (roleKey === 'user' && (!role || role.toLowerCase() === 'user')) {
              roleMatch = true
            } else if (roleKey === 'admin' && role.toLowerCase().includes('admin')) {
              roleMatch = true
            }
          }
        }
      }
      return id.includes(q) || name.includes(q) || roleMatch || sidMatch || email.includes(q)
    })
    .slice(0, 5) // 限制建议数量
}

const onSearchInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => doSearch(searchQuery.value), 300)
}

const chooseCat = (cat: CatListItem) => {
  // 设置搜索导航标记
  sessionStorage.setItem('adminCatSearchNavigation', 'true')
  
  // 根据当前页面的类型决定跳转方式
  if (isBusinessPage.value) {
    // 业务管理页面（猫咪档案、领养申请、SOS救援）：保留筛选条件
    router.push({
      path: route.path,
      query: { ...route.query, search: String(cat.name || ''), page: '1' }
    })
  } else {
    // 其他页面：跳转到猫咪档案页并搜索
    router.push({
      path: '/admin/cats',
      query: { search: String(cat.name || ''), page: '1' }
    })
  }
  catSuggestions.value = []
  userSuggestions.value = []
  searchQuery.value = ''
}

const chooseUser = (user: AdminUserItem) => {
  // 跳转到用户管理页并搜索
  router.push({
    path: '/admin/users',
    query: { search: String(user.name || user.id), page: '1' }
  })
  catSuggestions.value = []
  userSuggestions.value = []
  searchQuery.value = ''
}

const onSearchEnter = () => {
  const q = String(searchQuery.value || '').trim()
  if (!q) return

  // 设置搜索导航标记
  sessionStorage.setItem('adminCatSearchNavigation', 'true')

  // 如果只有用户结果（无猫咪结果），直接跳转用户管理页
  const hasOnlyUserResults = userSuggestions.value.length > 0 && catSuggestions.value.length === 0
  
  if (hasOnlyUserResults) {
    // 只有用户结果：跳转到用户管理页
    router.push({
      path: '/admin/users',
      query: { search: q, page: '1' }
    })
  } else if (isBusinessPage.value) {
    // 业务管理页面：更新搜索参数
    router.push({
      path: route.path,
      query: { ...route.query, search: q, page: '1' }
    })
  } else {
    // 其他页面：跳转到猫咪档案页并搜索
    router.push({
      path: '/admin/cats',
      query: { search: q, page: '1' }
    })
  }
  catSuggestions.value = []
  userSuggestions.value = []
}

const clearSearch = () => {
  searchQuery.value = ''
  catSuggestions.value = []
  userSuggestions.value = []
}
</script>




<template>
  <div class="flex h-screen w-full bg-[#F3F4F6] overflow-hidden font-sans">
    
    <!-- 侧边栏 (Sidebar)=-->
    <aside class="w-64 flex flex-col bg-white border-r-2 border-black flex-shrink-0 z-20">
      
      <!-- Logo 区域 -->
      <div class="h-20 flex items-center px-6 border-b-2 border-black">
        <!-- 替换为你的猫猫 Logo 图标 -->
        <svg class="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3.1-9-7.56c0-1.25.5-2.4 1.1-3.48 0 0-1.93-6.42-.53-7 1.4-.58 4.5 0 6.28 2 .67-.18 1.34-.27 2-.27z"></path>
          <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"></path>
          <path d="M9 13h.01"></path>
          <path d="M15 13h.01"></path>
        </svg>
        <span class="text-2xl font-black tracking-tight">SDU Meow</span>
      </div>

      <!-- 导航菜单区域 -->
      <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        <div v-for="group in menuGroups" :key="group.title">
          <div class="text-xs text-gray-500 font-bold mb-3 px-2 uppercase tracking-wider">{{ group.title }}</div>
          <ul class="space-y-2">
            <li v-for="item in group.items" :key="item.path">
              <router-link 
                :to="item.path"
                class="flex items-center px-4 py-3 rounded-lg border-2 transition-all duration-200 group"
                :class="[
                  currentRoute === item.path 
                    ? 'bg-[#5CD6C2] border-black text-black font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
                    : 'border-transparent text-gray-700 hover:bg-gray-100 hover:text-black hover:border-gray-200'
                ]"
              >
                <component 
                  :is="item.icon" 
                  class="w-5 h-5 mr-3" 
                  :stroke-width="currentRoute === item.path ? 2.5 : 2"
                />
                <span class="text-base">{{ item.name }}</span>
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- 底部用户信息 -->
      <div class="h-24 border-t-2 border-black flex items-center px-6 bg-white">
        <div class="w-12 h-12 rounded-full bg-[#FACC15] border-2 border-black flex items-center justify-center font-black text-black mr-4 flex-shrink-0 text-lg shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          AD
        </div>
        <div class="flex flex-col overflow-hidden space-y-0.5">
          <span class="text-base font-black truncate">超级管理员</span>
          <span class="text-xs text-gray-500 truncate font-medium">admin@sdumeow.com</span>
        </div>
      </div>
    </aside>

    <!--  右侧主体区域 -->
    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- 顶部栏 (Header) -->
      <header class="h-20 bg-white border-b-2 border-black flex items-center justify-between px-8 z-30 flex-shrink-0 relative">
        
        <!-- 左侧搜索框 -->
        <div class="flex-1 max-w-lg">
          <div class="relative flex items-center group">
            <Search class="w-5 h-5 absolute left-4 text-gray-500 group-focus-within:text-black transition-colors" stroke-width="2.5" />
            <input 
              v-model="searchQuery"
              @input="onSearchInput"
              @keyup.enter="onSearchEnter"
              type="text" 
              placeholder="搜索猫咪、用户或内容..." 
              class="w-full pl-12 pr-10 py-3 text-sm bg-white border-2 border-black rounded-full focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow placeholder-gray-400 font-bold"
            >
            <!-- 清除按钮 -->
            <button 
              v-if="searchQuery"
              @click="clearSearch"
              class="absolute right-4 text-gray-500 hover:text-black transition-colors"
            >
              <X class="w-5 h-5" stroke-width="2.5" />
            </button>

            <!-- 搜索建议框 -->
            <div
              v-if="catSuggestions.length || userSuggestions.length"
              class="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border-2 border-black z-50 max-h-96 overflow-y-auto"
            >
              <!-- 猫咪搜索结果 -->
              <div v-if="catSuggestions.length">
                <div class="px-4 py-2 text-xs font-bold text-gray-500 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <Cat class="w-4 h-4" />
                  猫咪
                </div>
                <ul>
                  <li
                    v-for="item in catSuggestions"
                    :key="'cat-' + item.id"
                    class="px-4 py-3 hover:bg-yellow-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors group/item"
                    @click="chooseCat(item)"
                  >
                    <img
                      :src="item.avatar"
                      :alt="item.name"
                      class="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-black"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-bold text-gray-900 truncate group-hover/item:text-primary transition-colors">
                        {{ item.name }}
                      </div>
                      <div class="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        <span v-if="item.color" class="flex items-center gap-1">
                          <span class="text-gray-400">花色:</span>
                          <span class="text-gray-700 font-medium">{{ item.color }}</span>
                        </span>
                        <span v-if="(item as any).locationName" class="flex items-center gap-1">
                          <span class="text-gray-400">地点:</span>
                          <span class="text-gray-700 font-medium">{{ (item as any).locationName }}</span>
                        </span>
                        <span v-else-if="item.campus" class="flex items-center gap-1">
                          <span class="text-gray-400">校区:</span>
                          <span class="text-gray-700 font-medium">{{ item.campus }}</span>
                        </span>
                      </div>
                    </div>
                    <div class="text-lg opacity-0 group-hover/item:opacity-100 transition-opacity">→</div>
                  </li>
                </ul>
              </div>
              
              <!-- 用户搜索结果 -->
              <div v-if="userSuggestions.length">
                <div class="px-4 py-2 text-xs font-bold text-gray-500 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <Users class="w-4 h-4" />
                  用户
                </div>
                <ul>
                  <li
                    v-for="user in userSuggestions"
                    :key="'user-' + user.id"
                    class="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors group/item"
                    @click="chooseUser(user)"
                  >
                    <div 
                      v-if="user.avatar"
                      class="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-black"
                    >
                      <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover" />
                    </div>
                    <div 
                      v-else
                      class="w-10 h-10 rounded-full bg-blue-100 border-2 border-black flex items-center justify-center text-blue-600 font-bold text-sm shrink-0"
                    >
                      {{ (user.name || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-bold text-gray-900 truncate group-hover/item:text-blue-600 transition-colors">
                        {{ user.name }}
                      </div>
                      <div class="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        <span class="flex items-center gap-1">
                          <span class="text-gray-400">ID:</span>
                          <span class="text-gray-700 font-medium">{{ user.id }}</span>
                        </span>
                        <span v-if="user.sid || user.studentId" class="flex items-center gap-1">
                          <span class="text-gray-400">学号:</span>
                          <span class="text-gray-700 font-medium">{{ user.sid || user.studentId }}</span>
                        </span>
                        <span v-if="user.role || user.roleName || user.permission" class="flex items-center gap-1">
                          <span class="text-gray-400">角色:</span>
                          <span class="text-gray-700 font-medium">{{ user.role || user.roleName || user.permission }}</span>
                        </span>
                      </div>
                    </div>
                    <div class="text-lg opacity-0 group-hover/item:opacity-100 transition-opacity">→</div>
                  </li>
                </ul>
              </div>
              
              <div v-if="searchQuery && catSuggestions.length === 0 && userSuggestions.length === 0" class="px-4 py-6 text-center text-sm text-gray-500">
                未找到匹配的结果
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧操作区 -->
        <div class="flex items-center space-x-4 ml-8">
          <!-- 顶部头像 -->
          <div class="w-10 h-10 rounded-full bg-[#FACC15] border-2 border-black flex items-center justify-center font-black text-sm cursor-pointer hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-shadow">
            AD
          </div>
        </div>
      </header>

      <!-- 路由视图 (Main Content) -->
      <main class="flex-1 overflow-auto p-8 bg-[#F3F4F6]">
        <div class="max-w-7xl mx-auto pb-10">
          <!-- 你的具体页面内容会被渲染在这里 -->
          <router-view />
        </div>
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