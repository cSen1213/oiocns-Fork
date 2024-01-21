import { Card, message, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { ImUndo2 } from 'react-icons/im';
import { IForm } from '@/ts/core';
import { schema, kernel } from '@/ts/base';
import orgCtrl from '@/ts/controller';
import { InstanceDataModel } from '@/ts/base/model';
import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import WorkForm from '@/executor/tools/workForm';
import WorkHistoryForm from './workHistoryForm';
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
  console.log('物-查看111eeee', props);
  const hasDoneTasks = Object.values(props.thingData.archives);
  const isTransferHistory = !hasDoneTasks || hasDoneTasks.length == 0; // 标记是否为历史迁移数据
  const [curentInstance, setCurentInstance] = useState<any[]>([]); // 迁移数据实例
  const instance = hasDoneTasks[0];
  const [task, setTask] = useState<schema.XWorkTask[]>();
  const [data, setData] = useState<InstanceDataModel>();
  const belong =
    orgCtrl.user.companys.find((a) => a.id == instance?.belongId) || orgCtrl.user;

  useEffect(() => {
    if (!isTransferHistory) {
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
    }
  }, []);

  useEffect(() => {
    if (isTransferHistory) {
      loadMasterInstance(props.thingData.MASTERID, [
        '上传附件（成果赋权）',
        '权益分配确定',
        '选择成果（成果赋权）',
      ]);
    }
  }, [isTransferHistory]);

  /** 加载流程数据 */
  const loadMasterInstance = async (masterid: string, filterOptions: string[]) => {
    const instanceRes = await kernel.loadMasterInstance(
      props.form.belongId,
      masterid,
      filterOptions,
    );
    if (instanceRes.code === 200 && instanceRes.data.length > 0) {
      setCurentInstance([props.thingData, ...instanceRes.data]);
    } else {
      setCurentInstance([]);
    }
  };

  /** 渲染表单 */
  const renderWorkForm = () => {
    if (!data || !task) {
      return <></>;
    }
    const instanceList = [
      {
        title: '开始',
        belongId: instance?.belongId,
        createTime: instance?.createTime,
        createUser: instance?.createUser,
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
          belongId: instance?.belongId,
          createTime: record.createTime,
          createUser: record.createUser,
          comment: record.comment ?? '同意',
        };
      });
      instanceList.push(...instanceItems);
    });
    return (
      <>
        {data && (
          <>
            <WorkForm
              allowEdit={false}
              belong={belong}
              nodeId={data.node.id}
              data={data}
            />
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

  /** 渲染历史数据迁移表单 */
  const renderWorkHistoryForm = () => {
    if (!curentInstance) {
      return <></>;
    }
    const historyBelong =
      orgCtrl.user.companys.find((a) => a.id == props.thingData.belongId) || orgCtrl.user;
    return (
      <>
        {curentInstance.length > 0 && (
          <WorkHistoryForm
            allowEdit={false}
            belong={historyBelong}
            data={curentInstance}
          />
        )}
      </>
    );
  };

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
      {isTransferHistory ? <>{renderWorkHistoryForm()}</> : <>{renderWorkForm()}</>}
    </Card>
  );
};

export default WorkFormView;
