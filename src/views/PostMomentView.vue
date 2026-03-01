<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { momentApi, catApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'vue-sonner'
import { Image as ImageIcon, X, ChevronRight, CheckCircle2, Search, MapPin } from 'lucide-vue-next'
import type { CatListItem } from '@/types'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const isCatDialogOpen = ref(false)

// 基础数据
const catList = ref<CatListItem[]>([])

// 表单数据
const form = ref({
  selectedCat: null as CatListItem | null, // 选中的猫对象
  title: '',
  content: '',
  tags: [] as string[],
  images: [] as string[], 
  location: '' // API 需要 location
})

// 预设标签
const predefinedTags = ['日常', '搞笑', '可爱', '求助', '科普', '记录', '偶遇', '投喂']

// 初始化 
onMounted(async () => {
  try {
    const res = await catApi.getCatList()
    catList.value = Array.isArray(res) ? res : (res?.items || [])

    // ✨ 从查询参数预填充猫咪（类似 SOS 和领养页）
    const catId = route.query.catId as string
    if (catId && catList.value.length > 0) {
      // 安全比较：先尝试数字比较，再提会字符串比较
      const numCatId = Number(catId)
      const selectedCat = catList.value.find(c => 
        c.id === numCatId || String(c.id) === catId
      )
      if (selectedCat) {
        form.value.selectedCat = selectedCat
        // 自动填入猫咪的位置作为默认地点
        if (!form.value.location && selectedCat.campus) {
          form.value.location = String(selectedCat.campus)
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
})

// ✨ 监听查询参数变化，动态更新选中的猫咪
watch(
  () => route.query.catId,
  (newCatId) => {
    if (newCatId) {
      const numCatId = Number(newCatId)
      const selectedCat = catList.value.find(c => 
        c.id === numCatId || String(c.id) === String(newCatId)
      )
      if (selectedCat) {
        form.value.selectedCat = selectedCat
        if (!form.value.location && selectedCat.campus) {
          form.value.location = String(selectedCat.campus)
        }
      }
    }
  }
)



//  选择猫咪
const handleSelectCat = (cat: CatListItem) => {
  form.value.selectedCat = cat
  // 自动填入猫咪的校区作为默认地点
  if (!form.value.location && cat.campus) {
    form.value.location = String(cat.campus)
  }
  isCatDialogOpen.value = false
}

// 图片上传 
const fileInput = ref<HTMLInputElement | null>(null)
const triggerUpload = () => fileInput.value?.click()

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return

  if (form.value.images.length + files.length > 9) {
    return toast.warning('最多只能上传 9 张图片')
  }

  // 模拟上传：转为 Blob URL 预览
  for (let i = 0; i < files.length; i++) {
    const url = URL.createObjectURL(files[i]!)
    form.value.images.push(url)
  }
}

const removeImage = (index: number) => {
  form.value.images.splice(index, 1)
}

//  标签切换
const toggleTag = (tag: string) => {
  if (form.value.tags.includes(tag)) {
    form.value.tags = form.value.tags.filter(t => t !== tag)
  } else {
    form.value.tags.push(tag)
  }
}

//  提交发布
const handleSubmit = async () => {
  if (!form.value.selectedCat) return toast.warning('请选择主角猫咪')
  if (!form.value.content && form.value.images.length === 0) return toast.warning('内容形兄至少有一个事项（文字或图片）')

  loading.value = true
  try {
    // 构造 content: 【标题】+ 内容 + #标签
    let finalContent = form.value.content || ''
    if (form.value.title) {
      finalContent = `【${form.value.title}】\n${finalContent}`.trim()
    }
    if (form.value.tags.length > 0) {
      finalContent += `\n` + form.value.tags.map(t => `#${t}`).join(' ')
    }

    // 构造 API 参数
    const payload = {
      content: finalContent || undefined, // 空字符串传 undefined
      relatedCatIds: String(form.value.selectedCat.id), 
      location: form.value.location || '校园内',
      media: form.value.images.length > 0 ? form.value.images : undefined // 没有图片传 undefined
    }

    await momentApi.createMoment(payload)
    
    toast.success('发布成功！审核通过后将展示。')
    router.push('/') // 跳回下页或 动态列表页

  } catch (error: any) {
    console.error(error)
    toast.error(error.message || '发布失败')
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
        
        <!-- 选择猫咪 -->
        <div>
          <label class="block text-sm font-bold text-gray-800 mb-3">选择主角猫咪</label>
          <Dialog v-model:open="isCatDialogOpen">
            <DialogTrigger as-child>
              <div class="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors group">
                <div v-if="form.selectedCat" class="flex items-center gap-4">
                  <img :src="form.selectedCat.avatar" class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div>
                    <div class="font-bold text-gray-800 flex items-center gap-2">
                      {{ form.selectedCat.name }}
                      <span class="text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100">
                        {{ form.selectedCat.campus }}
                      </span>
                    </div>
                    <div class="text-xs text-gray-400 mt-0.5">点击更换猫咪</div>
                  </div>
                </div>
                <div v-else class="flex items-center gap-3 text-gray-400">
                  <span>点击选择主角猫咪</span>
                </div>
                <ChevronRight class="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
              </div>
            </DialogTrigger>
            
            <DialogContent class="sm:max-w-[600px] max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>选择主角猫咪</DialogTitle>
              </DialogHeader>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto p-1 mt-2">
                <div 
                  v-for="cat in catList" 
                  :key="cat.id"
                  @click="handleSelectCat(cat)"
                  class="cursor-pointer bg-white border border-gray-100 rounded-xl overflow-hidden hover:ring-2 hover:ring-[#F3B72E] hover:shadow-md transition-all"
                >
                  <div class="h-24 bg-gray-100">
                    <img :src="cat.avatar" class="w-full h-full object-cover" />
                  </div>
                  <div class="p-3 text-center">
                    <div class="font-bold text-gray-800 text-sm truncate">{{ cat.name }}</div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <!--  上传图片 -->
        <div>
          <label class="block text-sm font-bold text-gray-800 mb-3">上传图片</label>
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-4">
            <!-- 已选图片 -->
            <div v-for="(img, idx) in form.images" :key="idx" class="relative aspect-square rounded-xl overflow-hidden group border border-gray-100">
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

        <!--  标题与内容 -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-800 mb-2">标题</label>
            <Input v-model="form.title" class="h-11 bg-gray-50 border-gray-200 focus-visible:ring-[#F3B72E]" placeholder="填写标题会更有趣哦~" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-800 mb-2">内容</label>
            <Textarea 
              v-model="form.content" 
              class="min-h-[150px] bg-gray-50 border-gray-200 focus-visible:ring-[#F3B72E] resize-none p-4" 
              placeholder="分享这一刻的猫猫，记录美好瞬间..."
            />
          </div>
          <!-- 位置补充 -->
          <div>
            <label class="block text-sm font-bold text-gray-800 mb-2">位置</label>
            <div class="relative">
              <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input v-model="form.location" class="h-11 pl-9 bg-gray-50 border-gray-200 focus-visible:ring-[#F3B72E]" placeholder="在哪里拍到的？" />
            </div>
          </div>
        </div>

        <!-- 添加标签 -->
        <div>
          <label class="block text-sm font-bold text-gray-800 mb-3">添加标签</label>
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
          <Button variant="ghost" class="flex-1 h-12 rounded-xl text-base font-bold shadow-md bg-red-400 hover:bg-red-500" @click="router.back()">
            ✕ 取消
          </Button>
          <Button 
            class="flex-[2] h-12 rounded-xl bg-[#F3B72E] hover:bg-[#e0a82e] text-black font-bold text-base shadow-md"
            @click="handleSubmit"
            :disabled="loading"
          >
            {{ loading ? '发布中...' : ' 发布动态' }}
          </Button>
        </div>

      </div>

      <!-- 右侧：侧边栏 -->
      <div class="flex flex-col gap-6 sticky top-6">
        
        <!-- 发布规则 -->
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div class="flex items-center gap-2 mb-4 text-[#FF9F1C]">
            <span class="text-lg">💡</span>
            <h3 class="font-bold">发布小贴士</h3>
          </div>
          <ul class="space-y-4 text-xs text-gray-500">
            <li class="flex gap-2 items-start">
              <CheckCircle2 class="w-4 h-4 text-yellow-400 shrink-0" />
              <span>图片清晰，猫咪主体突出</span>
            </li>
            <li class="flex gap-2 items-start">
              <CheckCircle2 class="w-4 h-4 text-yellow-400 shrink-0" />
              <span>标题简洁明了，吸引眼球</span>
            </li>
            <li class="flex gap-2 items-start">
              <CheckCircle2 class="w-4 h-4 text-yellow-400 shrink-0" />
              <span>内容真实，记录美好瞬间</span>
            </li>
            <li class="flex gap-2 items-start">
              <CheckCircle2 class="w-4 h-4 text-yellow-400 shrink-0" />
              <span>添加合适标签，便于分类</span>
            </li>
            <li class="flex gap-2 items-start">
              <CheckCircle2 class="w-4 h-4 text-yellow-400 shrink-0" />
              <span>选择正确的猫咪主角</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  </div>
  </div>
</template>