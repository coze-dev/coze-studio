/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
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
