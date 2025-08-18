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
 * 这是一个普通的异步函数，专门用来执行登录操作。
 * 可以在任何地方（包括路由 loader）调用。
 * @param {string} email - 用户邮箱
 * @param {string} password - 用户密码
 * @returns {Promise<UserInfo | null>} - 成功时返回用户信息，失败时返回 null
 */
export async function performLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<UserInfo | null> {
  try {
    console.log(`[AuthService] 正在尝试使用邮箱 ${email} 登录...`);

    // 1. 直接调用 API 请求
    const res = (await passport.PassportWebEmailLoginPost({
      email,
      password,
    })) as unknown as { data: UserInfo };

    const userInfo = res.data;

    if (!userInfo) {
      throw new Error('登录响应中没有用户信息');
    }

    // 2. 手动调用 setUserInfo 来更新全局状态
    //    因为我们不再使用 useRequest 的 onSuccess 回调了
    setUserInfo(userInfo);

    console.log('[AuthService] 登录成功:', userInfo);

    // 3. 成功后返回用户信息
    return userInfo;
  } catch (error) {
    console.error('[AuthService] 登录失败:', error);
    // 4. 失败后返回 null
    return null;
  }
}
