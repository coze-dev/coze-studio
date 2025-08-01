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

/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from 'react';

import { get } from 'lodash-es';
import classnames from 'classnames';
import {
  useEntityFromContext,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowNodeEntity,
  type WorkflowNodeMeta,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeData, type NodeData } from '@coze-workflow/nodes';
import {
  ENCAPSULATE_SHORTCUTS,
  EncapsulateService,
} from '@coze-workflow/feature-encapsulate';
import { StandardNodeType } from '@coze-workflow/base/types';
import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozMore,
  IconCozTrigger,
  IconCozWarningCircleFill,
} from '@coze-arch/coze-design/icons';
import {
  IconButton,
  Typography,
  Dropdown,
  Input,
  Tag,
  Divider,
} from '@coze-arch/coze-design';
import { PluginType } from '@coze-arch/bot-api/developer_api';

import { useNodeSideSheetStore } from '@/hooks/use-node-side-sheet-store';

import { ValidationErrorWrapper, useError } from '../validation';
import { WorkflowEditService } from '../../../services';
import {
  useNodeRenderData,
  useGlobalState,
  useNodeRenderScene,
} from '../../../hooks';
import { TestRunSingleNodeButton } from '../../../components/test-run/test-run-button/single-node';
import {
  ReferenceNodeOrigin,
  ReferenceNodeVersion,
} from '../../../components/reference-node-info';
import { NodeIcon } from '../../../components/node-icon';
import { getBgColor } from './utils/get-bg-color';
import { useMoveOut } from './use-move-out';
import { DescriptionDisplay } from './description-display';
import { Description } from './description';
import PluginMockSet from './components/PluginMockSet';
import { HelpLinkButton } from './components/help-link-button';
import { CloseButton } from './components/close-button';

import styles from './index.module.less';

interface NodeHeaderProps {
  title: string;
  subTitle?: string;
  description?: string;
  logo: string;
  readonly?: boolean;
  readonlyAllowDeleteOperation?: boolean;
  hideTest?: boolean;
  onTitleChange: (newTitle: string) => void;
  onDescriptionChange: (desc: string) => void;
  extraOperation: ReactNode;
  showCloseButton?: boolean;
  className?: string;
  showTrigger?: boolean;
  triggerIsOpen?: boolean;
  nodeDisabled?: boolean;
}

export const NodeHeader: React.FC<NodeHeaderProps> = ({
  title,
  description,
  readonly,
  readonlyAllowDeleteOperation,
  hideTest,
  onTitleChange,
  onDescriptionChange,
  extraOperation,
  showCloseButton = false,
  className = '',
  showTrigger,
  triggerIsOpen,
  nodeDisabled,
}) => {
  const titleInput = useRef<HTMLInputElement>(null);
  const [editableTitle, setEditableTitle] = useState(title);
  const [editable, setEditable] = useState(false);
  const editService = useService<WorkflowEditService>(WorkflowEditService);
  const encapsulateService = useService<EncapsulateService>(EncapsulateService);
  const node = useEntityFromContext<WorkflowNodeEntity>();
  const [menusVisible, setMenusVisible] = useState(true);

  const { canMoveOut, handleMoveOut, updateCanMoveOut } = useMoveOut({
    onHandle: () => {
      // Forced destruction of Dropdown menu
      setMenusVisible(false);
      requestAnimationFrame(() => {
        setMenusVisible(true);
      });
    },
  });

  const closeNodeSideSheet = useNodeSideSheetStore(
    state => state.closeNodeSideSheet,
  );

  const { expanded } = useNodeRenderData();

  const { getNodeTestId, concatTestId } = useNodeTestId();

  const meta = node.getNodeMeta<WorkflowNodeMeta>();

  const { canMockset } = useGlobalState(false);
  const { isNewNodeRender, isNodeSideSheet } = useNodeRenderScene();

  const showMockset = !isNewNodeRender && canMockset;

  useEffect(() => {
    setEditableTitle(title);
  }, [title]);

  /**
   * Delete Node
   */
  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    // Add a setTimtout, close the panel and then display the delete pop-up window.
    setTimeout(() => {
      editService.deleteNode(node, true);
      closeNodeSideSheet();
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    }, 10);
  };

  const handleCopy = (_, e: MouseEvent) => {
    e.stopPropagation();
    editService.copyNode(node);
  };

  const handleDecapsulate = (_, e: MouseEvent) => {
    e.stopPropagation();
    encapsulateService.decapsulate(node);
  };

  const handleEditState = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    setEditable(true);
    setTimeout(() => {
      titleInput.current?.focus();
    }, 0);
  }, []);

  const error = useError('title');

  const quitEditable = useCallback(
    e => {
      if (e.target !== titleInput?.current && !error) {
        setEditable(false);
        document.body.removeEventListener('click', quitEditable);
      }
    },
    [error],
  );

  useEffect(() => {
    if (editable) {
      document.body.addEventListener('click', quitEditable);
    }
    return () => {
      document.body.removeEventListener('click', quitEditable);
    };
  }, [editable, quitEditable]);

  const nodeDataEntity = node.getData<WorkflowNodeData>(WorkflowNodeData);
  const registry = node.getNodeRegistry();

  const nodeData = nodeDataEntity.getNodeData();

  const handleTitleChange = (newTitle: string) => {
    // const newTitle = event.target.value;
    setEditableTitle(newTitle);

    // Update the title to nodeDataEntity for easy consumption elsewhere
    nodeDataEntity.updateNodeData<keyof NodeData>({
      title: newTitle,
    });
  };

  // Do you need to render... more operations, non-read-only state, or show when there are additional operations
  const needShowOperations =
    (!readonly ||
      (readonly && readonlyAllowDeleteOperation) ||
      !!extraOperation) &&
    menusVisible;

  // Whether it is a terminal plug-in, the terminal plug-in displays a special tag.
  const isLocalPlugin =
    node.flowNodeType === StandardNodeType.Api &&
    get(nodeData, 'pluginType') === PluginType.LOCAL;

  return (
    <div
      className={classnames(
        'node-header',
        'coz-bg-plus !p-0',
        styles.container,
        {
          '!mb-0': !expanded,
          [className]: !!className,
          '!cursor-default mx-[-12px]': isNodeSideSheet,
          'cursor-move': !isNodeSideSheet,
          'rounded-[7px] overflow-hidden': isNewNodeRender,
        },
      )}
    >
      <div
        className={classnames('node-header-title', 'w-full', {
          '!cursor-default': isNodeSideSheet,
        })}
      >
        {nodeDisabled && isNodeSideSheet ? (
          <div
            className={'flex items-center p-8px'}
            style={{
              background:
                ' var(--coz-mg-hglt-yellow, rgba(255, 188, 133, 0.2))',
            }}
          >
            <IconCozWarningCircleFill
              style={{
                flexShrink: 0,
                fontSize: '24px',
                color: 'var(--coz-fg-hglt-yellow, rgba(255, 129, 26, 1))',
              }}
            />

            <span
              className={'ml-8px'}
              style={{
                fontSize: '14px',
                lineHeight: '20px',
                color: 'var(--coz-fg-primary, rgba(15, 21, 41, 0.82))',
              }}
            >
              {I18n.t('variable_node_offline_toast')}
            </span>
          </div>
        ) : null}

        <div
          className={classnames(
            'flex items-center w-full py-3 px-3 pb-[8px] pr-[10px]',
            {
              'cursor-move': !isNodeSideSheet,
            },
          )}
          style={{
            background: nodeData?.mainColor
              ? `linear-gradient(${getBgColor(
                  nodeData.mainColor,
                  0.08,
                )} 0%, var(--coz-bg-plus) 100%)`
              : 'var(--coz-bg-plus)',
          }}
        >
          <NodeIcon
            className={styles.logo}
            nodeId={node.id}
            size={24}
            alt="logo"
          />
          {
            <ValidationErrorWrapper
              path="title"
              className={styles['input-wrapper']}
            >
              {({ showError, onBlur, onChange }) => {
                const _readonly = readonly || !editable;

                return _readonly ? (
                  <div
                    className={styles['input-readonly']}
                    onDoubleClick={handleEditState}
                    data-testid={concatTestId(
                      getNodeTestId(),
                      'input',
                      'rename',
                      'readonly',
                    )}
                  >
                    <Typography.Paragraph
                      ellipsis={{
                        rows: 1,
                        showTooltip: {
                          type: 'tooltip',
                          opts: {
                            style: {
                              width: '100%',
                              wordBreak: 'break-word',
                            },
                          },
                        },
                      }}
                    >
                      {editableTitle}
                      {showTrigger ? (
                        <span className="h-full inline-flex flex-row items-center">
                          <Tag
                            size="mini"
                            className={'ml-[4px]'}
                            prefixIcon={<IconCozTrigger />}
                            color={triggerIsOpen ? 'brand' : 'primary'}
                          >
                            {I18n.t(
                              'workflow_start_trigger_triggername',
                              {},
                              '触发器',
                            )}
                          </Tag>
                        </span>
                      ) : undefined}
                    </Typography.Paragraph>
                    <ReferenceNodeOrigin node={node} />
                    <ReferenceNodeVersion node={node} />
                  </div>
                ) : (
                  <Input
                    onBlur={() => {
                      onTitleChange(editableTitle);
                      onBlur();
                    }}
                    ref={titleInput}
                    // size="small"
                    readonly={_readonly}
                    value={editableTitle}
                    onChange={e => {
                      handleTitleChange(e);
                      onChange();
                    }}
                    className={`${styles.input} ${
                      showError ? styles.inputError : ''
                    }`}
                    placeholder={I18n.t('workflow_detail_node_name_default')}
                    data-testid={concatTestId(
                      getNodeTestId(),
                      'input',
                      'rename',
                    )}
                  />
                );
              }}
            </ValidationErrorWrapper>
          }

          <div className={styles.operators}>
            {showMockset ? (
              <PluginMockSet node={node} readonly={readonly} />
            ) : null}

            {!hideTest ? (
              <div>
                <TestRunSingleNodeButton />
              </div>
            ) : null}

            {registry?.meta?.helpLink && isNodeSideSheet ? (
              <HelpLinkButton
                nodeData={nodeData}
                nodeType={registry.type}
                helpLink={registry.meta.helpLink}
              />
            ) : null}

            {needShowOperations ? (
              <Dropdown
                trigger="hover"
                position="bottomRight"
                onVisibleChange={updateCanMoveOut}
                render={
                  <Dropdown.Menu className={styles['dropdown-menus']}>
                    {!readonly && canMoveOut ? (
                      <>
                        <Dropdown.Item
                          onClick={(_v, e) => handleMoveOut(e)}
                          data-testid={concatTestId(
                            getNodeTestId(),
                            'opr',
                            'move_out_container',
                          )}
                        >
                          {I18n.t('workflow_subcanvas_remove')}
                        </Dropdown.Item>
                        <Divider />
                      </>
                    ) : null}
                    {!readonly ? (
                      <Dropdown.Item
                        onClick={(_v, e) => handleEditState(e)}
                        data-testid={concatTestId(
                          getNodeTestId(),
                          'opr',
                          'rename',
                        )}
                      >
                        {I18n.t('workflow_detail_node_rename')}
                      </Dropdown.Item>
                    ) : null}
                    {!readonly ? (
                      <Dropdown.Item
                        onClick={handleCopy}
                        data-testid={concatTestId(
                          getNodeTestId(),
                          'opr',
                          'copy',
                        )}
                      >
                        {I18n.t('workflow_detail_title_copy')}
                      </Dropdown.Item>
                    ) : null}
                    {!meta.deleteDisable &&
                    (!readonly ||
                      (readonly && readonlyAllowDeleteOperation)) ? (
                      <Dropdown.Item
                        onClick={(_v, e) => handleDelete(e)}
                        data-testid={concatTestId(
                          getNodeTestId(),
                          'opr',
                          'delete',
                        )}
                      >
                        {I18n.t('workflow_detail_node_delete')}
                      </Dropdown.Item>
                    ) : null}
                    {encapsulateService.canDecapsulate(node) && (
                      <Dropdown.Item
                        onClick={handleDecapsulate}
                        data-testid={concatTestId(
                          getNodeTestId(),
                          'opr',
                          'decapsulate',
                        )}
                      >
                        <div className="cursor-pointer flex items-center w-full justify-between absolute inset-0 px-2">
                          <div>
                            {I18n.t(
                              'workflow_encapsulate_decapsulate',
                              undefined,
                              '解散工作流',
                            )}
                          </div>
                          <div className="coz-fg-secondary text-xs">
                            {ENCAPSULATE_SHORTCUTS.decapsulate}
                          </div>
                        </div>
                      </Dropdown.Item>
                    )}
                    {extraOperation ? (
                      <Dropdown.Item
                        className="extra-operation-item"
                        data-testid={concatTestId(
                          getNodeTestId(),
                          'opr',
                          'extra-operation',
                        )}
                      >
                        {extraOperation}
                      </Dropdown.Item>
                    ) : null}
                  </Dropdown.Menu>
                }
              >
                <IconButton
                  color="secondary"
                  size={isNodeSideSheet ? 'default' : 'small'}
                  icon={<IconCozMore />}
                  onClick={e => e.stopPropagation()}
                />
              </Dropdown>
            ) : undefined}
            {showCloseButton ? <CloseButton /> : null}
          </div>
        </div>
      </div>

      <div
        className={classnames('node-header-description px-2 w-full', {
          '!cursor-default': isNodeSideSheet,
          'pb-2': isNewNodeRender,
          '!mb-0': !expanded,
        })}
      >
        {isNewNodeRender ? (
          <DescriptionDisplay description={description} />
        ) : (
          <Description
            description={description}
            expanded={expanded}
            isLocalPlugin={isLocalPlugin}
            onChange={onDescriptionChange}
            readonly={readonly || nodeDisabled}
          />
        )}
      </div>
    </div>
  );
};
