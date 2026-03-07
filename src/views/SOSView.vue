<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { sosApi, catApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'vue-sonner'
import { Ambulance, MapPin, Camera, AlertTriangle, Search, X } from 'lucide-vue-next'
import type { CatListItem } from '@/types'
import { CampusMap } from '@/types'

const router = useRouter()
const route = useRoute()

// --- 数据状态 ---
const loading = ref(false)
const symptomTags = ref<string[]>([]) // 后端返回的症状列表
const catList = ref<CatListItem[]>([]) // 猫咪列表
const catLoading = ref(false)
const catSearchQuery = ref('')
const isCatDialogOpen = ref(false)
const fileInputRef = ref<HTMLInputElement>()

// 表单数据
const form = ref({
  catId: '',
  selectedCat: null as CatListItem | null,
  campus: null as number | null, // ✨ 初始为 null（未选择）
  location: '',
  symptoms: [] as string[],
  description: '',
  media: [] as string[]
})

// 生成校区选项列表（key 为数字，label 为校区名称）
const campusOptions = Object.entries(CampusMap).map(([key, label]) => ({
  value: Number(key) as number,
  label: label
}))

// 获取猫咪列表
const fetchCatList = async () => {
  catLoading.value = true
  try {
    const res = await catApi.getCatList({ page: 1, pageSize: 1000 })
    catList.value = Array.isArray(res) ? res : (res?.items || [])
  } catch (e) {
    console.error(e)
  } finally {
    catLoading.value = false
  }
}

// 过滤后的猫咪列表（支持搜索）
const filteredCatList = () => {
  if (!catSearchQuery.value.trim()) return catList.value
  const q = catSearchQuery.value.toLowerCase()
  return catList.value.filter(cat => 
    cat.name?.toLowerCase().includes(q) || 
    String(cat.campus || '').toLowerCase().includes(q) ||
    String(cat.color || '').toLowerCase().includes(q)
  )
}

// 弹窗打开时刷新数据
watch(isCatDialogOpen, (open) => {
  if (open) {
    catSearchQuery.value = ''
    fetchCatList()
  }
})

// --- 初始化 ---
onMounted(async () => {
  try {
    const [tags] = await Promise.all([
      sosApi.getTags(),
      fetchCatList()
    ])
    symptomTags.value = tags || []

    // ✨ 从查询参数预填充猫咪（类似领养页）
    const catId = route.query.catId as string
    if (catId) {
      const selectedCat = catList.value.find(c => String(c.id) === catId)
      if (selectedCat) {
        form.value.selectedCat = selectedCat
        form.value.catId = catId
      }
    }
  } catch (error) {
    console.error(error)
    toast.error('加载基础数据失败，请检查网络')
  }
})

//  监听查询参数变化，动态更新选中的猫咪
watch(
  () => route.query.catId,
  (newCatId) => {
    if (newCatId) {
      const selectedCat = catList.value.find(c => String(c.id) === String(newCatId))
      if (selectedCat) {
        form.value.selectedCat = selectedCat
        form.value.catId = String(newCatId)
      }
    }
  }
)

// --- 逻辑处理 ---

const handleSelectCat = (cat: CatListItem) => {
  form.value.selectedCat = cat
  form.value.catId = String(cat.id)
  isCatDialogOpen.value = false
}

const handleSelectUnknown = () => {
  form.value.selectedCat = null
  form.value.catId = ''
  isCatDialogOpen.value = false
}

const toggleSymptom = (tag: string) => {
  if (form.value.symptoms.includes(tag)) {
    form.value.symptoms = form.value.symptoms.filter(t => t !== tag)
  } else {
    form.value.symptoms.push(tag)
  }
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files) return

  // 模拟文件上传（实际项目需要上传到服务器）
  // 这里假设返回 Firebase/OSS 的 URL
  Array.from(files).forEach((file) => {
    const url = URL.createObjectURL(file) // 本地预览 URL
    // 实际项目应该上传到云存储并获得真实 URL
    form.value.media.push(url)
  })
  toast.success(`已添加 ${files.length} 张照片`)
  // 重置 input
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const removeMedia = (index: number) => {
  form.value.media.splice(index, 1)
}

const handleSubmit = async () => {
  if (form.value.campus === null) return toast.warning('请选择所在校区')
  if (!form.value.location) return toast.warning('请填写详细位置')
  if (form.value.symptoms.length === 0) return toast.warning('请至少选择一个主要症状')
  if (!form.value.description) return toast.warning('请描述具体情况')
  if (form.value.media.length === 0) return toast.warning('请上传至少一张照片或视频')

  loading.value = true
  try {
    const payload = {
      catId: form.value.catId || undefined,
      campus: form.value.campus!, // ✨ 已是数字类型（通过 null 检查）
      location: form.value.location,
      symptoms: form.value.symptoms,
      description: form.value.description,
      media: form.value.media
    }

    await sosApi.submitSOS(payload)
    
    toast.success('🆘 求助已上报！请保持电话畅通。')
    setTimeout(() => router.push('/'), 1500)

  } catch (error: any) {
    console.error(error)
    toast.error(error.message || '上报失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen w-full bg-red-50/30 p-6 flex justify-center items-start pt-10">
    
    <!-- 核心卡片容器：PC端居中，最大宽度限制 -->
    <div class="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-red-100 overflow-hidden relative">
      
      <!-- 1. 顶部警示 Header -->
      <div class="bg-gradient-to-b from-red-100 to-white pt-10 pb-6 px-8 text-center relative">
        <button @click="$router.back()" class="absolute left-6 top-6 text-gray-400 hover:text-gray-600 transition-colors">
          <X class="w-6 h-6" />
        </button>
        
        <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-red-500 ring-4 ring-red-50">
          <Ambulance class="w-10 h-10" />
        </div>
        <h1 class="text-2xl font-black text-red-600 mb-1 tracking-wide">紧急病情上报</h1>
        <p class="text-xs text-red-400 font-medium">请确保自身安全的情况下进行救助</p>
      </div>

      <!-- 2. 表单内容区 -->
      <div class="p-8 space-y-8">
        
        <!-- A. 涉及猫咪 (Dialog 选择器) -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-3">涉及猫咪</label>
          <Dialog v-model:open="isCatDialogOpen">
            <DialogTrigger as-child>
              <div class="w-full h-14 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center px-4 cursor-pointer transition-colors group">
                <!-- 已选状态 -->
                <div v-if="form.selectedCat" class="flex items-center gap-3 flex-1">
                  <img :src="form.selectedCat.avatar" class="w-8 h-8 rounded-full object-cover border border-white shadow-sm" />
                  <span class="font-bold text-gray-800">{{ form.selectedCat.name }}</span>
                  <span class="text-xs text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-100 truncate max-w-[150px]">
                    {{ form.selectedCat.campus }} - {{ form.selectedCat.color || '未知花色' }}
                  </span>
                </div>
                <!-- 未选状态 -->
                <div v-else class="flex items-center gap-2 text-gray-400 flex-1">
                  <Search class="w-4 h-4" />
                  <span>点击选择 (不认识则不用选择或选“未知”)</span>
                </div>
                <span class="text-gray-300 group-hover:text-gray-500">❯</span>
              </div>
            </DialogTrigger>
            
            <DialogContent class="sm:max-w-[600px] max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>选择受伤猫咪</DialogTitle>
              </DialogHeader>
                            <!-- 搜索框 -->
              <div class="mb-3">
                <Input 
                  v-model="catSearchQuery" 
                  placeholder="搜索猫咪名称..." 
                  class="w-full"
                />
              </div>
                            <!-- “未知猫咪”选项 -->
              <div 
                @click="handleSelectUnknown"
                class="p-4 mb-2 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:border-red-200 hover:text-red-500 text-gray-500 transition-colors"
              >
                <AlertTriangle class="w-5 h-5" />
                <span class="font-bold">我不认识这只猫 / 未知猫咪</span>
              </div>

              <!-- 加载状态 -->
              <div v-if="catLoading" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              </div>

              <!-- 猫咪列表 Grid -->
              <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto p-1" style="max-height: 400px;">
                <div 
                  v-for="cat in filteredCatList()" 
                  :key="cat.id"
                  @click="handleSelectCat(cat)"
                  class="cursor-pointer bg-white border border-gray-100 rounded-xl overflow-hidden hover:ring-2 hover:ring-red-500 hover:shadow-md transition-all"
                >
                  <div class="h-24 bg-gray-100">
                    <img :src="cat.avatar" class="w-full h-full object-cover" />
                  </div>
                  <div class="p-3">
                    <div class="font-bold text-gray-800 text-sm truncate">{{ cat.name }}</div>
                    <div class="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin class="w-3 h-3" /> 
                      <span class="truncate">{{ cat.campus }} - {{ cat.color || '未知花色' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <!-- B. 地点选择 (校区 + 详细位置) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 校区 Select -->
          <div class="md:col-span-1">
            <label class="block text-sm font-bold text-gray-700 mb-3">所在校区 <span class="text-red-500">*</span></label>
            <div class="relative">
            <select 
              v-model.number="form.campus"
              class="w-full h-12 rounded-xl border-gray-200 bg-gray-50 focus:ring-red-500 focus:border-red-500 text-sm px-3 appearance-none"
            >
              <option :value="null">请选择</option>
              <!-- 渲染动态生成的校区选项 -->
              <option v-for="opt in campusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
              <!-- 自定义下拉箭头 -->
              <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          
          <!-- 详细位置 Input -->
          <div class="md:col-span-2">
            <label class="block text-sm font-bold text-gray-700 mb-3">详细位置 <span class="text-red-500">*</span></label>
            <Input 
              v-model="form.location" 
              placeholder="例如：食堂北门左侧草丛" 
              class="h-12 bg-gray-50 border-gray-200 focus-visible:ring-red-500" 
            />
          </div>
        </div>

        <!-- C. 主要症状 (Tags) -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-3">主要症状 (多选) <span class="text-red-500">*</span></label>
          <div class="flex flex-wrap gap-3">
            <button 
              v-for="tag in symptomTags" 
              :key="tag"
              @click="toggleSymptom(tag)"
              class="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200"
              :class="form.symptoms.includes(tag) 
                ? 'bg-red-50 border-red-500 text-red-600 shadow-sm' 
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'"
            >
              {{ tag }}
            </button>
            <div v-if="symptomTags.length === 0" class="text-xs text-gray-400 py-2">
              正在加载症状标签...
            </div>
          </div>
        </div>

        <!-- D. 具体描述 -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-3">具体症状描述 <span class="text-red-500">*</span></label>
          <Textarea 
            v-model="form.description" 
            class="min-h-[120px] bg-gray-50 border-gray-200 focus-visible:ring-red-500 resize-none p-4" 
            placeholder="请详细描述猫猫的症状、精神状态、是否有明显外伤等..."
          />
        </div>

        <!-- E. 现场照片 -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-3">现场照片/视频 <span class="text-red-500">*</span></label>
          <input 
            ref="fileInputRef"
            type="file" 
            multiple 
            accept="image/*,video/*" 
            @change="handleFileUpload"
            class="hidden"
          />
          
          <!-- 上传区域 -->
          <div 
            @click="fileInputRef?.click()"
            class="border-2 border-dashed border-red-200 bg-red-50/50 rounded-2xl h-32 flex flex-col items-center justify-center text-red-400 cursor-pointer hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            <Camera class="w-8 h-8 mb-2 opacity-50" />
            <span class="text-xs font-bold">点击上传照片/视频</span>
          </div>

          <!-- 已上传文件列表 -->
          <div v-if="form.media.length > 0" class="mt-4 grid grid-cols-4 gap-3">
            <div 
              v-for="(url, idx) in form.media" 
              :key="idx"
              class="relative group"
            >
              <img 
                :src="url" 
                class="w-full h-20 object-cover rounded-lg border border-red-100" 
              />
              <button
                @click="removeMedia(idx)"
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- F. 提交按钮 -->
        <Button 
          class="w-full h-14 rounded-2xl bg-[#E63946] hover:bg-[#D62828] text-white text-lg font-bold shadow-lg shadow-red-200 transition-transform active:scale-95"
          @click="handleSubmit"
          :disabled="loading"
        >
          <span v-if="loading" class="flex items-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            上报中...
          </span>
          <span v-else class="flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 fill-current" /> 立即上报求助
          </span>
        </Button>

      </div>
    </div>
  </div>
</template>