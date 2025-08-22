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

import { redirect } from 'react-router-dom';
import { getLoginStatus } from '@coze-foundation/foundation-sdk';
import { performSsoLogin } from '@coze-foundation/account-ui-adapter';
import { useSpaceStore } from '@coze-foundation/space-store-adapter';
/**
 * 一个可复用的、用于受保护路由的 loader 函数。
 *
 * 功能：
 * 1. 检查用户是否已登录。
 * 2. 如果未登录，则尝试使用预设凭据自动登录。
 * 3. 如果自动登录失败，则重定向到登录页面。
 * 4. 如果已登录或自动登录成功，则允许访问。
 */
export const protectedRouteLoader = async () => {
  //  console.log(getLoginStatus(), 152563673783);
  // // 先用一个轻量的方法检查是否已登录
  //if (getLoginStatus() == 'logined' || getLoginStatus() == 'setting') {
  //  console.log('[AuthLoader] User is already logged in. Access granted.');
  //  return null; // 已登录，直接放行
  //  }

  // // 如果未登录，则调用我们的新函数尝试自动登录
  // console.log(
  //  '[子应用] 首次获取的 token:11111111111111111111',
  // useSpaceStore.getState().railtoken,
  //);
  //const user = await performSsoLogin({
  //    ctx: useSpaceStore.getState().railtoken,
  // });
  //  console.log('[子应用] performSsoLogin 返回的用户:', user);

  // // 如果登录失败，则跳转到登录页
  // if (!user) {
  //   console.log('[AuthLoader] Auto-login failed, redirecting to /sign.');
  //   return redirect('/sign');
  // }

  // // 登录成功，放行
  // console.log('[AuthLoader] Auto-login successful. Access granted.');
  return null;
};
