/*
 * Copyright 2025 coze-dev Authors
 * ... (版权信息保持不变)
 */

import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { PromptEditorProvider } from '@coze-common/prompt-kit-base/editor';
import { useInitStatus } from '@coze-common/chat-area';
import { useReportTti } from '@coze-arch/report-tti';
// 注意：为了避免变量名冲突，原来的 useSpaceStore 保持不变，用于获取 spaceId
import { useSpaceStore } from '@coze-arch/bot-studio-store';

// 1. 新增引入：引入包含 isTempl 的那个 Store Adapter，并重命名以避免冲突
import { useSpaceStore as useSpaceStoreAdapter } from '@coze-foundation/space-store-adapter';

import {
  BehaviorType,
  SpaceResourceType,
} from '@coze-arch/bot-api/playground_api';
import { BotMode } from '@coze-arch/bot-api/developer_api';
import { PlaygroundApi } from '@coze-arch/bot-api';
import {
  useEditConfirm,
  useSubscribeOnboardingAndUpdateChatArea,
} from '@coze-agent-ide/space-bot/hook';
import { BotEditorServiceProvider } from '@coze-agent-ide/space-bot';
import {
  FormilyProvider,
  useGetModelList,
} from '@coze-agent-ide/model-manager';
import { BotEditorContextProvider } from '@coze-agent-ide/bot-editor-context-store';
import {
  useInitToast,
  SingleMode,
  WorkflowMode,
} from '@coze-agent-ide/bot-creator';

import { WorkflowModeToolPaneList } from '../components/workflow-mode-tool-pane-list';
import { TableMemory } from '../components/table-memory-tool';
import { SingleModeToolPaneList } from '../components/single-mode-tool-pane-list';

const BotEditor: React.FC = () => {
  const { isInit } = usePageRuntimeStore(
    useShallow(state => ({
      isInit: state.init,
      historyVisible: state.historyVisible,
      pageFrom: state.pageFrom,
    })),
  );

  const { mode, botId } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
      mode: state.mode,
    })),
  );

  // 2. 获取 setIsTempl 方法
  const setIsTempl = useSpaceStoreAdapter(state => state.setIsTempl);
  const setWorkflowMode = useSpaceStoreAdapter(state => state.setWorkFlowMode);
  // 3. 添加 useEffect：一进来就设置为 true
  useEffect(() => {
    // 组件挂载时：设置为 true
    if (setIsTempl) {
      setIsTempl(true);
      setWorkflowMode(false)
    }
    return () => {
      if (setIsTempl) {
        setIsTempl(false);
        setWorkflowMode(false)
      }
    };
  }, [setIsTempl]);

  const isSingleLLM = mode === BotMode.SingleMode;
  const isSingleWorkflow = mode === BotMode.WorkflowMode;

  const spaceId = useSpaceStore(store => store.getSpaceId());

  useEditConfirm();
  useSubscribeOnboardingAndUpdateChatArea();
  useGetModelList();
  useInitToast(spaceId);
  const status = useInitStatus();

  useReportTti({
    scene: 'page-init',
    isLive: isInit,
    extra: {
      mode: 'bot-ide',
    },
  });

  /**
   * Report recently opened
   */
  useEffect(() => {
    PlaygroundApi.ReportUserBehavior({
      resource_id: botId,
      resource_type: SpaceResourceType.DraftBot,
      behavior_type: BehaviorType.Visit,
      space_id: spaceId,
    });
  }, []);

  if (status === 'unInit' || status === 'loading') {
    return null;
  }

  return (
    <>
      {isSingleLLM ? (
        <SingleMode
          renderChatTitleNode={params => <SingleModeToolPaneList {...params} />}
          memoryToolSlot={
            // table storage
            <TableMemory />
          }
        />
      ) : null}
      {isSingleWorkflow ? (
        <WorkflowMode
          renderChatTitleNode={params => (
            <WorkflowModeToolPaneList {...params} />
          )}
          memoryToolSlot={
            // table storage
            <TableMemory />
          }
        />
      ) : null}
    </>
  );
};

export const BotEditorWithContext = () => (
  <BotEditorContextProvider>
    <BotEditorServiceProvider>
      <PromptEditorProvider>
        <FormilyProvider>
          <BotEditor />
        </FormilyProvider>
      </PromptEditorProvider>
    </BotEditorServiceProvider>
  </BotEditorContextProvider>
);

export default BotEditorWithContext;