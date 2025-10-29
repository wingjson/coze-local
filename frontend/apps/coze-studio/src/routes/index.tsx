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

// import { createBrowserRouter, Navigate } from 'react-router-dom';

// import { SpaceSubModuleEnum } from '@coze-foundation/space-ui-adapter';
// import { GlobalError } from '@coze-foundation/layout';
// import { BaseEnum } from '@coze-arch/web-context';

// import { Layout } from '../layout';
// import {
//   LoginPage,
//   SpaceLayout,
//   SpaceIdLayout,
//   Develop,
//   AgentIDELayout,
//   AgentIDE,
//   AgentPublishPage,
//   Redirect,
//   spaceSubMenu,
//   exploreSubMenu,
//   WorkflowPage,
//   ProjectIDE,
//   ProjectIDEPublish,
//   Library,
//   PluginLayout,
//   PluginToolPage,
//   PluginPage,
//   KnowledgePreview,
//   KnowledgeUpload,
//   DatabaseDetail,
//   ExplorePluginPage,
//   ExploreTemplatePage,
// } from './async-components';

// export const router: ReturnType<typeof createBrowserRouter> =
//   createBrowserRouter([
//     // Document routing
//     {
//       path: '/open/docs/*',
//       Component: Redirect,
//       loader: () => ({
//         hasSider: false,
//         requireAuth: false,
//       }),
//     },
//     {
//       path: '/docs/*',
//       Component: Redirect,
//       loader: () => ({
//         hasSider: false,
//         requireAuth: false,
//       }),
//     },
//     {
//       path: '/information/auth/success',
//       Component: Redirect,
//       loader: () => ({
//         hasSider: false,
//         requireAuth: false,
//       }),
//     },
//     // main application route
//     {
//       path: '/',
//       Component: Layout,
//       errorElement: <GlobalError />,
//       children: [
//         {
//           index: true,
//           element: <Navigate to="/space" replace />,
//         },
//         // login page routing
//         {
//           path: 'sign',
//           Component: LoginPage,
//           errorElement: <GlobalError />,
//           loader: () => ({
//             hasSider: false,
//             requireAuth: false,
//           }),
//         },

//         // Workspace Routing
//         {
//           path: 'space',
//           Component: SpaceLayout,
//           loader: () => ({
//             hasSider: true,
//             requireAuth: true,
//             subMenu: spaceSubMenu,
//             menuKey: BaseEnum.Space,
//           }),
//           children: [
//             {
//               path: ':space_id',
//               Component: SpaceIdLayout,
//               children: [
//                 {
//                   index: true,
//                   element: <Navigate to="develop" replace />,
//                 },

//                 // Project Development
//                 {
//                   path: 'develop',
//                   Component: Develop,
//                   loader: () => ({
//                     subMenuKey: SpaceSubModuleEnum.DEVELOP,
//                   }),
//                 },

//                 // Agent IDE
//                 {
//                   path: 'bot/:bot_id',
//                   Component: AgentIDELayout,
//                   children: [
//                     {
//                       index: true,
//                       Component: AgentIDE,
//                     },
//                     {
//                       path: 'publish',
//                       children: [
//                         {
//                           index: true,
//                           Component: AgentPublishPage,
//                           loader: () => ({
//                             hasSider: false,
//                             requireBotEditorInit: false,
//                             pageName: 'publish',
//                           }),
//                         },
//                       ],
//                     },
//                   ],
//                   loader: () => ({
//                     hasSider: false,
//                     showMobileTips: true,
//                     requireBotEditorInit: true,
//                     pageName: 'bot',
//                   }),
//                 },

//                 // Project IDE
//                 {
//                   path: 'project-ide/:project_id/publish',
//                   loader: () => ({
//                     hasSider: false,
//                   }),
//                   Component: ProjectIDEPublish,
//                 },
//                 {
//                   path: 'project-ide/:project_id/*',
//                   Component: ProjectIDE,
//                   loader: () => ({
//                     hasSider: false,
//                   }),
//                 },

//                 // resource library
//                 {
//                   path: 'library',
//                   Component: Library,
//                   loader: () => ({
//                     subMenuKey: SpaceSubModuleEnum.LIBRARY,
//                   }),
//                 },

//                 // Knowledge Base Resources
//                 {
//                   path: 'knowledge',
//                   children: [
//                     {
//                       path: ':dataset_id',
//                       element: <KnowledgePreview />,
//                     },
//                     {
//                       path: ':dataset_id/upload',
//                       element: <KnowledgeUpload />,
//                     },
//                   ],
//                   loader: () => ({
//                     pageModeByQuery: true,
//                   }),
//                 },

//                 // database resources
//                 {
//                   path: 'database',
//                   children: [
//                     {
//                       path: ':table_id',
//                       element: <DatabaseDetail />,
//                     },
//                   ],
//                   loader: () => ({
//                     showMobileTips: true,
//                     pageModeByQuery: true,
//                   }),
//                 },

//                 // plugin resources
//                 {
//                   path: 'plugin/:plugin_id',
//                   Component: PluginLayout,
//                   children: [
//                     {
//                       index: true,
//                       Component: PluginPage,
//                     },
//                     {
//                       path: 'tool/:tool_id',
//                       children: [
//                         {
//                           index: true,
//                           Component: PluginToolPage,
//                         },
//                       ],
//                     },
//                   ],
//                 },
//               ],
//             },
//           ],
//         },

//         // workflow routing
//         {
//           path: 'work_flow',
//           Component: WorkflowPage,
//           loader: () => ({
//             hasSider: false,
//             requireAuth: true,
//           }),
//         },

//         // explore
//         {
//           path: 'explore',
//           Component: null,
//           loader: () => ({
//             hasSider: true,
//             requireAuth: true,
//             subMenu: exploreSubMenu,
//             menuKey: BaseEnum.Explore,
//           }),
//           children: [
//             {
//               index: true,
//               element: <Navigate to="plugin" replace />,
//             },
//             // plugin store
//             {
//               path: 'plugin',
//               element: <ExplorePluginPage />,
//               loader: () => ({
//                 type: 'plugin',
//               }),
//             },
//             // template
//             {
//               path: 'template',
//               element: <ExploreTemplatePage />,
//               loader: () => ({
//                 type: 'template',
//               }),
//             },
//           ],
//         },
//       ],
//     },
//   ]);
/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';

import { SpaceSubModuleEnum } from '@coze-foundation/space-ui-adapter';
import { GlobalError } from '@coze-foundation/layout';
import { BaseEnum } from '@coze-arch/web-context';

import { Layout } from '../layout';
import {
  LoginPage,
  SpaceLayout,
  SpaceIdLayout,
  Develop,
  AgentIDELayout,
  AgentIDE,
  AgentPublishPage,
  Redirect,
  spaceSubMenu,
  exploreSubMenu,
  WorkflowPage,
  SearchPage,
  ProjectIDE,
  ProjectIDEPublish,
  Library,
  PluginLayout,
  PluginToolPage,
  PluginPage,
  KnowledgePreview,
  KnowledgeUpload,
  DatabaseDetail,
  ExplorePluginPage,
  ExploreTemplatePage,
} from './async-components';

// --- [关键修改] ---
// 根据是否在 qiankun 环境下，动态设置 basename
const basename = (window as any).__POWERED_BY_QIANKUN__
  ? '/railchat/railagent' // 必须和主应用里配置的 activeRule 一致
  : '/';
// --- [结束修改] ---

const routes = [
  // Document routing
  {
    path: '/open/docs/*',
    Component: Redirect,
    loader: () => ({
      hasSider: false,
      requireAuth: false,
    }),
  },
  {
    path: '/docs/*',
    Component: Redirect,
    loader: () => ({
      hasSider: false,
      requireAuth: false,
    }),
  },
  {
    path: '/information/auth/success',
    Component: Redirect,
    loader: () => ({
      hasSider: false,
      requireAuth: false,
    }),
  },
  // main application route
  {
    path: '/',
    Component: Layout,
    errorElement: <GlobalError />,
    children: [
      {
        index: true,
        element: <Navigate to="/space" replace />,
      },
      // login page routing
      {
        path: 'sign',
        Component: LoginPage,
        errorElement: <GlobalError />,
        loader: () => ({
          hasSider: false,
          requireAuth: false,
        }),
      },

      // Workspace Routing
      {
        path: 'space',
        Component: SpaceLayout,
        loader: () => ({
          hasSider: true,
          requireAuth: true,
          subMenu: spaceSubMenu,
          menuKey: BaseEnum.Space,
        }),
        children: [
          {
            path: ':space_id',
            Component: SpaceIdLayout,
            children: [
              {
                index: true,
                element: <Navigate to="develop" replace />,
              },

              // Project Development
              {
                path: 'develop',
                Component: Develop,
                loader: () => ({
                  subMenuKey: SpaceSubModuleEnum.DEVELOP,
                }),
              },

              // Agent IDE
              {
                path: 'bot/:bot_id',
                Component: AgentIDELayout,
                children: [
                  {
                    index: true,
                    Component: AgentIDE,
                  },
                  {
                    path: 'publish',
                    children: [
                      {
                        index: true,
                        Component: AgentPublishPage,
                        loader: () => ({
                          hasSider: false,
                          requireBotEditorInit: false,
                          pageName: 'publish',
                        }),
                      },
                    ],
                  },
                ],
                loader: () => ({
                  hasSider: false,
                  showMobileTips: true,
                  requireBotEditorInit: true,
                  pageName: 'bot',
                }),
              },

              // Project IDE
              {
                path: 'project-ide/:project_id/publish',
                loader: () => ({
                  hasSider: false,
                }),
                Component: ProjectIDEPublish,
              },
              {
                path: 'project-ide/:project_id/*',
                Component: ProjectIDE,
                loader: () => ({
                  hasSider: false,
                }),
              },

              // resource library
              {
                path: 'library',
                Component: Library,
                loader: () => ({
                  subMenuKey: SpaceSubModuleEnum.LIBRARY,
                }),
              },

              // Knowledge Base Resources
              {
                path: 'knowledge',
                children: [
                  {
                    path: ':dataset_id',
                    element: <KnowledgePreview />,
                  },
                  {
                    path: ':dataset_id/upload',
                    element: <KnowledgeUpload />,
                  },
                ],
                loader: () => ({
                  pageModeByQuery: true,
                }),
              },

              // database resources
              {
                path: 'database',
                children: [
                  {
                    path: ':table_id',
                    element: <DatabaseDetail />,
                  },
                ],
                loader: () => ({
                  showMobileTips: true,
                  pageModeByQuery: true,
                }),
              },

              // plugin resources
              {
                path: 'plugin/:plugin_id',
                Component: PluginLayout,
                children: [
                  {
                    index: true,
                    Component: PluginPage,
                  },
                  {
                    path: 'tool/:tool_id',
                    children: [
                      {
                        index: true,
                        Component: PluginToolPage,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },

      // workflow routing
      {
        path: 'work_flow',
        Component: WorkflowPage,
        loader: () => ({
          hasSider: false,
          requireAuth: true,
        }),
      },

        // search
        {
          path: 'search/:word',
          Component: SearchPage,
          loader: () => ({
            hasSider: true,
            requireAuth: true,
          }),
        },

        // explore
        {
          path: 'explore',
          Component: null,
          loader: () => ({
            hasSider: true,
            requireAuth: true,
            subMenu: exploreSubMenu,
            menuKey: BaseEnum.Explore,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="plugin" replace />,
            },
            // plugin store
            {
              path: 'plugin',
              element: <ExplorePluginPage />,
              loader: () => ({
                type: 'plugin',
              }),
            },
            // template
            {
              path: 'template',
              element: <ExploreTemplatePage />,
              loader: () => ({
                type: 'template',
              }),
            },
          ],
        },
      ],
    },
];

export const router: ReturnType<typeof createBrowserRouter> =
  createBrowserRouter(routes, { basename: basename });
