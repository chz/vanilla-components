<script setup lang="ts">
import type { PropType } from 'vue'
import { ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import { textareaConfig } from './config'
import type { TextareaClassesValidKeys, TextareaProps, TextareaValue } from './config'
import { useConfiguration, useVModel, useVariantProps } from '@/core/use'
import { hasSlot } from '@/core/helpers'
import FormErrors from '@/components/forms/form-errors.vue'
import FormFeedback from '@/components/forms/form-feedback.vue'
import ExclamationCircleIcon from '@/components/icons/hero/solid/ExclamationCircleIcon.vue'
import ClipboardIcon from '@/components/icons/hero/outline/ClipboardIcon.vue'
import CheckIcon from '@/components/icons/hero/solid/CheckIcon.vue'

const props = defineProps({
  ...useVariantProps<TextareaProps, TextareaClassesValidKeys>(),
  modelValue: {
    type: [String, Number] as PropType<TextareaValue>,
    default: undefined,
  },
  rows: {
    type: [String, Number] as PropType<string | number>,
    default: 4,
  },
  placeholder: {
    type: [String] as PropType<string>,
    default: 'text',
  },
  copiable: {
    type: [Boolean] as PropType<boolean>,
    default: false,
  },
})

const localRef = ref(null)
const localValue = useVModel(props, 'modelValue')
const { configuration, errors, hasErrors } = useConfiguration<TextareaProps>(textareaConfig, 'Textarea', localValue)

// Clipboard handler
const { text, copy, copied, isSupported } = useClipboard()

defineOptions({
  name: 'VanillaTextarea',
  inheritAttrs: false,
})
</script>

<template>
  <div class="vanilla-input">
    <div :class="configuration.classesList.wrapper">
      <div
        v-if="hasSlot($slots.before)"
        :class="configuration.classesList.addonBefore"
      >
        <slot
          name="before"
          v-bind="{ className: configuration.classesList.addonClasses }"
        />
      </div>
      <textarea
        :id="name"
        ref="localRef"
        v-model="localValue"
        :name="name"
        :autocomplete="props.autocomplete"
        :class="[
          hasSlot($slots.before) ? configuration.classesList.addonBeforeInputClasses : '',
          hasSlot($slots.after) || hasErrors ? configuration.classesList.addonAfterInputClasses : '',
          configuration.classesList.input,
          configuration.classesList.inputBorder,
          props.rounded === 'full' ? configuration.classesList.roundedFull : '',
          props.rounded === 'top' ? configuration.classesList.roundedTop : '',
          props.rounded === 'bottom' ? configuration.classesList.roundedBottom : '',
          props.rounded === 'left' ? configuration.classesList.roundedLeft : '',
          props.rounded === 'right' ? configuration.classesList.roundedRight : '',
          props.rounded === 'top-left' ? configuration.classesList.roundedTopLeft : '',
          props.rounded === 'top-right' ? configuration.classesList.roundedTopRight : '',
          props.rounded === 'bottom-left' ? configuration.classesList.roundedBottomLeft : '',
          props.rounded === 'bottom-right' ? configuration.classesList.roundedBottomRight : '',
        ]"
        v-bind="$attrs"
      />
      <div
        v-if="hasSlot($slots.after) || hasErrors || props.copiable"
        v-bind="{ hasErrors, className: configuration.classesList.addonClasses }"
        :class="configuration.classesList.addonAfter"
      >
        <slot name="after">
          <ExclamationCircleIcon
            v-if="hasErrors"
            :class="configuration.classesList.addonClasses"
          />
          <ClipboardIcon
            v-show="props.copiable && !copied"
            :class="configuration.classesList.addonClasses"
            @click="copy(localValue)"
          />
          <CheckIcon
            v-show="props.copiable && copied"
            :class="configuration.classesList.addonClasses"
          />
        </slot>
      </div>
    </div>
    <slot
      name="errors"
      v-bind="{ hasErrors, errors }"
    >
      <FormErrors
        v-if="hasErrors && props.showErrors"
        :errors="errors"
      />
    </slot>
    <slot
      name="feedback"
      v-bind="{ hasErrors, feedback: props.feedback }"
    >
      <FormFeedback
        v-if="!hasErrors && props.feedback !== undefined && props.showFeedback"
        :text="props.feedback"
      />
    </slot>
  </div>
</template>

