import { addons } from '@storybook/manager-api';
import theme from './theme';

addons.setConfig({
    theme: theme,
    showRoots: true,
    colorSecondary: "#5859ff",
    appBg: "#f0f0f0",
    appBorderColor: "#ccc",
    appBorderRadius: 0,
    textColor: "#333",
    barTextColor: "#666",
    barSelectedColor: "pink",
})
