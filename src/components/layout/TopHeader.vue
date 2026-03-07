<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-vue-next'
import { catApi } from '@/lib/api'
import type { CatListItem } from '@/types'

const router = useRouter()
const route = useRoute()
const query = ref('')
const suggestions = ref<any[]>([])
const allCats = ref<CatListItem[]>([])
const isAdminRoute = computed(() => route.path.includes('/admin/cats'))
let debounceTimer: number | null = null


onMounted(async () => {
  try {
    const res = await catApi.getCatList()
    allCats.value = res?.items || []
  } catch (e) {
    console.error('加载猫咪列表失败', e)
  }
  
  // 同步路由查询参数到搜索框
  if (isAdminRoute.value && route.query.search) {
    query.value = String(route.query.search || '')
  }
})

// 监听路由变化，同步搜索框值
watch(
  () => route.query.search,
  (newVal) => {
    if (isAdminRoute.value) {
      query.value = String(newVal || '')
    }
  }
)

// 搜索函数 - 支持多个字段
const doSearch = (keyword: string) => {
    if (!keyword || keyword.trim().length === 0) {
        suggestions.value = []
        return
    }
    
    const q = String(keyword || '').trim().toLowerCase()
    suggestions.value = allCats.value.filter(c => {
        const name = String(c.name || '').toLowerCase()
        const color = String(c.color || '').toLowerCase()
        const campus = String(c.campus || '').toLowerCase()
        // 在 AdminCatView 中也搜索常驻地
        const location = String((c as any).locationName || '').toLowerCase()
        return name.includes(q) || color.includes(q) || campus.includes(q) || location.includes(q)
    }).slice(0, 8) // 限制建议数量
}

const onInput = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = window.setTimeout(() => doSearch(query.value), 300)
}

const chooseCat = (cat: any) => {
    if (route.name === 'adopt' || route.name === 'sos' || route.name === 'post-moment') {
        router.replace({ path: route.path, query: { catId: String(cat.id) } })
    } else if (isAdminRoute.value) {
        // 在 AdminCatView 中，更新搜索查询参数
        router.push({ path: route.path, query: { ...route.query, search: String(cat.name || ''), page: '1' } })
    } else {
        router.push({ path: '/', query: { search: String(cat.name || '') } })
    }
    suggestions.value = []
    query.value = ''
}

const onSearchEnter = () => {
    const q = String(query.value || '').trim()
    if (isAdminRoute.value) {
        // 在 AdminCatView 中，更新搜索查询参数
        router.push({ path: route.path, query: { ...route.query, search: q || undefined, page: '1' } })
    } else {
        router.push({ path: '/', query: q ? { search: q } : {} })
    }
    suggestions.value = []
}

const clearSearch = () => {
    query.value = ''
    suggestions.value = []
    if (isAdminRoute.value) {
        router.push({ path: route.path, query: { ...route.query, search: undefined, page: '1' } })
    }
}
</script>

<template>
    <header
        class="h-[64px] w-full bg-meow-bg px-6 border-b border-gray-200 sticky top-0 z-10 grid grid-cols-3 items-center"
    >
        <div class="flex items-center text-sm text-gray-500 tracking-wider">
            <span class="hover:text-primary cursor-pointer transition-colors">SDU Meow</span>
            <span class="mx-2 text-gray-300">></span>
            <span class="font-bold text-gray-900">
              {{ route.name === 'sos' ? '紧急SOS' : route.name === 'adopt' ? '申请领养' : route.name === 'post-moment' ? '发布动态' : '首页' }}
            </span>
        </div>
        <!-- 搜索框 -->
        <div class="flex justify-center w-full group">
            <div class="relative w-full max-w-[500px]">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 group-focus-within:opacity-100 transition-opacity text-gray-500" />
                <Input 
                    v-model="query" 
                    @input="onInput" 
                    @keyup.enter="onSearchEnter" 
                    class="pl-10 pr-10 h-10 w-full rounded-full bg-gray-200 border-transparent focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-transparent placeholder:text-gray-400 text-sm transition-all" 
                    :placeholder="isAdminRoute ? '搜索猫咪名字、花色或常驻地...' : '搜索猫咪花名，花色或出没地点...'" 
                />
                <!-- 清除按钮 -->
                <button 
                    v-if="query" 
                    @click="clearSearch" 
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X class="w-4 h-4" />
                </button>

                <!-- 建议框 -->
                <div 
                    v-if="suggestions.length" 
                    class="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto"
                >
                    <ul class="py-1">
                        <li 
                            v-for="item in suggestions" 
                            :key="item.id" 
                            class="px-4 py-3 hover:bg-primary/10 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors group/item"
                            @click="chooseCat(item)"
                        >
                            <img 
                                :src="item.avatar" 
                                class="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200" 
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
                                    <span v-if="isAdminRoute && (item as any).locationName" class="flex items-center gap-1">
                                        <span class="text-gray-400">地点:</span>
                                        <span class="text-gray-700 font-medium">{{ (item as any).locationName }}</span>
                                    </span>
                                    <span v-else-if="item.campus" class="flex items-center gap-1">
                                        <span class="text-gray-400">校区:</span>
                                        <span class="text-gray-700 font-medium">{{ item.campus }}</span>
                                    </span>
                                </div>
                            </div>
                            <div class="text-xl opacity-0 group-hover/item:opacity-100 transition-opacity">➔</div>
                        </li>
                    </ul>
                    <div v-if="query && suggestions.length === 0" class="px-4 py-6 text-center text-sm text-gray-500">
                        未找到匹配的猫咪
                    </div>
                </div>
            </div>
        </div>

    </header>

</template>