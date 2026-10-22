<template>
  <div class="pagination" v-if="pages > 1 || total > 0">
    <span class="pagination-total">共 {{ total }} 条</span>
    <select :value="size" @change="changeSize($event.target.value)" aria-label="每页条数">
      <option value="10">10 条/页</option>
      <option value="12">12 条/页</option>
      <option value="20">20 条/页</option>
      <option value="50">50 条/页</option>
    </select>
    <button class="page-arrow" :disabled="page <= 1" @click="goTo(page - 1)" aria-label="上一页">&lsaquo;</button>
    <template v-for="(n, i) in visiblePages" :key="n">
      <span v-if="i > 0 && n - visiblePages[i - 1] > 1" class="pagination-gap">&hellip;</span>
      <button
        class="page-number"
        :class="{ 'router-link-active': n === page }"
        :aria-current="n === page ? 'page' : undefined"
        @click="goTo(n)"
      >{{ n }}</button>
    </template>
    <button class="page-arrow" :disabled="page >= pages" @click="goTo(page + 1)" aria-label="下一页">&rsaquo;</button>
    <span class="page-jump-label">前往</span>
    <input
      type="number"
      :min="1"
      :max="pages"
      :value="page"
      @change="jumpTo($event.target.value)"
      aria-label="跳转页码"
    >
    <span>页</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  size: { type: Number, default: 12 }
})

const emit = defineEmits(['navigate'])

const route = useRoute()
const router = useRouter()

const pages = computed(() => Math.max(1, Math.ceil(props.total / props.size)))

const visiblePages = computed(() => {
  const p = props.page
  const max = pages.value
  const set = new Set([1, p - 2, p - 1, p, p + 1, p + 2, max])
  return [...set].filter(n => n >= 1 && n <= max).sort((a, b) => a - b)
})

function goTo(page) {
  if (page < 1 || page > pages.value) return
  emit('navigate', page, props.size)
}

function changeSize(size) {
  emit('navigate', 1, Number(size))
}

function jumpTo(val) {
  const page = Number(val)
  if (page >= 1 && page <= pages.value) {
    emit('navigate', page, props.size)
  }
}
</script>
