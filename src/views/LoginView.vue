<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'vue-sonner';

import logo from '@/assets/icons/logo.svg'


const router = useRouter()
const userStore = useUserStore()

const form = ref({
    email: '',
    password: '',
})

const loading = ref(false)

const handleLogin = async () => {
    if (!form.value.email || !form.value.password) {
        toast.warning('请输入邮箱和密码')
        loading.value = true;
    } try {
        await userStore.login(form.value)
        toast.success('登录成功')
        router.push('/')
    } catch (error: any) {
        console.error(error)
        toast.error(error.message || '登录失败，请重试')

    } finally {
        loading.value = false;
    }

}

//访客登录
const goVisitor = () => {
    router.push('/')
}
//注册
const goRegister = () => {
    router.push('/register')
}
</script>

<template>
    <div class="w-80 mx-auto mt-12  flex-col    border-b  rounded-[10px] shadow-lg bg-slate-100">
        <div class=" w-50 bg-[#F5F5F5] flex flex-col items-center justify-center p-6 rounded-[10px] font-sans">
            <div class="mb-8 flex flex-col items-center ">
                <img :src="logo" alt="logo"
                    class="w-24 h-24 flex items-center justify-center   ml-2.5 mt-2.2 rounded-[10px]">
            </div>

            <h1 class="text-3xl font-extrabold text-gray-900 mb-2 ml-4 tracking-tight flex items-center">Hello,校友！</h1>
            <p class="text-gray-400 text-sm flex items-center">欢迎回到山大猫猫图鉴</p>
        </div>

        <!--登录表单-->
        <div class="flex items-center justify-center">
            <div class="w-full max-w-sm  bg-white rounded-lg shadow-xl p-8 ">
                <!--输入框-->
                <div class="space-y-4">
                    <div class="bg-gray-50 rounded-2xl p-1">
                        <Input v-model="form.email" placeholder="请输入山大邮箱"
                            class="flex auto bg-transparent text-base shadow-none placeholder:text-gray-400 focus-visible:ring-0" />
                    </div>
                    <div class="bg-gray-50 rounded-2xl p-1">
                        <Input v-model="form.password" placeholder="请输入密码"
                            class="flex auto bg-transparent text-base shadow-none placeholder:text-gray-400 focus-visible:ring-0" />
                    </div>
                </div>
                <!--登录按钮-->
                <Button
                    class="w-full mt-6 bg-[#1E1E1E] hover:bg-black text-white text-lg font-bold rounded-full shadow-lg transition-transform active:scale-95"
                    @click="handleLogin" :disabled="loading">
                    {{ loading ? '登录中...' : '登录' }}
                </Button>
                <div class="text-center text-xs text-gray-300 mt-2">SDU Meow</div>



                <!--底部链接-->
                <div class="mt-8 flex  items-center justify-center gap-4 text-sm text-gray-400">
                    <span class="cursor-pointer hover:text-gray-600 transition-colors " @click="goVisitor">游客登录</span>
                    <span>|</span>
                    <span class="cursor-pointer hover:text-gray-600 transition-colors">忘记密码</span>
                </div>
                <div class="mt-2 flex items-center justify-center text-sm text-gray-400">
                    <span>没有账号？</span>
                    <span class="ml-1 cursor-pointer hover:text-gray-600 transition-colors"
                        @click="goRegister">立即注册</span>
                </div>
            </div>
        </div>

    </div>
</template>