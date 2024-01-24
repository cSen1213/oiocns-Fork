export type formTypeConfig = {
  formTypeId: string; // 当前打开业务的表单id
  relevanceFormId: string[]; // 当前业务关联的表单的id
  fieldDirectoryId: string; // 当前业务的目录id
  detailFormNames: string[]; // 当前业务需要展示的子表
};

const formConfig: formTypeConfig[] = [
  {
    formTypeId: '535176821000519681', // 成果赋权列表
    relevanceFormId: [
      'F535176821864546305', // 上传附件（成果赋权）
      'F535176821646442497', // 权益分配确定
      'F535176821327675393', // 选择成果（成果赋权）
    ],
    fieldDirectoryId: '535176817938677761', // 成果赋权列表目录ID
    detailFormNames: ['选择成果（成果赋权）'],
  },
  {
    formTypeId: '535176818869813249', // 成果转化列表
    relevanceFormId: [
      'F535176820635615233', // 分配比例
      'F535176819637370881', // 定价/收益方式确定
      'F535176819897417729', //  意向受让方
      'F535176819322798081', // 选择成果（成果转化）
      'F535176820241350657', // 团队内部收益分配
      'F535176820459454465', // 上传附件（成果转化）
    ],
    fieldDirectoryId: '535176817745739777', // 成果转化列表目录ID
    detailFormNames: ['选择成果（成果转化）', '意向受让方', '分配比例'],
  },
  {
    formTypeId: '535176823366107137', // 收益分配列表
    relevanceFormId: [
      'F535176824074944513', // 股权分配
      'F535176823655514113', // 净收益分配
      'F535176823865229313', // 团队内部分配
    ],
    fieldDirectoryId: '535176818379079681', // 收益分配列表目录ID
    detailFormNames: ['净收益分配', '团队内部分配'],
  },
];

export { formConfig };
