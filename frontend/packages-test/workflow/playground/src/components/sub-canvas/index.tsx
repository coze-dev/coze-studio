import type { FC } from 'react';

import type { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import {
  SubCanvasBackground,
  SubCanvasTips,
  SubCanvasHeader,
  SubCanvasPorts,
  SubCanvasBorder,
  SubCanvasContainer,
} from './components';

export const SubCanvasRender: FC<{
  node: WorkflowNodeEntity;
}> = props => (
  <SubCanvasContainer>
    <SubCanvasBorder />
    <SubCanvasBackground />
    <SubCanvasTips />
    <SubCanvasHeader />
    <SubCanvasPorts />
  </SubCanvasContainer>
);
