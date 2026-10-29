<template>
  <div class="app-shell">
    <CursorGrid
      class="app-grid-bg"
      :cellSize="50"
      color="#1a7a6b"
      gridColor="#1a7a6b"
      :radius="120"
      falloff="smooth"
      highlight="area"
      :holdTime="300"
      :fadeDuration="600"
      :lineWidth="0.8"
      :maxOpacity="0.4"
      :fillOpacity="0.03"
      :gridOpacity="0.06"
      gridStyle="lines"
      :spotlight="0.4"
      :clickPulse="true"
      :pulseSpeed="500"
      :ambient="0.1"
      :edgeFade="0.15"
      :intro="true"
      :lightMode="true"
      :dpr="1.5"
    />
    <GlowCursor
      class="app-glow"
      color="#1a7a6b"
      secondaryColor="#2dd4a8"
      :intensity="0.2"
      :trailWidth="1.2"
      :linger="0.6"
      :glow="0.2"
      :hotspot="0.15"
      :followSpeed="0.5"
      :clickBurst="true"
      quality="medium"
      theme="light"
      :maxDevicePixelRatio="1.5"
    />
    <a class="skip" href="#main" @click.prevent="focusMain">跳至主要内容</a>
    <header>
      <router-link class="brand" to="/home">
        <img class="brand-logo" src="/logo.png" alt="昆仑旅游学院">
        <span>TurboRoom<small>校园自习预约</small></span>
      </router-link>
      <nav v-if="userStore.cust" aria-label="主导航" class="main-nav">
        <SpecularButton
          v-for="(item, i) in navItems"
          :key="item.to"
          size="md"
          :radius="10"
          :tint="route.path === item.to ? '#1a7a6b' : '#6b7280'"
          :tintOpacity="route.path === item.to ? 0.2 : 0.1"
          :textColor="route.path === item.to ? '#1a7a6b' : '#536962'"
          :lineColor="route.path === item.to ? '#1a7a6b' : '#6b7280'"
          :baseColor="route.path === item.to ? '#1a7a6b' : '#6b7280'"
          :intensity="0.8"
          :idleIntensity="0.4"
          @click="router.push(item.to)"
        >
          {{ item.label }}
        </SpecularButton>
      </nav>
      <div class="account">
        <template v-if="userStore.cust">
          <span>{{ userStore.cust.name || userStore.cust.account }}</span>
          <SpecularButton
            size="sm"
            :radius="10"
            tint="#6b7280"
            :tintOpacity="0.1"
            textColor="#374151"
            lineColor="#6b7280"
            baseColor="#6b7280"
            :intensity="0.7"
            :idleIntensity="0.3"
            @click="handleLogout"
          >
            退出
          </SpecularButton>
        </template>
        <SpecularButton
          v-else
          size="sm"
          :radius="10"
          tint="#1a7a6b"
          :tintOpacity="0.15"
          textColor="#1a7a6b"
          lineColor="#1a7a6b"
          baseColor="#1a7a6b"
          :intensity="0.8"
          :idleIntensity="0.4"
          @click="router.push('/login')"
        >
          登录
        </SpecularButton>
      </div>
    </header>
    <main id="main" ref="mainRef" tabindex="-1">
      <router-view />
    </main>
    <footer>
      <span>TurboRoom / 为专注留出空间</span>
      <router-link to="/about">关于我们</router-link>
      <router-link to="/admin">管理入口</router-link>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import GlowCursor from '../components/GlowCursor.vue'
import CursorGrid from '../components/CursorGrid.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const mainRef = ref(null)

const navItems = [
  { to: '/home', label: '首页' },
  { to: '/meets', label: '自习场地' },
  { to: '/news-list', label: '校园公告' },
  { to: '/ai', label: 'AI 助手' },
  { to: '/bookings', label: '我的预约' },
  { to: '/profile', label: '个人中心' },
]

function focusMain() {
  mainRef.value?.focus()
}

function handleLogout() {
  userStore.logout('cust')
  router.push('/login')
}
</script>

<style scoped>
.main-nav {
  flex: 1;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.app-grid-bg {
  position: fixed !important;
  top: 64px !important;
  right: 0 !important;
  bottom: 0 !important;
  left: 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
}

.app-grid-bg :deep(.cursor-grid__canvas) {
  pointer-events: none;
}

.app-glow {
  position: fixed !important;
  inset: 0 !important;
  z-index: 9999 !important;
  pointer-events: none !important;
}

.app-glow :deep(.glow-cursor__canvas) {
  pointer-events: none;
}
</style>
