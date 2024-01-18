import React, { useEffect, useState } from 'react';
import orgCtrl from '@/ts/controller';
import { schema } from '@/ts/base';
import { InstanceDataModel } from '@/ts/base/model';
import { Table } from 'antd';
import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import WorkForm from '@/executor/tools/workForm';
interface taskViewType {
  instance: any;
}
const TaskView: React.FC<taskViewType> = ({ instance }) => {
  console.log('打印workView', instance);
  const [task, setTask] = useState<schema.XWorkTask[]>();
  const [data, setData] = useState<InstanceDataModel>();
  const belong =
    orgCtrl.user.companys.find((a) => a.id == instance.belongId) || orgCtrl.user;

  useEffect(() => {
    setTimeout(async () => {
      const detail = await orgCtrl.work.loadInstanceDetail(
        instance.id,
        instance.belongId,
      );
      if (detail) {
        setTask(detail.tasks);
        setData(JSON.parse(detail.data || '{}'));
      }
    }, 10);
  }, []);

  if (!data || !task) {
    return <></>;
  }
  const instanceList = [
    {
      title: '开始',
      belongId: instance.belongId,
      createTime: instance.createTime,
      createUser: instance.createUser,
      comment: '提交',
    },
  ];
  task.forEach((tItem) => {
    if (!tItem.records) {
      return;
    }
    const instanceItems: any[] = tItem.records?.map((record: any) => {
      return {
        title: tItem.title,
        belongId: instance.belongId,
        createTime: record.createTime,
        createUser: record.createUser,
        comment: record.comment ?? '同意',
      };
    });
    instanceList.push(...instanceItems);
  });
  const columns = [
    {
      title: '单位名称',
      dataIndex: 'belongId',
      render: (text: string) => <EntityIcon entityId={text} showName />,
    },
    {
      title: '审批人',
      dataIndex: 'createUser',
      render: (text: string) => <EntityIcon entityId={text} showName />,
    },
    {
      title: '节点',
      dataIndex: 'title',
    },
    {
      title: '审批时间',
      dataIndex: 'createTime',
    },
    {
      title: '备注信息',
      width: 300,
      dataIndex: 'comment',
    },
  ];
  return (
    <>
      {data && (
        <>
          <WorkForm allowEdit={false} belong={belong} nodeId={data.node.id} data={data} />
          <Table
            title={() => <strong>流程明细</strong>}
            columns={columns}
            size="small"
            dataSource={instanceList}
          />
        </>
      )}
    </>
  );
};

export default TaskView;
