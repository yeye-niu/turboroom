<template>
  <div>
    <router-link :to="`/meet?id=${$route.query.id}`">&larr; 返回场地</router-link>
    <div class="panel form">
      <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
      <h1>确认预约</h1>
      <p class="muted">{{ info?.meetTitle }}</p>
      <div class="notice">{{ $route.query.day }} / {{ $route.query.time }}</div>

      <div v-if="error" class="notice error" role="alert" tabindex="-1" ref="errorRef">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div v-for="f in joinFields" :key="f[0]" class="field">
          <label :for="'f-' + f[0]">{{ f[1] }} *</label>
          <input
            :id="'f-' + f[0]"
            :type="f[2] === 'tel' ? 'tel' : 'text'"
            v-model="form[f[0]]"
            required
            :pattern="f[2] === 'tel' ? '1[0-9]{10}' : undefined"
          >
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
          {{ submitting ? '提交中...' : '提交预约' }}
        </SpecularButton>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../api/request'
import { useToast } from '../../composables/useToast'
import { joinFields, parseJson, buildPayload } from '../../composables/useHelpers'

const route = useRoute()
const router = useRouter()
const { toast } = useToast()

const info = ref(null)
const form = reactive({ name: '', phone: '' })
const error = ref('')
const submitting = ref(false)
const errorRef = ref(null)

onMounted(async () => {
  try {
    info.value = await api('/meet/detail/for/join', {
      meetId: route.query.id,
      day: route.query.day,
      time: route.query.time
    })
    if (info.value) {
      const myForms = parseJson(info.value.myForms, [])
      for (const f of myForms) {
        if (form[f.mark] !== undefined) form[f.mark] = f.val
      }
    }
  } catch {}
})

async function handleSubmit() {
  error.value = ''
  submitting.value = true
  try {
    const input = {
      meetId: route.query.id,
      day: route.query.day,
      time: route.query.time,
      ...buildPayload(joinFields, form)
    }

    const before = await api('/meet/my/join/list', { page: 1, size: 100, isTotal: true })
    const ids = new Set((before.list || []).map(x => String(x.meetJoinId)))

    await api('/meet/join', input)

    const after = await api('/meet/my/join/list', { page: 1, size: 100, isTotal: true })
    const saved = (after.list || []).find(x =>
      !ids.has(String(x.meetJoinId)) &&
      String(x.meetJoinMeetId) === String(input.meetId) &&
      x.meetJoinDay === input.day &&
      x.meetJoinTime === input.time &&
      Number(x.meetJoinStatus) !== 0
    )

    if (!saved) {
      throw new Error('服务已响应，但未发现新增预约记录，本次预约尚未确认。')
    }

    toast('预约已保存')
    router.push('/booking?id=' + saved.meetJoinId)
  } catch (e) {
    error.value = e.message
    await nextTick()
    errorRef.value?.focus()
  } finally {
    submitting.value = false
  }
}
</script>
