<template>
  <div v-if="data">
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>预约凭证</h1>
    <p class="muted">{{ data.meetTitle }}</p>

    <div class="panel form center">
      <h2>{{ data.meetTitle }}</h2>
      <p>{{ data.meetJoinDay }} / {{ data.meetJoinTime }}</p>
      <span class="chip">{{ statusText(data) }}</span>

      <template v-if="active && data.meetJoinCode">
        <canvas ref="qrCanvas" class="qr" width="280" height="280"></canvas>
        <p>核销码：<strong>{{ data.meetJoinCode }}</strong></p>
      </template>
      <p v-else class="notice">此预约已取消，凭证不可使用。</p>

      <p v-for="f in forms" :key="f.mark">
        {{ f.title }}：<strong>{{ f.val }}</strong>
      </p>

      <div class="actions" style="justify-content:center">
        <button v-if="active && Number(data.meetJoinIsCheck) !== 1" class="danger" @click="handleCancel" :disabled="cancelling">
          {{ cancelling ? '取消中...' : '取消预约' }}
        </button>
        <button @click="handlePrint">打印凭证</button>
      </div>
    </div>
  </div>
  <div v-else class="empty">预约不存在</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../api/request'
import { useToast } from '../../composables/useToast'
import { statusText, parseJson } from '../../composables/useHelpers'

const route = useRoute()
const router = useRouter()
const { toast } = useToast()

const data = ref(null)
const cancelling = ref(false)
const qrCanvas = ref(null)

const active = computed(() => data.value && Number(data.value.meetJoinStatus) !== 0)
const forms = computed(() => data.value ? parseJson(data.value.meetJoinForms, []) : [])

async function handleCancel() {
  if (!confirm('确定取消此预约？')) return
  cancelling.value = true
  try {
    await api('/meet/my/join/cancel', { meetJoinId: route.query.id })
    toast('已取消预约')
    router.push('/bookings')
  } catch (e) {
    toast(e.message)
    cancelling.value = false
  }
}

function handlePrint() { window.print() }

onMounted(async () => {
  try {
    data.value = await api('/meet/my/join/detail', { meetJoinId: route.query.id })
    if (data.value?.meetJoinCode && active.value) {
      await import('../../composables/useQrCode.js').then(m => {
        if (qrCanvas.value) {
          m.drawQrCode(qrCanvas.value, 'meet=' + data.value.meetJoinCode, { size: 280 })
        }
      })
    }
  } catch {}
})
</script>
