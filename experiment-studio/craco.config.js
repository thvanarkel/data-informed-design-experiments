const CracoLessPlugin = require('craco-less');

module.exports = {
  webpack: {
        configure: {
            target: 'electron-renderer'
        }
    },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#1DA57A',
              '@layout-body-background': '#fff',
              '@layout-sider-background-light': '#f0f2f5',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
