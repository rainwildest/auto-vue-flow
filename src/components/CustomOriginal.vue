<script setup lang="ts">
import type { PropType } from "vue";
import {} from "vue";

defineProps({
  data: { type: Object as PropType<any>, default: () => {} }
});
</script>

<template>
  <div class="flex h-[140px] w-[250px] justify-center" :class="[{ 'items-end': !data.before?.length, '': data.after?.length }]">
    <div class="box-border flex h-12 w-32 items-center justify-center rounded-full border border-solid border-sky-300 bg-white shadow">
      {{ data.name }}
    </div>
  </div>
</template>
