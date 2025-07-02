import React from 'react';

import { isEmpty } from 'lodash-es';

import { useTemplateService } from '@/hooks/use-template-service';

import { TemplatePreviewInner } from './template-preview-inner';
import { TemplateCompZIndex } from './constants';

export const TemplatePreview = () => {
  const templateService = useTemplateService();
  const previewInfo = templateService.templatePreviewInfo;

  return !isEmpty(previewInfo) ? (
    <div
      className="absolute w-full px-[8px] pt-[8px] pointer-events-auto"
      style={{
        height: 'calc(100% - 10px)',
        zIndex: TemplateCompZIndex.TemplatePreview,
      }}
    >
      <div
        className="w-full h-full p-[12px] bg-[#F9F9F9] rounded-lg"
        style={{
          border:
            '0.548px solid var(--Stroke-COZ-stroke-primary, rgba(6, 7, 9, 0.10))',
        }}
      >
        <div className="relative w-full h-full flex justify-center items-center">
          {/* workflow_id 改变时，画布区重渲染 */}
          <TemplatePreviewInner
            key={previewInfo?.workflow_id}
            spaceId={previewInfo?.space_id}
            workflowId={previewInfo?.workflow_id}
          />
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};
