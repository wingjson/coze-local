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

import { useParams } from 'react-router-dom';
import { type FC, type PropsWithChildren } from 'react';

import { GlobalLayout } from '@coze-foundation/layout';
import { useCreateBotAction } from '@coze-foundation/global';
import { RequireAuthContainer } from '@coze-foundation/account-ui-adapter';
import { I18n } from '@coze-arch/i18n';
import { useRouteConfig } from '@coze-arch/bot-hooks';
import { useSpaceStore } from '@coze-foundation/space-store';
import {
  IconCozPlusCircle,
  IconCozWorkspace,
  IconCozWorkspaceFill,
  IconCozCompass,
  IconCozCompassFill,
  IconCozDocument,
  IconCozBot,
  IconCozBotFill,
  IconCozKnowledge,
  IconCozKnowledgeFill,
} from '@coze-arch/coze-design/icons';

import { AccountDropdown } from '../account-dropdown';
import { useHasSider } from './hooks/use-has-sider';

export const GlobalLayoutComposed: FC<PropsWithChildren> = ({ children }) => {
  const config = useRouteConfig();
  const hasSider = useHasSider();
  const { space_id } = useParams();
  const personalSpaceID = useSpaceStore.getState().getPersonalSpaceID();
  const { createBot, createBotModal } = useCreateBotAction({
    currentSpaceId: space_id,
  });

  return (
    <RequireAuthContainer
      needLogin={!!config.requireAuth}
      loginOptional={!!config.requireAuthOptional}
    >
      <GlobalLayout
        hasSider={hasSider}
        banner={null}
        actions={[
          {
            icon: <IconCozPlusCircle />,
            onClick: createBot,
            dataTestId: 'layout_create-agent-button',
            className: '!w-[200px] !h-[35px] !bg-[#4780ff]',
            label: '创建智能体',
            iconClass: '!text-white flex items-center gap-x-2',
          },
        ]}
        menus={[
          // {
          //   title: I18n.t('navigation_workspace'),
          //   icon: <IconCozWorkspace />,
          //   activeIcon: <IconCozWorkspaceFill />,
          //   path: '/space',
          //   dataTestId: 'layout_workspace-button',
          // },
          // {
          //   title: I18n.t('menu_title_store'),
          //   icon: <IconCozCompass />,
          //   activeIcon: <IconCozCompassFill />,
          //   path: '/explore',
          //   dataTestId: 'layout_explore-button',
          // },
          {
            title: I18n.t('menu_title_tmpl'),
            icon: <IconCozCompass />,
            activeIcon: <IconCozCompassFill />,
            path: '/explore/template',
            dataTestId: 'layout_explore-button',
          },
          {
            icon: <IconCozBot />,
            activeIcon: <IconCozBotFill />,
            title: I18n.t('menu_title_myagent'),
            path: `/space/${personalSpaceID}/develop`,
            dataTestId: 'navigation_workspace_develop',
          },
          {
            icon: <IconCozKnowledge />,
            activeIcon: <IconCozKnowledgeFill />,
            title: I18n.t('menu_title_knowledge'),
            path: `/space/${personalSpaceID}/library`,
            dataTestId: 'navigation_workspace_library',
          },
          {
            title: I18n.t('menu_title_plug'),
            icon: <IconCozCompass />,
            activeIcon: <IconCozCompassFill />,
            path: '/explore/plugin',
            dataTestId: 'layout_explore-button',
          },
        ]}
        // extras={[
        //   {
        //     icon: <IconCozDocument />,
        //     tooltip: I18n.t('menu_documents'),
        //     onClick: () => {
        //       // cp-disable-next-line
        //       window.open('https://www.coze.cn/open/docs/guides');
        //     },
        //     dataTestId: 'layout_document-button',
        //   },
        // ]}
        footer={<AccountDropdown />}
      >
        {children}
        {createBotModal}
      </GlobalLayout>
    </RequireAuthContainer>
  );
};
