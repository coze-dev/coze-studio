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
