<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>管理中心</h1>
    <p class="muted">校园自习预约 / 管理工作台</p>

    <section class="stats">
      <div v-for="item in stats" :key="item.title" class="stat">
        <span class="muted">{{ item.title }}</span>
        <strong>{{ item.cnt }}</strong>
      </div>
    </section>

    <section class="panel">
      <h2>日常管理</h2>
      <p class="muted">维护开放场地与公告，查看预约名单，完成到场核销。</p>
      <div class="actions">
        <SpecularButton
          size="md"
          :radius="12"
          tint="#1a7a6b"
          :tintOpacity="0.2"
          textColor="#ffffff"
          lineColor="#ffffff"
          baseColor="#1a7a6b"
          :intensity="0.9"
          :idleIntensity="0.4"
          @click="router.push('/admin/meets')"
        >
          管理自习场地
        </SpecularButton>
        <SpecularButton
          size="md"
          :radius="12"
          tint="#6b7280"
          :tintOpacity="0.1"
          textColor="#374151"
          lineColor="#6b7280"
          baseColor="#6b7280"
          :intensity="0.7"
          :idleIntensity="0.3"
          @click="router.push('/admin/news')"
        >
          发布校园公告
        </SpecularButton>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../../api/request'

const stats = ref([])

onMounted(async () => {
  try {
    const r = await api('/admin/home')
    stats.value = r || []
  } catch {}
})
</script>
