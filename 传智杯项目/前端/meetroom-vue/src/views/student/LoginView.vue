<template>
  <div class="login-page">
    <div class="login-bg" />
    <div class="login-overlay" />
    <SideRays
      rayColor1="#f0c27f"
      rayColor2="#e8d5b7"
      origin="top-left"
      :speed="1.2"
      :intensity="1.8"
      :spread="2"
      :density="5"
      :falloff="1.8"
      :glow="0.6"
      :opacity="0.45"
      :followMouse="true"
      :mouseInfluence="0.5"
      :lightMode="true"
    />
    <div class="panel form narrow login-panel">
      <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
      <h1>欢迎回来</h1>
      <p class="muted">登录后管理你的自习预约。</p>

      <div v-if="error" class="notice error" role="alert" tabindex="-1" ref="errorRef">{{ error }}</div>

      <form @submit.prevent="handleLogin">
        <div class="field">
          <label for="account">用户名 *</label>
          <input id="account" name="account" type="text" v-model="form.account" required minlength="3" maxlength="30" autocomplete="username">
        </div>
        <div class="field">
          <label>密码 *</label>
          <CodeSlots
            v-model:value="form.password"
            :length="6"
            :status="loginStatus"
            mask
            caret
            @complete="onPasswordComplete"
            @change="onPasswordChange"
          />
        </div>
        <button class="primary" type="submit" :disabled="submitting || form.password.length < 6">
          {{ submitting ? '登录中...' : '登录' }}
        </button>
      </form>
      <p><router-link to="/register">没有账户？注册</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../api/request'
import { useUserStore } from '../../stores/user'
import CodeSlots from '../../components/CodeSlots.vue'
import SideRays from '../../components/SideRays.vue'
import '../../components/CodeSlots.css'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({ account: '', password: '' })
const error = ref('')
const submitting = ref(false)
const loginStatus = ref('idle')
const errorRef = ref(null)

function onPasswordChange(code) {
  if (loginStatus.value !== 'idle') loginStatus.value = 'idle'
}

function onPasswordComplete(code) {
  form.password = code
}

async function handleLogin() {
  if (form.password.length < 6) return
  error.value = ''
  submitting.value = true
  loginStatus.value = 'idle'
  try {
    const result = await api('/passport/login', { account: form.account, password: form.password })
    userStore.login('cust', result.token)
    loginStatus.value = 'success'
    setTimeout(() => router.push('/profile'), 600)
  } catch (e) {
    error.value = e.message
    loginStatus.value = 'error'
    setTimeout(() => { loginStatus.value = 'idle' }, 800)
    await nextTick()
    errorRef.value?.focus()
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  background: url('/login-bg.png') center / cover no-repeat;
  filter: saturate(0.85) contrast(1.05);
  z-index: 0;
}

.login-overlay {
  position: absolute;
  inset: 0;
  background: rgba(20, 30, 25, 0.35);
  z-index: 0;
}

.login-page :deep(.side-rays) {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.login-panel {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(18px) saturate(1.2);
  -webkit-backdrop-filter: blur(18px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
