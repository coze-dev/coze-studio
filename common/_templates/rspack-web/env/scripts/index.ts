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

export const updateDTS = (
  { inputFileName, envVarName, outputFileName }: TUpdateDTSParams = {
    inputFileName: 'env/index.ts',
    envVarName: 'envs',
    outputFileName: 'src/typing/env/index.d.ts',
  },
) => {
  const start = Date.now();

  // Initialize a ts-morph project
  const project = new Project({
    compilerOptions: {
      incremental: true,
      allowJs: false,
      skipLibCheck: true,
      strictNullChecks: true,
      noEmitOnError: true,
    },
  });
  // Add the file you want to parse
  const file = project.addSourceFileAtPath(inputFileName);

  // Get the variable you want to parse
  const envs = file.getVariableDeclarationOrThrow(envVarName);
  // Get the initial value of the envs variable
  const initializer = envs.getInitializerIfKindOrThrow(
    SyntaxKind.ObjectLiteralExpression,
  );
  // Get the properties of the envs object
  const properties = initializer.getProperties();

  // Create a new file to hold the generated type definition
  const typeDefs = project.createSourceFile(
    outputFileName,
    `// 基于${inputFileName}自动生成，请勿手动修改`,
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

  // Iterate through each attribute
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
        // If the type is an object type, obtain its properties
        const spreadProperties = type.getProperties();
        // traversal properties
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
  // Save file
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

  console.info(`DTS generated in  ${Date.now() - start} ms`);
};
