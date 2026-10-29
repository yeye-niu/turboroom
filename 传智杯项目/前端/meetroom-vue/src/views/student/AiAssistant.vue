<template>
  <main class="ai-shell" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <aside class="ai-sidebar" aria-label="AI 助手对话列表">
      <div class="sidebar-top"><div class="brand"><span class="brand-dot"></span><div><b>TurboRoom AI</b><small>校园场地智能助手</small></div></div><button class="sidebar-toggle" type="button" :title="sidebarCollapsed ? '展开对话列表' : '隐藏对话列表'" :aria-label="sidebarCollapsed ? '展开对话列表' : '隐藏对话列表'" @click="sidebarCollapsed = !sidebarCollapsed"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6"/><path d="M5 4v16"/></svg></button></div>
      <button class="new-chat" type="button" @click="resetChat"><span aria-hidden="true">＋</span> 新对话</button>
      <div class="history-heading"><span>{{ historyManage ? '管理对话' : '最近对话' }}</span><div v-if="!historyManage" class="history-heading-actions"><button type="button" title="搜索历史对话" aria-label="搜索历史对话" :class="{ active: historySearchOpen }" @click="historySearchOpen = !historySearchOpen"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg></button><button type="button" title="批量管理对话" aria-label="批量管理对话" @click="historyManage = true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2"/></svg></button></div></div>
      <div v-if="historySearchOpen && !historyManage" class="history-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input v-model.trim="historyQuery" type="search" placeholder="搜索对话" aria-label="搜索历史对话"><button type="button" aria-label="清除搜索" title="清除搜索" @click="historyQuery = ''">×</button></div>
      <div v-if="historyManage" class="history-bulkbar"><label class="history-select-all"><input type="checkbox" :checked="selectedHistory.length === filteredHistory.length && filteredHistory.length > 0" @change="toggleAllHistory"> 全选</label><span class="history-selected-count">已选 {{ selectedHistory.length }}</span><button type="button" class="history-delete" :disabled="!selectedHistory.length" title="删除所选对话" aria-label="删除所选对话" @click="deleteSelectedHistory"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M9 7l1-3h6l1 3m-12 0 1 13h10l1-13"/></svg><span>删除</span></button><button type="button" class="history-done" @click="historyManage = false; selectedHistory = []">完成</button></div>
      <div class="history-list" aria-label="最近对话">
        <div v-if="!filteredHistory.length" class="history-empty">暂无匹配的历史对话</div>
        <div v-for="item in filteredHistory" :key="item.id" class="history-row" :class="{ active: item.id === activeConversationId }">
          <button class="history-item" type="button" @click="openConversation(item.id)"><span class="history-date">{{ formatHistoryDate(item.updatedAt) }}</span><span>{{ item.title }}</span></button>
          <button v-if="item.pinned && !historyManage" class="history-pin pinned" type="button" title="取消置顶" aria-label="取消置顶" @click="togglePin(item.id)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m16 3 5 5-4 1-4 4v5l-2 2-2-7-5-5 2-2h5l4-4 1-4Z"/></svg></button>
          <input v-if="historyManage" class="history-check" type="checkbox" :checked="selectedHistory.includes(item.id)" :aria-label="'选择 ' + item.title" @change="toggleHistory(item.id)">
          <div v-else class="history-actions" @mouseenter="openHistoryMenu(item, $event)" @mouseleave="item.menu = false" @keydown.esc="item.menu = false"><button class="history-more" type="button" title="对话操作" aria-label="对话操作" :aria-expanded="Boolean(item.menu)" @click="openHistoryMenu(item, $event)"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg></button>
          <div v-if="item.menu" class="history-menu" :class="{ 'opens-above': item.menuAbove }"><button type="button" @click="renameConversation(item)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/></svg><span>重命名</span></button><button type="button" @click="togglePin(item.id)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m16 3 5 5-4 1-4 4v5l-2 2-2-7-5-5 2-2h5l4-4Z"/></svg><span>{{ item.pinned ? '取消置顶' : '置顶此对话' }}</span></button><button type="button" class="danger" @click="deleteHistory(item.id)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M9 7l1-3h6l1 3m-12 0 1 13h10l1-13"/></svg><span>删除对话</span></button></div></div>
        </div>
      </div>
      <div class="sidebar-note"><b>使用说明</b><p>选择下方功能开始对话。场地推荐基于实时预约余量，最终预约以系统确认结果为准。</p></div>
    </aside>
    <button v-if="sidebarCollapsed" class="sidebar-open" type="button" title="展开对话列表" aria-label="展开对话列表" @click="sidebarCollapsed = false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/><path d="M19 4v16"/></svg></button>
    <section class="chat-stage" :class="{ 'empty-chat': !messages.length }">
      <header class="stage-head"><div><h1>{{ currentMode.name }}</h1><p>{{ currentMode.desc }}</p></div><div class="head-actions"><button v-if="messages.length" type="button" class="clear-chat" @click="resetChat">清空对话</button><span class="online"><i></i> 服务已就绪</span></div></header>
      <div ref="chatScroll" class="chat-scroll" aria-live="polite">
        <section v-if="!messages.length" class="welcome"><div class="ai-avatar">AI</div><h2>你好，我是 TurboRoom AI</h2><p>告诉我你的使用需求，我会帮你筛选场地、规避冲突或生成公告草稿。</p><div class="suggestions"><button v-for="item in examples" :key="item.question" type="button" @click="askExample(item)"><b>{{ item.label }}</b><span>{{ item.question }}</span></button></div></section>
        <template v-for="message in messages" :key="message.id">
          <article v-if="message.question" class="message user"><div class="user-message-group"><div class="bubble">{{ message.question }}</div><div class="user-message-tools" aria-label="消息操作"><button type="button" title="修改问题" aria-label="修改问题" @click="editQuestion(message)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4Z M13 7l4 4"/></svg></button><button type="button" title="复制问题" aria-label="复制问题" @click="copyQuestion(message.question)"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0 2 2v7a2 2 0 0 0 2 2h3"/></svg></button><button type="button" class="danger" title="删除本轮对话" aria-label="删除本轮对话" @click="deleteConversation(message)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></svg></button></div></div><span class="avatar user-avatar">我</span></article>
          <article v-if="message.type === 'answer'" class="message assistant"><span class="avatar ai-avatar">AI</span><div class="answer-bubble"><p>{{ message.content }}</p><div class="message-tools" aria-label="回答操作"><button type="button" title="复制回答" aria-label="复制回答" @click="copyAnswer(message.content)"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="8" width="10" height="12" rx="2"/><path d="M15 8V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/></svg></button><button type="button" :class="{ selected: message.feedback === 'up' }" :title="message.feedback === 'up' ? '取消点赞' : '回答有帮助'" aria-label="回答有帮助" @click="setFeedback(message, 'up')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v10H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3Zm0 0 4-7a2.5 2.5 0 0 1 3 2l-1 5h5.2a2 2 0 0 1 1.95 2.45l-1.3 6A2 2 0 0 1 16.9 20H7"/></svg></button><button type="button" :class="{ selected: message.feedback === 'down' }" :title="message.feedback === 'down' ? '取消点踩' : '回答需改进'" aria-label="回答需改进" @click="setFeedback(message, 'down')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14V4H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3Zm0 0 4 7a2.5 2.5 0 0 0 3-2l-1-5h5.2a2 2 0 0 0 1.95-2.45l-1.3-6A2 2 0 0 0 16.9 4H7"/></svg></button><button type="button" :class="{ selected: speakingContent === message.content }" :title="speakingContent === message.content ? '停止朗读' : '朗读回答'" aria-label="朗读回答" @click="speakAnswer(message.content)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4Z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg></button><button type="button" title="重新生成" aria-label="重新生成" @click="regenerate(message)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0 1.2 5"/><path d="M20 4v7h-7"/></svg></button><span class="answer-more" @mouseenter="message.more = true" @mouseleave="message.more = false" @keydown.esc="message.more = false"><button type="button" title="更多操作" aria-label="更多操作" aria-haspopup="true" :aria-expanded="Boolean(message.more)" @click="toggleMore(message)"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg></button><span v-if="message.more" class="more-menu"><button type="button" @click="insertQuote(message.content)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20l1.1-1.1"/></svg><span>引用到输入框</span></button><button type="button" class="danger" @click="deleteConversation(message)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></svg><span>删除本轮对话</span></button></span></span></div></div></article>
          <article v-else-if="message.type === 'recommend'" class="message assistant"><span class="avatar ai-avatar">AI</span><div class="recommend-bubble"><b>已按实时余量为你筛选</b><p>{{ message.summary }}</p><div class="cards"><div v-for="item in message.items" :key="item.meetId" class="venue-card" :class="{ alternate: !item.available }"><div><span class="status">{{ item.available ? '可预约' : '候补建议' }}</span><h3>{{ item.meetTitle }}</h3><p>{{ item.meetCateName }} · 容量 {{ item.meetMaxCnt }} 人 · 余量 {{ item.remaining }} 人</p><small>{{ item.reason }}</small></div><router-link class="detail-link" :to="{ path: '/meet', query: { id: item.meetId } }">查看详情</router-link></div></div></div></article>
          <article v-else-if="message.type === 'error'" class="message assistant"><span class="avatar ai-avatar">AI</span><div class="answer-bubble error">{{ message.content }}</div></article>
        </template>
        <article v-if="loading || recommendLoading" class="message assistant"><span class="avatar ai-avatar">AI</span><div class="thinking"><i></i><i></i><i></i><span>{{ recommendLoading ? '正在查询实时余量…' : '正在思考…' }}</span></div></article>
      </div>
    </section>
    <nav class="mode-toolbar" aria-label="选择 AI 功能"><button v-for="mode in modes" :key="mode.key" type="button" :class="{ active: activeMode === mode.key }" @click="chooseMode(mode)"><svg class="mode-icon" viewBox="0 0 24 24" aria-hidden="true"><path v-if="mode.key === 'chat'" d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1"/><path v-else-if="mode.key === 'recommend'" d="M4 19 10 5l4 9 2-4 4 9H4Z"/><path v-else d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7m-7 4h7"/></svg>{{ mode.name }}</button></nav>
    <div v-if="notice" class="action-notice" role="status">{{ notice }}</div>
    <section v-if="filtersOpen" class="prompt-area booking-drawer"><div class="drawer-title"><b>智能筛选条件</b><span>填写后直接获取候选和候补</span></div><form class="booking-grid" @submit.prevent="recommend"><label>日期<input v-model="booking.day" type="date" required></label><label>时段<select v-model="booking.time" required><option value="">请选择</option><option v-for="item in times" :key="item">{{ item }}</option></select></label><label>人数<input v-model.number="booking.people" type="number" min="1" max="10000" required></label><label>类型<select v-model="booking.category"><option value="">不限</option><option v-for="item in categories" :key="item">{{ item }}</option></select></label><label class="preference">偏好<input v-model.trim="booking.requirement" maxlength="100" placeholder="如：电脑、投影、安静"></label><button class="match" :disabled="recommendLoading">{{ recommendLoading ? '匹配中…' : '开始匹配' }}</button></form></section>
    <form v-else class="prompt-area composer" @submit.prevent="send"><textarea v-model.trim="question" maxlength="2000" :placeholder="activeMode === 'notice' ? '输入活动通知、闭馆说明或规则，我来生成公告草稿…' : '输入你的问题，例如：今晚两个人安静自习，推荐哪里？'" @keydown.enter.exact.prevent="send"></textarea><div class="composer-foot"><span>{{ question.length }}/2000 · Enter 发送 · Shift + Enter 换行</span><button :disabled="loading || recommendLoading || !question" aria-label="发送消息">发送 ↗</button></div></form>
  </main>
</template>
<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { api } from '../../api/request'
import { categories } from '../../composables/useHelpers'
const times = ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '19:00-21:00']
const modes = [{ key: 'chat', icon: '✦', name: '智能问答', scene: '预约问答', desc: '咨询预约规则、使用方式和场地信息' }, { key: 'recommend', icon: '⌁', name: '场地推荐', scene: '场地推荐', desc: '根据实时余量，推荐可预约场地与候补' }, { key: 'notice', icon: '▤', name: '公告写作', scene: '公告润色', desc: '将通知要点整理为清晰的校园公告草稿' }]
const examples = [{ label: '安静自习', scene: '场地推荐', question: '今晚两个人安静自习，推荐什么场地？' }, { label: '电脑机房', scene: '场地推荐', question: '明天上午需要 60 人电脑机房，有哪些选择？' }, { label: '公告润色', scene: '公告润色', question: '帮我把“请文明使用教室”润色成校园公告。' }]
const activeMode = ref('chat'), question = ref(''), messages = ref([]), loading = ref(false), recommendLoading = ref(false), filtersOpen = ref(false), chatScroll = ref(null), speakingContent = ref(null), notice = ref(''), sidebarCollapsed = ref(false), conversationVersion = ref(0)
const historyKey = 'turboroom.ai.conversations.v1', historyQuery = ref(''), historySearchOpen = ref(false), historyManage = ref(false), selectedHistory = ref([]), activeConversationId = ref('')
const conversations = ref(loadConversations())
function loadConversations() { try { const saved = JSON.parse(localStorage.getItem(historyKey) || '[]'); return Array.isArray(saved) ? saved : [] } catch { return [] } }
function saveConversations() { localStorage.setItem(historyKey, JSON.stringify(conversations.value)) }
const filteredHistory = computed(() => conversations.value.filter(item => !historyQuery.value || item.title.toLowerCase().includes(historyQuery.value.toLowerCase())).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt))
function formatHistoryDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '历史' : date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) }
function ensureConversation(title = '') { if (activeConversationId.value) return conversations.value.find(item => item.id === activeConversationId.value); const item = { id: String(Date.now()), title: title || '新对话', pinned: false, updatedAt: Date.now(), messages: [] }; conversations.value.unshift(item); activeConversationId.value = item.id; saveConversations(); return item }
function syncConversation(title = '') { const item = ensureConversation(title); if (!item) return; item.messages = messages.value.map(message => ({ ...message })); if (title && item.title === '新对话') item.title = title.slice(0, 28); item.updatedAt = Date.now(); saveConversations() }
function openConversation(id) { const item = conversations.value.find(entry => entry.id === id); if (!item) return; conversationVersion.value++; loading.value = false; recommendLoading.value = false; question.value = ''; window.speechSynthesis?.cancel(); speakingContent.value = null; activeConversationId.value = id; messages.value = item.messages.map(message => ({ ...message })); historyManage.value = false; scrollToLatest() }
function openHistoryMenu(item, event) {
  const trigger = event.currentTarget.getBoundingClientRect()
  const list = event.currentTarget.closest('.history-list').getBoundingClientRect()
  item.menuAbove = list.bottom - trigger.bottom < 132 && trigger.top - list.top > 132
  item.menu = true
}
function togglePin(id) { const item = conversations.value.find(entry => entry.id === id); if (!item) return; item.pinned = !item.pinned; item.menu = false; saveConversations() }
function renameConversation(item) { const title = window.prompt('请输入对话名称', item.title); if (title?.trim()) { item.title = title.trim().slice(0, 40); item.menu = false; saveConversations() } }
function deleteHistory(id) { const item = conversations.value.find(entry => entry.id === id); if (!item || !window.confirm('删除这段历史对话？')) return; conversations.value = conversations.value.filter(entry => entry.id !== id); selectedHistory.value = selectedHistory.value.filter(value => value !== id); if (activeConversationId.value === id) resetChat(); saveConversations() }
function toggleHistory(id) { selectedHistory.value = selectedHistory.value.includes(id) ? selectedHistory.value.filter(value => value !== id) : [...selectedHistory.value, id] }
function toggleAllHistory(event) { selectedHistory.value = event.target.checked ? filteredHistory.value.map(item => item.id) : [] }
function deleteSelectedHistory() { if (!selectedHistory.value.length || !window.confirm('删除选中的历史对话？')) return; const ids = new Set(selectedHistory.value); conversations.value = conversations.value.filter(item => !ids.has(item.id)); if (ids.has(activeConversationId.value)) resetChat(); selectedHistory.value = []; saveConversations() }
const booking = ref({ day: '', time: '', people: 2, category: '', requirement: '' })
const currentMode = computed(() => modes.find(item => item.key === activeMode.value) || modes[0])
function id() { return Date.now() + Math.random() }
function buildChatHistory(entries) {
  return entries.flatMap(item => {
    if (item.question) return [{ role: 'user', content: item.question }]
    if (item.type === 'answer') return [{ role: 'assistant', content: item.content }]
    if (item.type === 'recommend') {
      const venues = (item.items || []).map(venue => venue.meetTitle).filter(Boolean).join('、')
      return [{ role: 'assistant', content: `${item.summary || '已完成场地推荐'}${venues ? ` 推荐场地：${venues}。` : ''}` }]
    }
    return []
  }).slice(-12)
}
async function scrollToLatest() { await nextTick(); if (chatScroll.value) chatScroll.value.scrollTop = chatScroll.value.scrollHeight }
function chooseMode(mode) { activeMode.value = mode.key; filtersOpen.value = mode.key === 'recommend'; question.value = ''; if (mode.key === 'notice') question.value = '请帮我生成一则校园公告：' }
function resetChat() { conversationVersion.value++; window.speechSynthesis?.cancel(); speakingContent.value = null; messages.value = []; question.value = ''; activeMode.value = 'chat'; filtersOpen.value = false; activeConversationId.value = ''; booking.value = { day: '', time: '', people: 2, category: '', requirement: '' }; loading.value = false; recommendLoading.value = false; notice.value = ''; nextTick(() => { document.querySelector('.composer textarea')?.focus(); scrollToLatest() }) }
function askExample(item) { activeMode.value = item.scene === '公告润色' ? 'notice' : 'chat'; question.value = item.question; send() }
function showNotice(text) { notice.value = text; window.clearTimeout(showNotice.timer); showNotice.timer = window.setTimeout(() => { notice.value = '' }, 2200) }
async function copyAnswer(content) { try { await navigator.clipboard.writeText(content); showNotice('已复制回答') } catch { window.prompt('请复制以下内容：', content) } }
async function copyQuestion(content) { try { await navigator.clipboard.writeText(content); showNotice('已复制问题') } catch { window.prompt('请复制以下内容：', content) } }
function editQuestion(message) { question.value = message.question || ''; showNotice('已填入输入框，可修改后重新发送'); nextTick(() => document.querySelector('.composer textarea')?.focus()) }
function setFeedback(message, feedback) { const cancelled = message.feedback === feedback; message.feedback = cancelled ? '' : feedback; showNotice(cancelled ? '已取消反馈' : feedback === 'up' ? '感谢你的点赞反馈' : '已收到，我们会持续改进') }
function toggleMore(message) { message.more = true }
function insertQuote(content) { question.value = `请基于以下回答继续补充：\n${content}\n\n`; showNotice('已引用到输入框'); nextTick(() => document.querySelector('.composer textarea')?.focus()) }
function speakAnswer(content) {
  if (!('speechSynthesis' in window)) { showNotice('当前浏览器不支持朗读功能'); return }
  if (speakingContent.value === content) { window.speechSynthesis.cancel(); speakingContent.value = null; showNotice('已停止朗读'); return }
  window.speechSynthesis.cancel(); speakingContent.value = content; const utterance = new SpeechSynthesisUtterance(content); utterance.lang = 'zh-CN'; utterance.onend = utterance.onerror = () => { if (speakingContent.value === content) speakingContent.value = null }; window.speechSynthesis.speak(utterance); showNotice('正在朗读回答，再次点击可停止')
}
function deleteConversation(message) {
  const index = messages.value.indexOf(message); if (index < 0) return
  let start = index
  for (let i = index - 1; i >= 0; i--) { if (messages.value[i].question) { start = i; break } }
  let end = index + 1
  while (end < messages.value.length && !messages.value[end].question) end++
  messages.value.splice(start, end - start)
  syncConversation()
  if (speakingContent.value === message.content) { window.speechSynthesis?.cancel(); speakingContent.value = null }
  showNotice('已删除本轮对话'); scrollToLatest()
}
async function regenerate(message) {
  const index = messages.value.indexOf(message); const prior = messages.value.slice(0, index).reverse().find(item => item.question);
  if (!prior || loading.value || recommendLoading.value) return; const history = buildChatHistory(messages.value.slice(0, messages.value.indexOf(prior))); const version = conversationVersion.value; loading.value = true; await scrollToLatest();
  showNotice('正在重新生成回答')
  try { const data = await api('/ai/chat', { question: prior.question, scene: currentMode.value.scene, history }); if (version === conversationVersion.value) { messages.value.splice(index, 1, { id: id(), type: 'answer', content: data.answer }); syncConversation() } }
  catch (e) { if (version === conversationVersion.value) showNotice(e.message || '重新生成失败，请稍后重试。') }
  finally { if (version === conversationVersion.value) loading.value = false; scrollToLatest() }
}
async function send() { if (!question.value || loading.value || recommendLoading.value) return; const version = conversationVersion.value; const text = question.value; const history = buildChatHistory(messages.value); question.value = ''; ensureConversation(text); messages.value.push({ id: id(), question: text, type: 'user' }); syncConversation(text); loading.value = true; await scrollToLatest(); try { const data = await api('/ai/chat', { question: text, scene: currentMode.value.scene, history }); if (version === conversationVersion.value) { messages.value.push({ id: id(), type: 'answer', content: data.answer }); syncConversation() } } catch (e) { if (version === conversationVersion.value) { messages.value.push({ id: id(), type: 'error', content: e.message || '请求失败，请稍后重试。' }); syncConversation() } } finally { if (version === conversationVersion.value) loading.value = false; scrollToLatest() } }
async function recommend() { if (loading.value || recommendLoading.value) return; const version = conversationVersion.value; recommendLoading.value = true; const prompt = `${booking.value.day} ${booking.value.time}，${booking.value.people} 人${booking.value.category ? '，' + booking.value.category : ''}${booking.value.requirement ? '，需求：' + booking.value.requirement : ''}`; ensureConversation(`场地推荐：${prompt}`); messages.value.push({ id: id(), question: `请为我推荐场地：${prompt}`, type: 'user' }); syncConversation(); await scrollToLatest(); try { const response = await api('/ai/recommend', booking.value); const items = Array.isArray(response) ? response.slice(0, 3) : []; if (version === conversationVersion.value) messages.value.push({ id: id(), type: 'recommend', items, summary: items.length ? '优先展示可预约场地；余量不足的场地已作为候补保留。' : '当前没有符合条件的场地，请调整条件后重试。' }) } catch (e) { if (version === conversationVersion.value) messages.value.push({ id: id(), type: 'error', content: e.message || '获取推荐失败，请稍后重试。' }) } finally { if (version === conversationVersion.value) { recommendLoading.value = false; filtersOpen.value = false; syncConversation() }; scrollToLatest() } }
watch([loading, recommendLoading], scrollToLatest)
</script>
<style scoped>
.ai-shell{display:grid;grid-template-columns:248px minmax(0,1fr);min-height:calc(100vh - 150px);margin:18px 0 42px;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;background:#fff;box-shadow:0 16px 50px rgba(15,23,42,.08)}.ai-sidebar{display:flex;flex-direction:column;padding:18px;background:#f8fafc;border-right:1px solid #e5e7eb}.brand{display:flex;align-items:center;gap:10px;padding:7px 6px 20px;color:#172554}.brand-dot{width:30px;height:30px;border-radius:10px;background:linear-gradient(135deg,#2563eb,#7c3aed);box-shadow:0 6px 14px #bfdbfe}.brand b,.brand small{display:block}.brand small{margin-top:3px;color:#64748b;font-size:.76rem}.new-chat,.mode-list button{width:100%;min-height:44px;border:0;border-radius:10px;font:inherit;text-align:left;cursor:pointer}.new-chat{margin-bottom:18px;background:#1d4ed8;color:#fff;text-align:center;font-weight:700}.mode-list{display:grid;gap:5px}.mode-list button{padding:0 12px;color:#475569;background:transparent}.mode-list button span{display:inline-flex;width:24px;font-size:1rem}.mode-list button:hover,.mode-list button.active{color:#1d4ed8;background:#e8f0ff;font-weight:700}.sidebar-note{margin-top:auto;padding:14px;border-radius:12px;background:#eef2ff;color:#475569;font-size:.8rem;line-height:1.65}.sidebar-note b{color:#3730a3}.sidebar-note p{margin:5px 0 0}.chat-stage{display:flex;min-width:0;min-height:0;flex-direction:column;background:#fff}.stage-head{display:flex;align-items:center;justify-content:space-between;padding:22px 28px;border-bottom:1px solid #edf0f4}.stage-head h1{margin:0;color:#111827;font-size:1.15rem}.stage-head p{margin:5px 0 0;color:#64748b;font-size:.88rem}.online{color:#15803d;font-size:.82rem}.online i{display:inline-block;width:8px;height:8px;margin-right:5px;border-radius:50%;background:#22c55e}.chat-scroll{flex:1;min-height:330px;max-height:520px;overflow:auto;padding:28px clamp(18px,5vw,68px);background:linear-gradient(#fff,#fbfdff)}.welcome{max-width:680px;margin:54px auto;text-align:center}.ai-avatar{background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff}.welcome>.ai-avatar{display:grid;place-items:center;width:52px;height:52px;margin:auto;border-radius:17px;font-weight:800}.welcome h2{margin:16px 0 8px;font-size:1.55rem;color:#111827}.welcome>p{margin:0;color:#64748b;line-height:1.7}.suggestions{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:26px;text-align:left}.suggestions button{min-height:110px;padding:15px;border:1px solid #e2e8f0;border-radius:14px;background:#fff;color:#475569;cursor:pointer;transition:.18s transform,.18s border-color,.18s box-shadow}.suggestions button:hover{border-color:#93c5fd;transform:translateY(-2px);box-shadow:0 10px 22px rgba(37,99,235,.11)}.suggestions b,.suggestions span{display:block}.suggestions b{margin-bottom:8px;color:#1e3a8a}.suggestions span{font-size:.85rem;line-height:1.5}.message{display:flex;gap:10px;max-width:800px;margin:0 auto 22px}.message.user{justify-content:flex-end}.avatar{display:grid;flex:0 0 34px;place-items:center;width:34px;height:34px;border-radius:11px;font-weight:800;font-size:.78rem}.user-avatar{background:#e0e7ff;color:#3730a3}.bubble,.answer-bubble,.recommend-bubble,.thinking{padding:12px 15px;border-radius:14px;line-height:1.75}.bubble{max-width:70%;background:#e8f0ff;color:#1e3a8a;border-bottom-right-radius:4px}.answer-bubble,.recommend-bubble,.thinking{max-width:calc(100% - 44px);background:#f5f7fb;color:#334155;border-bottom-left-radius:4px}.answer-bubble p{margin:0;white-space:pre-wrap}.answer-bubble.error{color:#b91c1c;background:#fff1f2}.recommend-bubble{width:min(100%,680px)}.recommend-bubble>b{color:#0f172a}.recommend-bubble>p{margin:4px 0 13px;color:#64748b;font-size:.88rem}.cards{display:grid;gap:9px}.venue-card{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:13px;border:1px solid #bbf7d0;border-radius:11px;background:#f0fdf4}.venue-card.alternate{border-color:#fde68a;background:#fffbeb}.venue-card h3{margin:5px 0 3px;color:#0f172a;font-size:.96rem}.venue-card p,.venue-card small{margin:0;color:#475569;font-size:.82rem;line-height:1.55}.status{font-size:.72rem;font-weight:800;color:#166534}.alternate .status{color:#92400e}.detail-link{color:#1d4ed8;font-size:.85rem;font-weight:700;text-decoration:none;white-space:nowrap}.thinking{display:flex;align-items:center;gap:5px;color:#64748b}.thinking i{width:6px;height:6px;border-radius:50%;background:#2563eb;animation:pulse 1s infinite alternate}.thinking i:nth-child(2){animation-delay:.18s}.thinking i:nth-child(3){animation-delay:.36s}.thinking span{margin-left:4px;font-size:.86rem}.booking-drawer{padding:13px 28px 15px;border-top:1px solid #edf0f4;background:#f8fafc}.drawer-title{display:flex;justify-content:space-between;margin-bottom:10px;color:#334155;font-size:.86rem}.drawer-title span{color:#94a3b8}.booking-grid{display:grid;grid-template-columns:1.2fr 1.2fr .8fr 1fr auto;gap:9px}label{min-width:0;color:#64748b;font-size:.75rem}input,select,textarea{box-sizing:border-box;width:100%;border:1px solid #dbe3ee;border-radius:9px;background:#fff;color:#0f172a;font:inherit}input,select{height:38px;margin-top:4px;padding:0 9px}.match,.composer button{border:0;border-radius:9px;background:#1d4ed8;color:#fff;font:inherit;font-weight:700;cursor:pointer}.match{align-self:end;height:38px;padding:0 14px}.composer{margin:16px 28px 24px;padding:12px;border:1px solid #cbd5e1;border-radius:16px;background:#fff;box-shadow:0 6px 22px rgba(15,23,42,.06)}.composer:focus-within{border-color:#60a5fa;box-shadow:0 0 0 3px #dbeafe}.composer textarea{min-height:70px;padding:3px;border:0;outline:0;resize:none;line-height:1.65}.composer-foot{display:flex;align-items:center;justify-content:space-between;margin-top:7px;color:#94a3b8;font-size:.76rem}.composer button{min-width:76px;height:36px}.composer button:disabled,.match:disabled{opacity:.5;cursor:not-allowed}@keyframes pulse{to{opacity:.25;transform:translateY(-3px)}}@media(max-width:820px){.ai-shell{grid-template-columns:1fr;border-radius:14px}.ai-sidebar{display:grid;grid-template-columns:1fr auto;gap:10px;padding:12px;border-right:0;border-bottom:1px solid #e5e7eb}.brand{padding:4px}.new-chat{grid-column:2;margin:0;padding:0 13px;width:auto}.mode-list{grid-column:1/-1;grid-template-columns:repeat(3,1fr)}.mode-list button{text-align:center;padding:0 4px}.mode-list button span{display:none}.sidebar-note{display:none}.suggestions{grid-template-columns:1fr}.chat-scroll{max-height:none;padding:24px 16px}.booking-drawer{padding:13px 16px}.booking-grid{grid-template-columns:1fr 1fr}.match{grid-column:span 2}.composer{margin:14px 16px 18px}.stage-head{padding:17px 16px}.online{display:none}}@media(max-width:500px){.mode-list button{font-size:.8rem}.booking-grid{grid-template-columns:1fr}.match{grid-column:auto}.drawer-title span{display:none}.venue-card{align-items:flex-start;flex-direction:column}.bubble{max-width:85%}.welcome{margin:28px auto}.chat-scroll{min-height:300px}}
.head-actions{display:flex;align-items:center;gap:12px}.clear-chat{border:0;background:transparent;color:#64748b;cursor:pointer;font:inherit;font-size:.82rem}.clear-chat:hover{color:#1d4ed8}.message-tools{position:relative;display:flex;align-items:center;gap:3px;margin-top:9px}.message-tools>button{display:grid;place-items:center;width:30px;height:30px;padding:0;border:0;border-radius:8px;background:transparent;color:#64748b;cursor:pointer}.message-tools>button:hover,.message-tools>button.selected{color:#1d4ed8;background:#e8f0ff}.message-tools svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.more-menu{position:absolute;left:186px;bottom:35px;z-index:3;padding:5px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.13);white-space:nowrap}.more-menu button{padding:6px 8px;border:0;border-radius:5px;background:#fff;color:#334155;cursor:pointer;font:inherit;font-size:.76rem}.more-menu button:hover{background:#f1f5f9}.more-menu .danger{color:#b91c1c}.action-notice{position:fixed;left:50%;bottom:96px;z-index:20;transform:translateX(-50%);padding:9px 14px;border-radius:9px;background:#111827;color:#fff;box-shadow:0 8px 25px rgba(15,23,42,.22);font-size:.83rem}.preference input{min-width:0}@media(min-width:821px){.booking-grid{grid-template-columns:1.05fr 1.05fr .7fr .95fr 1.35fr auto}}
.ai-shell{width:min(100%,1440px);min-height:min(840px,calc(100vh - 190px));margin:18px auto 36px;border-radius:16px;box-shadow:0 8px 28px rgba(15,23,42,.06)}.ai-sidebar{width:auto;padding:20px 16px}.brand{padding-bottom:22px}.sidebar-note{font-size:.78rem}.chat-stage{min-height:0}.stage-head{padding:18px clamp(18px,3vw,42px)}.chat-scroll{max-width:100%;width:100%;box-sizing:border-box;max-height:none;min-height:360px;padding:30px clamp(20px,7vw,96px)}.message{width:100%;max-width:860px}.answer-bubble,.recommend-bubble,.thinking{max-width:calc(100% - 44px)}.welcome{margin:52px auto 36px}.mode-toolbar{display:flex;align-items:center;gap:8px;padding:12px clamp(18px,3vw,42px) 0}.mode-toolbar button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;padding:0 13px;border:1px solid #e2e8f0;border-radius:9px;background:#fff;color:#475569;font:inherit;font-size:.86rem;cursor:pointer;transition:background .16s,border-color .16s,color .16s}.mode-toolbar button:hover{border-color:#93c5fd;color:#1d4ed8}.mode-toolbar button.active{border-color:#bfdbfe;background:#eff6ff;color:#1d4ed8;font-weight:700}.mode-icon{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.booking-drawer{margin:12px clamp(18px,3vw,42px) 0;padding:12px 14px;border:1px solid #e6ebf2;border-radius:11px;background:#f8fafc}.composer{margin:4px clamp(18px,3vw,42px) 20px;border-radius:13px;box-shadow:0 3px 14px rgba(15,23,42,.05)}.more-menu{left:auto;right:0;display:grid;gap:2px;min-width:170px}.more-menu button{display:flex;align-items:center;gap:9px;min-height:36px;padding:0 9px;text-align:left}.more-menu svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.more-menu .danger{color:#b91c1c}.more-menu .danger:hover{background:#fef2f2}.action-notice{bottom:106px}@media(max-width:820px){.ai-shell{min-height:calc(100vh - 150px);margin:12px auto 24px}.ai-sidebar{display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;border-bottom:1px solid #e5e7eb}.brand{padding:0}.new-chat{width:auto;min-width:130px;margin:0;padding:0 12px}.sidebar-note{display:none}.mode-toolbar{justify-content:center;padding:11px 14px 0}.chat-scroll{min-height:330px;padding:24px 16px}.booking-drawer{margin:10px 14px 0;padding:11px}.composer{margin:4px 14px 15px}.mode-toolbar button{flex:1;max-width:180px}}@media(max-width:500px){.ai-shell{min-height:calc(100dvh - 124px);margin:8px auto 16px;border-radius:12px}.ai-sidebar{padding:9px 11px}.brand small{display:none}.brand-dot{width:26px;height:26px}.new-chat{min-width:112px;min-height:40px}.stage-head{padding:13px}.mode-toolbar{gap:6px;padding:9px 10px 0}.mode-toolbar button{gap:5px;min-height:40px;padding:0 7px;font-size:.78rem}.mode-icon{width:15px;height:15px}.chat-scroll{min-height:280px;padding:18px 12px}.booking-drawer{margin:9px 10px 0;padding:10px}.composer{margin:4px 10px 12px;padding:10px}.composer-foot span{font-size:.68rem}.welcome h2{font-size:1.3rem}.message-tools{gap:1px}.message-tools>button{width:28px;height:28px}}
.ai-shell{display:grid;grid-template-columns:248px minmax(0,1fr);position:relative;width:min(100%,1240px);min-height:0;margin:18px auto 32px;border:0;border-radius:0;overflow:visible;box-shadow:none;background:#fff}
.ai-sidebar{display:flex;flex-direction:column;width:auto;min-width:0;padding:20px 16px;border-right:1px solid #e5e7eb;background:#f8fafc}
.sidebar-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:18px}.sidebar-top .brand{padding:0}.sidebar-toggle,.sidebar-open{display:grid;place-items:center;width:34px;height:34px;padding:0;border:1px solid #dbe3ee;border-radius:9px;background:#fff;color:#64748b;cursor:pointer}.sidebar-toggle:hover,.sidebar-open:hover{border-color:#93c5fd;color:#1d4ed8}.sidebar-toggle svg,.sidebar-open svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.sidebar-open{position:absolute;top:18px;left:14px;z-index:5;background:#fff;box-shadow:0 4px 14px rgba(15,23,42,.1)}
.new-chat{display:flex;align-items:center;justify-content:center;gap:5px}.new-chat span{font-size:1.2rem;line-height:1}.history-heading{display:flex;align-items:center;justify-content:space-between;margin:22px 6px 8px;color:#94a3b8;font-size:.75rem;font-weight:700}.history-heading button{width:25px;height:25px;padding:0;border:0;border-radius:7px;background:transparent;color:#94a3b8;font-size:1.1rem;cursor:pointer}.history-heading button:hover{background:#e8f0ff;color:#1d4ed8}.history-list{display:grid;gap:3px;overflow:auto}.history-item{display:flex;flex-direction:column;gap:3px;width:100%;min-height:48px;padding:8px 10px;border:0;border-radius:9px;background:transparent;color:#475569;text-align:left;font:inherit;font-size:.8rem;line-height:1.35;cursor:pointer}.history-item:hover,.history-item.active{background:#e8f0ff;color:#1d4ed8}.history-item.active{font-weight:700}.history-date{color:#94a3b8;font-size:.7rem;font-weight:400}.history-item.active .history-date{color:#60a5fa}
.sidebar-collapsed{grid-template-columns:1fr}.sidebar-collapsed .ai-sidebar{display:none}
.stage-head{display:flex;align-items:center;justify-content:space-between;min-height:58px;padding:0 26px;border-bottom:1px solid #eef1f5;background:#fff}
.stage-head h1{display:flex;align-items:center;gap:8px;font-size:.98rem;font-weight:700}.stage-head h1::after{content:'⌄';color:#94a3b8;font-size:.9rem}.stage-head p{margin:3px 0 0;font-size:.76rem;color:#94a3b8}.head-actions{gap:14px}.online{display:inline-flex;align-items:center;padding:5px 9px;border:1px solid #dcfce7;border-radius:999px;background:#f0fdf4;font-size:.75rem}.clear-chat{padding:6px 9px;border-radius:8px}.clear-chat:hover{background:#f1f5f9}
.chat-stage{display:block;width:100%;min-height:0}
.chat-scroll{min-height:520px;padding:14px 0 0;background:#fff;overflow:visible}
.welcome{max-width:980px;margin:0 auto;padding:20px 0 60px;text-align:center}
.welcome>.ai-avatar{width:64px;height:64px;margin:0 auto 28px;border-radius:19px}
.welcome h2{margin:0 0 12px;font-size:2.2rem}
.welcome>p{margin-bottom:42px;font-size:1.15rem}
.suggestions{max-width:980px;margin:0 auto;grid-template-columns:repeat(3,1fr);gap:18px;text-align:left}
.mode-toolbar{max-width:1140px;margin:0 auto;padding:0;justify-content:flex-start}
.composer{max-width:1140px;margin:8px auto 24px}
.booking-drawer{max-width:1112px;margin:12px auto 8px}
@media(max-width:760px){
  .ai-shell{display:block}
  .ai-sidebar{display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-right:0;border-bottom:1px solid #e5e7eb}
  .sidebar-top{flex:1;margin:0}.sidebar-top .brand small,.history-heading,.history-list,.sidebar-note{display:none}.sidebar-toggle{width:32px;height:32px}.new-chat{width:auto;min-width:102px;margin:0;padding:0 12px}.sidebar-open{top:10px;left:10px}
  .welcome{padding:16px}
  .welcome h2{font-size:1.6rem}
  .welcome>p{font-size:1rem;margin-bottom:28px}
  .suggestions{grid-template-columns:1fr;gap:10px}
  .mode-toolbar{padding:0 16px;gap:8px}
  .mode-toolbar button{flex:1;min-width:0}
  .composer{margin:8px 16px 18px}
  .booking-drawer{margin-left:16px;margin-right:16px}
}
@media(min-width:761px){
  .mode-toolbar{max-width:900px}
  .mode-toolbar button{min-height:36px;padding:0 11px;font-size:.82rem}
  .mode-icon{width:16px;height:16px}
  .composer{max-width:900px;padding:10px}
  .composer textarea{min-height:60px}
}
.ai-shell{border:1px solid #e5eaf1;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 12px 34px rgba(15,23,42,.07)}
.ai-sidebar{background:#f8fafc;border-right-color:#e8edf3}
.sidebar-top{padding-bottom:2px}.brand{color:#172554}.brand-dot{box-shadow:0 5px 12px rgba(37,99,235,.2)}
.new-chat{min-height:42px;box-shadow:0 5px 12px rgba(29,78,216,.16);transition:background .18s,transform .18s,box-shadow .18s}.new-chat:hover{background:#1e40af;box-shadow:0 7px 16px rgba(29,78,216,.22);transform:translateY(-1px)}.new-chat:active{transform:translateY(0)}
.history-list{max-height:310px;padding-right:2px}.history-item{transition:background .16s,color .16s}.history-item.active{box-shadow:inset 3px 0 #2563eb}
.history-heading-actions{display:flex;gap:3px}.history-heading-actions button,.history-more,.history-pin{width:25px;height:25px;padding:0;border:0;border-radius:7px;background:transparent;color:#94a3b8;font-size:1rem;cursor:pointer}.history-heading-actions button:hover,.history-more:hover,.history-pin:hover{background:#e8f0ff;color:#1d4ed8}.history-search{display:flex;gap:5px;margin:0 2px 8px}.history-search input{height:34px;margin:0;padding:0 9px;font-size:.78rem}.history-search button{width:32px;border:0;background:transparent;color:#64748b;font-size:1.2rem}.history-bulkbar{display:flex;align-items:center;gap:8px;margin:0 2px 8px;padding:7px;border:1px solid #dbe3ee;border-radius:8px;background:#fff;font-size:.72rem;color:#64748b}.history-bulkbar label{display:flex;align-items:center;gap:4px;margin-right:auto}.history-bulkbar button{border:0;background:transparent;color:#1d4ed8;font-size:.72rem;cursor:pointer}.history-bulkbar .history-delete{color:#b91c1c}.history-bulkbar button:disabled{opacity:.4;cursor:not-allowed}.history-row{position:relative;display:flex;align-items:center;gap:2px;border-radius:9px}.history-row.active{background:#e8f0ff}.history-row .history-item{flex:1;min-width:0}.history-row .history-item:hover{background:transparent}.history-check{margin-left:7px}.history-pin{flex:0 0 25px;color:#f59e0b}.history-more{flex:0 0 25px}.history-menu{position:absolute;right:3px;top:39px;z-index:8;display:grid;min-width:130px;padding:5px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.14)}.history-menu button{border:0;background:#fff;padding:8px;text-align:left;color:#334155;font-size:.74rem;cursor:pointer}.history-menu button:hover{background:#f1f5f9}.history-menu .danger{color:#b91c1c}.history-empty{padding:18px 8px;color:#94a3b8;text-align:center;font-size:.78rem}
.chat-stage{background:#fff}.chat-scroll{scrollbar-width:thin;scrollbar-color:#cbd5e1 transparent}.chat-scroll::-webkit-scrollbar{width:8px}.chat-scroll::-webkit-scrollbar-thumb{border:2px solid transparent;border-radius:99px;background:#cbd5e1;background-clip:padding-box}
.welcome>.ai-avatar{box-shadow:0 10px 22px rgba(37,99,235,.18)}.welcome h2{letter-spacing:0}.suggestions button{background:#fff;box-shadow:0 3px 10px rgba(15,23,42,.025)}
.mode-toolbar{gap:9px}.mode-toolbar button{min-width:132px;transition:transform .16s,background .16s,border-color .16s,color .16s,box-shadow .16s}.mode-toolbar button:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(15,23,42,.07)}.mode-toolbar button:focus-visible,.sidebar-toggle:focus-visible,.sidebar-open:focus-visible,.history-item:focus-visible,.new-chat:focus-visible{outline:3px solid rgba(96,165,250,.35);outline-offset:2px}
.booking-drawer{background:#f8fafc;border-color:#e2e8f0;box-shadow:0 3px 12px rgba(15,23,42,.03)}
.composer{border-color:#d7e0eb;background:#fcfdff;box-shadow:0 5px 18px rgba(15,23,42,.06);transition:border-color .18s,box-shadow .18s}.composer:focus-within{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(219,234,254,.85),0 7px 20px rgba(15,23,42,.07)}.composer textarea::placeholder{color:#94a3b8}.composer-foot{padding-top:1px}.composer button{background:#2563eb;box-shadow:0 4px 10px rgba(37,99,235,.18);transition:background .18s,transform .18s,box-shadow .18s}.composer button:not(:disabled):hover{background:#1d4ed8;box-shadow:0 6px 14px rgba(37,99,235,.24);transform:translateY(-1px)}
.message{animation:message-in .2s ease-out}.answer-bubble,.recommend-bubble{box-shadow:0 2px 8px rgba(15,23,42,.025)}
.user-message-group{display:flex;flex-direction:column;align-items:flex-end;max-width:70%}.bubble{max-width:100%}.user-message-tools{display:flex;gap:3px;margin-top:5px;padding:2px;opacity:0;visibility:hidden;transform:translateY(-3px);transition:opacity .16s ease,transform .16s ease,visibility .16s step-end}.message.user:hover .user-message-tools,.message.user:focus-within .user-message-tools{opacity:1;visibility:visible;transform:translateY(0);transition:opacity .16s ease,transform .16s ease}.user-message-tools button{display:grid;place-items:center;width:30px;height:30px;padding:0;border:0;border-radius:8px;background:transparent;color:#64748b;cursor:pointer}.user-message-tools button:hover{background:#dbeafe;color:#1d4ed8}.user-message-tools button.danger:hover{background:#fee2e2;color:#b91c1c}.user-message-tools svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
@keyframes message-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
@media(max-width:760px){.mode-toolbar button{min-width:0}}
@media(min-width:761px){
  .composer{box-sizing:border-box;width:calc(100% - 104px);max-width:1156px;min-height:206px;display:flex;flex-direction:column;padding:14px 18px}
  .composer textarea{flex:1;min-height:145px;font-size:1.08rem;line-height:1.7}
  .composer-foot{margin-top:auto}
}
@media(max-width:760px){
  .composer{min-height:0;display:block;padding:10px}
  .composer textarea{min-height:60px;font-size:inherit}
}
@media(min-width:761px){
  .booking-drawer,.mode-toolbar,.composer{grid-column:2}
  .mode-toolbar{width:calc(100% - 104px);max-width:1156px;box-sizing:border-box;margin:0 auto;padding:0;gap:12px;justify-content:flex-start}
  .mode-toolbar button{flex:0 0 160px;width:160px;min-width:160px;height:60px;min-height:60px;padding:0 16px;border-radius:14px;font-size:1rem}
  .mode-icon{width:20px;height:20px}
  .composer{margin-top:8px}
  .sidebar-collapsed .booking-drawer,.sidebar-collapsed .mode-toolbar,.sidebar-collapsed .composer{grid-column:1}
}
@media(max-width:760px){
  .booking-drawer,.mode-toolbar,.composer{grid-column:auto}
}
@media(min-width:761px){
  .composer{width:calc(100% - 104px);max-width:1156px;min-height:88px}
  .composer textarea{min-height:44px}
}
@media(min-width:761px){
  .ai-shell{min-height:calc(100vh - 150px)}
  .ai-sidebar{grid-row:1 / -1;height:100%;box-sizing:border-box;padding-bottom:24px}
  .ai-sidebar .sidebar-note{margin-bottom:0}
  .history-list{flex:1;min-height:180px;max-height:none}
}
@media(max-width:760px){
  .ai-shell{min-height:0}
  .ai-sidebar{grid-row:auto;height:auto}
  .history-list{flex:initial;min-height:0}
}
@media(min-width:761px){
  .ai-shell{min-height:0;grid-auto-rows:auto;margin-bottom:24px}
  .ai-sidebar{grid-column:1;grid-row:1 / 3;height:100%;align-self:stretch}
  .chat-stage{grid-column:2;grid-row:1;min-height:calc((100vh - 150px) * .8);align-self:start}
  .booking-drawer{grid-column:2;grid-row:2}
  .mode-toolbar{grid-column:2;grid-row:3}
  .composer{grid-column:2;grid-row:4;min-height:190px}
  .chat-scroll{min-height:calc(520px * .8)}
  .composer textarea{min-height:136px}
  .sidebar-collapsed .ai-sidebar{display:none}
  .sidebar-collapsed .chat-stage,.sidebar-collapsed .booking-drawer,.sidebar-collapsed .mode-toolbar,.sidebar-collapsed .composer{grid-column:1 / -1}
}
@media(max-width:760px){
  .ai-sidebar,.chat-stage,.booking-drawer,.mode-toolbar,.composer{grid-column:auto;grid-row:auto}
  .ai-sidebar{height:auto}
}
@media(min-width:761px){
  .chat-stage{min-height:0}
  .chat-scroll{min-height:320px;max-height:420px;overflow:auto;padding-top:12px}
  .welcome{margin:22px auto 24px;padding-bottom:28px}
  .welcome>.ai-avatar{margin-bottom:18px}
  .welcome h2{font-size:1.9rem;margin-bottom:8px}
  .welcome>p{margin-bottom:24px;font-size:1rem}
  .suggestions{margin-top:18px}
  .composer{min-height:160px}
  .composer textarea{min-height:106px}
}
@media(min-width:761px){
  .ai-shell{margin-bottom:0}
  .ai-sidebar{padding-bottom:0}
  .history-list{flex:none;min-height:0;max-height:none}
  .sidebar-note{margin-top:14px}
  .composer{margin-bottom:0}
}
@media(min-width:761px){
  .mode-toolbar,.composer{transform:translateY(-285px)}
}
@media(min-width:761px){
  .composer{margin-bottom:-285px}
}
@media(min-width:761px){
  .composer{min-height:80px}
  .composer textarea{min-height:50px}
}
@media(min-width:761px){
  .composer{min-height:72px;padding:8px 12px}
  .composer textarea{min-height:28px}
}
.history-heading{min-height:30px;margin:18px 4px 8px;color:#64748b}
.history-heading-actions{gap:5px}
.history-heading-actions button{display:grid;place-items:center;width:30px;height:30px;border:1px solid transparent;border-radius:8px;color:#64748b;transition:background .16s,border-color .16s,color .16s}
.history-heading-actions button svg,.history-search>svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.history-heading-actions button:hover,.history-heading-actions button.active{border-color:#dbeafe;background:#eff6ff;color:#1d4ed8}
.history-search{align-items:center;gap:7px;margin:0 0 9px;padding:0 9px;border:1px solid #dbe3ee;border-radius:9px;background:#fff;color:#94a3b8}
.history-search:focus-within{border-color:#93c5fd;box-shadow:0 0 0 3px #dbeafe}
.history-search input{flex:1;min-width:0;height:36px;border:0;outline:0;box-shadow:none!important;background:transparent;font-size:.78rem}
.history-search button{width:24px;height:24px;padding:0;border-radius:6px;font-size:1rem}
.history-bulkbar{display:grid;grid-template-columns:1fr auto auto;gap:6px;margin:0 0 9px;padding:8px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;box-shadow:0 2px 8px rgba(15,23,42,.035);color:#64748b}
.history-select-all{display:flex;align-items:center;gap:6px;min-height:30px;margin:0;font-size:.76rem;font-weight:600}
.history-select-all input,.history-check{width:15px;height:15px;min-height:15px;margin:0;accent-color:#2563eb}
.history-selected-count{grid-column:1;grid-row:2;align-self:center;padding-left:21px;color:#94a3b8;font-size:.7rem}
.history-bulkbar button{display:flex;align-items:center;justify-content:center;gap:4px;min-height:30px;padding:0 8px;border-radius:7px;font-size:.73rem;font-weight:600}
.history-bulkbar .history-delete{grid-column:2;grid-row:1/3;background:#fff5f5;color:#b91c1c}
.history-bulkbar .history-delete:hover:not(:disabled){background:#fee2e2}
.history-bulkbar .history-delete:disabled{background:#f8fafc;color:#cbd5e1}
.history-bulkbar .history-delete svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.history-bulkbar .history-done{grid-column:3;grid-row:1/3;background:#eff6ff;color:#1d4ed8}
.history-row{min-height:48px;gap:3px;padding:1px 2px;transition:background .15s}
.history-row:hover,.history-row.active{background:#eaf1ff}
.history-row .history-item{min-height:44px;padding:7px 8px;font-size:.78rem}
.history-row .history-item:hover,.history-row.active .history-item{background:transparent}
.history-check{flex:0 0 15px;margin-left:5px}
.history-more,.history-pin{display:grid;flex:0 0 28px;place-items:center;width:28px;height:28px;border-radius:7px;color:#748197;opacity:0;transition:opacity .14s,background .14s,color .14s}
.history-more svg,.history-pin svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.history-row:hover .history-more,.history-row:hover .history-pin,.history-more:focus-visible,.history-pin:focus-visible{opacity:1}
.history-pin.pinned{color:#d18a18}
.history-more:hover,.history-pin:hover{background:#dce9ff;color:#1d4ed8}
.history-menu{top:calc(100% - 2px);right:4px;min-width:156px;padding:5px;border-color:#e2e8f0;border-radius:10px;box-shadow:0 10px 24px rgba(15,23,42,.14)}
.history-menu button{display:flex;align-items:center;gap:9px;min-height:36px;padding:0 9px;border-radius:7px;font-size:.78rem}
.history-menu button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.history-menu button:hover{background:#f1f5f9}
.history-menu .danger:hover{background:#fef2f2}
.history-row:has(.history-check){padding:3px 5px}
.history-row:has(.history-check) .history-item{padding-left:7px}
.history-empty{padding:24px 8px}
.history-bulkbar :focus-visible,.history-heading-actions :focus-visible,.history-more:focus-visible,.history-pin:focus-visible,.history-menu button:focus-visible{outline:2px solid #60a5fa;outline-offset:1px}
/* Chat workspace: quiet history rail, readable conversation, anchored composer. */
.ai-shell{width:min(100%,1480px);height:min(900px,calc(100vh - 154px));min-height:620px;margin:10px auto 24px;grid-template-columns:260px minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto auto auto;border:1px solid #e6ebf2;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 10px 32px rgba(15,23,42,.055)}
.ai-sidebar{grid-column:1;grid-row:1/5;align-self:stretch;min-height:0;height:100%;box-sizing:border-box;padding:22px 16px 16px;background:#f8fafc;border-right:1px solid #e9edf3}
.sidebar-top{margin-bottom:22px}.brand{gap:11px;padding:0 4px;color:#172554}.brand b{font-size:15px}.brand small{font-size:11px;color:#8a98ad}.brand-dot{width:32px;height:32px;border-radius:11px}
.new-chat{min-height:44px;margin:0 0 22px;border-radius:10px;background:#2563eb;color:white;box-shadow:none}.new-chat:hover{background:#1d4ed8;transform:none;box-shadow:0 4px 12px rgba(37,99,235,.16)}
.history-heading{margin:0 2px 8px;color:#718096;font-size:.76rem}.history-list{flex:1;min-height:0;max-height:none;overflow-y:auto;padding:2px 1px 10px;scrollbar-width:thin;scrollbar-color:#d8dee8 transparent}
.history-row{min-height:54px;padding:3px;border-radius:10px}.history-row:hover,.history-row.active{background:#edf3ff}.history-row.active{box-shadow:inset 2px 0 #3b75ed}.history-row .history-item{min-height:48px;gap:4px;padding:7px 9px;color:#43516a;font-size:.79rem}.history-row.active .history-item{color:#214da4}.history-date{color:#98a4b7;font-size:.7rem}.history-row .history-date{font-variant-numeric:tabular-nums}
.history-more,.history-pin{flex-basis:30px;width:30px;height:30px}.history-menu{top:calc(100% - 2px);right:4px;z-index:12}.sidebar-note{margin-top:12px;padding:12px;border-radius:10px;background:#eef3fb;color:#64748b}.sidebar-note b{color:#38598f}
.chat-stage{grid-column:2;grid-row:1;min-height:0;display:flex;flex-direction:column;background:#fff}.stage-head{flex:none;min-height:66px;padding:12px 32px;border-bottom:1px solid #eef1f5}.stage-head h1{font-size:.98rem;color:#1f2937}.stage-head p{font-size:.76rem;color:#8995a7}.online{padding:4px 9px;border-color:#d9f1e3;font-size:.7rem}
.chat-scroll{flex:1;min-height:0;max-height:none;width:100%;padding:28px 24px 20px;overflow-y:auto;background:#fff;scrollbar-width:thin;scrollbar-color:#d8dee8 transparent}.message{max-width:820px;margin-bottom:24px;gap:11px}.bubble{max-width:min(74%,680px);padding:13px 17px;border-radius:15px 15px 4px 15px;background:#e9f1ff;color:#244b8c;font-size:.96rem;line-height:1.75}.user-message-group{max-width:calc(100% - 44px)}.answer-bubble,.recommend-bubble{border-radius:4px 15px 15px 15px;background:#f7f8fb;padding:15px 17px;color:#334155;line-height:1.8}.answer-bubble p{font-size:.92rem}.recommend-bubble{width:min(100%,700px)}
.welcome{max-width:760px;margin:36px auto 24px;padding:0 16px;text-align:center}.welcome>.ai-avatar{width:54px;height:54px;margin-bottom:18px;border-radius:17px}.welcome h2{font-size:1.7rem;color:#202a3a}.welcome>p{max-width:540px;margin:0 auto 24px;color:#7d899b;font-size:.92rem}.suggestions{max-width:760px;gap:12px;margin:24px auto 0}.suggestions button{min-height:104px;padding:15px;border-radius:12px;border-color:#e7ebf2;box-shadow:0 2px 8px rgba(15,23,42,.025)}.suggestions button:hover{transform:translateY(-1px)}.suggestions b{font-size:.9rem}.suggestions span{font-size:.78rem;color:#64748b}
.booking-drawer{grid-column:2;grid-row:2;width:calc(100% - 64px);max-width:960px;margin:8px auto;padding:10px 13px;border:1px solid #e8edf4;border-radius:11px;background:#fafbfd;box-shadow:none}.drawer-title{font-size:.78rem}.drawer-title span{font-size:.72rem}.booking-grid{gap:8px}.booking-grid input,.booking-grid select{height:36px;min-height:36px;font-size:.78rem}.match{height:36px;font-size:.78rem}
.mode-toolbar{grid-column:2;grid-row:3;width:calc(100% - 64px);max-width:960px;margin:8px auto 0;padding:0;gap:8px}.mode-toolbar button{flex:0 0 auto;min-width:120px;height:38px;min-height:38px;padding:0 12px;border-radius:9px;font-size:.8rem}
.composer{grid-column:2;grid-row:4;align-self:end;width:calc(100% - 64px);max-width:960px;min-height:122px;margin:8px auto 18px;padding:12px 14px;border-color:#dfe5ed;border-radius:14px;background:#fff;box-shadow:0 4px 16px rgba(15,23,42,.045);transform:none}.composer textarea{min-height:68px;padding:2px;font-size:.92rem;line-height:1.65}.composer-foot{margin-top:8px;font-size:.7rem}.composer button{min-width:76px;height:34px;min-height:34px;border-radius:9px}
.sidebar-collapsed{grid-template-columns:minmax(0,1fr)}.sidebar-collapsed .ai-sidebar{display:none}.sidebar-collapsed .chat-stage,.sidebar-collapsed .booking-drawer,.sidebar-collapsed .mode-toolbar,.sidebar-collapsed .composer{grid-column:1}.sidebar-collapsed .chat-scroll{padding-left:clamp(24px,8vw,100px);padding-right:clamp(24px,8vw,100px)}
@media(max-width:900px){.ai-shell{height:auto;min-height:calc(100vh - 145px);grid-template-columns:220px minmax(0,1fr)}.ai-sidebar{padding:18px 12px}.chat-stage{min-height:500px}.chat-scroll{min-height:360px;padding:24px 18px}.stage-head{padding:12px 18px}.booking-drawer,.mode-toolbar,.composer{width:calc(100% - 36px)}.booking-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.booking-grid .preference{grid-column:1/-1}.booking-grid .match{grid-column:1/-1}.mode-toolbar button{flex:1;min-width:0}}
@media(max-width:680px){.ai-shell{display:flex;flex-direction:column;width:100%;height:auto;min-height:calc(100dvh - 120px);margin:0 auto 12px;border-radius:0;border-left:0;border-right:0}.ai-sidebar{display:flex;flex-direction:column;order:0;max-height:none;padding:10px 14px;border-right:0;border-bottom:1px solid #e9edf3}.sidebar-top{margin:0}.sidebar-top .brand small{display:block}.sidebar-toggle{width:32px;height:32px}.new-chat{position:absolute;top:13px;right:54px;width:auto;min-width:102px;min-height:36px;margin:0;padding:0 10px;font-size:.8rem}.history-heading,.history-search,.history-bulkbar,.history-list{display:none}.sidebar-note{display:none}.chat-stage{order:1;min-height:350px;flex:1}.stage-head{min-height:56px;padding:10px 14px}.stage-head p{max-width:54vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.head-actions{gap:6px}.online{font-size:0;padding:7px}.online i{margin:0}.chat-scroll{min-height:350px;max-height:none;padding:18px 12px}.message{gap:8px;margin-bottom:18px}.bubble{max-width:86%;padding:11px 13px;font-size:.9rem}.user-message-group{max-width:calc(100% - 42px)}.welcome{margin:24px auto 16px;padding:0 6px}.welcome h2{font-size:1.35rem}.welcome>p{font-size:.84rem;margin-bottom:18px}.suggestions{gap:8px;margin-top:16px}.suggestions button{min-height:74px;padding:11px;border-radius:10px}.suggestions span{font-size:.74rem}.booking-drawer{order:2;width:calc(100% - 24px);margin:8px 12px;padding:10px}.mode-toolbar{order:3;width:calc(100% - 24px);margin:8px 12px 0;gap:6px}.mode-toolbar button{min-height:40px;padding:0 7px;font-size:.74rem}.mode-icon{width:15px;height:15px}.composer{order:4;width:calc(100% - 24px);min-height:96px;margin:8px 12px 12px;padding:9px 11px}.composer textarea{min-height:48px;font-size:.88rem}.composer-foot span{font-size:.64rem}}
/* Keep mode selection above one shared, switchable prompt area. */
.ai-shell{grid-template-rows:minmax(0,1fr) auto auto}
.ai-sidebar{grid-row:1/4}
.chat-stage{grid-row:1;align-self:stretch;height:100%;min-height:0;overflow:hidden}
.chat-scroll{flex:1 1 auto;min-height:0;max-height:none;overflow-y:auto;overscroll-behavior:contain}
.mode-toolbar{grid-column:2;grid-row:2;position:relative;z-index:2;width:calc(100% - 64px);max-width:960px;margin:8px auto 0;padding:0;justify-content:flex-start;transform:none}
.prompt-area{grid-column:2;grid-row:3;position:relative;z-index:1;width:calc(100% - 64px);max-width:960px;box-sizing:border-box;align-self:stretch;margin:8px auto 18px}
.booking-drawer.prompt-area{padding:12px 14px;border:1px solid #e8edf4;border-radius:11px;background:#fafbfd}
.composer.prompt-area{min-height:122px;padding:12px 14px}
.composer.prompt-area textarea{min-height:68px}
.sidebar-collapsed .chat-stage,.sidebar-collapsed .mode-toolbar,.sidebar-collapsed .prompt-area{grid-column:1}
@media(max-width:900px){.mode-toolbar,.prompt-area{width:calc(100% - 36px)}}
@media(max-width:680px){.ai-sidebar{order:0}.chat-stage{order:1;align-self:stretch;height:auto;min-height:350px;overflow:visible}.chat-scroll{min-height:350px;max-height:none}.mode-toolbar{order:2;width:calc(100% - 24px);margin:8px 12px 0;justify-content:center}.prompt-area{order:3;width:calc(100% - 24px);margin:8px 12px 12px}.booking-drawer.prompt-area{padding:10px}.composer.prompt-area{min-height:96px;padding:9px 11px}.composer.prompt-area textarea{min-height:48px}}
.history-bulkbar{display:flex;flex-wrap:nowrap;align-items:center;gap:8px;white-space:nowrap}
.history-bulkbar .history-select-all{flex:0 0 auto;margin:0}
.history-bulkbar .history-selected-count{flex:1 1 auto;grid-column:auto;grid-row:auto;align-self:center;margin:0;padding:0;text-align:center}
.history-bulkbar .history-delete,.history-bulkbar .history-done{flex:0 0 auto;grid-column:auto;grid-row:auto}
/* Main layout: welcome content, mode buttons, composer. The history rail stays independent. */
@media(min-width:681px){
  .ai-shell{display:grid;grid-template-columns:260px minmax(0,1fr);grid-template-rows:auto auto auto;align-content:start;align-items:start;height:auto;min-height:0;max-height:none;overflow:visible}
  .ai-sidebar{position:absolute;inset:0 auto auto 0;grid-column:auto;grid-row:auto;width:260px;height:100%;min-height:0;box-sizing:border-box}
  .chat-stage,.mode-toolbar,.prompt-area{grid-column:2;width:calc(100% - 64px);max-width:1040px;margin-left:auto;margin-right:auto}
  .chat-stage{grid-row:1;height:auto;min-height:0;overflow:visible}
  .chat-stage.empty-chat .chat-scroll{display:block;flex:none;height:auto;min-height:0;max-height:none;overflow:visible;padding-bottom:10px}
  .chat-stage.empty-chat .welcome{display:block;visibility:visible;margin:32px auto 10px}
  .mode-toolbar{grid-row:2;position:relative;margin-top:14px;transform:none}
  .prompt-area{grid-row:3;position:relative;align-self:start;margin-top:14px;margin-bottom:20px}
  .composer.prompt-area{height:122px;min-height:122px;max-height:none}
  .composer.prompt-area textarea{min-height:68px;max-height:none}
  .sidebar-collapsed{grid-template-columns:minmax(0,1fr)}
  .sidebar-collapsed .ai-sidebar{display:none}
  .sidebar-collapsed .chat-stage,.sidebar-collapsed .mode-toolbar,.sidebar-collapsed .prompt-area{grid-column:1}
}
@media(max-width:680px){
  .ai-shell{display:flex;flex-direction:column;height:auto;min-height:0;max-height:none;align-content:start;overflow:visible}
  .ai-sidebar{position:relative;inset:auto;width:auto;height:auto;min-height:0}
  .chat-stage{order:1;flex:none;height:auto;min-height:0;overflow:visible}
  .chat-scroll{flex:none;height:360px;min-height:0;max-height:360px;overflow-y:auto}
  .chat-stage.empty-chat .chat-scroll{height:auto;min-height:0;max-height:none;overflow:visible;padding-bottom:8px}
  .chat-stage.empty-chat .welcome{margin-bottom:8px}
  .mode-toolbar{order:2;margin:12px 12px 0;transform:none}
  .prompt-area{order:3;margin:12px 12px 12px;align-self:stretch}
  .composer.prompt-area{height:auto;min-height:96px}
}
@media(min-width:681px){
  .chat-stage:not(.empty-chat) .chat-scroll{min-height:220px;max-height:min(560px,calc(100vh - 360px));overflow-y:auto;overscroll-behavior:contain}
}
.history-row .history-item{align-items:stretch;min-width:0}
.history-row .history-item>.history-date{flex:none}
.history-row .history-item>span:last-child{display:-webkit-box;min-width:0;overflow:hidden;overflow-wrap:anywhere;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.message.user .user-message-group{width:fit-content;min-width:0;max-width:min(74%,680px)}
.message.user .bubble{box-sizing:border-box;width:fit-content;max-width:100%;white-space:pre-wrap;overflow-wrap:anywhere}
@media(max-width:680px){.message.user .user-message-group{max-width:calc(100% - 42px)}}
/* Anchor the hover menu to its own trigger, not the full answer toolbar. */
.answer-more{position:relative;display:inline-flex;flex:none}
.answer-more>button{display:grid;place-items:center;width:30px;height:30px;padding:0;border:0;border-radius:8px;background:transparent;color:#64748b;cursor:pointer}
.answer-more>button:hover{color:#1d4ed8;background:#e8f0ff}
.answer-more .more-menu{left:auto;right:0;bottom:calc(100% + 6px);z-index:10;margin:0}
.answer-more .more-menu::after{content:'';position:absolute;top:100%;left:0;right:0;height:6px}
.message .message-tools{transition:opacity .16s ease,visibility .16s ease}
.message:not(:hover) .message-tools,.message.user:not(:hover) .user-message-tools{opacity:0;visibility:hidden;pointer-events:none}
.message:hover .message-tools,.message.user:hover .user-message-tools{opacity:1;visibility:visible;pointer-events:auto}
.history-actions{position:relative;display:flex;flex:0 0 30px;align-items:center}
.history-actions .history-menu{top:calc(100% + 6px);right:0;min-width:156px;margin:0}
.history-actions .history-menu::before{content:'';position:absolute;bottom:100%;left:0;right:0;height:6px}
.history-actions .history-menu.opens-above{top:auto;bottom:calc(100% + 6px)}
.history-actions .history-menu.opens-above::before{top:100%;bottom:auto}
.history-row:not(:hover) .history-more,.history-row:not(:hover) .history-pin{opacity:0;pointer-events:none}
</style>

