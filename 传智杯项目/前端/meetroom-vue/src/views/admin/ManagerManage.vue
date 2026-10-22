<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>管理员管理</h1>

    <form class="toolbar" @submit.prevent="handleSearch">
      <input v-model="search" placeholder="搜索名称或关键词">
      <button class="primary" type="submit">搜索</button>
    </form>

    <div class="actions">
      <router-link class="button primary" to="/admin/edit?type=mgr">新增管理员</router-link>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr><th>账号</th><th>信息</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="x in list" :key="x.adminId">
            <td>{{ x.adminName }}<br><small>#{{ x.adminId }}</small></td>
            <td>{{ x.adminDesc }}</td>
            <td>{{ Number(x.adminStatus) === 1 ? '正常' : '停用 / 下架' }}</td>
            <td>
              <div class="actions">
                <router-link class="button" :to="`/admin/edit?type=mgr&id=${x.adminId}`">编辑</router-link>
                <button @click="toggleStatus(x)">{{ Number(x.adminStatus) === 1 ? '停用' : '启用' }}</button>
                <button @click="handleDelete(x)">删除</button>
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
    const r = await api('/admin/mgr/list', { page: page.value, size: size.value, isTotal: true, search: search.value })
    list.value = r.list || []
    total.value = Number(r.total) || 0
  } catch { list.value = []; total.value = 0 }
}

async function doAction(action, body) {
  await api(`/admin/mgr/${action}`, body)
  toast('操作完成')
  await loadData()
}

function toggleStatus(x) { doAction('status', { id: x.adminId, status: Number(x.adminStatus) === 1 ? 0 : 1 }) }
function handleDelete(x) {
  if (!confirm('确定删除这条记录？此操作不可撤销。')) return
  doAction('del', { id: x.adminId })
}

function handleSearch() { router.push({ path: '/admin/managers', query: { page: 1, search: search.value } }) }
function handlePage(p, s) { router.push({ path: '/admin/managers', query: { page: p, size: s, search: search.value } }) }

onMounted(loadData)
watch(() => route.query, () => {
  page.value = Number(route.query.page) || 1
  size.value = Number(route.query.size) || 12
  search.value = route.query.search || ''
  loadData()
})
</script>
