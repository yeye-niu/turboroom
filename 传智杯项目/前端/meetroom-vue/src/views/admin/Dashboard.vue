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
        <router-link class="button primary" to="/admin/meets">管理自习场地</router-link>
        <router-link class="button" to="/admin/news">发布校园公告</router-link>
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
