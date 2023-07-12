<script setup lang="ts">
import type { Node, Edge } from "@vue-flow/core";

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

interface NodePointerProps {
  prevNode: string;
  nextNode: Array<string>;
  nextPositionX: number;
  step: number;
}

const onDataResolve = () => {
  console.log(_.difference([1, 2], [2, 1, 4]));
  const _data = _.cloneDeep(data);

  const nodes: Node[] = [];
  /* 找到开始部分 */
  const start = _.find(_data, (item) => !item.before.length);
  /* 找到结束部分 */
  const end = _.find(_data, (item) => !item.after.length);

  if (!start || !end) return;

  const startNode: Node = { id: start.id, type: "custom-original", data: start, position: { x: -64, y: 0 } };
  const endNode: Node = { id: end.id, type: "custom-original", data: end, position: { x: -64, y: 180 } };

  nodes.push(startNode);
  nodes.push(endNode);

  const nextNode: Array<string> = _.filter(start?.after, (node) => node !== end?.id);
  /* 移除已经使用的对象 */
  _.pullAllBy(_data, [{ id: start?.id }, { id: end?.id }], "id");

  let step = 80;
  const { width: containerWidth } = onCalculationNodeWidth(nextNode.length);

  let nodePointer: NodePointerProps = {
    prevNode: start?.id || "",
    nextNode,
    nextPositionX: -(nextNode.length > 1 ? containerWidth / 2 : 250 / 2),
    step: step + 40
  };

  let i = 0;
  do {
    if (!_data.length) break;
    i++;
    console.log(`第 ${i} 层`);
    const { nextNode } = nodePointer;
    if (nextNode.length > 1) {
      const multiple = onMultipleNode(nextNode, _data, nodes, { step });
      nodes.push(...multiple.nodes);
      console.log("我到这里了", nextNode);
    } else {
      console.log(nextNode);
      const single = onSingleNode(nextNode[0], data, {
        prevNode: nodePointer.prevNode,
        tailNode: end?.id || "",
        positionX: nodePointer.nextPositionX,
        step: nodePointer.step
      });

      console.log(single.node);
      nodes.push(single.node);
      step = single.step;

      nodePointer = {
        ...nodePointer,
        prevNode: single.node.id,
        nextNode: single.nextNode,
        step: single.step,
        nextPositionX: single.nextPositionX
      };

      _.pullAllBy(_data, [{ id: nextNode[0] }], "id");
    }
  } while (i < 3);

  // let nodePointers: Array<NodePointerProps> = [];

  // console.log(start)
  // console.log(end)

  return nodes;
};

/**
 * @brief 计算节点组的宽度
 */
const onCalculationNodeWidth = (amount: number) => {
  const offsetStep = 100;
  const horizontalOffset = 250 + offsetStep;

  return { width: horizontalOffset * amount - offsetStep, offset: horizontalOffset };
};

interface CreateNodeProps {
  prevNode: string;
  tailNode: string;
  positionX: number;
  step: number;
}
const onSingleNode = (nodeSign: string, data: any[], options: CreateNodeProps) => {
  const { prevNode, tailNode, positionX, step } = options;
  const nodeinfo = _.find(data, ["id", nodeSign]);

  const nodeId = uuid();
  const nextNode = _.filter(nodeinfo?.after || [], (node) => node !== tailNode);

  // const { width } = onCalculationNodeWidth(nextNode.length);
  // const nextPositionX = nextNode.length === 1 ? positionX : 64 - width / 2;
  const nextPositionX = positionX;

  return {
    node: { id: nodeId, type: "custom", position: { x: positionX, y: step }, data: nodeinfo },
    edge: { id: uuid(), source: prevNode, target: nodeId, type: "step", markerEnd: MarkerType.ArrowClosed },
    nextNode,
    nextPositionX,
    step: step + 140 + 90,
    connect: nextNode.length ? "" : nodeId
  };
};
interface AnyProps {
  [key: string]: any;
}
const onMultipleNode = (nodeSign: Array<string>, data: AnyProps[], nodes: Node[], options: AnyProps = {}) => {
  const { isChild = false, step = 0 } = options;
  const _nodes: Node[] = [];
  const offset = 100;

  if (!isChild) {
    /* 不连接某个子节点 */
    const isMiddle = !!(nodeSign.length % 2);

    if (isMiddle) {
      /* 奇数 */
      const odd = onOddNumberHandle(nodeSign, data, { step, offset });

      const oddOffsetFrequency = odd.length - 2;
      const sort = _.sortBy(odd, ["position.x"]);
      let next: Array<string> | Array<string[]> = [];

      for (let i = 0; i <= oddOffsetFrequency; i++) {
        const currentNode = sort[i].data.after;
        const nextNode = sort[i + 1].data.after;

        const difference = _.difference(currentNode, nextNode);

        if (difference.length) {
          next.push(currentNode);
        }

        if (i + 1 === oddOffsetFrequency) next.push(nextNode);
      }

      if (next.length === 1) {
        next = _.flatten(next);
      }
      console.log(next);

      _nodes.push(...odd);
    } else {
      /* 偶数 */
      const even = onEvenNumberHandle(nodeSign, data, { step, offset });
      _nodes.push(...even);
    }
    console.log(isMiddle);
  } else {
  }

  return { nodes: _nodes };
};

const onOddNumberHandle = (nodeSign: Array<string>, data: AnyProps[], options: AnyProps) => {
  const { step, offset } = options;

  const nodes: Node[] = [];
  const middleIndex = parseInt((nodeSign.length / 2).toString());

  const nodeId = uuid();
  const nodeinfo = _.find(data, ["id", nodeSign[middleIndex]]);
  nodes.push({ id: nodeId, type: "custom", data: nodeinfo, position: { x: -(250 / 2), y: step } });

  for (let i = middleIndex - 1; i >= 0; i--) {
    const nodeId = uuid();
    const nodeinfo = _.find(data, ["id", nodeSign[i]]);

    nodes.push({ id: nodeId, type: "custom", data: nodeinfo, position: { x: -(250 / 2) - 250 * (i + 1) - offset * (i + 1), y: step } });
  }

  for (let i = middleIndex + 1; i <= nodeSign.length - 1; i++) {
    const index = i - (middleIndex + 1);
    const nodeId = uuid();
    const nodeinfo = _.find(data, ["id", nodeSign[i]]);

    nodes.push({ id: nodeId, type: "custom", data: nodeinfo, position: { x: 250 / 2 + 250 * index + offset * (index + 1), y: step } });
  }

  return nodes;
};

const onEvenNumberHandle = (nodeSign: Array<string>, data: AnyProps[], options: AnyProps) => {
  const { step, offset } = options;

  const nodes: Node[] = [];
  const middleIndex = parseInt((nodeSign.length / 2).toString());

  for (let i = 0; i < middleIndex; i++) {
    const nodeId = uuid();
    const nodeinfo = _.find(data, ["id", nodeSign[i]]);

    nodes.push({ id: nodeId, type: "custom", data: nodeinfo, position: { x: -(250 / 2) - 125 - 50 + (-250 * i - offset * i), y: step } });
  }

  for (let i = middleIndex; i <= nodeSign.length - 1; i++) {
    const index = i - middleIndex;
    const nodeId = uuid();
    const nodeinfo = _.find(data, ["id", nodeSign[i]]);

    nodes.push({ id: nodeId, type: "custom", data: nodeinfo, position: { x: -(250 / 2) + 125 + 50 + (250 * index + offset * index), y: step } });
  }

  return nodes;
};

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
        <CustomNode :data="props.data" />
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
