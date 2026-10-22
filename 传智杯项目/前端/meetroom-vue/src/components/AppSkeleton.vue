<template>
  <div class="skeleton-grid">
    <div v-for="n in count" :key="n" class="skeleton-card">
      <div class="skeleton-cover skeleton-animate"></div>
      <div class="skeleton-body">
        <div class="skeleton-line short skeleton-animate"></div>
        <div class="skeleton-line skeleton-animate"></div>
        <div class="skeleton-line medium skeleton-animate"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 6 }
})
</script>

<style scoped>
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}
.skeleton-card {
  background: white;
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
}
.skeleton-cover {
  aspect-ratio: 16 / 10;
}
.skeleton-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.skeleton-line {
  height: 16px;
  border-radius: 8px;
  background: var(--soft);
}
.skeleton-line.short { width: 30%; }
.skeleton-line.medium { width: 70%; }
.skeleton-animate {
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@media (max-width: 900px) {
  .skeleton-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 600px) {
  .skeleton-grid { grid-template-columns: 1fr; }
}
</style>
