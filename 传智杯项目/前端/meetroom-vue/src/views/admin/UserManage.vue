<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>用户管理</h1>

    <form class="toolbar" @submit.prevent="handleSearch">
      <input v-model="search" placeholder="搜索名称或关键词">
      <button class="primary" type="submit">搜索</button>
    </form>

    <div class="actions">
      <button @click="handleExport">导出用户</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr><th>账号</th><th>信息</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="x in list" :key="x.userId">
            <td>{{ x.userName }}<br><small>#{{ x.userId }}</small></td>
            <td>{{ x.userAccount }}</td>
            <td>{{ Number(x.userStatus) === 1 ? '正常' : '停用 / 下架' }}</td>
            <td>
              <div class="actions">
                <router-link class="button" :to="`/admin/user?id=${x.userId}`">资料</router-link>
                <button @click="resetPwd(x)">重置密码</button>
                <button @click="toggleStatus(x)">{{ Number(x.userStatus) === 1 ? '停用' : '启用' }}</button>
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
import { exportDownload } from '../../composables/useHelpers'
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
    const r = await api('/admin/user/list', { page: page.value, size: size.value, isTotal: true, search: search.value })
    list.value = r.list || []
    total.value = Number(r.total) || 0
  } catch { list.value = []; total.value = 0 }
}

async function doAction(action, body) {
  await api(`/admin/user/${action}`, body)
  toast('操作完成')
  await loadData()
}

function toggleStatus(x) { doAction('status', { id: x.userId, status: Number(x.userStatus) === 1 ? 0 : 1 }) }
function resetPwd(x) {
  const pwd = prompt('输入新密码（至少 6 位）')
  if (pwd === null) return
  if (pwd.length < 6) { toast('密码至少 6 位'); return }
  doAction('pwd', { id: x.userId, pwd })
}
function handleDelete(x) {
  if (!confirm('确定删除这条记录？此操作不可撤销。')) return
  doAction('del', { id: x.userId })
}

async function handleExport() {
  try {
    const result = await api('/admin/user/export', { fmt: 'xlsx' })
    const url = typeof result === 'string' ? result : result?.url || result?.fileID || result?.path
    if (url) exportDownload(url)
  } catch (e) { toast(e.message) }
}

function handleSearch() { router.push({ path: '/admin/users', query: { page: 1, search: search.value } }) }
function handlePage(p, s) { router.push({ path: '/admin/users', query: { page: p, size: s, search: search.value } }) }

onMounted(loadData)
watch(() => route.query, () => {
  page.value = Number(route.query.page) || 1
  size.value = Number(route.query.size) || 12
  search.value = route.query.search || ''
  loadData()
})
</script>
