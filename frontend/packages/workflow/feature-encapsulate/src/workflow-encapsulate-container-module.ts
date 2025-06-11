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
