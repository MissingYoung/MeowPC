<script setup lang="ts">
import { ref,onMounted, computed } from 'vue';
import { useRoute } from 'vue-router'
import { Button } from '@/components/ui/button';
import {catApi} from '@/lib/api';
import type { CatListItem } from '@/types';

import StatsBanner from '@/components/StatsBanner.vue';
import ShortcutGrid from '@/components/ShortcutGrid.vue';
import CatCard from '@/components/CatCard.vue';


//数据
const catList=ref<CatListItem[]>([]);
const selectedCategory = ref('全部')

const categories = ['全部','三花','橘猫','奶牛','纯色','长毛','短毛']

const route = useRoute()

const displayedCats = computed(()=>{
  const cats = catList.value || []
  // 先按分类过滤
  let arr = cats
  if(selectedCategory.value !== '全部'){
    arr = arr.filter(c => {
      if(!c.color) return false
      const color = String(c.color || '')
      if (selectedCategory.value === '纯色') {
        return color.includes('纯') || color.includes('纯色')
      }
      return color.includes(selectedCategory.value)
    })
  }
  // 再按顶部搜索 query 过滤（模糊匹配 名字/花色/校区）
  const q = String(route.query.search || '').trim().toLowerCase()
  if(q){
    arr = arr.filter(c => {
      const name = String(c.name||'').toLowerCase()
      const color = String(c.color||'').toLowerCase()
      const campus = String(c.campus||'').toLowerCase()
      return name.includes(q) || color.includes(q) || campus.includes(q)
    })
  }
  return arr
})
const loading=ref(true);

//获取数据
const fetchCats=async()=>{
    console.log('开始请求猫咪列表...') // 1. 确认函数执行了
  loading.value = true
  try{
    const data= await catApi.getCatList();
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
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <CatCard v-for="cat in displayedCats" :key="cat.id" :cat="cat" />
        </div>
      </section>
    
      <aside class="flex flex-col gap-6">
        <div class="w-full h-screen rounded-sm z-10 border border-b bg-white p-4 flex items-center ">

        </div>
      </aside>
    </div>
  </div>
</template>