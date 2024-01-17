import { Card, Tabs } from 'antd';
import React from 'react';
import { ImUndo2 } from 'react-icons/im';
import { IForm } from '@/ts/core';
import { schema } from '@/ts/base';
import WorkFormViewer from '@/components/DataStandard/WorkForm/Viewer';
import ThingArchive from '../detail/archive';
import TaskView from './taskView';
interface IProps {
  form: IForm;
  thingData: schema.XThing;
  onBack: () => void;
}

/**
 * 物-查看
 * @returns
 */
const ThingView: React.FC<IProps> = (props) => {
  const hasDoneTasks = Object.values(props.thingData.archives);

  const convertData = () => {
    let data: any = {};
    for (let [key, value] of Object.entries(props.thingData)) {
      const field = props.form.fields.find((a) => a.code == key);
      if (field) {
        data[field.id] = value;
      }
    }
    return data;
  };
  return (
    <Card>
      <Tabs
        items={[
          {
            key: '1',
            label: `基本信息`,
            children: (
              <WorkFormViewer
                readonly
                rules={[]}
                changedFields={[]}
                key={props.form.id}
                form={props.form.metadata}
                fields={props.form.fields}
                data={convertData()}
                belong={props.form.directory.target.space}
              />
            ),
          },
          {
            key: '2',
            label: `转化信息`,
            children: (
              <TaskView
                title="转化信息"
                instance={hasDoneTasks.find(
                  (taskItem) => taskItem.defineId === '535193248780660736',
                )}
                formId="535176818869813249"
              />
            ),
          },
          {
            key: '3',
            label: `合同信息`,
            children: (
              <TaskView
                title="合同信息"
                instance={hasDoneTasks.find(
                  (taskItem) => taskItem.defineId === '535193248780660736',
                )}
                formId="535176818869813249"
              />
            ),
          },
          {
            key: '4',
            label: `收益分配信息`,
            children: (
              <TaskView
                title="收益分配信息"
                instance={hasDoneTasks.find(
                  (taskItem) => taskItem.defineId === '535193248780660736',
                )}
                formId="535176818869813249"
              />
            ),
          },
          {
            key: '5',
            label: `赋权信息`,
            children: (
              <TaskView
                title="赋权信息"
                instance={hasDoneTasks.find(
                  (taskItem) => taskItem.defineId === '535193248780660736',
                )}
                formId="535176818869813249"
              />
            ),
          },
          {
            key: '6',
            label: `流程信息`,
            children: <ThingArchive instances={hasDoneTasks} />,
          },
        ]}
        tabBarExtraContent={
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
        }
      />
    </Card>
  );
};

export default ThingView;
