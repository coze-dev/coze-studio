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
        {/* 返回按钮 */}
        <GoBackButton />
        {/* 项目标题 */}
        <ProjectInfo />
      </Col>
      {/* 海外版暂时不上 uibuilder 切换功能 */}
      <Col span={8} className={styles['middle-col']}>
        {IS_OVERSEA ? null : <ModeTab />}
      </Col>
      <Col span={8} className={styles['right-col']}>
        <Operators />
      </Col>
    </Row>
  </div>
);
