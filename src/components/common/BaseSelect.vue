<script setup>
defineProps({
  id: String,
  modelValue: String,
  label: String,
  required: { type: Boolean, default: false },
  options: { type: Array, default: () => [] }, // [{ value, label }] 형태 지원
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div>
    <label :for="id" class="block font-semibold text-16 text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red">*</span>
    </label>

    <select
      :id="id"
      :value="modelValue"
      class="w-full border-b py-2 text-16 outline-none"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option disabled value="">대분류부터 선택해주세요</option>
      <option v-for="(opt, idx) in options" :key="idx" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>
