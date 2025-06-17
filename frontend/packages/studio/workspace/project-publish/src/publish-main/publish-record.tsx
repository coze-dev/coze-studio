import { NavLink } from 'react-router-dom';
import { type FC } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { useFlags } from '@coze-arch/bot-flags';
import { useIsPublishRecordReady } from '@coze-studio/publish-manage-hooks';
import { IconCozCheckMarkCircle } from '@coze-arch/coze-design/icons';

import { useProjectPublishStore } from '../store';
import { ProjectPublishProgress } from '../publish-progress';

export const PublishRecord: FC<{
  projectId: string;
  spaceId: string;
}> = ({ projectId, spaceId }) => {
  const { publishRecordDetail } = useProjectPublishStore(
    useShallow(state => ({
      publishRecordDetail: state.publishRecordDetail,
    })),
  );

  const [FLAGS] = useFlags();

  const { ready, inited } = useIsPublishRecordReady({
    type: IntelligenceType.Project,
    spaceId,
    intelligenceId: projectId,
    // 社区版暂不支持该功能
    enable: FLAGS['bot.studio.publish_management'] && !IS_OPEN_SOURCE,
  });

  return (
    <div>
      <div className="my-[32px] p-[16px] flex flex-col items-center">
        <IconCozCheckMarkCircle className="text-[48px] coz-fg-dim" />
        <div className="text-[16px] font-medium mt-[8px] leading-[22px]">
          {I18n.t('project_release_already_released')}
        </div>
        <div className="text-[12px] coz-fg-dim leading-[16px]">
          {I18n.t('project_release_already_released_desc')}
        </div>
        {/* 社区版暂不支持该功能 */}
        {FLAGS['bot.studio.publish_management'] && !IS_OPEN_SOURCE ? (
          <div className="text-[12px] coz-fg-dim leading-[16px]">
            {I18n.t('release_management_detail1', {
              button: (
                <NavLink
                  className={classNames(
                    'no-underline',
                    ready || !inited
                      ? 'coz-fg-hglt'
                      : 'coz-fg-secondary cursor-not-allowed',
                  )}
                  onClick={e => {
                    if (!ready) {
                      e.preventDefault();
                    }
                  }}
                  to={`/space/${spaceId}/publish/app/${projectId}`}
                >
                  {I18n.t('release_management')}
                  {ready || !inited
                    ? null
                    : `(${I18n.t('release_management_generating')})`}
                </NavLink>
              ),
            })}
          </div>
        ) : null}
      </div>

      <div className="rounded-[12px] w-[480px] coz-stroke-primary coz-bg-max border border-solid px-[24px] pt-[16px] m-auto mb-[48px]">
        <ProjectPublishProgress record={publishRecordDetail} />
      </div>
    </div>
  );
};
