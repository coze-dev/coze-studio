import {
  type ApplicationShell,
  createBoxLayout,
  type BoxLayout,
  createSplitLayout,
  SplitPanel,
  BoxPanel,
} from '@coze-project-ide/client';

export const customLayout = (
  shell: ApplicationShell,
  uiBuilderPanel: BoxPanel,
): BoxLayout => {
  const bottomSplitLayout = createSplitLayout([shell.mainPanel], [1], {
    orientation: 'vertical',
    spacing: 0,
  });
  shell.bottomSplitLayout = bottomSplitLayout;
  const middleContentPanel = new SplitPanel({ layout: bottomSplitLayout });

  const leftRightSplitLayout = createBoxLayout(
    [
      // 左边的不可伸缩 bar
      shell.primarySidebar,
      middleContentPanel,
    ],
    [0, 1],
    {
      direction: 'left-to-right',
      spacing: 6,
    },
  );
  const mainDockPanel = new BoxPanel({ layout: leftRightSplitLayout });

  const centerLayout = createBoxLayout(
    [mainDockPanel, uiBuilderPanel, shell.secondarySidebar],
    [1, 0, 0],
    {
      direction: 'left-to-right',
    },
  );
  const centerPanel = new BoxPanel({ layout: centerLayout });

  return createBoxLayout([shell.topPanel, centerPanel], [0, 1], {
    direction: 'top-to-bottom',
    spacing: 0,
  });
};
