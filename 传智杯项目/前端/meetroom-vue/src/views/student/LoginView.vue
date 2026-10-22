<template>
  <div class="panel form narrow">
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
        <label for="password">密码 *</label>
        <input id="password" name="password" type="password" v-model="form.password" required minlength="6" maxlength="30" autocomplete="current-password">
      </div>
      <button class="primary" type="submit" :disabled="submitting">
        {{ submitting ? '登录中...' : '登录' }}
      </button>
    </form>
    <p><router-link to="/register">没有账户？注册</router-link></p>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../api/request'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({ account: '', password: '' })
const error = ref('')
const submitting = ref(false)
const errorRef = ref(null)

async function handleLogin() {
  error.value = ''
  submitting.value = true
  try {
    const result = await api('/passport/login', { account: form.account, password: form.password })
    userStore.login('cust', result.token)
    router.push('/profile')
  } catch (e) {
    error.value = e.message
    await nextTick()
    errorRef.value?.focus()
  } finally {
    submitting.value = false
  }
}
</script>
