export interface AudioRecordProps {
  isPointerMoveOut?: boolean;
  isRecording?: boolean;
  getVolume?: () => number;
  text?: string;
}

type EventType = MouseEvent | TouchEvent | KeyboardEvent;
type InteractionEventType = EventType | KeyboardEvent;

export interface AudioRecordEvents {
  onStart?: (eventType: InteractionEventType) => void;
  onEnd?: (eventType: InteractionEventType | undefined) => void;
  onMoveLeave?: () => void;
  onMoveEnter?: () => void;
}

export interface AudioRecordOptions {
  getIsShortcutKeyDisabled?: () => boolean;
  /** 参考 ahooks useKeypress 入参 */
  shortcutKey?: string | number;
  enabled?: boolean;
  getActiveZoneTarget?: () => HTMLElement | null;
}
