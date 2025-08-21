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

import Image from '@tiptap/extension-image';

// Extend TipTap Image to support a custom data-tos-key HTML attribute
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageWithTosKey: {
      setImageWithTosKey: (options: {
        src: string;
        alt?: string;
        title?: string;
        dataTosKey?: string | null;
      }) => ReturnType;
    };
  }
}

const ImageWithTosKey = Image.extend({
  addAttributes() {
    const parentAttributes = (this.parent?.() as Record<string, unknown>) || {};
    return {
      ...parentAttributes,
      dataTosKey: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-tos-key'),
        renderHTML: (attributes: { dataTosKey?: string | null }) => {
          if (!attributes.dataTosKey) {
            return {};
          }
          return { 'data-tos-key': attributes.dataTosKey };
        },
      },
    };
  },

  addCommands() {
    return {
      setImageWithTosKey:
        (options: {
          src: string;
          alt?: string;
          title?: string;
          dataTosKey?: string | null;
        }) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              alt: options.alt,
              title: options.title,
              dataTosKey: options.dataTosKey ?? null,
            },
          }),
    };
  },
});

export default ImageWithTosKey;
