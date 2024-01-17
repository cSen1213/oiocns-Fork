import { logger } from '@/ts/base/common';
import orgCtrl from '@/ts/controller';
import axios from 'axios';
import Crypto from 'crypto-js';
import { Executor } from '.';
const baseUrl = '/axw';
/**
 * 同步安心屋数据至科技大市场
 */
export class PushCompanyInfo extends Executor {
  /**
   * 执行
   * @param data 表单数据
   */
  async execute(): Promise<boolean> {
    const instanceData = this.task.instanceData;
    if (instanceData) {
      const companyTxt =
        instanceData.data['535235538802839553'][0].after[0]['535235447815802881'];
      console.log('44444', companyTxt);

      return await getAppKey(companyTxt);
    }
    return false;
  }

  /**
   * @description: 获取单位名称
   * @return {string}
   */
  getCompanyName() {
    return orgCtrl.user.findShareById(this.task.spaceId).name;
  }
}

async function getAppKey(companyName: string) {
  if (!companyName) {
    return { appKey: '', appSecret: '' };
  }
  const appKey = 'hang-dian-2.0';
  const appSecret = 'f2153349e2df408381e41909c32519da';
  const timestampStr = new Date().getTime().toString();
  // 生成签名
  const sign = `${appKey}${appSecret}${timestampStr}`;
  //加密
  const md5Hash = Crypto.MD5(sign).toString().toLowerCase();
  //TODO:修改为 companyName:this.companyName
  const res: any = await axios.post(
    baseUrl + '/userinfo/user/getAppKey',
    { companyName },
    {
      headers: {
        'Content-Type': 'application/json',
        appKey,
        sign: md5Hash,
        timestamp: timestampStr,
      },
    },
  );

  if (res.status === 200 && res.data.success) {
    logger.msg('推送数据完成!');

    return res.data.datas;
  }
  console.log('getAppKey查询失败');
  logger.msg('推送数据完成!');
  return { appKey: '', appSecret: '' };
}
