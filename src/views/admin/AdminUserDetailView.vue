<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminUserApi } from '@/lib/api'
import type { AdminUserDetail } from '@/types'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const user = ref<AdminUserDetail | null>(null)
const loading = ref(false)

const fetchDetail = async () => {
  const id = route.params.id as string
  if (!id) return
  loading.value = true
  try {
    user.value = await adminUserApi.getUserDetail(id)
  } catch (error) {
    console.error('Failed to fetch user detail', error)
    toast.error('获取用户详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-5xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">用户详情</h1>
          <p class="text-sm text-gray-600">查看用户完整信息</p>
        </div>
        <Button variant="outline" @click="router.back()">返回</Button>
      </div>

      <section class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">基本信息</h2>
          <span v-if="user?.status" class="text-sm text-gray-600">状态：{{ user.status }}</span>
        </div>
        <div v-if="!loading && user" class="space-y-4">
          <div class="flex items-center gap-4">
            <Avatar class="w-16 h-16">
              <AvatarImage v-if="user.avatar" :src="user.avatar" :alt="user.name" />
              <AvatarFallback>{{ user.name?.charAt(0) || 'U' }}</AvatarFallback>
            </Avatar>
            <div>
              <p class="text-lg font-semibold text-gray-900">{{ user.name }}</p>
              <p class="text-sm text-gray-600">ID: {{ user.id }}</p>
              <p v-if="user.nickname" class="text-sm text-gray-600">昵称: {{ user.nickname }}</p>
              <div class="flex gap-2 mt-2">
                <Badge variant="outline">角色: {{ user.role || '未知' }}</Badge>
                <Badge variant="outline">学号: {{ user.sid || user.studentId || '未知' }}</Badge>
                <Badge variant="outline">等级: Lv.{{ user.level ?? '-' }}</Badge>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm text-gray-700">
            
            <div>校区：{{ user.campus ?? '未知' }}</div>
            <div>余额：{{ user.currency ?? '-' }}</div>
            <div>联系方式：{{ user.phone || user.wechat || '未提供' }}</div>
            <div>创建时间：{{ user.createTime || '-' }}</div>
            <div>最近登录：{{ user.lastLoginTime || '-' }}</div>
          </div>
        </div>
        <div v-else class="py-10 flex justify-center">
          <Loader2 class="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </section>

      <section v-if="user?.stats" class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">统计信息</h2>
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>投喂次数：{{ user.stats?.feedCount }}</div>
          <div>发现新猫：{{ user.stats?.foundNewCatCount }}</div>
          <div>收到点赞：{{ user.stats?.receivedLikes }}</div>
          <div>动态数量：{{ user.stats?.momentCount }}</div>
        </div>
      </section>
    </div>
  </div>
</template>
