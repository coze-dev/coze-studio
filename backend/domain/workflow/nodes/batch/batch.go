package batch

import (
	"context"
	"errors"
	"fmt"
	"math"
	"reflect"
	"sync"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type Batch struct {
	config  *Config
	outputs map[string]*nodes.FieldSource
}

type Config struct {
	BatchNodeKey  nodes.NodeKey `json:"batch_node_key"`
	InnerWorkflow compose.Runnable[map[string]any, map[string]any]

	InputArrays []string           `json:"input_arrays"`
	Outputs     []*nodes.FieldInfo `json:"outputs"`
}

func NewBatch(_ context.Context, config *Config) (*Batch, error) {
	if config == nil {
		return nil, errors.New("config is required")
	}

	if len(config.InputArrays) == 0 {
		return nil, errors.New("need to have at least one incoming array for batch")
	}

	if len(config.Outputs) == 0 {
		return nil, errors.New("need to have at least one output variable for batch")
	}

	b := &Batch{
		config:  config,
		outputs: make(map[string]*nodes.FieldSource),
	}

	for i := range config.Outputs {
		source := config.Outputs[i]
		path := source.Path
		if len(path) != 1 {
			return nil, fmt.Errorf("invalid path %q", path)
		}

		b.outputs[path[0]] = &source.Source
	}

	return b, nil
}

func (b *Batch) initOutput(length int) map[string]any {
	out := make(map[string]any, len(b.outputs))
	for key := range b.outputs {
		sliceType := reflect.TypeOf([]any{})
		slice := reflect.New(sliceType).Elem()
		slice.Set(reflect.MakeSlice(sliceType, length, length))
		out[key] = slice.Interface()
	}

	return out
}

func (b *Batch) Execute(ctx context.Context, in map[string]any) (map[string]any, error) {
	arrays := make(map[string]any, len(b.config.InputArrays))
	minLen := math.MaxInt
	for _, arrayKey := range b.config.InputArrays {
		a, ok := nodes.TakeMapValue(in, compose.FieldPath{arrayKey})
		if !ok {
			return nil, fmt.Errorf("incoming array not present in input: %s", arrayKey)
		}

		if reflect.TypeOf(a).Kind() != reflect.Slice {
			return nil, fmt.Errorf("incoming array not a slice: %s. Actual type: %v", arrayKey, reflect.TypeOf(a))
		}

		arrays[arrayKey] = a

		oneLen := reflect.ValueOf(a).Len()
		if oneLen < minLen {
			minLen = oneLen
		}
	}

	var maxIter, concurrency int

	maxIterAny, ok := nodes.TakeMapValue(in, compose.FieldPath{"MaxIter"})
	if !ok {
		return nil, fmt.Errorf("incoming max iteration not present in input: %s", in)
	}

	maxIter = maxIterAny.(int)
	if maxIter == 0 {
		maxIter = 100 // TODO: check current default max iter
	}

	concurrencyAny, ok := nodes.TakeMapValue(in, compose.FieldPath{"Concurrency"})
	if !ok {
		return nil, fmt.Errorf("incoming concurrency not present in input: %s", in)
	}

	concurrency = concurrencyAny.(int)
	if concurrency == 0 {
		concurrency = 5 // TODO: check current default concurrency
	}

	if minLen > maxIter {
		minLen = maxIter
	}

	output := b.initOutput(minLen)
	if minLen == 0 {
		return output, nil
	}

	getIthInput := func(i int) (map[string]any, error) {
		input := make(map[string]any)

		for k, v := range in { // carry over other values
			if k != "MaxIter" && k != "Concurrency" {
				input[k] = v
			}
		}

		if _, ok := input[string(b.config.BatchNodeKey)]; !ok {
			input[string(b.config.BatchNodeKey)] = make(map[string]any)
		}

		input[string(b.config.BatchNodeKey)].(map[string]any)["index"] = i

		for arrayKey, array := range arrays {
			input[string(b.config.BatchNodeKey)].(map[string]any)[arrayKey] = reflect.ValueOf(array).Index(i).Interface()
		}

		return input, nil
	}

	setIthOutput := func(i int, taskOutput map[string]any) error {
		for k, source := range b.outputs {
			fromValue, ok := nodes.TakeMapValue(taskOutput, append(compose.FieldPath{string(source.Ref.FromNodeKey)}, source.Ref.FromPath...))
			if !ok {
				return fmt.Errorf("key not present in inner workflow's output: %s", k)
			}

			toArray, ok := nodes.TakeMapValue(output, compose.FieldPath{k})
			if !ok {
				return fmt.Errorf("key not present in outer workflow's output: %s", k)
			}

			reflect.ValueOf(toArray).Index(i).Set(reflect.ValueOf(fromValue))
		}

		return nil
	}

	ctx, cancelFn := context.WithCancelCause(ctx)
	var wg sync.WaitGroup
	ithTask := func(i int) {
		defer wg.Done()

		select {
		case <-ctx.Done():
			return
		default:
		}

		input, err := getIthInput(i)
		if err != nil {
			cancelFn(err)
			return
		}

		taskOutput, err := b.config.InnerWorkflow.Invoke(ctx, input)
		if err != nil {
			cancelFn(err)
			return
		}

		if err = setIthOutput(i, taskOutput); err != nil {
			cancelFn(err)
		}
	}

	wg.Add(minLen)
	if minLen < concurrency {
		for i := 0; i < minLen; i++ {
			go ithTask(i)
		}
	} else {
		taskChan := make(chan int, concurrency)
		for i := 0; i < concurrency; i++ {
			go func() {
				for i := range taskChan {
					ithTask(i)
				}
			}()
		}
		for i := 0; i < minLen; i++ {
			taskChan <- i
		}
		close(taskChan)
	}

	wg.Wait()

	return output, context.Cause(ctx)
}

func (b *Batch) GetType() string {
	return "Batch"
}
