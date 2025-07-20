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
 
import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig(
  {
    dirname: __dirname,
    preset: 'web',
    plugins: [
      {
        name: 'edenx-virtual-modules',
        enforce: 'pre',
      },
    ],
    test: {
      setupFiles: ['./setup'],
      includeSource: ['./src'],
      coverage: {
        all: true,
        include: ['src'],
        exclude: [
          'src/**/*.tsx',
          'src/index.tsx',
          'src/global.d.ts',
          'src/typings.d.ts',
          'src/components/**',
          'src/pages/**',
          'src/constants/**',
          'src/utils/public-private-keys.ts', // window 提供的 api
          'src/utils/docs.ts', // 线上未使用 仅 boe使用 即将删除
          'src/utils/time.ts', // dayjs api 的调用
          'src/utils//analytics/index.ts',
          'src/utils//analytics/chart.ts', // 有图表 dom 相关内容
          'src/hooks/pat/action/**', // 操作类 hook
          'src/hooks/oauth-app/action/**', // 操作类 hook
          'src/hooks/use-arcosite.ts', // 线上未使用 仅 boe使用
          'src/hooks/use-show-mask.ts', // 主要为获取 dom 的 scrollTop
          'src/hooks/use-docs-path.ts', // useNavigate 相关内容
        ],
      },
    },
  },
  {
    fixSemi: true,
  },
);
