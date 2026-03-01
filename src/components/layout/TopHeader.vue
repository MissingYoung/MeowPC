<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Input } from '@/components/ui/input'
import { catApi } from '@/lib/api'
import type { CatListItem } from '@/types'

const router = useRouter()
const route = useRoute()
const query = ref('')
const suggestions = ref<any[]>([])
const allCats = ref<CatListItem[]>([])
let debounceTimer: number | null = null


onMounted(async () => {
  try {
    const res = await catApi.getCatList()
    allCats.value = res?.items || []
  } catch (e) {
    console.error('加载猫咪列表失败', e)
  }
})

const doSearch = (keyword: string) => {
    if (!keyword) {
        suggestions.value = []
        return
    }
    
    const q = String(keyword || '').trim().toLowerCase()
    suggestions.value = allCats.value.filter(c => {
        const name = String(c.name || '').toLowerCase()
        const color = String(c.color || '').toLowerCase()
        const campus = String(c.campus || '').toLowerCase()
        return name.includes(q) || color.includes(q) || campus.includes(q)
    })
}

const onInput = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = window.setTimeout(() => doSearch(query.value), 300)
}

const chooseCat = (cat: any) => {
    if (route.name === 'adopt' || route.name === 'sos' || route.name === 'post-moment') {
        router.replace({ path: route.path, query: { catId: String(cat.id) } })
    } else {
        router.push({ path: '/', query: { search: String(cat.name || '') } })
    }
    suggestions.value = []
    query.value = ''
}

const onSearchEnter = () => {
    const q = String(query.value || '').trim()
    router.push({ path: '/', query: q ? { search: q } : {} })
}
</script>

<template>
    <header
        class="h-[64px] w-full bg-meow-bg flex items-center  px-6 border-b border-gray-200 sticky top-0 z-10 grid grid-cols-3 ">
        <div class="flex items-center text-sm text-gray-500 tracking-wider">
            <span class="hover:text-primary cursor-pointer transition-colors">SDU Meow</span>
            <span class="mx-2 text-gray-300">></span>
            <span class="font-bold text-gray-900">
              {{ route.name === 'sos' ? '紧急SOS' : route.name === 'adopt' ? '申请领养' : route.name === 'post-moment' ? '发布动态' : '首页' }}
            </span>
        </div>
        <!-- 搜索框 -->
        <div class="flex justify-center w-full group">
            <div class="relative w-full max-w-[500px] group">
                <span
                    class="absolute left-3 top-1/2 -translate-y-1/2  w-[16px] h-[16px] opacity-50 group-focus-within:opacity-100 transition-opacity">
                    <img src="@/assets/icons/search.svg" alt="search" />
                </span>
                    <Input v-model="query" @input="onInput" @keyup.enter="onSearchEnter" class="pl-10 h-10 w-full rounded-full
                     bg-gray-200 border-transparent
                      focus-visible:bg-white focus-visible:ring-2
                       focus-visible:ring-primary focus-visible:ring-offset-2
                        focus-visible:border-transparent
                       
                       placeholder:text-gray-400 text-sm transition-all" placeholder="搜索猫咪花名，花色或出没地点..." />
                <div v-if="suggestions.length" class="relative left-0 right-0 mt-2 bg-white rounded-xl shadow-lg z-50 max-h-64 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <ul>
                        <li v-for="item in suggestions" :key="item.id" class="px-4 py-3 hover:bg-yellow-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-b-0 transition-colors" @click="chooseCat(item)">
                            <img :src="item.avatar" class="w-10 h-10 rounded-full object-cover shrink-0" />
                            <div class="flex-1 min-w-0">
                                <div class="text-sm font-bold text-gray-800 truncate">{{ item.name }}</div>
                                <div class="flex gap-4 mt-1 text-xs text-gray-500">
                                    <span>花色: <span class="text-gray-700">{{ item.color || '-' }}</span></span>
                                    <span>校区: <span class="text-gray-700">{{ item.campus || '-' }}</span></span>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- 右侧按钮 -->
         <div class="flex items-center justify-end gap-2">
            <router-link to="/settings" class="flex items-center justify-end rounded-full gap-2 hover:bg-yellow-300 transition-colors p-2.5">
                <img src="@/assets/icons/settings.svg" alt="settings" class="w-5 h-5 brightness-0  hover:text-primary transition-all"/>
            </router-link>

         </div>


    </header>

</template>