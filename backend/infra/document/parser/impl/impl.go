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
package impl

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/coze-dev/coze-studio/backend/bizpkg/buildinmodel"
	"github.com/coze-dev/coze-studio/backend/infra/document/ocr"
	"github.com/coze-dev/coze-studio/backend/infra/document/parser"
	"github.com/coze-dev/coze-studio/backend/infra/document/parser/impl/builtin"
	"github.com/coze-dev/coze-studio/backend/infra/document/parser/impl/ppstructure"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

type Manager = parser.Manager

func New(ctx context.Context, storage storage.Storage, ocr ocr.OCR) (Manager, error) {
	imageAnnotationModel, _, err := buildinmodel.GetBuiltinChatModel(ctx, "IA_")
	if err != nil {
		return nil, fmt.Errorf("get builtin chat model failed, err=%w", err)
	}

	var parserManager parser.Manager
	parserType := os.Getenv(consts.ParserType)
	switch parserType {
	case "builtin", "":
		parserManager = builtin.NewManager(storage, ocr, imageAnnotationModel)
	case "paddleocr":
		url := os.Getenv(consts.PPStructureAPIURL)
		client := &http.Client{}
		apiConfig := &ppstructure.APIConfig{
			Client: client,
			URL:    url,
		}
		parserManager = ppstructure.NewManager(apiConfig, ocr, storage, imageAnnotationModel)
	default:
		return nil, fmt.Errorf("parser type %s not supported", parserType)
	}

	return parserManager, nil
}
