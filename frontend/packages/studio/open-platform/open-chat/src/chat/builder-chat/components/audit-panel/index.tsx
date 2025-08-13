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

import { type FC, type PropsWithChildren } from 'react';

import { type IBuilderChatProps } from '../../type';

import styles from './index.module.less';
const LabelValue: FC<PropsWithChildren<{ label: string }>> = ({
  label,
  children,
}) => (
  <div className={styles['label-value']}>
    <div className={styles.label}>{label}:</div>
    <div className={styles.value}>{children}</div>
  </div>
);

export const AuditPanel: FC<IBuilderChatProps> = props => (
  <div className={styles.container}>
    <LabelValue label="Bot名称">{props?.project?.name}</LabelValue>
    <LabelValue label="BotIcon">
      <img src={props?.project?.iconUrl} className={styles.img} />
    </LabelValue>
    <LabelValue label="开场白">
      {props?.project?.onBoarding?.prologue}
    </LabelValue>
    <LabelValue label="推荐词">
      {(props?.project?.onBoarding?.suggestions || []).map((item, index) => (
        <div key={`${index}`}>{item}</div>
      ))}
    </LabelValue>
    <LabelValue label="用户名称">{props?.userInfo?.nickname}</LabelValue>
    <LabelValue label="用户头像">
      <img src={props?.userInfo?.url} className={styles.img} />
    </LabelValue>
    <LabelValue label="输入框placholder">
      {props?.areaUi?.input?.placeholder}{' '}
    </LabelValue>
    <LabelValue label="输入框默认值">
      {props?.areaUi?.input?.defaultText}{' '}
    </LabelValue>
  </div>
);
