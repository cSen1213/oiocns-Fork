import React, { useEffect, useState } from 'react';
import { Space, Spin } from 'antd';
import orgCtrl from '@/ts/controller';
import { defineElement } from '../../defineElement';
import Transaction from '/img/transaction.png';
import cls from './index.module.less';
import { IFile } from '@/ts/core';
import { command } from '@/ts/base';
import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import { AXWPORTALID } from './config';

export default defineElement({
  render(props) {
    const RenderAxwInfo: React.FC = () => {
      const [data, setData] = useState<any>([]);
      const [loading, setLoading] = useState<boolean>(false);
      const loadContents = async () => {
        const axwContents = await orgCtrl.loadAxwContents();
        const promises = AXWPORTALID.map(async (item) => {
          const finds: any[] = [];
          await Promise.all(
            item.content.map(async (ite) => {
              const findResult = axwContents.find((ita) => ita.id === ite.directoryID);
              if (findResult) {
                if (await findResult.loadContent()) {
                  if (ite.applicationID) {
                    finds.push(
                      findResult
                        .content()
                        .find((i) => i.id === ite.applicationID)
                        ?.content()
                        .find((s) => s.id === ite.id),
                    );
                  } else {
                    finds.push(findResult.content().find((i) => i.id === ite.id));
                  }
                }
              }
            }),
          );
          setLoading(true);
          const sortResults = item.content.map((ites) =>
            finds.find((find) => find.id === ites.id),
          );
          return {
            title: item.title,
            id: item.id,
            content: sortResults,
          };
        });
        Promise.all(promises).then((results) => {
          setLoading(false);
          const orderedResults = AXWPORTALID.map((item) =>
            results.find((result) => result.id === item.id),
          );
          setData(orderedResults);
        });
        // AXWPORTALID.map(async (item) => {
        //   item.content.map(async (ite) => {
        //     const findResult = axwContents.find((ita) => ita.id === ite.directoryID);
        //     if (findResult) {
        //       if (await findResult.loadContent()) {
        //         finds.push(findResult.content().find((i) => i.id === ite.id));
        //       }
        //     }
        //   });
        //   setLoading(true);
        //   result.push({
        //     title: item.title,
        //     id: item.title,
        //     content: finds,
        //   });
        //   if (result.length === AXWPORTALID.length) {
        //     setLoading(false);
        //     setData(result);
        //   }
        //   // const findResult = axwContents.find((ita) => ita.id === item.directoryID);
        //   // if (findResult) {
        //   //   if (await findResult.loadContent()) {
        //   //     result.push({
        //   //       title: item.title,
        //   //       id: findResult.id,
        //   //       content: item.content.map((x) => {
        //   //         return findResult.content().find((i) => i.id === x.id);
        //   //       }),
        //   //     });
        //   //     setLoading(true);
        //   //     if (result.length === AXWPORTALID.length) {
        //   //       setLoading(false);
        //   //       setData(result);
        //   //     }
        //   //   }
        //   // }
        // });
      };

      useEffect(() => {
        loadContents();
      }, []);

      const loadCommonCard = (item: IFile) => (
        <div
          className="appCard"
          style={{ display: 'flex', flexDirection: 'column', height: '100px' }}
          onClick={() => {
            command.emitter('executor', 'open', item);
          }}>
          <EntityIcon entity={item?.metadata} size={35} />
          <div
            className="appName"
            style={{
              width: '100px',
              textAlign: 'center',
            }}>
            {item?.name}
          </div>
        </div>
      );

      const loadGroupItem = (title: string, data: any[]) => {
        if (data.length < 1) return <></>;
        return (
          <div
            className="cardItem"
            style={{
              width: '32%',
              maxWidth: 500,
              marginRight: '16px',
              marginBottom: '20px',
            }}>
            <div className="cardItem-header">
              <span className="title" style={{ fontSize: '16px', fontWeight: 600 }}>
                {title}
              </span>
            </div>
            <div className="cardItem-viewer">
              <Space wrap size={2}>
                {data.map((app) => {
                  return loadCommonCard(app);
                })}
              </Space>
            </div>
          </div>
        );
      };

      return (
        <>
          <Spin spinning={loading} tip={'加载中...'}>
            <div className="cardItem-viewer">
              <div
                className="cardGroup"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
                }}>
                {data.map((item: any) => {
                  return loadGroupItem(item.title, item.content);
                })}
              </div>
            </div>
          </Spin>
        </>
      );
    };

    return (
      <div className={cls.axw_template}>
        <div className={cls.banner}>{props.banner?.({})}</div>
        <div className="cardGroup">
          <div className="cardItem">
            <RenderAxwInfo />
          </div>
        </div>
      </div>
    );
  },
  displayName: 'AxwTemplate',
  meta: {
    props: {},
    slots: {
      banner: {
        label: '横幅插槽',
        single: true,
        params: {},
        default: 'HeadBanner',
      },
    },
    type: 'Template',
    label: '安心屋',
    photo: Transaction,
    description: '安心屋设计页面',
    layoutType: 'full',
  },
});
