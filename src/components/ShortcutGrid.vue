<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { ShortcutItem } from '@/types';
import iconCup from '@/assets/icons/cup.svg';
import iconSOS from '@/assets/icons/sos.svg';

const router = useRouter();
//配置卡片数据
const shortcuts: ShortcutItem[] = [
    {
        id: 1,
        title: '封神榜',
        desc: '人气喵咪排行',
        path: '/ranking/popularity',
        iconColor: '',
        bgColor: '',
        iconPath: iconCup,
    },
    {
        id: 2,
        title: '紧急SOS',
        desc: '伤病快速上报',
        path: '/sos',
        iconColor: '',
        bgColor: '',
        iconPath: iconSOS,
    },
]

//跳转函数
const handleShortcutClick = (path: string) => {
    router.push(path);
};
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <div v-for="item in shortcuts" :key="item.id" @click="handleShortcutClick(item.path)" class="bg-white rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer
        border-2 border-white shadow-sm hover:border-yellow-400 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <!--圆形图标容器-->
            <div class="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                :class="[item.bgColor, item.iconColor]">
                <img :src="item.iconPath" :alt="item.path" class="w-12 h-12">
            </div>
            <!--标题-->
            <h3 class="text-base font-semibold text-gray-800 mb-2">{{ item.title }}</h3>
            <!--描述-->
            <p class="text-xs text-gray-500 text-center">{{ item.desc }}</p>
        </div>

    </div>
</template>