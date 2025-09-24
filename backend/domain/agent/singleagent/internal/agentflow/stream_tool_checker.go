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

package agentflow

import (
	"context"
	"io"
	"os"
	"strings"

	"github.com/cloudwego/eino/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

// 可以通过环境变量控制是否强制使用兼容模式
func shouldUseCompatibleChecker() bool {
	// 可以通过环境变量来控制
	if os.Getenv("FORCE_COMPATIBLE_TOOL_CHECKER") == "true" {
		return true
	}
	return false
}

// qwenCompatibleToolCallChecker 是一个兼容 Qwen/Claude 等模型的 tool call checker
// 这些模型可能会先输出文本内容，然后才输出工具调用
// 与默认的 firstChunkStreamToolCallChecker 不同，这个 checker 会读取更多的 chunks
// 来判断是否包含工具调用，而不是看到文本就立即返回 false
func qwenCompatibleToolCallChecker(ctx context.Context, sr *schema.StreamReader[*schema.Message]) (bool, error) {
	defer sr.Close()

	const maxChunksToCheck = 10 // 最多检查前10个chunks
	chunksChecked := 0
	hasContent := false
	contentBuilder := strings.Builder{}

	logs.CtxInfof(ctx, "[QwenChecker] Starting to check stream for tool calls")

	for chunksChecked < maxChunksToCheck {
		msg, err := sr.Recv()
		if err == io.EOF {
			logs.CtxInfof(ctx, "[QwenChecker] Stream ended, chunks checked: %d, hasContent: %v", 
				chunksChecked, hasContent)
			break
		}
		if err != nil {
			logs.CtxErrorf(ctx, "[QwenChecker] Error reading stream: %v", err)
			return false, err
		}

		chunksChecked++

		// 如果发现工具调用，立即返回 true
		if len(msg.ToolCalls) > 0 {
			logs.CtxInfof(ctx, "[QwenChecker] Found tool calls in chunk %d: %+v", 
				chunksChecked, msg.ToolCalls)
			return true, nil
		}

		// 收集文本内容
		if len(msg.Content) > 0 {
			hasContent = true
			contentBuilder.WriteString(msg.Content)
			logs.CtxDebugf(ctx, "[QwenChecker] Chunk %d has content: %s", 
				chunksChecked, msg.Content)
		}

		// 如果已经有足够的内容，检查是否像是最终答案
		if hasContent && chunksChecked >= 3 {
			content := contentBuilder.String()
			
			// 如果内容包含明确的工具调用意图词，继续等待
			toolIntentKeywords := []string{
				"让我", "我将", "我来", "正在", "开始",
				"Let me", "I will", "I'll", "Starting", "Now",
				"查询", "获取", "搜索", "调用",
				"query", "fetch", "search", "calling",
			}
			
			hasToolIntent := false
			for _, keyword := range toolIntentKeywords {
				if strings.Contains(content, keyword) {
					hasToolIntent = true
					break
				}
			}
			
			if hasToolIntent {
				logs.CtxInfof(ctx, "[QwenChecker] Content suggests tool intent, continue checking. Content: %s", 
					content)
				continue // 继续检查更多chunks
			}
			
			// 如果内容看起来像是直接的答案（没有工具调用意图），可以提前返回
			answerKeywords := []string{
				"根据", "您的", "以下是", "信息如下", "结果是",
				"Based on", "Your", "Here is", "The result", "According to",
			}
			
			for _, keyword := range answerKeywords {
				if strings.Contains(content, keyword) {
					logs.CtxInfof(ctx, "[QwenChecker] Content appears to be final answer, no tools needed. Content: %s", 
						content)
					return false, nil
				}
			}
		}
	}

	// 检查完指定数量的chunks后，做最终判断
	if !hasContent {
		// 没有内容也没有工具调用，可能是空响应
		logs.CtxInfof(ctx, "[QwenChecker] No content or tool calls found")
		return false, nil
	}

	// 有内容但没有工具调用
	// 对于Qwen模型，如果前10个chunks都没有工具调用，那很可能就是没有
	logs.CtxInfof(ctx, "[QwenChecker] Checked %d chunks, found content but no tool calls. Content preview: %s", 
		chunksChecked, contentBuilder.String())
	
	return false, nil
}

// adaptiveToolCallChecker 自适应的工具调用检查器
// 根据不同的场景和模型特点，动态调整检查策略
func adaptiveToolCallChecker(ctx context.Context, sr *schema.StreamReader[*schema.Message]) (bool, error) {
	defer sr.Close()

	// 收集前面若干个chunks的信息
	type chunkInfo struct {
		hasContent   bool
		hasToolCalls bool
		content      string
	}
	
	chunks := make([]chunkInfo, 0, 30)
	totalContent := strings.Builder{}
	
	logs.CtxInfof(ctx, "[AdaptiveChecker] Starting adaptive tool call check")

	// 读取最多30个chunks或直到流结束（增加到30个以捕获更多信息）
	for i := 0; i < 30; i++ {
		msg, err := sr.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			logs.CtxErrorf(ctx, "[AdaptiveChecker] Error reading stream: %v", err)
			return false, err
		}

		info := chunkInfo{
			hasContent:   len(msg.Content) > 0,
			hasToolCalls: len(msg.ToolCalls) > 0,
			content:      msg.Content,
		}
		chunks = append(chunks, info)
		
		if info.hasContent {
			totalContent.WriteString(msg.Content)
		}

		// 如果找到工具调用，立即返回
		if info.hasToolCalls {
			logs.CtxInfof(ctx, "[AdaptiveChecker] Found tool calls in chunk %d", i+1)
			return true, nil
		}

		// 不要过早退出！让模型有足够的时间生成工具调用
		// 删除早期退出逻辑
	}

	// 分析收集到的chunks
	hasAnyContent := false
	for _, chunk := range chunks {
		if chunk.hasContent {
			hasAnyContent = true
			break
		}
	}

	if !hasAnyContent {
		logs.CtxInfof(ctx, "[AdaptiveChecker] No content found in %d chunks", len(chunks))
		return false, nil
	}

	// 最终判断：基于内容分析
	finalContent := totalContent.String()
	logs.CtxInfof(ctx, "[AdaptiveChecker] Final analysis of %d chunks, content length: %d", 
		len(chunks), len(finalContent))

	// 🔥 关键改进：检查内容是否暗示还有更多工具需要调用
	continueIndicators := []string{
		"接下来", "然后", "继续", "下一步", "现在让我", "现在我将",
		"Next", "Then", "Now let me", "Now I will", "Following",
		"接着", "再", "第二", "其次",
	}
	
	for _, indicator := range continueIndicators {
		if strings.Contains(finalContent, indicator) {
			logs.CtxInfof(ctx, "[AdaptiveChecker] Content suggests more tools need to be called (found: %s)", indicator)
			// 🔥 这里是关键：即使没有明确的工具调用，如果内容暗示需要继续，也返回false让循环继续
			return false, nil
		}
	}

	// 检查是否是最终答案（表示所有工具都已调用完成）
	finalAnswerPatterns := []string{
		"根据搜索结果", "综上所述", "总结来说", "以上是",
		"Based on the search results", "In summary", "To summarize",
		"查询到的信息显示", "我搜索到的信息",
	}
	
	for _, pattern := range finalAnswerPatterns {
		if strings.Contains(finalContent, pattern) {
			logs.CtxInfof(ctx, "[AdaptiveChecker] Content appears to be final answer, stopping tool calls")
			return false, nil
		}
	}

	logs.CtxInfof(ctx, "[AdaptiveChecker] No clear indication of tool calls or continuation")
	return false, nil
}