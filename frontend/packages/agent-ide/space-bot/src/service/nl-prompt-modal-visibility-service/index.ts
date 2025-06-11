import mitt, { type Emitter } from 'mitt';
import { EVENT_NAMES } from '@coze-arch/bot-tea';
import {
  type NLPromptModalPosition,
  type NLPromptModalAction,
} from '@coze-agent-ide/bot-editor-context-store';

import { type NLPromptModalVisibilityProps } from './type';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- mitt 不认 interface
type VisibilityEvent = {
  visibilitychange:
    | { isShow: true; openModalSource: OpenModalSource }
    | { isShow: false; openModalSource: null };
};

type OpenModalSource = 'ai-button' | 'editor-float-trigger' | 'editor-shortcut';

export class NLPromptModalVisibilityService {
  eventCenter: Emitter<VisibilityEvent> = mitt();
  openModalSource: OpenModalSource | null = null;
  private setVisible: NLPromptModalAction['setVisible'];
  private updateModalPosition: NLPromptModalAction['updatePosition'];
  private sendTeaEvent: NLPromptModalVisibilityProps['sendTeaEvent'];
  public getIsVisible: () => boolean;
  constructor({
    setVisible,
    updateModalPosition,
    getIsVisible,
    sendTeaEvent,
  }: NLPromptModalVisibilityProps) {
    this.setVisible = setVisible;
    this.updateModalPosition = updateModalPosition;
    this.getIsVisible = getIsVisible;
    this.sendTeaEvent = sendTeaEvent;
  }
  public open = (position: NLPromptModalPosition, source: OpenModalSource) => {
    this.setVisible(true);
    this.updateModalPosition(() => position);
    this.openModalSource = source;
    this.eventCenter.emit('visibilitychange', {
      isShow: true,
      openModalSource: source,
    });
  };
  public updatePosition = (
    updateFn: (position: NLPromptModalPosition) => NLPromptModalPosition,
  ) => {
    this.updateModalPosition(updateFn);
  };
  public close = () => {
    if (!this.getIsVisible()) {
      return;
    }
    this.setVisible(false);
    this.eventCenter.emit('visibilitychange', {
      isShow: false,
      openModalSource: null,
    });
    this.sendTeaEvent(EVENT_NAMES.prompt_optimize_front, {
      action: 'exit',
    });
  };
  public getOpenModalSource = () => this.openModalSource;
}
