<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>浏览足迹</h1>

    <button v-if="list.length" @click="handleClear">清空足迹</button>

    <div class="panel">
      <div v-if="list.length">
        <article v-for="(item, i) in list" :key="i" class="record">
          <router-link :to="`/${item.type}?id=${item.id}`">{{ item.title }}</router-link>
          <small>{{ item.time }}</small>
        </article>
      </div>
      <div v-else class="empty">暂无浏览记录</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHistory, clearHistory } from '../../composables/useHelpers'

const list = ref([])

onMounted(() => {
  list.value = getHistory()
})

function handleClear() {
  if (confirm('清空当前浏览器中的浏览足迹？')) {
    clearHistory()
    list.value = []
  }
}
</script>
