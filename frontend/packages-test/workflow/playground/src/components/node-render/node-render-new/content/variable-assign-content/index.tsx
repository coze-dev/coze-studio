import React from 'react';

import { PublicScopeProvider } from '@coze-workflow/variable';

import { Outputs } from '../../fields';
import Inputs from './inputs';

export function VariableAssignContent() {
  return (
    <>
      <PublicScopeProvider>
        <Inputs />
      </PublicScopeProvider>

      <Outputs />
    </>
  );
}
