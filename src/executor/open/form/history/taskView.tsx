import React, { useEffect, useState } from 'react';
import orgCtrl from '@/ts/controller';
import { schema } from '@/ts/base';
import { InstanceDataModel } from '@/ts/base/model';
import WorkFormViewer from '@/components/DataStandard/WorkForm/Viewer';
import { List } from 'antd';
import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
interface taskViewType {
  instance: any;
  title: string;
  formId: string; //待查看的表单id
}
const TaskView: React.FC<taskViewType> = ({ title, instance, formId }) => {
  console.log('打印taskView', instance, formId);
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

        console.log(detail.tasks, JSON.parse(detail.data || '{}').data[formId]);
      }
    }, 10);
  }, []);

  if (!data) {
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
    instance.records?.map((record: any) => {
      return {
        title: record.title,
        belongId: instance.belongId,
        createTime: record.createTime,
        createUser: record.createUser,
        comment: record.comment ?? '同意',
      };
    }),
  ].filter(Boolean);
  console.log('流程信息', instanceList);
  return (
    <>
      {data && data.fields[formId] && (
        <>
          <WorkFormViewer
            form={{ id: '1', name: title } as schema.XForm}
            fields={data.fields[formId]}
            data={data.data[formId][0].after[0]}
            changedFields={[]}
            rules={[]}
            belong={belong}
            readonly
          />
          <List
            header={<div>{title}_流程信息</div>}
            // footer={<div>Footer</div>}
            bordered
            dataSource={instanceList}
            renderItem={(item, idx) => (
              <List.Item>
                <div style={{ display: 'flex' }} key={idx}>
                  <div style={{ paddingRight: '24px' }}>
                    单位：
                    <EntityIcon entityId={item.belongId} showName />
                  </div>
                  <div style={{ paddingRight: '24px' }}>{item.title}</div>
                  <div style={{ paddingRight: '24px' }}>创建时间 :{item.createTime}</div>
                  <div style={{ paddingRight: '24px' }}>
                    发起人：
                    <EntityIcon entityId={item.createUser} showName />
                  </div>
                  <div style={{ paddingRight: '24px' }}>
                    备注信息:
                    {item.comment}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </>
      )}
    </>
  );
};

export default TaskView;
