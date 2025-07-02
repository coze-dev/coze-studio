export interface IEventCallbacks {
  onAllToolHiddenStatusChange: (isAllHidden: boolean) => void;
  onInitialed: () => void;
  onDestroy: () => void;
}
