<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>我的预约</h1>
    <p class="muted">查看预约状态、出示凭证或取消预约。</p>

    <form class="toolbar" @submit.prevent="handleSearch">
      <input v-model="search" aria-label="搜索关键词" placeholder="搜索名称或关键词">
      <button class="primary" type="submit">搜索</button>
    </form>

    <section class="panel">
      <div v-if="list.length">
        <article v-for="r in list" :key="r.meetJoinId" class="record">
          <div>
            <h3>{{ r.meetTitle || '自习预约' }}</h3>
            <p>{{ r.meetJoinDay }} / {{ r.meetJoinTime }}</p>
            <span class="chip">{{ getStatus(r) }}</span>
          </div>
          <router-link class="button" :to="`/booking?id=${r.meetJoinId}`">查看凭证</router-link>
        </article>
      </div>
      <div v-else class="empty">暂无预约记录，先去挑选一个自习场地吧。</div>
    </section>

    <AppPagination
      v-if="total > 0"
      :total="total"
      :page="page"
      :size="size"
      @navigate="handlePage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../api/request'
import { statusText } from '../../composables/useHelpers'
import AppPagination from '../../components/AppPagination.vue'

const route = useRoute()
const router = useRouter()

const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(12)
const search = ref('')

function getStatus(r) { return statusText(r) }

function readQuery() {
  page.value = Number(route.query.page) || 1
  size.value = Number(route.query.size) || 12
  search.value = route.query.search || ''
}

async function loadData() {
  try {
    const r = await api('/meet/my/join/list', {
      page: page.value, size: size.value, isTotal: true, search: search.value
    })
    list.value = r.list || []
    total.value = Number(r.total) || 0
  } catch { list.value = []; total.value = 0 }
}

function handleSearch() {
  router.push({ path: '/bookings', query: { page: 1, size: size.value, search: search.value } })
}

function handlePage(p, s) {
  router.push({ path: '/bookings', query: { page: p, size: s, search: search.value } })
}

onMounted(() => { readQuery(); loadData() })
watch(() => route.query, () => { readQuery(); loadData() })
</script>
