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
import { filterKeys } from '@/utils/index';
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
  const [currentProcess, setCurrentProcess] = useState<any[]>([]); // 迁移数据流程
  const [fields, setFields] = useState<model.FieldModel[]>([]); // 表单字段
  const [processFields, setProcessFields] = useState<model.FieldModel[]>([]); // 流程表单字段
  const [conversionMasterId, setConversionMasterId] = useState<string>(''); // 成果转化列表 MasterId
  const [dataSource, setDataSource] = useState<any[]>([]); // 迁移数据流程

  const hasDoneTasks = Object.values(props.thingData.archives);
  const isTransferHistory = hasDoneTasks.length === 0; // 是否为成果迁移历史数据

  const convertData = () => {
    let data: any = {};
    for (let [key, value] of Object.entries(props.thingData)) {
      const field = props.form.fields.find((a: any) => a.code == key);
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
      // 如果为成果转化列表 那么收集这个MasterId
      if (masterOptions.match.name === '选择成果（成果转化）') {
        setConversionMasterId(masterIdRes.data[0].MASTERID);
      }
      loadMasterInstance(masterIdRes.data[0].MASTERID, filterOptions);
    } else {
      setCurentInstance([]);
    }
  };

  /** 加载主子表数据 */
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

  /** 加载流程数据 */
  const loadProcessData = async (masterid: string, filterOptions: string[]) => {
    const instanceRes = await kernel.loadMasterInstance(
      props.form.belongId,
      masterid,
      filterOptions,
    );
    if (instanceRes.code === 200 && instanceRes.data.length > 0) {
      setCurrentProcess(instanceRes.data);
    } else {
      setCurrentProcess([]);
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
          (a: any) => a.name === filterFormInfo,
        ) as IForm;
        if (fieldsData) {
          if (filterFormInfo === '审批流程') {
            //  在这里可以查看审批流程的字段值
            setProcessFields(await fieldsData.loadFields());
          }
          setFields(await fieldsData.loadFields());
        }
      }
    }
  };

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
            ['F535176818869813249'], //成果转化列表
          );
          loadFields('535176817745739777', '成果转化列表');
          break;
        case '3':
          getMasterId(
            {
              match: {
                name: '转化合同列表',
                CGZHRECID: conversionMasterId,
              },
            },
            ['F535176822128787457'], // 转化合同列表
          );
          loadFields('535176818005786625', '转化合同列表');
          break;
        case '4':
          getMasterId(
            {
              match: {
                name: '收益分配列表',
                CGZHRECID: conversionMasterId,
              },
            },
            ['F535176823366107137'], // 收益分配列表
          );
          loadFields('535176818379079681', '收益分配列表');
          break;
        case '5':
          getMasterId(
            {
              match: {
                name: '选择成果（成果赋权）', // 从哪张表里查找MasterId
                ZLID: props.thingData.RECID, // 通过职务成果ID查找专利ID
              },
            },
            ['F535176821000519681'], //成果赋权列表 // 被查找的数据所在的表
          );
          loadFields('535176817938677761', '成果赋权列表'); // 被查找的数据的表的所在目录 和这个表的名称
          break;
        default:
          break;
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
            ZLID: props.thingData?.RECID,
          },
        },
        ['F535176818869813249'], //成果转化列表
      );
    }
    loadProcessData(props.thingData?.MASTERID, ['F535510967807787009']);
    loadFields('535510670867841025', '审批流程');
  }, [isTransferHistory]);

  /** 处理流程表格的数据 */
  useEffect(() => {
    if (currentProcess && currentProcess.length > 0) {
      const result = currentProcess.map((a: any) => {
        const [enObj] = filterKeys(a);
        /* 去除办事数据 */
        delete enObj.archives;
        const newData: any = {};
        processFields.forEach((c: model.FieldModel) => {
          if (a['T' + c.id]) {
            newData[c.id] = a['T' + c.id];
          } else {
            if (a[c.code]) {
              newData[c.id] = a[c.code];
            }
          }
        });
        return {
          ...enObj,
          ...newData,
        };
      });
      setDataSource(result);
    }
  }, [currentProcess, processFields]);

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
                fields={props.form.fields
                  .map((field: any, idx: number) => {
                    field.options!.hideField = false;
                    return idx < 28 ? field : undefined;
                  })
                  .filter(Boolean)}
                data={convertData()}
                belong={props.form.directory.target.space}
                processData={dataSource}
              />
            ) : (
              <BaseForm instances={Object.values(props.thingData.archives)} />
            ),
          },
          {
            key: '2',
            label: `成果转化列表`,
            children: (
              <>
                {isTransferHistory ? (
                  <HistoryView
                    title="成果转化列表"
                    fields={fields}
                    instance={curentInstance}
                    processData={dataSource.filter(
                      (i) => i['535542249707159553'] === '成果转化',
                    )}
                  />
                ) : (
                  <TaskView
                    title="成果转化列表"
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
                    processData={dataSource.filter(
                      (i) => i['535542249707159553'] === '转化合同',
                    )}
                  />
                ) : (
                  <TaskView title="合同信息" instance={[]} formId="535176818869813249" />
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
                    processData={dataSource.filter(
                      (i) => i['535542249707159553'] === '收益分配',
                    )}
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
                    processData={dataSource.filter(
                      (i) => i['535542249707159553'] === '成果赋权',
                    )}
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
