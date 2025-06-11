/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from 'react';

import {
  FormBaseInputJson,
  type IFormSchema,
} from '@coze-workflow/test-run-next';

import { useGlobalState } from '@/hooks';

import { getExtensions } from './get-extensions';

interface JsonModeInputProps {
  properties: IFormSchema['properties'];
  validateJsonSchema: any;
}

export const JsonModeInput: React.FC<JsonModeInputProps> = ({
  properties,
  validateJsonSchema,
  ...props
}) => {
  const globalState = useGlobalState();
  const editorRef = useRef();
  const extensionsRef = useRef(
    getExtensions({
      properties,
      spaceId: globalState.spaceId,
      editorRef,
    }),
  );
  return (
    <FormBaseInputJson
      jsonSchema={validateJsonSchema}
      extensions={extensionsRef.current}
      height="364px"
      didMount={editor => {
        editorRef.current = editor;
      }}
      {...props}
    />
  );
};
