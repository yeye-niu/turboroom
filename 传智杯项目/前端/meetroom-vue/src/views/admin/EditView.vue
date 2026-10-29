<template>
  <div>
    <div class="eyebrow">CAMPUS STUDY / TURBOROOM</div>
    <h1>{{ id ? '编辑' : '新增' }}{{ typeLabel }}</h1>

    <div class="panel form">
      <div v-if="error" class="notice error" role="alert">{{ error }}</div>
      <form @submit.prevent="handleSave">
        <div class="field">
          <label>{{ type === 'mgr' ? '管理账号' : type === 'meet' ? '场地名称' : '公告标题' }} *</label>
          <input v-model="form.title" required minlength="4" maxlength="50">
        </div>

        <template v-if="type !== 'mgr'">
          <div class="field">
            <label>分类 *</label>
            <select v-model="form.cateId" required>
              <option v-for="(c, i) in cats" :key="i" :value="i + 1">{{ c }}</option>
            </select>
          </div>
          <div class="field">
            <label>排序值</label>
            <input type="number" v-model="form.order" min="0" max="9999">
          </div>
        </template>

        <template v-if="type === 'meet'">
          <div class="field">
            <label>每时段人数上限 *</label>
            <input type="number" v-model="form.maxCnt" min="1" max="10000" required>
          </div>
        </template>

        <template v-if="type !== 'mgr'">
          <div class="field">
            <label>封面图片地址</label>
            <input type="url" v-model="form.cover">
            <small>填写已有图片网址，或使用下方图片上传。</small>
          </div>
          <div class="field">
            <label>上传封面</label>
            <input type="file" ref="fileInput" accept="image/png,image/jpeg">
          </div>
        </template>

        <template v-if="type === 'meet'">
          <div class="field">
            <label>预约时段（每行一条）*</label>
            <textarea v-model="form.time" required></textarea>
            <small>例如 08:00-10:00；最多 15 个时段。</small>
          </div>
          <div class="field">
            <label>场地特色（用逗号分隔）</label>
            <input v-model="form.tag" maxlength="200">
          </div>
          <div class="field">
            <label>预约须知 *</label>
            <textarea v-model="form.desc" required></textarea>
          </div>
          <div class="field">
            <label>正文配图地址（每行一张）</label>
            <textarea v-model="form.descImages"></textarea>
            <small>可选，图片会展示在正文后。</small>
          </div>
        </template>

        <template v-if="type === 'news'">
          <div class="field">
            <label>公告简介 *</label>
            <textarea v-model="form.desc" required minlength="2" maxlength="200"></textarea>
          </div>
          <div class="field">
            <label>公告正文 *</label>
            <textarea v-model="form.content" required></textarea>
          </div>
          <div class="field">
            <label>正文配图地址（每行一张）</label>
            <textarea v-model="form.contentImages"></textarea>
          </div>
        </template>

        <template v-if="type === 'mgr'">
          <div class="field">
            <label>姓名</label>
            <input v-model="form.desc" maxlength="30">
          </div>
          <div class="field">
            <label>手机</label>
            <input type="tel" v-model="form.phone">
          </div>
          <div class="field">
            <label>{{ id ? '新密码（留空不修改）' : '密码' }} {{ id ? '' : '*' }}</label>
            <input type="password" v-model="form.password" :required="!id" minlength="6" maxlength="30">
          </div>
          <div class="field">
            <label>角色</label>
            <select v-model="form.mgrType">
              <option :value="0">普通管理员</option>
              <option :value="1">超级管理员</option>
              <option :value="9">其他管理人员</option>
            </select>
          </div>
        </template>

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
          {{ submitting ? '保存中...' : '保存' }}
        </SpecularButton>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, uploadFile } from '../../api/request'
import { useToast } from '../../composables/useToast'
import { categories, newsCategories, parseJson, parseContent } from '../../composables/useHelpers'

const route = useRoute()
const router = useRouter()
const { toast } = useToast()

const type = computed(() => route.query.type || 'meet')
const id = computed(() => route.query.id || '')
const typeLabel = computed(() => ({ meet: '场地', news: '公告', mgr: '管理员' }[type.value]))
const cats = computed(() => type.value === 'meet' ? categories : newsCategories)

const form = reactive({
  title: '', cateId: 1, order: 0, maxCnt: 20,
  cover: '', time: '', tag: '', desc: '', content: '',
  descImages: '', contentImages: '',
  phone: '', password: '', mgrType: 0
})
const fileInput = ref(null)
const error = ref('')
const submitting = ref(false)

onMounted(async () => {
  if (id.value) {
    try {
      const prefix = type.value === 'mgr' ? 'admin' : type.value
      const r = await api(`/admin/${type.value}/detail`, { id: id.value })
      if (!r) { error.value = '记录不存在'; return }
      const obj = parseJson(r[prefix + 'Obj'], {})
      form.title = r[prefix + 'Title'] || r[prefix + 'Name'] || ''
      form.cateId = r[prefix + 'CateId'] || 1
      form.order = r[prefix + 'Order'] || 0
      if (type.value === 'meet') {
        form.maxCnt = r.meetMaxCnt || 20
        form.time = (obj.time || []).map(t => t.title).join('\n')
        form.tag = (obj.tag || []).join(',')
        form.cover = Array.isArray(obj.cover) ? obj.cover[0] : obj.cover || ''
        const descArr = parseJson(obj.desc, [])
        if (Array.isArray(descArr)) {
          form.desc = descArr.filter(n => n.type === 'text').map(n => n.val).join('\n\n')
          form.descImages = descArr.filter(n => n.type === 'img').map(n => n.val).join('\n')
        } else { form.desc = String(obj.desc || '') }
      } else if (type.value === 'news') {
        form.cover = Array.isArray(obj.cover) ? obj.cover[0] : obj.cover || ''
        form.desc = obj.desc || ''
        const contentArr = parseJson(obj.content, [])
        if (Array.isArray(contentArr)) {
          form.content = contentArr.filter(n => n.type === 'text').map(n => n.val).join('\n\n')
          form.contentImages = contentArr.filter(n => n.type === 'img').map(n => n.val).join('\n')
        } else { form.content = String(obj.content || '') }
      } else {
        form.desc = r.adminDesc || ''
        form.phone = r.adminPhone || ''
        form.mgrType = r.adminType ?? 0
      }
    } catch {}
  }
})

async function handleSave() {
  error.value = ''
  submitting.value = true
  try {
    let input = { ...form }

    if (type.value === 'mgr') {
      input = {
        name: form.title,
        desc: form.desc,
        phone: form.phone,
        type: Number(form.mgrType),
        ...(id.value ? { id: id.value } : {})
      }
      if (form.password) input.password = form.password
      else delete input.password
    } else {
      let url = form.cover
      const file = fileInput.value?.files?.[0]
      if (file) url = await uploadFile(file)
      if (!url) throw new Error('请填写封面地址或上传图片')

      const oldObj = id.value ? parseJson((await api(`/admin/${type.value}/detail`, { id: id.value }))[type.value + 'Obj'], {}) : {}

      if (type.value === 'meet') {
        const times = form.time.split('\n').map(s => s.trim()).filter(Boolean)
        if (!times.length || times.length > 15) throw new Error('请填写 1–15 个预约时段')
        const values = {
          ...oldObj,
          cover: [url],
          time: times.map(title => ({ title })),
          tag: form.tag.split(/[,，]/).map(s => s.trim()).filter(Boolean),
          desc: parseContent(form.desc, form.descImages, oldObj.desc)
        }
        input = {
          title: form.title,
          cateId: Number(form.cateId),
          cateName: cats.value[Number(form.cateId) - 1],
          order: Number(form.order),
          maxCnt: Number(form.maxCnt),
          ...(id.value ? { id: id.value } : {}),
          forms: JSON.stringify([
            { mark: 'cover', title: '封面图', type: 'image', val: JSON.stringify(values.cover) },
            { mark: 'time', title: '预约时段设置', type: 'rows', val: JSON.stringify(values.time) },
            { mark: 'tag', title: '特色', type: 'checkbox', val: JSON.stringify(values.tag) },
            { mark: 'desc', title: '预约须知', type: 'content', val: JSON.stringify(values.desc) }
          ]),
          obj: JSON.stringify({ cover: values.cover, time: values.time, tag: values.tag, desc: values.desc })
        }
      } else {
        const values = {
          ...oldObj,
          cover: [url],
          desc: form.desc,
          content: parseContent(form.content, form.contentImages, oldObj.content)
        }
        input = {
          title: form.title,
          cateId: Number(form.cateId),
          cateName: cats.value[Number(form.cateId) - 1],
          order: Number(form.order),
          ...(id.value ? { id: id.value } : {}),
          forms: JSON.stringify([
            { mark: 'desc', title: '简介', type: 'textarea', val: values.desc },
            { mark: 'content', title: '详细内容', type: 'content', val: JSON.stringify(values.content) },
            { mark: 'cover', title: '封面图', type: 'image', val: JSON.stringify(values.cover) }
          ]),
          obj: JSON.stringify({ desc: values.desc, content: values.content, cover: values.cover })
        }
      }
    }

    await api(`/admin/${type.value}/${id.value ? 'edit' : 'insert'}`, input)
    toast('已保存')
    router.push(type.value === 'meet' ? '/admin/meets' : type.value === 'news' ? '/admin/news' : '/admin/managers')
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>
