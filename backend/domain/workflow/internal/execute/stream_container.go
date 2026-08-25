/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package execute

import (
	"errors"
	"io"
	"sync"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
)

type StreamContainer struct {
	sw         *schema.StreamWriter[*entity.Message]
	subStreams chan *schema.StreamReader[*entity.Message]
	wg         sync.WaitGroup
}

func NewStreamContainer(sw *schema.StreamWriter[*entity.Message]) *StreamContainer {
	return &StreamContainer{
		sw:         sw,
		subStreams: make(chan *schema.StreamReader[*entity.Message]),
	}
}

func (sc *StreamContainer) AddChild(sr *schema.StreamReader[*entity.Message]) {
	sc.wg.Add(1)
	sc.subStreams <- sr
}

func (sc *StreamContainer) PipeAll() {
	sc.wg.Add(1)

	for sr := range sc.subStreams {
		go func() {
			defer sr.Close()

			for {
				msg, err := sr.Recv()
				if err != nil {
					if errors.Is(err, io.EOF) {
						// io.EOF is the normal end of a sub-stream; do not forward
						// it here. Done() closes sc.sw, which lets the downstream
						// reader observe EOF only after every sub-stream finished,
						// so no sibling sub-stream gets stuck writing.
						sc.wg.Done()
						return
					}
					// A real (non-EOF) error terminates this sub-stream: forward it
					// and stop, so wg.Done() always runs and Done() never waits
					// forever on a stuck sub-stream.
					sc.sw.Send(msg, err)
					sc.wg.Done()
					return
				}
				if closed := sc.sw.Send(msg, err); closed {
					sc.wg.Done()
					return
				}
			}
		}()
	}
}

func (sc *StreamContainer) Done() {
	sc.wg.Done()
	sc.wg.Wait()
	close(sc.subStreams)
	sc.sw.Close()
}
