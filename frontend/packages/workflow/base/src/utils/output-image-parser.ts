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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { flatten, get } from 'lodash-es';
import { type WorkflowNodeJSON } from '@flowgram-adapter/free-layout-editor';

import { StandardNodeType, VariableTypeDTO, AssistTypeDTO } from '../types';

interface Schema {
  type: VariableTypeDTO;
  name: string;
  schema: Schema | Schema[];
  assistType: AssistTypeDTO;
}

const isImageType = (schema: Schema) => {
  if (
    schema?.type === VariableTypeDTO.image ||
    (schema?.type === VariableTypeDTO.string &&
      [AssistTypeDTO.image, AssistTypeDTO.svg].includes(schema?.assistType))
  ) {
    return true;
  }
};

function getImgList(data: unknown, schema: Schema): string[] {
  let imgList: string[] = [];

  if (isImageType(schema) && typeof data === 'string') {
    imgList.push(data);
  }

  if (schema?.type === VariableTypeDTO.list && Array.isArray(data)) {
    const imgListInItems = (data as unknown[]).map(item =>
      getImgList(item, schema.schema as Schema),
    );
    imgList = imgList.concat(...imgListInItems);
  }

  if (schema?.type === VariableTypeDTO.object) {
    const imgListInObject = Object.entries(
      (data as Record<string, unknown>) || {},
    ).map(([key, value]) =>
      getImgList(
        value,
        ((schema.schema as Schema[]) || []).find(
          item => item.name === key,
        ) as Schema,
      ),
    );
    imgList = imgList.concat(...imgListInObject);
  }

  return imgList;
}

/**
 * Parse image links from node output data
 * @Param outputData node output data JSON serialized string
 * @param nodeSchema
 * @Param excludeNodeTypes does not resolve image links for nodes of this type
 */
export function parseImagesFromOutputData({
  outputData,
  nodeSchema,
  excludeNodeTypes = [],
}: {
  outputData?: any;
  nodeSchema?: WorkflowNodeJSON;
  excludeNodeTypes?: StandardNodeType[];
}): string[] {
  if (!nodeSchema || !outputData) {
    return [];
  }
  if (excludeNodeTypes.includes(nodeSchema?.type as StandardNodeType)) {
    return [];
  }
  let outputParameters: any[] = [];
  if (
    nodeSchema?.type === StandardNodeType.End ||
    nodeSchema?.type === StandardNodeType.Output
  ) {
    outputParameters = (nodeSchema?.data?.inputs as any)?.inputParameters;
  } else {
    outputParameters = nodeSchema?.data?.outputs as any[];
  }
  if (!outputParameters) {
    return [];
  }

  const imgListInOutput = flatten(
    outputParameters.map(p =>
      getImgList(
        get(outputData, p?.name),
        p?.input
          ? {
              ...p.input,
              name: p.name,
            }
          : p,
      ),
    ),
  ).filter(url => !!url);

  return imgListInOutput;
}
