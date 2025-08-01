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

import { type ReactNode } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import {
  Badge,
  Button,
  Avatar,
  Modal,
  type ModalProps,
} from '@coze-arch/coze-design';

import { useHiddenSession } from '../../hooks/use-hidden-session';
import ProjectImg from '../../assets/project-img.png';
import ProjectImgOversea from '../../assets/project-img-oversea.png';
import AgentImg from '../../assets/agent-img.png';
import AgentImgOversea from '../../assets/agent-img-oversea.png';

import styles from './index.module.less';

export type CreateType = 'project' | 'agent';

export interface GuideModalProps
  extends Omit<ModalProps, 'size' | 'footer' | 'header' | 'onCancel'> {
  onCancel: () => void;
  onChange: (type: CreateType) => void;
  extraButtonConfigs?: GuideButtonProps[];
}

interface GuideButtonProps {
  onClick: () => void;
  assetSrc: string;
  title: ReactNode;
  description: ReactNode;
  tip?: ReactNode;
}

export const GuideButton: React.FC<GuideButtonProps> = ({
  onClick,
  assetSrc,
  title,
  description,
  tip,
}) => {
  const { isSessionHidden, hideSession } = useHiddenSession(
    tip ? 'guideTip' : '',
  );
  const showTip = !isSessionHidden && Boolean(tip);

  return (
    <div
      onClick={onClick}
      className={classNames(
        'relative cursor-pointer p-8px pb-16px hover:coz-shadow-default coz-bg-max coz-stroke-primary border-[1px] border-solid rounded-[12px] flex flex-col items-center',
        styles['guide-button-hover'],
      )}
    >
      <Avatar
        src={assetSrc}
        className={classNames(
          'w-[314px] h-[240px] rounded-[8px] coz-bg-secondary',
          styles['guide-img-bg'],
          styles['guide-button'],
          {
            '!mb-[-28px]': showTip,
          },
        )}
        imgCls="w-full h-full"
        bottomSlot={{
          render: () =>
            showTip ? (
              <div className="z-10 px-2 coz-fg-hglt text-[12px] font-medium w-full flex justify-center items-center h-[28px] rounded-[4px] rounded-t-none bg-[#DEDBFF]">
                <div className="mx-auto">{tip}</div>
                <IconCozCross
                  className="w-[12px] h-[12px]"
                  onClick={e => {
                    e.stopPropagation();
                    hideSession();
                  }}
                />
              </div>
            ) : null,
          text: tip,
          textColor: '',
          bgColor: '#DEDBFF',
          className: '',
        }}
      />
      <div className="mb-[4px] mt-[20px] coz-fg-plus text-[20px] font-medium leading-[28px]">
        {title}
      </div>
      <div
        className={classNames(
          'mb-[8px] coz-fg-secondary text-[14px] font-normal leading-[20px] opacity-100',
          styles['guide-desc-hover'],
        )}
      >
        {description}
      </div>
      <div
        className={classNames(
          'absolute w-full flex justify-center left-0 bottom-[12px] opacity-0',
          styles['create-button-hover'],
        )}
      >
        <Button>{I18n.t('create_title')}</Button>
      </div>
    </div>
  );
};

const ProjectAsset = IS_OVERSEA ? ProjectImgOversea : ProjectImg;
const AgentAsset = IS_OVERSEA ? AgentImgOversea : AgentImg;

export const GuideModal: React.FC<GuideModalProps> = ({
  onChange,
  extraButtonConfigs = [],
  ...modalProps
}) => (
  <Modal
    // Clear the modal's own margins, propped up by the internal padding, and show the button shadow
    className={styles['guide-modal']}
    size="xl"
    title={I18n.t('create_title')}
    width={'fit-content'}
    {...modalProps}
  >
    <div className="flex justify-between pl-24px pb-24px pr-24px gap-[8px]">
      <GuideButton
        onClick={() => onChange('agent')}
        assetSrc={AgentAsset}
        title={I18n.t('creat_project_creat_agent')}
        description={I18n.t('creat_project_agent_describe')}
        tip={!IS_OPEN_SOURCE ? I18n.t('agent_creat_tips') : null}
      />
      <GuideButton
        onClick={() => onChange('project')}
        assetSrc={ProjectAsset}
        title={
          <span className="flex gap-x-4px items-center">
            {I18n.t('creat_project_creat_project')}
            <Badge count="Beta" type="alt" />
          </span>
        }
        description={
          IS_OPEN_SOURCE
            ? I18n.t('creat_project_describe_open')
            : I18n.t('creat_project_describe')
        }
      />
      {extraButtonConfigs.map(({ onClick, ...config }, index) => (
        <GuideButton
          key={index}
          onClick={() => {
            modalProps.onCancel();
            onClick();
          }}
          {...config}
        />
      ))}
    </div>
  </Modal>
);

GuideModal.displayName = 'GuideModal';
