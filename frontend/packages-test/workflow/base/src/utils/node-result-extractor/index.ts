import { type WorkflowJSON } from '../../types';
import { type NodeResult } from '../../api';
import {
  type NodeResultExtracted,
  type NodeResultExtractorParser,
} from './type';
import { defaultParser } from './parsers';
export { type NodeResultExtracted, type CaseResultData } from './type';
export class NodeResultExtractor {
  private readonly parser: NodeResultExtractorParser;
  public constructor(
    private readonly nodeResults: NodeResult[],
    private readonly workflowSchema: WorkflowJSON,
  ) {
    this.parser = defaultParser;
  }

  public extract(): NodeResultExtracted[] {
    return (
      this.nodeResults
        ?.filter(Boolean)
        ?.map(item => this.parser(item, this.workflowSchema)) || []
    );
  }
}
