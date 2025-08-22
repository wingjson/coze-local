// /*
//  * Copyright 2025 coze-dev Authors
//  *
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *     http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */

// import path from 'path';

// import { defineConfig } from '@coze-arch/rsbuild-config';
// import { GLOBAL_ENVS } from '@coze-arch/bot-env';

// const API_PROXY_TARGET = `http://localhost:${
//   process.env.WEB_SERVER_PORT || 8888
// }/`;

// const mergedConfig = defineConfig({
//   server: {
//     strictPort: true,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//     },
//     proxy: [
//       {
//         context: ['/api'],
//         target: API_PROXY_TARGET,
//         secure: false,
//         changeOrigin: true,
//       },
//     ],
//   },
//   dev: {
//     // 关键：自动处理开发环境下的 publicPath
//     // Rsbuild 会将其设置为 http://localhost:3002/
//     assetPrefix: true,
//   },
//   output: {
//     // 关键：打包成 qiankun 需要的 umd 格式
//     library: {
//       name: `coze-studio-[name]`,
//       type: 'umd',
//     },
//     // 防止多个微前端实例的 webpackJsonp 全局变量冲突
//     chunkLoadingGlobal: `webpackJsonp_coze-studio`,
//     // 生产环境的资源路径，未来部署时需要根据你的实际情况修改
//     // assetPrefix: 'https://your-cdn.com/coze-studio/',
//   },

//   html: {
//     title: '铁科智问智能体平台',
//     favicon: './assets/favicon.png',
//     template: './index.html',
//     crossorigin: 'anonymous',
//   },
//   tools: {
//     postcss: (opts, { addPlugins }) => {
//       // eslint-disable-next-line @typescript-eslint/no-require-imports
//       addPlugins([require('tailwindcss')('./tailwind.config.ts')]);
//     },
//     rspack(config, { appendPlugins, addRules, mergeConfig }) {
//       addRules([
//         {
//           test: /\.(css|less|jsx|tsx|ts|js)/,
//           exclude: [
//             new RegExp('apps/coze-studio/src/index.css'),
//             /node_modules/,
//             new RegExp('packages/arch/i18n'),
//           ],
//           use: '@coze-arch/import-watch-loader',
//         },
//       ]);

//       return mergeConfig(config, {
//         module: {
//           parser: {
//             javascript: {
//               exportsPresence: false,
//             },
//           },
//         },
//         resolve: {
//           fallback: {
//             path: require.resolve('path-browserify'),
//           },
//         },
//         watchOptions: {
//           poll: true,
//         },
//         ignoreWarnings: [
//           /Critical dependency: the request of a dependency is an expression/,
//           warning => true,
//         ],
//       });
//     },
//   },
//   source: {
//     define: {
//       'process.env.IS_REACT18': JSON.stringify(true),
//       // Arcosite editor sdk internal use
//       'process.env.ARCOSITE_SDK_REGION': JSON.stringify(
//         GLOBAL_ENVS.IS_OVERSEA ? 'VA' : 'CN',
//       ),
//       'process.env.ARCOSITE_SDK_SCOPE': JSON.stringify(
//         GLOBAL_ENVS.IS_RELEASE_VERSION ? 'PUBLIC' : 'INSIDE',
//       ),
//       'process.env.TARO_PLATFORM': JSON.stringify('web'),
//       'process.env.SUPPORT_TARO_POLYFILL': JSON.stringify('disabled'),
//       'process.env.RUNTIME_ENTRY': JSON.stringify('@coze-dev/runtime'),
//       'process.env.TARO_ENV': JSON.stringify('h5'),
//       ENABLE_COVERAGE: JSON.stringify(false),
//     },
//     include: [
//       path.resolve(__dirname, '../../packages'),
//       path.resolve(__dirname, '../../infra/flags-devtool'),
//       // The following packages contain undegraded ES 2022 syntax (private methods) that need to be packaged
//       /\/node_modules\/(marked|@dagrejs|@tanstack)\//,
//     ],
//     alias: {
//       '@coze-arch/foundation-sdk': require.resolve(
//         '@coze-foundation/foundation-sdk',
//       ),
//       'react-router-dom': require.resolve('react-router-dom'),
//     },
//     /**
//      * support inversify @injectable() and @inject decorators
//      */
//     decorators: {
//       version: 'legacy',
//     },
//   },
//   performance: {
//     chunkSplit: {
//       strategy: 'split-by-size',
//       minSize: 3_000_000,
//       maxSize: 6_000_000,
//     },
//   },
// });

// export default mergedConfig;

/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import path from 'path';
import { defineConfig } from '@coze-arch/rsbuild-config';
import { GLOBAL_ENVS } from '@coze-arch/bot-env';

// const API_PROXY_TARGET = `http://localhost:${
//   process.env.WEB_SERVER_PORT || 8888
// }/`;
const API_PROXY_TARGET = `http://172.27.115.35:${
  process.env.WEB_SERVER_PORT || 8888
}/`;
// http://172.25.1.180
const appName = 'coze-studio';

const mergedConfig = defineConfig({
  server: {
    port: 5174, // 为子应用分配一个独立的端口
    strictPort: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: [
      {
        context: ['/api'],
        target: API_PROXY_TARGET,
        secure: false,
        changeOrigin: true,
      },
      {
        context: ['/v1'],
        target: API_PROXY_TARGET,
        secure: false,
        changeOrigin: true,
      },
    ],
  },

  dev: {
    // assetPrefix: true,
    assetPrefix: 'http://172.25.1.180:5174/',
    // assetPrefix: './',
  },

  // [注意] 我们已经移除了顶层的 output 配置

  html: {
    title: '铁科智问智能体平台',
    favicon: './assets/favicon.png',
    template: './index.html',
    crossorigin: 'anonymous',
  },
  tools: {
    postcss: (opts, { addPlugins }) => {
      addPlugins([require('tailwindcss')('./tailwind.config.ts')]);
    },
    // [关键修改] 我们在这里强制注入 qiankun 需要的 output 配置
    rspack(config, { addRules, mergeConfig }) {
      // --- 你原有的 rspack 修改逻辑 ---
      addRules([
        {
          test: /\.(css|less|jsx|tsx|ts|js)/,
          exclude: [
            new RegExp('apps/coze-studio/src/index.css'),
            /node_modules/,
            new RegExp('packages/arch/i18n'),
          ],
          use: '@coze-arch/import-watch-loader',
        },
      ]);

      const originalModifications = {
        module: {
          parser: {
            javascript: {
              exportsPresence: false,
            },
          },
        },
        resolve: {
          fallback: {
            path: require.resolve('path-browserify'),
          },
        },
        watchOptions: {
          poll: true,
        },
        ignoreWarnings: [
          /Critical dependency: the request of a dependency is an expression/,
          warning => true,
        ],
      };
      // --- 结束原有逻辑 ---

      // --- [新增] qiankun 必须的 output 配置 ---
      const qiankunOutputConfig = {
        output: {
          // 在 rspack 底层，库名和类型是这样设置的
          library: `${appName}-[name]`,
          libraryTarget: 'umd',
          chunkLoadingGlobal: `webpackJsonp_${appName}`,
        },
      };
      // --- 结束新增逻辑 ---

      // 将基础配置、你的原有修改、以及我们新增的 output 配置合并在一起
      return mergeConfig(config, originalModifications, qiankunOutputConfig);
    },
  },
  source: {
    define: {
      'process.env.IS_REACT18': JSON.stringify(true),
      'process.env.ARCOSITE_SDK_REGION': JSON.stringify(
        GLOBAL_ENVS.IS_OVERSEA ? 'VA' : 'CN',
      ),
      'process.env.ARCOSITE_SDK_SCOPE': JSON.stringify(
        GLOBAL_ENVS.IS_RELEASE_VERSION ? 'PUBLIC' : 'INSIDE',
      ),
      'process.env.TARO_PLATFORM': JSON.stringify('web'),
      'process.env.SUPPORT_TARO_POLYFILL': JSON.stringify('disabled'),
      'process.env.RUNTIME_ENTRY': JSON.stringify('@coze-dev/runtime'),
      'process.env.TARO_ENV': JSON.stringify('h5'),
      ENABLE_COVERAGE: JSON.stringify(false),
    },
    include: [
      path.resolve(__dirname, '../../packages'),
      path.resolve(__dirname, '../../infra/flags-devtool'),
      /\/node_modules\/(marked|@dagrejs|@tanstack)\//,
    ],
    alias: {
      '@coze-arch/foundation-sdk': require.resolve(
        '@coze-foundation/foundation-sdk',
      ),
      'react-router-dom': require.resolve('react-router-dom'),
    },
    decorators: {
      version: 'legacy',
    },
  },
  performance: {
    chunkSplit: {
      strategy: 'split-by-size',
      minSize: 3_000_000,
      maxSize: 6_000_000,
    },
  },
});

export default mergedConfig;
