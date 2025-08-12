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

import React from 'react';

import classNames from 'classnames';
import {
  IconCozArrowDown,
  IconCozArrowRight,
} from '@coze-arch/coze-design/icons';

import { getLineShowResult } from './utils';
import { type LineData, LineShowResult } from './types';

import styles from './index.module.less';

interface IconComponentProps {
  className?: string;
  style?: React.CSSProperties;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export function Triangle({
  className,
  style,
  collapsed,
  onCollapse,
}: IconComponentProps) {
  if (collapsed) {
    return (
      <IconCozArrowDown
        className={classNames(styles.triangle, className)}
        style={style}
        onClick={() => onCollapse?.(false)}
      />
    );
  } else {
    return (
      <IconCozArrowRight
        className={classNames(styles.triangle, className)}
        style={style}
        onClick={() => onCollapse?.(true)}
      />
    );
  }
}

export function EmptyBlock({ className, style }: IconComponentProps) {
  return (
    <div className={classNames(styles.emptyBlock, className)} style={style} />
  );
}

export function HelpLineBlock({ className, style }: IconComponentProps) {
  return (
    <div className={classNames(styles.helpLineBlock, className)} style={style}>
      <div className={styles.line} />
    </div>
  );
}

export function HalfTopRoot({
  className,
  style,
  collapsed,
  onCollapse,
}: IconComponentProps) {
  return (
    <div className={classNames(styles.halfTopRoot, className)} style={style}>
      <div className={styles.line} />
      <Triangle
        className={styles.triangle}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    </div>
  );
}

export function HalfTopRootWithChildren({
  className,
  style,
  collapsed,
  onCollapse,
}: IconComponentProps) {
  return (
    <HalfTopRoot
      className={classNames(styles.children, className)}
      style={style}
      collapsed={collapsed}
      onCollapse={onCollapse}
    />
  );
}

export function HalfBottomRoot({
  className,
  style,
  collapsed,
  onCollapse,
}: IconComponentProps) {
  return (
    <div className={classNames(styles.halfBottomRoot, className)} style={style}>
      <div className={styles.line} />
      <Triangle
        className={styles.triangle}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    </div>
  );
}

export function HalfBottomRootWithChildren({
  className,
  style,
  collapsed,
  onCollapse,
}: IconComponentProps) {
  return (
    <HalfBottomRoot
      className={classNames(styles.children, className)}
      style={style}
      collapsed={collapsed}
      onCollapse={onCollapse}
    />
  );
}

export function FullRoot({
  className,
  style,
  collapsed,
  onCollapse,
}: IconComponentProps) {
  return (
    <div className={classNames(styles.fullRoot, className)} style={style}>
      <div className={styles.topLine} />
      <div className={styles.bottomLine} />
      <Triangle
        className={styles.triangle}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    </div>
  );
}

export function FullRootWithChildren({
  className,
  style,
  collapsed,
  onCollapse,
}: IconComponentProps) {
  return (
    <FullRoot
      className={classNames(styles.children, className)}
      style={style}
      collapsed={collapsed}
      onCollapse={onCollapse}
    />
  );
}

export function HalfTopChild({
  className,
  style,
  collapsed,
  onCollapse,
}: IconComponentProps) {
  return (
    <div className={classNames(styles.halfTopChild, className)} style={style}>
      <div className={styles.line} />
      <Triangle
        className={styles.triangle}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    </div>
  );
}

export function HalfTopChildWithChildren({
  className,
  style,
  collapsed,
  onCollapse,
}: IconComponentProps) {
  return (
    <div
      className={classNames(styles.halfTopChild, styles.children, className)}
      style={style}
    >
      <div className={styles.topLine} />
      <Triangle
        className={styles.triangle}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    </div>
  );
}

export function FullChild({
  className,
  style,
  collapsed,
  onCollapse,
}: IconComponentProps) {
  return (
    <div className={classNames(styles.fullChild, className)} style={style}>
      <div className={styles.line} />
      <div className={styles.bottomLine} />
      <Triangle
        className={styles.triangle}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    </div>
  );
}

export function FullChildWithChildren({
  className,
  style,
  collapsed,
  onCollapse,
}: IconComponentProps) {
  return (
    <FullChild
      className={classNames(styles.children, className)}
      style={style}
      collapsed={collapsed}
      onCollapse={onCollapse}
    />
  );
}

export function RootWithChildren({
  className,
  style,
  collapsed,
  onCollapse,
}: IconComponentProps) {
  return (
    <div
      className={classNames(styles.rootWithChildren, className)}
      style={style}
    >
      <Triangle
        className={styles.triangle}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    </div>
  );
}

interface LevelLineProps {
  level: number;
  data: LineData;
  className?: string;
  style?: React.CSSProperties;
  multiInfo?: {
    multiline: boolean;
    withNameError?: boolean;
  };
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  couldCollapse?: boolean;
  /** Expand whether the content is visible, and render expand-line when visible */
  expandContentVisible?: boolean;
  readonly?: boolean;
  treeIndentWidth?: number;
}

// eslint-disable-next-line complexity
export function LevelLine({
  level,
  data,
  className,
  style,
  collapsed = true,
  onCollapse,
  multiInfo = { multiline: false },
  couldCollapse,
  expandContentVisible,
  readonly,
  treeIndentWidth = 15,
}: LevelLineProps) {
  // getLineShowResult returns data, no root drawing is involved for the time being
  const lineShowResult = getLineShowResult({ level, data });
  const showMap: Record<LineShowResult, React.ReactNode> = {
    [LineShowResult.HalfTopRoot]: (
      <HalfTopRoot
        className={className}
        style={style}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    ),
    [LineShowResult.HalfTopRootWithChildren]: (
      <HalfTopRootWithChildren
        className={className}
        style={style}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    ),
    [LineShowResult.HalfBottomRoot]: (
      <HalfBottomRoot
        className={className}
        style={style}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    ),
    [LineShowResult.HalfBottomRootWithChildren]: (
      <HalfBottomRootWithChildren
        className={className}
        style={style}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    ),
    [LineShowResult.FullRoot]: (
      <FullRoot
        className={className}
        style={style}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    ),
    [LineShowResult.FullRootWithChildren]: (
      <FullRootWithChildren
        className={className}
        style={style}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    ),
    // In the output tree, there is no root drawing involved for the time being
    [LineShowResult.HalfTopChild]: (
      <HalfTopChild
        className={classNames(
          multiInfo?.multiline ? styles.multiline : null,
          multiInfo?.withNameError ? styles['with-name-error'] : null,
          className,
        )}
        style={style}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    ),
    [LineShowResult.HalfTopChildWithChildren]: (
      <HalfTopChildWithChildren
        className={classNames(
          multiInfo?.multiline ? styles.multiline : null,
          multiInfo?.withNameError ? styles['with-name-error'] : null,
          className,
        )}
        style={style}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    ),
    [LineShowResult.FullChild]: (
      <FullChild
        className={classNames(
          multiInfo?.multiline ? styles.multiline : null,
          multiInfo?.withNameError ? styles['with-name-error'] : null,
          className,
        )}
        style={style}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    ),
    [LineShowResult.FullChildWithChildren]: (
      <FullChildWithChildren
        className={classNames(
          multiInfo?.multiline ? styles.multiline : null,
          multiInfo?.withNameError ? styles['with-name-error'] : null,
          className,
        )}
        style={style}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    ),
    [LineShowResult.EmptyBlock]: (
      <EmptyBlock
        className={className}
        style={style}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    ),
    [LineShowResult.HelpLineBlock]: (
      <HelpLineBlock
        className={className}
        style={style}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    ),
    [LineShowResult.RootWithChildren]: (
      <RootWithChildren
        className={className}
        style={style}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    ),
  };

  {
    /* Default 20 width, 20 more length for each additional level */
  }
  return (
    <div
      style={{ width: couldCollapse ? level * treeIndentWidth : 0 }}
      className={classNames(
        className,
        styles['level-line'],
        readonly ? styles.readonly : '',
        couldCollapse ? styles['could-collapse'] : '',
      )}
    >
      {lineShowResult.map((item, index) => (
        <React.Fragment key={index}>{showMap[item]}</React.Fragment>
      ))}
      {expandContentVisible &&
      lineShowResult?.length &&
      data.children?.length &&
      // The collapsed state is written upside down. What is actually represented here is that the collapsed state does not render this div.
      collapsed ? (
        <div
          className={styles['expand-line']}
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          style={{ transform: `translateX(${level * 15}px)` }}
        ></div>
      ) : null}
    </div>
  );
}
