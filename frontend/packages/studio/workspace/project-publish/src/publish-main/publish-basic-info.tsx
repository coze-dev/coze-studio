import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Form } from '@coze/coze-design';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { useParams } from 'react-router-dom';

import { CONNECTOR_TAB_BAR_Z_INDEX } from '../utils/constants';
import { useProjectPublishStore } from '../store';
import { checkVersionNum } from './utils/version-number-check';
import { FormVersionDescInput } from './components/version-desc-input';

export function PublishBasicInfo() {
  const { project_id = '' } = useParams<DynamicParams>();
  const {
    lastVersionNumber,
    versionNumber,
    versionDescription,
    setProjectPublishInfo,
  } = useProjectPublishStore(
    useShallow(state => ({
      lastVersionNumber: state.lastVersionNumber,
      versionNumber: state.versionNumber,
      versionDescription: state.versionDescription,
      setProjectPublishInfo: state.setProjectPublishInfo,
    })),
  );

  const inputBaseCls = '';

  return (
    <div className="flex flex-col	gap-[8px] w-full coz-bg-plus rounded-md p-24px">
      <div className="text-[20px] coz-fg-plus font-[500] leading-[28px]">
        {I18n.t('project_release_version_info')}
      </div>
      <div className="flex gap-x-12px">
        <Form.Input
          field="version_num"
          fieldClassName="!p-0 flex-[1]"
          label={
            <span className="text-14px font-medium">
              {I18n.t('builder_publish_version_label')}
            </span>
          }
          placeholder={
            lastVersionNumber
              ? I18n.t('project_release_example1', {
                  version: lastVersionNumber,
                })
              : I18n.t('project_release_example')
          }
          initValue={versionNumber}
          className="bg-transparent coz-stroke-plus"
          rules={[
            { required: true, message: I18n.t('project_release_example2') },
          ]}
          onChange={value => {
            setProjectPublishInfo({
              versionNumber: value,
            });
          }}
          validate={val => checkVersionNum(val, project_id)}
          trigger={'blur'}
          maxLength={20}
        />
        <FormVersionDescInput
          field="version_desc"
          fieldClassName="!p-0 !overflow-visible flex-[1]"
          label={
            <span className="text-14px font-medium">
              {I18n.t('builder_publish_changelog_label')}
            </span>
          }
          placeholder={I18n.t('builder_publish_changelog_placeholder')}
          initValue={versionDescription}
          maxLength={800}
          maxCount={800}
          wrapperClassName="relative overflow-visible"
          inputClassName={inputBaseCls}
          textAreaClassName={classNames(
            inputBaseCls,
            'absolute',
            'top-0',
            'left-0',
            '!coz-bg-max',
          )}
          // 比渠道 tab 高就可以, 避免遮挡
          textAreaStyle={{ zIndex: CONNECTOR_TAB_BAR_Z_INDEX + 1 }}
          onChange={value => {
            setProjectPublishInfo({
              versionDescription: value,
            });
          }}
        />
      </div>
    </div>
  );
}
