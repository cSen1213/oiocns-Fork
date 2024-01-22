import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Space, Spin, Button, Divider } from 'antd';
import orgCtrl from '@/ts/controller';
import { IFile } from '@/ts/core';
import { command } from '@/ts/base';
import { kernel } from '@/ts/base';
import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import { defineElement } from '../../defineElement';
import Transaction from '/img/transaction.png';
import TypeIcon from '@/components/Common/GlobalComps/typeIcon';
import cls from './index.module.less';
import { AXWType } from './config/index';
import { ImStack } from 'react-icons/im';

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
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100px',
            alignItems: 'center',
          }}
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
            {/* {item?.aliasName || item?.name} */}
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
              width:
                title === '成果管理' ? '40%' : title === '合同收益管理' ? '30%' : '26%',
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
        <div>
          <Spin spinning={loading} tip={'加载中...'}>
            <div className="cardItem-viewer">
              <div
                className="cardGroup"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
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
    const history = useHistory();

    // 操作组件
    const RenderOperate = () => {
      // 发送快捷命令
      const renderCmdBtn = (cmd: string, title: string, iconType: string) => {
        return (
          <Button
            className="linkBtn"
            type="text"
            icon={<TypeIcon iconType={iconType} size={18} />}
            onClick={() => {
              command.emitter('executor', cmd, orgCtrl.user);
            }}>
            {title}
          </Button>
        );
      };
      return (
        <>
          <div className="cardItem-header">
            <span className={cls.title}>快捷操作</span>
            <span className={cls.extraBtn} onClick={() => history.push('relation')}>
              <ImStack /> <span>更多操作</span>
            </span>
          </div>
          <div style={{ width: '100%', minHeight: 60 }} className="cardItem-viewer">
            <Space wrap split={<Divider type="vertical" />} size={6}>
              {renderCmdBtn('joinFriend', '添加好友', 'joinFriend')}
              {renderCmdBtn('joinStorage', '申请存储', '存储资源')}
              {renderCmdBtn('newCohort', '创建群组', '群组')}
              {renderCmdBtn('joinCohort', '加入群聊', 'joinCohort')}
              {renderCmdBtn('newCompany', '设立单位', '单位')}
              {renderCmdBtn('joinCompany', '加入单位', 'joinCompany')}
            </Space>
          </div>
        </>
      );
    };

    return (
      <div className={cls.axw_template}>
        <div className={cls.banner}>{props.banner?.({})}</div>
        <div className={cls.render_axw}>
          <div className="cardGroup">
            <div style={{ minHeight: 80 }} className="cardItem">
              <RenderOperate />
            </div>
          </div>
          <RenderAxwInfo />
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
      operate: {
        label: '快捷操作',
        single: true,
        params: {},
        default: 'Operate',
      },
    },
    type: 'Template',
    label: '安心屋',
    photo: Transaction,
    description: '安心屋设计页面',
    layoutType: 'full',
  },
});
