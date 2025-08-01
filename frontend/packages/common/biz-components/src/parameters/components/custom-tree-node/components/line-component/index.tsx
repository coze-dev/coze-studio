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

import { LineShowResult, getLineShowResult } from '@/parameters/utils/utils';

import { type TreeNodeCustomData } from '../../type';

import styles from './index.module.less';

interface IconComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Dot({ className, style }: IconComponentProps) {
  return <div className={classNames(styles.dot, className)} style={style} />;
}

export function EmptyBlock({ className, style }: IconComponentProps) {
  return (
    <div
      className={classNames(styles['empty-block'], className)}
      style={style}
    />
  );
}

export function HelpLineBlock({ className, style }: IconComponentProps) {
  return (
    <div
      className={classNames(styles['help-line-block'], className)}
      style={style}
    >
      <div className={styles.line} />
    </div>
  );
}

export function HalfTopRoot({ className, style }: IconComponentProps) {
  return (
    <div
      className={classNames(styles['half-top-root'], className)}
      style={style}
    >
      <div className={styles.line} />
      <Dot className={styles.dot} />
    </div>
  );
}

export function HalfTopRootWithChildren({
  className,
  style,
}: IconComponentProps) {
  return (
    <HalfTopRoot
      className={classNames(styles.children, className)}
      style={style}
    />
  );
}

export function HalfBottomRoot({ className, style }: IconComponentProps) {
  return (
    <div
      className={classNames(styles['half-bottom-root'], className)}
      style={style}
    >
      <div className={styles.line} />
      <Dot className={styles.dot} />
    </div>
  );
}

export function HalfBottomRootWithChildren({
  className,
  style,
}: IconComponentProps) {
  return (
    <HalfBottomRoot
      className={classNames(styles.children, className)}
      style={style}
    />
  );
}

export function FullRoot({ className, style }: IconComponentProps) {
  return (
    <div className={classNames(styles['full-root'], className)} style={style}>
      <div className={styles['top-line']} />
      <div className={styles['bottom-line']} />
      <Dot className={styles.dot} />
    </div>
  );
}

export function FullRootWithChildren({ className, style }: IconComponentProps) {
  return (
    <FullRoot
      className={classNames(styles.children, className)}
      style={style}
    />
  );
}

export function HalfTopChild({ className, style }: IconComponentProps) {
  return (
    <div
      className={classNames(styles['half-top-child'], className)}
      style={style}
    >
      <div className={styles.line} />
      <Dot className={styles.dot} />
    </div>
  );
}

export function HalfTopChildWithChildren({
  className,
  style,
}: IconComponentProps) {
  return (
    <HalfTopChild
      className={classNames(styles.children, className)}
      style={style}
    />
  );
}

export function FullChild({ className, style }: IconComponentProps) {
  return (
    <div className={classNames(styles['full-child'], className)} style={style}>
      <div className={styles['top-line']} />
      <div className={styles['bottom-line']} />
      <Dot className={styles.dot} />
    </div>
  );
}

export function FullChildWithChildren({
  className,
  style,
}: IconComponentProps) {
  return (
    <FullChild
      className={classNames(styles.children, className)}
      style={style}
    />
  );
}

interface LevelLineProps {
  level: number;
  data: TreeNodeCustomData;
  className?: string;
  style?: React.CSSProperties;
  multiInfo?: {
    multiline: boolean;
    withNameError?: boolean;
  };
}

export default function LevelLine({
  level,
  data,
  className,
  style,
  multiInfo = { multiline: false },
}: LevelLineProps) {
  // getLineShowResult returns data, no root drawing is involved for the time being
  const lineShowResult = getLineShowResult({ level, data });
  const showMap: Record<LineShowResult, React.ReactNode> = {
    [LineShowResult.HalfTopRoot]: (
      <HalfTopRoot className={className} style={style} />
    ),
    [LineShowResult.HalfTopRootWithChildren]: (
      <HalfTopRootWithChildren className={className} style={style} />
    ),
    [LineShowResult.HalfBottomRoot]: (
      <HalfBottomRoot className={className} style={style} />
    ),
    [LineShowResult.HalfBottomRootWithChildren]: (
      <HalfBottomRootWithChildren className={className} style={style} />
    ),
    [LineShowResult.FullRoot]: <FullRoot className={className} style={style} />,
    [LineShowResult.FullRootWithChildren]: (
      <FullRootWithChildren className={className} style={style} />
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
      />
    ),
    [LineShowResult.EmptyBlock]: (
      <EmptyBlock className={className} style={style} />
    ),
    [LineShowResult.HelpLineBlock]: (
      <HelpLineBlock className={className} style={style} />
    ),
  };

  return (
    <>
      {lineShowResult.map((item, index) => (
        <React.Fragment key={index}>{showMap[item]}</React.Fragment>
      ))}
    </>
  );
}
