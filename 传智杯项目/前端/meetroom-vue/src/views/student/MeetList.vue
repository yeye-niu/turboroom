<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>找到适合你的自习空间</h1>
    <p class="muted">按教学楼、教室种类和开放日期查找场地。</p>

    <form class="toolbar" @submit.prevent="handleSearch">
      <input v-model="filters.search" aria-label="搜索名称或关键词" placeholder="搜索名称或关键词">
      <select v-model="filters.building" aria-label="教学楼">
        <option value="">全部教学楼</option>
        <option v-for="b in buildings" :key="b" :value="b">{{ b }}</option>
      </select>
      <select v-model="filters.roomType" aria-label="教室种类">
        <option value="">全部教室种类</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <input v-model="filters.day" type="date" aria-label="开放日期">
      <button class="primary" type="submit">查询</button>
      <router-link class="button" to="/meets">重置</router-link>
    </form>

    <AppSkeleton v-if="loading" />
    <template v-else>
      <div class="grid">
        <AppCard v-for="item in list" :key="item.meetId" :item="item" type="meet" />
      </div>
      <div v-if="!list.length" class="empty">暂无开放场地，请稍后再来。</div>
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
import { categories, buildings } from '../../composables/useHelpers'
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

const filters = ref({
  search: '',
  building: '',
  roomType: '',
  day: ''
})

function readQuery() {
  const q = route.query
  page.value = Number(q.page) || 1
  size.value = Number(q.size) || 12
  filters.value.search = q.search || ''
  filters.value.building = q.building || ''
  filters.value.roomType = q.roomType || ''
  filters.value.day = q.day || ''
}

async function loadData() {
  loading.value = true
  try {
    const r = await api('/meet/list', {
      page: page.value,
      size: size.value,
      isTotal: true,
      ...filters.value
    })
    list.value = r.list || []
    total.value = Number(r.total) || 0
  } catch { list.value = []; total.value = 0 }
  finally { loading.value = false }
}

function handleSearch() {
  router.push({ path: '/meets', query: { ...filters.value, page: 1, size: size.value } })
}

function handlePage(p, s) {
  router.push({ path: '/meets', query: { ...filters.value, page: p, size: s } })
}

onMounted(() => { readQuery(); loadData() })
watch(() => route.query, () => { readQuery(); loadData() })
</script>
