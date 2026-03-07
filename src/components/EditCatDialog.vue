<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { catApi } from '@/lib/api'
import type { AdminCatItem } from '@/types'
import { toast } from 'vue-sonner'

interface Props {
  open: boolean
  catData?: AdminCatItem | null
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  catData: null
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const submitting = ref(false)
const avatarInputRef = ref<HTMLInputElement | null>(null)

// 简化的表单数据 - 只包含必需字段
const formData = ref({
  name: '',
  color: 'ORANGE',
  avatar: '',
  status: 'SCHOOL',
  gender: 'FEMALE',
  campus: '中心校区',
  healthStatus: 'HEALTHY',
  birthYear: -1,
  isNeutered: false,
  hauntLocation: '',
  description: '',
  attributes: {
    friendliness: 5,
    gluttony: 5,
    fight: 5,
    appearance: 5
  }
})

// 选项配置
const genderOptions = [
  { label: '公', value: 'MALE' },
  { label: '母', value: 'FEMALE' }
]

const statusOptions = [
  { label: '在校', value: 'SCHOOL' },
  { label: '毕业/领养', value: 'GRADUATED' },
  { label: '休学/生病', value: 'HOSPITAL' },
  { label: '喵星人', value: 'MEOW_STAR' }
]

const colorOptions = [
  { label: '橘猫', value: 'ORANGE' },
  { label: '狸花', value: 'TABBY' },
  { label: '奶牛', value: 'COW' },
  { label: '三花', value: 'CALICO' },
  { label: '玳瑁', value: 'TORTIE' },
  { label: '纯白', value: 'WHITE' },
  { label: '纯黑', value: 'BLACK' },
  { label: '其他', value: 'OTHER' }
]

const campusOptions = [
  { label: '中心校区', value: '中心校区' },
  { label: '趵突泉校区', value: '趵突泉校区' },
  { label: '洪家楼校区', value: '洪家楼校区' },
  { label: '千佛山校区', value: '千佛山校区' },
  { label: '兴隆山校区', value: '兴隆山校区' },
  { label: '软件园校区', value: '软件园校区' },
  { label: '青岛校区', value: '青岛校区' },
  { label: '威海校区', value: '威海校区' }
]

const isNeuteredOptions = [
  { label: '是', value: 'true' },
  { label: '否', value: 'false' }
]

const healthStatusOptions = [
  { label: '健康', value: 'HEALTHY' },
  { label: '生病', value: 'SICK' },
  { label: '恢复中', value: 'RECOVERING' }
]

// 常驻地点选项（后端枚举值）
const hauntLocationOptions = [
  { label: '校门', value: 'SCHOOL_GATE' },
  { label: '食堂', value: 'DINING_HALL' },
  { label: '图书馆', value: 'LIBRARY' },
  { label: '教学楼', value: 'TEACHING_BUILDING' },
  { label: '宿舍楼', value: 'DORMITORY' },
  { label: '其他', value: 'OTHER' }
]

// 常驻地中文名称转换为枚举值
const hauntLocationToEnum = (locationName: string): string => {
  const map: Record<string, string> = {
    '校门': 'SCHOOL_GATE',
    '食堂': 'DINING_HALL',
    '图书馆': 'LIBRARY',
    '教学楼': 'TEACHING_BUILDING',
    '宿舍楼': 'DORMITORY',
    '其他': 'OTHER'
  }
  return map[locationName] || locationName || ''
}



// 打开时初始化表单
watch(() => props.open, (newVal) => {
  if (newVal && props.catData) {
    try {
      formData.value = {
        name: props.catData.name || '',
        color: props.catData.color || 'ORANGE',
        avatar: props.catData.avatar || '',
        status: props.catData.status || 'SCHOOL',
        gender: props.catData.gender || 'FEMALE',
        campus: props.catData.campus || '中心校区',
        healthStatus: (props.catData as any).healthStatus || 'HEALTHY',
        isNeutered: props.catData.isNeutered || false,
        birthYear: (props.catData as any).birthYear || -1,
        hauntLocation: hauntLocationToEnum(props.catData.locationName || ''),
        description: props.catData.description || '',
        attributes: {
          friendliness: props.catData.attributes?.friendliness || 5,
          gluttony: props.catData.attributes?.gluttony || 5,
          fight: props.catData.attributes?.fight || 5,
          appearance: props.catData.attributes?.appearance || 5
        }
      }
    } catch (err) {
      console.error('初始化表单失败:', err)
    }
  } else if (!newVal) {
    submitting.value = false
  }
})

// 头像上传处理
const handleAvatarUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      formData.value.avatar = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 更新属性评分
const updateAttribute = (key: string, value: number) => {
  const key_ = key as keyof typeof formData.value.attributes
  formData.value.attributes[key_] = Math.max(0, Math.min(10, value))
}

// 提交表单
const handleSubmit = async () => {
  // 验证必填字段
  if (!formData.value.name || !formData.value.color || !formData.value.campus) {
    toast.warning('请填写必填项：名字、花色、校区')
    return
  }

  // 验证campus是否合法（必须是选项中的某个值）
  if (!campusOptions.some(c => c.value === formData.value.campus)) {
    toast.warning('选择的校区无效')
    return
  }

  submitting.value = true
  try {
    // 构建要发送的数据 
    const submitData = {
      name: formData.value.name,
      color: formData.value.color,
      avatar: formData.value.avatar,
      gender: formData.value.gender,
      campus: formData.value.campus,
      status: formData.value.status,
      isNeutered: formData.value.isNeutered,
      attributes: formData.value.attributes,
      healthStatus: formData.value.healthStatus,
      ...(formData.value.birthYear !== -1 && { birthYear: formData.value.birthYear }),
      ...(formData.value.hauntLocation && formData.value.hauntLocation !== 'OTHER' && { hauntLocation: formData.value.hauntLocation }),
      ...(formData.value.description && { description: formData.value.description })
    }

    if (props.catData) {
      // 编辑猫咪
      await catApi.editCat(props.catData.id, submitData)
    } else {
      // 新增猫咪
      await catApi.addCat(submitData)
    }
    
    emit('success')
    emit('update:open', false)
  } catch (error) {
    console.error('操作猫咪失败:', error)
    toast.error('操作失败：' + (error as Error).message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ props.catData ? '编辑猫咪档案' : '发现新猫' }}</DialogTitle>
      </DialogHeader>

      <!-- 主布局：左侧头像 + 右侧表单 -->
      <div class="flex gap-6 py-4">
        <!-- 左侧：头像区域 -->
        <div class="flex flex-col items-center gap-4 w-[180px] flex-shrink-0">
          <!-- 头像框 -->
          <div
            class="w-[160px] h-[160px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-all"
            @click="() => avatarInputRef?.click()">
            <img v-if="formData.avatar" :src="formData.avatar" :alt="formData.name"
              class="w-full h-full object-cover rounded-lg" />
            <div v-else class="flex flex-col items-center text-gray-400">
              <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-xs">图片</span>
            </div>
          </div>

          <!-- 上传按钮 -->
          <Button type="button" variant="outline" size="sm" class="w-full" @click="() => avatarInputRef?.click()">
            上传头像
          </Button>

          <input ref="avatarInputRef" type="file" accept="image/*" hidden @change="handleAvatarUpload" />
        </div>

        <!-- 右侧：表单区域 -->
        <div class="flex-1 space-y-3">
          <!-- 行1：昵称 和 花色 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-xs font-medium text-gray-700">猫咪昵称 *</Label>
              <Input v-model="formData.name" placeholder="输入名字" class="h-9 text-sm mt-1" />
            </div>
            <div>
              <Label class="text-xs font-medium text-gray-700">花色类型 *</Label>
              <Select v-model="formData.color">
                <SelectTrigger class="h-9 text-sm mt-1">
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="color in colorOptions" :key="color.value" :value="color.value">
                    {{ color.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- 行2：在校状态 和 性别 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-xs font-medium text-gray-700">在校状态 *</Label>
              <Select v-model="formData.status">
                <SelectTrigger class="h-9 text-sm mt-1">
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="s in statusOptions" :key="s.value" :value="s.value">
                    {{ s.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label class="text-xs font-medium text-gray-700">性别 *</Label>
              <Select v-model="formData.gender">
                <SelectTrigger class="h-9 text-sm mt-1">
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="g in genderOptions" :key="g.value" :value="g.value">
                    {{ g.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- 行2.5：校区 *必填 -->
          <div>
            <Label class="text-xs font-medium text-gray-700">所属校区 *</Label>
            <Select v-model="formData.campus">
              <SelectTrigger class="h-9 text-sm mt-1">
                <SelectValue placeholder="选择校区" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in campusOptions" :key="c.value" :value="c.value">
                  {{ c.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 行3：出生年份 和 毛长分类 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-xs font-medium text-gray-700">估计出生年份</Label>
              <Input v-model.number="formData.birthYear" type="number" placeholder="如：2022" class="h-9 text-sm mt-1" />
            </div>
            <div>
              <Label class="text-xs font-medium text-gray-700">毛长分类</Label>
              <Select>
                <SelectTrigger class="h-9 text-sm mt-1">
                  <SelectValue placeholder="短毛" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">短毛</SelectItem>
                  <SelectItem value="long">长毛</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label class="text-xs font-medium text-gray-700">是否绝育 *</Label>
            <Select :model-value="String(formData.isNeutered)" @update:model-value="(val) => { formData.isNeutered = val === 'true' }">
              <SelectTrigger class="h-9 text-sm mt-1">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="opt in isNeuteredOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 健康状态 -->
          <div>
            <Label class="text-xs font-medium text-gray-700">健康状态</Label>
            <Select v-model="formData.healthStatus">
              <SelectTrigger class="h-9 text-sm mt-1">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="h in healthStatusOptions" :key="h.value" :value="h.value">
                  {{ h.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>



          <!-- 行5：常驻区与地点 -->
          <div>
            <Label class="text-xs font-medium text-gray-700">常驻区与地点</Label>
            <Select v-model="formData.hauntLocation">
              <SelectTrigger class="h-9 text-sm mt-1">
                <SelectValue placeholder="选择常驻地点" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="loc in hauntLocationOptions" :key="loc.value" :value="loc.value">
                  {{ loc.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 行6：性格特征描述 -->
          <div>
            <Label class="text-xs font-medium text-gray-700">性格与特征描述</Label>
            <Input v-model="formData.description" placeholder="输入猫咪的性格和特征..." class="h-20 text-sm resize-none mt-1" />
          </div>
        </div>
      </div>

      <!-- 性格评分 - 独占一行 -->
      <div class="p-3 bg-gray-50 rounded-lg space-y-2">
        <h3 class="text-xs font-medium text-gray-700">性格与特征描述</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="flex justify-between text-xs mb-2">
              <span>亲人度</span>
              <span class="font-semibold text-teal-600">{{ formData.attributes.friendliness.toFixed(1) }}</span>
            </div>
            <Input type="range" min="0" max="10" step="0.5" :value="formData.attributes.friendliness"
              @input="(e: Event) => updateAttribute('friendliness', parseFloat((e.target as HTMLInputElement).value))"
              class="w-full h-2" />
          </div>
          <div>
            <div class="flex justify-between text-xs mb-2">
              <span>贪吃度</span>
              <span class="font-semibold text-teal-600">{{ formData.attributes.gluttony.toFixed(1) }}</span>
            </div>
            <Input type="range" min="0" max="10" step="0.5" :value="formData.attributes.gluttony"
              @input="(e: Event) => updateAttribute('gluttony', parseFloat((e.target as HTMLInputElement).value))"
              class="w-full h-2" />
          </div>
          <div>
            <div class="flex justify-between text-xs mb-2">
              <span>战斗力</span>
              <span class="font-semibold text-teal-600">{{ formData.attributes.fight.toFixed(1) }}</span>
            </div>
            <Input type="range" min="0" max="10" step="0.5" :value="formData.attributes.fight"
              @input="(e: Event) => updateAttribute('fight', parseFloat((e.target as HTMLInputElement).value))"
              class="w-full h-2" />
          </div>
          <div>
            <div class="flex justify-between text-xs mb-2">
              <span>颜值</span>
              <span class="font-semibold text-teal-600">{{ formData.attributes.appearance.toFixed(1) }}</span>
            </div>
            <Input type="range" min="0" max="10" step="0.5" :value="formData.attributes.appearance"
              @input="(e: Event) => updateAttribute('appearance', parseFloat((e.target as HTMLInputElement).value))"
              class="w-full h-2" />
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <DialogFooter class="border-t pt-4 flex justify-end gap-2">
        <Button variant="outline" @click="() => emit('update:open', false)" :disabled="submitting">
          {{ props.catData ? '放弃修改' : '取消' }}
        </Button>
        <Button @click="handleSubmit" :disabled="submitting" class="bg-teal-500 hover:bg-teal-600 text-white">
          {{ submitting ? '提交中...' : (props.catData ? '提出保存' : '发现新猫') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
