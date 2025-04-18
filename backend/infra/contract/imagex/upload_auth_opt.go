package imagex

type UploadAuthOpt func(option *UploadAuthOption)

type UploadAuthOption struct {
	ContentTypeBlackList []string
	ContentTypeWhiteList []string
	FileSizeUpLimit      *string
	FileSizeBottomLimit  *string
	KeyPtn               *string
	UploadOverWrite      *bool
	conditions           map[string]string
	StoreKey             *string
}

func WithStoreKey(key string) UploadAuthOpt {
	return func(o *UploadAuthOption) {
		o.StoreKey = &key
	}
}

func WithUploadKeyPtn(ptn string) UploadAuthOpt {
	return func(o *UploadAuthOption) {
		o.KeyPtn = &ptn
	}
}

func WithUploadOverwrite(overwrite bool) UploadAuthOpt {
	return func(op *UploadAuthOption) {
		op.UploadOverWrite = &overwrite
	}
}

func WithUploadContentTypeBlackList(blackList []string) UploadAuthOpt {
	return func(op *UploadAuthOption) {
		op.ContentTypeBlackList = blackList
	}
}

func WithUploadContentTypeWhiteList(whiteList []string) UploadAuthOpt {
	return func(op *UploadAuthOption) {
		op.ContentTypeWhiteList = whiteList
	}
}

func WithUploadFileSizeUpLimit(limit string) UploadAuthOpt {
	return func(op *UploadAuthOption) {
		op.FileSizeUpLimit = &limit
	}
}

func WithUploadFileSizeBottomLimit(limit string) UploadAuthOpt {
	return func(op *UploadAuthOption) {
		op.FileSizeBottomLimit = &limit
	}
}
