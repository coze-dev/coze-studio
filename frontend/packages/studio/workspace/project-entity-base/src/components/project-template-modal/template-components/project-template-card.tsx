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

import {
  forwardRef,
  type MouseEventHandler,
  type PropsWithChildren,
  useRef,
} from 'react';

import classNames from 'classnames';
import { useHover } from 'ahooks';
import { TeaExposure } from '@coze-studio/components';
import { type ProductInfo } from '@coze-arch/idl/product_api';
import { I18n } from '@coze-arch/i18n';
import { openNewWindow } from '@coze-arch/bot-utils';
import { extractTemplateActionCommonParams } from '@coze-arch/bot-tea/utils';
import {
  EVENT_NAMES,
  type ParamsTypeDefine,
  sendTeaEvent,
} from '@coze-arch/bot-tea';
import { Button, Image } from '@coze-arch/coze-design';

import styles from './card.module.less';

export interface ProjectTemplateCardContentProps {
  /** Event tracking parameters, page source */
  viewSource: ParamsTypeDefine[EVENT_NAMES.template_action_front]['source'];
  product: ProductInfo;
  onCopyTemplate?: (param: { name: string; id: string }) => void;
  className?: string;
  onClick?: () => void;
}

export const openTemplatePreview = (templateId: string) => {
  const url = new URL(
    `/template/project/${templateId}`,
    window.location.origin,
  );
  openNewWindow(() => url.toString());
};

const ActionButton: React.FC<ProjectTemplateCardContentProps> = ({
  viewSource,
  product,
  className,
  onCopyTemplate,
}) => {
  const onPreview: MouseEventHandler<HTMLButtonElement> = e => {
    e.stopPropagation();
    sendTeaEvent(EVENT_NAMES.template_action_front, {
      action: 'click',
      source: viewSource,
      ...extractTemplateActionCommonParams(product),
    });
    openTemplatePreview(product.meta_info.id ?? '');
  };
  const onCopy: MouseEventHandler<HTMLButtonElement> = e => {
    e.stopPropagation();
    onCopyTemplate?.({
      name: product.meta_info.name ?? '',
      id: product.meta_info.id ?? '',
    });
  };

  const isShowCopyActionButton = !product.meta_info.is_professional;

  return (
    <div className={classNames('w-full px-12px', className)}>
      <div
        className={classNames('w-full h-24px', styles['template-card-mask'])}
      />
      <div className="w-full flex justify-between pt-8px coz-bg-max gap-x-8px">
        <Button color="highlight" className="flex-[1]" onClick={onPreview}>
          {I18n.t('creat_project_use_template_preview')}
        </Button>
        {isShowCopyActionButton ? (
          <Button color="hgltplus" className="flex-[1]" onClick={onCopy}>
            {I18n.t('creat_project_use_template_use')}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export const ProjectTemplateCardUI = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{ className?: string; onClick?: () => void }>
>(({ className, children, onClick }, ref) => (
  <div
    ref={ref}
    onClick={onClick}
    className={classNames(
      'cursor-pointer p-12px coz-bg-max coz-stroke-primary border-solid border-[1px] hover:coz-shadow-default rounded-[16px]',
      className,
    )}
  >
    {children}
  </div>
));

export const ProjectTemplateCard: React.FC<ProjectTemplateCardContentProps> = ({
  viewSource,
  product,
  onCopyTemplate,
  className,
  onClick,
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const isHover = useHover(divRef);
  return (
    <ProjectTemplateCardUI
      ref={divRef}
      className={classNames('relative', className)}
      onClick={() => {
        sendTeaEvent(EVENT_NAMES.template_action_front, {
          action: 'click',
          source: viewSource,
          ...extractTemplateActionCommonParams(product),
        });
        onClick?.();
      }}
    >
      <TeaExposure
        once
        teaEvent={{
          name: EVENT_NAMES.template_action_front,
          params: {
            ...extractTemplateActionCommonParams(product),
            action: 'card_view',
            source: viewSource,
          },
        }}
      >
        <div className="px-4px mb-8px overflow-hidden text-ellipsis coz-fg-primary text-[14px] font-medium leading-[20px]">
          {product.meta_info.name}
        </div>
        <Image
          preview={false}
          src={product.meta_info.covers?.at(0)?.url}
          className="rounded-[16px] block w-full"
          imgCls="object-cover object-center w-full"
          height={148}
        />
        <ActionButton
          viewSource={viewSource}
          product={product}
          onCopyTemplate={onCopyTemplate}
          className={classNames(
            'absolute left-0 bottom-[8px]',
            !isHover && 'hidden',
          )}
        />
      </TeaExposure>
    </ProjectTemplateCardUI>
  );
};
