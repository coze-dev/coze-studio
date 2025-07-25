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
 
import { CommentEditorBlockFormat } from '../../constant';

export const Block = ({ attributes, children, element }) => {
  const style = {
    textAlign: element.align,
    color: 'var(--coz-fg-primary, rgba(6, 7, 9, 0.80))',
  };
  // 根据元素类型选择对应的 HTML 标签
  switch (element.type) {
    case CommentEditorBlockFormat.Paragraph:
      // 渲染段落
      return (
        <p className="text-[12px] m-0 p-0" style={style} {...attributes}>
          {children}
        </p>
      );
    case CommentEditorBlockFormat.Blockquote:
      // 渲染引用块
      return (
        <blockquote
          className="border-l-[3px] border-t-0 border-b-0 border-r-0 border-solid border-[#ced0d4] m-0 p-0 pl-[8px] ml-[8px] text-[12px]"
          style={{
            ...style,
            color: 'var(--coz-fg-secondary, rgba(32, 41, 69, 0.62))',
          }}
          {...attributes}
        >
          {children}
        </blockquote>
      );
    case CommentEditorBlockFormat.HeadingOne:
      // 渲染一级标题
      return (
        <h1
          className="text-[18px] mx-0 my-[6px] p-0 font-[600]"
          style={style}
          {...attributes}
        >
          {children}
        </h1>
      );
    case CommentEditorBlockFormat.HeadingTwo:
      // 渲染二级标题
      return (
        <h2
          className="text-[16px] mx-0 my-[6px] p-0 font-[600]"
          style={style}
          {...attributes}
        >
          {children}
        </h2>
      );
    case CommentEditorBlockFormat.HeadingThree:
      // 渲染三级标题
      return (
        <h3
          className="text-[14px] mx-0 my-[6px] p-0 font-[600]"
          style={style}
          {...attributes}
        >
          {children}
        </h3>
      );
    case CommentEditorBlockFormat.BulletedList:
      // 渲染无序列表
      return (
        <ul
          className="text-[12px] m-0 p-0 pl-[16px] font-[400]"
          style={style}
          {...attributes}
        >
          {children}
        </ul>
      );
    case CommentEditorBlockFormat.NumberedList:
      // 渲染有序列表
      return (
        <ol
          className="text-[12px] m-0 p-0 pl-[16px]"
          style={style}
          {...attributes}
        >
          {children}
        </ol>
      );
    case CommentEditorBlockFormat.ListItem:
      // 渲染列表项
      return (
        <li className="text-[12px] m-0 p-0" style={style} {...attributes}>
          {children}
        </li>
      );
    default:
      // 默认渲染为段落
      return (
        <p className="text-[12px] m-0 p-0" style={style} {...attributes}>
          {children}
        </p>
      );
  }
};
