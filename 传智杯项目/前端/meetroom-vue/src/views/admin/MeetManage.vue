<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>场地管理</h1>

    <form class="toolbar" @submit.prevent="handleSearch">
      <input v-model="search" placeholder="搜索名称或关键词">
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
        搜索
      </SpecularButton>
    </form>

    <div class="actions">
      <SpecularButton
        size="md"
        :radius="12"
        tint="#1a7a6b"
        :tintOpacity="0.2"
        textColor="#ffffff"
        lineColor="#ffffff"
        baseColor="#1a7a6b"
        :intensity="0.9"
        :idleIntensity="0.4"
        @click="router.push('/admin/edit?type=meet')"
      >
        新增场地
      </SpecularButton>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr><th>名称</th><th>分类</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="x in list" :key="x.meetId">
            <td>{{ x.meetTitle }}<br><small>#{{ x.meetId }}</small></td>
            <td>{{ x.meetCateName }}<br><small>开放 {{ getDays(x).length }} 天 · 每时段 {{ x.meetMaxCnt }} 人</small></td>
            <td>{{ Number(x.meetStatus) === 1 ? '正常' : '停用 / 下架' }}{{ Number(x.meetVouch) === 1 ? ' · 推荐' : '' }}</td>
            <td>
              <div class="actions">
                <SpecularButton
                  size="sm"
                  :radius="8"
                  tint="#1a7a6b"
                  :tintOpacity="0.15"
                  textColor="#1a7a6b"
                  lineColor="#1a7a6b"
                  baseColor="#1a7a6b"
                  :intensity="0.8"
                  :idleIntensity="0.4"
                  @click="router.push(`/admin/edit?type=meet&id=${x.meetId}`)"
                >
                  编辑
                </SpecularButton>
                <SpecularButton
                  size="sm"
                  :radius="8"
                  tint="#6b7280"
                  :tintOpacity="0.1"
                  textColor="#374151"
                  lineColor="#6b7280"
                  baseColor="#6b7280"
                  :intensity="0.7"
                  :idleIntensity="0.3"
                  @click="router.push(`/admin/days?id=${x.meetId}`)"
                >
                  开放日期
                </SpecularButton>
                <SpecularButton
                  size="sm"
                  :radius="8"
                  tint="#6b7280"
                  :tintOpacity="0.1"
                  textColor="#374151"
                  lineColor="#6b7280"
                  baseColor="#6b7280"
                  :intensity="0.7"
                  :idleIntensity="0.3"
                  @click="router.push(`/admin/joins?id=${x.meetId}`)"
                >
                  预约名单 / 核销
                </SpecularButton>
                <SpecularButton
                  size="sm"
                  :radius="8"
                  tint="#f59e0b"
                  :tintOpacity="0.1"
                  textColor="#d97706"
                  lineColor="#f59e0b"
                  baseColor="#f59e0b"
                  :intensity="0.7"
                  :idleIntensity="0.3"
                  @click="toggleStatus(x)"
                >
                  {{ Number(x.meetStatus) === 1 ? '停用' : '启用' }}
                </SpecularButton>
                <SpecularButton
                  size="sm"
                  :radius="8"
                  tint="#6b7280"
                  :tintOpacity="0.1"
                  textColor="#374151"
                  lineColor="#6b7280"
                  baseColor="#6b7280"
                  :intensity="0.7"
                  :idleIntensity="0.3"
                  @click="handleOrder(x)"
                >
                  排序
                </SpecularButton>
                <SpecularButton
                  size="sm"
                  :radius="8"
                  tint="#8b5cf6"
                  :tintOpacity="0.1"
                  textColor="#7c3aed"
                  lineColor="#8b5cf6"
                  baseColor="#8b5cf6"
                  :intensity="0.7"
                  :idleIntensity="0.3"
                  @click="toggleVouch(x)"
                >
                  {{ Number(x.meetVouch) === 1 ? '取消推荐' : '推荐' }}
                </SpecularButton>
                <SpecularButton
                  size="sm"
                  :radius="8"
                  tint="#ef4444"
                  :tintOpacity="0.1"
                  textColor="#dc2626"
                  lineColor="#ef4444"
                  baseColor="#ef4444"
                  :intensity="0.7"
                  :idleIntensity="0.3"
                  @click="handleDelete(x)"
                >
                  删除
                </SpecularButton>
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
import { parseJson } from '../../composables/useHelpers'
import AppPagination from '../../components/AppPagination.vue'

const route = useRoute()
const router = useRouter()
const { toast } = useToast()

const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(12)
const search = ref('')

function getDays(x) { return parseJson(x.meetDays, []) }

async function loadData() {
  try {
    const r = await api('/admin/meet/list', { page: page.value, size: size.value, isTotal: true, search: search.value })
    list.value = r.list || []
    total.value = Number(r.total) || 0
  } catch { list.value = []; total.value = 0 }
}

async function doAction(action, body) {
  await api(`/admin/meet/${action}`, body)
  toast('操作完成')
  await loadData()
}

function toggleStatus(x) { doAction('status', { id: x.meetId, status: Number(x.meetStatus) === 1 ? 0 : 1 }) }
function toggleVouch(x) { doAction('vouch', { id: x.meetId, vouch: Number(x.meetVouch) === 1 ? 0 : 1 }) }
function handleOrder(x) {
  const val = prompt('输入排序值（0–9999）', x.meetOrder || 0)
  if (val === null) return
  if (!/^\d{1,4}$/.test(val)) { toast('请输入 0–9999 的整数'); return }
  doAction('order', { id: x.meetId, order: Number(val) })
}
function handleDelete(x) {
  if (!confirm('确定删除这条记录？此操作不可撤销。')) return
  doAction('del', { id: x.meetId })
}

function handleSearch() { router.push({ path: '/admin/meets', query: { page: 1, search: search.value } }) }
function handlePage(p, s) { router.push({ path: '/admin/meets', query: { page: p, size: s, search: search.value } }) }

onMounted(loadData)
watch(() => route.query, () => {
  page.value = Number(route.query.page) || 1
  size.value = Number(route.query.size) || 12
  search.value = route.query.search || ''
  loadData()
})
</script>
