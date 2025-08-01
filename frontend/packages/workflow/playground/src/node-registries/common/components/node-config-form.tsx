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

import { type PropsWithChildren } from 'react';

import { PublicScopeProvider } from '@coze-workflow/variable';
import { useIsSettingOnError } from '@coze-workflow/nodes';

import { useGlobalState } from '@/hooks';
import { Form } from '@/form';

import { SettingOnError } from '../fields';
import { Header } from './header';

type NodeConfigFormProps = PropsWithChildren<{
  extraOperation?: React.ReactNode;
  batchModePath?: string;
  nodeDisabled?: boolean;
  readonlyAllowDeleteOperation?: boolean;
}>;

/**
 * NodeConfigForm component
 * Used to display node configuration forms
 * @Param children - child component for rendering form content
 */
export function NodeConfigForm({
  children,
  extraOperation,
  batchModePath,
  nodeDisabled,
  readonlyAllowDeleteOperation,
}: NodeConfigFormProps) {
  const { readonly } = useGlobalState();
  const isSettingOnError = useIsSettingOnError();

  return (
    <>
      <Header
        extraOperation={extraOperation}
        nodeDisabled={nodeDisabled}
        readonlyAllowDeleteOperation={readonlyAllowDeleteOperation}
      />
      <PublicScopeProvider>
        <Form readonly={readonly}>
          {children}
          {isSettingOnError ? (
            <SettingOnError batchModePath={batchModePath} />
          ) : null}
        </Form>
      </PublicScopeProvider>
    </>
  );
}
