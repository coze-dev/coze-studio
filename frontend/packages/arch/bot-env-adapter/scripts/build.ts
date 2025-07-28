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

import path from 'path';

import {
  Project,
  SyntaxKind,
  PropertyAssignment,
  ShorthandPropertyAssignment,
  SpreadAssignment,
  VariableDeclarationKind,
  TypeFormatFlags,
  type VariableDeclarationStructure,
  type OptionalKind,
} from 'ts-morph';

interface TUpdateDTSParams {
  inputFileName: string;
  envVarName: string;
  outputFileName: string;
}

const updateDTS = ({
  inputFileName,
  envVarName,
  outputFileName,
}: TUpdateDTSParams) => {
  // 初始化一个 ts-morph 项目
  const project = new Project({
    compilerOptions: {
      incremental: true,
      allowJs: false,
      skipLibCheck: true,
      strictNullChecks: true,
      noEmitOnError: true,
    },
  });
  // 添加想要解析的文件
  const file = project.addSourceFileAtPath(inputFileName);

  // 获取你想要解析的变量
  const envs = file.getVariableDeclarationOrThrow(envVarName);
  // 获取 envs 变量的初始值
  const initializer = envs.getInitializerIfKindOrThrow(
    SyntaxKind.ObjectLiteralExpression,
  );
  // 获取 envs 对象的属性
  const properties = initializer.getProperties();

  const baseDir = path.resolve(__dirname, '../');
  // 创建一个新的文件，用来保存生成的类型定义
  const typeDefs = project.createSourceFile(
    outputFileName,
    `/*
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
/* eslint-disable */
/* prettier-ignore */
// 基于${path.relative(baseDir, inputFileName)}自动生成，请勿手动修改`,
    {
      overwrite: true,
    },
  );

  const declarations: OptionalKind<VariableDeclarationStructure>[] = [];

  const addDeclaration = (name: string, type: string) => {
    declarations.push({
      name,
      type,
    });
  };

  // 遍历每一个属性
  properties.forEach(property => {
    if (
      property instanceof PropertyAssignment ||
      property instanceof ShorthandPropertyAssignment
    ) {
      addDeclaration(property.getName(), property.getType().getText());
    } else if (property instanceof SpreadAssignment) {
      const expression = property.getExpression();
      const type = expression.getType();

      if (type.isObject()) {
        // 如果类型是一个对象类型，获取其属性
        const spreadProperties = type.getProperties();
        // 遍历属性
        for (const spreadProperty of spreadProperties) {
          const declaration = spreadProperty.getDeclarations()?.[0];
          if (declaration) {
            addDeclaration(
              spreadProperty.getName(),
              declaration
                .getType()
                .getText(
                  undefined,
                  TypeFormatFlags.UseSingleQuotesForStringLiteralType,
                ),
            );
          }
        }
      }
    }
  });
  // 保存文件
  typeDefs.addVariableStatements(
    declarations
      .sort((a, b) => (a.name > b.name ? 1 : -1))
      .map(d => ({
        declarationKind: VariableDeclarationKind.Const,
        hasDeclareKeyword: true,
        declarations: [d],
      })),
  );
  typeDefs.saveSync();
};

export const build = () => {
  const start = Date.now();
  const root = path.resolve(__dirname, '../src');
  updateDTS({
    inputFileName: path.resolve(root, 'index.ts'),
    envVarName: 'envs',
    outputFileName: path.resolve(root, 'typings.d.ts'),
  });
  console.info(`DTS generated in  ${Date.now() - start} ms`);
};
