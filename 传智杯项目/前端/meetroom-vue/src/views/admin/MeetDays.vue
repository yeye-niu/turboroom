<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>设置开放日期</h1>
    <p class="muted">{{ title }}</p>

    <div class="panel form">
      <div v-if="error" class="notice error" role="alert">{{ error }}</div>
      <form @submit.prevent="handleSave">
        <div class="field">
          <label>日期（每行一条）*</label>
          <textarea v-model="days" required></textarea>
          <small>使用 YYYY-MM-DD 格式，如 2026-10-15。</small>
        </div>
        <button class="primary" type="submit" :disabled="submitting">
          {{ submitting ? '保存中...' : '保存' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../api/request'
import { useToast } from '../../composables/useToast'
import { parseJson } from '../../composables/useHelpers'

const route = useRoute()
const router = useRouter()
const { toast } = useToast()

const title = ref('')
const days = ref('')
const error = ref('')
const submitting = ref(false)

onMounted(async () => {
  try {
    const r = await api('/admin/meet/detail', { id: route.query.id })
    title.value = r?.meetTitle || ''
    days.value = parseJson(r?.meetDays, []).join('\n')
  } catch {}
})

async function handleSave() {
  error.value = ''
  submitting.value = true
  try {
    const list = [...new Set(days.value.split(/\s+/).filter(Boolean))].sort()
    if (!list.length || list.some(d => !/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(Date.parse(d)) || new Date(d).toISOString().slice(0, 10) !== d)) {
      throw new Error('请填写有效的 YYYY-MM-DD 日期')
    }
    await api('/admin/meet/set/days', { meetId: route.query.id, days: JSON.stringify(list) })
    toast('开放日期已保存')
    router.push('/admin/meets')
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>
