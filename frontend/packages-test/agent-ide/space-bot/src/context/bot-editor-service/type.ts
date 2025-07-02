import { type EditorSharedApplyRecordService } from '../../service/shared-apply-record-service';
import { type NLPromptModalVisibilityService } from '../../service/nl-prompt-modal-visibility-service';
import { type FreeGrabModalHierarchyService } from '../../service/free-grab-modal-hierarchy-service';

export interface BotEditorServiceContextProps {
  nLPromptModalVisibilityService: NLPromptModalVisibilityService;
  freeGrabModalHierarchyService: FreeGrabModalHierarchyService;
  editorSharedApplyRecordService: EditorSharedApplyRecordService;
}
