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

import React from 'react';

import { Row, Col } from '@coze-arch/coze-design';
import { ModeTab } from '@coze-project-ide/ui-adapter';

import { ProjectInfo } from './project-info';
import { Operators } from './operators';
import { GoBackButton } from './go-back-button';

import styles from './styles.module.less';

export const TopBar = () => (
  <div className={styles.container}>
    <Row className={styles['top-bar']}>
      <Col span={8} className={styles['left-col']}>
        {/* Back button */}
        <GoBackButton />
        {/* Project title */}
        <ProjectInfo />
      </Col>
      {/* The overseas version does not have the uibuilder switching function for the time being. */}
      <Col span={8} className={styles['middle-col']}>
        {IS_OVERSEA ? null : <ModeTab />}
      </Col>
      <Col span={8} className={styles['right-col']}>
        <Operators />
      </Col>
    </Row>
  </div>
);
