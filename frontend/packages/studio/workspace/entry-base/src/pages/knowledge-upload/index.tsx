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

import { useNavigate, useParams } from 'react-router-dom';

import qs from 'qs';
import {
  KnowledgeParamsStoreProvider,
  type IKnowledgeParams,
} from '@coze-data/knowledge-stores';
import {
  OptType,
  UnitType,
} from '@coze-data/knowledge-resource-processor-core';
import {
  getUploadConfig,
  KnowledgeResourceProcessor,
} from '@coze-data/knowledge-resource-processor-adapter';
import { useSpaceStore } from '@coze-arch/bot-studio-store';

export const KnowledgeUploadPage = () => {
  const navigate = useNavigate();
  const spaceID = useSpaceStore(store => store.space.id);
  const locationSearchParams = new URLSearchParams(location.search);
  const type = (locationSearchParams.get('type') ||
    UnitType.TEXT_DOC) as UnitType;
  const opt = (locationSearchParams.get('opt') || OptType.ADD) as OptType;
  const docID = locationSearchParams.get('doc_id') || '';
  const isDouyinBot =
    locationSearchParams.get('is_douyin') === 'true' ? true : false;
  const { dataset_id, space_id } = useParams();
  const params: IKnowledgeParams = {
    datasetID: dataset_id || '',
    spaceID: space_id || '',
    type,
    opt,
    docID,
    isDouyinBot,
    biz: 'library',
  };

  const uploadConfig = getUploadConfig(
    type ?? UnitType.TEXT,
    opt ?? OptType.ADD,
  );
  if (!uploadConfig) {
    return <></>;
  }

  return (
    <KnowledgeParamsStoreProvider
      params={{ ...params, spaceID }}
      resourceNavigate={{
        // eslint-disable-next-line max-params
        toResource: (resource, resourceID, query, opts) =>
          navigate(
            `/space/${params.spaceID}/${resource}/${resourceID}?${qs.stringify(
              query,
            )}`,
            opts,
          ),
        upload: (query, opts) =>
          navigate(
            `/space/${params.spaceID}/knowledge/${
              params.datasetID
            }/upload?${qs.stringify(query)}`,
            opts,
          ),
      }}
    >
      <KnowledgeResourceProcessor uploadConfig={uploadConfig} />
    </KnowledgeParamsStoreProvider>
  );
};
