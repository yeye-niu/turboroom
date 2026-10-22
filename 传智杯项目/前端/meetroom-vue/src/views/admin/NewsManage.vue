<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>公告管理</h1>

    <form class="toolbar" @submit.prevent="handleSearch">
      <input v-model="search" placeholder="搜索名称或关键词">
      <button class="primary" type="submit">搜索</button>
    </form>

    <div class="actions">
      <router-link class="button primary" to="/admin/edit?type=news">新增公告</router-link>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr><th>名称</th><th>分类</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="x in list" :key="x.newsId">
            <td>{{ x.newsTitle }}<br><small>#{{ x.newsId }}</small></td>
            <td>{{ x.newsCateName }}</td>
            <td>{{ Number(x.newsStatus) === 1 ? '正常' : '停用 / 下架' }}{{ Number(x.newsVouch) === 1 ? ' · 推荐' : '' }}</td>
            <td>
              <div class="actions">
                <router-link class="button" :to="`/admin/edit?type=news&id=${x.newsId}`">编辑</router-link>
                <button @click="toggleStatus(x)">{{ Number(x.newsStatus) === 1 ? '停用' : '启用' }}</button>
                <button @click="handleOrder(x)">排序</button>
                <button @click="toggleVouch(x)">{{ Number(x.newsVouch) === 1 ? '取消推荐' : '推荐' }}</button>
                <button class="danger" @click="handleDelete(x)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!list.length" class="empty">暂无记录</div>
    </div>

    <AppPagination v-if="total > 0" :total="total" :page="page" :size="size" @navigate="handlePage" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../api/request'
import { useToast } from '../../composables/useToast'
import AppPagination from '../../components/AppPagination.vue'

const route = useRoute()
const router = useRouter()
const { toast } = useToast()

const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(12)
const search = ref('')

async function loadData() {
  try {
    const r = await api('/admin/news/list', { page: page.value, size: size.value, isTotal: true, search: search.value })
    list.value = r.list || []
    total.value = Number(r.total) || 0
  } catch { list.value = []; total.value = 0 }
}

async function doAction(action, body) {
  await api(`/admin/news/${action}`, body)
  toast('操作完成')
  await loadData()
}

function toggleStatus(x) { doAction('status', { id: x.newsId, status: Number(x.newsStatus) === 1 ? 0 : 1 }) }
function toggleVouch(x) { doAction('vouch', { id: x.newsId, vouch: Number(x.newsVouch) === 1 ? 0 : 1 }) }
function handleOrder(x) {
  const val = prompt('输入排序值（0–9999）', x.newsOrder || 0)
  if (val === null) return
  if (!/^\d{1,4}$/.test(val)) { toast('请输入 0–9999 的整数'); return }
  doAction('order', { id: x.newsId, order: Number(val) })
}
function handleDelete(x) {
  if (!confirm('确定删除这条记录？此操作不可撤销。')) return
  doAction('del', { id: x.newsId })
}

function handleSearch() { router.push({ path: '/admin/news', query: { page: 1, search: search.value } }) }
function handlePage(p, s) { router.push({ path: '/admin/news', query: { page: p, size: s, search: search.value } }) }

onMounted(loadData)
watch(() => route.query, () => {
  page.value = Number(route.query.page) || 1
  size.value = Number(route.query.size) || 12
  search.value = route.query.search || ''
  loadData()
})
</script>
