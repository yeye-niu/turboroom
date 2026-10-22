<template>
  <div class="field">
    <label :for="'f-' + name">
      {{ label }}<span v-if="required"> *</span>
    </label>
    <select
      v-if="type === 'select'"
      :id="'f-' + name"
      :name="name"
      :required="required"
      v-model="innerValue"
    >
      <option v-for="opt in selectOptions" :key="opt[0]" :value="opt[0]">{{ opt[1] }}</option>
    </select>
    <textarea
      v-else-if="type === 'textarea'"
      :id="'f-' + name"
      :name="name"
      :required="required"
      :readonly="readonly"
      :minlength="min"
      :maxlength="max"
      v-model="innerValue"
    ></textarea>
    <input
      v-else
      :id="'f-' + name"
      :name="name"
      :type="type"
      :required="required"
      :readonly="readonly"
      :min="type === 'number' ? minNum : undefined"
      :max="type === 'number' ? maxNum : undefined"
      :minlength="type !== 'number' ? min : undefined"
      :maxlength="type !== 'number' ? max : undefined"
      :value="innerValue"
      @input="innerValue = $event.target.value"
      :autocomplete="autocomplete"
      :pattern="type === 'tel' ? '1[0-9]{10}' : undefined"
    >
    <small v-if="hint">{{ hint }}</small>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  name: String,
  label: String,
  type: { type: String, default: 'text' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: true },
  readonly: Boolean,
  min: [String, Number],
  max: [String, Number],
  choices: Array,
  hint: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const innerValue = ref(String(props.modelValue ?? ''))

watch(() => props.modelValue, (v) => {
  innerValue.value = String(v ?? '')
})

watch(innerValue, (v) => {
  emit('update:modelValue', v)
})

const selectOptions = computed(() => {
  if (!props.choices) return []
  return props.choices.map(x => Array.isArray(x) ? x : [x, x])
})

const minNum = computed(() => props.type === 'number' ? props.min : undefined)
const maxNum = computed(() => props.type === 'number' ? props.max : undefined)

const autocomplete = computed(() => {
  if (props.type === 'password') return 'current-password'
  if (props.name === 'account' || props.name === 'name') return 'username'
  return undefined
})
</script>
