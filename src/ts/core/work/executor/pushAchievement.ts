import { model } from '@/ts/base';
import { logger } from '@/ts/base/common';
import orgCtrl from '@/ts/controller';
import axios from 'axios';
import Crypto from 'crypto-js';
import { Executor } from '.';
const baseUrl = '/axw';
// 转化申请_填写信息表单ID
const zhuanhua_tianxiexinxi_formId = '535176818869813249';
// 转化申请_选择成果表单ID
const zhuanhua_xuanzechengguo_formId = '535176819322798081';
//交易凭证号
const zhuanhua_jiaoyipzh = '535176818974670855';
/**
 * 同步安心屋数据至科技大市场
 */
export class PushAchievement extends Executor {
  /**
   * 执行
   * @param data 表单数据
   */
  async execute(): Promise<boolean> {
    const instanceData = this.task.instanceData;
    if (instanceData) {
      const fun = new PushAchievementTask(this.getCompanyName(), instanceData);
      await fun.getAppKey();
      await fun.getToken();
      return await fun.pushTransferData();
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

type PushAchievementTaskType = {
  companyName: string;
  token: string;
  appKeyInfo: {
    appKey: string;
    appSecret: string;
  };
  getAppKey: () => Promise<boolean>;
  getToken: () => Promise<boolean>;
  pushTransferData: () => Promise<boolean>;
  pushMoneyCertificate: () => boolean;
};

export class PushAchievementTask implements PushAchievementTaskType {
  companyName: string;
  token: string = '';
  instanceData: model.InstanceDataModel;
  appKeyInfo: {
    appKey: string;
    appSecret: string;
  } = {} as any;
  constructor(companyName: string, instanceData: model.InstanceDataModel) {
    this.companyName = companyName;
    this.instanceData = instanceData;
  }
  /**
   * @desc: 根据单位名称 获取单位密钥
   */
  async getAppKey() {
    if (!this.companyName) {
      return false;
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
      { companyName: '浙江省农业科学院' },
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
      this.appKeyInfo = res.data.datas;
      return true;
    }
    console.log('getAppKey查询失败');
    logger.error('推送数据异常!请稍后重试.');
    return false;
  }
  /**
   * @desc: 根据单位密钥 获取接口调用凭证token
   */
  async getToken() {
    if (this.appKeyInfo.appKey) {
      const ret = await axios.post(
        baseUrl + `/userinfo/user/loginByAppKey`,
        {
          app_key: this.appKeyInfo.appKey,
          app_secret: this.appKeyInfo.appSecret,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (ret.status == 200) {
        const datas = ret.data['datas'];
        if (datas) {
          const tonket = datas['tonket'];
          if (tonket) {
            // return { success: true, tonket, messsgae: '' };
            this.token = tonket;
            return true;
          }
        }
      }
    }
    console.log('单位信息查询失败');
    logger.error('推送数据异常!请稍后重试.');
    //  { success: false, messsgae: '科技大市场-单位信息查询失败' };
    return false;
  }
  /**
   * @desc: 推送转化数据
   */
  async pushTransferData() {
    if (!this.token) {
      return false;
    }
    const achievement_no = await pushAchievement(this.instanceData, this.token);

    console.log('pushTransferData', achievement_no, this.instanceData);
    const data = this.instanceData.data; //formName
    const last = data[zhuanhua_tianxiexinxi_formId]?.at(-1);
    const form1 = last?.after[0];
    if (form1) {
      form1[zhuanhua_jiaoyipzh] = achievement_no;
      this.instanceData.primary[zhuanhua_jiaoyipzh] = achievement_no;
      return true;
    }

    return false;
  }
  /**
   * @desc: 推送到账凭证
   */
  pushMoneyCertificate() {
    return true;
  }
}

const pushAchievement = async (instanceData: model.InstanceDataModel, token: string) => {
  const last = instanceData.data[zhuanhua_tianxiexinxi_formId]?.at(-1);
  const form1 = last?.after[0];
  const data = await getAchievementInfo(instanceData);
  const ret = await axios.post(baseUrl + `/api/open/achievement/submit`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  });
  if (ret.status == 200) {
    console.info('推送成果', instanceData, data);

    const datas = ret.data['datas'];
    if (datas) {
      const achievement_no = datas['achievement_no'];
      if (achievement_no) {
        if (form1) {
          form1[zhuanhua_jiaoyipzh] = achievement_no; //成果编号
          logger.msg('推送成果成功! 交易凭证:' + achievement_no);
          return achievement_no;
        }
      }
    } else {
      logger.error('推送成果失败!' + ret.data.errMsg);
      return false;
    }
  } else {
    logger.error('推送成果失败!' + ret.data.errMsg);
  }

  return false;
};

const getAchievementInfo = async (instanceData: model.InstanceDataModel) => {
  const form1 = instanceData.data[zhuanhua_tianxiexinxi_formId]?.at(-1)?.after.at(-1);
  const form2 = instanceData.data[zhuanhua_xuanzechengguo_formId]?.at(-1)?.after;
  if (form1 && form2) {
    const detail = form2.map((a) => {
      return {
        effective: 1, //生效状态 1:生效;0未生效
        owner: a['535176819490570247'] ?? '未知', //所有权人
        asset_no: a['535176819490570241'] ?? '未知', //资产编号
        inventor: (a['535176819490570246'] as string)?.split(/;|；/) ?? [], //发明人/完成人
        patent_name: a['535176819490570242'] ?? '未知', // 专利名称
        patent_no: a['535200121709801473'] ?? '未知', // 专利号--职务成果ID
      };
    });
    const contact =
      (await orgCtrl.user.findEntityAsync(form1['535176818974670850']))?.name ?? '未知'; //联系人
    var transfer_mode = 'apply_transfer';
    switch (form1['535176818974670849']) {
      case 'S535176676863262722':
        transfer_mode = 'patent_transfer';
        break;
      case 'S535176676863262723':
        transfer_mode = 'apply_transfer';
        break;
      case 'S535176676863262726':
        transfer_mode = 'ordinary';
        break;
      case 'S535176676863262728':
        transfer_mode = 'exclusive';
        break;
      case 'S535176676863262730':
        transfer_mode = 'exclude';
        break;
      case 'S535176676863262732':
        transfer_mode = 'other_permit';
        break;
      case 'S535176676863262733':
        transfer_mode = 'free';
        break;
      case '535176676863262736':
        transfer_mode = 'shareholder';
        break;
      default:
        transfer_mode = 'other';
        break;
    }
    var maturity = 'development';
    switch (form1['535176818970476552']) {
      case 'S535176676355751938':
        maturity = 'development';
        break;
      case 'S535176676355751939':
        maturity = 'demo';
        break;
      case 'S535176676355751942':
        maturity = 'small';
        break;
      case 'S535176676355751944':
        maturity = 'pilot';
        break;
      case 'S535176676355751945':
        maturity = 'production';
        break;
      default:
        break;
    }
    // var classification = form1['505330904445624334'];
    return {
      public: 1,
      is_back: true,
      //是否为专利
      patent: 1,
      //转让方式
      transfer_mode: [transfer_mode],
      //成熟度
      maturity: maturity,
      //单据编号
      invoice_no: form1['535176818970476545'],
      //成果名称
      name_cn: form1['535176818970476546'],
      //行业分类
      classification: ['6', '6001'],
      //成果详情
      patent_detail: detail,
      //定价方式
      pricing_type: 'definite',
      //成果说明
      detail_url_cn: form1['535176818970476546'] ?? ' ',
      //所属地区
      affiliating_area: ['0', '330000', '330101'],
      //赋权年限
      permit_period: '',
      //价格
      price: {
        // amount: form1['505330903510294534'],
        amount: form2
          .map((c) => c['535176819490570248'])
          .reduce((acc, currVal) => (Number(acc) ?? 0) + (Number(currVal) ?? 0)),
      },
      //成果联系人
      contact: contact,
      //接受成交主体类型
      principal_type: ['enterprise'],
    };
  }
};
