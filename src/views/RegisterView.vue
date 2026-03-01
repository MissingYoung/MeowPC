<script setup lang="ts">
import { ref, } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { userApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'vue-sonner';
import logo from '@/assets/icons/logo.svg';
const router = useRouter();
const userStore = useUserStore();

const form = ref({
    studentId: '',
    code: '',
    password: '',
    confirmPassword: '',
});

const loading = ref(false);

//验证码时许逻辑
const countdown = ref(0);
const isSendingCode = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

const handleSendCode = async () => {
    const cleanStudentId = form.value.studentId.replace(/\s/g, '');
    form.value.studentId = cleanStudentId;

    if (!/^\d{12}$/.test(cleanStudentId)) {
        toast.warning('请输入有效的12位学号');
        return;
    }
    //构造邮箱
    const email = `${cleanStudentId}@mail.sdu.edu.cn`;
    try {
        isSendingCode.value = true;
        await userApi.sendVerificationCode(email);
        toast.success('验证码已发送，请查收山大邮箱');
        countdown.value = 60;
        timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
                if (timer) clearInterval(timer);
            }
        }, 1000)
    } catch (error: any) {
        toast.error(error.message || '验证码发送失败，请稍后再试');
        console.error('发送验证码错误:', error);
    } finally {
        isSendingCode.value = false;
    }
}

const handleRegister = async () => {
    //数据清理
    const cleanStudentId = form.value.studentId.replace(/\s/g, '');
    form.value.studentId = cleanStudentId;
    //基本验证
    if (!form.value.studentId || !form.value.code || !form.value.password || !form.value.confirmPassword) {
        toast.warning('请输入完整的注册信息');
        return;
    }
    //学号格式验证
    const studentIdPattern = /^\d{12}$/;
    if (!studentIdPattern.test(form.value.studentId)) {
        toast.warning('学号格式不正确，请输入12位纯数字');
        return;
    }
    //密码长度验证
    if (form.value.password.length < 6) {
        toast.warning('密码长度不能少于6位');
        return;
    }
    //确认密码验证
    if (form.value.password !== form.value.confirmPassword) {
        toast.warning('两次输入的密码不一致');
        return;
    }

    loading.value = true;
    try {
        const payload = {
            email: `${cleanStudentId}@mail.sdu.edu.cn`,
            password: form.value.password,
            code: form.value.code
        }
        console.log('注册请求参数:', payload);
        await userApi.register(payload);
        await userStore.login({ email: `${cleanStudentId}@mail.sdu.edu.cn`, password: form.value.password });
        toast.success('注册成功');
        router.push('/');
    } catch (error: any) {
        toast.error('注册失败');
        const msg = error.message || '注册失败，请稍后再试';
        toast.error(msg);
        console.error('注册错误:', error);
    } finally {
        loading.value = false;
    }


}
const goLogin = () => {
    router.push('/login');
};

const showPassword = ref(false);
const showConfirmPassword = ref(false);
</script>
<template>
    <div
        class="w-[400px] mx-auto mt-12 flex-col items-center  justify-between   border-b rounded-[10px] shadow-lg bg-slate-100">
        <div class="w-full h-fit bg-[#F5F5F5] flex flex-col items-center justify-center rounded-[20px] p-6 font-sans">

            <!-- Logo -->
            <div class="mb-8 flex flex-col items-center animate-fade-in-up">
                <div class="mb-8 flex flex-col items-center ">
                    <img :src="logo" alt="logo"
                        class="w-24 h-24 flex items-center justify-center   ml-2.5 mt-2.2 rounded-[10px]">
                </div>
                <h1 class="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">SDU 邮箱认证</h1>
                <p class="text-gray-400 text-sm">使用山大邮箱开启奇妙旅程</p>
            </div>

            <!-- 注册卡片 -->
            <!-- 输入框组 -->
            <div class="space-y-5">

                <!-- 1. 学号输入 (保持风格统一) -->
                <div
                    class="group bg-gray-50 rounded-2xl p-1 flex items-center border border-transparent focus-within:border-[#F3B72E]/50 focus-within:bg-white focus-within:shadow-sm transition-all duration-300">
                    <Input v-model="form.studentId" placeholder="请输入12位学号"
                        class="h-12 flex-1 border-none bg-transparent shadow-none text-base placeholder:text-gray-400 focus-visible:ring-0 pl-4 min-w-0" />
                    <span class="text-xs text-gray-400 pr-4 shrink-0 select-none font-medium">@mail.sdu.edu.cn</span>
                </div>

                <!-- 2. 验证码输入 (优化布局：左侧验证码，右侧输入框) -->
                <div class="flex gap-3">
                    <!-- 发送按钮 -->
                    <Button variant="ghost"
                        class="h-[58px] px-0 w-[110px] rounded-2xl bg-gray-50 border border-transparent hover:bg-yellow-50 hover:text-[#F3B72E] text-gray-500 font-medium disabled:bg-gray-50 disabled:text-gray-300 transition-all"
                        @click="handleSendCode" :disabled="isSendingCode || countdown > 0">
                        <span v-if="isSendingCode">发送中</span>
                        <span v-else-if="countdown > 0">{{ countdown }}s</span>
                        <span v-else>获取验证码</span>
                    </Button>

                    <!-- 输入框 -->
                    <div
                        class="flex-1 bg-gray-50 rounded-2xl p-1 border border-transparent focus-within:border-[#F3B72E]/50 focus-within:bg-white focus-within:shadow-sm transition-all duration-300">
                        <Input v-model="form.code" placeholder="6位验证码"
                            class="h-12 border-none bg-transparent shadow-none text-base placeholder:text-gray-400 focus-visible:ring-0 pl-4 text-center tracking-widest" />
                    </div>
                </div>

                <!-- 3. 密码输入  -->
                <div
                    class="bg-gray-50 rounded-2xl p-1 flex items-center border border-transparent focus-within:border-[#F3B72E]/50 focus-within:bg-white focus-within:shadow-sm transition-all duration-300 relative">
                    <Input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="设置密码 (不少于6位)"
                        class="h-12 flex-1 border-none bg-transparent shadow-none text-base placeholder:text-gray-400 focus-visible:ring-0 pl-4 pr-10" />
                    <!-- 小眼睛图标按钮 -->
                    <button type="button" @click="showPassword = !showPassword"
                        class="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none p-1">
                        <!-- 睁眼 -->
                        <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        <!-- 闭眼 -->
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" x2="22" y1="2" y2="22" />
                        </svg>
                    </button>
                </div>

                <!-- 4. 确认密码  -->
                <div
                    class="bg-gray-50 rounded-2xl p-1 flex items-center border border-transparent focus-within:border-[#F3B72E]/50 focus-within:bg-white focus-within:shadow-sm transition-all duration-300 relative">
                    <Input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                        placeholder="再次确认密码"
                        class="h-12 flex-1 border-none bg-transparent shadow-none text-base placeholder:text-gray-400 focus-visible:ring-0 pl-4 pr-10"
                        @keyup.enter="handleRegister" />
                    <!-- 小眼睛图标按钮 -->
                    <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                        class="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none p-1">
                        <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" x2="22" y1="2" y2="22" />
                        </svg>
                    </button>
                </div>
                <!-- 注册按钮 -->
                <Button @click="handleRegister"
                    class="w-full mt-6 bg-[#1E1E1E] hover:bg-black text-white text-lg font-bold shadow-lg rounded-full transition-transform active:scale-95"
                    :disabled="loading">
                    {{ loading ? '注册中...' : '注册' }}
                </Button>

            </div>
            <div class="flex items-center justify-center">
                <!-- 底部 -->
                <div class="mt-8 flex gap-4 text-sm text-gray-400 ">
                    <span>已有账号？</span>
                    <span
                        class="cursor-pointer text-gray-600 font-bold hover:text-black transition-colors underline decoration-[#F3B72E]"
                        @click="goLogin">
                        去登录
                    </span>
                </div>

            </div>
        </div>
    </div>
</template>