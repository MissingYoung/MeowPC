<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'vue-sonner';
import { useRouter } from 'vue-router';
import {
    User, IdCard, Phone, Upload, Eye
} from 'lucide-vue-next'
import { CampusMap } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const from = reactive({
    nickname: '',
    campus: '',
    avatar: '',
    wechat: '',
    phone: ''
})

//初始化数据
onMounted(() => {
    const userInfo = userStore.userInfo
    if (userInfo) {
        from.nickname = userInfo.name || ''
        from.campus = userInfo.campus || ''
        from.avatar = userInfo.avatar || ''
        from.wechat = userInfo.contact.wechat || '--'
        from.phone = userInfo.contact.phone || '--'
    }

})

const handleSave = async () => {

    if (!from.nickname || !from.campus) {
        return toast.warning('昵称和校区不能为空')
    }
    if (!from.wechat || !from.phone) {
        return toast.warning('请填写联系方式，没有请填 "---"')
    }
    loading.value = true;
    try {

        const payload = {
            nickname: from.nickname,
            campus: from.campus,
            avatar: from.avatar,
            contact: {
                wechat: from.wechat,
                phone: from.phone
            }
        }
        await userStore.updateProfile(payload)
        toast.success('保存成功')
        setTimeout(() => {
            router.push('/userCenter')
        }, 800)
    } catch (error: any) {
        console.error(error)
        toast.error(error.message || '保存失败，请重试')
    } finally {
        loading.value = false;
    }
}



const campusOptions = Object.entries(CampusMap).map(([k, v]) => ({ value: String(k), label: v }))

const previewCampus = computed(() => {
    const n = Number(from.campus)
    if (!Number.isNaN(n)) return CampusMap[n] || String(from.campus) || '校区'
    return String(from.campus) || '校区'
})

const handleCancel = () => router.back()
const handleUpload = () => {
    //获取到图片 URL 后赋值给 from.avatar
    // 目前仅提供一个提示
    toast.info('图片上传功能暂未实现，请直接粘贴图片 URL')
}


</script>

<template>
    <div class="min-h-full p-6 flex justify-center">

        <div class="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6 items-start">

            <!-- 左侧编辑区域 -->
            <div class="flex flex-col gap-6">

                <!-- 1. 头像设置 -->
                <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div class="flex items-center gap-2 mb-4 text-[#F3B72E] font-bold text-lg">
                        <User class="w-5 h-5 fill-current" />
                        <h2>头像设置</h2>
                    </div>

                    <div class="bg-gray-50 rounded-xl p-6 flex items-center gap-6">
                        <div
                            class="w-20 h-20 rounded-full border-4 border-white shadow-sm overflow-hidden shrink-0 bg-gray-200">
                            <img :src="from.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'"
                                class="w-full h-full object-cover" />
                        </div>
                        <div class="flex-1">
                            <div class="flex gap-3">
                                <Button @click="handleUpload"
                                    class="bg-[#F3B72E] hover:bg-[#E0A82E] text-black font-bold h-9 px-4 rounded-lg text-xs gap-2">
                                    <Upload class="w-4 h-4" /> 上传新头像
                                </Button>
                                <!--手动输入头像链接用于测试 -->
                                <Input v-model="from.avatar" placeholder="或粘贴头像 URL" class="h-9 text-xs bg-white" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 2. 基本信息 -->
                <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div class="flex items-center gap-2 mb-4 text-blue-500 font-bold text-lg">
                        <IdCard class="w-5 h-5" />
                        <h2>基本信息</h2>
                    </div>

                    <div class="space-y-6">
                        <!-- 昵称 -->
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">昵称 <span
                                    class="text-red-500">*</span></label>
                            <Input v-model="from.nickname"
                                class="bg-white border-gray-200 h-11 focus-visible:ring-[#F3B72E] focus-visible:border-transparent"
                                placeholder="请输入昵称" />
                        </div>

                        <!-- 校区  -->
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">校区 <span
                                    class="text-red-500">*</span></label>
                            <Select v-model="from.campus">

                                <SelectTrigger
                                    class="w-full h-11 bg-white border-gray-200 focus:ring-[#F3B72E] focus:ring-2 focus:ring-offset-0">
                                    <SelectValue placeholder="请选择校区" />
                                </SelectTrigger>

                                <!-- 下拉内容 -->
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem v-for="campus in campusOptions" :key="campus.value" :value="campus.value"
                                            class="cursor-pointer">
                                            {{ campus.label }}
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        
                    </div>
                </div>

                

                <!-- 4. 联系方式 (必填) -->
                <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div class="flex items-center gap-2 mb-4 text-orange-500 font-bold text-lg">
                        <Phone class="w-5 h-5" />
                        <h2>联系方式</h2>
                    </div>

                    <div class="space-y-6">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">微信号 <span
                                    class="text-red-500">*</span></label>
                            <Input v-model="from.wechat"
                                class="bg-white border-gray-200 h-11 focus-visible:ring-[#F3B72E] focus-visible:border-transparent"
                                placeholder="请输入微信号" />
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">手机号 <span
                                    class="text-red-500">*</span></label>
                            <Input v-model="from.phone"
                                class="bg-white border-gray-200 h-11 focus-visible:ring-[#F3B72E] focus-visible:border-transparent"
                                placeholder="请输入手机号" />
                        </div>
                    </div>
                </div>

                <!-- 5. 底部操作栏 -->
                <div
                    class="bg-gray-50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-8 w-full justify-between  border border-gray-100">
                    <button @click="handleCancel" :disabled="loading"
                        class=" bg-red-500 hover:bg-red-600 text-sm font-bold text-white hover:text-gray-700 px-4 py-2 rounded-lg">✕
                        取消</button>
                    <Button @click="handleSave" :disabled="loading"
                        class="  bg-[#F3B72E] hover:bg-[#E0A82E] text-white hover:text-black font-bold rounded-lg px-8">
                        {{ loading ? '保存中...' : '💾 保存更改' }}
                    </Button>
                </div>

            </div>

            <!-- 右侧预览  -->
            <div class="flex flex-col gap-6 sticky top-6">
                <div
                    class="w-full bg-[#2A2A2A] text-white rounded-xl p-6 shadow-lg flex flex-col items-center text-center relative overflow-hidden">
                    <div class="absolute left-2 top-2 text-[#F3B72E] opacity-80">
                        <Eye class="w-4 h-4" />
                    </div>
                    <div class="w-20 h-20 rounded-full border-2 border-[#F3B72E] p-1 mb-3">
                        <img :src="from.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'"
                            class="w-full h-full rounded-full object-cover bg-white" />
                    </div>
                    <h3 class="text-xl font-bold mb-1">{{ from.nickname || '你的昵称' }}</h3>
                    <p class="text-xs text-gray-400 mb-3">{{ previewCampus }}</p>
                </div>
            </div>

        </div>
    </div>
</template>