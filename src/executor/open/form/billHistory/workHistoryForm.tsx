import React, { useEffect, useState } from 'react';
import orgCtrl from '@/ts/controller';
import { model, schema } from '@/ts/base';
import { IBelong, IForm } from '@/ts/core';
import { Tabs } from 'antd';
import { filterKeys } from '@/utils/index';
import WorkFormViewer from '@/components/DataStandard/WorkForm/Viewer';
import GenerateThingTable from '@/executor/tools/generate/thingTable';

interface IWorkFormProps {
  allowEdit: boolean;
  belong: IBelong;
  data: any;
  fieldsDriectoryId: string; // 加载字段所处的目录Id
}

interface formType {
  data: any;
  fields: any[];
  detailsFormData?: any;
}

/** 流程节点表单 */
const WorkHistoryForm: React.FC<IWorkFormProps> = (props) => {
  const [activeTabKey, setActiveTabKey] = useState(props.data[0].id);
  const [primaryFormsData, setPrimaryFormsData] = useState<formType[]>([]); // 主表数据
  const [detailFormsData, setDetailFormsData] = useState<formType[]>([]); // 子表数据

  /**
   *  加载表单字段
   * directoryId: 目录ID
   * filterFormInfo: 表字段的过滤条件
   * */
  const loadFields = async (directoryId: string, filterFormInfo: string[]) => {
    const modified = removePrefixLetters(filterFormInfo);
    const allDriectorys = await orgCtrl.loadAxwDirectorys();
    const curentDirectory = allDriectorys.find((a) => a.id === directoryId);
    if (curentDirectory) {
      if (await curentDirectory.loadContent(true)) {
        const curentData = curentDirectory.content();
        for (const j of modified) {
          const fieldsData: IForm = curentData.find((a: any) => a.id === j) as IForm;
          if (fieldsData) {
            return await fieldsData.loadFields();
          }
        }
      }
    }
  };

  /** 加载主表每一项 */
  const loadItems = () => {
    const items = [];
    for (const form of primaryFormsData) {
      const belong =
        orgCtrl.user.companys.find((a) => a.id == form.data?.belongId) || orgCtrl.user;
      items.push({
        key: form.data.id,
        label: form.data.name,
        forceRender: true,
        children: (
          <WorkFormViewer
            form={{ id: form.data.id, name: form.data.name } as schema.XForm}
            fields={form.fields}
            data={form.data}
            changedFields={[]}
            rules={[]}
            belong={belong}
            readonly
          />
        ),
      });
    }
    return items;
  };

  /** 加载子表每一项 */
  const loadDetailItems = () => {
    const items = [];
    for (const form of detailFormsData) {
      items.push({
        key: form.data[0]?.id,
        label: form.data[0]?.name,
        forceRender: true,
        children: (
          <GenerateThingTable
            key={form.data[0]?.id}
            fields={form.fields}
            height={500}
            dataIndex={'attribute'}
            selection={
              props.allowEdit
                ? {
                    mode: 'multiple',
                    allowSelectAll: true,
                    selectAllMode: 'allPages',
                    showCheckBoxesMode: 'always',
                  }
                : undefined
            }
            toolbar={{
              visible: true,
              items: [
                {
                  name: 'columnChooserButton',
                  location: 'after',
                },
                {
                  name: 'searchPanel',
                  location: 'after',
                },
              ],
            }}
            dataSource={form.data}
          />
        ),
      });
    }
    return items;
  };

  /** tabs页切换事件 */
  const onTabsChange = (key: string) => {
    setActiveTabKey(key);
  };

  /** 过滤展示数据 */
  const filterShowData = (fields: model.FieldModel[], data: any, otherData: any) => {
    const newData: any = {};
    fields.forEach((c: any) => {
      if (data['T' + c.id]) {
        newData[c.id] = data['T' + c.id];
      } else {
        if (data[c.code]) {
          newData[c.id] = data[c.code];
        }
      }
    });
    return { ...otherData, ...newData };
  };

  /** 过滤Labels前面的字母 */
  const removePrefixLetters = (arr: string[]): string[] => {
    return arr.map((item) => item.substring(1));
  };

  /** 过滤子表数据 */
  const filterDetailFormsData = (data: any) => {
    const result = data.reduce((acc: any, current: any) => {
      const existingItem = acc.find(
        (item: any) => item.detailsFormData.name === current.detailsFormData.name,
      );
      if (existingItem) {
        existingItem.data.push(current.detailsFormData);
      } else {
        acc.push({
          fields: current.fields,
          detailsFormData: current.detailsFormData,
          data: [current.detailsFormData],
        });
      }
      return acc;
    }, []);
    return result;
  };

  /** 初始化处理数据 */
  useEffect(() => {
    let promises: any[] = [];
    let promisesDetailForm: any[] = [];
    const existingNames = new Set<string>();
    props.data.forEach((i: any) => {
      switch (props.fieldsDriectoryId) {
        case '535176817938677761':
          if (!existingNames.has(i.name) && i.name !== '选择成果（成果赋权）') {
            existingNames.add(i.name);
            const [enObj] = filterKeys(i);
            promises.push(
              loadFields(props.fieldsDriectoryId, i.labels).then((res) => ({
                fields: res,
                data: filterShowData(res!, i, enObj),
              })),
            );
          }
          if (i.name === '选择成果（成果赋权）') {
            const [enObj] = filterKeys(i);
            promisesDetailForm.push(
              loadFields(props.fieldsDriectoryId, i.labels).then((res) => ({
                fields: res,
                detailsFormData: filterShowData(res!, i, enObj),
                data: [],
              })),
            );
          }
          break;
        case '535176817745739777':
          if (
            !existingNames.has(i.name) &&
            i.name !== '选择成果（成果转化）' &&
            i.name !== '意向受让方' &&
            i.name !== '分配比例'
          ) {
            existingNames.add(i.name);
            const [enObj] = filterKeys(i);
            promises.push(
              loadFields(props.fieldsDriectoryId, i.labels).then((res) => ({
                fields: res,
                data: filterShowData(res!, i, enObj),
              })),
            );
          }
          if (
            i.name === '选择成果（成果转化）' ||
            i.name === '意向受让方' ||
            i.name === '分配比例'
          ) {
            const [enObj] = filterKeys(i);
            promisesDetailForm.push(
              loadFields(props.fieldsDriectoryId, i.labels).then((res) => ({
                fields: res,
                detailsFormData: filterShowData(res!, i, enObj),
                data: [],
              })),
            );
          }
          break;
        default:
          break;
      }
    });
    Promise.all(promises).then((res) => {
      setPrimaryFormsData(res);
    });
    Promise.all(promisesDetailForm).then((res) => {
      const result = filterDetailFormsData(res);
      setDetailFormsData(result);
    });
  }, [props.data]);

  return (
    <div style={{ padding: 10 }}>
      <Tabs items={loadItems()} activeKey={activeTabKey} onChange={onTabsChange} />
      <Tabs items={loadDetailItems()} defaultActiveKey={detailFormsData[0]?.data?.id} />
    </div>
  );
};

export default WorkHistoryForm;
