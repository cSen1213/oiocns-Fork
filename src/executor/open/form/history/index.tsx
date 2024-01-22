import { Card, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import orgCtrl from '@/ts/controller';
import { ImUndo2 } from 'react-icons/im';
import { IForm } from '@/ts/core';
import { model, schema } from '@/ts/base';
import WorkFormViewer from '@/components/DataStandard/WorkForm/Viewer';
import ThingArchive from '../detail/archive';
import TaskView from './taskView';
import HistoryView from './historyView';
import { kernel } from '@/ts/base';
import BaseForm from './baseForm';
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
  const [curentInstance, setCurentInstance] = useState<any[]>([]); // 迁移数据实例
  const [fields, setFields] = useState<model.FieldModel[]>([]); // 表单字段
  const [conversionMasterId, setConversionMasterId] = useState<string>(''); // 转化信息 MasterId

  const hasDoneTasks = Object.values(props.thingData.archives);
  const isTransferHistory = hasDoneTasks.length === 0; // 是否为成果迁移历史数据

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

  /** 根据 RECID 获取主表ID */
  const getMasterId = async (masterOptions: any, filterOptions: string[]) => {
    const masterIdRes = await kernel.loadMasterId(props.form.belongId, masterOptions);
    if (masterIdRes.code === 200 && masterIdRes.data.length > 0) {
      // 如果为转化信息表 那么收集这个MasterId
      if (masterOptions.match.name === '选择成果（成果转化）') {
        setConversionMasterId(masterIdRes.data[0].MASTERID);
      }
      loadMasterInstance(masterIdRes.data[0].MASTERID, filterOptions);
    } else {
      setCurentInstance([]);
    }
  };

  /** 加载流程数据 */
  const loadMasterInstance = async (masterid: string, filterOptions: string[]) => {
    const instanceRes = await kernel.loadMasterInstance(
      props.form.belongId,
      masterid,
      filterOptions,
    );
    if (instanceRes.code === 200 && instanceRes.data.length > 0) {
      setCurentInstance(instanceRes.data);
    } else {
      setCurentInstance([]);
    }
  };

  /**
   *  加载表单字段
   * directoryId: 目录ID
   * filterFormInfo: 表字段的过滤条件
   * */
  const loadFields = async (directoryId: string, filterFormInfo: string) => {
    const allDriectorys = await orgCtrl.loadAxwDirectorys();
    const curentDirectory = allDriectorys.find((a) => a.id === directoryId);
    if (curentDirectory) {
      if (await curentDirectory.loadContent(true)) {
        const curentData = curentDirectory.content();
        const fieldsData: IForm = curentData.find(
          (a) => a.name === filterFormInfo,
        ) as IForm;
        if (fieldsData) {
          setFields(await fieldsData.loadFields());
        }
      }
    }
  };

  /** 如果为历史迁移数据，初始化时加载必要数据 */
  useEffect(() => {
    if (isTransferHistory) {
      getMasterId(
        {
          match: {
            name: '选择成果（成果转化）',
            ZLID: props.thingData.RECID,
          },
        },
        ['转化信息'],
      );
    }
  }, [isTransferHistory]);

  /** tabs页切换事件 */
  const onTabsChange = (key: string) => {
    if (hasDoneTasks.length === 0) {
      setCurentInstance([]);
      setFields([]);
      // RECID 职务成果ID
      switch (key) {
        case '2':
          getMasterId(
            {
              match: {
                name: '选择成果（成果转化）',
                ZLID: props.thingData.RECID,
              },
            },
            ['转化信息'],
          );
          loadFields('535176817745739777', '转化信息');
          break;
        case '3':
          getMasterId(
            {
              match: {
                name: '转化合同登记',
                CGZHRECID: conversionMasterId,
              },
            },
            ['转化合同登记'],
          );
          loadFields('535176818005786625', '转化合同登记');
          break;
        case '4':
          getMasterId(
            {
              match: {
                name: '收益分配登记',
                CGZHRECID: conversionMasterId,
              },
            },
            ['收益分配登记'],
          );
          loadFields('535176818379079681', '收益分配登记');
          break;
        case '5':
          getMasterId(
            {
              match: {
                name: '选择成果（成果赋权）', // 从哪张表里查找MasterId
                ZLID: props.thingData.RECID, // 通过职务成果ID查找专利ID
              },
            },
            ['选择成果（成果赋权）'], // 被查找的数据所在的表
          );
          loadFields('535176817938677761', '选择成果（成果赋权）'); // 被查找的数据的表的所在目录 和这个表的名称
          break;
        default:
          break;
      }
    }
  };

  return (
    <Card>
      <Tabs
        onChange={onTabsChange}
        items={[
          {
            key: '1',
            label: `基本信息`,
            children: isTransferHistory ? (
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
            ) : (
              <BaseForm instances={Object.values(props.thingData.archives)} />
            ),
          },
          {
            key: '2',
            label: `转化信息`,
            children: (
              <>
                {isTransferHistory ? (
                  <HistoryView
                    title="转化信息"
                    fields={fields}
                    instance={curentInstance}
                  />
                ) : (
                  <TaskView
                    title="转化信息"
                    instance={hasDoneTasks.find(
                      (taskItem) => taskItem.defineId === '535193248780660736',
                    )}
                    formId="535176818869813249"
                  />
                )}
              </>
            ),
          },
          {
            key: '3',
            label: `合同信息`,
            children: (
              <>
                {isTransferHistory ? (
                  <HistoryView
                    title="合同信息"
                    fields={fields}
                    instance={curentInstance}
                  />
                ) : (
                  <TaskView
                    title="合同信息"
                    instance={hasDoneTasks.find(
                      (taskItem) => taskItem.defineId === '535193248780660736',
                    )}
                    formId="535176818869813249"
                  />
                )}
              </>
            ),
          },
          {
            key: '4',
            label: `收益分配信息`,
            children: (
              <>
                {isTransferHistory ? (
                  <HistoryView
                    title="收益分配信息"
                    fields={fields}
                    instance={curentInstance}
                  />
                ) : (
                  <TaskView
                    title="收益分配信息"
                    instance={hasDoneTasks.find(
                      (taskItem) => taskItem.defineId === '535193248780660736',
                    )}
                    formId="535176818869813249"
                  />
                )}
              </>
            ),
          },
          {
            key: '5',
            label: `赋权信息`,
            children: (
              <>
                {isTransferHistory ? (
                  <HistoryView
                    title="赋权信息"
                    fields={fields}
                    instance={curentInstance}
                  />
                ) : (
                  <TaskView
                    title="赋权信息"
                    instance={hasDoneTasks.find(
                      (taskItem) => taskItem.defineId === '535193499293855744',
                    )}
                    formId="535176821000519681"
                  />
                )}
              </>
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
