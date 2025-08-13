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

import React, { type FC, type PropsWithChildren } from 'react';

import { ErrorBoundary as FlowErrorBoundary } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/bot-semi';

import { studioOpenClientReporter } from '@/helper';

const { Title, Text } = Typography;

const FallbackComponent: FC = () => (
  <div>
    <Title>{I18n.t('404_title')}</Title>
    <Text>{I18n.t('404_content')}</Text>
  </div>
);

export const ErrorBoundary: FC<PropsWithChildren> = ({ children }) => (
  <FlowErrorBoundary
    errorBoundaryName="ErrorBoundary"
    logger={studioOpenClientReporter.getLogger()}
    FallbackComponent={FallbackComponent}
  >
    {children}
  </FlowErrorBoundary>
);
