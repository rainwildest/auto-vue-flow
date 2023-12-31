<script setup lang="ts">
import type { Node, Edge } from "@vue-flow/core";

import { ref, onMounted } from "vue";
import { Background } from "@vue-flow/background";
import { MarkerType, VueFlow, useVueFlow } from "@vue-flow/core";

import _ from "lodash";
import CustomOriginal from "./components/CustomOriginal.vue";
import CustomNode from "./components/CustomNode.vue";
import CustomGroup from "./components/CustomGroup.vue";

import data from "./data";
import { UUID } from "./utils";
import { useLayout } from "./useLayout";

const uuid = UUID(1);
useLayout();
interface NodePointerProps {
  prevNode: string[] | string;
  nextNode: Array<string>;
  nextPositionX: number;
  step: number;
  isChild?: boolean;
}
const { onPaneReady, addEdges, addNodes } = useVueFlow({
  nodes: []
});

onMounted(() => {
  const nodes: Node[] = [
    { id: "1", position: { x: 0, y: 0 }, label: "1", type: "custom-original", data: { before: [], after: ["2"] } },

    { id: "3", position: { x: 0, y: 0 }, label: "3", type: "custom", data: { name: "3" } },
    { id: "4", position: { x: 0, y: 0 }, label: "3", type: "custom", data: { name: "4" } },

    { id: "oo", position: { x: 0, y: 0 }, label: "3", type: "custom", data: { name: "oo" } },
    { id: "6", position: { x: 0, y: 0 }, label: "3", type: "custom", data: { name: "6" } },
    { id: "7", position: { x: 0, y: 0 }, label: "3", type: "custom", data: { name: "7" } },

    { id: "2", position: { x: 0, y: 0 }, label: "2", type: "custom-original", data: { after: [], before: ["1"] } }
  ];

  const edges: Edge[] = [
    { id: uuid(), source: "1", target: "3", type: "step" },
    { id: uuid(), source: "1", target: "4", type: "step" },

    { id: uuid(), source: "3", target: "oo", type: "step" },
    { id: uuid(), source: "3", target: "7", type: "step" },
    { id: uuid(), source: "3", target: "6", type: "step" },

    { id: uuid(), source: "7", target: "2", type: "step" },
    { id: uuid(), source: "6", target: "2", type: "step" },
    { id: uuid(), source: "oo", target: "2", type: "step" },
    { id: uuid(), source: "4", target: "2", type: "step" }
  ];

  addNodes([...nodes]);
  addEdges([...edges]);
});
const onDataResolve = () => {
  console.log(_.difference([1, 2], [2, 1, 4]));
  const _data = _.cloneDeep(data);

  const edges: Edge[] = [];
  const nodes: Node[] = [];
  /* 找到开始部分 */
  const start = _.find(_data, (item) => !item.before.length);
  /* 找到结束部分 */
  const end = _.find(_data, (item) => !item.after.length);

  if (!start || !end) return { nodes, edges };

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
      const multiple = onMultipleNode(nextNode, _data, nodes, { step, prevNode: nodePointer.prevNode });

      step = multiple.step;
      nodes.push(...multiple.nodes);
      edges.push(...multiple.edges);
      console.log(multiple);
      if (multiple.next.length === 1) {
        console.log(_.map(multiple.nodes, "id"));
        nodePointer = {
          ...nodePointer,
          prevNode: _.map(multiple.nodes, "id") as string[],
          nextNode: multiple.next as string[],
          step: multiple.step,
          nextPositionX: multiple.nextPositionX || 0
        };
      }
    } else {
      const single = onSingleNode(nextNode[0], data, {
        prevNode: nodePointer.prevNode,
        tailNode: end?.id || "",
        positionX: nodePointer.nextPositionX,
        step: nodePointer.step
      });
      nodes.push(single.node);
      edges.push(...single.edges);
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
  } while (i < 4);

  // let nodePointers: Array<NodePointerProps> = [];

  // console.log(start)
  // console.log(end)

  return { nodes, edges };
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
  prevNode: string[] | string;
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
  const edges: Edge[] = (typeof prevNode === "string" ? [prevNode] : prevNode).map((key) => ({
    id: uuid(),
    source: key,
    target: nodeId,
    type: "step",
    markerEnd: MarkerType.ArrowClosed
  }));

  return {
    node: { id: nodeId, type: "custom", position: { x: positionX, y: step }, data: nodeinfo },
    edges,
    nextNode,
    nextPositionX,
    step: step + 140 + 90,
    connect: nextNode.length ? "" : nodeId
  };
};
interface AnyProps {
  [key: string]: any;
}

interface NextInfo {
  next: Array<string> | Array<string[]>;
  isChild: boolean;
  isMix: boolean;
  isSingle?: boolean;
  nextPositionX?: number;
}
const onMultipleNode = (nodeSign: Array<string>, data: AnyProps[], nodes: Node[], options: AnyProps = {}) => {
  const { isChild = false, step = 0, prevNode } = options;

  const _nodes: Node[] = [];
  const offset = 100;
  let info: NextInfo = { next: [] as Array<string> | Array<string[]>, isChild: false, isMix: false };

  if (!isChild) {
    /* 不连接某个子节点 */
    const isMiddle = !!(nodeSign.length % 2);

    if (isMiddle) {
      /* 奇数 */
      const odd = onOddNumberHandle(nodeSign, data, { step, offset });
      _nodes.push(...odd);

      info = onGetNextInfo(odd);
    } else {
      /* 偶数 */
      const even = onEvenNumberHandle(nodeSign, data, { step, offset });
      _nodes.push(...even);
    }
  } else {
  }

  const ids = _.map(_nodes, "id");
  let edges = (typeof prevNode === "string" ? [prevNode] : prevNode).map((key: string) => {
    return ids.map((id) => ({ id: uuid(), source: key, target: id, type: "step", markerEnd: MarkerType.ArrowClosed }));
  });
  edges = _.flatten(edges);

  return { nodes: _nodes, step: step + 140 + 90, ...info, edges };
};

/**
 * @brief 奇数处理逻辑
 * @param {Array<string>} nodeSign
 * @param {AnyProps[]} data
 * @param {AnyProps} options
 */
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

/**
 * @brief 偶数处理逻辑
 * @param {Array<string>} nodeSign
 * @param {AnyProps[]} data
 * @param {AnyProps} options
 */
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

/**
 * @brief 处理多节点下一节点信息
 * @param {Array<Node>} data
 */
const onGetNextInfo = (data: Array<Node>) => {
  const oddOffsetFrequency = data.length - 2;
  const sort = _.sortBy(data, ["position.x"]);
  let info: NextInfo = { next: [], isChild: true, isMix: true };

  for (let i = 0; i <= oddOffsetFrequency; i++) {
    const currentNode = sort[i].data.after;
    const nextNode = sort[i + 1].data.after;

    const difference = _.difference(currentNode, nextNode);

    if (difference.length) {
      info.next.push(currentNode);
    }

    if (i + 1 === oddOffsetFrequency) info.next.push(nextNode);
  }

  if (info.next.length === 1) {
    const next = _.flatten(info.next);
    info = { ...info, next, isChild: false, isMix: false };

    next.length === 1 && (info = { ...info, nextPositionX: -(250 / 2), isSingle: true });
  }

  return { ...info };
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
// const { nodes, edges } = onDataResolve();
// const elements = ref<any[]>([...nodes, ...edges]);

onPaneReady(({ fitView }) => {
  fitView();
});
</script>

<template>
  <div class="h-screen w-screen overflow-hidden bg-gray-50">
    <VueFlow :default-viewport="{ zoom: 1.5 }" :min-zoom="0.2" :max-zoom="2" class="h-full w-full">
      <template #node-custom-original="props">
        <CustomOriginal :data="props.data" />
      </template>

      <template #node-custom="props">
        <CustomNode :data="props.data" />
      </template>

      <template #node-custom-group="props">
        <CustomGroup :data="props.data" />
      </template>

      <Background class="h-full w-full" />
    </VueFlow>
  </div>
</template>

<style lang="scss"></style>

<style lang="scss">
@import "@vue-flow/core/dist/style.css";
</style>
