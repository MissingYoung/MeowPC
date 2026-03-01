<script setup lang="ts">
import {computed}from 'vue';
import type { CatListItem } from '@/types';
import {Button} from './ui/button';
import LocationIcon from '@/assets/icons/location.svg';
import { useRouter } from 'vue-router';

const router=useRouter();

//接受父组件数据
const props=defineProps<{
    cat:CatListItem
}>();

//状态字典 - 支持中英文两种格式
const statusMap: Record<string, {label: string; color: string; dot: string; ringColor: string}> = {
    // 英文格式
    SCHOOL:{label:'在校',color:'bg-green-100 text-green-600',dot:'bg-green-500',ringColor:'ring-green-300'},
    GRADUATED:{label:'已毕业',color:'bg-blue-100 text-blue-600',dot:'bg-blue-500',ringColor:'ring-blue-300'},
    MEOW_STAR:{label:'喵星人',color:'bg-purple-100 text-purple-600',dot:'bg-purple-500',ringColor:'ring-purple-300'},
    HOSPITAL:{label:'医院',color:'bg-red-100 text-red-600',dot:'bg-red-500',ringColor:'ring-red-300'},
    // 中文格式
    '在校':{label:'在校',color:'bg-green-100 text-green-600',dot:'bg-green-500',ringColor:'ring-green-300'},
    '毕业':{label:'已毕业',color:'bg-blue-100 text-blue-600',dot:'bg-blue-500',ringColor:'ring-blue-300'},
    '喵星人':{label:'喵星人',color:'bg-purple-100 text-purple-600',dot:'bg-purple-500',ringColor:'ring-purple-300'},
    '医院':{label:'医院',color:'bg-red-100 text-red-600',dot:'bg-red-500',ringColor:'ring-red-300'},
}

const defaultStatus={label:'未知',color:'bg-gray-100 text-gray-600',dot:'bg-gray-500',ringColor:'ring-gray-300'};

//计算当前状态标签
const currentStatus=computed(()=>{
    const status = props.cat.status || props.cat?.status;
    return statusMap[status as string] || defaultStatus;

});

//点击详情
const goToDetail=()=>{
    router.push({name:'cat-detail',params:{id:props.cat.id}});
}
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
                <span class="relative flex h-3 w-3 ring-1 ring-offset-2 ring-offset-white rounded-full" :class="currentStatus.ringColor">
                    <span class="animate-pulse relative inline-flex rounded-full h-3 w-3" :class="currentStatus.dot"></span>
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
            <Button variant="outline" size="sm" class="w-full h-8 rounded-lg mt-2 p-2 bg-primary text-black font-bold text-xs tracking-wider hover:scale-105 hover:bg-primary transition-transform duration-300 "
            @click="goToDetail">
                查看详情
            </Button>
        </div>

    </div>
</template>