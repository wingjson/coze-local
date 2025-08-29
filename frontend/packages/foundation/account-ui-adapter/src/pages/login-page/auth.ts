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

import { passport } from '@coze-studio/api-schema';
import { setUserInfo, type UserInfo } from '@coze-foundation/account-adapter';

/**
 * 这是一个执行 SSO 登录/验证的异步函数。
 * @param {string} token - 从外部获取的单点登录 Token
 * @returns {Promise<UserInfo | null>} - 成功时返回用户信息，失败时返回 null
 */
export async function performSsoLogin({
  ctx,
}: {
  ctx: string;
}): Promise<UserInfo | null> {
  try {
    console.log(
      '[AuthService] 正在尝试使用 Token 进行 SSO 登录..., token:',
      ctx,
    );
    const res = await passport.SsoCheckLoginPost({
      ctx: ctx,
    });
    if (res.code !== 0) {
      throw new Error(`SSO 登录失败: ${res.msg}`);
    }

    const userInfo = res.data;

    if (!userInfo) {
      throw new Error('SSO 登录响应中没有用户信息');
    }

    setUserInfo(userInfo);
    localStorage.setItem('loginStatus', 'logined');
    console.log('[AuthService] SSO 登录成功:', userInfo);

    return userInfo;
  } catch (error) {
    console.error('[AuthService] SSO 登录失败:', error);
    return null;
  }
}
