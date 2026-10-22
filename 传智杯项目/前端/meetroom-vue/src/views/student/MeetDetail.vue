<template>
  <div v-if="data">
    <router-link to="/meets">&larr; 返回列表</router-link>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>{{ data.meetTitle }}</h1>
    <p class="muted">{{ data.meetCateName }}</p>

    <div class="layout">
      <section>
        <img
          v-if="coverUrl"
          class="cover detail-cover"
          loading="lazy"
          :src="coverUrl"
          :alt="data.meetTitle"
        >
        <div v-else class="cover-placeholder" aria-hidden="true">专注空间</div>
        <div class="panel">
          <h2>场地介绍与预约须知</h2>
          <div class="chips">
            <span v-for="tag in tags" :key="tag" class="chip">{{ tag }}</span>
          </div>
          <div v-for="(node, i) in richContent" :key="i">
            <img v-if="node.type === 'img'" class="rich" :src="node.val" alt="场地配图">
            <p v-else class="rich">{{ node.val }}</p>
          </div>
          <button @click="toggleFav">{{ isFav ? '取消收藏' : '收藏' }}</button>
        </div>
      </section>

      <aside class="panel">
        <h2>选择预约时段</h2>
        <p class="muted">每时段最多 {{ data.meetMaxCnt }} 人</p>
        <div class="field">
          <label for="date">开放日期</label>
          <select id="date" v-model="selectedDay" @change="updateSlots">
            <option v-for="(d, i) in days" :key="i" :value="i">{{ d.label || d }}</option>
          </select>
        </div>
        <div id="slots">
          <div v-if="!currentSlots.length" class="empty">该日期暂无可约时段</div>
          <div v-for="(t, i) in currentSlots" :key="i" class="field">
            <button
              class="slot"
              :disabled="getRemaining(t) <= 0"
              @click="goBooking(t)"
            >
              <span>{{ t.label }}</span>
              <span class="muted">{{ getRemaining(t) > 0 ? `余 ${getRemaining(t)} 人` : '已满' }}</span>
            </button>
          </div>
        </div>
        <p class="muted">预约后可在"我的预约"查看凭证。</p>
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
const selectedDay = ref(0)

const obj = computed(() => data.value ? parseJson(data.value.meetObj) : {})
const coverUrl = computed(() => {
  const raw = Array.isArray(obj.value.cover) ? obj.value.cover[0] : obj.value.cover
  return getImageUrl(raw)
})
const tags = computed(() => obj.value.tag || [])
const richContent = computed(() => data.value ? getRichContent(obj.value.desc) : [])
const days = computed(() => {
  if (!data.value) return []
  let d = parseJson(data.value.meetDays, [])
  if (!Array.isArray(d)) d = []
  return d
})
const currentSlots = computed(() => {
  const d = days.value[selectedDay.value]
  return d?.times || []
})

function getRemaining(t) {
  return Math.max(0, Number(data.value.meetMaxCnt) - Number(t.cnt || 0))
}

function goBooking(t) {
  if (!userStore.cust) {
    router.push('/login')
    return
  }
  const d = days.value[selectedDay.value]
  router.push({
    path: '/join',
    query: { id: route.query.id, day: d.label, time: t.label }
  })
}

async function toggleFav() {
  if (!userStore.cust) { router.push('/login'); return }
  try {
    const r = await api('/fav/update', {
      oid: route.query.id,
      title: data.value.meetTitle,
      type: '预约',
      path: `#/meet?id=${route.query.id}`
    })
    isFav.value = r.isFav
    toast(r.isFav ? '已收藏' : '已取消收藏')
  } catch (e) { toast(e.message) }
}

function updateSlots() {}

onMounted(async () => {
  try {
    data.value = await api('/meet/view', { id: route.query.id })
    if (data.value) {
      historyAdd('meet', route.query.id, data.value.meetTitle)
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
