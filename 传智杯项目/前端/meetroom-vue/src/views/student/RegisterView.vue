<template>
  <div class="panel form">
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>创建校园账户</h1>
    <p class="muted">完善基本信息，即可使用预约服务。</p>

    <div v-if="error" class="notice error" role="alert" tabindex="-1" ref="errorRef">{{ error }}</div>

    <form @submit.prevent="handleRegister">
      <div class="field">
        <label for="account">用户名 *</label>
        <input id="account" name="account" type="text" v-model="form.account" required minlength="3" maxlength="30" autocomplete="username">
      </div>
      <div class="field">
        <label for="name">昵称 *</label>
        <input id="name" name="name" type="text" v-model="form.name" required maxlength="30">
      </div>
      <div class="field">
        <label for="password">密码 *</label>
        <input id="password" name="password" type="password" v-model="form.password" required minlength="6" maxlength="30" autocomplete="current-password">
      </div>
      <div class="fields">
        <div class="field" v-for="f in userFields" :key="f[0]">
          <label :for="'f-' + f[0]">{{ f[1] }} *</label>
          <select v-if="f[2] === 'select'" :id="'f-' + f[0]" v-model="form[f[0]]" required>
            <option v-for="opt in f[3]" :key="opt" :value="opt">{{ opt }}</option>
          </select>
          <input
            v-else
            :id="'f-' + f[0]"
            :type="f[2]"
            v-model="form[f[0]]"
            required
            :min="f[2] === 'number' ? 1900 : undefined"
            :max="f[2] === 'number' ? 2100 : undefined"
            :minlength="['college', 'major', 'item'].includes(f[0]) ? 2 : undefined"
            :maxlength="f[2] === 'number' ? undefined : 200"
          >
        </div>
      </div>
      <label class="check">
        <input type="checkbox" v-model="agreed" required>
        我已阅读并同意 <router-link to="/agreement" target="_blank">用户使用协议</router-link>
      </label>
      <br>
      <button class="primary" type="submit" :disabled="submitting">
        {{ submitting ? '注册中...' : '注册并登录' }}
      </button>
    </form>
    <p><router-link to="/login">已有账户？去登录</router-link></p>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../api/request'
import { useUserStore } from '../../stores/user'
import { userFields, buildPayload } from '../../composables/useHelpers'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  account: '', name: '', password: '',
  sex: '', birth: '', college: '', major: '', item: '', year: '', no: ''
})
const agreed = ref(false)
const error = ref('')
const submitting = ref(false)
const errorRef = ref(null)

async function handleRegister() {
  error.value = ''
  submitting.value = true
  try {
    const payloadData = buildPayload(userFields, form)
    const result = await api('/passport/register', {
      account: form.account,
      name: form.name,
      password: form.password,
      ...payloadData
    })
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
