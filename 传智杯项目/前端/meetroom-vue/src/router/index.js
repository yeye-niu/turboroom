import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/login' },
      { path: 'login', name: 'Login', component: () => import('../views/student/LoginView.vue') },
      { path: 'register', name: 'Register', component: () => import('../views/student/RegisterView.vue') },
      { path: 'home', name: 'Home', component: () => import('../views/student/HomeView.vue'), meta: { auth: true } },
      { path: 'meets', name: 'Meets', component: () => import('../views/student/MeetList.vue'), meta: { auth: true } },
      { path: 'meet', name: 'MeetDetail', component: () => import('../views/student/MeetDetail.vue'), meta: { auth: true } },
      { path: 'news-list', name: 'NewsList', component: () => import('../views/student/NewsList.vue'), meta: { auth: true } },
      { path: 'news', name: 'NewsDetail', component: () => import('../views/student/NewsDetail.vue'), meta: { auth: true } },
      { path: 'ai', name: 'AiAssistant', component: () => import('../views/student/AiAssistant.vue') },
      { path: 'join', name: 'JoinBooking', component: () => import('../views/student/JoinBooking.vue'), meta: { auth: true } },
      { path: 'bookings', name: 'Bookings', component: () => import('../views/student/Bookings.vue'), meta: { auth: true } },
      { path: 'booking', name: 'BookingDetail', component: () => import('../views/student/BookingDetail.vue'), meta: { auth: true } },
      { path: 'profile', name: 'Profile', component: () => import('../views/student/ProfileView.vue'), meta: { auth: true } },
      { path: 'password', name: 'Password', component: () => import('../views/student/PasswordView.vue'), meta: { auth: true } },
      { path: 'history', name: 'History', component: () => import('../views/student/HistoryView.vue'), meta: { auth: true } },
      { path: 'favourites', name: 'Favourites', component: () => import('../views/student/Favourites.vue'), meta: { auth: true } },
      { path: 'about', name: 'About', component: () => import('../views/student/AboutView.vue'), meta: { auth: true } },
      { path: 'agreement', name: 'Agreement', component: () => import('../views/student/AgreementView.vue'), meta: { auth: true } },
    ]
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    children: [
      { path: 'login', name: 'AdminLogin', component: () => import('../views/admin/AdminLogin.vue') },
      { path: '', name: 'AdminDashboard', component: () => import('../views/admin/Dashboard.vue'), meta: { admin: true } },
      { path: 'meets', name: 'AdminMeets', component: () => import('../views/admin/MeetManage.vue'), meta: { admin: true } },
      { path: 'edit', name: 'AdminEdit', component: () => import('../views/admin/EditView.vue'), meta: { admin: true } },
      { path: 'days', name: 'AdminDays', component: () => import('../views/admin/MeetDays.vue'), meta: { admin: true } },
      { path: 'joins', name: 'AdminJoins', component: () => import('../views/admin/MeetJoins.vue'), meta: { admin: true } },
      { path: 'news', name: 'AdminNews', component: () => import('../views/admin/NewsManage.vue'), meta: { admin: true } },
      { path: 'users', name: 'AdminUsers', component: () => import('../views/admin/UserManage.vue'), meta: { admin: true } },
      { path: 'user', name: 'AdminUserDetail', component: () => import('../views/admin/UserDetail.vue'), meta: { admin: true } },
      { path: 'managers', name: 'AdminManagers', component: () => import('../views/admin/ManagerManage.vue'), meta: { admin: true } },
      { path: 'setup', name: 'AdminSetup', component: () => import('../views/admin/Setup.vue'), meta: { admin: true } },
      { path: 'password', name: 'AdminPassword', component: () => import('../views/admin/AdminPassword.vue'), meta: { admin: true } },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  const publicPages = ['Login', 'Register', 'AdminLogin', 'AiAssistant']
  const authRequired = !publicPages.includes(to.name)

  if (authRequired && !userStore.cust && !userStore.admin) {
    if (to.path.startsWith('/admin')) {
      return { name: 'AdminLogin' }
    }
    return { name: 'Login' }
  }
  if (to.meta.admin && !userStore.admin) {
    return { name: 'AdminLogin' }
  }
})

export default router
