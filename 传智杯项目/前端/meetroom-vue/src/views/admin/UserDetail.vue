<template>
  <div v-if="data">
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>用户资料</h1>
    <p class="muted">{{ data.userName }}</p>

    <div class="panel">
      <dl class="row-data">
        <dt>账号</dt>
        <dd>{{ data.userAccount }}</dd>
        <template v-for="f in forms" :key="f.mark">
          <dt>{{ f.title }}</dt>
          <dd>{{ f.val }}</dd>
        </template>
      </dl>
    </div>
  </div>
  <div v-else class="empty">用户不存在</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../../api/request'
import { parseJson } from '../../composables/useHelpers'

const route = useRoute()
const data = ref(null)
const forms = ref([])

onMounted(async () => {
  try {
    const r = await api('/admin/user/detail', { id: route.query.id })
    data.value = r
    forms.value = parseJson(r?.userForms, [])
  } catch {}
})
</script>
