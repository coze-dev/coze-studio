import path from 'path';

const stylingLoader = {
  name: '@storybook/addon-styling-webpack',
  options: {
    rules: [
      // Replaces existing CSS rules to support PostCSS
      // https://storybook.js.org/addons/@storybook/addon-styling-webpack
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {importLoaders: 1}
          },
          {
            // Gets options from `postcss.config.js` in your project root
            loader: 'postcss-loader',
            options: {implementation: require.resolve('postcss')}
          }
        ],
      },
      {
        test: /\.scss$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {implementation: require.resolve("sass")}
          },
        ],
        include: path.resolve(__dirname, '../src'),
      },
      {
        test: /\.less$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "less-loader",
            options: {implementation: require.resolve("less")}
          },
          {
            // Gets options from `postcss.config.js` in your project root
            loader: 'postcss-loader',
            options: {implementation: require.resolve('postcss')}
          },
        ],
      },
    ]
  }
};

export default stylingLoader;

