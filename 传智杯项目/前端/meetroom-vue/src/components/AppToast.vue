<template>
  <div v-if="message" id="toast" role="status" aria-live="polite">{{ message }}</div>
</template>

<script setup>
import { useToast } from '../composables/useToast'

const { message } = useToast()
</script>
