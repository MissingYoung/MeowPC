<script setup lang="ts">
import SlideBar from './components/layout/SlideBar.vue';
import TopHeader from './components/layout/TopHeader.vue';
import { useRoute } from 'vue-router';
import { Toaster } from './components/ui/sonner';
import { computed } from 'vue';

const route=useRoute();

const isFullScreen = computed(()=>{
  return ['login','register',].includes(route.name as string)
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