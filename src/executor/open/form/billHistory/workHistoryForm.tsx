import React, { useEffect, useState } from 'react';
import orgCtrl from '@/ts/controller';
import { common, model, schema } from '@/ts/base';
import { IBelong, IForm } from '@/ts/core';
import { Tabs } from 'antd';
import { filterKeys } from '@/utils/index';
import WorkFormViewer from '@/components/DataStandard/WorkForm/Viewer';
// import PrimaryForms from './primary';
// import DetailForms from './detail';
import { formatDate } from '@/utils';
import { getNodeByNodeId } from '@/utils/tools';
import useObjectUpdate from '@/hooks/useObjectUpdate';
import { logger } from '@/ts/base/common/logger';

interface IWorkFormProps {
  allowEdit: boolean;
  belong: IBelong;
  data: any;
}

interface formType {
  data: any;
  fields: any[];
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
          const fieldsData: IForm = curentData.find((a) => a.id === j) as IForm;
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

  /** tabs页切换事件 */
  const onTabsChange = (key: string) => {
    setActiveTabKey(key);
  };

  /** 初始化处理数据 */
  useEffect(() => {
    let promises: any[] = [];
    const existingNames = new Set<string>();
    props.data.forEach((i: any) => {
      console.log('初始化处理数据', i);

      if (!existingNames.has(i.name) && i.name !== '选择成果（成果赋权）') {
        existingNames.add(i.name);
        const [enObj] = filterKeys(i);
        promises.push(
          loadFields('535176817938677761', i.labels).then((res) => ({
            fields: res,
            data: filterShowData(res!, i, enObj),
          })),
        );
      }
    });
    Promise.all(promises).then((res) => {
      setPrimaryFormsData(res);
    });
  }, [props.data]);

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

  return (
    <div style={{ padding: 10 }}>
      <Tabs items={loadItems()} activeKey={activeTabKey} onChange={onTabsChange} />
      {/* {node.primaryForms && node.primaryForms.length > 0 && (
        <PrimaryForms
          {...props}
          changedFields={changedFields}
          forms={node.primaryForms}
          getFormData={getFormData}
          onChanged={(...props) => {
            onValueChanged(...props, '主表');
          }}
        />
      )}
      {node.detailForms && node.detailForms.length > 0 && (
        <DetailForms
          {...props}
          changedFields={changedFields}
          forms={node.detailForms}
          getFormData={getFormData}
          onChanged={(...props) => {
            onValueChanged(...props, '子表');
          }}
        />
      )} */}
    </div>
  );
};

export default WorkHistoryForm;
