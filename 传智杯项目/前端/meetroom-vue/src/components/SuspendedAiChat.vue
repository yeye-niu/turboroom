<template>
  <SuspendedBallChat
    url="/meetroom/ai/suspended-chat"
    app-name="TurboRoom"
    :domain-name="domainName"
    location="right-bottom"
    size="medium"
    title="TurboRoom AI 助手"
    :enable-context="true"
    :enable-local-storage="true"
    :storage-key="storageKey"
    :max-history-count="30"
    :context-history-count="10"
    :enable-streaming="false"
    :enable-voice-input="true"
    :enable-auto-speech="false"
    :enable-insert-message="false"
    :max-input-length="2000"
    custom-placeholder="请输入问题，例如：今晚两个人安静自习，推荐哪里？"
    :show-theme-toggle="false"
    :show-feedback-button="false"
    :assistant-config="assistantConfig"
    :welcome-config="welcomeConfig"
    :custom-request-config="requestConfig"
    :callbacks="callbacks"
  />
</template>

<script setup>
import { computed } from 'vue'
import { SuspendedBallChat } from 'ai-suspended-ball-chat'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const domainName = computed(() => userStore.cust?.id || userStore.cust?.account || 'guest')
const storageKey = computed(() => `turboroom.ai.suspended.v2.${domainName.value}`)
const assistantConfig = { name: 'TurboRoom AI', description: '校园场地与自习预约助手' }
const welcomeConfig = { title: '你好，我是 TurboRoom AI', description: '随时帮你了解预约规则、生成校园公告或解答自习场地问题。' }
const requestConfig = {
  timeout: 100000,
  requestParamProcessor: (params) => ({
    question: params.query,
    scene: '预约问答',
    history: (Array.isArray(params.history) ? params.history : [])
      .filter(message => (message.role === 'user' || message.role === 'assistant') && message.content?.trim())
      .slice(-10)
      .map(message => ({ role: message.role, content: message.content.trim().slice(0, 3000) }))
  })
}
const callbacks = {
  onError: (error) => console.error('TurboRoom 浮动 AI 助手请求失败', error)
}
</script>

<style>
/* The library panel is teleported outside this component, so these rules stay global. */
.chat-panel-container .message-bubble-wrapper .assistant-toolbar .toolbar-btn {
  min-width: 30px;
  min-height: 30px;
  padding: 0;
  line-height: 1;
  color: #64748b;
}
.chat-panel-container .message-bubble-wrapper .assistant-toolbar .toolbar-btn svg {
  display: block;
  width: 16px;
  height: 16px;
  fill: currentColor;
  color: currentColor;
  opacity: 1;
}
.chat-panel-container .message-bubble-wrapper .assistant-toolbar .toolbar-btn svg path {
  fill: currentColor;
}
.chat-panel-container .message-bubble-wrapper .assistant-toolbar .download-btn,
.chat-panel-container .message-bubble-wrapper .assistant-toolbar .speak-btn {
  display: none;
}
@media (max-width: 680px) {
  .panel {
    width: min(92vw, 420px) !important;
    max-height: min(78dvh, 720px) !important;
  }
}
</style>
