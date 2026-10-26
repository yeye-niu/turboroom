<template>
  <div
    class="code-slots"
    :style="cssVars"
  >
    <div
      ref="rowRef"
      class="code-slots__row"
      :data-status="status"
      :data-focused="focused ? '' : undefined"
      :data-disabled="disabled ? '' : undefined"
      @mousedown="onRowMouseDown"
    >
      <input
        ref="inputRef"
        class="code-slots__input"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        pattern="[0-9]*"
        :value="inputValue"
        :maxlength="length"
        :aria-label="ariaLabel"
        :aria-invalid="status === 'error'"
        :disabled="disabled"
        :readonly="status === 'success'"
        @keydown="onKeyDown"
        @paste="onPaste"
        @input="onInput"
        @focus="focused = true"
        @blur="focused = false"
      />

      <span
        v-for="(ch, i) in view"
        :key="i"
        class="code-slots__slot"
        :class="{
          'code-slots__slot--active': focused && i === active,
          'code-slots__slot--filled': ch,
          'code-slots__slot--landing': landingSlots.has(i),
          'code-slots__slot--draining': drainingSlots.has(i)
        }"
      >
        <span
          v-if="ch"
          class="code-slots__digit"
          :class="{ 'code-slots__digit--mask': mask }"
        >
          {{ mask ? '•' : ch }}
        </span>
      </span>

      <span
        v-if="status === 'success'"
        class="code-slots__wash"
      >
        <span class="code-slots__check">✓</span>
      </span>

      <span
        v-if="showCaret"
        class="code-slots__caret"
        :style="{ left: `${active * (slotSize + gap) + slotSize / 2 - 0.75}px` }"
      >
        <span class="code-slots__caret-line" />
      </span>
    </div>

    <span class="code-slots__sr" aria-live="polite">
      {{ status === 'success' ? '验证成功' : `${view.filter(Boolean).length} / ${length} 位已输入` }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  length: { type: Number, default: 6 },
  value: { type: String, default: undefined },
  defaultValue: { type: String, default: '' },
  status: { type: String, default: 'idle', validator: v => ['idle', 'error', 'success'].includes(v) },
  mask: { type: Boolean, default: false },
  caret: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  autoFocus: { type: Boolean, default: false },
  accentColor: { type: String, default: '#16775f' },
  inkColor: { type: String, default: '#16775f' },
  slotColor: { type: String, default: '#e8f2ec' },
  digitColor: { type: String, default: '#173c34' },
  dangerColor: { type: String, default: '#ad3030' },
  slotSize: { type: Number, default: 48 },
  gap: { type: Number, default: 8 },
  radius: { type: Number, default: 10 },
  cascade: { type: Number, default: 30 },
  ariaLabel: { type: String, default: '验证码' }
})

const emit = defineEmits(['update:value', 'change', 'complete'])

const inputRef = ref(null)
const rowRef = ref(null)
const slots = ref(Array.from({ length: props.length }, () => ''))
const active = ref(0)
const focused = ref(false)
const inputValue = ref('')
const landingSlots = ref(new Set())
const drainingSlots = ref(new Set())

const cssVars = computed(() => ({
  '--cs-accent': props.accentColor,
  '--cs-ink': props.inkColor,
  '--cs-slot': props.slotColor,
  '--cs-digit': props.digitColor,
  '--cs-danger': props.dangerColor,
  '--cs-size': `${props.slotSize}px`,
  '--cs-height': `${Math.round(props.slotSize * 1.18)}px`,
  '--cs-gap': `${props.gap}px`,
  '--cs-radius': `${Math.min(props.radius, props.slotSize / 2)}px`,
  '--cs-font': `${Math.round(props.slotSize * 0.5)}px`
}))

const view = computed(() => {
  const arr = [...slots.value]
  while (arr.length < props.length) arr.push('')
  return arr.slice(0, props.length)
})

const showCaret = computed(() => {
  return props.caret && focused.value && !props.disabled && props.status !== 'success' &&
    (props.status === 'error' || !view.value[active.value])
})

const digitsOf = raw => String(raw ?? '').replace(/\D/g, '')
const firstEmpty = arr => {
  const i = arr.indexOf('')
  return i === -1 ? arr.length - 1 : i
}
const isFull = arr => arr.every(Boolean)

const commit = next => {
  slots.value = next
  const code = next.join('')
  emit('update:value', code)
  emit('change', code)
}

const triggerLanding = i => {
  landingSlots.value.add(i)
  setTimeout(() => landingSlots.value.delete(i), 300)
}

const triggerDraining = i => {
  drainingSlots.value.add(i)
  setTimeout(() => drainingSlots.value.delete(i), 300)
}

const insert = (raw, from = active.value) => {
  const digits = digitsOf(raw)
  if (!digits) return
  const next = [...slots.value]
  let i = from
  for (const ch of digits) {
    if (i >= props.length) break
    next[i] = ch
    triggerLanding(i)
    i++
  }
  if (i === from) return
  commit(next)
  active.value = Math.min(i, props.length - 1)
  const wasFull = isFull(slots.value)
  if (!wasFull && isFull(next)) emit('complete', next.join(''))
}

const clearSlot = (i, stepBack = false) => {
  if (!slots.value[i]) {
    if (stepBack) active.value = i
    return
  }
  const next = [...slots.value]
  next[i] = ''
  triggerDraining(i)
  commit(next)
  if (stepBack) active.value = i
}

const onKeyDown = e => {
  if (props.disabled || props.status === 'success') return
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const k = e.key
  if (/^[0-9]$/.test(k)) {
    e.preventDefault()
    insert(k)
  } else if (k === 'Backspace') {
    e.preventDefault()
    if (slots.value[active.value]) clearSlot(active.value)
    else if (active.value > 0) clearSlot(active.value - 1, true)
  } else if (k === 'Delete') {
    e.preventDefault()
    clearSlot(active.value)
  } else if (k === 'ArrowLeft') {
    e.preventDefault()
    active.value = Math.max(active.value - 1, 0)
  } else if (k === 'ArrowRight') {
    e.preventDefault()
    active.value = Math.min(active.value + 1, props.length - 1)
  }
}

const onPaste = e => {
  if (props.disabled || props.status === 'success') return
  e.preventDefault()
  insert(e.clipboardData.getData('text'))
}

const onInput = e => {
  if (props.disabled || props.status === 'success') return
  const d = digitsOf(e.target.value)
  if (!d) return
  inputValue.value = ''
  insert(d, d.length === 1 ? active.value : 0)
}

const onRowMouseDown = e => {
  if (props.disabled || props.status === 'success') return
  e.preventDefault()
  const row = rowRef.value
  if (row) {
    const rect = row.getBoundingClientRect()
    const pitch = props.slotSize + props.gap
    const i = Math.floor((e.clientX - rect.left) / pitch)
    active.value = Math.max(0, Math.min(i, firstEmpty(slots.value)))
  }
  inputRef.value?.focus()
}

watch(() => props.value, val => {
  if (val === undefined) return
  const clean = digitsOf(val).slice(0, props.length)
  const prev = slots.value
  const next = Array.from({ length: props.length }, (_, i) => clean[i] ?? '')
  slots.value = next
  active.value = firstEmpty(next)
  if (next.join('') !== prev.join('')) {
    emit('change', next.join(''))
  }
  if (!isFull(prev) && isFull(next)) emit('complete', clean)
})

watch(() => props.status, status => {
  if (status === 'error') {
    const filled = slots.value.map((c, i) => c ? i : -1).filter(i => i >= 0)
    filled.reverse().forEach((i, k) => {
      setTimeout(() => triggerDraining(i), k * props.cascade)
    })
    setTimeout(() => {
      commit(Array.from({ length: props.length }, () => ''))
      active.value = 0
    }, filled.length * props.cascade + 300)
  }
})

watch(() => props.length, len => {
  slots.value = Array.from({ length: len }, (_, i) => slots.value[i] ?? '')
  active.value = firstEmpty(slots.value)
})

if (props.autoFocus) {
  nextTick(() => inputRef.value?.focus())
}
</script>
