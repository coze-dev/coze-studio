package emitter

import (
	"context"
	"errors"
	"fmt"
	"io"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/pkg/safego"
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
		isStream := sInfo.FieldType == nodes.FieldIsStream
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
		return c.infos[k].FieldType == nodes.FieldSkipped
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

func (c *cacheStore) find(part nodes.TemplatePart) (root any, subCache *cachedVal, sourceInfo *nodes.SourceInfo,
	actualPath []string,
) {
	rootCached, ok := c.store[part.Root]
	if !ok {
		return nil, nil, nil, nil
	}

	// now try to find the nearest match within the cached tree
	subPaths := part.SubPathsBeforeSlice
	currentCache := rootCached
	currentSource := c.infos[part.Root]
	for i := range subPaths {
		if !currentSource.IsIntermediate {
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
			// subPath corresponds to a real Field Source,
			// if it's not cached, then it hasn't appeared in the stream yet
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
	resolvedSources, err := nodes.ResolveStreamSources(ctx, e.cfg.FullSources)
	if err != nil {
		return nil, err
	}

	sr, sw := schema.Pipe[map[string]any](0)
	parts := nodes.ParseTemplate(e.cfg.Template)
	safego.Go(ctx, func() {
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

			if !part.IsVariable { // literal string within template, just emit it
				sw.Send(map[string]any{outputKey: part.Value}, nil)
				continue
			}

			// now this 'part' is a variable, first check if the source(s) for it are skipped (the nodes are not selected)
			// if skipped, just move on to the next 'part'
			if part.Skipped(resolvedSources) {
				continue
			}

			// now this 'part' definitely should have a match, look for a hit within cache store
			// if found in cache store, emit the root only if the match is finished or the match is stream
			// the rule for a hit: the nearest match within the source tree
			// if hit, and the cachedVal is also finished, continue to next template part
			cachedRoot, subCache, sourceInfo, _ := caches.find(part)
			if cachedRoot != nil && subCache != nil {
				if subCache.finished || sourceInfo.FieldType == nodes.FieldIsStream {
					hasErr = renderAndSend(part, part.Root, cachedRoot, sw)
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
				case <-ctx.Done(): // canceled by Eino workflow engine or timeout
					sw.Send(nil, ctx.Err())
					hasErr = true
					return
				default:
				}

				chunk, err := in.Recv()
				if err != nil {
					if err == io.EOF {
						// current part is not fulfilled, emit the literal part content and move on to next part
						sw.Send(map[string]any{outputKey: part.Value}, nil)
						break
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
					if k == part.Root {
						cachedRoot, subCache, sourceInfo, actualPath := caches.find(part)
						if sourceInfo == nil {
							panic("impossible, k is part.root, but sourceInfo is nil")
						}

						if subCache != nil {
							if sourceInfo.IsIntermediate {
								if subCache.finished {
									hasErr = renderAndSend(part, part.Root, cachedRoot, sw)
									if hasErr {
										return
									}
									shouldChangePart = true
								}
							} else {
								if sourceInfo.FieldType == nodes.FieldIsStream {
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

									hasErr = renderAndSend(part, part.Root, delta, sw)
								} else {
									hasErr = renderAndSend(part, part.Root, v, sw)
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
	})

	return sr, nil
}

func (e *OutputEmitter) Emit(ctx context.Context, in map[string]any) (output map[string]any, err error) {
	s, err := nodes.Render(ctx, e.cfg.Template, in, e.cfg.FullSources)
	if err != nil {
		return nil, err
	}

	output = map[string]any{
		outputKey: s,
	}

	return output, nil
}

func renderAndSend(tp nodes.TemplatePart, k string, v any, sw *schema.StreamWriter[map[string]any]) bool /*hasError*/ {
	m, err := sonic.Marshal(map[string]any{k: v})
	if err != nil {
		sw.Send(nil, err)
		return true
	}

	r, err := tp.Render(m)
	if err != nil {
		sw.Send(nil, err)
		return true
	}

	if len(r) == 0 { // won't send if formatted result is empty string
		return false
	}

	sw.Send(map[string]any{outputKey: r}, nil)
	return false
}
