import { ContainerModule } from 'inversify';
import { bindContributions } from '@flowgram-adapter/free-layout-editor';

import {
  EncapsulateNodesValidator,
  EncapsulateWorkflowJSONValidator,
  EncapsulateNodeValidator,
} from '../validate';
import { SubCanvasValidator } from './sub-canvas-validator';
import { StartEndValidator } from './start-end-validator';
import { LoopNodesValidator } from './loop-nodes-validator';
import { EncapsulateSchemaValidator } from './encapsulate-schema-validator';
import { EncapsulatePortsValidator } from './encapsulate-ports-validator';
import { EncapsulateOutputLinesValidator } from './encapsulate-output-lines-validator';
import { EncapsulateInputLinesValidator } from './encapsulate-input-lines-validator';
import { EncapsulateFormValidator } from './encapsulate-form-validator';

export const EncapsulateValidatorsContainerModule = new ContainerModule(
  bind => {
    // json validators
    bindContributions(bind, EncapsulateSchemaValidator, [
      EncapsulateWorkflowJSONValidator,
    ]);
    // nodes validators
    [
      EncapsulatePortsValidator,
      EncapsulateInputLinesValidator,
      EncapsulateOutputLinesValidator,
      StartEndValidator,
      LoopNodesValidator,
      SubCanvasValidator,
    ].forEach(Validator => {
      bindContributions(bind, Validator, [EncapsulateNodesValidator]);
    });
    // node validator
    [EncapsulateFormValidator].forEach(Validator => {
      bindContributions(bind, Validator, [EncapsulateNodeValidator]);
    });
  },
);
