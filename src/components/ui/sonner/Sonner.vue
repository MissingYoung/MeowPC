<script lang="ts" setup>
import { Toaster as Sonner, type ToasterProps } from "vue-sonner"
import { reactiveOmit } from "@vueuse/core"
import { 
  CircleCheckIcon, 
  InfoIcon, 
  Loader2Icon, 
  OctagonXIcon, 
  TriangleAlertIcon, 
  XIcon 
} from "lucide-vue-next"

const props = defineProps<ToasterProps>()

// ✨ 修复核心：
// 在这里增加 "position"，告诉 VueUse：“把 toastOptions 和 position 都剔除出去”
// 这样 delegatedProps 里就不包含 position 了，避免了和下面的显式赋值冲突
const delegatedProps = reactiveOmit(props, "toastOptions", "position")
</script>

<template>
  <Sonner
    class="toaster group"
    position="top-center"
    v-bind="delegatedProps"
    :toast-options="{
      classes: {
        toast:'group toast group-[.toaster]:rounded-full group-[.toaster]:border-none group-[.toaster]:shadow-xl group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:py-3 group-[.toaster]:px-6 group-[.toaster]:gap-3 group-[.toaster]:bg-white group-[.toaster]:text-stone-950 ',
        description: 'group-[.toast]:text-muted-foreground',
        actionButton: 'group-[.toast]:bg-white group-[.toast]:text-black rounded-full',
        cancelButton: 'group-[.toast]:bg-white/20 group-[.toast]:text-white rounded-full',
      }
    }"
  >
    <template #loading-icon>
      <Loader2Icon class="h-4 w-4 animate-spin " />
    </template>
    <template #success-icon>
      <CircleCheckIcon class="h-4 w-4 text-green-600 " />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="h-4 w-4 text-yellow-500 " />
    </template>
    <template #info-icon>
      <InfoIcon class="h-4 w-4 text-blue-500 " />
    </template>
    <template #error-icon>
      <OctagonXIcon class="h-4 w-4 text-red-500 " />
    </template>
    <template #close-button>
      <XIcon class="h-4 w-4" />
    </template>
  </Sonner>
</template>