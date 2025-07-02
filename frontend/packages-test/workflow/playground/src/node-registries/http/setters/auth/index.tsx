import React, { useEffect, useMemo, useRef } from 'react';

import {
  type InputTypeValueVO,
  useNodeTestId,
  ValueExpressionType,
  ViewVariableType,
} from '@coze-workflow/base';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import {
  Section,
  type SectionRefType,
  SelectField,
  SwitchField,
  useWatch,
} from '@/form';

import {
  AuthType,
  authTypeToField,
  authTypeToLabelKey,
  CustomAuthAddToType,
} from '../constants';
import { ParametersInputGroupField } from '../../../common/fields';
import { AddToField } from './add-to-field';

export const AuthSetter = ({ setterName }) => {
  const sectionRef = useRef<SectionRefType>(null);
  const { getNodeSetterId } = useNodeTestId();
  const readonly = useReadonly();

  const optionList = useMemo(
    () =>
      [AuthType.Bearer, AuthType.Custom].map(item => ({
        label: I18n.t(authTypeToLabelKey[item] as I18nKeysNoOptionsType),
        value: item,
      })),
    [],
  );

  const authType: AuthType = useWatch(`${setterName}.authType`);

  const authOpen = useWatch(`${setterName}.authOpen`);

  useEffect(() => {
    if (authOpen) {
      sectionRef.current?.open();
    } else {
      sectionRef.current?.close();
    }
  }, [authOpen]);

  const paramsFieldName = useMemo(
    () =>
      authType === AuthType.Custom
        ? `${setterName}.authData.${authTypeToField[authType]}.data`
        : `${setterName}.authData.${authTypeToField[authType]}`,
    [authType, setterName],
  );

  const authDataDefaultValueMap: Record<AuthType, InputTypeValueVO[]> = {
    [AuthType.BasicAuth]: [
      {
        name: 'username',
        type: ViewVariableType.String,
        input: { type: ValueExpressionType.LITERAL, content: '' },
      },
      {
        name: 'password',
        type: ViewVariableType.String,
        input: { type: ValueExpressionType.LITERAL, content: '' },
      },
    ],
    [AuthType.Bearer]: [
      {
        name: 'token',
        type: ViewVariableType.String,
        input: {
          type: ValueExpressionType.LITERAL,
          content: '',
        },
      },
    ],
    [AuthType.Custom]: [
      {
        name: 'Key',
        type: ViewVariableType.String,
        input: {
          type: ValueExpressionType.LITERAL,
          content: '',
        },
      },
      {
        name: 'Value',
        type: ViewVariableType.String,
        input: {
          type: ValueExpressionType.LITERAL,
          content: '',
        },
      },
    ],
  };

  return (
    <Section
      ref={sectionRef}
      title={I18n.t('node_http_auth')}
      tooltip={I18n.t('node_http_auth_desc')}
      actions={[
        <SwitchField
          name={`${setterName}.authOpen`}
          defaultValue={false}
          size="mini"
        />,
      ]}
      isEmpty={!authOpen}
      emptyText={I18n.t('http_node_auth_notopen')}
    >
      <div className="flex flex-col">
        <SelectField
          name={`${setterName}.authType`}
          size="small"
          data-testid={getNodeSetterId('auth-type-select')}
          optionList={optionList}
          style={{
            width: '100%',
            borderColor:
              'var(--Stroke-COZ-stroke-plus, rgba(84, 97, 156, 0.27))',
            marginBottom: '8px',
          }}
        />
        <div className="pl-[4px]">
          <ParametersInputGroupField
            defaultValue={authDataDefaultValueMap[authType]}
            name={paramsFieldName}
            deps={[`${setterName}.authType`]}
            key={authType}
            nameReadonly
            hiddenTypeTag
            fieldEditable={false}
            hiddenRemove
            hiddenTypes
            inputType={ViewVariableType.String}
          />
        </div>
        {authType === AuthType.Custom && (
          <AddToField
            deps={[`${setterName}.authType`]}
            defaultValue={CustomAuthAddToType.Header}
            name={`${setterName}.authData.${authTypeToField[authType]}.addTo`}
            readonly={readonly}
          />
        )}
      </div>
    </Section>
  );
};
