import React from 'react';

// import { domUtils } from '@flowgram-adapter/common';
import { type FlowSelectorBoundsLayerOptions } from '@flowgram-adapter/free-layout-editor';
import { SelectionService, useService } from '@flowgram-adapter/free-layout-editor';

import { getSelectionBounds } from '../../utils/selection-utils';

import styles from './index.module.less';

/**
 * 选择框
 * @param props
 * @constructor
 */
export const SelectorBounds: React.FC<
  FlowSelectorBoundsLayerOptions
> = props => {
  const selectService = useService<SelectionService>(SelectionService);
  const bounds = getSelectionBounds(selectService, true);
  if (bounds.width === 0 || bounds.height === 0) {
    // domUtils.setStyle(domNode, {
    //   display: 'none',
    // });
    return <></>;
  }
  const style = {
    display: 'block',
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
  };
  // domUtils.setStyle(domNode, style);
  return <div className={styles.selectorBoundsForground} style={style} />;
};
