<template>
  <div class="panel form narrow">
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>修改密码</h1>

    <div v-if="error" class="notice error" role="alert" tabindex="-1" ref="errorRef">{{ error }}</div>

    <form @submit.prevent="handleChange">
      <div class="field">
        <label for="oldPassword">旧密码 *</label>
        <input id="oldPassword" type="password" v-model="form.oldPassword" required minlength="6" maxlength="30">
      </div>
      <div class="field">
        <label for="newPassword">新密码 *</label>
        <input id="newPassword" type="password" v-model="form.newPassword" required minlength="6" maxlength="30">
      </div>
      <div class="field">
        <label for="confirm">确认新密码 *</label>
        <input id="confirm" type="password" v-model="form.confirm" required minlength="6" maxlength="30">
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

const form = reactive({ oldPassword: '', newPassword: '', confirm: '' })
const error = ref('')
const submitting = ref(false)

async function handleChange() {
  error.value = ''
  if (form.newPassword !== form.confirm) {
    error.value = '两次新密码不一致'
    return
  }
  submitting.value = true
  try {
    await api('/passport/pwd', {
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    })
    userStore.logout('cust')
    toast('密码已修改，请重新登录')
    router.push('/login')
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>
