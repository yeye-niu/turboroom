<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>校园公告</h1>
    <p class="muted">校园资讯与预约通知。</p>

    <form class="toolbar" @submit.prevent="handleSearch">
      <input v-model="search" aria-label="搜索关键词" placeholder="搜索名称或关键词">
      <select v-model="cateId" aria-label="分类">
        <option value="">全部分类</option>
        <option v-for="(c, i) in newsCategories" :key="i" :value="String(i + 1)">{{ c }}</option>
      </select>
      <button class="primary" type="submit">搜索</button>
    </form>

    <AppSkeleton v-if="loading" />
    <template v-else>
      <div class="grid">
        <AppCard v-for="item in list" :key="item.newsId" :item="item" type="news" />
      </div>
      <div v-if="!list.length" class="empty">暂无公告</div>
      <AppPagination
        v-if="total > 0"
        :total="total"
        :page="page"
        :size="size"
        @navigate="handlePage"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../api/request'
import { newsCategories } from '../../composables/useHelpers'
import AppCard from '../../components/AppCard.vue'
import AppPagination from '../../components/AppPagination.vue'
import AppSkeleton from '../../components/AppSkeleton.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(12)
const search = ref('')
const cateId = ref('')

function readQuery() {
  const q = route.query
  page.value = Number(q.page) || 1
  size.value = Number(q.size) || 12
  search.value = q.search || ''
  cateId.value = q.cateId || ''
}

async function loadData() {
  loading.value = true
  try {
    const filters = { page: page.value, size: size.value, isTotal: true }
    if (cateId.value) filters.cateId = Number(cateId.value)
    const r = await api('/news/list', filters)
    list.value = r.list || []
    total.value = Number(r.total) || 0
  } catch { list.value = []; total.value = 0 }
  finally { loading.value = false }
}

function handleSearch() {
  const query = { page: 1, size: size.value, search: search.value }
  if (cateId.value) query.cateId = cateId.value
  router.push({ path: '/news-list', query })
}

function handlePage(p, s) {
  const query = { page: p, size: s, search: search.value }
  if (cateId.value) query.cateId = cateId.value
  router.push({ path: '/news-list', query })
}

onMounted(() => { readQuery(); loadData() })
watch(() => route.query, () => { readQuery(); loadData() })
</script>
