import { base } from './base';
const { IS_RELEASE_VERSION, IS_OVERSEA, IS_BOE } = base;
export const features = {
  // 与志强&产品沟通后，下掉boe环境的sso
  FEATURE_ENABLE_SSO: !IS_RELEASE_VERSION && !IS_BOE,
  FEATURE_ENABLE_APP_GUIDE: !IS_RELEASE_VERSION || IS_OVERSEA,
  FEATURE_ENABLE_FEEDBACK_MAILTO: IS_RELEASE_VERSION,
  FEATURE_ENABLE_MSG_DEBUG: !IS_RELEASE_VERSION,
  FEATURE_ENABLE_TABLE_VARIABLE: IS_OVERSEA || !IS_RELEASE_VERSION,
  FEATURE_ENABLE_TABLE_MEMORY: true,
  // FEATURE_ENABLE_RUYI_CARD: false,
  FEATURE_ENABLE_VARIABLE: false,
  /**
   * 是否开启新的注销流程，目前只有cn开启
   */
  FEATURE_ENABLE_NEW_DELETE_ACCOUNT: !IS_OVERSEA,
  FEATURE_AWEME_LOGIN: !IS_OVERSEA,
  FEATURE_GOOGLE_LOGIN: IS_OVERSEA,

  /**
   * @description 只在boe环境和inhouse-cn环境支持 workflow code 节点编辑 python 代码
   */
  FEATURE_ENABLE_CODE_PYTHON: !IS_OVERSEA && !IS_RELEASE_VERSION,

  /**
   * 暂时隐藏banner，后续可能用于运营位置
   */
  FEATURE_ENABLE_BANNER: false,

  /**
   * Database tooltip示例区分图海外和国内
   */
  FEATURE_ENABLE_DATABASE_TABLE: !IS_OVERSEA,

  /**
   * bot市场中国区入口
   */
  FEATURE_ENABLE_BOT_STORE: true,
  /**
   * workflow llm 计费只在海外或者 in-house 显示
   */
  FEATURE_ENABLE_WORKFLOW_LLM_PAYMENT: IS_OVERSEA || !IS_RELEASE_VERSION,

  /**
   * 豆包 cici 特殊需求，只在inhouse上线
   */
  FEATURE_ENABLE_QUERY_ENTRY: !IS_RELEASE_VERSION,
  /**
   * coze接入审核增加，用于发布机审弹窗提前、版本历史Publish类审核结果展示。目前仅CN生效。
   */
  FEATURE_ENABLE_TCS: !IS_OVERSEA,

  /**
   * Tea 上报数据增加 UG 线索回传参数，仅 cn release 需要
   * 
   */
  FEATURE_ENABLE_TEA_UG: IS_RELEASE_VERSION && !IS_OVERSEA,
};
