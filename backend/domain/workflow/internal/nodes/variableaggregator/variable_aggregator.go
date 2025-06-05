package variableaggregator

import (
	"context"
	"errors"
	"fmt"
	"io"
	"math"
	"strconv"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

type MergeStrategy uint

const (
	FirstNotNullValue MergeStrategy = 1
)

type Config struct {
	MergeStrategy MergeStrategy
	GroupLen      map[string]int
	FullSources   map[string]*nodes.SourceInfo
	NodeKey       vo.NodeKey
}

type VariableAggregator struct {
	config *Config
}

func NewVariableAggregator(_ context.Context, cfg *Config) (*VariableAggregator, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}
	return &VariableAggregator{config: cfg}, nil
}

func (v *VariableAggregator) Invoke(ctx context.Context, in map[string]map[int]any) (map[string]any, error) {
	if v.config.MergeStrategy != FirstNotNullValue {
		return nil, fmt.Errorf("merge strategy not supported: %v", v.config.MergeStrategy)
	}

	result := make(map[string]any)
	groupToChoice := make(map[string]int)
	for group, length := range v.config.GroupLen {
		for i := 0; i < length; i++ {
			if value, ok := in[group][i]; ok {
				if value != nil {
					result[group] = value
					groupToChoice[group] = i
					break
				}
			}
		}
	}

	_ = compose.ProcessState(ctx, func(ctx context.Context, state nodes.DynamicStreamContainer) error {
		state.SaveDynamicChoice(v.config.NodeKey, groupToChoice)
		return nil
	})

	return result, nil
}

// Transform picks the first non-nil value from each group from a stream of map[group]items.
func (v *VariableAggregator) Transform(ctx context.Context, inStream *schema.StreamReader[map[string]map[int]any],
	groupToSkipped map[string]map[int]bool) (*schema.StreamReader[map[string]any], error) {
	if v.config.MergeStrategy != FirstNotNullValue {
		inStream.Close()
		return nil, fmt.Errorf("merge strategy not supported: %v", v.config.MergeStrategy)
	}

	resolvedSources, err := nodes.ResolveStreamSources(ctx, v.config.FullSources)
	if err != nil {
		return nil, err
	}

	// goal: find the first non-nil element in each group. 'First' means the smallest index in each group's slice.
	// We have the information that some of the elements in each group are absolutely not present,
	// because the nodes they come from are not executed.
	// So we need to find the first non-nil element in each group, and skip the elements that are not present.
	// This we have an 'early stop' strategy for each group, because we know beforehand the smallest possible index of each group.
	// when the smallest possible index is already found and not nil, we can stop the iteration for this group.
	// Note: if an element is a stream, and the node it comes from is executed, it will ALWAYS has at least one chunk in the stream.
	// This chunk will be KeyIsFinished.

	groupToItems := make(map[string][]any)
	groupToChoice := make(map[string]int)
	groupToCurrentIndex := make(map[string]int)
	type skipped struct{}
	type null struct{}
	type stream struct{}
	for group, length := range v.config.GroupLen {
		groupToItems[group] = make([]any, length)
		for i := 0; i < length; i++ {
			skip := false
			if _, ok := groupToSkipped[group]; ok {
				if _, ok := groupToSkipped[group][i]; ok {
					groupToItems[group][i] = skipped{}
					skip = true
				}
			}

			if !skip {
				if resolvedSources[group].SubSources[strconv.Itoa(i)].FieldIsStream == nodes.FieldIsStream {
					groupToItems[group][i] = stream{}
					if _, ok := groupToCurrentIndex[group]; !ok {
						groupToCurrentIndex[group] = i
					}
				}
			}
		}

		hasUndecided := false
		for i := 0; i < length; i++ {
			if groupToItems[group][i] == nil {
				hasUndecided = true
				break
			}

			_, ok := groupToItems[group][i].(stream)
			if ok {
				groupToChoice[group] = i
				break
			}
		}

		if _, ok := groupToChoice[group]; !ok && !hasUndecided {
			groupToChoice[group] = -1 // this group won't have any non-nil value
		}
	}

	allDone := func() bool {
		for group := range v.config.GroupLen {
			_, ok := groupToChoice[group]
			if !ok {
				return false
			}
		}

		return true
	}

	alreadyDone := allDone()
	if alreadyDone {
		result := make(map[string]any, len(v.config.GroupLen))
		allSkip := true
		for group := range groupToChoice {
			choice := groupToChoice[group]
			if choice == -1 {
				result[group] = nil // all groups are nil
			} else {
				result[group] = choice
				allSkip = false
			}
		}

		if allSkip {
			_ = compose.ProcessState(ctx, func(ctx context.Context, state nodes.DynamicStreamContainer) error {
				state.SaveDynamicChoice(v.config.NodeKey, groupToChoice)
				return nil
			})
			return schema.StreamReaderFromArray([]map[string]any{result}), nil
		}
	}

	outS := inStream
	if !alreadyDone {
		inCopy := inStream.Copy(2)
		defer inCopy[0].Close()
		outS = inCopy[1]

	recvLoop:
		for {
			chunk, err := inCopy[0].Recv()
			if err != nil {
				if err == io.EOF {
					panic("EOF reached before making choices for all groups")
				}

				return nil, err
			}

			for group, items := range chunk {
				if _, ok := groupToChoice[group]; ok {
					continue // already made the decision for the group.
				}

				currentIndex, ok := groupToCurrentIndex[group]
				if !ok {
					currentIndex = math.MaxInt
				}

				for i := range items {
					if i >= currentIndex {
						continue
					}

					existing := groupToItems[group][i]
					if existing != nil {
						continue
					}

					item := items[i]
					if item == nil {
						groupToItems[group][i] = null{}
					} else {
						groupToItems[group][i] = item
					}

					groupToCurrentIndex[group] = i

					finalized := true
					for j := 0; j < i; j++ {
						indexedItem := groupToItems[group][j]
						if indexedItem == nil { // there exists non-finalized elements in front of the current item
							finalized = false
							break
						}
					}

					if finalized {
						if item == nil { // current item is nil, we need to find the first non-nil element in the group
							foundNonNil := false
							hasUndecided := false
							for j := 0; j < len(groupToItems[group]); j++ {
								indexedItem := groupToItems[group][j]
								if indexedItem != nil {
									_, ok := indexedItem.(skipped)
									if ok {
										continue
									}

									_, ok = indexedItem.(null)
									if ok {
										continue
									}

									groupToChoice[group] = j
									foundNonNil = true
									break
								} else {
									hasUndecided = true
									break
								}
							}
							if !foundNonNil && !hasUndecided {
								groupToChoice[group] = -1 // this group does not have any non-nil value
							}
						} else {
							groupToChoice[group] = i
						}
						if allDone() {
							break recvLoop
						}
					}
				}
			}
		}
	}

	_ = compose.ProcessState(ctx, func(ctx context.Context, state nodes.DynamicStreamContainer) error {
		state.SaveDynamicChoice(v.config.NodeKey, groupToChoice)
		return nil
	})

	actualStream := schema.StreamReaderWithConvert(outS, func(in map[string]map[int]any) (map[string]any, error) {
		out := make(map[string]any)
		for group, items := range in {
			choice, ok := groupToChoice[group]
			if !ok {
				panic(fmt.Sprintf("group %s does not have choice", group))
			}

			if choice < 0 {
				panic(fmt.Sprintf("group %s choice = %d, less than zero, but found actual item in stream", group, choice))
			}

			if _, ok := items[choice]; ok {
				out[group] = items[choice]
			}
		}

		if len(out) == 0 {
			return nil, schema.ErrNoValue
		}

		return out, nil
	})

	nullGroups := make(map[string]any)
	for group, choice := range groupToChoice {
		if choice < 0 {
			nullGroups[group] = nil
		}
	}
	if len(nullGroups) > 0 {
		nullStream := schema.StreamReaderFromArray([]map[string]any{nullGroups})
		return schema.MergeStreamReaders([]*schema.StreamReader[map[string]any]{actualStream, nullStream}), nil
	}

	return actualStream, nil
}
