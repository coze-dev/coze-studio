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
 
export interface BackButtonProps {
  onClickBack: () => void;
}

/** 导航栏自定义按钮属性 */
export interface NavBtnProps {
  // 必填，Nav.Item导航组件唯一key，路由匹配时高亮
  navKey: string;
  //按钮图标
  icon?: React.ReactNode;
  // 按钮名称
  label: string | React.ReactNode;
  // 后缀节点
  suffix?: string | React.ReactNode;
  // 仅在左侧导航栏默认模式中展示
  onlyShowInDefault?: boolean;
  // 按钮点击回调
  onClick: (e: React.MouseEvent) => void;
}
