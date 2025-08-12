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

import { type CSSProperties, useRef, useState } from 'react';

import { cloneDeep } from 'lodash-es';
import { Button, type ButtonProps, type FormApi } from '@coze-arch/coze-design';

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
