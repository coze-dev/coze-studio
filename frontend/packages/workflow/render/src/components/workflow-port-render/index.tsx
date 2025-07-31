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

import ReactDOM from 'react-dom';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import { useService } from '@flowgram-adapter/free-layout-editor';
import {
  usePlaygroundReadonlyState,
  WorkflowDragService,
  WorkflowHoverService,
  WorkflowLinesManager,
  type WorkflowPortEntity,
} from '@flowgram-adapter/free-layout-editor';
import { Tooltip } from '@coze-arch/coze-design';

import { PORT_BG_CLASS_NAME } from '../../constants/points';
import { Warning } from './warning';
import CrossHair from './cross-hair';

import styles from './index.module.less';

export interface WorkflowPortRenderProps {
  entity: WorkflowPortEntity;
  onClick?: (event: React.MouseEvent, port: WorkflowPortEntity) => void;
}

export const WorkflowPortRender: React.FC<WorkflowPortRenderProps> =
  React.memo<WorkflowPortRenderProps>(props => {
    const dragService = useService<WorkflowDragService>(WorkflowDragService);
    const hoverService = useService<WorkflowHoverService>(WorkflowHoverService);
    const linesManager = useService<WorkflowLinesManager>(WorkflowLinesManager);
    const { entity, onClick } = props;
    const { portType, portID, relativePosition, disabled, errorMessage } =
      entity as WorkflowPortEntity & {
        errorMessage?: string;
      };

    const [targetElement, setTargetElement] = useState(entity.targetElement);
    const [posX, updatePosX] = useState(relativePosition.x);
    const [posY, updatePosY] = useState(relativePosition.y);
    const [hovered, setHovered] = useState(false);
    const [linked, setLinked] = useState(Boolean(entity?.lines?.length));
    const [hasError, setHasError] = useState(props.entity.hasError);
    const readonly = usePlaygroundReadonlyState();

    const onMouseDown = useCallback(
      (e: React.MouseEvent) => {
        const isMouseCenterButton = e.button === 1;
        if (portType === 'input' || disabled || isMouseCenterButton) {
          return;
        }
        e.stopPropagation();
        e.preventDefault();
        dragService.startDrawingLine(entity, e);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps -- custom
      [dragService, portType, portID],
    );

    useEffect(() => {
      // useEffect timing issue may cause port.hasError to be not up-to-date, and validate needs to be triggered again
      props.entity.validate();
      setHasError(props.entity.hasError);
      const dispose = props.entity.onEntityChange(() => {
        // If there are mounted nodes, there is no need to update the location information
        if (entity.targetElement) {
          if (entity.targetElement !== targetElement) {
            setTargetElement(entity.targetElement);
          }
          return;
        }
        const newPos = props.entity.relativePosition;
        // Add round to avoid point jitter
        updatePosX(Math.round(newPos.x));
        updatePosY(Math.round(newPos.y));
      });
      const dispose2 = hoverService.onHoveredChange(id => {
        setHovered(hoverService.isHovered(entity.id));
      });
      const dispose3 = props.entity.onErrorChanged(() => {
        setHasError(props.entity.hasError);
      });
      const dispose4 = linesManager.onAvailableLinesChange(() => {
        setTimeout(() => {
          setLinked(Boolean(entity?.lines?.length));
        }, 0);
      });
      return () => {
        dispose.dispose();
        dispose2.dispose();
        dispose3.dispose();
        dispose4.dispose();
      };
    }, [props.entity, hoverService, entity, targetElement, linesManager]);

    // Monitor changes
    const className = classNames(styles.workflowPoint, {
      [styles.hovered]:
        !readonly && hovered && !disabled && portType !== 'input',
      // Dark blue dots when there are line links.
      [styles.linked]: linked,
    });

    const icon = useMemo(() => {
      const iconComp = (
        <div
          className={classNames({
            [styles.bg]: true,
            [PORT_BG_CLASS_NAME]: true,
            'workflow-point-bg': true,
            [styles.hasError]: hasError,
          })}
        >
          {hasError ? <Warning /> : <CrossHair />}
        </div>
      );
      if (hasError && errorMessage) {
        return (
          <Tooltip
            className={styles.tooltip}
            content={errorMessage}
            trigger="hover"
            position="top"
          >
            {iconComp}
          </Tooltip>
        );
      }
      return iconComp;
    }, [hasError, errorMessage]);

    const content = (
      <div
        className={className}
        style={targetElement ? undefined : { left: posX, top: posY }}
        onClick={e => onClick?.(e, entity)}
        onMouseDown={onMouseDown}
        data-port-entity-id={entity.id}
        data-testid="bot-edit-multi-agent-flow-node-add-button"
      >
        <div
          className={classNames(styles.bgCircle, 'workflow-bg-circle')}
        ></div>
        {icon}
        <div className={styles['focus-circle']} />
      </div>
    );
    if (targetElement) {
      return ReactDOM.createPortal(content, targetElement);
    }
    return content;
  });
