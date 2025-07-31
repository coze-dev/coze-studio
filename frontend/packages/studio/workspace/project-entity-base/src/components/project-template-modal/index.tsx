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

import { groupBy, xorBy } from 'lodash-es';
import { useRequest } from 'ahooks';
import {
  ProductEntityType,
  ProductListSource,
  SortType,
  type ProductInfo,
} from '@coze-arch/idl/product_api';
import { I18n } from '@coze-arch/i18n';
import { ProductApi } from '@coze-arch/bot-api';
import {
  IllustrationFailure,
  IllustrationFailureDark,
} from '@douyinfe/semi-illustrations';
import { IconCozRefresh } from '@coze-arch/coze-design/icons';
import { Button, Empty, Modal, type ModalProps } from '@coze-arch/coze-design';

import {
  type BeforeProjectTemplateCopyCallback,
  type ProjectTemplateCopySuccessCallback,
  useProjectTemplateCopyModal,
} from '../../hooks/use-project-template-copy-modal';
import {
  CardSkeleton,
  TemplateGroupSkeleton,
} from './template-components/skeleton';
import { ProjectTemplateGroup } from './template-components/project-template-group';
import {
  openTemplatePreview,
  ProjectTemplateCard,
} from './template-components/project-template-card';
import { CreateEmptyProjectUI } from './template-components/create-empty-project-ui';

import styles from './index.module.less';

const MAX_PAGE_SIZE = 50;

export interface ProjectTemplateBaseProps {
  spaceId?: string;
  isSelectSpaceOnCopy: boolean;
  onBeforeCopy: BeforeProjectTemplateCopyCallback | undefined;
  onCopyError: (() => void) | undefined;
  onCopyOk: ProjectTemplateCopySuccessCallback | undefined;
  onCreateProject?: () => void;
}

/**
 * Templates that require special handling and are placed in the "Basic" category
 * There is no "foundation" category in the business itself, but in this scenario created by replication, pm wants to provide users with some representative templates with basic functions
 * And so this special treatment template came into being.
 *
 * When iterating, it is necessary to ensure that these templates are recommended in order to reuse PublicGetProductList this interface
 */
const BASE_TEMPLATE_ID_LIST = ['7439261984903938074'];

const ProjectTemplateContent: React.FC<ProjectTemplateBaseProps> = ({
  spaceId,
  isSelectSpaceOnCopy,
  onCopyOk,
  onCreateProject,
  onBeforeCopy,
  onCopyError,
}) => {
  const {
    data: categories,
    error: categoriesError,
    loading: isCategoryLoading,
    refresh: refreshCategoryRequest,
  } = useRequest(async () => {
    const response = await ProductApi.PublicGetProductCategoryList({
      entity_type: ProductEntityType.TemplateCommon,
    });
    return response.data?.categories;
  });

  const {
    data: products,
    error: productsError,
    loading: isProductLoading,
    refresh: refreshProductRequest,
  } = useRequest(async () => {
    const response = await ProductApi.PublicGetProductList({
      entity_type: ProductEntityType.ProjectTemplate,
      page_num: 1,
      page_size: MAX_PAGE_SIZE,
      sort_type: SortType.Heat,
      source: ProductListSource.Recommend,
      is_free: true,
    });
    return response.data?.products;
  });

  const { copyProject, modalContextHolder } = useProjectTemplateCopyModal({
    onSuccess: onCopyOk,
    source: spaceId ? 'space' : 'navi',
    onBefore: onBeforeCopy,
    onError: onCopyError,
  });
  const refreshRequest = () => {
    refreshCategoryRequest();
    refreshProductRequest();
  };
  const isRequestLoading = isCategoryLoading || isProductLoading;
  const isRequestError = Boolean(categoriesError || productsError);

  if (!categories || !products) {
    return (
      <>
        {modalContextHolder}
        <div className="px-24px flex flex-col gap-y-[20px]">
          <ProjectTemplateGroup title="基础">
            <CreateEmptyProjectUI onClick={onCreateProject} />
            {isRequestLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : null}
          </ProjectTemplateGroup>
          {isRequestLoading ? (
            <>
              <TemplateGroupSkeleton />
              <TemplateGroupSkeleton />
            </>
          ) : null}
          {!isRequestLoading && isRequestError ? (
            <Empty
              className={styles['error-empty']}
              image={<IllustrationFailure className="h-160px w-160px" />}
              darkModeImage={
                <IllustrationFailureDark className="h-160px w-160px" />
              }
              title={
                <span className="coz-fg-primary text-[14px] font-medium leading-20px">
                  {I18n.t('creat_project_templates_load_failed')}
                </span>
              }
            >
              <Button onClick={refreshRequest} icon={<IconCozRefresh />}>
                {I18n.t('Retry')}
              </Button>
            </Empty>
          ) : null}
        </div>
      </>
    );
  }

  const baseTemplateList = products.filter(p =>
    BASE_TEMPLATE_ID_LIST.some(id => id === p.meta_info.id),
  );
  const recommendTemplateList = xorBy(
    products,
    baseTemplateList,
    p => p.meta_info.id,
  );
  const productGroupList = groupBy(
    recommendTemplateList,
    p => p.meta_info.category?.id,
  );

  const renderTemplateList = (productList: ProductInfo[]) =>
    productList.map(product => (
      <ProjectTemplateCard
        viewSource={spaceId ? 'space' : 'navi'}
        onClick={() => {
          openTemplatePreview(product.meta_info.id ?? '');
        }}
        onCopyTemplate={param => {
          copyProject({
            spaceId,
            isSelectSpace: isSelectSpaceOnCopy,
            productId: param.id,
            name: param.name,
            sourceProduct: product,
          });
        }}
        key={product.meta_info.id}
        product={product}
      />
    ));
  return (
    <>
      {modalContextHolder}
      <div className="px-24px flex flex-col gap-y-[20px]">
        <ProjectTemplateGroup title="基础">
          <CreateEmptyProjectUI onClick={onCreateProject} />
          {renderTemplateList(baseTemplateList)}
        </ProjectTemplateGroup>
        {categories.map(category => {
          const productList = productGroupList[category.id ?? ''];
          if (!productList?.length) {
            return null;
          }
          return (
            <ProjectTemplateGroup key={category.id} title={category.name}>
              {renderTemplateList(productGroupList[category.id ?? ''] ?? [])}
            </ProjectTemplateGroup>
          );
        })}
      </div>
    </>
  );
};

export const ProjectTemplateModal: React.FC<
  Omit<ModalProps, 'size' | 'title' | 'className' | 'footer'> &
    ProjectTemplateBaseProps
> = ({
  spaceId,
  isSelectSpaceOnCopy,
  onCopyOk,
  onCreateProject,
  onBeforeCopy,
  onCopyError,
  ...props
}) => (
  <Modal
    size="xxl"
    title={I18n.t('creat_project_templates')}
    className={styles['project-template-modal']}
    footer={null}
    {...props}
  >
    <ProjectTemplateContent
      spaceId={spaceId}
      isSelectSpaceOnCopy={isSelectSpaceOnCopy}
      onCopyOk={onCopyOk}
      onCreateProject={onCreateProject}
      onBeforeCopy={onBeforeCopy}
      onCopyError={onCopyError}
    />
  </Modal>
);
