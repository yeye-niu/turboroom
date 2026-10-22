<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>预约订单</h1>
    <p class="muted">{{ venueTitle }}</p>

    <form class="toolbar" @submit.prevent="handleSearch">
      <input v-model="search" placeholder="搜索预约号 / 姓名 / 手机号">
      <select v-model="check">
        <option value="">全部订单状态</option>
        <option value="0">待处理</option>
        <option value="1">已完成</option>
      </select>
      <button class="primary">查询</button>
    </form>

    <div class="panel">
      <h2>核销预约</h2>
      <form class="toolbar" @submit.prevent="handleScan">
        <input v-model="scanCode" placeholder="输入核销码或扫描得到的 meet=…" required>
        <button class="primary">核销</button>
      </form>
      <p class="muted">支持 USB 扫码枪输入。粘贴二维码内容也可完成核销。</p>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr><th>预约号</th><th>订单状态</th><th>用户名</th><th>手机号</th><th>场地</th><th>预约时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="x in list" :key="x.meetJoinId">
            <td>{{ x.meetJoinCode }}</td>
            <td><span class="chip">{{ getJoinStatus(x) }}</span></td>
            <td>{{ getJoinValue(x, 'name') || '未填写' }}</td>
            <td>{{ getJoinValue(x, 'phone') || '未填写' }}</td>
            <td>{{ venueTitle }}</td>
            <td>{{ x.meetJoinDay }}<br>{{ x.meetJoinTime }}</td>
            <td>
              <div class="actions">
                <button @click="toggleCheck(x)">{{ Number(x.meetJoinIsCheck) === 1 ? '撤销完成' : '完成订单' }}</button>
                <button class="danger" @click="handleDeleteJoin(x)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!list.length" class="empty">暂无记录</div>
    </div>

    <AppPagination v-if="total > 0" :total="total" :page="page" :size="size" @navigate="handlePage" />

    <div class="panel">
      <h2>导出名单</h2>
      <form class="toolbar" @submit.prevent="handleExport">
        <div class="field"><label>开始日期</label><input type="date" v-model="exportStart"></div>
        <div class="field"><label>结束日期</label><input type="date" v-model="exportEnd"></div>
        <button>导出 Excel</button>
      </form>
      <div class="actions">
        <button @click="handlePrint">打印当前页</button>
        <button class="danger" @click="handleClear">清空该场地所有预约</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../api/request'
import { useToast } from '../../composables/useToast'
import { parseJson, exportDownload } from '../../composables/useHelpers'
import AppPagination from '../../components/AppPagination.vue'

const route = useRoute()
const router = useRouter()
const { toast } = useToast()

const id = route.query.id
const venueTitle = ref('')
const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(12)
const search = ref('')
const check = ref('')
const scanCode = ref('')
const exportStart = ref('')
const exportEnd = ref('')

function getJoinStatus(x) {
  return Number(x.meetJoinStatus) === 0 ? '已取消' : Number(x.meetJoinIsCheck) === 1 ? '已完成' : '待处理'
}
function getJoinValue(record, mark) {
  return parseJson(record.meetJoinForms, []).find(x => x.mark === mark)?.val || ''
}

async function loadVenue() {
  try {
    const r = await api('/admin/meet/detail', { id })
    venueTitle.value = r?.meetTitle || ''
  } catch {}
}

async function loadData() {
  try {
    const params = { page: page.value, size: size.value, isTotal: true, meetId: id }
    if (search.value) params.search = search.value
    if (check.value !== '') { params.sortType = 'check'; params.sortVal = check.value }
    const r = await api('/admin/meet/join/list', params)
    list.value = r.list || []
    total.value = Number(r.total) || 0
  } catch { list.value = []; total.value = 0 }
}

async function handleScan() {
  const code = scanCode.value.trim().replace(/^meet=/, '')
  if (!code) { toast('请输入核销码'); return }
  try {
    await api('/admin/meet/join/scan', { meetId: id, code })
    toast('核销完成')
    scanCode.value = ''
    await loadData()
  } catch (e) { toast(e.message) }
}

async function toggleCheck(x) {
  try {
    await api('/admin/meet/join/check', { meetJoinId: x.meetJoinId, flag: Number(x.meetJoinIsCheck) === 1 ? 0 : 1 })
    await loadData()
  } catch (e) { toast(e.message) }
}

async function handleDeleteJoin(x) {
  if (!confirm('删除该预约？')) return
  try {
    await api('/admin/meet/join/del', { meetJoinId: x.meetJoinId })
    await loadData()
  } catch (e) { toast(e.message) }
}

async function handleExport() {
  if (exportStart.value > exportEnd.value) { toast('结束日期须不早于开始日期'); return }
  try {
    const result = await api('/admin/meet/join/export', { meetId: id, start: exportStart.value, end: exportEnd.value })
    const url = typeof result === 'string' ? result : result?.url || result?.fileID || result?.path
    if (url) exportDownload(url)
  } catch (e) { toast(e.message) }
}

async function handleClear() {
  if (!confirm('清空此场地全部预约记录？不可撤销。')) return
  try {
    await api('/admin/meet/join/clear', { meetId: id })
    await loadData()
  } catch (e) { toast(e.message) }
}

function handlePrint() { window.print() }
function handleSearch() {
  router.push({ path: '/admin/joins', query: { id, search: search.value, check: check.value } })
}
function handlePage(p, s) {
  router.push({ path: '/admin/joins', query: { id, page: p, size: s, search: search.value, check: check.value } })
}

onMounted(() => { loadVenue(); loadData() })
watch(() => route.query, () => {
  page.value = Number(route.query.page) || 1
  size.value = Number(route.query.size) || 12
  search.value = route.query.search || ''
  check.value = route.query.check || ''
  loadData()
})
</script>
