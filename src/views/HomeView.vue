<script setup lang="ts">
import { ref,onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import {catApi} from '@/lib/api';
import type { CatListItem } from '@/types';

import StatsBanner from '@/components/StatsBanner.vue';
import ShortcutGrid from '@/components/ShortcutGrid.vue';
import CatCard from '@/components/CatCard.vue';


//数据
const catList=ref<CatListItem[]>([]);
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
      <section class="flex flex-col gap-6 border-b rounded-xl shadow-sm">
        <StatsBanner />
        <ShortcutGrid />

        <!--猫咪列表-->
        
        <div class="flex gap-3 ">
          <!--分类筛选-->
          <Button class="px-3 py-1 border-2 border-gray-200 rounded-full  bg-white text-black text-sm hover:bg-primary focus:bg-primary focus:border-primary">全部</Button>
          <Button class="px-3 py-1 border-2 border-gray-200 rounded-full  bg-white text-black text-sm hover:bg-primary focus:bg-primary focus:border-primary">三花</Button>
          <Button class="px-3 py-1 border-2 border-gray-200 rounded-full  bg-white text-black text-sm hover:bg-primary focus:bg-primary focus:border-primary">橘猫</Button>
          <Button class="px-3 py-1 border-2 border-gray-200 rounded-full  bg-white text-black text-sm hover:bg-primary focus:bg-primary focus:border-primary">奶牛</Button>
          <Button class="px-3 py-1 border-2 border-gray-200 rounded-full  bg-white text-black text-sm hover:bg-primary focus:bg-primary focus:border-primary">纯色</Button>
          <Button class="px-3 py-1 border-2 border-gray-200 rounded-full  bg-white text-black text-sm hover:bg-primary focus:bg-primary focus:border-primary">长毛</Button>
          <Button class="px-3 py-1 border-2 border-gray-200 rounded-full  bg-white text-black text-sm hover:bg-primary focus:bg-primary focus:border-primary">短毛</Button>
        </div>
        <!--列网表格-->
        <div v-if="loading" class="text-center py-10 text-gray-500">加载中...🐱</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <CatCard v-for="cat in catList" :key="cat.id" :cat="cat" />
        </div>
      </section>
    
      <aside class="flex flex-col gap-6">
        <div class="w-full h-screen rounded-sm z-10 border border-b bg-white p-4 flex items-center ">

        </div>
      </aside>
    </div>
  </div>
</template>