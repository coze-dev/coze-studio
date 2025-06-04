package impl

import "code.byted.org/flow/opencoze/backend/pkg/logs"

// 用户输入自定义内容后创建文档
type customDocProcessor struct {
	baseDocProcessor
}

func (c *customDocProcessor) BeforeCreate() error {
	for i := range c.Documents {
		if c.Documents[i].RawContent != "" {
			c.Documents[i].FileExtension = getFormatType(c.Documents[i].Type)
			uri := getTosUri(c.UserID, string(c.Documents[i].FileExtension))
			err := c.storage.PutObject(c.ctx, uri, []byte(c.Documents[i].RawContent))
			if err != nil {
				logs.CtxErrorf(c.ctx, "put object failed, err: %v", err)
				return err
			}
			c.Documents[i].URI = uri
		}
	}

	return nil
}
