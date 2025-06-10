import { Field } from '@flowgram-adapter/free-layout-editor';
import { PublicScopeProvider } from '@coze-workflow/variable';
import {
  type InputValueVO,
  type ViewVariableTreeNode,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { Outputs } from '@/nodes-v2/components/outputs';

import NodeMeta from '../components/node-meta';
import FixedInputParameters from '../components/fixed-input-parameters';
import { INPUT_COLUMNS_NARROW } from './constants';
export interface FormRenderProps {
  defaultInputValue: InputValueVO[] | undefined;
  defaultOutputValue: ViewVariableTreeNode[] | undefined;
  fieldConfig: Record<
    string,
    {
      description: string;
      name: string;
      required: boolean;
      type: string;
      optionsList?: {
        label: string;
        value: string;
      }[];
    }
  >;
  readonly: boolean;
  inputTooltip: string;
  outputTooltip: string;
  hasInputs?: boolean;
}

export const createFormRender = ({
  defaultInputValue,
  defaultOutputValue,
  fieldConfig,
  readonly,
  inputTooltip = '',
  outputTooltip = '',
  hasInputs = true,
}: FormRenderProps) => (
  <PublicScopeProvider>
    <>
      <NodeMeta fieldName="nodeMeta" />

      {hasInputs ? (
        <FixedInputParameters
          fieldName="inputParameters"
          defaultValue={defaultInputValue}
          headerTitle={I18n.t('workflow_detail_node_parameter_input')}
          headerTootip={inputTooltip}
          columns={INPUT_COLUMNS_NARROW}
          fieldConfig={fieldConfig}
          readonly={readonly}
        />
      ) : null}

      <Field name="outputs" defaultValue={defaultOutputValue}>
        {({ field, fieldState }) => (
          <Outputs
            id={'create-conversation-node-output'}
            value={field.value}
            onChange={field.onChange}
            titleTooltip={outputTooltip}
            readonly
            needErrorBody={false}
            errors={fieldState?.errors}
          />
        )}
      </Field>
    </>
  </PublicScopeProvider>
);
