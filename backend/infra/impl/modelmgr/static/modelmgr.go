package static

import (
	"context"
	"strconv"
	"strings"

	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/sets"
)

func NewModelMgr(staticModels []*modelmgr.Model) (modelmgr.Manager, error) {
	mapping := make(map[int64]*modelmgr.Model, len(staticModels))
	for i := range staticModels {
		mapping[staticModels[i].ID] = staticModels[i]
	}
	return &staticModelManager{
		models:       staticModels,
		modelMapping: mapping,
	}, nil
}

type staticModelManager struct {
	models       []*modelmgr.Model
	modelMapping map[int64]*modelmgr.Model
}

func (s *staticModelManager) ListModel(_ context.Context, req *modelmgr.ListModelRequest) (*modelmgr.ListModelResponse, error) {
	startIdx := 0
	if req.Cursor != nil {
		start, err := strconv.ParseInt(*req.Cursor, 10, 64)
		if err != nil {
			return nil, err
		}
		startIdx = int(start)
	}

	limit := req.Limit
	if limit == 0 {
		limit = 100
	}

	var (
		i        int
		respList []*modelmgr.Model
		statSet  = sets.FromSlice(req.Status)
	)

	for i = startIdx; i < len(s.models) && len(respList) < limit; i++ {
		m := s.models[i]
		if req.FuzzyModelName != nil && !strings.Contains(m.Name, *req.FuzzyModelName) {
			continue
		}
		if len(statSet) > 0 && !statSet.Contains(m.Meta.Status) {
			continue
		}
		respList = append(respList, m)
	}

	resp := &modelmgr.ListModelResponse{
		ModelList: respList,
	}
	resp.HasMore = i != len(s.models)
	if resp.HasMore {
		resp.NextCursor = ptr.Of(strconv.FormatInt(int64(i), 10))
	}

	return resp, nil
}

func (s *staticModelManager) MGetModelByID(_ context.Context, req *modelmgr.MGetModelRequest) ([]*modelmgr.Model, error) {
	resp := make([]*modelmgr.Model, 0, len(s.models))
	for _, id := range req.IDs {
		if m, found := s.modelMapping[id]; found {
			resp = append(resp, m)
		}
	}
	return resp, nil
}
