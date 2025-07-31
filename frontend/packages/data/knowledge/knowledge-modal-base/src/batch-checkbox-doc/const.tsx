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

import {
  IconCozDicumentOnline,
  IconCozDocument,
  IconCozGoogleDriveFill,
  IconCozLarkFill,
  IconCozNotionFill,
  IconCozPencilPaper,
  IconCozWechatFill,
} from '@coze-arch/coze-design/icons';
import { DocumentSource } from '@coze-arch/bot-api/knowledge';

type TDocumentSource = {
  [key in DocumentSource]: JSX.Element | string;
};

export const ICON_MAP: TDocumentSource = {
  [DocumentSource.Document]: (
    <IconCozDocument className="text-[16px] mr-[8px]" />
  ),
  [DocumentSource.Web]: (
    <IconCozDicumentOnline className="text-[16px] mr-[8px]" />
  ),
  [DocumentSource.FrontCrawl]: (
    <IconCozDicumentOnline className="text-[16px]" />
  ),
  [DocumentSource.Notion]: (
    <IconCozNotionFill className="text-[16px] mr-[8px]" />
  ),
  [DocumentSource.FeishuWeb]: (
    <IconCozLarkFill className="text-[16px] mr-[8px]" />
  ),
  [DocumentSource.GoogleDrive]: (
    <IconCozGoogleDriveFill className="text-[16px] mr-[8px]" />
  ),
  [DocumentSource.OpenApi]: (
    <IconCozPencilPaper className="text-[16px] mr-[8px]" />
  ),
  [DocumentSource.Custom]: (
    <IconCozPencilPaper className="text-[16px] mr-[8px]" />
  ),
  [DocumentSource.ThirdParty]: '',
  [DocumentSource.LarkWeb]: (
    <IconCozLarkFill className="text-[16px] mr-[8px]" />
  ),
  [DocumentSource.WeChat]: (
    <IconCozWechatFill className="text-[16px] mr-[8px]" />
  ),
};
