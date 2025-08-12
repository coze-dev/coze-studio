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

import { useMemo } from 'react';

import { createMinimapPlugin } from '@flowgram-adapter/free-layout-editor';
import {
  ConstantKeys,
  type FixedLayoutProps,
  FlowRendererKey,
} from '@flowgram-adapter/fixed-layout-editor';

import { CustomLinesManager, TreeService } from '../services';
import { createCustomLinesPlugin } from '../plugins';
import { Split } from '../node-registries';
import { BaseNode, Collapse } from '../components';

export const useEditorProps = (data?: any, json?: any) =>
  useMemo<FixedLayoutProps>(
    () => ({
      background: true,
      readonly: false,
      initialData: data as any,
      onDispose() {
        console.log('---- Playground Dispose ----');
      },
      nodeRegistries: [Split],
      constants: {
        [ConstantKeys.BASE_ACTIVATED_COLOR]: '#5147ff',
        [ConstantKeys.INLINE_BLOCKS_PADDING_TOP]: 44,
        [ConstantKeys.NODE_SPACING]: 64,
      },
      materials: {
        renderNodes: {
          [FlowRendererKey.ADDER]: () => null,
          [FlowRendererKey.COLLAPSE]: Collapse,
          [FlowRendererKey.BRANCH_ADDER]: () => null,
          [FlowRendererKey.DRAG_NODE]: () => null,
        },
        renderDefaultNode: BaseNode, // Node rendering
      },
      onReady(ctx) {
        const treeService = ctx.get<TreeService>(TreeService);
        treeService.transformSchema(json);
        treeService.treeToFlowNodeJson();
        // Forced resizing takes effect
        setTimeout(() => {
          ctx.playground.resize();
        }, 100);
      },
      onAllLayersRendered(ctx) {
        const linesManager = ctx.get<CustomLinesManager>(CustomLinesManager);
        linesManager.initLines();
      },
      plugins: () => [
        /**
         * Custom Line Plugin
         */
        createCustomLinesPlugin({}),
        /**
         * Minimap plugin
         * Thumbnail plugin
         */
        createMinimapPlugin({
          disableLayer: true,
          enableDisplayAllNodes: true,
          canvasStyle: {
            canvasWidth: 182,
            canvasHeight: 102,
            canvasPadding: 50,
            canvasBackground: 'rgba(245, 245, 245, 1)',
            canvasBorderRadius: 10,
            viewportBackground: 'rgba(235, 235, 235, 1)',
            viewportBorderRadius: 4,
            viewportBorderColor: 'rgba(201, 201, 201, 1)',
            viewportBorderWidth: 1,
            viewportBorderDashLength: 2,
            nodeColor: 'rgba(255, 255, 255, 1)',
            nodeBorderRadius: 2,
            nodeBorderWidth: 0.145,
            nodeBorderColor: 'rgba(6, 7, 9, 0.10)',
            overlayColor: 'rgba(255, 255, 255, 0)',
          },
          inactiveDebounceTime: 1,
        }),
      ],
    }),
    [],
  );
