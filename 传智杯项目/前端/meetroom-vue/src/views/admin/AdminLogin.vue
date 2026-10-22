<template>
  <div class="panel form narrow">
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>管理员登录</h1>
    <p class="muted">使用管理账户进入后台。</p>

    <div v-if="error" class="notice error" role="alert" tabindex="-1" ref="errorRef">{{ error }}</div>

    <form @submit.prevent="handleLogin">
      <div class="field">
        <label for="name">账号 *</label>
        <input id="name" v-model="form.name" required minlength="5" maxlength="30">
      </div>
      <div class="field">
        <label for="password">密码 *</label>
        <input id="password" type="password" v-model="form.password" required minlength="5" maxlength="30">
      </div>
      <button type="submit" class="primary" :disabled="submitting">
        {{ submitting ? '登录中...' : '登录管理端' }}
      </button>
    </form>
    <p><router-link to="/home">返回学生端</router-link></p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../api/request'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({ name: '', password: '' })
const error = ref('')
const submitting = ref(false)

async function handleLogin() {
  error.value = ''
  submitting.value = true
  try {
    const r = await api('/admin/login', form)
    userStore.login('admin', r)
    router.push('/admin')
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>
