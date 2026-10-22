<template>
  <div class="app-shell">
    <header>
      <router-link class="brand" to="/home">
        <img class="brand-logo" src="/logo.png" alt="昆仑旅游学院">
        <span>TurboRoom<small>校园自习预约</small></span>
      </router-link>
      <nav aria-label="管理导航" class="admin-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
        >{{ item.label }}</router-link>
      </nav>
      <div class="account">
        <router-link to="/home">学生端</router-link>
        <template v-if="userStore.admin">
          <span>{{ userStore.admin.name || userStore.admin.account }}</span>
          <button @click="handleLogout">退出</button>
        </template>
      </div>
    </header>
    <main id="main" tabindex="-1">
      <router-view />
    </main>
    <footer>
      <span>TurboRoom / 管理中心</span>
    </footer>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const navItems = [
  { to: '/admin', label: '概览' },
  { to: '/admin/meets', label: '场地管理' },
  { to: '/admin/news', label: '公告管理' },
  { to: '/admin/users', label: '用户管理' },
  { to: '/admin/managers', label: '管理员' },
  { to: '/admin/setup', label: '内容设置' },
  { to: '/admin/password', label: '修改密码' },
]

function handleLogout() {
  userStore.logout('admin')
  router.push('/admin/login')
}
</script>
