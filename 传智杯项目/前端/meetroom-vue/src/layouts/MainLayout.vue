<template>
  <div class="app-shell">
    <a class="skip" href="#main" @click.prevent="focusMain">跳至主要内容</a>
    <header>
      <router-link class="brand" to="/home">
        <img class="brand-logo" src="/logo.png" alt="昆仑旅游学院">
        <span>TurboRoom<small>校园自习预约</small></span>
      </router-link>
      <nav aria-label="主导航">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="{ 'router-link-active': isActive(item.to) }"
        >{{ item.label }}</router-link>
      </nav>
      <div class="account">
        <template v-if="userStore.cust">
          <span>{{ userStore.cust.name || userStore.cust.account }}</span>
          <button @click="handleLogout">退出</button>
        </template>
        <router-link v-else class="button" to="/login">登录</router-link>
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

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const mainRef = ref(null)

const navItems = [
  { to: '/home', label: '首页' },
  { to: '/meets', label: '自习场地' },
  { to: '/news-list', label: '校园公告' },
  { to: '/bookings', label: '我的预约' },
  { to: '/profile', label: '个人中心' },
]

function isActive(path) {
  return route.path === path
}

function focusMain() {
  mainRef.value?.focus()
}

function handleLogout() {
  userStore.logout('cust')
  router.push('/home')
}
</script>
