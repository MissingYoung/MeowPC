<script setup lang="ts">
import SlideBar from './components/layout/SlideBar.vue';
import TopHeader from './components/layout/TopHeader.vue';
import { useRoute } from 'vue-router';
import { Toaster } from './components/ui/sonner';
import { computed, onMounted } from 'vue';
import { useUserStore } from './stores/user';

const route=useRoute();
const userStore = useUserStore();

// 应用启动时，如果有token但没有用户信息，则获取用户信息
onMounted(async () => {
  if (userStore.token && !userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch (e) {
      console.error('恢复用户信息失败', e)
    }
  }
})

const isFullScreen = computed(()=>{
  // 如果是登录、注册或者是管理后台页面，则使用全屏布局（不显示前台通用的侧边栏和顶栏）
  return ['login','register',].includes(route.name as string) || route.path.startsWith('/admin')
})
</script>

<template>
  <div v-if="isFullScreen" class="flex w-full h-full  ">
    <router-view />
  </div>
  <div v-else class="flex w-screen h-screen overflow-hidden bg-meow-bg font-sans">
    <SlideBar /> 
    <div class="flex flex-1 flex-col h-full min-w-0 relative">
      <TopHeader />
      <main class="flex-1 overflow-auto p-6 md:p-8">
        <router-view />
      </main>
    </div>
  </div>
  <Toaster position ="top-center" richColors/>

</template>