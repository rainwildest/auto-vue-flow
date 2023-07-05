<script setup lang="ts">
import type { PropType } from "vue";
import {} from "vue";

defineProps({
  data: { type: Object as PropType<any>, default: () => {} }
});
</script>

<template>
  <div class="box-border flex h-12 w-32 items-center justify-center rounded-full border border-solid border-sky-300 bg-white shadow">
    {{ data.name }}
  </div>
</template>
