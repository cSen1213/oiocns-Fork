import React, { useEffect, useState } from 'react';
import orgCtrl from '@/ts/controller';
import { model, schema } from '@/ts/base';
import { InstanceDataModel } from '@/ts/base/model';
import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import WorkFormViewer from '@/components/DataStandard/WorkForm/Viewer';
import { Table } from 'antd';
import dayjs from 'dayjs';
import { filterKeys } from '@/utils/index';

interface taskViewType {
  instance: any; // 表单数据
  title: string;
  fields: model.FieldModel[];
  processData: any; // 流程数据
}
const TaskView: React.FC<taskViewType> = ({ title, instance, fields, processData }) => {
  const [data, setData] = useState<InstanceDataModel>();
  const belong =
    orgCtrl.user.companys.find((a) => a.id == instance[0]?.belongId) || orgCtrl.user;

  /** 流程信息表头 */
  const columns = [
    {
      title: '单位名称',
      dataIndex: 'belongId',
      render: (text: string) => <EntityIcon entityId={text} showName />,
    },
    {
      title: '审批人',
      dataIndex: '535503820453724161',
    },
    {
      title: '节点',
      dataIndex: '535504245550628865',
      ellipsis: true,
    },
    {
      title: '审批时间',
      dataIndex: '535504130475704321',
      render: (text: string) => {
        return <div>{dayjs(text).format('YYYY-MM-DD HH:mm:ss')}</div>;
      },
    },
    {
      title: '业务类型',
      dataIndex: '535542249707159553',
    },
    {
      title: '备注信息',
      width: 300,
      dataIndex: '535504663986978817',
      ellipsis: true,
    },
  ];

  useEffect(() => {
    if (instance.length > 0 && fields.length > 0) {
      const findThing = instance[0];
      const [enObj] = filterKeys(findThing);
      /* 去除办事数据 */
      delete enObj.archives;
      const newData: any = {};
      fields.forEach((c: any) => {
        if (findThing['T' + c.id]) {
          newData[c.id] = findThing['T' + c.id];
        } else {
          if (findThing[c.code]) {
            newData[c.id] = findThing[c.code];
          }
        }
      });
      setData({ ...enObj, ...newData });
    } else {
      setData([] as any);
    }
  }, [instance, fields]);

  if (!data) {
    return <></>;
  }

  return (
    <>
      <WorkFormViewer
        form={{ id: '1', name: title } as schema.XForm}
        fields={fields}
        data={data}
        changedFields={[]}
        rules={[]}
        belong={belong}
        readonly
      />
      <Table
        title={() => <strong>流程明细</strong>}
        columns={columns}
        size="small"
        dataSource={processData || []}
      />
    </>
  );
};

export default TaskView;
