<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>内容设置</h1>

    <div class="actions">
      <button :class="{ primary: key === 'SETUP_CONTENT_ABOUT' }" @click="switchKey('SETUP_CONTENT_ABOUT')">关于我们</button>
      <button :class="{ primary: key === 'SETUP_YS' }" @click="switchKey('SETUP_YS')">用户使用协议</button>
    </div>

    <div class="panel form">
      <div v-if="error" class="notice error" role="alert">{{ error }}</div>
      <form @submit.prevent="handleSave">
        <div class="field">
          <label>{{ key === 'SETUP_YS' ? '用户使用协议' : '关于我们' }} *</label>
          <textarea v-model="content" required></textarea>
        </div>
        <div class="field">
          <label>正文配图地址（每行一张）</label>
          <textarea v-model="images"></textarea>
          <small>可选，图片会展示在正文后。</small>
        </div>
        <SpecularButton
          class="primary"
          size="lg"
          :radius="14"
          tint="#1a7a6b"
          :tintOpacity="0.2"
          textColor="#ffffff"
          lineColor="#ffffff"
          baseColor="#1a7a6b"
          :intensity="0.9"
          :idleIntensity="0.4"
          type="submit"
          :disabled="submitting"
        >
          {{ submitting ? '保存中...' : '保存' }}
        </SpecularButton>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../api/request'
import { useToast } from '../../composables/useToast'
import { parseJson, parseContent } from '../../composables/useHelpers'

const route = useRoute()
const router = useRouter()
const { toast } = useToast()

const key = ref('SETUP_CONTENT_ABOUT')
const content = ref('')
const images = ref('')
const original = ref([])
const error = ref('')
const submitting = ref(false)

function switchKey(k) {
  router.push({ path: '/admin/setup', query: { key: k } })
}

async function loadContent() {
  try {
    const r = await api('/setup/get', { key: key.value }, 'admin')
    const arr = parseJson(r, [])
    original.value = Array.isArray(arr) ? arr : []
    content.value = original.value.filter(n => n.type === 'text').map(n => n.val).join('\n\n')
    images.value = original.value.filter(n => n.type === 'img').map(n => n.val).join('\n')
  } catch {}
}

async function handleSave() {
  error.value = ''
  submitting.value = true
  try {
    const result = parseContent(content.value, images.value, original.value)
    await api('/admin/setup/set', { key: key.value, content: JSON.stringify(result) })
    toast('内容已保存')
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  key.value = route.query.key || 'SETUP_CONTENT_ABOUT'
  loadContent()
})
watch(() => route.query, () => {
  key.value = route.query.key || 'SETUP_CONTENT_ABOUT'
  loadContent()
})
</script>
