<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Button } from '../ui/button';
</script>

<template>
    <header
        class="h-[64px] w-full bg-meow-bg flex items-center  px-6 border-b border-gray-200 sticky top-0 z-10 grid grid-cols-3 ">
        <div class="flex items-center text-sm text-gray-500 tracking-wider">
            <span class="hover:text-primary cursor-pointer transition-colors">SDU Meow</span>
            <span class="mx-2 text-gray-300">></span>
            <span class="font-bold text-gray-900">首页</span>
        </div>
        <!-- 搜索框 -->
        <div class="flex justify-center w-full group">
            <div class="relative w-full max-w-[500px] group">
                <span
                    class="absolute left-3 top-1/2 -translate-y-1/2  w-[16px] h-[16px] opacity-50 group-focus-within:opacity-100 transition-opacity">
                    <img src="@/assets/icons/search.svg" alt="search" />
                </span>
                <Input class="pl-10 h-10 w-full rounded-full
                     bg-gray-200 border-transparent
                      focus-visible:bg-white focus-visible:ring-2
                       focus-visible:ring-primary focus-visible:ring-offset-2
                        focus-visible:border-transparent
                       
                       placeholder:text-gray-400 text-sm transition-all" placeholder="搜索猫咪花名，花色或出没地点..." />
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