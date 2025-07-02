import { inject, injectable } from 'inversify';
import { type URI } from '@coze-project-ide/core';

import { WidgetManager } from '../widget-manager';
import { type ReactWidget } from '../widget/react-widget';
import { ViewRenderer } from '../view-renderer';
import { ApplicationShell } from '../shell';
import { Drag } from '../lumino/dragdrop';
import { MimeData } from '../lumino/coreutils';

export interface DragPropsType {
  /**
   * 拖拽打开分屏的 URI
   */
  uris: URI[];
  /**
   * startDrag event 位置数据
   */
  position: {
    clientX: number;
    clientY: number;
  };
  /**
   * 拖拽元素回显，不传不展示
   */
  dragImage?: HTMLElement;
  /**
   * 拖拽完成后回调
   * action: 'move' | 'copy' | 'link' | 'none'
   */
  callback: (action: Drag.DropAction) => void;
  backdropTransform?: Drag.BackDropTransform;
}

/**
 * DragService 主要用于分屏操作
 */
@injectable()
export class DragService {
  @inject(ApplicationShell) shell: ApplicationShell;

  @inject(WidgetManager) widgetManager: WidgetManager;

  @inject(ViewRenderer) viewRenderer: ViewRenderer;

  /**
   * 业务侧手动拖拽触发分屏（侧边栏文件树拖拽进入开始分屏）
   */
  startDrag({
    uris,
    position,
    dragImage,
    callback,
    backdropTransform,
  }: DragPropsType) {
    const { clientX, clientY } = position;
    const mimeData = new MimeData();
    const factory = async () => {
      const widgets: ReactWidget[] = [];
      await Promise.all(
        uris.map(async uri => {
          const factory = this.widgetManager.getFactoryFromURI(uri)!;
          const widget = await this.widgetManager.getOrCreateWidgetFromURI(
            uri,
            factory,
          );
          this.viewRenderer.addReactPortal(widget);
          widgets.push(widget);
        }),
      );
      return widgets;
    };
    mimeData.setData('application/vnd.lumino.widget-factory', factory);
    const drag = new Drag({
      document,
      mimeData,
      dragImage,
      proposedAction: 'move',
      supportedActions: 'move',
      /**
       * 仅支持在主面板区域分屏
       */
      source: this.shell.mainPanel,
      backdropTransform,
    });
    drag.start(clientX, clientY).then(callback);
  }
}
