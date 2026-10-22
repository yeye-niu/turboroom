<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>用户使用协议</h1>
    <article class="panel">
      <div v-if="content">
        <div v-for="(node, i) in content" :key="i">
          <img v-if="node.type === 'img'" class="rich" :src="node.val" alt="配图">
          <p v-else class="rich">{{ node.val }}</p>
        </div>
      </div>
      <div v-else class="empty">暂未配置内容</div>
    </article>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../../api/request'
import { getRichContent } from '../../composables/useHelpers'

const content = ref(null)

onMounted(async () => {
  try {
    const r = await api('/setup/get', { key: 'SETUP_YS' })
    content.value = r ? getRichContent(r) : null
  } catch {}
})
</script>
