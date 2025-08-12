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

/* eslint-disable max-lines-per-function */
import { nanoid } from 'nanoid';
import { get, isEmpty, set } from 'lodash-es';
import { type NodeFormContext } from '@flowgram-adapter/free-layout-editor';
import { variableUtils } from '@coze-workflow/variable';
import {
  type NodeDataDTO,
  ViewVariableType,
  VariableTypeDTO,
  type InputTypeValueDTO,
  type InputValueDTO,
  type ValueExpressionDTO,
  type InputTypeValueVO,
  type ValueExpression,
} from '@coze-workflow/base';

import { type HeaderAndParamsDataDTO } from './types';
import {
  AuthType,
  BodyType,
  HttpMethod,
  CustomAuthAddToType,
} from './setters/constants';
import { fileTypeDTOToVO, fileTypeVOToDTO } from './constants';

interface FormData {
  inputs: Record<string, unknown>;
}

/**
 * Node Backend Data - > Frontend Form Data
 */
export const transformOnInit = (
  value: NodeDataDTO,
  context: NodeFormContext,
) => {
  const { playgroundContext, node } = context;
  const { variableService } = playgroundContext;
  const {
    inputs = {
      apiInfo: {
        method: HttpMethod.GET,
        url: undefined,
      },
      body: {
        bodyType: BodyType.Empty,
        bodyData: undefined,
      },
      headers: undefined,
      params: undefined,
      auth: {
        authType: AuthType.Bearer,
        authData: {
          customData: {
            data: undefined,
            addTo: CustomAuthAddToType.Header,
          },
          basicAuthData: undefined,
          bearerTokenData: undefined,
        },
      },
      setting: {
        timeout: 120, //unit second
        retryTimes: 3,
      },
    },
    outputs,
  } = value || {};

  const initValue = {
    nodeMeta: value?.nodeMeta,
    inputParameters: [],
    inputs,
    outputs: isEmpty(outputs)
      ? [
          {
            key: nanoid(),
            type: ViewVariableType.String,
            name: 'body',
          },
          {
            key: nanoid(),
            type: ViewVariableType.Integer,
            name: 'statusCode',
          },
          {
            key: nanoid(),
            type: ViewVariableType.String,
            name: 'headers',
          },
        ]
      : outputs,
  };

  const headersData = get(
    initValue,
    'inputs.headers',
  ) as HeaderAndParamsDataDTO[];

  if (headersData) {
    const headersDataVO = headersData.map(param => ({
      name: param.name,
      type: VariableTypeDTO.string,
      input: param.input,
    }));
    const transHeadersData = variableUtils.inputTypeValueDTOToVO(
      headersDataVO as InputTypeValueDTO[],
      variableService,
      {
        node,
      },
    );
    set(initValue, 'inputs.headers', transHeadersData);
  }

  const paramsData = get(value, 'inputs.params') as HeaderAndParamsDataDTO[];

  if (paramsData) {
    const paramsDataVO = paramsData.map(param => ({
      name: param.name,
      type: VariableTypeDTO.string,
      input: param.input,
    }));
    const transParamsData = variableUtils.inputTypeValueDTOToVO(
      paramsDataVO as InputTypeValueDTO[],
      variableService,
      {
        node,
      },
    );
    set(initValue, 'inputs.params', transParamsData);
  }

  const baseAuthPath = 'inputs.auth.authData';
  const authDataPathArray = [
    'basicAuthData',
    'customData.data',
    'bearerTokenData',
  ];

  authDataPathArray.forEach(authDataPath => {
    const authData = get(initValue, `${baseAuthPath}.${authDataPath}`);
    if (authData) {
      const transAuthData = (authData as InputTypeValueDTO[]).map(param => ({
        name: param.name,
        type: variableUtils.DTOTypeToViewType(param.type),
        input: variableUtils.valueExpressionToVO(param.input, variableService),
      }));
      set(initValue, `${baseAuthPath}.${authDataPath}`, transAuthData);
    }
  });

  const baseBodyPath = 'inputs.body.bodyData';

  const formURLEncodedPath = 'formURLEncoded';
  const formURLEncodedData = get(
    initValue,
    `${baseBodyPath}.${formURLEncodedPath}`,
  );
  if (formURLEncodedData) {
    const transBodyData = (formURLEncodedData as InputValueDTO[]).map(
      param => ({
        name: param.name,
        type: VariableTypeDTO.string,
        input: param.input,
      }),
    );

    set(
      initValue,
      `${baseBodyPath}.${formURLEncodedPath}`,
      variableUtils.inputTypeValueDTOToVO(
        transBodyData as InputTypeValueDTO[],
        variableService,
        {
          node,
        },
      ),
    );
  }

  const formDataPath = 'formData';
  const formData = get(initValue, `${baseBodyPath}.${formDataPath}`);
  if (formData) {
    const { data = [] as InputValueDTO[], typeMapping = '{}' } = formData;

    const parsedTypeMapping = JSON.parse(typeMapping);

    const initData = data?.map(param => {
      const basicTypeDTO = get(parsedTypeMapping, `${param.name}.basicType`);
      let type = fileTypeDTOToVO[basicTypeDTO];
      /*
       * Compatible with complex data types
       * rawMeta.type stores ViewVariableType
       */
      if (param.input?.value?.rawMeta?.type) {
        type = param.input?.value?.rawMeta?.type;
      }

      return {
        name: param.name,
        type,
        input: variableUtils.valueExpressionToVO(param.input, variableService),
      };
    });

    set(initValue, `${baseBodyPath}.${formDataPath}`, initData);
  }

  const binaryPath = 'binary.fileURL';
  const binaryData = get(
    initValue,
    `${baseBodyPath}.${binaryPath}`,
  ) as unknown as ValueExpressionDTO;
  const binaryDataVO = variableUtils.inputValueToVO(
    {
      name: 'fileURL',
      input: binaryData,
    },
    variableService,
  );
  set(
    initValue,
    `${baseBodyPath}.${binaryPath}`,
    binaryDataVO?.input ?? {
      type: 'literal',
      content: '',
    },
  );

  return initValue;
};

/**
 * Front-end form data - > node back-end data
 */
export const transformOnSubmit = (
  value: FormData,
  context: NodeFormContext,
): NodeDataDTO => {
  const formattedValue: Record<string, unknown> = {
    ...value,
  };

  const { node, playgroundContext } = context;
  const { variableService } = playgroundContext;

  const headersData = get(value, 'inputs.headers');
  if (headersData) {
    const transHeadersData = variableUtils
      .inputTypeValueVOToDTO(
        headersData as InputTypeValueVO[],
        variableService,
        {
          node,
        },
      )
      .map(param => ({
        // Backend does not require type
        name: param.name,
        input: param.input,
      }));
    set(formattedValue, 'inputs.headers', transHeadersData);
  }

  const paramsData = get(value, 'inputs.params');
  if (paramsData) {
    const transParamsData = variableUtils
      .inputTypeValueVOToDTO(
        paramsData as InputTypeValueVO[],
        variableService,
        {
          node,
        },
      )
      .map(param => ({
        // Backend does not require type
        name: param.name,
        input: param.input,
      }));
    set(formattedValue, 'inputs.params', transParamsData);
  }

  const baseAuthPath = 'inputs.auth.authData';
  const authDataPathArray = [
    'basicAuthData',
    'customData.data',
    'bearerTokenData',
  ];

  authDataPathArray.forEach(authDataPath => {
    const authData = get(formattedValue, `${baseAuthPath}.${authDataPath}`);
    if (authData) {
      const transAuthData = variableUtils.inputTypeValueVOToDTO(
        authData as InputTypeValueVO[],
        variableService,
        {
          node,
        },
      );
      set(formattedValue, `${baseAuthPath}.${authDataPath}`, transAuthData);
    }
  });

  const baseBodyPath = 'inputs.body.bodyData';

  const formURLEncodedPath = 'formURLEncoded';
  const formURLEncodedData = get(
    formattedValue,
    `${baseBodyPath}.${formURLEncodedPath}`,
  );
  if (formURLEncodedData) {
    const transBodyData = variableUtils
      .inputTypeValueVOToDTO(
        formURLEncodedData as InputTypeValueVO[],
        variableService,
        {
          node,
        },
      )
      .map(param => ({
        // Backend does not require type
        name: param.name,
        input: param.input,
      }));

    set(formattedValue, `${baseBodyPath}.${formURLEncodedPath}`, transBodyData);
  }

  const formDataPath = 'formData';
  const formData = get(
    formattedValue,
    `${baseBodyPath}.${formDataPath}`,
  ) as InputTypeValueVO[];
  if (formData) {
    const transBodyData = {
      data: [] as { name: string; input: ValueExpressionDTO }[],
      typeMapping: {},
    };

    formData?.forEach(param => {
      transBodyData.data.push({
        name: param.name,
        input: variableUtils.valueExpressionToDTO(
          param.input,
          variableService,
          {
            node,
          },
        ),
      });

      set(transBodyData.typeMapping, param.name, {
        basicType: fileTypeVOToDTO[param.type],
      });
    });

    set(formattedValue, `${baseBodyPath}.${formDataPath}`, {
      ...transBodyData,
      typeMapping: JSON.stringify(transBodyData.typeMapping ?? {}),
    });
  }

  const binaryPath = 'binary.fileURL';
  const defaultBinaryDataVO = {
    fileURL: {
      type: 'string',
      schema: [],
      assistType: ViewVariableType.String,
      value: {
        type: 'literal',
        content: '',
        rawMeta: { type: ViewVariableType.File },
      },
    },
  };
  const binaryData =
    get(formattedValue, `${baseBodyPath}.${binaryPath}`) ?? defaultBinaryDataVO;
  if (binaryData) {
    const transBinaryData = variableUtils.valueExpressionToDTO(
      binaryData as ValueExpression,
      variableService,
      {
        node,
      },
    );

    set(formattedValue, `${baseBodyPath}.${binaryPath}`, transBinaryData);
  }

  return formattedValue as unknown as NodeDataDTO;
};
