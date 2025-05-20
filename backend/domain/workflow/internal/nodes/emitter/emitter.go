package emitter

import (
	"context"
	"errors"
	"fmt"
	"io"
	"regexp"
	"strings"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

type OutputEmitter struct {
	cfg *Config
}

type Config struct {
	Template    string
	FullSources map[string]*nodes.SourceInfo
}

func New(_ context.Context, cfg *Config) (*OutputEmitter, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}

	return &OutputEmitter{
		cfg: cfg,
	}, nil
}

type cachedVal struct {
	val       any
	finished  bool
	subCaches *cacheStore
}

type cacheStore struct {
	store map[string]*cachedVal
	infos map[string]*nodes.SourceInfo
}

func newCacheStore(infos map[string]*nodes.SourceInfo) *cacheStore {
	return &cacheStore{
		store: make(map[string]*cachedVal),
		infos: infos,
	}
}

func (c *cacheStore) put(k string, v any) (*cachedVal, error) {
	sInfo, ok := c.infos[k]
	if !ok {
		return nil, fmt.Errorf("no such key found from SourceInfos: %s", k)
	}

	if !sInfo.IsIntermediate { // this is not an intermediate object container
		isStream := sInfo.FieldIsStream == nodes.FieldIsStream
		if !isStream {
			_, ok := c.store[k]
			if !ok {
				out := &cachedVal{
					val:      v,
					finished: true,
				}
				c.store[k] = out
				return out, nil
			} else {
				return nil, fmt.Errorf("source %s not intermediate, not stream, appears multiple times", k)
			}
		} else { // this is an actual stream
			vStr, ok := v.(string) // stream value should be string
			if !ok {
				return nil, fmt.Errorf("source %s is not intermediate, is stream, but value type not str: %T", k, v)
			}

			isFinished := strings.HasSuffix(vStr, nodes.KeyIsFinished)
			if isFinished {
				vStr = strings.TrimSuffix(vStr, nodes.KeyIsFinished)
			}

			var existingStr string
			existing, ok := c.store[k]
			if ok {
				existingStr = existing.val.(string)
			}

			existingStr = existingStr + vStr
			out := &cachedVal{
				val:      existingStr,
				finished: isFinished,
			}
			c.store[k] = out

			return out, nil
		}
	}

	if len(sInfo.SubSources) == 0 {
		// k is intermediate container, needs to check its sub sources
		return nil, fmt.Errorf("source %s is intermediate, but does not have sub sources", k)
	}

	vMap, ok := v.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("source %s is intermediate, but value type not map: %T", k, v)
	}

	currentCache, existed := c.store[k]
	if !existed {
		currentCache = &cachedVal{
			val:       v,
			subCaches: newCacheStore(sInfo.SubSources),
		}
		c.store[k] = currentCache
	} else {
		// already cached k before, merge cached value with new value
		currentCache.val = merge(currentCache.val, v)
	}

	subCacheStore := currentCache.subCaches
	for subK := range subCacheStore.infos {
		subV, ok := vMap[subK]
		if !ok { // subK not present in this chunk
			continue
		}
		_, err := subCacheStore.put(subK, subV)
		if err != nil {
			return nil, err
		}
	}

	_ = c.finished(k)

	return currentCache, nil
}

func (c *cacheStore) finished(k string) bool {
	cached, ok := c.store[k]
	if !ok {
		return false
	}

	if cached.finished {
		return true
	}

	sInfo := c.infos[k]
	if !sInfo.IsIntermediate {
		return cached.finished
	}

	for subK := range sInfo.SubSources {
		subFinished := cached.subCaches.finished(subK)
		if !subFinished {
			return false
		}
	}

	cached.finished = true
	return true
}

func (c *cacheStore) find(part templatePart) (root any, subCache *cachedVal, sourceInfo *nodes.SourceInfo,
	actualPath []string) {
	rootCached, ok := c.store[part.root]
	if !ok {
		return nil, nil, nil, nil
	}

	// now try to find the nearest match within the cached tree
	subPaths := part.subPathsBeforeSlice
	currentCache := rootCached
	currentSource := c.infos[part.root]
	for i := range subPaths {
		if currentSource.SubSources == nil {
			// currentSource is already the leaf, no need to look further
			break
		}
		subPath := subPaths[i]
		subInfo, ok := currentSource.SubSources[subPath]
		if !ok {
			// this sub path is not in the source info tree
			// it's just a user defined variable field in the template
			break
		}

		actualPath = append(actualPath, subPath)

		subCache, ok = currentCache.subCaches.store[subPath]
		if !ok {
			return rootCached.val, nil, subInfo, actualPath
		}
		if !subCache.finished {
			return rootCached.val, subCache, subInfo, actualPath
		}

		currentCache = subCache
		currentSource = subInfo
	}

	return rootCached.val, currentCache, currentSource, actualPath
}

func merge(a, b any) any {
	aStr, ok1 := a.(string)
	bStr, ok2 := b.(string)
	if ok1 && ok2 {
		if strings.HasSuffix(bStr, nodes.KeyIsFinished) {
			bStr = strings.TrimSuffix(bStr, nodes.KeyIsFinished)
		}
		return aStr + bStr
	}

	aMap, ok1 := a.(map[string]interface{})
	bMap, ok2 := b.(map[string]interface{})
	if ok1 && ok2 {
		merged := make(map[string]any)
		for k, v := range aMap {
			merged[k] = v
		}
		for k, v := range bMap {
			if _, ok := merged[k]; !ok { // only bMap has this field, just set it
				merged[k] = v
				continue
			}
			merged[k] = merge(merged[k], v)
		}
		return merged
	}

	panic(fmt.Errorf("can only merge two maps or two strings, a type: %T, b type: %T", a, b))
}

const outputKey = "output"

func (e *OutputEmitter) EmitStream(ctx context.Context, in *schema.StreamReader[map[string]any]) (out *schema.StreamReader[map[string]any], err error) {
	defer func() {
		if err != nil {
			_ = callbacks.OnError(ctx, err)
		}
	}()

	ctx, in = callbacks.OnStartWithStreamInput(ctx, in)

	resolvedSources, err := nodes.ResolveStreamSources(ctx, e.cfg.FullSources)
	if err != nil {
		return nil, err
	}

	sr, sw := schema.Pipe[map[string]any](0)
	parts := parseJinja2Template(e.cfg.Template)
	go func() {
		hasErr := false
		defer func() {
			if !hasErr {
				sw.Send(map[string]any{outputKey: nodes.KeyIsFinished}, nil)
			}
			sw.Close()
			in.Close()
		}()

		caches := newCacheStore(resolvedSources)

	partsLoop:
		for _, part := range parts {
			select {
			case <-ctx.Done(): // canceled by Eino workflow engine
				sw.Send(nil, ctx.Err())
				hasErr = true
				return
			default:
			}

			if !part.isVariable { // literal string within template, just emit it
				sw.Send(map[string]any{outputKey: part.value}, nil)
				continue
			}

			// now this 'part' is a variable, look for a hit within cache store
			// if found in cache store, emit the root only if the match is finished or the match is stream
			// the rule for a hit: the nearest match within the source tree
			// if hit, and the cachedVal is also finished, continue to next template part
			cachedRoot, subCache, sourceInfo, _ := caches.find(part)
			if cachedRoot != nil && subCache != nil {
				if subCache.finished || sourceInfo.FieldIsStream == nodes.FieldIsStream {
					hasErr = part.renderAndSend(part.root, cachedRoot, sw)
					if hasErr {
						return
					}
					if subCache.finished { // move on to next part in template
						continue
					}
				}
			}

			for {
				select {
				case <-ctx.Done(): // canceled by Eino workflow engine
					sw.Send(nil, ctx.Err())
					hasErr = true
					return
				default:
				}

				chunk, err := in.Recv()
				if err != nil {
					if err == io.EOF {
						return
					}

					hasErr = true
					sw.Send(nil, err) // real error
					return
				}

				shouldChangePart := false
			chunkLoop:
				for k := range chunk {
					v := chunk[k]
					_, err = caches.put(k, v) // always update the cache
					if err != nil {
						hasErr = true
						sw.Send(nil, err)
						return
					}

					// needs to check if this 'k' is the current part's root
					// if it is, do the case analysis:
					// - the source is a leaf (not intermediate):
					//   - the source is stream, emit the formatted stream content immediately
					//   - the source is not stream, emit the formatted one-time content immediately
					// - the source is intermediate:
					//   - the source is not finished, do not emit it
					//   - the source is finished, emit the full content (cached + new) immediately
					if k == part.root {
						cachedRoot, subCache, sourceInfo, actualPath := caches.find(part)
						if sourceInfo == nil {
							panic("impossible, k is part.root, but sourceInfo is nil")
						}

						if subCache != nil {
							if sourceInfo.IsIntermediate {
								if subCache.finished {
									hasErr = part.renderAndSend(part.root, cachedRoot, sw)
									if hasErr {
										return
									}
									shouldChangePart = true
								}
							} else {
								if sourceInfo.FieldIsStream == nodes.FieldIsStream {
									currentV := v
									for i := 0; i < len(actualPath)-1; i++ {
										currentM, ok := currentV.(map[string]any)
										if !ok {
											panic("emit item not map[string]any")
										}
										currentV, ok = currentM[actualPath[i]]
										if !ok {
											continue chunkLoop
										}
									}

									if len(actualPath) > 0 {
										finalV, ok := currentV.(map[string]any)[actualPath[len(actualPath)-1]]
										if !ok {
											continue chunkLoop
										}
										currentV = finalV
									}
									vStr, ok := currentV.(string)
									if !ok {
										panic(fmt.Errorf("source %s is not intermediate, is stream, but value type not str: %T", k, v))
									}

									if strings.HasSuffix(vStr, nodes.KeyIsFinished) {
										vStr = strings.TrimSuffix(vStr, nodes.KeyIsFinished)
									}

									var delta any
									delta = vStr
									for j := len(actualPath) - 1; j >= 0; j-- {
										delta = map[string]any{
											actualPath[j]: delta,
										}
									}

									hasErr = part.renderAndSend(part.root, delta, sw)
								} else {
									hasErr = part.renderAndSend(part.root, v, sw)
								}

								if hasErr {
									return
								}
								if subCache.finished {
									shouldChangePart = true
								}
							}
						}

					}
				}

				if shouldChangePart {
					continue partsLoop
				}
			}
		}
	}()

	_, sr = callbacks.OnEndWithStreamOutput(ctx, sr)
	return sr, nil
}

func (e *OutputEmitter) Emit(ctx context.Context, in map[string]any) (output map[string]any, err error) {
	defer func() {
		if err != nil {
			_ = callbacks.OnError(ctx, err)
		}
	}()

	ctx = callbacks.OnStart(ctx, in)

	var out string
	out, err = nodes.Jinja2TemplateRender(e.cfg.Template, in)
	if err != nil {
		return nil, err
	}

	output = map[string]any{
		outputKey: out,
	}

	_ = callbacks.OnEnd(ctx, output)
	return output, nil
}

type templatePart struct {
	isVariable          bool
	value               string
	root                string
	subPathsBeforeSlice []string
}

var re = regexp.MustCompile(`{{\s*([^}]+)\s*}}`)

func parseJinja2Template(template string) []templatePart {
	matches := re.FindAllStringSubmatchIndex(template, -1)
	parts := make([]templatePart, 0)
	lastEnd := 0

	for _, match := range matches {
		start, end := match[0], match[1]
		placeholderStart, placeholderEnd := match[2], match[3]

		// Add the literal part before the current variable placeholder
		if start > lastEnd {
			parts = append(parts, templatePart{
				isVariable: false,
				value:      template[lastEnd:start],
			})
		}

		// Add the variable placeholder
		val := template[placeholderStart:placeholderEnd]
		segments := strings.Split(val, ".")
		var subPaths []string
		if !strings.Contains(segments[0], "[") {
			for i := 1; i < len(segments); i++ {
				if strings.Contains(segments[i], "[") {
					break
				}
				subPaths = append(subPaths, segments[i])
			}
		}
		parts = append(parts, templatePart{
			isVariable:          true,
			value:               val,
			root:                removeSlice(segments[0]),
			subPathsBeforeSlice: subPaths,
		})

		lastEnd = end
	}

	// Add the remaining literal part if there is any
	if lastEnd < len(template) {
		parts = append(parts, templatePart{
			isVariable: false,
			value:      template[lastEnd:],
		})
	}

	return parts
}

func removeSlice(s string) string {
	i := strings.Index(s, "[")
	if i != -1 {
		return s[:i]
	}
	return s
}

func (tp templatePart) renderAndSend(k string, v any, sw *schema.StreamWriter[map[string]any]) bool /*hasError*/ {
	tpl := fmt.Sprintf("{{%s}}", tp.value)
	formatted, err := nodes.Jinja2TemplateRender(tpl, map[string]any{k: v})
	if err != nil {
		sw.Send(nil, err)
		return true
	}

	if len(formatted) == 0 { // won't send if formatted result is empty string
		return false
	}

	sw.Send(map[string]any{outputKey: formatted}, nil)
	return false
}

func (e *OutputEmitter) IsCallbacksEnabled() bool {
	return true
}
