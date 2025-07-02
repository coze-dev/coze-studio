export enum PremiumPaywallScene {
  // 创建新空间
  AddSpace,
  // 新模型体验
  NewModel,
  // 付费用户模板
  ProTemplate,
  // 添加空间成员
  AddSpaceMember,
  // 协作
  Collaborate,
  // 跨空间资源复制
  CopyResourceCrossSpace,
  // 发布到API或者SDK
  API,
  // 添加音色资源
  AddVoice,
  // 实时语音对话
  RTC,
  // 导出日志
  ExportLog,
  // 查询日志
  FilterLog,
}
export function useBenefitAvailable(_props: unknown) {
  return true;
}
const voidFunc = () => {
  console.log('unImplement void func');
};
export function usePremiumPaywallModal(_props: unknown) {
  return {
    node: <></>,
    open: voidFunc,
    close: voidFunc,
  };
}
