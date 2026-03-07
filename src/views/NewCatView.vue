<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { newCatApi } from '@/lib/api'
import { CampusMap } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'vue-sonner'
import { Image as ImageIcon, X, MapPin, CheckCircle2, Cat } from 'lucide-vue-next'

const router = useRouter()
const loading = ref(false)

// 表单数据
const form = ref({
  tempName: '',       // 临时名称（可选）
  color: '',          // 毛色（必填）
  campus: '',         // 校区（必填）
  location: '',       // 详细位置（必填）
  tags: [] as string[], // 标签（可选）
  images: [] as File[]  // 图片文件（必填）
})

// 图片预览URL
const imagePreviews = ref<string[]>([])

// 预设毛色选项
const colorOptions = ['纯白', '纯黑', '橘猫', '狸花', '三花', '玳瑁', '奶牛', '灰色', '其他']

// 预设标签
const predefinedTags = ['亲人', '怕人', '健康', '受伤', '流浪', '家养', '幼猫', '成年']

// 图片上传
const fileInput = ref<HTMLInputElement | null>(null)
const triggerUpload = () => fileInput.value?.click()

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return

  if (form.value.images.length + files.length > 9) {
    return toast.warning('最多只能上传 9 张图片')
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    form.value.images.push(file)
    // 生成预览URL
    imagePreviews.value.push(URL.createObjectURL(file))
  }
  
  // 清空 input 以便重复上传相同文件
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeImage = (index: number) => {
  // 释放预览URL
  URL.revokeObjectURL(imagePreviews.value[index]!)
  form.value.images.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

// 标签切换
const toggleTag = (tag: string) => {
  if (form.value.tags.includes(tag)) {
    form.value.tags = form.value.tags.filter(t => t !== tag)
  } else {
    form.value.tags.push(tag)
  }
}

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  if (!form.value.color) return toast.warning('请选择猫咪毛色')
  if (!form.value.campus) return toast.warning('请选择所在校区')
  if (!form.value.location) return toast.warning('请填写详细位置')
  if (form.value.images.length === 0) return toast.warning('请至少上传一张图片')

  loading.value = true
  try {
    // 构建 FormData
    const formData = new FormData()
    
    if (form.value.tempName) {
      formData.append('tempName', form.value.tempName)
    }
    formData.append('color', form.value.color)
    formData.append('campus', form.value.campus)
    formData.append('location', form.value.location)
    
    if (form.value.tags.length > 0) {
      form.value.tags.forEach(tag => {
        formData.append('tags', tag)
      })
    }
    
    // 添加图片文件
    form.value.images.forEach(file => {
      formData.append('images', file)
    })

    const res = await newCatApi.submitNewCat(formData)
    
    toast.success(`提交成功！审核后获得 ${res.experience} 经验和 ${res.currency} 小鱼干`)
    router.push('/') // 跳回首页

  } catch (error: any) {
    console.error(error)
    toast.error(error.message || '提交失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-full p-0 w-full flex flex-col gap-0">
    <div class="flex-1 px-6 py-4 w-full max-w-full mx-auto flex flex-col gap-6">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
      
      <!-- 左侧：编辑表单 -->
      <div class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-8">
        
        <!-- 页面标题 -->
        <div class="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div class="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
            <Cat class="w-5 h-5 text-[#F3B72E]" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-800">发现新猫</h1>
            <p class="text-sm text-gray-400">在校园发现了新猫咪？提交线索帮助我们记录</p>
          </div>
        </div>

        <!-- 上传图片 -->
        <div>
          <label class="block text-sm font-bold text-gray-800 mb-3">
            上传猫咪照片 <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-4">
            <!-- 已选图片 -->
            <div v-for="(img, idx) in imagePreviews" :key="idx" class="relative aspect-square rounded-xl overflow-hidden group border border-gray-100">
              <img :src="img" class="w-full h-full object-cover" />
              <button 
                @click="removeImage(idx)"
                class="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X class="w-3 h-3" />
              </button>
            </div>

            <!-- 上传按钮 -->
            <div 
              v-if="form.images.length < 9"
              @click="triggerUpload"
              class="aspect-square border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-[#F3B72E] hover:text-[#F3B72E] hover:bg-yellow-50 transition-all"
            >
              <ImageIcon class="w-8 h-8 mb-2 opacity-50" />
              <span class="text-xs">点击上传</span>
              <span class="text-[10px] scale-90 opacity-60 mt-1">支持 JPG/PNG</span>
            </div>
          </div>
          <input type="file" ref="fileInput" class="hidden" accept="image/*" multiple @change="handleFileChange" />
        </div>

        <!-- 猫咪信息 -->
        <div class="space-y-4">
          <!-- 临时名称 -->
          <div>
            <label class="block text-sm font-bold text-gray-800 mb-2">给它起个名字（可选）</label>
            <Input 
              v-model="form.tempName" 
              class="h-11 bg-gray-50 border-gray-200 focus-visible:ring-[#F3B72E]" 
              placeholder="临时昵称，方便识别" 
            />
          </div>

          <!-- 毛色选择 -->
          <div>
            <label class="block text-sm font-bold text-gray-800 mb-2">
              毛色特征 <span class="text-red-500">*</span>
            </label>
            <Select v-model="form.color">
              <SelectTrigger class="h-11 bg-gray-50 border-gray-200 focus:ring-[#F3B72E]">
                <SelectValue placeholder="选择毛色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="color in colorOptions" :key="color" :value="color">
                  {{ color }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 校区选择 -->
          <div>
            <label class="block text-sm font-bold text-gray-800 mb-2">
              所在校区 <span class="text-red-500">*</span>
            </label>
            <Select v-model="form.campus">
              <SelectTrigger class="h-11 bg-gray-50 border-gray-200 focus:ring-[#F3B72E]">
                <SelectValue placeholder="选择校区" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="(name, code) in CampusMap" 
                  :key="code" 
                  :value="String(code)"
                >
                  {{ name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 详细位置 -->
          <div>
            <label class="block text-sm font-bold text-gray-800 mb-2">
              详细位置 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                v-model="form.location" 
                class="h-11 pl-9 bg-gray-50 border-gray-200 focus-visible:ring-[#F3B72E]" 
                placeholder="如：宿舍楼底下、食堂门口等" 
              />
            </div>
          </div>
        </div>

        <!-- 添加标签 -->
        <div>
          <label class="block text-sm font-bold text-gray-800 mb-3">猫咪特征标签（可选）</label>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="tag in predefinedTags" 
              :key="tag"
              @click="toggleTag(tag)"
              class="px-4 py-1.5 rounded-full text-xs font-medium border transition-all"
              :class="form.tags.includes(tag) 
                ? 'bg-yellow-50 border-[#F3B72E] text-yellow-700' 
                : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'"
            >
              # {{ tag }}
            </button>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
          <Button 
            variant="ghost" 
            class="flex-1 h-12 rounded-xl text-base font-bold shadow-md bg-red-400 hover:bg-red-500" 
            @click="router.back()"
          >
            ✕ 取消
          </Button>
          <Button 
            class="flex-[2] h-12 rounded-xl bg-[#F3B72E] hover:bg-[#e0a82e] text-black font-bold text-base shadow-md"
            @click="handleSubmit"
            :disabled="loading"
          >
            {{ loading ? '提交中...' : '🐱 提交线索' }}
          </Button>
        </div>

      </div>

      <!-- 右侧：侧边栏 -->
      <div class="flex flex-col gap-6 sticky top-6">
        
        <!-- 提交说明 -->
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div class="flex items-center gap-2 mb-4 text-[#FF9F1C]">
            <span class="text-lg">💡</span>
            <h3 class="font-bold">提交小贴士</h3>
          </div>
          <ul class="space-y-4 text-xs text-gray-500">
            <li class="flex gap-2 items-start">
              <CheckCircle2 class="w-4 h-4 text-yellow-400 shrink-0" />
              <span>拍摄清晰的猫咪照片</span>
            </li>
            <li class="flex gap-2 items-start">
              <CheckCircle2 class="w-4 h-4 text-yellow-400 shrink-0" />
              <span>准确描述毛色特征</span>
            </li>
            <li class="flex gap-2 items-start">
              <CheckCircle2 class="w-4 h-4 text-yellow-400 shrink-0" />
              <span>标注具体发现位置</span>
            </li>
            <li class="flex gap-2 items-start">
              <CheckCircle2 class="w-4 h-4 text-yellow-400 shrink-0" />
              <span>添加合适的特征标签</span>
            </li>
            <li class="flex gap-2 items-start">
              <CheckCircle2 class="w-4 h-4 text-yellow-400 shrink-0" />
              <span>审核通过后可获得奖励</span>
            </li>
          </ul>
        </div>

        <!-- 奖励说明 -->
        <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100 shadow-sm">
          <div class="flex items-center gap-2 mb-4 text-[#F3B72E]">
            <span class="text-lg">🎁</span>
            <h3 class="font-bold">提交奖励</h3>
          </div>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">经验值</span>
              <span class="font-bold text-[#F3B72E]">+100 EXP</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">小鱼干</span>
              <span class="font-bold text-[#F3B72E]">+50 🐟</span>
            </div>
          </div>
          <p class="text-xs text-gray-400 mt-4">* 审核通过后发放奖励</p>
        </div>

      </div>
    </div>
  </div>
  </div>
</template>
