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

/// <reference types='./data_item' />
/// <reference types='./navigator' />
/// <reference types='./window' />
/// <reference types='@coze-arch/bot-env/typings' />

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.less' {
  const resource: { [key: string]: string };
  export = resource;
}
declare module '*.css' {
  const resource: { [key: string]: string };
  export = resource;
}

declare module '*.svg' {
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;

  /**
   * The default export type depends on the svgDefaultExport config,
   * it can be a string or a ReactComponent
   * */
  const content: any;
  export default content;
}
