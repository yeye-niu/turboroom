<template>
  <div class="home-page">
    <div class="home-content">
    <section class="hero">
      <div>
        <span class="eyebrow">MAKE ROOM FOR FOCUS</span>
        <h1>找到你的空间，<br>开启一段专注时光。</h1>
        <p class="muted">从图书馆到校园自修室，按自己的节奏安排学习。<br>选择场地、预约时段，让每一次自习都有计划。</p>
        <router-link class="button primary" to="/meets">寻找自习场地 <span aria-hidden="true">&rarr;</span></router-link>
      </div>
      <div class="hero-art" aria-hidden="true">
        <span class="eyebrow">YOUR STUDY SPACE</span>
        <div class="book"></div>
        <div class="book"></div>
        <div class="book"></div>
        <h2>留一点时间<br>给更好的自己。</h2>
        <p class="muted">图书馆 / 教学楼 / 自修室</p>
      </div>
    </section>

    <div v-if="error" class="notice error" role="alert">
      {{ error }} <button @click="loadData">重试</button>
    </div>

    <div class="section-head">
      <h2>发现自习场地</h2>
      <router-link to="/meets">查看全部 &rarr;</router-link>
    </div>
    <AppSkeleton v-if="loading" />
    <div v-else class="grid">
      <AppCard v-for="item in meetList" :key="item.meetId" :item="item" type="meet" />
    </div>

    <div class="section-head">
      <h2>校园公告</h2>
      <router-link to="/news-list">全部公告 &rarr;</router-link>
    </div>
    <div class="grid">
      <AppCard v-for="item in newsList" :key="item.newsId" :item="item" type="news" />
    </div>
    <div v-if="!loading && !newsList.length" class="empty">暂无公告</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../../api/request'
import AppCard from '../../components/AppCard.vue'
import AppSkeleton from '../../components/AppSkeleton.vue'

const loading = ref(true)
const error = ref('')
const meetList = ref([])
const newsList = ref([])

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const data = await api('/home/list') || {}
    meetList.value = data.meetList || []
  } catch (e) {
    error.value = e.message
  }
  try {
    const newsData = await api('/news/list', { page: 1, size: 6, isTotal: false })
    newsList.value = newsData.list || []
  } catch {}
  finally { loading.value = false }
}

onMounted(loadData)
</script>

<style scoped>
.home-page {
  position: relative;
  min-height: 100vh;
}

.home-content {
  position: relative;
  z-index: 1;
}
</style>
