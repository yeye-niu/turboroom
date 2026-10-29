<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>找到适合你的自习空间</h1>
    <TextLoop
      text="找到适合你的自习空间 ✦ TurboRoom ✦ Campus Study ✦ 自习预约 ✦ 专注空间"
      shape="wave"
      :speed="60"
      direction="forward"
      separator="✦"
      :curviness="30"
      :tilt="-2"
      :fontSize="24"
      :fontWeight="700"
      :letterSpacing="3"
      :uppercase="false"
      :ribbon="true"
      ribbonColor="#1a7a6b"
      :ribbonWidth="42"
      :edgeFade="0.5"
      :pauseOnHover="true"
    />
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
      <SpecularButton
        size="md"
        :radius="10"
        tint="#1a7a6b"
        :tintOpacity="0.2"
        textColor="#ffffff"
        lineColor="#ffffff"
        baseColor="#1a7a6b"
        :intensity="0.9"
        :idleIntensity="0.4"
        type="submit"
      >
        查询
      </SpecularButton>
      <SpecularButton
        size="md"
        :radius="10"
        tint="#6b7280"
        :tintOpacity="0.1"
        textColor="#374151"
        lineColor="#6b7280"
        baseColor="#6b7280"
        :intensity="0.7"
        :idleIntensity="0.3"
        @click="router.push('/meets')"
      >
        重置
      </SpecularButton>
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
import TextLoop from '../../components/TextLoop.vue'

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
