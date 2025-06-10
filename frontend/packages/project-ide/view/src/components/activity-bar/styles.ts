import { useStyling as useStylingCore } from '@coze-project-ide/core';

export const useStyling = () => {
  useStylingCore(
    'flowide-activity-bar-widget',
    (_, { getColor }) => `
    .activity-bar-widget-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;

      .top-container, .bottom-container {
        display: flex;
        flex-direction: column;
      }

      .item-container {
        cursor: pointer;
        position: relative;
        color: ${getColor('flowide.color.base.text.2')};
      }
      .item-container.active {
        color: ${getColor('flowide.color.base.text.0')};
      }
      .item-container.selected {
        color: ${getColor('flowide.color.base.text.0')};
      }
      .item-container.selected::before {
        content: "";
        position: absolute;
        width: 2px;
        height: 100%;
        background: ${getColor('flowide.color.base.primary')};
      }
      .item-container:hover {
        color: ${getColor('flowide.color.base.text.0')};
      }

      .item-container > i {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        text-align: center;
        color: inherit;

        width: 36px;
        height: 36px;
        mask-repeat: no-repeat;
        -webkit-mask-repeat: no-repeat;
        mask-size: 24px;
        -webkit-mask-size: 24px;
        mask-position: 50% 50%;
        -webkit-mask-position: 50% 50%;
      }
    }`,
  );
};
