import React, { useEffect, useState } from 'react';
import orgCtrl from '@/ts/controller';
import { common, model, schema } from '@/ts/base';
import { IBelong, IForm } from '@/ts/core';
import { Tabs } from 'antd';
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

/** 流程节点表单 */
const WorkHistoryForm: React.FC<IWorkFormProps> = (props) => {
  console.log('WorkHistoryForm', props, props.data);

  const [fields, setFields] = useState<model.FieldModel[]>([]); // 表单字段
  const [activeTabKey, setActiveTabKey] = useState(props.data[0].id);

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

  console.log('1111q----', fields);

  const loadItems = () => {
    const items = [];
    for (const form of props.data) {
      const belong =
        orgCtrl.user.companys.find((a) => a.id == form?.belongId) || orgCtrl.user;
      items.push({
        key: form.id,
        label: form.name,
        forceRender: true,
        children: (
          <WorkFormViewer
            form={{ id: form.id, name: form.name } as schema.XForm}
            fields={fields}
            data={form}
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
    const findCurent = props.data.find((i: any) => i.id === key);
    if (findCurent) {
      loadFields('535176817938677761', findCurent.name);
    }
    setActiveTabKey(key);
  };

  /** 初始化加载表单字段 */
  useEffect(() => {
    loadFields('535176817938677761', props.data[0].name);
  }, []);

  useEffect(() => {
    let primaryFormsData: any[] = [];
    props.data.forEach((i: any) => {
      if (!primaryFormsData.find((s) => s.form.name === i.name) && i.name !== '') {
        loadFields('535176817938677761', i.name);
        primaryFormsData.push({
          form: i,
          fields: fields,
        });
      }
    });
    console.log('yyyyyyyyyyyyyy', primaryFormsData);
  }, [props.data]);

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
