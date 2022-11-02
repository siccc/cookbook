<script setup lang="ts">
import { inject, type RendererElement, type App, ref } from 'vue';
import { Codemirror } from 'vue-codemirror';
import VueCodemirror from 'vue-codemirror';
import { minimalSetup } from 'codemirror';
import {EditorView} from "@codemirror/view";
import { markdown } from '@codemirror/lang-markdown';

const props = defineProps<{
  content: string,
  placeholder?: string,
  height?: number
}>();

const emit = defineEmits<{
  (e: 'change', content: string): void
}>();

const content = ref(props.content);

const app = inject('app') as App<RendererElement>;
if (!app._context.components.VueCodemirror) {
  app.use(VueCodemirror, {
    // keep the global default extensions empty
    extensions: []
  });
}

const myTheme = EditorView.theme({
  '&': {
    border: '1px solid #d6d3d1',
    'border-radius': '0.25rem',
    'padding-left': '0.75rem',
    'padding-right': '0.75rem',
    'padding-top': '0.375rem',
    'padding-bottom': '0.375rem',
    fontSize: "16px"
  },
  '&.cm-editor.cm-focused': {
    outline: 'none',
    border: '1px solid #facc15',
  }
});

const extensions = [minimalSetup, markdown(), myTheme];

function onChange() {
  emit('change', content.value);
}

</script>

<template>
  <codemirror
    v-model="content"
    :placeholder="props.placeholder"
    :style="{ height: `${props.height || 200}px` }"
    :autofocus="false"
    :indent-with-tab="true"
    :tab-size="2"
    :extensions="extensions"
    @blur="onChange"
  />
</template>
