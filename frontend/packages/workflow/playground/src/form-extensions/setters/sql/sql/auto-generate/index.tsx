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

import React, { useState } from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import { Popover } from '@coze-arch/coze-design';

import { useCurrentDatabaseID } from '@/hooks';

import { Form } from './form';
import { AutoGenerateButton } from './button';

import styles from './index.module.less';

export interface AutoGenerateProps {
  onSubmit: (value: string) => void;
  className?: string;
}

export const AutoGenerate: React.FC<AutoGenerateProps> = ({
  onSubmit,
  className,
}) => {
  const { getNodeSetterId } = useNodeTestId();
  const [visible, setVisible] = useState(false);
  const databaseID = useCurrentDatabaseID();
  const disabled = !databaseID;

  const handleClickButton = () => {
    setVisible(prev => !prev);
  };

  const handleSubmit = (value: string) => {
    onSubmit(value);
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <Popover
      keepDOM={true}
      visible={visible}
      className={styles.popover}
      trigger="custom"
      content={<Form onSubmit={handleSubmit} onCancel={handleCancel} />}
      position={'leftBottom'}
      onClickOutSide={() => setVisible(false)}
      style={{ marginLeft: 44 }}
    >
      <div
        className={className}
        onClick={handleClickButton}
        data-testid={getNodeSetterId('auto-generate-button')}
      >
        <AutoGenerateButton disabled={disabled} />
      </div>
    </Popover>
  );
};
