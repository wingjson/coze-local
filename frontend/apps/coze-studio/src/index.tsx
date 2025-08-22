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
import { performSsoLogin } from '@coze-foundation/account-ui-adapter';
import { getLoginStatus, getUserInfo } from '@coze-foundation/foundation-sdk';
import { useSpaceStore } from '@coze-foundation/space-store-adapter';
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
  dynamicImportMdBoxStyle();
}

let unsubscribeFromStore;
export async function mount(props: any) {
  console.log('[coze-studio] mount');
  const { authStore } = props;
  if (authStore) {
    // 1. **读取初始 token**
    console.log(getLoginStatus(), 1234456789);
    const currentToken = authStore.token;
    useSpaceStore.getState().setRailToken(currentToken);
    // console.log(
    //  '[子应用] 首次获取的 token:',
    //useSpaceStore.getState().railtoken,
    //);
    if (getLoginStatus() != 'logined') {
      const user = await performSsoLogin({
        ctx: currentToken,
      });

      console.log('[子应用] performSsoLogin 返回的用户:', user);
    }
  }

  render(props);
}

export async function unmount() {
  console.log('[coze-studio] unmount');
  if (root) {
    root.unmount();
    root = null;
  }
}

if (!(window as any).__POWERED_BY_QIANKUN__) {
  bootstrap().then(() => mount({}));
}

