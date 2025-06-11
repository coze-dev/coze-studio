import { DocsContainer as BaseContainer } from "@storybook/addon-docs";
import { useDarkMode } from "storybook-dark-mode";
import { themes } from "@storybook/theming";

export const DocsContainer = ({ children, context, ...rest }) => {
  const { dark, light } = themes

  return (
    <BaseContainer
      context={context}
      {...rest}
      theme={useDarkMode() ? dark : light}
    >
      {children}
    </BaseContainer>
  );
};
