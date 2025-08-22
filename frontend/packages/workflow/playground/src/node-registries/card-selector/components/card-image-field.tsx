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

import React, { useState, useCallback, useEffect } from 'react';

import { Spin } from '@coze-arch/bot-semi';

import { Section, useWatch } from '@/form';

import type { CardItem } from '../types';
import { SELECTED_CARD_PATH } from '../constants';

interface CardImageFieldProps {
  title?: string;
  tooltip?: string;
  sassWorkspaceId?: string;
}

function CardImageFieldComp({
  title,
  tooltip,
  sassWorkspaceId = '7533521629687578624', // 默认工作空间ID
}: CardImageFieldProps) {
  const selectedCard = useWatch<CardItem | undefined>(SELECTED_CARD_PATH);
  const [cardPicUrl, setCardPicUrl] = useState<string>('');
  const [loadingPic, setLoadingPic] = useState(false);

  // URL转换函数，处理图片路径
  const replaceUrl = useCallback((url: string) => {
    if (!url) {
      return '';
    }
    return url
      .replace('@minio/public-cbbiz', '/filestore/dev-public-cbbiz')
      .replace('@filestore', '/filestore');
  }, []);

  // 获取卡片图片
  const fetchCardPic = useCallback(
    async (cardId: string) => {
      if (!cardId || !sassWorkspaceId) {
        return;
      }

      setLoadingPic(true);
      try {
        const response = await fetch('/aop-web/IDC10022.do', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Request-Origion': 'SwaggerBootstrapUi',
            accept: '*/*',
          },
          body: JSON.stringify({
            body: {
              cardId,
              sassWorkspaceId,
              agentId: '',
              applyScene: '',
              cardClassId: '',
              cardCode: '',
              cardName: '',
              cardPicUrl: '',
              channel: '',
              code: '',
              createTime: '',
              createdBy: true,
              greyConfigInfo: '',
              greyNum: '',
              id: '',
              isAdd: '',
              jsFileUrl: '',
              mainUrl: '',
              memo: '',
              moduleName: '',
              pageNo: '',
              pageSize: '',
              picUrl: '',
              platform: '',
              platformStatus: '',
              platformValue: '',
              previewSchema: '',
              publishMode: '',
              publishStatus: '',
              publishType: '',
              realGreyEndtime: '',
              resourceType: '',
              sassAppId: '',
              schemaValue: '',
              searchValue: '',
              serviceModuleId: '',
              serviceName: '',
              skeletonScreen: '',
              soLib: '',
              staticMemo: '',
              staticType: '',
              staticVersion: '',
              taskId: '',
              taskStatus: '',
              templateId: '',
              templateName: '',
              templateSchemaValue: '',
              unzipPath: '',
              userId: '',
              variableValueList: [
                {
                  bizChannel: '',
                  variableDefaultValue: '',
                  variableDescribe: '',
                  variableKey: '',
                  variableName: '',
                  variableStructure: '',
                  variableType: '',
                },
              ],
              version: '',
              versionId: '',
              whitelistIds: '',
              whlBusiness: '',
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.header?.errorCode === '0' && data.body?.picUrl) {
          const fullPicUrl = replaceUrl(data.body.picUrl);
          setCardPicUrl(fullPicUrl);
        } else {
          console.warn('获取卡片图片失败:', data.header?.errorMsg);
          setCardPicUrl('');
        }
      } catch (error) {
        console.error('获取卡片图片出错:', error);
        setCardPicUrl('');
      } finally {
        setLoadingPic(false);
      }
    },
    [sassWorkspaceId, replaceUrl],
  );

  // 监听选中的卡片变化，自动获取图片
  useEffect(() => {
    if (selectedCard?.cardId) {
      fetchCardPic(selectedCard.cardId);
    } else {
      setCardPicUrl('');
      setLoadingPic(false);
    }
  }, [selectedCard?.cardId, fetchCardPic]);

  // 如果没有选中卡片，不显示任何内容
  if (!selectedCard) {
    return null;
  }

  return (
    <Section title={title} tooltip={tooltip}>
      <div
        style={{
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
        }}
      >
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          卡片示意图:
        </div>
        <div
          style={{
            width: '100%',
            height: '180px',
            backgroundColor: '#EFF0F4',
            borderRadius: '6px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loadingPic ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Spin size="small" />
              <span style={{ fontSize: '14px', color: '#666' }}>
                加载图片中...
              </span>
            </div>
          ) : cardPicUrl ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url("${cardPicUrl}")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundSize: 'cover',
                borderRadius: '6px',
              }}
            />
          ) : (
            <div style={{ fontSize: '14px', color: '#999' }}>暂无图片</div>
          )}
        </div>
      </div>
    </Section>
  );
}

export const CardImageField = CardImageFieldComp;
