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
 
import { isWorkflowImageTypeURL } from '../utils';
import { type SchemaExtractorOutputsParser } from '../type';
import { AssistTypeDTO, VariableTypeDTO } from '../../../types/dto';
export const outputsParser: SchemaExtractorOutputsParser = outputs => {
  // 判断是否为数组
  if (!Array.isArray(outputs)) {
    return [];
  }

  return outputs.map(output => {
    const parsed: {
      name: string;
      description?: string;
      children?: ReturnType<SchemaExtractorOutputsParser>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value?: any;
      isImage?: boolean;
      // 默认值里包含图片时，图片信息单独放到这里
      images?: string[];
    } = {
      name: output.name || '',
    };
    if (output.description) {
      parsed.description = output.description;
    }
    if (output.type === 'object' && Array.isArray(output.schema)) {
      parsed.children = outputsParser(output.schema);
    }
    if (output.type === 'list' && Array.isArray(output.schema?.schema)) {
      parsed.children = outputsParser(output.schema.schema);
    }
    // Start 节点默认值放到 value 上
    if (output.defaultValue) {
      parsed.value = output.defaultValue;

      // string、file、image、svg
      if (
        (output.type === 'string' &&
          isWorkflowImageTypeURL(output.defaultValue)) ||
        [AssistTypeDTO.image, AssistTypeDTO.svg].includes(
          output.assistType as AssistTypeDTO,
        )
      ) {
        parsed.images = [String(output.defaultValue)];
      } else if (output.type === VariableTypeDTO.list) {
        // Array<Image> | Array<Svg>
        if (
          [AssistTypeDTO.image, AssistTypeDTO.svg].includes(
            output.schema?.assistType,
          )
        ) {
          try {
            const list = JSON.parse(output.defaultValue) as string[];
            Array.isArray(list) &&
              (parsed.images = list.map(item => String(item)));
          } catch (e) {
            console.error(e);
          }
          // Array<File>
        } else if (output.schema?.assistType === AssistTypeDTO.file) {
          try {
            const list = JSON.parse(output.defaultValue) as string[];
            Array.isArray(list) &&
              (parsed.images = list
                .map(item => String(item))
                .filter(item => isWorkflowImageTypeURL(item)));
          } catch (e) {
            console.error(e);
          }
        }
      }
      parsed.isImage = (parsed.images?.length ?? 0) > 0;
    }
    return parsed;
  });
};
