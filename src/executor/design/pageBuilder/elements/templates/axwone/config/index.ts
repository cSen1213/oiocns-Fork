/**
 * title // 分组标题
 * directoryID // 目录ID
 * content // 分组内容
 * id // 分组内容的id
 * name // 分组内容的名称
 */

const AXWPORTALID = [
  {
    title: '成果管理',
    id: '1',
    content: [
      {
        id: '505330878763900929',
        name: '成果库',
        directoryID: '505330878596128769',
      },
      {
        id: '507473484641869825',
        name: '成果录入',
        directoryID: '505330878478688257',
        applicationID: '507305816613855233',
        applicationname: '安心屋',
      },
      {
        id: '507472559793643521',
        name: '成果普查',
        directoryID: '505330878478688257',
        applicationID: '507305816613855233',
        applicationname: '安心屋',
      },
      {
        id: '507470117328789504',
        name: '成果转化申请',
        directoryID: '505330878478688257',
        applicationID: '507305816613855233',
        applicationname: '安心屋',
      },
      {
        id: '505330904395292673',
        name: '成果转化申请列表',
        directoryID: '505330878801649665',
      },
      {
        id: '507469372600754176',
        name: '成果赋权',
        directoryID: '505330878478688257',
        applicationID: '507305816613855233',
        applicationname: '安心屋',
      },
      {
        id: '505330905242542081',
        name: '成果赋权列表',
        directoryID: '505330878885535745',
      },
    ],
  },
  {
    title: '合同收益管理',
    id: '2',
    content: [
      {
        directoryID: '505330878478688257',
        id: '507471900797181952',
        name: '转化合同审核',
        applicationID: '507305816613855233',
        applicationname: '安心屋',
      },
      {
        directoryID: '505330878478688257',
        id: '507471013936766977',
        name: '技术合同登记及增值税减免办理',
        applicationID: '507305816613855233',
        applicationname: '安心屋',
      },
      {
        directoryID: '505330878478688257',
        id: '507468067060719616',
        name: '收益分配登记',
        applicationID: '507305816613855233',
        applicationname: '安心屋',
      },
      {
        directoryID: '505330878965227521',
        id: '505330905959768065',
        name: '收益分配登记列表',
      },
    ],
  },
  {
    title: '赋权管理',
    id: '3',
    content: [
      {
        directoryID: '505330879007170561',
        id: '505330906391781377',
        name: '赋权试点申报列表',
      },
    ],
  },
  {
    title: '成果作价股权管理',
    id: '4',
    content: [
      {
        directoryID: '521817427370188801',
        id: '521818034789294081',
        name: '股权登记',
      },
      {
        directoryID: '521817427370188801',
        id: '521817814915489793',
        name: '股权列表',
      },
    ],
  },
  // {
  //   title: '配置',
  //   id: '5',
  //   content: [
  //     {
  //       directoryID: '505330878596128769',
  //       id: '505421539764740097',
  //       name: '常用附件下载',
  //     },
  //   ],
  // },
  {
    title: '下载',
    id: '6',
    content: [
      {
        directoryID: '505330878596128769',
        id: '505421539764740097',
        name: '常用附件下载',
      },
    ],
  },
];

export type AXWType = {
  title: string;
  content: {
    id: string;
    name: string;
    directoryID: string;
    applicationID?: string;
    applicationname?: string;
  }[];
};

export { AXWPORTALID };
