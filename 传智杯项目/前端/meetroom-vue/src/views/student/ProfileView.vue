<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>个人中心</h1>
    <p class="muted">管理个人资料与学习记录。</p>

    <div class="actions">
      <router-link class="button" to="/bookings">我的预约</router-link>
      <router-link class="button" to="/favourites">我的收藏</router-link>
      <router-link class="button" to="/history">浏览足迹</router-link>
      <router-link class="button" to="/password">修改密码</router-link>
    </div>

    <div class="panel form">
      <h2>个人资料</h2>
      <div v-if="error" class="notice error" role="alert">{{ error }}</div>
      <form @submit.prevent="handleSave">
        <div class="field">
          <label for="account">用户名 *</label>
          <input id="account" v-model="form.account" required maxlength="30">
        </div>
        <div class="field">
          <label for="name">昵称 *</label>
          <input id="name" v-model="form.name" required maxlength="30">
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
        <button class="primary" type="submit" :disabled="submitting">
          {{ submitting ? '保存中...' : '保存' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from '../../api/request'
import { useUserStore } from '../../stores/user'
import { useToast } from '../../composables/useToast'
import { userFields, parseJson, buildPayload } from '../../composables/useHelpers'

const userStore = useUserStore()
const { toast } = useToast()

const form = reactive({
  account: '', name: '',
  sex: '', birth: '', college: '', major: '', item: '', year: '', no: ''
})
const error = ref('')
const submitting = ref(false)

onMounted(async () => {
  try {
    const r = await api('/passport/my/detail')
    form.account = r.userAccount || ''
    form.name = r.userName || ''
    const obj = parseJson(r.userObj, {})
    for (const f of userFields) {
      form[f[0]] = obj[f[0]] || ''
    }
  } catch {}
})

async function handleSave() {
  error.value = ''
  submitting.value = true
  try {
    const payloadData = buildPayload(userFields, form)
    await api('/passport/my/edit', {
      account: form.account,
      name: form.name,
      ...payloadData
    })
    userStore.updateCustName(form.name, form.account)
    toast('资料已更新')
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>
