<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>我的收藏</h1>

    <div class="panel">
      <div v-if="list.length">
        <article v-for="item in list" :key="item.favOid" class="record">
          <a :href="getLink(item)">{{ item.favTitle }}</a>
          <button @click="handleRemove(item.favOid)">移除收藏</button>
        </article>
      </div>
      <div v-else class="empty">暂无收藏</div>
    </div>

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
import { useToast } from '../../composables/useToast'
import { favouriteLink } from '../../composables/useHelpers'
import AppPagination from '../../components/AppPagination.vue'

const route = useRoute()
const router = useRouter()
const { toast } = useToast()

const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(12)

function getLink(record) { return favouriteLink(record) }

async function loadData() {
  try {
    const r = await api('/fav/my/list', { page: page.value, size: size.value, isTotal: true })
    list.value = r.list || []
    total.value = Number(r.total) || 0
  } catch { list.value = []; total.value = 0 }
}

async function handleRemove(oid) {
  try {
    await api('/fav/del', { oid })
    list.value = list.value.filter(x => String(x.favOid) !== String(oid))
    toast('已移除收藏')
  } catch (e) { toast(e.message) }
}

function handlePage(p, s) {
  router.push({ path: '/favourites', query: { page: p, size: s } })
}

onMounted(loadData)
watch(() => route.query, () => {
  page.value = Number(route.query.page) || 1
  size.value = Number(route.query.size) || 12
  loadData()
})
</script>
