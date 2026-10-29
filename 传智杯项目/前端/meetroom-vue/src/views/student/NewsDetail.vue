<template>
  <div v-if="data">
    <router-link to="/news-list">&larr; 返回列表</router-link>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>{{ data.newsTitle }}</h1>
    <p class="muted">{{ data.newsCateName }}</p>

    <div class="layout">
      <section>
        <img
          v-if="coverUrl"
          class="cover detail-cover"
          loading="lazy"
          :src="coverUrl"
          :alt="data.newsTitle"
        >
        <div v-else class="cover-placeholder" aria-hidden="true">专注空间</div>
        <div class="panel">
          <h2>公告正文</h2>
          <div v-for="(node, i) in richContent" :key="i">
            <img v-if="node.type === 'img'" class="rich" :src="node.val" alt="公告配图">
            <p v-else class="rich">{{ node.val }}</p>
          </div>
          <button @click="toggleFav">{{ isFav ? '取消收藏' : '收藏' }}</button>
        </div>
      </section>
      <aside class="panel">
        <h2>校园公告</h2>
        <p>{{ obj.desc }}</p>
        <router-link to="/news-list">更多校园资讯 &rarr;</router-link>
      </aside>
    </div>
  </div>
  <div v-else class="empty">内容已下架或不存在</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../api/request'
import { useUserStore } from '../../stores/user'
import { useToast } from '../../composables/useToast'
import { parseJson, getImageUrl, getRichContent, historyAdd } from '../../composables/useHelpers'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { toast } = useToast()

const data = ref(null)
const isFav = ref(false)

const obj = computed(() => data.value ? parseJson(data.value.newsObj) : {})
const coverUrl = computed(() => {
  const raw = Array.isArray(obj.value.cover) ? obj.value.cover[0] : obj.value.cover
  return getImageUrl(raw)
})
const richContent = computed(() => {
  if (!data.value) return []
  const content = data.value.newsContent || ''
  if (!content) return getRichContent(obj.value.content)
  return content.split('\n').filter(s => s.trim()).map(val => ({ type: 'text', val }))
})

async function toggleFav() {
  if (!userStore.cust) { router.push('/login'); return }
  try {
    const r = await api('/fav/update', {
      oid: route.query.id,
      title: data.value.newsTitle,
      type: '公告',
      path: `#/news?id=${route.query.id}`
    })
    isFav.value = r.isFav
    toast(r.isFav ? '已收藏' : '已取消收藏')
  } catch (e) { toast(e.message) }
}

onMounted(async () => {
  try {
    data.value = await api('/news/view', { id: route.query.id })
    if (data.value) {
      historyAdd('news', route.query.id, data.value.newsTitle)
      if (userStore.cust) {
        try {
          const r = await api('/fav/is', { oid: route.query.id })
          isFav.value = r.isFav
        } catch {}
      }
    }
  } catch {}
})
</script>
