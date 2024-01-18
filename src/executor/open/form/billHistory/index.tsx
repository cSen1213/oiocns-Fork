import { Card, message, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { ImUndo2 } from 'react-icons/im';
import { IForm } from '@/ts/core';
import { schema } from '@/ts/base';
import orgCtrl from '@/ts/controller';
import { InstanceDataModel } from '@/ts/base/model';
import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import WorkForm from '@/executor/tools/workForm';
interface IProps {
  form: IForm;
  thingData: schema.XThing;
  onBack: () => void;
}
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
/**
 * 物-查看
 * @returns
 */
const WorkFormView: React.FC<IProps> = (props) => {
  const hasDoneTasks = Object.values(props.thingData.archives);
  if (!hasDoneTasks || hasDoneTasks.length == 0) {
    message.warning('暂无数据');
    return <></>;
  }
  const instance = hasDoneTasks[0];
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
    }, 0);
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
  return (
    <Card
      title="办事明细"
      extra={
        <div
          style={{ display: 'flex', cursor: 'pointer' }}
          onClick={() => {
            props.onBack();
          }}>
          <a style={{ paddingTop: '2px' }}>
            <ImUndo2 />
          </a>
          <a style={{ paddingLeft: '6px' }}>返回</a>
        </div>
      }>
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
    </Card>
  );
};

export default WorkFormView;
