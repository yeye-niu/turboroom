<template>
  <div class="empty" v-if="!list?.length">{{ text }}</div>
  <div v-else class="grid">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  list: { type: Array, default: () => [] },
  text: { type: String, default: '暂无记录' }
})
</script>
