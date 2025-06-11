import {themes} from "@storybook/theming";
import type { Preview } from '@storybook/react';
import { DocsContainer } from './doc-container';
import decorators from './decorators';

import '../src/index.css'

const parameters: Preview['parameters'] = {
  actions: {argTypesRegex: "^on[A-Z].*"},
  options: {
    storySort: {
      method: "alphabetical",
      order: ["Foundations", "Components"],
    },
  },
  docs: {
    container: ({children, context}) => {
      return (
        <DocsContainer
          context={context}
        >
          {children}
        </DocsContainer>
      )
    },
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  darkMode: {
    current: "dark",
    stylePreview: true,
    darkClass: "dark",
    lightClass: "light",
    classTarget: "html",
    dark: {
      ...themes.dark,
      appBg: "#161616",
      barBg: "black",
      background: "black",
      appContentBg: "black",
      appBorderRadius: 14,
      // brandImage: "/vite.svg",
    },
    light: {
      ...themes.light,
      appBorderRadius: 14,
      // brandImage: "/vite.svg",
    },
  },
};

const preview: Preview = {
  parameters,
  decorators
}

export default preview;
