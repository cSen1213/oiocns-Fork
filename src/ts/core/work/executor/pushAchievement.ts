import { model } from '@/ts/base';
import { logger } from '@/ts/base/common';
import orgCtrl from '@/ts/controller';
import axios from 'axios';
import Crypto from 'crypto-js';
import { Executor } from '.';
const baseUrl = '/axw';
// 转化申请_填写信息表单ID
const zhuanhua_tianxiexinxi_formId = '505330904395292673';
// 转化申请_选择成果表单ID
const zhuanhua_xuanzechengguo_formId = '505330904529510401';
//交易凭证号
const zhuanhua_jiaoyipzh = 'jiaoyipinghzneghao';
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
    console.log('task', this.task);

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

class PushAchievementTask implements PushAchievementTaskType {
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
    const res: any = await axios.post(
      baseUrl + '/userinfo/user/getAppKey',
      { companyName: this.companyName ?? '浙江省农业科学院' },
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
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const item = data[key];
        if (Array.isArray(item) && item.length > 0 && item[0].after.length === 1) {
          const formData = item[0].after[0];
          if (formData.name === '成果信息填写') {
            formData[zhuanhua_jiaoyipzh] = achievement_no;
          }
        }
      }
    }

    return true;
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
  var ret = await axios.post(baseUrl + `/api/open/achievement/submit`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  });
  if (ret.status == 200) {
    console.info('推送成果', ret.data);

    const datas = ret.data['datas'];
    if (datas) {
      const achievement_no = datas['achievement_no'];
      if (achievement_no) {
        if (form1) {
          form1['512155583277834241'] = achievement_no; //成果编号
          logger.msg('推送成果成功! 交易凭证:' + achievement_no);
          return achievement_no;
        }
      }
    }
  } else {
    logger.error('推送成果失败!' + JSON.stringify(ret.data));
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
        owner: a['505330903514488840'] ?? '未知', //所有权人
        asset_no: a['505330903501905922'] ?? '未知', //资产编号
        inventor: (a['505330904571453445'] as string)?.split(/;|；/) ?? [], //发明人/完成人
        patent_name: a['505330903506100235'] ?? '未知', // 专利名称
        patent_no: a['505330903501905922'] ?? '未知', // 专利号
      };
    });
    const contact =
      (await orgCtrl.user.findEntityAsync(form1['505330904445624325']))?.name ?? '未知';
    var transfer_mode = 'apply_transfer';
    switch (form1['505330904445624336']) {
      case 'S505330879372075010':
        transfer_mode = 'patent_transfer';
        break;
      case 'S505330879372075025':
        transfer_mode = 'apply_transfer';
        break;
      case 'S505330879372075011':
        transfer_mode = 'ordinary';
        break;
      case '505330879372075014':
        transfer_mode = 'exclusive';
        break;
      case 'S505330879372075016':
        transfer_mode = 'exclude';
        break;
      case 'SF':
        transfer_mode = 'other_permit';
        break;
      case 'S505330879372075019':
        transfer_mode = 'free';
        break;
      case 'S505330879372075021':
        transfer_mode = 'shareholder';
        break;
      default:
        transfer_mode = 'other';
        break;
    }
    var maturity = 'development';
    switch (form1['505330904445624327']) {
      case 'S505330879762145282':
        maturity = 'development';
        break;
      case 'S505330879762145284':
        maturity = 'demo';
        break;
      case 'S505330879762145286':
        maturity = 'small';
        break;
      case 'S505330879762145287':
        maturity = 'pilot';
        break;
      case 'S505330879762145290':
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
      invoice_no: 'CGZH20220417000094',
      //成果名称
      name_cn: form1['505330903522877455'],
      //行业分类
      classification: ['6', '6001'],
      //成果详情
      patent_detail: detail,
      //定价方式
      pricing_type: 'definite',
      //成果说明
      detail_url_cn: form1['505330904445624328'] ?? ' ',
      //所属地区
      affiliating_area: ['0', '330000', '330101'],
      //赋权年限
      permit_period: '',
      //价格
      price: {
        amount: form1['505330903510294534'],
      },
      //成果联系人
      contact: contact,
      //接受成交主体类型
      principal_type: ['enterprise'],
    };
  }
};
