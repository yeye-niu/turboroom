<template>
  <div class="panel form narrow">
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>修改管理密码</h1>

    <div v-if="error" class="notice error" role="alert">{{ error }}</div>

    <form @submit.prevent="handleChange">
      <div class="field">
        <label>旧密码 *</label>
        <input type="password" v-model="form.oldPassword" required minlength="6" maxlength="30">
      </div>
      <div class="field">
        <label>新密码 *</label>
        <input type="password" v-model="form.password" required minlength="6" maxlength="30">
      </div>
      <div class="field">
        <label>确认新密码 *</label>
        <input type="password" v-model="form.confirm" required minlength="6" maxlength="30">
      </div>
      <button class="primary" type="submit" :disabled="submitting">
        {{ submitting ? '提交中...' : '保存' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../api/request'
import { useUserStore } from '../../stores/user'
import { useToast } from '../../composables/useToast'

const router = useRouter()
const userStore = useUserStore()
const { toast } = useToast()

const form = reactive({ oldPassword: '', password: '', confirm: '' })
const error = ref('')
const submitting = ref(false)

async function handleChange() {
  error.value = ''
  if (form.password !== form.confirm) {
    error.value = '两次新密码不一致'
    return
  }
  submitting.value = true
  try {
    await api('/admin/mgr/pwd', {
      oldPassword: form.oldPassword,
      password: form.password
    })
    userStore.logout('admin')
    toast('密码已修改，请重新登录')
    router.push('/admin/login')
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>
