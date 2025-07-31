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

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

type IProps = SetterComponentProps<
  unknown,
  {
    nameLabel?: string;
    valueLabel?: string;
    nameWidth?: string;
  }
>;

const TriggerParameterTitleSetter = ({ options }: IProps) => {
  const { nameLabel, valueLabel, nameWidth } = options;

  return (
    <div className="flex flex-row">
      <div
        className="coz-fg-secondary"
        style={{
          width: nameWidth,
        }}
      >
        {nameLabel}
      </div>
      <div className="flex-1 coz-fg-secondary">{valueLabel}</div>
    </div>
  );
};

export const triggerParameterTitle = {
  key: 'TriggerParameterTitle',
  component: TriggerParameterTitleSetter,
};
