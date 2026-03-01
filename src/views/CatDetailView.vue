<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { catApi, momentApi } from '@/lib/api';
import { useRoute, useRouter } from 'vue-router';
import MomentCard from '@/components/MomentCard.vue';
import { Button } from '@/components/ui/button';
import { toast } from 'vue-sonner';
import type { CatDetail } from '@/types';

import { MapPin, Calendar, Tag } from 'lucide-vue-next'
import warningIcon from '@/assets/icons/warning.svg'

const route = useRoute();
const momentList = ref<any[]>([]);
const router = useRouter();
//数据
const catDetail = ref<CatDetail | null>(null);
const catId = route.params.id as string;
const loading = ref(true);

const loadingMoments = ref(false)

//颜色和状态标签
const statusMap = {
    SCHOOL: { label: '在校', color: 'bg-green-100 text-green-600', dot: 'bg-green-500' },
    GRADUATED: { label: '已毕业', color: 'bg-blue-100 text-blue-600', dot: 'bg-blue-500' },
    MEOW_STAR: { label: '喵星', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-500' },
    HOSPITAL: { label: '医院', color: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
}

//计算当前状态标签函数
const currentStatus = computed(() => {
    if (!catDetail.value) return { label: '未知', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-500' };
    return statusMap[catDetail.value.basicInfo.status] || statusMap;
});

//计算指数标签函数
const displayAttributes = computed(() => [
    {
        label: '亲人指数',
        value: catDetail.value?.attributes.friendliness || 0,
        colorClasss: 'bg-blue-400'
    },
    {
        label: '贪吃指数',
        value: catDetail.value?.attributes.gluttony || 0,
        colorClasss: 'bg-yellow-400'

    },
    {
        label: '战斗力',
        value: catDetail.value?.attributes.fight || 0,
        colorClasss: 'bg-red-400'
    },
    {
        label: '颜值',
        value: catDetail.value?.attributes.appearance || 0,
        colorClasss: 'bg-green-400',

    }
])

const fetchCatDetail = async () => {
    console.log('开始请求猫咪详情...')
    loading.value = true;
    try {
        const data = await catApi.getCatDetail(catId);
        console.log('请求成功，拿到数据:', data);
        if (data) {
            catDetail.value = data;
        }
    } catch (error) {
        console.error('请求猫咪详情失败:', error);
    } finally {
        loading.value = false;
    }
}

const fetchMoments = async () => {
    if (!catId) return;
    loadingMoments.value = true;
    try {
        const res = await momentApi.getMoments({
            page: 1,
            pageSize: 20,
            catId: catId
        })
        if (res && Array.isArray(res.items)) {
            momentList.value = res.items
        } else if (Array.isArray(res)) {
            momentList.value = res

        } else {
            momentList.value = []
            console.warn('未找到动态数据')
        }
    }
    catch (error) {
        console.error('请求动态列表失败:', error)
        toast.error('获取动态列表失败，请稍后再试')
        momentList.value = []
    } finally {
        loadingMoments.value = false;
    }
}
onMounted(() => {
    fetchCatDetail();
    fetchMoments();
});

</script>

<template>
    <div class="flex flex-col  w-full min-h-full ">
        <div class="grid grid-cols-1 lg:grid-cols-[3.7fr_1fr] gap-6 items-start overflow-hidden">
            <div v-if="loading" class="p-10 text-center text-gray-400">
                <div class="animate-spin text-4xl mb-3">🌀</div>
                正在赶来喵...🐱
            </div>
            <div v-else-if="!catDetail" class="p-10 text-center text-red-500">
                <div class="text-4xl mb-3">❌</div>
                抱歉，找不到了喵😿。
            </div>
            <!--详情内容-->
            <div v-else class="flex flex-col lg:flex-col rounded-lg shadow-md md:flex-row ">
                <div class="relative w-full aspect-[2.5/1] bg-gray-100 overflow-hidden">
                    <img :src="catDetail.images[0] || catDetail.avatar" alt="Cat Image"
                        class="w-full p-0 h-max-[300px] object-contain rounded-lg shadow-md" />
                </div>
                <div
                    class="flex items-start relative bg-slate-50 gap-3 px-2 py-4 rounded-lg border border-b border-gray-200 shadow-sm">
                    <div v-for="(image, index) in catDetail.images" :key="index"
                        class="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                        <img :src="image" alt="Cat Image" class="w-full h-full object-cover" />
                    </div>
                </div>
                <div
                    class="flex flex-col mt-3 w-full  border border-b border-gray-200 bg-slate-50 shadow-sm rounded-lg ">
                    <div class="py-4 flex flex-auto  items-cneter">
                        <h3 class="text-xl font-bold  text-black px-3">{{ catDetail.name }}</h3>
                        <span class="flex  items-cneter justify-center mt-1  shadow-sm rounded-md border  w-5.9 h-6 "
                            :class="catDetail.basicInfo.gender === 'MALE' ? 'text-blue-600 bg-blue-100' : 'text-pink-600 bg-pink-100'">
                            {{
                                catDetail.basicInfo.gender === 'MALE' ? '♂ ' : '♀ ' }}

                        </span>
                        <span v-if="catDetail.aliases.length"
                            class="ml-auto mr-3 text-xl font-medium text-[#0288D1] w-fit px-2 bg-[#E1F5FE] shadow-sm border rounded-md ">
                            ({{ catDetail.aliases.join(', ') }})
                        </span>
                    </div>
                    <span class="px-2 py-1 w-fit ml-3 -mt-2 rounded-full text-sm font-bold text-gray-300 shadow-sm"
                        :class="currentStatus.color">
                        {{ currentStatus.label }}
                    </span>
                    <div class="grid grid-cols-2 gap-6 main-w-full text-lg bg-white text-gray-700 mr-3 mt-4 mb-4 ml-3">
                        <div
                            class="flex flex-col rounded-xl border-2 p-3 gap-2  bg-gray-100 shadow-md border-purple-400">
                            <span class="text-xs text-gray-500 ">学历/编制</span>
                            <span class="font-bold ">{{ catDetail.basicInfo.role }}</span>
                        </div>
                        <div
                            class="flex flex-col rounded-xl border-2 p-3 gap-2  bg-gray-100 shadow-md border-purple-400 ">
                            <span class="text-xs text-gray-500 ">常驻地点</span>
                            <span class="font-bold ">{{ catDetail.basicInfo.huntLocation }}</span>
                        </div>
                        <div
                            class="flex flex-col rounded-xl border-2 p-3 gap-2  bg-gray-100 shadow-md border-purple-400 ">
                            <span class="text-xs text-gray-500 ">入园时间</span>
                            <span class="font-bold ">{{ catDetail.basicInfo.admissionDate }}</span>
                        </div>
                        <div
                            class="flex flex-col rounded-xl border-2 p-3 gap-2  bg-gray-100 shadow-md border-purple-400 ">
                            <span class="text-xs text-gray-500 ">性格特点</span>
                            <span class="font-bold ">{{ catDetail.tags }}</span>
                        </div>
                    </div>
                </div>
                <div
                    class="flex flex-col mt-3 mb-2 w-full  border border-b border-gray-200 bg-slate-50 shadow-sm rounded-lg">
                    <h4 class="flex items-center justify-between p-3 mt-2 text-black font-bold text-lg ">猫格属性</h4>
                    <div class="space-y-5 p-3 mt-2">
                        <div v-for="(item, index) in displayAttributes" :key="index" class="flex items-center gap-4">
                            <span class="text-sm font-medium text-gray-600 w-20 shrink-0">
                                {{ item.label }}
                            </span>
                            <!--进度条-->
                            <div class="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div class="h-full rounded-full transition-all duration-500 ease-out"
                                    :class="item.colorClasss" :style="{ width: (item.value * 10) + '%' }">
                                </div>
                            </div>
                            <!--右侧数值-->
                            <span class="text-sm font-bold text-gray-500 w-8 text-tight shrink-0">
                                {{ item.value.toFixed(1) }}
                            </span>
                        </div>

                    </div>
                    <div
                        class="flex items-center main-w text-sm font-bold border-2 border-[#FFCDD2] bg-[#FFEBEE] text-[#C62828] text-right rounded-lg h-fit mt-2 ml-3 mr-3 mb-4 p-2">
                        <img :src="warningIcon" alt="warning" class="gap-2 h-3 w-3 mr-2">
                        <span>{{ catDetail.description }}</span>

                    </div>



                </div>
                <!-- 最新动态区域  -->
                <div class="w-full max-w-6xl">

                    <!-- 标题栏 -->
                    <div class="flex items-center justify-between mb-6 px-2">
                        <h2 class="text-2xl font-bold text-gray-800 border-l-4 border-[#F3B72E] pl-3">
                            最新动态
                        </h2>
                    </div>

                    <!-- Loading -->
                    <div v-if="loadingMoments" class="py-12 text-center text-gray-400">
                        <div class="animate-spin text-2xl mb-2">🌀</div>
                        加载动态中...
                    </div>

                    <!-- 空状态 (No Data) -->
                    <div v-else-if="momentList.length === 0"
                        class="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-4">
                            🛋️
                        </div>
                        <h3 class="text-lg font-bold text-gray-600">暂无动态</h3>
                        <p class="text-sm text-gray-400 mb-6">这里空空如也，快去抢沙发吧！</p>
                    </div>

                    <!-- 动态列表 (瀑布流/网格) -->
                    <!-- 使用 Masonry 或者简单的 columns 布局 -->
                    <div v-else class="columns-1  gap-6 space-y-6 break-inside-avoid mb-6">
                        <!-- 
           class="break-inside-avoid": 防止卡片被瀑布流切断 
           
        -->
                        <div v-for="item in momentList" :key="item.id" class="break-inside-avoid mb-6">
                            <MomentCard :data="item" />
                        </div>
                    </div>

                </div>
            </div>





            <aside class="flex flex-col gap-6">
                <div class="w-full h-screen rounded-sm z-10 border border-b bg-white p-4  justify-between max-w-sm">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full ">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">详细信息</h3>
                        <div v-if="catDetail" class="divide-y divide-gray-300 divide-solid">
                            <div class="py-4 flex justify-between">
                                <span class="text-gray-600">花色:</span>
                                <span class="font-sm text-gray-800">{{ catDetail.basicInfo.color }}</span>
                            </div>
                            <div class="py-4 flex justify-between">
                                <span class="text-gray-600">绝育状态:</span>
                                <span class="font-sm text-gray-800">{{ catDetail.basicInfo.neutered ? '已绝育' : '未绝育'
                                }}</span>
                            </div>
                            <div class="py-4 flex justify-between">
                                <span class="text-gray-600">健康状况:</span>
                                <span class="font-sm text-gray-800">{{ catDetail.basicInfo.healthStatus }}</span>
                            </div>
                        </div>

                    </div>
                    <div class="flex justify-end mt-4">
                        <Button
                            class="flex-1 h-12 text-lg font-bold bg-[#F3B72E] hover:bg-[#e0a82e] text-black shadow-md rounded-xl"
                            @click="$router.push({ name: 'adopt', query: { catId: catDetail?.id } })">
                            <span class="mr-2"></span> 申请领养此猫
                        </Button>

                    </div>
                </div>
            </aside>
        </div>

    </div>
</template>