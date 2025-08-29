/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createRoot } from 'react-dom/client';
import { initI18nInstance } from '@coze-arch/i18n/raw';
import { dynamicImportMdBoxStyle } from '@coze-arch/bot-md-box-adapter/style';
import { pullFeatureFlags, type FEATURE_FLAGS } from '@coze-arch/bot-flags';
import { useSpaceStore } from '@coze-foundation/space-store-adapter';
import { performSsoLogin } from '@coze-foundation/account-ui-adapter';
import { getLoginStatus,logoutOnly} from '@coze-foundation/foundation-sdk';

import { App } from './app';
import './global.less';
import './index.less';

const initFlags = () => {
  pullFeatureFlags({
    timeout: 1000 * 4,
    fetchFeatureGating: () => Promise.resolve({} as unknown as FEATURE_FLAGS),
  });
};

const checkSSOstatus = () =>{
  // ✨ 关键步骤 2：优先从 localStorage 同步读取状态
  const persistedStatus = localStorage.getItem('loginStatus');
  // console.log(persistedStatus)
  if (persistedStatus === 'logined') {
    return 'logined'; // 如果硬盘上有记录，直接返回"已登录"，无需再看内存
  }
  return getLoginStatus(); 
}

const main = async () => {
  
   if (!window.__POWERED_BY_WUJIE__) {
    console.warn("Direct access detected. Redirecting to the main application...");
    
    // Redirect the user to the main app's URL
    window.location.href = 'http://172.25.1.180:5173'; // <-- Replace with your main app's actual URL
    
    // Stop any further execution of this script
    return; 
  }
  if (window.__POWERED_BY_WUJIE__) {
    // Get token from props passed by the main application
    const authToken = window.$wujie?.props?.authToken;

    if (authToken) {
      // console.log("Sub-app received authToken from Wujie:", authToken);
      // Store the token so the rest of the app can use it
      // This is a simple and effective way for other parts of your app to find the token
      const currentToken = authToken;
      useSpaceStore.getState().setRailToken(currentToken);
      if (checkSSOstatus() != 'logined') {
      await performSsoLogin({ctx: currentToken,});

      // console.log('[子应用] performSsoLogin 返回的用户:', user);
    }
      // localStorage.setItem("subapp-auth-token", authToken);
    } else {
      // console.warn("Running in Wujie, but no authToken was provided in props.");
    }
    window.$wujie?.bus.$on("main-app-logout", () => {
      // console.log("子应用接收到 main-app-logout 事件，执行登出...");
      logoutOnly()
      // Call your sub-app's logout logic here
      // For example:
      localStorage.removeItem('loginStatus');
    });

  }
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

  const $root = document.getElementById('root');
  if (!$root) {
    throw new Error('root element not found');
  }
  const root = createRoot($root);



  root.render(<App />);
};

main();

