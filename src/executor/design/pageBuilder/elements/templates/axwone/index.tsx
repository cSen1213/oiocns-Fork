import React, { useEffect, useState } from 'react';
import { Space, Spin } from 'antd';
import orgCtrl from '@/ts/controller';
import { IFile } from '@/ts/core';
import { command } from '@/ts/base';
import { kernel } from '@/ts/base';
import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import { defineElement } from '../../defineElement';
import Transaction from '/img/transaction.png';
import cls from './index.module.less';
import { AXWType } from './config/index';

type axwType = {
  title: string;
  id: string;
  content: IFile[];
};

export default defineElement({
  render(props) {
    const RenderAxwInfo: React.FC = () => {
      const [data, setData] = useState<axwType[]>([]); // 数据源
      const [loading, setLoading] = useState<boolean>(false); // 加载动画
      const [dataSource, setDataSource] = useState<AXWType[]>([]); // 在线配置文件数据源

      /** 加载安心屋配置文件 */
      const loadAxwConfig = async () => {
        const axwConfigRes = await orgCtrl.loadAxwConfigDir();
        if (axwConfigRes.length > 0) {
          if (await axwConfigRes[0].loadContent()) {
            let res: any = axwConfigRes[0].content();
            const awxConfigData = 'https://asset.orginone.cn' + res[0].filedata.shareLink;
            if (awxConfigData) {
              const data = await fetchData(awxConfigData);
              setDataSource(data);
            }
          }
        }
      };

      /** 请求在线json配置文件 */
      const fetchData = async (url: string) => {
        const response = await kernel.httpForward({
          uri: url,
          method: 'GET',
          header: { 'Content-Type': 'application/json' },
          content: '',
        });
        if (response.code === 200) {
          return JSON.parse(response.data.content);
        }
      };

      /** 加载主体数据 */
      const loadContents = async () => {
        const axwDriectorys = await orgCtrl.loadAxwDirectorys();
        const axwApplications = await orgCtrl.loadApplications();
        const promises = dataSource?.map(async (item) => {
          const finds: any[] = [];
          await Promise.all(
            item.content.map(async (ite) => {
              const findDirRes = axwDriectorys.find((ita) => ita.id === ite.directoryID);
              const findAppRes = axwApplications.find(
                (ita) => ita.id === ite.applicationID,
              );
              if (ite.applicationID) {
                if (findAppRes) {
                  if (await findAppRes.loadContent()) {
                    finds.push(
                      Object.assign(findAppRes.content().find((i) => i.id === ite.id)!, {
                        aliasName: ite.aliasName || '',
                      }),
                    );
                  }
                }
              }
              if (ite.directoryID) {
                if (findDirRes) {
                  if (await findDirRes.loadContent()) {
                    finds.push(
                      Object.assign(findDirRes.content().find((i) => i.id === ite.id)!, {
                        aliasName: ite.aliasName || '',
                      }),
                    );
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
            content: sortResults.filter(Boolean),
          };
        });

        Promise.all(promises).then((results) => {
          setLoading(false);
          const orderedResults = dataSource.map((item) =>
            results.find((result) => result.id === item.id),
          );
          setData(orderedResults as axwType[]);
        });
      };

      useEffect(() => {
        loadAxwConfig();
      }, []);

      useEffect(() => {
        if (dataSource.length > 0) {
          loadContents();
        }
      }, [dataSource]);

      const loadCommonCard = (item: any) => (
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
            {item?.aliasName || item?.name}
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
