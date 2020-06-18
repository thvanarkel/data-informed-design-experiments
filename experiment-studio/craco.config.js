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
              '@primary-color': '#EE3A2A',
              '@layout-body-background': '#fff',
              '@layout-sider-background-light': '#f0f2f5',
              '@menu-bg': '#f0f2f5',
              '@menu-item-active-bg': '#fff'
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
