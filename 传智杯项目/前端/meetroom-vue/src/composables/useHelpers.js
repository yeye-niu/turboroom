export const categories = ['普通教室', '阶梯教室', '计算机机房', '专业实验室', '语音室', '形体健身房', '艺术教室', '体育场馆']
export const buildings = ['文观楼', '群观楼']
export const newsCategories = ['公告通知', '校园动态']

export const userFields = [
  ['sex', '性别', 'select', ['男', '女']],
  ['birth', '出生年月', 'date'],
  ['college', '学院系所', 'text'],
  ['major', '所学专业', 'text'],
  ['item', '班级', 'text'],
  ['year', '入学年份', 'number'],
  ['no', '学号', 'text']
]

export const joinFields = [
  ['name', '姓名', 'text'],
  ['phone', '手机', 'tel']
]

export function parseJson(value, fallback = {}) {
  if (typeof value !== 'string') return value ?? fallback
  try { return JSON.parse(value) } catch { return fallback }
}

export function getImageUrl(value) {
  if (typeof value !== 'string') return ''
  try {
    const u = new URL(value, location.origin)
    if (!['http:', 'https:'].includes(u.protocol)) return ''
    if (u.pathname.startsWith('/pic/')) return u.pathname
    return u.href
  } catch { return '' }
}

export function getCover(obj, title, extra = '') {
  const value = parseJson(obj)
  const url = getImageUrl(Array.isArray(value.cover) ? value.cover[0] : value.cover)
  return url
    ? { url, title }
    : null
}

export function getRichContent(value) {
  const content = parseJson(value, value)
  if (!Array.isArray(content)) {
    return [{ type: 'text', val: typeof content === 'string' ? content : '' }]
  }
  return content
}

export function statusText(r) {
  return Number(r.meetJoinStatus) === 0 ? '已取消'
    : Number(r.meetJoinIsCheck) === 1 ? '已签到'
    : '待签到'
}

export function historyAdd(type, id, title) {
  const raw = localStorage.getItem('turboroom.history')
  let old = []
  try { old = JSON.parse(raw) || [] } catch {}
  const list = [
    { type, id, title, time: new Date().toLocaleString() },
    ...old.filter(x => !(x.type === type && String(x.id) === String(id)))
  ].slice(0, 60)
  localStorage.setItem('turboroom.history', JSON.stringify(list))
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('turboroom.history')) || []
  } catch { return [] }
}

export function clearHistory() {
  localStorage.removeItem('turboroom.history')
}

export function favouriteLink(record) {
  if (/^#\/(meet|news)\?id=\d+$/.test(record.favPath || '')) return record.favPath
  const type = /news|公告|文章/.test(record.favType + ' ' + record.favPath) ? 'news' : 'meet'
  return `#/${type}?id=${encodeURIComponent(record.favOid)}`
}

export function buildPayload(schema, values) {
  const forms = schema.map(([mark, title, type]) => ({
    mark,
    title,
    type: type === 'tel' ? 'mobile' : type === 'number' ? 'year' : type,
    val: values[mark]
  }))
  return {
    forms: JSON.stringify(forms),
    obj: JSON.stringify(Object.fromEntries(forms.map(f => [f.mark, f.val])))
  }
}

export function parseContent(text, images = '', original = []) {
  const old = parseJson(original, [])
  const urls = images.split('\n').map(s => s.trim()).filter(Boolean)
  if (
    Array.isArray(old) &&
    old.filter(n => n.type === 'text').map(n => n.val).join('\n\n') === text &&
    old.filter(n => n.type === 'img').map(n => n.val).join('\n') === images
  ) return old

  if (!text.trim()) throw new Error('请填写正文内容')
  for (const url of urls) {
    let parsed
    try { parsed = new URL(url, location.origin) } catch { throw new Error('404') }
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('正文配图必须使用 http 或 https 地址')
  }
  return [{ type: 'text', val: text }, ...urls.map(val => ({ type: 'img', val }))]
}

export function exportDownload(url) {
  const parsed = new URL(url, location.origin)
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('下载地址无效')
  const a = document.createElement('a')
  a.href = parsed.href
  a.rel = 'noopener'
  a.target = '_blank'
  a.click()
}
