import React, { useEffect, useState } from 'react';
import orgCtrl from '@/ts/controller';
import { model, schema } from '@/ts/base';
import { InstanceDataModel } from '@/ts/base/model';
import WorkFormViewer from '@/components/DataStandard/WorkForm/Viewer';
import { List } from 'antd';
import { filterKeys } from '@/utils/index';

interface taskViewType {
  instance: any;
  title: string;
  fields: model.FieldModel[];
}
const TaskView: React.FC<taskViewType> = ({ title, instance, fields }) => {
  const [data, setData] = useState<InstanceDataModel>();
  const belong =
    orgCtrl.user.companys.find((a) => a.id == instance[0]?.belongId) || orgCtrl.user;

  useEffect(() => {
    if (instance.length > 0) {
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
    }
  }, [instance.length]);

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
      <List
        header={<div>{title}_流程信息</div>}
        bordered
        dataSource={['']}
        renderItem={(_item, idx) => (
          <List.Item>
            <div style={{ display: 'flex' }} key={idx}>
              <div style={{ paddingRight: '24px' }}>历史数据迁移，暂无流程信息</div>
            </div>
          </List.Item>
        )}
      />
    </>
  );
};

export default TaskView;
