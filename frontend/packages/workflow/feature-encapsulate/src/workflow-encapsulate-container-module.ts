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

import { ContainerModule } from 'inversify';

import {
  EncapsulateValidateService,
  EncapsulateValidateServiceImpl,
  EncapsulateValidateManager,
  EncapsulateValidateManagerImpl,
  EncapsulateValidateResult,
  EncapsulateValidateResultImpl,
  EncapsulateValidateResultFactory,
} from './validate';
import {
  EncapsulateGenerateService,
  EncapsulateGenerateServiceImpl,
} from './generate';
import { EncapsulateContext } from './encapsulate-context';
import {
  EncapsulateNodesService,
  EncapsulateService,
  EncapsulateServiceImpl,
  EncapsulateManager,
  EncapsulateManagerImpl,
  EncapsulateLinesService,
  EncapsulateVariableService,
} from './encapsulate';
import { EncapsulateApiService, EncapsulateApiServiceImpl } from './api';

export const WorkflowEncapsulateContainerModule = new ContainerModule(bind => {
  // encapsulate
  bind(EncapsulateService).to(EncapsulateServiceImpl).inSingletonScope();
  bind(EncapsulateManager).to(EncapsulateManagerImpl).inSingletonScope();
  bind(EncapsulateNodesService).toSelf().inSingletonScope();
  bind(EncapsulateLinesService).toSelf().inSingletonScope();
  bind(EncapsulateVariableService).toSelf().inSingletonScope();

  // validate
  bind(EncapsulateValidateService)
    .to(EncapsulateValidateServiceImpl)
    .inSingletonScope();
  bind(EncapsulateValidateManager)
    .to(EncapsulateValidateManagerImpl)
    .inSingletonScope();

  bind(EncapsulateValidateResult)
    .to(EncapsulateValidateResultImpl)
    .inTransientScope();
  bind(EncapsulateValidateResultFactory).toFactory<EncapsulateValidateResult>(
    context => () =>
      context.container.get<EncapsulateValidateResult>(
        EncapsulateValidateResult,
      ),
  );

  // generate
  bind(EncapsulateGenerateService)
    .to(EncapsulateGenerateServiceImpl)
    .inSingletonScope();

  // save
  bind(EncapsulateApiService).to(EncapsulateApiServiceImpl).inSingletonScope();

  // context
  bind(EncapsulateContext).toSelf().inSingletonScope();
});
