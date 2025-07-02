import {
  PromptReferenceType,
  type PromptReferenceInfo,
} from '@coze-arch/idl/playground_api';

export type LibraryType =
  | 'plugin'
  | 'workflow'
  | 'imageflow'
  | 'table'
  | 'text'
  | 'image';

export interface ILibraryItems {
  type: LibraryType;
  items: ILibraryItem[];
}

export type ILibraryList = ILibraryItems[];

export type ILibraryItem = PromptReferenceInfo & {
  type: LibraryType;
  id: string;
  icon_url: string;
  name: string;
  desc: string;
};

export const getReferenceType = (type: LibraryType): PromptReferenceType => {
  switch (type) {
    case 'plugin':
      return PromptReferenceType.Plugin;
    case 'workflow':
      return PromptReferenceType.Workflow;
    case 'imageflow':
      return PromptReferenceType.ImageFlow;
    case 'text':
      return PromptReferenceType.Knowledge;
    case 'image':
      return PromptReferenceType.Knowledge;
    case 'table':
      return PromptReferenceType.Knowledge;
    default:
      return PromptReferenceType.Plugin;
  }
};
export interface LibraryBlockInfo {
  [key: string]: string | undefined;
  icon: string;
  type: LibraryType;
  id: string;
  uuid: string;
  apiId?: string;
}
