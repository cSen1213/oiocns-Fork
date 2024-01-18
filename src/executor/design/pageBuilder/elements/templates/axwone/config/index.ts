/**
 * title // 分组标题
 * directoryID // 目录ID
 * directoryName // 目录名称
 * content // 分组内容
 * id // 分组内容的id
 * name // 分组内容的名称
 * applicationID // 应用ID
 * applicationname // 应用名称
 * aliasName // 展示别名
 */

const AXWPORTALID: AXWType[] = [
  {
    title: '成果管理',
    id: '1',
    content: [
      {
        directoryID: '535176817745739777',
        directoryName: '成果转化',
        id: '535176818869813249',
        name: '转化信息',
      },
      {
        directoryID: '535176817611522049',
        directoryName: '职务成果',
        id: '535176818458771457',
        name: '职务成果',
      },
      {
        directoryID: '535176817938677761',
        directoryName: '成果赋权',
        id: '535176821000519681',
        name: '赋权信息',
      },
      {
        applicationID: '535191615250251777',
        applicationName: '安心屋2.0',
        id: '535193119474462720',
        name: '职务成果',
      },
      {
        applicationID: '535191615250251777',
        applicationName: '安心屋2.0',
        id: '535193248780660736',
        name: '成果转化',
      },
      {
        applicationID: '535191615250251777',
        applicationName: '安心屋2.0',
        id: '535193499293855744',
        name: '成果赋权',
      },
    ],
  },
  {
    title: '合同收益管理',
    id: '2',
    content: [
      {
        directoryID: '535176818005786625',
        directoryName: '转化合同',
        id: '535176822128787457',
        name: '转化合同登记',
      },
      {
        directoryID: '535176818089672705',
        directoryName: '技术合同及增值税减免',
        id: '535176822741155841',
        name: '合同登记及增值税减免',
      },
      {
        directoryID: '535176818379079681',
        directoryName: '收益分配',
        id: '535176823366107137',
        name: '收益分配登记',
      },
      {
        applicationID: '535191615250251777',
        applicationName: '安心屋2.0',
        id: '535193785076957184',
        name: '转化合同',
      },
      {
        applicationID: '535191615250251777',
        applicationName: '安心屋2.0',
        id: '535194025569959936',
        name: '技术合同及增值税减免',
      },
      {
        applicationID: '535191615250251777',
        applicationName: '安心屋2.0',
        id: '535194118540902400',
        name: '收益分配',
      },
    ],
  },
];

export type AXWType = {
  title: string;
  id: string;
  content: {
    id: string;
    name: string;
    directoryID?: string;
    directoryName?: string;
    applicationID?: string;
    applicationName?: string;
    aliasName?: string;
  }[];
};

export { AXWPORTALID };
