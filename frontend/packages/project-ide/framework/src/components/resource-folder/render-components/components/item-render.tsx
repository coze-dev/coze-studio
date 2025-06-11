import React, { useMemo } from 'react';

import { type CommonComponentProps } from '../../type';
import { ITEM_HEIGHT, ItemStatus, TAB_SIZE } from '../../constant';
import { NameInput } from './name-input';
import { MoreTools } from './more-tools';
import { MemoText } from './memo-text';

const ItemRender = ({
  resource,
  path,
  icon,
  isSelected,
  isTempSelected,
  isInEdit,
  searchConfig,
  suffixRender,
  config,
  renderMoreSuffix,
  textRender,
  isDragging,
  useOptimismUI,
  isOptimismSaving,
  contextMenuCallback,
  resourceTreeWrapperRef,
  ...props
}: CommonComponentProps) => {
  const { name, status } = resource;

  const optimismUILoading = useMemo(() => {
    if (isOptimismSaving) {
      if (typeof useOptimismUI === 'object' && useOptimismUI.loadingRender) {
        return useOptimismUI.loadingRender();
      }
    }
    return null;
  }, [isOptimismSaving]);

  const suffix = useMemo(
    () =>
      !isInEdit &&
      suffixRender?.render?.({
        resource,
        isSelected,
        isTempSelected,
      }),
    [isSelected, isInEdit, resource, isTempSelected],
  );

  const moreTools = useMemo(
    () =>
      !isInEdit && renderMoreSuffix ? (
        <MoreTools
          resource={resource}
          contextMenuCallback={contextMenuCallback}
          resourceTreeWrapperRef={resourceTreeWrapperRef}
          renderMoreSuffix={renderMoreSuffix}
        />
      ) : null,
    [isInEdit, resource, renderMoreSuffix],
  );

  return (
    <div
      key={resource.id}
      className={'base-item'}
      style={{
        justifyContent: 'space-between',
        height: config?.itemHeight || ITEM_HEIGHT,
        borderRadius: 4,
        paddingLeft: (path.length - 1) * (config?.tabSize || TAB_SIZE) - 4,
        ...(status === ItemStatus.Disabled
          ? {
              fontStyle: 'italic',
              filter: 'opacity(0.5)',
              cursor: 'not-allowed',
              textDecoration: 'line-through',
            }
          : {}),
      }}
    >
      <div
        style={{
          display: 'flex',
          overflow: isInEdit ? 'visible' : 'hidden',
          width: '100%',
        }}
      >
        {icon ? (
          <span
            className={'base-item-icon'}
            style={{
              color: 'rgba(6, 7, 9, 0.96)',
            }}
          >
            {icon}
          </span>
        ) : null}
        {isInEdit ? (
          <NameInput
            resource={resource}
            initValue={name}
            handleSave={props.handleSave}
            handleChangeName={props.handleChangeName}
            errorMsg={props.errorMsg}
            errorMsgRef={props.errorMsgRef}
            validateConfig={props.validateConfig}
            config={config}
          />
        ) : (
          <MemoText
            isSelected={isSelected}
            resource={resource}
            name={name}
            searchConfig={searchConfig}
            tooltipSpace={
              (suffixRender?.width || 0) + (renderMoreSuffix ? 26 : 0)
            }
            textRender={textRender}
          />
        )}
      </div>
      {optimismUILoading}
      {suffix}
      {moreTools}
    </div>
  );
};

export { ItemRender };
