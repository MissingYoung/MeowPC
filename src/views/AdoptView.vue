<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { catApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { toast } from 'vue-sonner';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Home, Building2, School, Users, // 居住图标
    Sprout, PawPrint, HeartHandshake, // 经验图标
    Phone, Mail, MessageCircle, // 联系方式图标
    AlertCircle, CheckCircle2, FileText
} from 'lucide-vue-next'
 


const route = useRoute();
const router = useRouter();
const targetCat = ref<any>(null);
const loading = ref(false);
const submitting = ref(false);

let timer: number | null = null;

const form = ref({
    housing: '',
    experience: '',
    plan: '',
    phone: '',
    wechat: '',
    agreement: false,
})

//选项配置
const housingOptions = [
    { id: 'OWN_HOUSE', label: '自有住房', icon: Home },
    { id: 'RENT_WHOLE', label: '整租/合租', icon: Building2 },
    { id: 'DORM', label: '校内宿舍', icon: School },
    { id: 'WITH_FAMILY', label: '与父母同住', icon: Users },
]

const expOptions = [
    { id: 'NEWBIE', label: '新手', icon: Sprout },
    { id: 'HAS_CATS', label: '有养猫经验', icon: PawPrint },
    { id: 'MULTI_CATS', label: '多猫家庭', icon: HeartHandshake },
]


const fetchTargetCat = async (id: string) => {
    if (!id) return;
    loading.value = true;
    try {
        const data = await catApi.getCatDetail(id);
        targetCat.value = data;
    } catch (e) {
        toast.error("获取猫咪详情失败");
        console.error(e);
    } finally {
        loading.value = false;
    }
}



onMounted(() => {
    const catId = route.query.catId as string;
    fetchTargetCat(catId);
})

watch(
    () => route.query.catId,
    (newCatId) => {
        if (newCatId) {
            fetchTargetCat(newCatId as string);
        }
    }
)

//提交领养申请
const handleSubmit = async () => {
    if (!targetCat.value?.id) return toast.warning('请先选择一只猫咪')
    if (!form.value.housing) return toast.warning('请选择居住情况')
    if (!form.value.experience) return toast.warning('请选择养猫经验')
    if (!form.value.plan || form.value.plan.length < 10) return toast.warning('喂养计划请至少填写10个字')
    if (!/^1[3-9]\d{9}$/.test(form.value.phone)) return toast.warning('请输入有效的11位手机号')
    if (!form.value.wechat) return toast.warning('请输入微信号')
    if (!form.value.agreement) return toast.warning('请同意领养协议')
    submitting.value = true;
    try {
        const payload = {
            catId: targetCat.value.id,
            info: {
                housing: form.value.housing,
                experience: form.value.experience,
                plan: form.value.plan,
            },
            contact: {
                phone: form.value.phone,
                wechat: form.value.wechat,
            }
        }
        console.log('提交领养申请,', payload);
        await catApi.submitAdoption(payload);
        toast.success('领养申请提交成功,请留意后续通知，耐心等待审核');

        timer = setTimeout(() => {
            router.push('/');
        }, 1500);

    } catch (e: any) {
        toast.error(e.message || '领养申请提交失败，请稍后重试');
        console.error(e);
    } finally {
        submitting.value = false;
    }
}

const handleCancel = () => {
    router.back();
}

onUnmounted(() => {
    if (timer) clearTimeout(timer);
});
</script>

<template>
    <div class="min-h-full p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">

        <!-- 顶部 -->
        <div class="bg-gradient-to-r from-[#FFF3E0] to-[#FFE0B2] rounded-2xl p-8 text-center border border-orange-100">
            <h1 class="text-2xl font-bold text-gray-800 mb-2">申请领养</h1>
            <p class="text-gray-500 text-sm">用爱给猫咪一个温暖的家</p>
        </div>

        <div
            class="w-full relative border-b bg-white flex items-center justify-center shadow-sm p-4 rounded-lg my-1/2 z-0 ">

            <!-- 步骤条 -->
            <div class="flex items-center justify-center  mt-6 relative gap-6 max-w-lg mx-auto">
                <div class="absolute top-5 left-0 w-full h-0.5 bg-gray-200 "></div>

                <!-- 步骤 1 (激活) -->
                <div class="flex flex-col items-center  gap-2 bg-white rounded-full p-1 z-10">
                    <div
                        class="w-8 h-8 rounded-full bg-[#F3B72E] text-black font-bold flex items-center justify-center shadow-sm">
                        1</div>
                    <span class="text-xs font-bold text-gray-800">填写资料</span>
                </div>
                <!-- 步骤 2 -->
                <div class="flex-1"></div>
                <div class="flex flex-col items-center gap-2 bg-white rounded-full p-1 z-10">
                    <div
                        class="w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-400 font-bold flex items-center justify-center">
                        2</div>
                    <span class="text-xs text-gray-400">协会审核</span>
                </div>
                <!-- 步骤 3 -->
                <div class="flex-1"></div>
                <div class="flex flex-col items-center gap-2 bg-white rounded-full p-1 z-10">
                    <div
                        class="w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-400 font-bold flex items-center justify-center">
                        3</div>
                    <span class="text-xs text-gray-400">线下面谈</span>
                </div>
                <!-- 步骤 4 -->
                <div class="flex-1"></div>
                <div class="flex flex-col items-center gap-2 bg-white rounded-full p-1 z-10">
                    <div
                        class="w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-400 font-bold flex items-center justify-center">
                        4</div>
                    <span class="text-xs text-gray-400">接猫回家</span>
                </div>
            </div>
        </div>



        <!-- 核心布局 -->
        <div class="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6 items-start">

            <!-- 左侧表单 -->
            <div class="flex flex-col gap-6">

                <!-- 1. 申请对象 -->
                <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4">申请对象</h3>
                    <div v-if="targetCat"
                        class="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-100">
                        <div class="flex items-center gap-4">
                            <img :src="targetCat.avatar"
                                class="w-12 h-12 rounded-full object-cover border border-white shadow-sm" />
                            <div>
                                <div class="font-bold text-gray-800 flex items-center gap-2">
                                    {{ targetCat.name }}
                                    <span class="text-xs font-normal text-gray-500">({{ targetCat.basicInfo?.color ||
                                        '未知' }})</span>
                                </div>
                                <div class="text-xs text-gray-400 mt-0.5">
                                    {{ targetCat.basicInfo?.neutered?.isNeutered ? '已绝育' : '未绝育' }}
                                </div>
                            </div>
                        </div>
                        <span class="bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs font-bold">申请中</span>
                    </div>
                    <div v-else
                        class="bg-gray-50 rounded-lg p-8 text-center text-gray-400 border border-dashed border-gray-200">
                        请先从首页或猫咪详情页选择要领养的猫咪
                    </div>
                </div>

                <!-- 温馨提示 -->
                <div
                    class="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle class="w-5 h-5 shrink-0" />
                    <span>温馨提示：学生宿舍严禁饲养宠物，请确保您有校外稳定住所。</span>
                </div>

                <!-- 2. 居住情况 -->
                <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4">目前的居住情况 <span class="text-red-500">*</span></h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div v-for="opt in housingOptions" :key="opt.id" @click="form.housing = opt.id"
                            class="cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all h-28"
                            :class="form.housing === opt.id ? 'border-[#F3B72E] bg-yellow-50 text-black' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'">
                            <component :is="opt.icon" class="w-6 h-6" />
                            <span class="text-sm font-medium">{{ opt.label }}</span>
                        </div>
                    </div>
                </div>

                <!-- 3. 养猫经验 -->
                <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4">养猫经验 <span class="text-red-500">*</span></h3>
                    <div class="grid grid-cols-3 gap-4">
                        <div v-for="opt in expOptions" :key="opt.id" @click="form.experience = opt.id"
                            class="cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all h-28 relative overflow-hidden"
                            :class="form.experience === opt.id ? 'border-[#F3B72E] bg-yellow-50 text-black' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'">
                            <component :is="opt.icon" class="w-6 h-6" />
                            <span class="text-sm font-medium">{{ opt.label }}</span>
                            <div v-if="form.experience === opt.id" class="absolute top-0 right-0">
                                <div
                                    class="w-0 h-0 border-t-[24px] border-l-[24px] border-t-[#F3B72E] border-l-transparent">
                                </div>
                                <CheckCircle2 class="w-3 h-3 text-white absolute top-0.5 right-0.5" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4. 申请理由 -->
                <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4">喂养计划 & 经济状况 <span class="text-red-500">*</span></h3>
                    <Textarea v-model="form.plan"
                        class="min-h-[120px] bg-gray-50 border-gray-200 focus-visible:ring-[#F3B72E] resize-none"
                        placeholder="请详细描述您的经济状况、封窗计划以及对猫咪的喂养安排..." />
                </div>

                <!-- 5. 联系方式  -->
                <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4">联系方式 <span class="text-red-500">*</span></h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <!-- 手机号 -->
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Phone class="w-4 h-4 text-gray-400" /> 手机号码
                            </label>
                            <Input v-model="form.phone"
                                class="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#F3B72E]"
                                placeholder="请输入11位手机号" />
                        </div>

                        <!-- 微信号 -->
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <MessageCircle class="w-4 h-4 text-gray-400" /> 微信号码
                            </label>
                            <Input v-model="form.wechat"
                                class="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#F3B72E]"
                                placeholder="用于添加好友沟通" />
                        </div>

                    </div>
                </div>

                <!-- 6. 协议 -->
                <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div class="flex items-start space-x-2 mb-6">
                        <Checkbox id="terms" v-model="form.agreement" />
                        <label for="terms" class="text-xs text-gray-500 leading-none cursor-pointer pt-0.5">
                            我已阅读并同意 <span class="text-[#F3B72E] underline">《山大猫协领养协议》</span>，承诺科学喂养，绝不遗弃。
                        </label>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-8 w-full justify-between  border border-gray-100 ">
                        <Button
                            class="bg-[#F3B72E] hover:bg-[#e0a82e] text-black font-bold h-12 px-8 rounded-xl text-base shadow-md disabled:opacity-70"
                            @click="handleSubmit" :disabled="submitting">
                            {{ submitting ? '提交中...' : '提交申请' }}
                        </Button>
                        <Button class="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold h-12 px-8 rounded-xl text-base"
                            @click="handleCancel" :disabled="submitting">
                            取消
                        </Button>   
                    </div>
                </div>

            </div>

            <!-- 右侧信息栏  -->
            <div class="flex flex-col gap-6 sticky top-6">

                <!-- 1. 领养信息 -->
                <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">领养信息</h3>

                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">猫咪名字</span>
                            <span class="font-medium">{{ targetCat?.name || '-' }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">花色</span>
                            <span class="font-medium">{{ targetCat?.basicInfo?.color || '-' }}</span>
                        </div>

                        <div class="flex justify-between">
                            <span class="text-gray-400">性别</span>
                            <span class="font-medium">{{ targetCat?.basicInfo?.gender === 'MALE' ? '公' : '母' }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">绝育状态</span>
                            <span class="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                {{ targetCat?.basicInfo?.neutered?.isNeutered ? '已绝育' : '未绝育' }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">健康状态</span>
                            <span class="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">
                                {{ targetCat?.basicInfo?.healthStatus === 'HEALTHY' ? '健康' : '未知' }}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">常驻地点</span>
                            <span class="font-medium text-right">{{ targetCat?.basicInfo?.hauntLocation || '-' }}</span>
                        </div>
                    </div>
                </div>

                <!-- 2. 领养须知 -->
                <div class="bg-[#FFF9E6] rounded-xl p-5 border border-[#FFE8A3]">
                    <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FileText class="w-4 h-4 text-[#F3B72E]" /> 领养须知
                    </h3>
                    <ul class="space-y-2 text-xs text-gray-600">
                        <li class="flex gap-2">
                            <CheckCircle2 class="w-3 h-3 text-orange-400 shrink-0 mt-0.5" /> 有校外稳定住所
                        </li>
                        <li class="flex gap-2">
                            <CheckCircle2 class="w-3 h-3 text-orange-400 shrink-0 mt-0.5" /> 有经济能力承担
                        </li>
                        <li class="flex gap-2">
                            <CheckCircle2 class="w-3 h-3 text-orange-400 shrink-0 mt-0.5" /> 承诺不离不弃
                        </li>
                        <li class="flex gap-2">
                            <CheckCircle2 class="w-3 h-3 text-orange-400 shrink-0 mt-0.5" /> 接受定期回访
                        </li>
                    </ul>
                </div>

                <!-- 3. 联系方式 -->
                <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4">联系方式</h3>
                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                <Phone class="w-4 h-4" />
                            </div>
                            <div>
                                <div class="text-xs text-gray-400">咨询电话</div>
                                <div class="text-sm font-bold">0531-8888888</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div
                                class="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                                <MessageCircle class="w-4 h-4" />
                            </div>
                            <div>
                                <div class="text-xs text-gray-400">官方微信</div>
                                <div class="text-sm font-bold">SDUCat</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div
                                class="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                                <Mail class="w-4 h-4" />
                            </div>
                            <div>
                                <div class="text-xs text-gray-400">电子邮箱</div>
                                <div class="text-sm font-bold">SDUMeow@sdu.edu.cn</div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    </div>
</template>