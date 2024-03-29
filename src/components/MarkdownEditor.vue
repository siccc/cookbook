<script setup lang="ts">
import { inject, type RendererElement, type App, ref } from 'vue';
import { markdown } from '@codemirror/lang-markdown';
import { Codemirror } from 'vue-codemirror';
import { minimalSetup } from 'codemirror';
import {EditorView} from "@codemirror/view";
import VueCodemirror from 'vue-codemirror';

const props = defineProps<{
  content: string,
  placeholder?: string,
  height?: number
}>();
const modelValue = ref(props.content);
const emittedValue = ref(props.content);

const emit = defineEmits<{
  (e: 'change', content: string): void
}>();


const app = inject('app') as App<RendererElement>;
if (!app._context.components.VueCodemirror) {
  app.use(VueCodemirror, {
    // keep the global default extensions empty
    extensions: []
  });
}

const myTheme = EditorView.theme({
  '&': {
    '-webkit-appearance': 'none',
    'border': '1px solid #d6d3d1',
    'border-radius': '0.5rem',
    '-webkit-border-radius': '0.5rem',
    'padding-left': '0.75rem',
    'padding-right': '0.75rem',
    'padding-top': '0.375rem',
    'padding-bottom': '0.375rem',
    'fontSize': '16px',
  },
  '.cm-placeholder': {
    'color': '#a8a29e',
    'height': '1.4em',
  },
  '.cm-content': {
    'font-family': "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  },
  '&.cm-editor.cm-focused': {
    'border': '1px solid #facc15',
    'outline': 'none',
    'box-shadow': '0 0 0 1px #facc15',
    '-webkit-box-shadow': '0 0 0 1px #facc15',
  }
});

const extensions = [
  minimalSetup,
  markdown(),
  EditorView.lineWrapping,
  EditorView.domEventHandlers({
    blur() {
      emitChange();
    }
  }),
  myTheme
];

function emitChange() {
  if (modelValue.value !== emittedValue.value) {
    emittedValue.value = modelValue.value;
    emit('change', modelValue.value);
  }
}

// Change is called on every input
function onChange(newValue: string) {
  modelValue.value = newValue;
}
</script>

<template>
  <codemirror
    :model-value="modelValue"
    :placeholder="props.placeholder"
    :style="{ height: '100%' }"
    :autofocus="false"
    :indent-with-tab="true"
    :tab-size="2"
    :extensions="extensions"
    @change="onChange"
  />
</template>
