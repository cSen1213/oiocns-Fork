import { Card } from 'antd';
import React from 'react';
import { ImUndo2 } from 'react-icons/im';
import { IForm } from '@/ts/core';
import { schema } from '@/ts/base';
import WorkView from './workView';
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
      <WorkView instance={hasDoneTasks[0]} />
      {/* <Tabs
        items={[
          {
            key: '1',
            label: `办事明细`,
            children: <WorkView instance={hasDoneTasks[0]} />,
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
      /> */}
    </Card>
  );
};

export default ThingView;
