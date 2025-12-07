<script setup>
defineProps({
  id: String,
  type: { type: String, default: 'text' },
  modelValue: String,
  placeholder: String,
  label: String,
  buttonText: { type: String, default: '확인' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'click'])
</script>

<template>
  <div>
    <label :for="id" class="block font-semibold text-16 text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red">*</span>
    </label>

    <div class="flex gap-2">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        class="flex-1 border-b border-gray-200 py-2 text-16 outline-none placeholder:text-gray-200"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <button
        type="button"
        class="w-20 h-8 font-bold text-10 flex items-center justify-center rounded-2xl border border-main bg-white text-main"
        @click="$emit('click')"
      >
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>
