export interface InsertImageAction {
  type: 'image';
  sync: false;
  payload: {
    file: File;
  };
}

export interface InsertLinkAction {
  type: 'link';
  sync: true;
  payload: {
    text: string;
    link: string;
  };
}

export interface InsertVariableAction {
  type: 'variable';
  sync: true;
  payload: {
    variableTemplate: string;
  };
}

export type SyncAction = InsertLinkAction | InsertVariableAction;

export type AsyncAction = InsertImageAction;

export type TriggerAction = SyncAction | AsyncAction;

export interface UploadState {
  percent: number;
  fileName: string;
}
