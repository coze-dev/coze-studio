package variablemerge

import (
	"context"
)

type Lambada func(ctx context.Context, bi MergeRequest) (map[string]any, error)

func NewVariableMergeLambada(ctx context.Context) (Lambada, error) {
	return func(ctx context.Context, bi MergeRequest) (map[string]any, error) {
		result := make(map[string]any)
		for _, group := range bi.Groups {
			if len(group.Values) == 0 {
				continue
			}
			for _, value := range group.Values {
				if value == nil {
					continue
				}
				result[group.Name] = value
				break
			}

		}
		return result, nil
	}, nil

}
