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

import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cls from 'classnames';
import { explore } from '@coze-studio/api-schema';
import { useSpaceList, useSpaceStore } from '@coze-foundation/space-store';
import { I18n } from '@coze-arch/i18n';
import { Image, Input, Modal, Space, Toast } from '@coze-arch/coze-design';
import { type ProductEntityType } from '@coze-arch/bot-api/product_api';
import { type CardInfoProps } from '../type';
import { CardTag } from '../components/tag';
import { CardInfo } from '../components/info';
import { CardContainer, CardSkeletonContainer } from '../components/container';
import { CardButton } from '../components/button';

type ProductInfo = explore.ProductInfo;
import styles from './index.module.less';

// // 这里的 personalSpaceID 只是作为兜底或用于 Modal 跳转，主要逻辑我们在组件内获取
// const personalSpaceID = useSpaceStore.getState().getPersonalSpaceID();

export type TemplateCardProps = ProductInfo;

export const TemplateCard: FC<TemplateCardProps> = props => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  // 1. 获取空间列表，提取 spaceId
  const { spaces } = useSpaceList();
  const spaceId = spaces?.[0]?.id;

  // 获取是否免费的状态
  const isFree = props.meta_info?.is_free;

  return (
    <CardContainer className={styles.template} shadowMode="default">
      <div className={styles['template-wrapper']}>
        <TempCardBody
          {...{
            title: props.meta_info?.name,
            description: props.meta_info?.description,
            userInfo: props.meta_info?.user_info,
            entityType: props.meta_info.entity_type,
            imgSrc: props.meta_info.covers?.[0].url,
          }}
        />
        <Space className={styles['btn-container']}>
          <CardButton
            onClick={() => {
              if (isFree) {
                // 免费：弹窗复制
                setVisible(true);
              } else {
                // 收费/其他：直接跳转
                // 2. 拼接 URL: /space/{spaceId}/single/{productId}
                // if (spaceId) {
                navigate(`/space/${spaceId}/single/${props.meta_info.id}`);
                // } else {
                //   // 兜底逻辑：如果暂时取不到 spaceId，可以使用 personalSpaceID 或报错
                //   console.warn('Space ID not found, using personalSpaceID');
                //   navigate(`/space/${personalSpaceID}/single/${props.meta_info.id}`);
                // }
              }
            }}
            className="w-full"
          >
            {isFree ? I18n.t('copy') :"体验"}
          </CardButton>
        </Space>
      </div>
      {visible ? (
        <DuplicateModal
          productId={props.meta_info.id}
          entityType={props.meta_info.entity_type}
          defaultTitle={`${props.meta_info?.name}(${I18n.t(
            'duplicate_rename_copy',
          )})`}
          hide={() => setVisible(false)}
        />
      ) : null}
    </CardContainer>
  );
};

// ... DuplicateModal, TemplateCardSkeleton, TempCardBody 保持不变 ...
const DuplicateModal: FC<{
  defaultTitle: string;
  productId: string;
  entityType: explore.product_common.ProductEntityType;
  hide: () => void;
}> = ({ defaultTitle, hide, productId, entityType }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(defaultTitle);
  const { spaces } = useSpaceList();
  const spaceId = spaces?.[0]?.id;
  return (
    <Modal
      type="modal"
      title={I18n.t('creat_project_use_template')}
      visible={true}
      onOk={async () => {
        try {
          await explore.PublicDuplicateProduct({
            product_id: productId,
            entity_type: entityType,
            space_id: spaceId,
            name: title,
          });
          Toast.success(I18n.t('copy_success'));
          hide();
          navigate(`/space/${spaceId}/develop`, { replace: true });
        } catch (err) {
          console.error('PublicDuplicateProduct', err);
          Toast.error(I18n.t('copy_failed'));
        }
      }}
      onCancel={hide}
      cancelText={I18n.t('Cancel')}
      okText={I18n.t('Confirm')}
    >
      <Space vertical spacing={4} className="w-full">
        <Space className="w-full">
          <span className="coz-fg-primary font-medium leading-[20px]">
            {I18n.t('creat_project_project_name')}
          </span>
          <span className="coz-fg-hglt-red">*</span>
        </Space>
        <Input
          className="w-full"
          placeholder=""
          defaultValue={defaultTitle}
          onChange={value => {
            setTitle(value);
          }}
        />
      </Space>
    </Modal>
  );
};

export const TemplateCardSkeleton = () => (
  <CardSkeletonContainer className={cls('h-[278px]', styles.template)} />
);

export const TempCardBody: FC<
  CardInfoProps & {
    entityType?: explore.product_common.ProductEntityType | ProductEntityType;
    renderImageBottomSlot?: () => React.ReactNode;
    renderDescBottomSlot?: () => React.ReactNode;
  }
> = ({
  title,
  imgSrc,
  description,
  entityType,
  userInfo,
  renderImageBottomSlot,
  renderDescBottomSlot,
}) => (
  <div>
    <div className="relative w-full h-[140px] rounded-[8px] overflow-hidden">
      <Image
        preview={false}
        src={imgSrc}
        className="w-full h-full"
        imgCls="w-full h-full object-cover object-center"
      />
      {renderImageBottomSlot?.()}
    </div>
    <CardInfo
      {...{
        title,
        description,
        userInfo,
        renderCardTag: () =>
          entityType ? <CardTag type={entityType} /> : null,
        descClassName: styles.description,
        renderDescBottomSlot,
      }}
    />
  </div>
);
