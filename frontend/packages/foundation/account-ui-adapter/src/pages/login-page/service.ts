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

import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import { useRequest } from 'ahooks';
import { passport } from '@coze-studio/api-schema';
import { useSpaceStore } from '@coze-foundation/space-store-adapter';
import {
  setUserInfo,
  useLoginStatus,
  type UserInfo,
} from '@coze-foundation/account-adapter';

export const useLoginService = ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const loginService = useRequest(
    async () => {
      const res = (await passport.PassportWebEmailLoginPost({
        email,
        password,
      })) as unknown as { data: UserInfo };
      return res.data;
    },
    {
      manual: true,
      onSuccess: userInfo => {
        // ✨ 2. 在 onSuccess 回调中进行调用
        console.log('登录成功，设置用户信息...');
        setUserInfo(userInfo); // 保留原有逻辑

        console.log('开始获取用户空间数据...');
        useSpaceStore.getState().fetchSpaces(true); // 添加新逻辑
      },
    },
  );

  const registerService = useRequest(
    async () => {
      const res = (await passport.PassportWebEmailRegisterV2Post({
        email,
        password,
      })) as unknown as { data: UserInfo };
      return res.data;
    },
    {
      manual: true,
      // onSuccess: setUserInfo,
      onSuccess: userInfo => {
        // ✨ 2. 在 onSuccess 回调中进行调用
        console.log('登录成功，设置用户信息...');
        setUserInfo(userInfo); // 保留原有逻辑

        console.log('开始获取用户空间数据...');
        useSpaceStore.getState().fetchSpaces(true); // 添加新逻辑
      },
    },
  );

  const loginStatus = useLoginStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (loginStatus === 'logined') {
      navigate('/');
    }
  }, [loginStatus]);

  return {
    login: loginService.run,
    register: registerService.run,
    loginLoading: loginService.loading,
    registerLoading: registerService.loading,
  };
};
