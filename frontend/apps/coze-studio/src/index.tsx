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

// import { createRoot } from 'react-dom/client';
// import { initI18nInstance } from '@coze-arch/i18n/raw';
// import { dynamicImportMdBoxStyle } from '@coze-arch/bot-md-box-adapter/style';
// import { pullFeatureFlags, type FEATURE_FLAGS } from '@coze-arch/bot-flags';

// import { App } from './app';
// import './global.less';
// import './index.less';

// const initFlags = () => {
//   pullFeatureFlags({
//     timeout: 1000 * 4,
//     fetchFeatureGating: () => Promise.resolve({} as unknown as FEATURE_FLAGS),
//   });
// };

// const main = () => {
//   // Initialize the value of the function switch
//   initFlags();
//   // Initialize i18n
//   initI18nInstance({
//     lng: (localStorage.getItem('i18next') ?? (IS_OVERSEA ? 'en' : 'zh-CN')) as
//       | 'en'
//       | 'zh-CN',
//   });
//   // Import mdbox styles dynamically
//   dynamicImportMdBoxStyle();

//   const $root = document.getElementById('root');
//   if (!$root) {
//     throw new Error('root element not found');
//   }
//   const root = createRoot($root);

//   root.render(<App />);
// };

// main();


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

import { createRoot, type Root } from 'react-dom/client'; // [修改] 导入 Root 类型
import { initI18nInstance } from '@coze-arch/i18n/raw';
import { dynamicImportMdBoxStyle } from '@coze-arch/bot-md-box-adapter/style';
import { pullFeatureFlags, type FEATURE_FLAGS } from '@coze-arch/bot-flags';

import { App } from './app';
import './global.less';
import './index.less';

// [新增] 将 root 实例提升为全局变量，以便 mount 和 unmount 共享
let root: Root | null = null;

const initFlags = () => {
  pullFeatureFlags({
    timeout: 1000 * 4,
    fetchFeatureGating: () => Promise.resolve({} as unknown as FEATURE_FLAGS),
  });
};

// [修改] 将原来的 main 函数逻辑封装成 render 函数
// props 会由 qiankun 传入，其中包含子应用要挂载的 DOM 容器
const render = (props: any) => {
  const { container } = props;
  // 优先使用 qiankun 提供的容器，否则回退到默认的 #root
  const $root = container
    ? container.querySelector('#root')
    : document.getElementById('root');

  if (!$root) {
    throw new Error('root element not found');
  }
  root = createRoot($root);

  root.render(<App />);
};

// [新增] 导出 qiankun 的 bootstrap 生命周期
// 用于执行只需要在应用初始化时执行一次的操作
export async function bootstrap() {
  console.log('[coze-studio] bootstraped');
  // Initialize the value of the function switch
  initFlags();
  // Initialize i18n
  initI18nInstance({
    lng: (localStorage.getItem('i18next') ?? (IS_OVERSEA ? 'en' : 'zh-CN')) as
      | 'en'
      | 'zh-CN',
  });
  // Import mdbox styles dynamically
  dynamicImportMdBoxStyle();
}

// [新增] 导出 qiankun 的 mount 生命周期
// 用于在每次应用被激活时执行，负责渲染应用
export async function mount(props: any) {
  console.log('[coze-studio] mount');
  render(props);
}

// [新增] 导出 qiankun 的 unmount 生命周期
// 用于在每次应用被卸载时执行，负责清理工作
export async function unmount() {
  console.log('[coze-studio] unmount');
  if (root) {
    // 卸载 React 组件
    root.unmount();
    root = null;
  }
}

// [新增] 判断是否在 qiankun 环境下，如果不是，则独立运行
// 这能保证你的应用可以独立开发和调试
if (!(window as any).__POWERED_BY_QIANKUN__) {
  // 独立运行时，手动调用 bootstrap 和 mount
  bootstrap().then(() => mount({}));
}

// [删除] 原来的 main() 调用需要被删除，因为应用的启动现在由 qiankun 或上面的独立运行逻辑来控制
// main();