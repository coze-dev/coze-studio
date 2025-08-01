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

/* eslint-disable max-lines-per-function -- no need to split */
import { type RefObject, type FC } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/bot-semi';
import {
  IconCozArrowDown,
  IconCozBold,
  IconCozQuotation,
  IconCozH1,
  IconCozH2,
  IconCozH3,
  IconCozItalic,
  IconCozLink,
  IconCozListDisorder,
  IconCozListOrder,
  IconCozStrikethrough,
  IconCozTextStyle,
  IconCozUnderscore,
} from '@coze-arch/coze-design/icons';
import { Dropdown, Input } from '@coze-arch/coze-design';

import { type CommentEditorModel } from '../model';
import {
  CommentEditorBlockFormat,
  CommentEditorLeafFormat,
  CommentDefaultLink,
} from '../constant';

interface ICommentToolbar {
  model: CommentEditorModel;
  containerRef: RefObject<HTMLDivElement>;
  visible: boolean;
}

export const CommentToolbar: FC<ICommentToolbar> = props => {
  const { model, containerRef } = props;

  const linkValue = model.getLeafValue(CommentEditorLeafFormat.Link) as string;
  const linkDisplay = linkValue === CommentDefaultLink ? '' : linkValue;

  const tooltipDelay = 1000;
  const toolItemClass =
    'flex items-center gap-[2px] w-auto h-[24px] p-[4px] rounded-[6px] hover:bg-[var(--coz-mg-primary)] cursor-pointer select-none';
  const toolItemMarkedClass =
    'text-[var(--coz-fg-hglt)] bg-[var(--coz-mg-hglt)] hover:bg-[var(--coz-mg-hglt-hovered)]';
  const separatorClass = 'w-[1px] h-[16px] bg-[var(--coz-stroke-primary)]';
  const textItemClass =
    'w-full h-[32px] p-[8px] text-[14px] flex gap-[8px] items-center rounded-[5px] cursor-pointer select-none hover:bg-[var(--coz-mg-primary)]';
  const textItemMarkedClass =
    'text-[var(--coz-fg-hglt)] bg-[var(--coz-mg-hglt)] hover:bg-[var(--coz-mg-hglt-hovered)]';

  return (
    <div
      className={classNames(
        'workflow-comment-toolbar absolute left-[-140px]',
        model.isLeafMarked(CommentEditorLeafFormat.Link)
          ? 'top-[-48px]'
          : 'top-[-14px]',
      )}
    >
      <div
        className="flex items-center gap-[3px] h-[32px] p-[4px] w-auto bg-[var(--coz-bg-max)] rounded-[8px] border-[1px] border-solid border-[var(--coz-stroke-primary)]"
        style={{
          boxShadow:
            '0px 4px 12px 0px rgba(0, 0, 0, 0.08), 0px 8px 24px 0px rgba(0, 0, 0, 0.04)',
        }}
        onMouseDown={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/** Text style */}
        <Dropdown
          position="bottom"
          trigger="hover"
          clickToHide
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- must exist
          getPopupContainer={() => containerRef.current!}
          render={
            <div
              className="flex flex-col gap-[2px] justify-start items-center w-[120px] p-[4px] rounded-[8px] border-[0.5px] border-solid border-[var(--coz-stroke-primary)] bg-[var(--coz-bg-max)]"
              style={{
                boxShadow:
                  '0px 8px 24px 0px rgba(0, 0, 0, 0.16), 0px 16px 48px 0px rgba(0, 0, 0, 0.08)',
              }}
            >
              {/** text */}
              <div
                className={classNames(textItemClass, {
                  [textItemMarkedClass]: model.isBlockMarked(
                    CommentEditorBlockFormat.Paragraph,
                  ),
                })}
                onClick={e => {
                  model.markBlock(CommentEditorBlockFormat.Paragraph);
                }}
              >
                <IconCozTextStyle className="text-xxl" />
                <p>{I18n.t('workflow_note_main_text')}</p>
              </div>
              {/** first-level title */}
              <div
                className={classNames(textItemClass, {
                  [textItemMarkedClass]: model.isBlockMarked(
                    CommentEditorBlockFormat.HeadingOne,
                  ),
                })}
                onClick={e => {
                  model.markBlock(CommentEditorBlockFormat.HeadingOne);
                }}
              >
                <IconCozH1 className="text-xxl" />
                <p>{I18n.t('workflow_note_heading')} 1</p>
              </div>
              {/** secondary title */}
              <div
                className={classNames(textItemClass, {
                  [textItemMarkedClass]: model.isBlockMarked(
                    CommentEditorBlockFormat.HeadingTwo,
                  ),
                })}
                onClick={e => {
                  model.markBlock(CommentEditorBlockFormat.HeadingTwo);
                }}
              >
                <IconCozH2 className="text-xxl" />
                <p>{I18n.t('workflow_note_heading')} 2</p>
              </div>
              {/** third-level title */}
              <div
                className={classNames(textItemClass, {
                  [textItemMarkedClass]: model.isBlockMarked(
                    CommentEditorBlockFormat.HeadingThree,
                  ),
                })}
                onClick={e => {
                  model.markBlock(CommentEditorBlockFormat.HeadingThree);
                }}
              >
                <IconCozH3 className="text-xxl" />
                <p>{I18n.t('workflow_note_heading')} 3</p>
              </div>
            </div>
          }
        >
          <span className={toolItemClass}>
            <IconCozTextStyle />
            <IconCozArrowDown />
          </span>
        </Dropdown>

        <div className={separatorClass} />

        {/** bold */}
        <Tooltip
          content={I18n.t('workflow_note_bold')}
          mouseEnterDelay={tooltipDelay}
        >
          <span
            className={classNames(toolItemClass, {
              [toolItemMarkedClass]: model.isLeafMarked(
                CommentEditorLeafFormat.Bold,
              ),
            })}
            onClick={e => {
              model.markLeaf(CommentEditorLeafFormat.Bold);
            }}
          >
            <IconCozBold />
          </span>
        </Tooltip>

        {/** Italic */}
        <Tooltip
          content={I18n.t('workflow_note_italic')}
          mouseEnterDelay={tooltipDelay}
        >
          <span
            className={classNames(toolItemClass, {
              [toolItemMarkedClass]: model.isLeafMarked(
                CommentEditorLeafFormat.Italic,
              ),
            })}
            onClick={e => {
              model.markLeaf(CommentEditorLeafFormat.Italic);
            }}
          >
            <IconCozItalic />
          </span>
        </Tooltip>

        {/** underline */}
        <Tooltip
          content={I18n.t('workflow_note_underline')}
          mouseEnterDelay={tooltipDelay}
        >
          <span
            className={classNames(toolItemClass, {
              [toolItemMarkedClass]: model.isLeafMarked(
                CommentEditorLeafFormat.Underline,
              ),
            })}
            onClick={e => {
              model.markLeaf(CommentEditorLeafFormat.Underline);
            }}
          >
            <IconCozUnderscore />
          </span>
        </Tooltip>

        {/** Strikethrough */}
        <Tooltip
          content={I18n.t('workflow_note_strikethrough')}
          mouseEnterDelay={tooltipDelay}
        >
          <span
            className={classNames(toolItemClass, {
              [toolItemMarkedClass]: model.isLeafMarked(
                CommentEditorLeafFormat.Strikethrough,
              ),
            })}
            onClick={e => {
              model.markLeaf(CommentEditorLeafFormat.Strikethrough);
            }}
          >
            <IconCozStrikethrough />
          </span>
        </Tooltip>

        <div className={separatorClass} />

        {/** unordered list */}
        <Tooltip
          content={I18n.t('workflow_note_bulleted_list')}
          mouseEnterDelay={tooltipDelay}
        >
          <span
            className={classNames(toolItemClass, {
              [toolItemMarkedClass]: model.isBlockMarked(
                CommentEditorBlockFormat.BulletedList,
              ),
            })}
            onClick={e => {
              model.markBlock(CommentEditorBlockFormat.BulletedList);
            }}
          >
            <IconCozListDisorder />
          </span>
        </Tooltip>

        {/** ordered list */}
        <Tooltip
          content={I18n.t('workflow_note_numbered_list')}
          mouseEnterDelay={tooltipDelay}
        >
          <span
            className={classNames(toolItemClass, {
              [toolItemMarkedClass]: model.isBlockMarked(
                CommentEditorBlockFormat.NumberedList,
              ),
            })}
            onClick={e => {
              model.markBlock(CommentEditorBlockFormat.NumberedList);
            }}
          >
            <IconCozListOrder />
          </span>
        </Tooltip>

        {/** quote */}
        <Tooltip
          content={I18n.t('workflow_note_quote')}
          mouseEnterDelay={tooltipDelay}
        >
          <span
            className={classNames(toolItemClass, {
              [toolItemMarkedClass]: model.isBlockMarked(
                CommentEditorBlockFormat.Blockquote,
              ),
            })}
            onClick={e => {
              model.markBlock(CommentEditorBlockFormat.Blockquote);
            }}
          >
            <IconCozQuotation />
          </span>
        </Tooltip>

        <div className={separatorClass} />

        {/** link */}
        <Tooltip
          content={I18n.t('workflow_note_hyperlink')}
          mouseEnterDelay={tooltipDelay}
        >
          <span
            className={classNames(toolItemClass, {
              [toolItemMarkedClass]: model.isLeafMarked(
                CommentEditorLeafFormat.Link,
              ),
            })}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              model.markLeaf(CommentEditorLeafFormat.Link, CommentDefaultLink);
            }}
          >
            <IconCozLink />
          </span>
        </Tooltip>
      </div>
      <div
        className="w-full overflow-hidden absolute top-[34px]"
        style={{
          display: model.isLeafMarked(CommentEditorLeafFormat.Link)
            ? 'flex'
            : 'none',
        }}
        onMouseDown={e => {
          e.stopPropagation();
        }}
      >
        <Input
          // cp-disable-next-line
          placeholder="https://"
          style={{
            // Overlay style is needed here, tailwind class priority is not high enough
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          value={linkDisplay}
          onChange={value => {
            model.setLeafValue(
              CommentEditorLeafFormat.Link,
              value || CommentDefaultLink,
            );
          }}
        ></Input>
      </div>
    </div>
  );
};
