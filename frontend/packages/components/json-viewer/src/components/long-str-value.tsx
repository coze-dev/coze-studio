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

import { useMemo, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/bot-semi';

import { generateStrAvoidEscape } from '../utils/generate-str-avoid-escape';

export const MAX_LENGTH = 10000;

export const LongStrValue: React.FC<{ str: string }> = ({ str }) => {
  const [more, setMore] = useState(false);

  const echoStr = useMemo(() => {
    const current = more ? str : str.slice(0, MAX_LENGTH);
    return generateStrAvoidEscape(current);
  }, [str, more]);

  return (
    <>
      {echoStr}
      {!more && (
        <Typography.Text link onClick={() => setMore(true)}>
          {I18n.t('see_more')}
        </Typography.Text>
      )}
    </>
  );
};
