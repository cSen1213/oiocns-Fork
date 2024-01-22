import React, { useEffect, useState } from 'react';
import { schema } from '@/ts/base';
import orgCtrl from '@/ts/controller';
import { Card, Timeline } from 'antd';
import WorkForm from '@/executor/tools/workForm';
import { InstanceDataModel } from '@/ts/base/model';

interface IProps {
  instances: schema.XWorkInstance[];
}
/**
 * 存储-物-归档日志
 */
const ThingArchive: React.FC<IProps> = ({ instances }) => {
  console.log('instances', instances);

  return (
    <Card bordered={false}>
      <Timeline reverse>
        {instances
          .filter((s) => s.defineId === '535193119474462720')
          .map((a, index) => (
            <ArchiveItem key={`${a.id}_${index}`} instance={a}></ArchiveItem>
          ))}
      </Timeline>
    </Card>
  );
};

const ArchiveItem: React.FC<{ instance: schema.XWorkInstance }> = ({ instance }) => {
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

  if (task == undefined) return <></>;

  return (
    <Card>
      {data && data.node && (
        <WorkForm
          allowEdit={false}
          belong={belong}
          nodeId={data.node?.id}
          data={data}
          hidden
        />
      )}
    </Card>
  );
};
export default ThingArchive;
