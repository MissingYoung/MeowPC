<script setup lang="ts">
 
import { useRoute } from 'vue-router';
import type { MenuItem } from '@/types';
import {cn} from '@/lib/utils'
import logo from '@/assets/icons/logo.svg'
import iconHome from '@/assets/icons/home.svg'
import iconPost from '@/assets/icons/post.svg'
import iconAdopt from '@/assets/icons/adopt.svg'
import iconIndividual from '@/assets/icons/individual.svg'
import iconSettings from '@/assets/icons/settings.svg'

const route = useRoute();
const menuItems: MenuItem[] = [
  { name: '首页', path: '/', icon: iconHome },
  { name: '发布动态', path: '/post', icon: iconPost },
  { name: '领养申请', path: '/adopt', icon: iconAdopt },
  { name: '个人中心', path: '/userCenter', icon: iconIndividual },
  { name: '系统设置', path: '/settings', icon: iconSettings },
];
</script>

<template>
    <aside class="w-[220px] h-screen bg-meow-dark text-white flex flex-col shadow-xl z-20 overflow-hidden">
        <!--LOGO-->
        <div class="h-20 flex items-center px-4 border-b border-white/10 shrink-0">
            <img :src="logo" alt="logo" class="w-10 h-10 ml-2.5 mt-2.2 rounded-[10px]">
           <div class="flex flex-col justify-center items-start">
             <h1 class="text-[18px] font-bold tracking-wider ml-3 leading-1">SDU Meow</h1>
            <span class="text-[13px] text-gray-400 ml-3 font-medium leading-1 tracking-wider">山大猫猫图鉴</span> 
            
           </div>
        </div>
        
        <!--菜单-->
        <nav class="flex-1 w-full pt-6 space-y-3">
            <router-link
                v-for="item in menuItems"
                :key="item.path"
                :to="item.path"
                :class="cn(
                    'flex items-center w-[200px] h-[46px] rounded-lg ml-[10px]  px-3 mb-2 group ',
                    // 默认状态：灰色文字，鼠标悬停变淡白背景
                    'text-gray-400 hover:bg-white/5 hover:text-white',
                    // 选中状态 (Active)：背景变成 primary (黄色)，文字变黑，加粗
                    route.path===item.path&&'bg-primary text-black font-bold shadow-md'
                )"
                >
                <img :src="item.icon" alt="icon" class="w-5 h-5 mr-3 shrink-0" 
                :class="cn(route.path===item.path?'brightness-0':'brightness-0 invert opacity-50 group-hover:opacity-100')"/>
                <span>{{ item.name }}</span>
            </router-link>
        </nav>
        <!--底部用户信息-->
        
    </aside>

</template>
