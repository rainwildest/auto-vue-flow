<script setup lang="ts">
import type { PropType } from "vue";
import {} from "vue";

defineProps({
  data: { type: Object as PropType<any>, default: () => {} }
});
</script>

<template>
  <div class="h-[140px] w-[250px] overflow-hidden rounded-md bg-white shadow">
    <div class="flex h-8 items-center bg-sky-500 px-2">
      <span class="text-white">审批节点</span>
    </div>

    <div class="p-2.5">
      {{ data?.name }}
    </div>
  </div>
</template>
