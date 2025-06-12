package variableaggregator

import (
	"context"
	"errors"
	"fmt"
	"io"
	"maps"
	"math"
	"runtime/debug"
	"slices"
	"sort"
	"strconv"
	"strings"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/safego"
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
	InputSources  []*vo.FieldInfo
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

func (v *VariableAggregator) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	if v.config.MergeStrategy != FirstNotNullValue {
		return nil, fmt.Errorf("merge strategy not supported: %v", v.config.MergeStrategy)
	}

	in, err := inputConverter(input)
	if err != nil {
		return nil, err
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
		state.SaveDynamicChoice(v.config.NodeKey, groupToChoice) // TODO: what if the group's all choices are nil?
		return nil
	})

	return result, nil
}

// Transform picks the first non-nil value from each group from a stream of map[group]items.
func (v *VariableAggregator) Transform(ctx context.Context, input *schema.StreamReader[map[string]any]) (*schema.StreamReader[map[string]any], error) {
	if v.config.MergeStrategy != FirstNotNullValue {
		input.Close()
		return nil, fmt.Errorf("merge strategy not supported: %v", v.config.MergeStrategy)
	}

	groupToSkipped, err := v.getGroupToSkipped(ctx)
	if err != nil {
		return nil, err
	}

	inStream := streamInputConverter(input)

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

func inputConverter(in map[string]any) (converted map[string]map[int]any, err error) {
	converted = make(map[string]map[int]any)

	for k, value := range in {
		m, ok := value.(map[string]any)
		if !ok {
			return nil, errors.New("value is not a map[string]any")
		}
		converted[k] = make(map[int]any, len(m))
		for i, sv := range m {
			index, err := strconv.Atoi(i)
			if err != nil {
				return nil, fmt.Errorf(" converting %s to int failed, err=%v", i, err)
			}
			converted[k][index] = sv
		}
	}

	return converted, nil
}

func streamInputConverter(in *schema.StreamReader[map[string]any]) *schema.StreamReader[map[string]map[int]any] {
	converter := func(input map[string]any) (output map[string]map[int]any, err error) {
		defer func() {
			if r := recover(); r != nil {
				err = safego.NewPanicErr(r, debug.Stack())
			}
		}()
		return inputConverter(input)
	}
	return schema.StreamReaderWithConvert(in, converter)
}

type vaCallbackInput struct {
	Name      string `json:"name"`
	Variables []any  `json:"variables"`
}

func (v *VariableAggregator) Init(ctx context.Context) (context.Context, error) {
	ctx = ctxcache.Init(ctx)

	resolvedSources, err := nodes.ResolveStreamSources(ctx, v.config.FullSources)
	if err != nil {
		return nil, err
	}
	ctxcache.Store(ctx, "resolved_sources", resolvedSources)

	var dynamicStreamType map[string]nodes.FieldStreamType
	e := compose.ProcessState(ctx, func(ctx context.Context, state nodes.DynamicStreamContainer) error {
		var e1 error
		dynamicStreamType, e1 = state.GetAllDynamicStreamTypes(v.config.NodeKey)
		return e1
	})
	if e != nil {
		return nil, e
	}

	ctxcache.Store(ctx, "dynamic_stream_type", dynamicStreamType)

	return ctx, nil
}

type streamMarkerType string

const streamMarker streamMarkerType = "<Stream Data...>"

func (v *VariableAggregator) ToCallbackInput(ctx context.Context, input map[string]any) (map[string]any, error) {
	resolvedSources, ok := ctxcache.Get[map[string]*nodes.SourceInfo](ctx, "resolved_sources")
	if !ok {
		return nil, errors.New("resolved_sources not found")
	}

	in, err := inputConverter(input)
	if err != nil {
		return nil, err
	}

	merged := make([]vaCallbackInput, 0, len(in))

	groupLen := v.config.GroupLen

	for groupName, vars := range in {
		orderedVars := make([]any, groupLen[groupName])
		for index := range vars {
			orderedVars[index] = vars[index]
			if len(resolvedSources) > 0 {
				if resolvedSources[groupName].SubSources[strconv.Itoa(index)].FieldIsStream == nodes.FieldIsStream {
					orderedVars[index] = streamMarker
				}
			}
		}

		merged = append(merged, vaCallbackInput{
			Name:      groupName,
			Variables: orderedVars,
		})
	}

	// Sort merged slice by Name
	sort.Slice(merged, func(i, j int) bool {
		return merged[i].Name < merged[j].Name
	})

	return map[string]any{
		"mergeGroups": merged,
	}, nil
}

func (v *VariableAggregator) ToCallbackOutput(ctx context.Context, output map[string]any) (*nodes.StructuredCallbackOutput, error) {
	dynamicStreamType, ok := ctxcache.Get[map[string]nodes.FieldStreamType](ctx, "dynamic_stream_type")
	if !ok {
		return nil, errors.New("dynamic_stream_type not found")
	}
	if len(dynamicStreamType) == 0 {
		return &nodes.StructuredCallbackOutput{
			Output:    output,
			RawOutput: output,
		}, nil
	}

	newOut := maps.Clone(output)
	for k := range output {
		if t, ok := dynamicStreamType[k]; ok && t == nodes.FieldIsStream {
			newOut[k] = streamMarker
		}
	}
	return &nodes.StructuredCallbackOutput{
		Output:    newOut,
		RawOutput: newOut,
	}, nil
}

type NodeExecuteStatusAware interface {
	NodeExecuted(key vo.NodeKey) bool
}

func (v *VariableAggregator) getGroupToSkipped(ctx context.Context) (groupToSkipped map[string]map[int]bool, err error) {
	groupToSkipped = map[string]map[int]bool{}

	err = compose.ProcessState(ctx, func(ctx context.Context, sa NodeExecuteStatusAware) error {
		for _, fieldInfo := range v.config.InputSources {
			if fieldInfo.Source.Ref != nil && fieldInfo.Source.Ref.VariableType == nil {
				fromNodeKey := fieldInfo.Source.Ref.FromNodeKey
				if !sa.NodeExecuted(fromNodeKey) {
					group := fieldInfo.Path[0]
					indexStr := fieldInfo.Path[1]
					index, err := strconv.Atoi(indexStr)
					if err != nil {
						return err
					}
					if _, ok := groupToSkipped[group]; !ok {
						groupToSkipped[group] = map[int]bool{}
					}
					groupToSkipped[group][index] = true
				}
			}
		}
		return nil
	})

	return groupToSkipped, nil
}

func concatVACallbackInputs(vs [][]vaCallbackInput) ([]vaCallbackInput, error) {
	if len(vs) == 0 {
		return nil, nil
	}

	init := slices.Clone(vs[0])
	for i := 1; i < len(vs); i++ {
		next := vs[i]
		for j := 0; j < len(next); j++ {
			oneGroup := next[j]
			groupName := oneGroup.Name
			var (
				existingGroup *vaCallbackInput
				nextIndex     = len(init)
				currentIndex  int
			)
			for k := 0; k < len(init); k++ {
				if init[k].Name == groupName {
					existingGroup = ptr.Of(init[k])
					currentIndex = k
				} else if init[k].Name > groupName && k < nextIndex {
					nextIndex = k
				}
			}

			if existingGroup == nil {
				after := slices.Clone(init[nextIndex:])
				init = append(init[:nextIndex], oneGroup)
				init = append(init, after...)
			} else {
				for vi := 0; vi < len(oneGroup.Variables); vi++ {
					newV := oneGroup.Variables[vi]
					if newV == nil {
						if vi >= len(existingGroup.Variables) {
							for i := len(existingGroup.Variables); i <= vi; i++ {
								existingGroup.Variables = append(existingGroup.Variables, nil)
							}
						}
						continue
					}
					if newStr, ok := newV.(string); ok {
						if strings.HasSuffix(newStr, nodes.KeyIsFinished) {
							newStr = strings.TrimSuffix(newStr, nodes.KeyIsFinished)
						}
						newV = newStr
					}
					for ei := len(existingGroup.Variables); ei <= vi; ei++ {
						existingGroup.Variables = append(existingGroup.Variables, nil)
					}
					ev := existingGroup.Variables[vi]
					if ev == nil {
						existingGroup.Variables[vi] = oneGroup.Variables[vi]
					} else {
						if evStr, ok := ev.(streamMarkerType); !ok {
							return nil, fmt.Errorf("multiple stream chunk when concating VACallbackInputs, variable %s is not string", ev)
						} else {
							if evStr != streamMarker || newV.(streamMarkerType) != streamMarker {
								return nil, fmt.Errorf("multiple stream chunk when concating VACallbackInputs, variable %s is not streamMarker", ev)
							}
							existingGroup.Variables[vi] = evStr
						}
					}
				}
				init[currentIndex] = *existingGroup
			}
		}
	}

	return init, nil
}

func concatStreamMarkers(_ []streamMarkerType) (streamMarkerType, error) {
	return streamMarker, nil
}

func init() {
	nodes.RegisterStreamChunkConcatFunc(concatVACallbackInputs)
	nodes.RegisterStreamChunkConcatFunc(concatStreamMarkers)
}
