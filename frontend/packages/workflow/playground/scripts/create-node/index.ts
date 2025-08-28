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
import fs from 'fs';

import { Project, SyntaxKind, type SourceFile } from 'ts-morph';
import { camelCase, upperFirst, snakeCase, toUpper } from 'lodash-es';
import { Eta } from 'eta';
import { input, confirm } from '@inquirer/prompts';

const tsProject = new Project({});

class InsertSourceCode {
  source: SourceFile;
  constructor(private sourcePath: string) {
    this.source = tsProject.addSourceFileAtPath(this.sourcePath);
  }
  addNamedExport(name: string, specifier: string) {
    const allExports = this.source.getExportDeclarations();
    const exist = allExports.some(
      e =>
        e.getModuleSpecifierValue() === specifier &&
        e.getNamedExports().some(i => i.getName() === name),
    );
    if (exist) {
      console.warn(
        `⚠️ export ${name} in file ${this.sourcePath} already exists.`,
      );
    }
    this.source.addExportDeclaration({
      namedExports: [name],
      moduleSpecifier: specifier,
    });
  }
  addNamedImport(name: string, specifier: string) {
    const allImports = this.source.getImportDeclarations();
    const exist = allImports.some(
      e =>
        e.getModuleSpecifierValue() === specifier &&
        e.getNamedImports().some(i => i.getName() === name),
    );
    if (exist) {
      console.warn(
        `⚠️ import ${name} in file ${this.sourcePath} already exists.`,
      );
    }
    this.source.addImportDeclaration({
      namedImports: [name],
      moduleSpecifier: specifier,
    });
  }
  getVariableValue<T extends SyntaxKind>(name: string, kind: T) {
    return this.source
      .getVariableDeclaration(name)
      ?.getInitializer()
      ?.asKindOrThrow<T>(kind);
  }
  save() {
    return this.source.save();
  }
}

interface Options {
  name: string;
  camelCaseName: string;
  pascalCaseName: string;
  constantName: string;
  registryName: string;
  isSupportTest: boolean;
}

const ROOT_DIR = process.cwd();

function copyTemplateFiles(options: Options) {
  const { name, camelCaseName, constantName, pascalCaseName, isSupportTest } =
    options;
  const templateDir = path.join(__dirname, 'templates');
  const sourceDir = path.join(ROOT_DIR, `./src/node-registries/${name}`);
  const eta = new Eta({ views: templateDir });

  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir, { recursive: true });
  }

  const templates = fs.readdirSync(templateDir);
  templates.forEach(temp => {
    const str = eta.render(temp, {
      PASCAL_NAME_PLACE_HOLDER: pascalCaseName,
      CAMEL_NAME_PLACE_HOLDER: camelCaseName,
      CONSTANT_NAME_PLACE_HOLDER: constantName,
      IS_SUPPORT_TEST: isSupportTest,
    });
    fs.writeFileSync(
      path.join(sourceDir, temp.replace(/\.eta$/, '')),
      str,
      'utf-8',
    );
  });
}

async function insertSourceCode(options: Options) {
  const { pascalCaseName, registryName, name } = options;
  // node-registries/index.ts
  const nodeRegistriesIndex = new InsertSourceCode(
    path.join(ROOT_DIR, './src/node-registries/index.ts'),
  );
  nodeRegistriesIndex.addNamedExport(registryName, `./${name}`);
  await nodeRegistriesIndex.save();

  // src/nodes-v2/constants.ts;
  const nodeV2Constants = new InsertSourceCode(
    path.join(ROOT_DIR, './src/nodes-v2/constants.ts'),
  );
  nodeV2Constants.addNamedImport(registryName, '@/node-registries');
  nodeV2Constants
    .getVariableValue('NODES_V2', SyntaxKind.ArrayLiteralExpression)
    ?.addElement(registryName, { useNewLines: true });
  await nodeV2Constants.save();

  // components/node-render/node-render-new/content/index.tsx
  const nodeRenderContentIndex = new InsertSourceCode(
    path.join(
      ROOT_DIR,
      './src/components/node-render/node-render-new/content/index.tsx',
    ),
  );
  nodeRenderContentIndex.addNamedImport(
    `${pascalCaseName}Content`,
    `@/node-registries/${name}`,
  );
  nodeRenderContentIndex
    .getVariableValue('ContentMap', SyntaxKind.ObjectLiteralExpression)
    ?.addPropertyAssignment({
      name: `[StandardNodeType.${pascalCaseName}]`,
      initializer: `${pascalCaseName}Content`,
    });
  await nodeRenderContentIndex.save();
}

async function main() {
  const name = await input({
    message:
      'Enter component name (use "-" as separator), e.g."database-create":',
    required: true,
  });
  const camelCaseName = await input({
    message: 'Use camelCase (lower camel) for variable prefixes:',
    default: camelCase(name),
    required: true,
  });
  const pascalCaseName = await input({
    message: 'Use PascalCase (Upper Camel) for class names:',
    default: upperFirst(camelCaseName),
    required: true,
  });
  const isSupportTest = await confirm({
    message: 'Is single-node testing supported?',
    default: false,
  });

  const constantName = toUpper(snakeCase(name));
  const registryName = `${constantName}_NODE_REGISTRY`;
  const options = {
    name,
    camelCaseName,
    pascalCaseName,
    constantName,
    registryName,
    isSupportTest,
  };

  copyTemplateFiles(options);

  await insertSourceCode(options);

  console.log('done.');
}

main();
