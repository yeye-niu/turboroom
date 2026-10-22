<template>
  <article class="card">
    <img
      v-if="coverUrl"
      class="cover"
      loading="lazy"
      :src="coverUrl"
      :alt="title"
    >
    <div v-else class="cover-placeholder" aria-hidden="true">专注空间</div>
    <div class="card-body">
      <span v-if="category" class="chip">{{ category }}</span>
      <h3>{{ title }}</h3>
      <p class="muted">{{ description }}</p>
      <router-link class="button" :to="link">{{ actionText }} <span aria-hidden="true">&rarr;</span></router-link>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { parseJson, getImageUrl } from '../composables/useHelpers'

const props = defineProps({
  item: { type: Object, required: true },
  type: { type: String, default: 'meet' }
})

const title = computed(() => props.item[props.type + 'Title'] || '')
const category = computed(() => props.item[props.type + 'CateName'] || '')
const coverUrl = computed(() => {
  const obj = parseJson(props.item[props.type + 'Obj'])
  const raw = Array.isArray(obj.cover) ? obj.cover[0] : obj.cover
  return getImageUrl(raw)
})
const description = computed(() => {
  if (props.type === 'meet') return '选择开放日期与时段，安排你的专注时间。'
  const obj = parseJson(props.item.newsObj)
  return obj.desc || '查看完整公告'
})
const link = computed(() => {
  const id = props.item[props.type + 'Id']
  return props.type === 'meet' ? `/meet?id=${id}` : `/news?id=${id}`
})
const actionText = computed(() => props.type === 'meet' ? '查看与预约' : '阅读公告')
</script>
