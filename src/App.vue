<script setup lang="ts">
import { ref } from "vue";
import { Background } from "@vue-flow/background";
import { MarkerType, VueFlow, useVueFlow } from "@vue-flow/core";

import _ from "lodash";
import CustomOriginal from "./components/CustomOriginal.vue";
import CustomNode from "./components/CustomNode.vue";
import CustomGroup from "./components/CustomGroup.vue";

import data from "./data";
import { UUID } from "./utils";
const uuid = UUID(1);
const onDataResolve = () => {
  const _data = _.cloneDeep(data);

  const nodes = [];
  /* 找到开始部分 */
  const start = _.find(_data, (item) => !item.before.length);
  /* 找到结束部分 */
  const end = _.find(_data, (item) => !item.after.length);

  const startNode = { id: start?.id, type: "custom-original", data: start, position: { x: -64, y: 0 } };
  nodes.push(startNode);

  const endNode = { id: end?.id, type: "custom-original", data: end, position: { x: -64, y: 180 } };
  nodes.push(endNode);

  /* 移除已经使用的对象 */
  _.pullAllBy(_data, [{ id: start?.id }, { id: end?.id }], "id");
  console.log(_data);
  // console.log(start)
  // console.log(end)

  return nodes;
};

// const onSingleNode = (nodeSign: string, data: any[], options: CreateNodeProps) => {
//   const { prevNode, tailNode, positionX, step } = options;
//   const nodeinfo = _.find(data, ["id", nodeSign]);

//   const nodeId = uuid();
//   const nextNode = _.filter(nodeinfo?.after_node_id || [], (node) => node !== tailNode);

//   const { width } = onCalculationNodeWidth(nextNode.length);
//   const nextPositionX = nextNode.length === 1 ? positionX : 64 - width / 2;

//   return {
//     node: { id: nodeId, type: "custom", position: { x: positionX, y: step }, data: nodeinfo },
//     edge: { id: uuid(), source: prevNode, target: nodeId, type: "step", markerEnd: MarkerType.ArrowClosed },
//     nextNode,
//     nextPositionX,
//     step: step + 140 + 90,
//     connect: nextNode.length ? "" : nodeId
//   };
// };

// const onCreateMultipleNode = (nodeSigns: Array<string>, data: AnyProps[], options: CreateNodeProps) => {
//   const { prevNode, tailNode, positionX, step } = options;
//   /* 创建节点组 */
//   const initHeight = 140 + 110 * 2;
//   const { width: containerWidth, offset } = onCalculationNodeWidth(nodeSigns.length);
//   const nextPositionsX: Array<number | undefined> = [];

//   const containerId = uuid();
//   const startPoint = uuid();
//   const finishPoint = uuid();

//   const nodesinfo = nodeSigns.map((item) => _.find(data, ["id", item]));

//   let _step = 0;
//   let calc = 0;
//   const nodes: Node[] = [];
//   const edges: Edge[] = [];
//   const connect: string[] = [];

//   const nextNodes: Array<string[]> = [];

//   /* 计算每个节点的偏移 */
//   // const nodeOffset: Array<number> = new Array(nodesinfo.length).fill(0);
//   // nodesinfo.forEach((item, index) => {
//   //   const len = item?.after_node_id?.length;
//   //   if (len > 1) {
//   //     const { width } = onCalculationNodeWidth(len);

//   //     if (!index) {
//   //       nodeOffset[index + 1] = width / 2 - 125;
//   //     } else {
//   //       const half = width / 2 - 125;
//   //       nodeOffset[index] = nodeOffset[index] + half;
//   //       nodesinfo.length - 1 !== index && (nodeOffset[index + 1] = half);
//   //     }
//   //   }
//   // });

//   // const calcOffset = nodeOffset.reduce((prev, current) => prev + current);

//   const containerNode = {
//     id: containerId,
//     draggable: true,
//     type: "custom-group",
//     position: { x: positionX, y: step - 30 },
//     style: { width: `${containerWidth}px`, height: `${initHeight}px` }
//   };

//   /* 创建父级容器存放节点 */
//   const group: Array<Node> = [
//     containerNode,
//     {
//       id: startPoint,
//       type: "custom-point",
//       extent: "parent",
//       // expandParent: true,
//       parentNode: containerId,
//       position: { x: containerWidth / 2 - 0.5, y: 0 }
//     },
//     {
//       id: finishPoint,
//       type: "custom-point",
//       extent: "parent",
//       // expandParent: true,
//       parentNode: containerId,
//       position: { x: containerWidth / 2 - 0.5, y: 140 + 110 * 2 }
//     }
//   ];

//   /* 遍历组节点内是否还有连接其它节点 */
//   nodesinfo.forEach((node, index) => {
//     if (!node) return;
//     const childId = uuid();
//     const child: Node = {
//       id: childId,
//       type: "custom",
//       data: node,
//       draggable: true,
//       extent: "parent",
//       // expandParent: true,
//       parentNode: containerId,
//       position: { x: index * offset, y: 110 }
//     };
//     nodes.push(child);
//     edges.push({ id: uuid(), source: startPoint, target: childId, type: "step", markerEnd: MarkerType.ArrowClosed });

//     const nextNode = _.filter(node.after_node_id, (key) => key !== tailNode);
//     nextNodes.push(nextNode);

//     if (nextNode.length) {
//       const position = child.position.x - Math.abs(positionX);
//       const { width } = onCalculationNodeWidth(nextNode.length);
//       const offset = nextNode.length > 1 ? width / 2 - 125 : 0;

//       nextPositionsX.push(position - offset);
//     } else {
//       nextPositionsX.push(undefined);
//     }

//     if (!_.filter(node.after_node_id || [], (key) => key !== tailNode).length) {
//       edges.push({ id: uuid(), source: childId, target: finishPoint, type: "step" });
//     } else {
//       calc++;
//     }
//   });

//   if (!calc) {
//     connect.push(containerId);
//     _step = 50;
//   }

//   return {
//     nodes: [...group, ...nodes],
//     edges: [...edges, { id: uuid(), source: prevNode, target: containerId }],
//     step: step + initHeight + _step,
//     nextNodes,
//     nextPositionsX,
//     connect
//   };
// };

// const { onConnect, addEdges, addNodes, onReady } = useVueFlow()
const elements = ref<any>([...onDataResolve()]);

const { onPaneReady } = useVueFlow();

onPaneReady(({ fitView }) => {
  fitView();
});
</script>

<template>
  <div class="h-screen w-screen overflow-hidden bg-gray-50">
    <VueFlow v-model="elements" :default-viewport="{ zoom: 1.5 }" :min-zoom="0.2" :max-zoom="2" class="h-full w-full">
      <template #node-custom-original="props">
        <CustomOriginal :data="props.data" />
      </template>

      <template #node-custom="props">
        <CustomNode :data="props" />
      </template>

      <template #node-custom-group>
        <CustomGroup />
      </template>

      <Background class="h-full w-full" />
    </VueFlow>
  </div>
</template>

<style lang="scss"></style>

<style lang="scss">
@import "@vue-flow/core/dist/style.css";
</style>