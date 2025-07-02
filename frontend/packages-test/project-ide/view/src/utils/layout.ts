import {
  type Widget,
  BoxPanel,
  BoxLayout,
  SplitLayout,
  SplitPanel,
} from '../lumino/widgets';

export const createBoxLayout = (
  widgets: Widget[],
  stretch?: number[],
  options?: BoxPanel.IOptions,
): BoxLayout => {
  const boxLayout = new BoxLayout(options);
  for (let i = 0; i < widgets.length; i++) {
    if (stretch !== undefined && i < stretch.length) {
      BoxPanel.setStretch(widgets[i], stretch[i]);
    }
    boxLayout.addWidget(widgets[i]);
  }
  return boxLayout;
};

export const createSplitLayout = (
  widgets: Widget[],
  stretch?: number[],
  options?: Partial<SplitLayout.IOptions>,
): SplitLayout => {
  let optParam: SplitLayout.IOptions = {
    renderer: SplitPanel.defaultRenderer,
  };
  if (options) {
    optParam = { ...optParam, ...options };
  }
  const splitLayout = new SplitLayout(optParam);
  for (let i = 0; i < widgets.length; i++) {
    if (stretch !== undefined && i < stretch.length) {
      SplitPanel.setStretch(widgets[i], stretch[i]);
    }
    splitLayout.addWidget(widgets[i]);
  }
  return splitLayout;
};
