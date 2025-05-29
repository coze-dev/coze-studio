package builtin

import (
	"context"
	"fmt"
	"time"

	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

func putImageObject(ctx context.Context, st storage.Storage, imgExt string, uid int64, img []byte) (format string, err error) {
	secret := createSecret(uid, imgExt)
	fileName := fmt.Sprintf("%d_%d_%s.%s", uid, time.Now().UnixNano(), secret, imgExt)
	objectName := fmt.Sprintf("%s/%s", knowledgePrefix, fileName)
	if err := st.PutObject(ctx, objectName, img); err != nil {
		return "", err
	}
	imgSrc := fmt.Sprintf(imgSrcFormat, objectName)
	return imgSrc, nil
}
