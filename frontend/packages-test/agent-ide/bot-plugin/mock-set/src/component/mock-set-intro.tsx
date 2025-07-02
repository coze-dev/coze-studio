import { useState } from 'react';

import classNames from 'classnames';
import { Space, UIIconButton } from '@coze-arch/bot-semi';
import { IconEditNew } from '@coze-arch/bot-icons';
import { type infra, type MockSet } from '@coze-arch/bot-api/debugger_api';
import { MockSetEditModal } from '@coze-studio/mockset-edit-modal-adapter';

import { LongTextWithTooltip } from './long-text-with-tooltip';

import s from './index.module.less';

interface MockSetIntroProps {
  isFullHeader: boolean;
  readOnly?: boolean;
  mockSetInfo: MockSet;
  onUpdateMockSetInfo?: (mockSetInfo?: MockSet) => void;
  bizCtx: infra.BizCtx;
}

const GAP_2 = 2;
const GAP_4 = 4;

export function MockSetIntro({
  isFullHeader = true,
  readOnly = true,
  mockSetInfo,
  onUpdateMockSetInfo,
  bizCtx,
}: MockSetIntroProps) {
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const editHandler = (info?: MockSet) => {
    onUpdateMockSetInfo?.(info);
    setShowEditModal(false);
  };

  return (
    <>
      <Space
        spacing={isFullHeader ? GAP_2 : GAP_4}
        className={classNames(
          s['mock-set-intro-title'],
          isFullHeader ? s['mock-set-intro-title_full'] : '',
        )}
      >
        <LongTextWithTooltip
          className={classNames(
            s['mock-set-intro-name'],
            isFullHeader ? s['mock-set-intro-name_full'] : '',
          )}
        >
          {mockSetInfo.name}
        </LongTextWithTooltip>
        {!readOnly && mockSetInfo.name ? (
          <UIIconButton
            icon={
              <IconEditNew
                className={classNames(
                  s['mock-set-intro-edit'],
                  isFullHeader ? s['mock-set-intro-edit_full'] : '',
                )}
              />
            }
            size="small"
            theme="borderless"
            onClick={() => setShowEditModal(true)}
          />
        ) : null}
        <MockSetEditModal
          visible={showEditModal}
          initialInfo={{
            bindSubjectInfo: mockSetInfo.mockSubject || {},
            bizCtx,
            id: String(mockSetInfo.id),
            name: mockSetInfo.name,
            desc: mockSetInfo.description,
          }}
          onSuccess={editHandler}
          onCancel={() => setShowEditModal(false)}
        ></MockSetEditModal>
      </Space>

      {mockSetInfo.description ? (
        <LongTextWithTooltip
          className={classNames(
            s['mock-set-intro-desc'],
            s['mock-set-intro-desc_priority'],
            isFullHeader ? s['mock-set-intro-desc_full'] : '',
          )}
        >
          {mockSetInfo.description}
        </LongTextWithTooltip>
      ) : null}
    </>
  );
}
