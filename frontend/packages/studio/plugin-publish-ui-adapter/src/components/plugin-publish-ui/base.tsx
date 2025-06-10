import { type CSSProperties, useRef, useState } from 'react';

import { cloneDeep } from 'lodash-es';
import {
  Button,
  type ButtonProps,
  type FormApi,
} from '@coze/coze-design';

import {
  VersionDescForm,
  type VersionDescFormValue,
} from './version-description-form';

const getIsSubmitDisabled = (values: VersionDescFormValue | undefined) =>
  !values || !values.version_desc?.trim() || !values.version_name?.trim();

export interface PublishCallbackParams {
  versionDescValue: VersionDescFormValue;
}

export interface PluginPublishUIProps {
  onClickPublish: (params: PublishCallbackParams) => void;
  className?: string;
  style?: CSSProperties;
  publishButtonProps?: Omit<ButtonProps, 'className' | 'disabled' | 'onClick'>;
  initialVersionName: string | undefined;
}

export const PluginPublishUI: React.FC<PluginPublishUIProps> = ({
  onClickPublish,
  className,
  style,
  publishButtonProps,
  initialVersionName,
}) => {
  const versionDescFormApi = useRef<FormApi<VersionDescFormValue>>();
  const [versionFormValues, setVersionFormValues] =
    useState<VersionDescFormValue>();

  return (
    <div className={className} style={style}>
      <VersionDescForm
        onValueChange={values => {
          setVersionFormValues(cloneDeep(values));
        }}
        getFormApi={api => {
          versionDescFormApi.current = api;
        }}
        initValues={{
          version_name: initialVersionName,
        }}
      />
      <Button
        className="w-full mt-16px"
        disabled={getIsSubmitDisabled(versionFormValues)}
        onClick={() => {
          const versionValues = versionDescFormApi.current?.getValues();
          if (!versionValues) {
            return;
          }

          onClickPublish({
            versionDescValue: versionValues,
          });
        }}
        {...publishButtonProps}
      >
        发布
      </Button>
    </div>
  );
};
