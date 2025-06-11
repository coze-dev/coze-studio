import { inject, injectable } from 'inversify';
import { ProjectResourceActionKey } from '@coze-arch/bot-api/plugin_develop';
import {
  ContextKeyService,
  Emitter,
  type Event,
  RESOURCE_FOLDER_CONTEXT_KEY,
  type ResourceFolderShortCutContextType,
  type IdType,
} from '@coze-project-ide/framework';

import { isResourceActionEnabled } from '../utils';
import { type BizResourceType } from '../type';

export type DuplicateEvent = Pick<
  ResourceFolderShortCutContextType,
  'id' | 'tempSelectedMap'
>;

export interface RenameEvent {
  id: IdType;
}

export type CreateResourceEvent = Pick<ResourceFolderShortCutContextType, 'id'>;
@injectable()
export class CustomResourceFolderShortcutService {
  private onDuplicateEmitter = new Emitter<DuplicateEvent>();
  private onCreateResourceEmitter = new Emitter<CreateResourceEvent>();
  @inject(ContextKeyService)
  protected readonly contextKey: ContextKeyService;
  public onDuplicateEvent: Event<DuplicateEvent> =
    this.onDuplicateEmitter.event;
  public onCreateResourceEvent: Event<CreateResourceEvent> =
    this.onCreateResourceEmitter.event;
  private onRenameResourceEmitter = new Emitter<RenameEvent>();
  public onRenameResource = this.onRenameResourceEmitter.event;

  public isResourceActionEnabled(action: ProjectResourceActionKey): boolean {
    return Object.values(
      this.resourceFolderDispatch?.tempSelectedMap || {},
    ).every(resource =>
      isResourceActionEnabled(resource as BizResourceType, action),
    );
  }

  public renameResource(id?: IdType) {
    if (id) {
      this.onRenameResourceEmitter.fire({ id });
      return;
    }
    if (this.isResourceActionEnabled(ProjectResourceActionKey.Rename)) {
      this.resourceFolderDispatch?.onEnter?.();
    }
  }

  public deleteResource() {
    if (this.isResourceActionEnabled(ProjectResourceActionKey.Delete)) {
      this.resourceFolderDispatch?.onDelete?.();
    }
  }

  public duplicateResource() {
    if (this.isResourceActionEnabled(ProjectResourceActionKey.Copy)) {
      this.onDuplicateEmitter.fire({
        id: this.resourceFolderDispatch.id,
        tempSelectedMap: this.resourceFolderDispatch.tempSelectedMap,
      });
    }
  }

  private get resourceFolderDispatch() {
    return this.contextKey.getContext<ResourceFolderShortCutContextType>(
      RESOURCE_FOLDER_CONTEXT_KEY,
    );
  }

  public createResource() {
    this.onCreateResourceEmitter.fire({
      id: this.resourceFolderDispatch.id,
    });
  }
}
