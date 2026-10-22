import { useUserStore } from '../stores/user'

export async function api(route, body = {}, role) {
  const userStore = useUserStore()
  if (!role) role = route.startsWith('/admin/') ? 'admin' : 'cust'
  const token = userStore.getToken(role)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 18000)

  try {
    const response = await fetch('/meetroom' + route, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        sub: role,
        token: token || ''
      },
      body: JSON.stringify(body),
      signal: controller.signal
    })

    let result
    try {
      result = await response.json()
    } catch {
      throw new Error('服务返回了无法识别的响应，请检查 Java 服务。')
    }

    if (Number(result.code) === 2401) {
      userStore.logout(role)
      throw new Error('登录已失效，请重新登录。')
    }

    if (!response.ok || Number(result.code) !== 200) {
      throw new Error(result.msg || '请求失败，请重试。')
    }

    return result.data
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('请求超时，请稍后重试。')
    throw e
  } finally {
    clearTimeout(timer)
  }
}

export async function uploadFile(file) {
  const userStore = useUserStore()
  if (!file) return ''
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    throw new Error('请选择 PNG 或 JPEG 图片')
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('图片不能超过 5 MB')
  }

  const fd = new FormData()
  fd.append('file', file)

  const response = await fetch('/meetroom/comm/upload', {
    method: 'POST',
    headers: {
      sub: 'admin',
      token: userStore.getToken('admin') || ''
    },
    body: fd,
    signal: AbortSignal.timeout(18000)
  })

  const r = await response.json()
  if (!response.ok || Number(r.code) !== 200) {
    throw new Error(r.msg || '上传失败')
  }
  return r.data.fileID
}
