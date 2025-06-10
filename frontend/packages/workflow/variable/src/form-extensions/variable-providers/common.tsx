import { uniqBy } from 'lodash-es';
import { type PropertyJSON } from '@flowgram-adapter/free-layout-editor';
import { type RefExpression } from '@coze-workflow/base/types';

export interface InputItem {
  name: string;
  input: RefExpression;
}

export const uniqInputs = (inputs?: InputItem[]): InputItem[] =>
  uniqBy(
    (inputs || []).filter(_input => _input && _input?.name),
    _child => _child?.name,
  );

export const uniqProperties = (properties?: PropertyJSON[]): PropertyJSON[] =>
  uniqBy(
    (properties || []).filter(_input => _input && _input?.key),
    _child => _child?.key,
  );
