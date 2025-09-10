/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable prettier/prettier */
import { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { I18n } from '@coze-arch/i18n';
import { Button, Breadcrumb, Form, Spin, Toast } from '@coze-arch/coze-design';
import { getParamsFromQuery } from '../../../../../../arch/bot-utils';
import { useParams } from 'react-router-dom';
import {
  IconCozArrowLeft,
  IconCozWarningCircleFill,
} from '@coze-arch/coze-design/icons';
import {
  Content,
  Header,
  SubHeaderSearch,
  HeaderTitle,
  SubHeaderFilters,
  Layout,
  SubHeader,
  HeaderActions,
  type DevelopProps,
} from '@coze-studio/workspace-base/develop';
import { IconCozPlus } from '@coze-arch/coze-design/icons';

import cls from 'classnames';
import { replaceUrl, parseUrl } from './utils';
import { aopApi } from '@coze-arch/bot-api';

import styles from './index.module.less';

export const FalconMarketCardDetail = () => {
  const cardId = getParamsFromQuery({ key: 'card_id' });
  console.log('🚀 ~ FalconMarketCardDetail ~ cardId:', cardId);
  const navigate = useNavigate();

  return (
    <Layout>
      <Header>
        <HeaderTitle>
          <Button
            color="secondary"
            icon={<IconCozArrowLeft />}
            onClick={() => navigate(-1)}
          >
            {I18n.t('back') + I18n.t('workspace_card_library')}
          </Button>
        </HeaderTitle>
      </Header>
      <div className={styles.marketCardDetailContent}>
        <div className="pb-[24px] border-b-1 border-b-solid border-b-[#f00]">
          <div className={styles.info}>
            <div className={styles.title}>
              {I18n.t('workspace_card_detail')}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
