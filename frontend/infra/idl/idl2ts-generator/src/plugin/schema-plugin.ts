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

import {
  type IPlugin,
  type Program,
  on,
  before,
  after,
} from '@coze-arch/idl2ts-plugin';
import {
  type EnumDefinition,
  isServiceDefinition,
  isStructDefinition,
  isIdentifier,
  type StructDefinition,
  isBaseType,
  type FieldType,
  type FunctionType,
  isEnumDefinition,
  isListType,
  isStringLiteral,
  type TypedefDefinition,
  type ConstDefinition,
  type ConstValue,
  isSetType,
  isMapType,
  isIntConstant,
  isConstDefinition,
  isTypedefDefinition,
  type UnifyStatement,
  SyntaxType,
  type ServiceDefinition,
  parseIdFiledType,
  getValuesFromEnum,
  removeFileExt,
  parseFiledName,
  getAnnotation,
  getTypeFromDynamicJsonAnnotation,
  getSchemaRootByPath,
  getOutputName,
} from '@coze-arch/idl2ts-helper';

import {
  type Contexts,
  HOOK,
  type ProcessIdlCtxWithSchema,
  type AjvType,
  type ListType,
  type RefType,
  type StringType,
  type NumberType,
  type BoolType,
  type EnumType,
  type ConstType,
  type StructType,
} from '../context';

interface IOptions {
  outputDir: string;
  idlRoot: string;
}
export class SchemaPlugin implements IPlugin {
  private options: IOptions;
  constructor(options: IOptions) {
    this.options = options;
  }
  apply(program: Program<Contexts>): void {
    program.register(
      on(HOOK.PROCESS_IDL_NODE),
      ctx => {
        const { schema, node } = ctx;
        // if (!node) {
        //     return ctx;
        // }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const schemas = this.processIdlNode(node!, ctx);
        Object.keys(schemas).forEach(id => {
          schema.definitions[id] = schemas[id];
        });
        return ctx;
      },
      0,
    );

    program.register(before(HOOK.PROCESS_IDL_AST), ctx => {
      ctx.schema = {
        $id: getSchemaRootByPath(ctx.ast.idlPath, this.options.idlRoot),
        definitions: {},
      };
      return ctx;
    });

    program.register(after(HOOK.PROCESS_IDL_AST), ctx => {
      const { ast, schema } = ctx;
      ctx.output.set(
        getOutputName({
          source: `${removeFileExt(ast.idlPath)}.schema.json`,
          outputDir: this.options.outputDir,
          idlRoot: this.options.idlRoot,
        }),
        { type: 'json', content: schema },
      );
      return ctx;
    });
  }

  private processIdlNode(
    statement: UnifyStatement,
    ctx: ProcessIdlCtxWithSchema,
  ): { [key: string]: AjvType } {
    if (isStructDefinition(statement)) {
      return this.processStructNode(statement, ctx);
    } else if (isTypedefDefinition(statement)) {
      return this.processTypeDefNode(statement, ctx);
    } else if (isEnumDefinition(statement)) {
      return this.processEnumDefNode(statement);
    } else if (isConstDefinition(statement)) {
      return this.processConstDefNode(statement);
    } else if (isServiceDefinition(statement)) {
      return this.processServiceDefinition(statement, ctx);
    }
    throw new Error(`canot process Node from statement type: ${statement}`);
  }
  private processServiceDefinition(
    struct: ServiceDefinition,
    ctx: ProcessIdlCtxWithSchema,
  ) {
    const { functions } = struct;
    const schemas = {} as { [key: string]: AjvType };
    functions.map(f => {
      const { name, returnType, fields } = f;
      const reqSchema = this.processValue(fields[0].fieldType, ctx);
      const resSchema = this.processValue(returnType, ctx);
      schemas[`${name.value}.req`] = reqSchema;
      schemas[`${name.value}.res`] = resSchema;
    });
    return schemas;
  }
  private processStructNode(
    srtuct: StructDefinition,
    ctx: ProcessIdlCtxWithSchema,
  ) {
    const { name, fields } = srtuct;
    const schema = {
      properties: {},
      required: [],
      type: 'object',
    } as StructType;

    fields.forEach(i => {
      const fieldName = parseFiledName(i);
      if (schema.properties[fieldName]) {
        return;
      }
      const { requiredness, annotations, fieldType } = i;
      const isAnyType = getAnnotation(annotations, 'api.value_type') === 'any';
      const dynamicType = getTypeFromDynamicJsonAnnotation(annotations);
      const required = requiredness !== 'optional';
      let valueType: AjvType = this.processValue(fieldType, ctx);
      if (isAnyType || dynamicType) {
        valueType = {};
      }
      if (required) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        schema.required!.push(fieldName);
      }

      schema.properties[fieldName] = valueType;
    });
    return { [name.value]: schema };
  }
  private processValue(
    fieldType: FieldType | FunctionType,
    ctx: ProcessIdlCtxWithSchema,
  ) {
    if (isBaseType(fieldType)) {
      const type = getBaseTypeConverts('number')[fieldType.type];
      if (fieldType.type === SyntaxType.I64Keyword) {
        // i64
        const schema: NumberType = { type: 'integer' };
        return schema;
      }
      if (type === 'string') {
        const schema: StringType = { type: 'string' };
        return schema;
      } else if (type === 'number') {
        const schema: NumberType = { type: 'integer' };
        return schema;
      } else if (type === 'boolean') {
        const schema: BoolType = { type: 'boolean' };
        return schema;
      } else if (type === 'object') {
        // todo check binary
        const schema: StructType = { type: 'object', properties: {} };
        return schema;
      }
    } else if (isMapType(fieldType)) {
      const { valueType } = fieldType;
      const schema: StructType = {
        type: 'object',
        additionalProperties: this.processValue(valueType, ctx),
      };
      return schema;
    } else if (isListType(fieldType)) {
      const { valueType } = fieldType;
      const schema: ListType = {
        type: 'array',
        items: this.processValue(valueType, ctx),
      };
      return schema;
    } else if (isSetType(fieldType)) {
      // Set to array validation
      const { valueType } = fieldType;
      const schema: ListType = {
        type: 'array',
        items: this.processValue(valueType, ctx),
      };
      return schema;
    } else if (isIdentifier(fieldType)) {
      // reference type
      const { refName, namespace } = parseIdFiledType(fieldType);
      if (!namespace) {
        const schema: RefType = { $ref: `#/definitions/${refName}` };
        return schema;
      } else {
        const schema: RefType = {
          $ref: `${this.getSchemeRootByNamespace(
            namespace,
            ctx,
          )}#/definitions/${refName}`,
        };
        return schema;
      }
    }
    throw new Error(`can not process fieldType : ${fieldType.type}`);
  }
  private processConst(constVal: ConstValue) {
    // Temporarily unified processing to 0
    const schema = {} as ConstType;
    if (isStringLiteral(constVal)) {
      schema.const = constVal.value;
    }
    if (isIntConstant(constVal)) {
      schema.const = constVal.value.value;
    }
    return schema;
  }

  private processTypeDefNode(
    typeDef: TypedefDefinition,
    ctx: ProcessIdlCtxWithSchema,
  ) {
    const { definitionType, name } = typeDef;
    const def = { [name.value]: this.processValue(definitionType, ctx) };
    return def;
  }
  private processEnumDefNode(def: EnumDefinition) {
    const { name } = def;
    const values = getValuesFromEnum(def);
    const schema = { enum: values.length > 0 ? values : [0] } as EnumType;
    return { [name.value]: schema };
  }
  private processConstDefNode(constDef: ConstDefinition) {
    const { name, initializer } = constDef;
    return { [name.value]: this.processConst(initializer) };
  }

  /**
   * namespace -> relative-path
   * @param namespace
   * @param ctx
   */
  private getSchemeRootByNamespace(
    namespace: string,
    ctx: ProcessIdlCtxWithSchema,
  ) {
    const { ast } = ctx;
    let target = '';

    Object.keys(ast.deps).forEach(i => {
      // const pathName = getSchemaRootByPath(i, this.options.idlRoot);
      if (i.endsWith(`/${namespace}.thrift`)) {
        target = getSchemaRootByPath(i, this.options.idlRoot);
      }
    });
    return target;
  }
}
// import { SyntaxType } from "@coze-arch/idl-parser";

function getBaseTypeConverts(i64Type: string) {
  let newType = 'number';
  if (i64Type === 'string') {
    newType = 'string';
  }

  return {
    [SyntaxType.ByteKeyword]: 'number',
    [SyntaxType.I8Keyword]: 'number',
    [SyntaxType.I16Keyword]: 'number',
    [SyntaxType.I32Keyword]: 'number',
    [SyntaxType.I64Keyword]: newType,
    [SyntaxType.DoubleKeyword]: 'number',
    [SyntaxType.BinaryKeyword]: 'object',
    [SyntaxType.StringKeyword]: 'string',
    [SyntaxType.BoolKeyword]: 'boolean',
  };
}
