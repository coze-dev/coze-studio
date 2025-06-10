import { inject, injectable } from 'inversify';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type RefExpression } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { WorkflowVariableFacadeService } from '../core';
import { WorkflowVariableService } from './workflow-variable-service';

@injectable()
export class WorkflowVariableValidationService {
  @inject(WorkflowVariableService)
  protected readonly variableService: WorkflowVariableService;

  @inject(WorkflowVariableFacadeService)
  protected readonly variableFacadeService: WorkflowVariableFacadeService;

  isRefVariableEligible(value: RefExpression, node: WorkflowNodeEntity) {
    const variable = this.variableFacadeService.getVariableFacadeByKeyPath(
      value?.content?.keyPath,
      { node },
    );

    if (!variable || !variable.canAccessByNode(node.id)) {
      return I18n.t('workflow_detail_variable_referenced_error');
    }

    return;
  }
}
