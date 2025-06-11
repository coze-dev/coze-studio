import { getUploadCDNAsset } from '@coze-workflow/base-adapter';

import { fonts, fontSvg, fontFamilyFilter } from '../share';

const cdnPrefix = `${getUploadCDNAsset('')}/fonts`;

export const supportFonts = fonts.map(fontFamilyFilter);

export const getFontUrl = (name: string) => {
  if (supportFonts.includes(name)) {
    const fontFullName = fonts.find(d => fontFamilyFilter(d) === name);
    return `${cdnPrefix}/image-canvas-fonts/${fontFullName}`;
  }
};

const fontsFormat: {
  value: string;
  label: React.ReactNode;
  order: number;
  name: string;
  groupName: string;
  children?: {
    value: string;
    order: number;
    label: React.ReactNode;
    name: string;
    groupName: string;
  }[];
}[] = fontSvg.map(d => {
  const dArr = d.replace('.svg', '').split('-');
  const name = dArr[1];
  const group = dArr[2];

  return {
    // 原本的名称
    value: dArr[1],
    label: (
      <img
        alt={name}
        className="h-[12px]"
        src={`${cdnPrefix}/image-canvas-fonts-preview-svg/${d}`}
      />
    ),
    // 顺序
    order: Number(dArr[0]),
    // 一级分组名称
    name,
    // 属于哪个分组
    groupName: group,
  };
});

const groups = fontsFormat.filter(d => !d.groupName);
groups.forEach(group => {
  const children = fontsFormat.filter(d => d.groupName === group.name);
  group.children = children;
});

export const fontTreeData = groups.sort((a, b) => a.order - b.order);
