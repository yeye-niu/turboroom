import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function readSession(role) {
  try {
    const raw = sessionStorage.getItem('turboroom.' + role)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeSession(role, value) {
  if (value) {
    sessionStorage.setItem('turboroom.' + role, JSON.stringify(value))
  } else {
    sessionStorage.removeItem('turboroom.' + role)
  }
}

export const useUserStore = defineStore('user', () => {
  const custSession = ref(readSession('cust'))
  const adminSession = ref(readSession('admin'))

  const cust = computed(() => custSession.value)
  const admin = computed(() => adminSession.value)

  function getSession(role = 'cust') {
    return role === 'admin' ? adminSession.value : custSession.value
  }

  function getToken(role = 'cust') {
    return getSession(role)?.token || ''
  }

  function login(role, data) {
    if (role === 'admin') {
      adminSession.value = data
      writeSession('admin', data)
    } else {
      custSession.value = data
      writeSession('cust', data)
    }
  }

  function logout(role = 'cust') {
    if (role === 'admin') {
      adminSession.value = null
      writeSession('admin', null)
    } else {
      custSession.value = null
      writeSession('cust', null)
    }
  }

  function updateCustName(name, account) {
    if (custSession.value) {
      custSession.value = { ...custSession.value, name, account }
      writeSession('cust', custSession.value)
    }
  }

  return { cust, admin, getSession, getToken, login, logout, updateCustName }
})
