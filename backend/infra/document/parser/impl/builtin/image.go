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

package builtin

import (
	"context"
	"fmt"
	"time"

	"github.com/coze-dev/coze-studio/backend/infra/storage"
)

func PutImageObject(ctx context.Context, st storage.Storage, imgExt string, uid int64, img []byte) (format string, err error) {
	secret := createSecret(uid, imgExt)
	fileName := fmt.Sprintf("%d_%d_%s.%s", uid, time.Now().UnixNano(), secret, imgExt)
	objectName := fmt.Sprintf("%s/%s", knowledgePrefix, fileName)
	if err := st.PutObject(ctx, objectName, img); err != nil {
		return "", err
	}
	imgSrc := fmt.Sprintf(imgSrcFormat, objectName)
	return imgSrc, nil
}
