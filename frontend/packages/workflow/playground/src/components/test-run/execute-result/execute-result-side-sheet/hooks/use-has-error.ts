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

/* eslint-disable @coze-arch/no-deep-relative-import */
import { useExecStateEntity } from '../../../../../hooks';
import { useNodeErrorList } from './use-node-error-list';
import { useLineErrorList } from './use-line-error-list';

export const useHasError = (options?: { withWarning: boolean }) => {
  const { withWarning = true } = options ?? {};
  const { hasLineError } = useLineErrorList();
  const { nodeErrorList } = useNodeErrorList();
  let hasNodeError = nodeErrorList.length > 0;
  if (!withWarning) {
    hasNodeError =
      nodeErrorList.filter(error => error.errorLevel !== 'warning').length > 0;
  }

  const {
    config: { systemError },
  } = useExecStateEntity();

  return hasLineError || hasNodeError || !!systemError;
};
