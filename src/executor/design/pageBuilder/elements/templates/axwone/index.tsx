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

type axwType = {
  title: string;
  id: string;
  content: IFile[];
};

export default defineElement({
  render(props) {
    const RenderAxwInfo: React.FC = () => {
      const [data, setData] = useState<axwType[]>([]);
      const [loading, setLoading] = useState<boolean>(false);

      /** 加载主体数据 */
      const loadContents = async () => {
        const axwDriectorys = await orgCtrl.loadAxwDirectorys();
        const axwApplications = await orgCtrl.loadApplications();
        const promises = AXWPORTALID.map(async (item) => {
          const finds: IFile[] = [];
          await Promise.all(
            item.content.map(async (ite) => {
              const findDirRes = axwDriectorys.find((ita) => ita.id === ite.directoryID);
              const findAppRes = axwApplications.find(
                (ita) => ita.id === ite.applicationID,
              );
              if (ite.applicationID) {
                if (findAppRes) {
                  if (await findAppRes.loadContent()) {
                    finds.push(findAppRes?.content().find((i) => i.id === ite.id)!);
                  }
                }
              }
              if (ite.directoryID) {
                if (findDirRes) {
                  if (await findDirRes.loadContent()) {
                    finds.push(findDirRes.content().find((i) => i.id === ite.id)!);
                  }
                }
              }
            }),
          );
          setLoading(true);
          const sortResults = item.content.map((ites) =>
            finds.find((a) => a?.id === ites?.id),
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
          setData(orderedResults as axwType[]);
        });
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

      const loadGroupItem = (title: string, data: IFile[]) => {
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
        <div className={cls.render_axw}>
          <Spin spinning={loading} tip={'加载中...'}>
            <div className="cardItem-viewer">
              <div
                className="cardGroup"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
                  padding: '12px',
                }}>
                {data.map((item: axwType) => {
                  return loadGroupItem(item.title, item.content);
                })}
              </div>
            </div>
          </Spin>
        </div>
      );
    };

    return (
      <div className={cls.axw_template}>
        <div className={cls.banner}>{props.banner?.({})}</div>
        <RenderAxwInfo />
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
