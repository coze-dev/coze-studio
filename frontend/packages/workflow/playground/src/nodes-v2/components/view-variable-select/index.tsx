import { type CSSProperties, useCallback, useState } from 'react';

import { get } from 'lodash-es';
import { useService } from '@flowgram-adapter/free-layout-editor';
import {
  useVariableChange,
  type ViewVariableType,
  WorkflowVariableService,
} from '@coze-workflow/variable';
import {
  type RefExpression,
  ValueExpressionType,
  useNodeTestId,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { type CascaderProps } from '@coze-arch/bot-semi/Cascader';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { type ComponentProps } from '@/nodes-v2/components/types';
import { VariableSelector } from '@/form-extensions/components/tree-variable-selector';

import styles from './index.module.less';

interface ViewVariableSelectSetterOptions {
  disabledTypes?: ViewVariableType[];
  style?: CSSProperties;
  forArrayItem?: boolean;
}

type ViewVariableSelectProps = ComponentProps<RefExpression> &
  ViewVariableSelectSetterOptions;

export function ViewVariableSelect(
  props: ViewVariableSelectProps,
): JSX.Element {
  const {
    value,
    onChange,
    disabledTypes = [],
    style = {},
    forArrayItem = false,
    name,
  } = props;
  const readonly = useReadonly();
  const [validation, setValidation] = useState<{
    status: CascaderProps['validateStatus'];
    message?: string;
  }>({
    status: 'default',
  });

  const { getNodeSetterId } = useNodeTestId();

  const variableService: WorkflowVariableService = useService(
    WorkflowVariableService,
  );

  const keyPath = get(value, 'content.keyPath') as string[];

  useVariableChange({
    keyPath,
    onChange: ({ variableMeta }) => {
      if (!variableMeta) {
        setValidation({
          status: 'error',
          message: I18n.t('card_builder_userVar_list_search_empty'),
        });
        onChange({ type: ValueExpressionType.REF });
        return;
      }

      // 禁用类型，清空
      if (disabledTypes.includes(variableMeta.type)) {
        setValidation({ status: 'error' });
        onChange({ type: ValueExpressionType.REF });
        return;
      }

      setValidation({
        status: 'success',
      });
    },
  });

  const handleOnChange = (newValue: string[] | undefined) => {
    if (newValue !== undefined) {
      onChange?.({
        type: ValueExpressionType.REF,
        content: {
          keyPath: newValue,
        },
      });
      setValidation({
        status: 'success',
      });
    }
  };

  const optionFilter = useCallback(
    (v: string[]) => {
      const subVariableMeta = variableService.getViewVariableByKeyPath(v, {});
      if (
        subVariableMeta?.type &&
        !disabledTypes.includes(subVariableMeta.type)
      ) {
        return true;
      }
      return false;
    },
    [variableService],
  );

  return (
    <VariableSelector
      className={styles['view-variable-select-setter']}
      value={keyPath}
      readonly={readonly}
      onChange={handleOnChange}
      disabledTypes={disabledTypes}
      forArrayItem={forArrayItem}
      validateStatus={validation.status}
      invalidContent={validation.message}
      optionFilter={optionFilter}
      style={style}
      testId={getNodeSetterId(name)}
    />
  );
}
