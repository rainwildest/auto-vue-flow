import { UUID } from "./utils";

const uuid = UUID();

export default [
  { id: "00000000-0000-0000-0000-000000000001", name: "开始节点", before: [], after: ["00000000-0000-0000-0000-000000000003"] },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "节点1",
    data: { name: "节点1" },
    before: ["00000000-0000-0000-0000-000000000001"],
    after: ["00000000-0000-0000-0000-000000000004"]
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "节点2",
    data: { name: "节点2" },
    before: ["00000000-0000-0000-0000-000000000003"],
    after: ["00000000-0000-0000-0000-000000000002"]
  },
  { id: "00000000-0000-0000-0000-000000000002", name: "结束节点", before: ["00000000-0000-0000-0000-000000000004"], after: [] }
];

// [
//   {
//       "id": "01H40VHXPMTE6YG0GFN8N67TY6",
//       "guid": "9984ac4069ff43c8a2e5c0a9e43b2065",
//       "company_id": 1,
//       "template_id": 27,
//       "name": "开始节点",
//       "before_node_id": [],
//       "after_node_id": ["01H4F6B8HN3NGTYMZ3SDEF4R6K", "01H4F6MJ00233MNR9WREQVFRKF"]
//   },
//   {
//       "id": "01H42AE4QDKHSTJMKHMMP741PT",
//       "guid": "9985d14362ae4fbd94d7c280f2257f65",
//       "company_id": 1,
//       "template_id": 27,
//       "name": "结束节点",
//       "before_node_id": ["01H4F6GAZZYD5W6BJVE2AHY8ZF"],
//       "after_node_id": []
//   },
//   {
//       "id": "01H4F6B8HN3NGTYMZ3SDEF4R6K",
//       "guid": "998fdfb35ab54004839bf0056dd255a9",
//       "company_id": 1,
//       "template_id": 27,
//       "name": "老覃头-01",
//       "before_node_id": ["01H40VHXPMTE6YG0GFN8N67TY6"],
//       "after_node_id": ["01H4F6GAZZYD5W6BJVE2AHY8ZF"]
//   },
//   {
//       "id": "01H4F6MJ00233MNR9WREQVFRKF",
//       "guid": "998fe1841f154ad5921f845603a0cb24",
//       "company_id": 1,
//       "template_id": 27,
//       "name": "老覃头-03",
//       "before_node_id": ["01H40VHXPMTE6YG0GFN8N67TY6"],
//       "after_node_id": ["01H4F6GAZZYD5W6BJVE2AHY8ZF"]
//   },
//   {
//       "id": "01H4F6GAZZYD5W6BJVE2AHY8ZF",
//       "guid": "998fe0b12ee04695bb5dbcd7bf9b8012",
//       "company_id": 1,
//       "template_id": 27,
//       "name": "老覃头-02",
//       "before_node_id": ["01H4F6B8HN3NGTYMZ3SDEF4R6K",  "01H4F6MJ00233MNR9WREQVFRKF"],
//       "after_node_id": ["01H42AE4QDKHSTJMKHMMP741PT"]
//   }
// ]
