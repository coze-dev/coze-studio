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
	"testing"
	"time"

	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/require"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
)

// consume drains outReader until EOF, returning the message count and the
// first non-EOF error (if any). It models the real downstream consumer that
// reads the container's output stream concurrently with PipeAll.
func consume(outReader *schema.StreamReader[*entity.Message]) (int, error) {
	var (
		count    int
		firstErr error
	)
	for {
		_, err := outReader.Recv()
		if err != nil {
			if errors.Is(err, io.EOF) {
				return count, firstErr
			}
			if firstErr == nil {
				firstErr = err
			}
			continue
		}
		count++
	}
}

// TestStreamContainerPipeAllNonEOFError ensures that a sub-stream which yields
// a non-EOF error terminates its goroutine and Done() does not hang.
func TestStreamContainerPipeAllNonEOFError(t *testing.T) {
	outReader, outWriter := schema.Pipe[*entity.Message](16)
	defer outReader.Close()

	sc := NewStreamContainer(outWriter)

	// A child stream whose convert step always fails with a non-EOF error.
	src := schema.StreamReaderFromArray([]*entity.Message{
		{DataMessage: &entity.DataMessage{Content: "a"}},
		{DataMessage: &entity.DataMessage{Content: "b"}},
	})
	child := schema.StreamReaderWithConvert(src, func(_ *entity.Message) (*entity.Message, error) {
		return nil, errors.New("boom")
	})

	go sc.PipeAll()
	sc.AddChild(child)

	var (
		msgCount int
		gotErr   error
		mu       sync.Mutex
	)
	consumerDone := make(chan struct{})
	go func() {
		c, e := consume(outReader)
		mu.Lock()
		msgCount, gotErr = c, e
		mu.Unlock()
		close(consumerDone)
	}()

	done := make(chan struct{})
	go func() {
		sc.Done()
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(3 * time.Second):
		t.Fatal("Done() hung: sub-stream returned a non-EOF error but PipeAll never terminated it")
	}
	select {
	case <-consumerDone:
	case <-time.After(3 * time.Second):
		t.Fatal("downstream consumer did not finish after Done()")
	}

	mu.Lock()
	defer mu.Unlock()
	require.Error(t, gotErr)
	require.Equal(t, "boom", gotErr.Error(), "expected the forwarded non-EOF error, got: %v", gotErr)
	require.Zero(t, msgCount, "convert always failed, no message items expected")
}

// TestStreamContainerPipeAllSiblingAfterEOF ensures that when one sub-stream
// finishes (EOF) while a sibling still produces data, Done() does not hang.
// EOF must not be forwarded eagerly per sub-stream, otherwise the downstream
// reader would stop consuming and the sibling's Send would block forever.
func TestStreamContainerPipeAllSiblingAfterEOF(t *testing.T) {
	outReader, outWriter := schema.Pipe[*entity.Message](16)
	defer outReader.Close()

	sc := NewStreamContainer(outWriter)

	// Sibling A ends immediately (EOF).
	readerA, writerA := schema.Pipe[*entity.Message](4)
	// Sibling B keeps producing messages after A already finished.
	readerB, writerB := schema.Pipe[*entity.Message](4)

	go sc.PipeAll()
	sc.AddChild(readerA)
	writerA.Close()
	sc.AddChild(readerB)

	const msgTotal = 100
	go func() {
		for i := 0; i < msgTotal; i++ {
			writerB.Send(&entity.Message{
				DataMessage: &entity.DataMessage{Content: "msg"},
			}, nil)
		}
		writerB.Close()
	}()

	var (
		msgCount int
		mu       sync.Mutex
	)
	consumerDone := make(chan struct{})
	go func() {
		c, _ := consume(outReader)
		mu.Lock()
		msgCount = c
		mu.Unlock()
		close(consumerDone)
	}()

	done := make(chan struct{})
	go func() {
		sc.Done()
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(3 * time.Second):
		t.Fatal("Done() hung: a sibling stream still had data after another finished")
	}
	select {
	case <-consumerDone:
	case <-time.After(3 * time.Second):
		t.Fatal("downstream consumer did not finish after Done()")
	}

	mu.Lock()
	defer mu.Unlock()
	require.Equal(t, msgTotal, msgCount, "expected all messages from the surviving sibling")
}
