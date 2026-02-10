<script setup lang="ts">
import {computed}from 'vue';
import type { CatListItem } from '@/types';
import {Button} from './ui/button';
import { Label } from 'reka-ui';
import LocationIcon from '@/assets/icons/location.svg';

//接受父组件数据
const props=defineProps<{
    cat:CatListItem
}>();

//状态字典
const statusMap={
    SCHOOL:{label:'在校',color:'bg-green-100 text-green-600',dot:'bg-green-500'},
    GRADUATED:{label:'已毕业',color:'bg-blue-100 text-blue-600',dot:'bg-blue-500'},
    MEOW_STAR:{label:'喵星人',color:'bg-gray-100 text-gray-600',dot:'bg-gray-500'},
    HOSPITAL:{label:'医院',color:'bg-red-100 text-red-600',dot:'bg-red-500'},
}
//计算当前状态标签
const currentStatus=computed(()=>{
    return statusMap[props.cat.status]||statusMap;
});
</script>

<template>
    <div class=" group border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
        <!--图片部分-->
        <div class="relative w-full aspect-[5/4] overflow-hidden bg-gray-100">
          <img :src="props.cat.avatar"  alt="cat" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        </div>
        <!--信息部分-->
        <div class="p-4 flex flex-col gap-3">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-800">
                    {{props.cat.name}}
                    <span class="text-sm font-normal text-gray-400">{{ props.cat.color }}</span>
                </h3>
                <!--状态呼吸灯-->
                <span class="relative flex h-2 w-2 ring-1 ring-offset-2 ring-offset-white ring-gray-300 rounded-full" >

                    <span class="relative inline-flex  rounded-full h-2 w-2" :class="currentStatus.dot"></span>
                </span>

            </div>
            <!--状态标签-->
            <div class="flex justify-between items-center text-sm ">
                <div class="flex items-center text-gray-400 gap-1">
                    <img :src="LocationIcon"  class="w-4 h-4"/>
                    <span>{{props.cat.campus}}</span>


                </div>
                <span class="px-1 py-1 rounded text-xs flex items-end font-medium" :class="currentStatus.color">
                    {{currentStatus.label}}
                </span>
            </div>
            <!--详情按钮-->
            <Button variant="outline" size="sm" class="w-full h-8 rounded-lg mt-2 p-2 bg-primary text-black font-bold text-xs tracking-wider hover:scale-105 hover:bg-primary transition-transform duration-300 ">
                查看详情
            </Button>
        </div>

    </div>
</template>