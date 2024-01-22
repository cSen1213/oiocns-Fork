import React, { useEffect, useState } from 'react';
import FullScreenModal from '@/components/Common/fullScreen';
import { IForm } from '@/ts/core';
import * as config from './config';
import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import MinLayout from '@/components/MainLayout/minLayout';
import useMenuUpdate from '@/hooks/useMenuUpdate';
import WorkForm from '@/components/DataStandard/WorkForm';
import GenerateThingTable from '@/executor/tools/generate/thingTable';
import CustomStore from 'devextreme/data/custom_store';
// import { ImCopy, ImShuffle, ImTicket } from 'react-icons/im';
import { Controller } from '@/ts/controller';
import { Spin } from 'antd';
import ThingView from './detail';
import History from './history';
import BillHistory from './billHistory';
import useAsyncLoad from '@/hooks/useAsyncLoad';
// import { Theme } from '@/config/theme';

interface IProps {
  form: IForm;
  finished: () => void;
}
let selectedKey: string = '';
let filter = '';
/** 表单查看 */
const FormView: React.FC<IProps> = ({ form, finished }) => {
  const [select, setSelcet] = useState();
  const [loaded] = useAsyncLoad(() => form.loadContent());
  const dataRange = form.metadata.options?.dataRange;
  const filterExp: any[] = JSON.parse(dataRange?.filterExp ?? '[]');
  const labels = dataRange?.labels ?? [];
  const FormBrower: React.FC = () => {
    const [, rootMenu, selectMenu, setSelectMenu, refreshMenu] = useMenuUpdate(
      () => config.loadSpeciesItemMenu(form),
      new Controller(form.key),
    );
    const [totalCount, setTotalCount] = useState(0);
    useEffect(() => {
      //赋权-成果库-合同-转化信息-
      if (
        [
          '535176821000519681',
          '535176818458771457',
          '535176822128787457',
          '535176818869813249',
          '535176823366107137',
        ].includes(form.id)
      ) {
        config.loadCohortMembers().then((res) => {
          res && refreshMenu(res);
        });
      }
      return () => {
        selectedKey = '';
        filter = '';
        setTotalCount(0);
      };
    }, []);
    if (!selectMenu || !rootMenu) return <></>;
    const loadContent = () => {
      if (select) {
        console.log('打开表单', form, form.metadata.openType);

        switch (form.metadata.openType) {
          case '事项':
            //办事视图明细 查看
            return (
              <BillHistory
                form={form}
                thingData={select}
                onBack={() => setSelcet(undefined)}
              />
            );
          // 成果视图表单 查看
          case '关联事项':
            return (
              <History
                form={form}
                thingData={select}
                onBack={() => setSelcet(undefined)}
              />
            );
          default:
            //默认卡片视图
            return (
              <ThingView
                form={form}
                thingData={select}
                onBack={() => setSelcet(undefined)}
              />
            );
        }
      }
      return (
        <GenerateThingTable
          key={form.key}
          height={'100%'}
          fields={form.fields}
          scrolling={{
            mode: 'infinite',
            showScrollbar: 'onHover',
          }}
          pager={{
            // visible: form.id === '535176818458771457',
            visible: true,
            showInfo: true,
            infoText: '总计: ' + totalCount + ' 个',
          }}
          onRowDblClick={(e: any) => setSelcet(e.data)}
          filterValue={filterExp}
          dataSource={
            new CustomStore({
              key: 'id',
              async load(loadOptions: any) {
                if ((filterExp && filterExp.length > 0) || labels.length > 0) {
                  loadOptions.userData = labels.map((a) => a.value);
                  if (selectMenu.key !== selectedKey) {
                    loadOptions.skip = 0;
                  }

                  if (selectMenu.itemType === '集群单位' && selectMenu.item.id) {
                    loadOptions = {
                      ...loadOptions,
                      options: {
                        match: { belongId: selectMenu.item.id },
                      },
                    };
                  } else if (selectMenu.item?.value) {
                    loadOptions.userData.push(selectMenu.item.value);
                  } else if (selectMenu.item?.code) {
                    loadOptions.userData.push(selectMenu.item.code);
                  }

                  const res = await form.loadThing({
                    ...loadOptions,
                    requireTotalCount: true,
                  });

                  if (
                    loadOptions.userData.length > 0 &&
                    JSON.stringify(loadOptions.userData) !== filter
                  ) {
                    setTotalCount(res.totalCount);
                    selectedKey = selectMenu.key;
                    filter = JSON.stringify(loadOptions.filter);
                  }

                  return res;
                }
                return { data: [], success: true, totalCount: 0, groupCount: 0 };
              },
            })
          }
          remoteOperations={true}
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
        />
      );
    };
    return (
      <MinLayout
        selectMenu={selectMenu}
        onSelect={(data) => {
          setSelectMenu(data);
        }}
        siderMenuData={rootMenu}>
        {loadContent()}
      </MinLayout>
    );
  };
  return (
    <FullScreenModal
      centered
      open={true}
      fullScreen
      width={'80vw'}
      title={form.name}
      bodyHeight={'80vh'}
      icon={<EntityIcon entityId={form.id} />}
      destroyOnClose
      onCancel={() => finished()}>
      {loaded ? (
        form.canDesign ? (
          <FormBrower />
        ) : (
          <WorkForm form={form} />
        )
      ) : (
        <Spin tip={'配置信息加载中...'}>
          <div style={{ width: '100%', height: '100%' }}></div>
        </Spin>
      )}
    </FullScreenModal>
  );
};

export default FormView;
