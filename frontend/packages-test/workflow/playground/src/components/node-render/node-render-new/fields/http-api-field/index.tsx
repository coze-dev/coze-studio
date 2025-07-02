import React from 'react';

import { PublicScopeProvider } from '@coze-workflow/variable';
import { useWorkflowNode } from '@coze-workflow/base';

import { Field } from '../field';
import { UrlContainer } from './url-container';

export function HttpApiField() {
  const { data } = useWorkflowNode();
  const apiInfo = data?.inputs?.apiInfo;
  const apiUrl = data?.inputs?.apiInfo?.url;

  return (
    <Field
      labelClassName="h-full"
      label={<div className="leading-[22px]">{apiInfo?.method}</div>}
      isEmpty={!apiUrl}
      customEmptyLabel={'URL'}
    >
      <PublicScopeProvider>
        <UrlContainer apiUrl={apiUrl} />
      </PublicScopeProvider>
    </Field>
  );
}
