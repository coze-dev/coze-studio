import React, { type CSSProperties } from 'react';

import type { RenderLeafProps } from 'slate-react';

import { ExpressionEditorSignal } from '../../constant';

const LeafStyle: Partial<Record<ExpressionEditorSignal, CSSProperties>> = {
  [ExpressionEditorSignal.Valid]: {
    color: '#6675D9',
  },
  [ExpressionEditorSignal.Invalid]: {
    color: 'inherit',
  },
  [ExpressionEditorSignal.SelectedValid]: {
    color: '#6675D9',
    borderRadius: 2,
    backgroundColor:
      'var(--light-usage-fill-color-fill-1, rgba(46, 46, 56, 0.08))',
  },
  [ExpressionEditorSignal.SelectedInvalid]: {
    color: 'inherit',
    borderRadius: 2,
    backgroundColor:
      'var(--light-usage-fill-color-fill-1, rgba(46, 46, 56, 0.08))',
  },
};

export const ExpressionEditorLeaf = (props: RenderLeafProps) => {
  const { type } = props.leaf as {
    type?: ExpressionEditorSignal;
  };
  return (
    <span style={type && LeafStyle[type]} {...props.attributes}>
      {props.children}
    </span>
  );
};
