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

package builtin

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/text"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/ocr"
	contract "github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

func ParseMarkdown(config *contract.Config, storage storage.Storage, ocr ocr.OCR) ParseFn {
	return func(ctx context.Context, reader io.Reader, opts ...parser.Option) (docs []*schema.Document, err error) {
		options := parser.GetCommonOptions(&parser.Options{}, opts...)
		mdParser := goldmark.DefaultParser()
		b, err := io.ReadAll(reader)
		if err != nil {
			return nil, err
		}


		node := mdParser.Parse(text.NewReader(b))
		cs := config.ChunkingStrategy
		ps := config.ParsingStrategy

		if cs.ChunkType != contract.ChunkTypeCustom && cs.ChunkType != contract.ChunkTypeDefault {
			return nil, fmt.Errorf("[ParseMarkdown] chunk type not support, chunk type=%d", cs.ChunkType)
		}

		var (
			last       *schema.Document
			emptySlice bool
		)

		addSliceContent := func(content string) {
			emptySlice = false
			last.Content += content
		}

		newSlice := func(needOverlap bool) {
			last = &schema.Document{
				MetaData: map[string]any{},
			}

			for k, v := range options.ExtraMeta {
				last.MetaData[k] = v
			}

			if needOverlap && cs.Overlap > 0 && len(docs) > 0 {
				overlap := getOverlap([]rune(docs[len(docs)-1].Content), cs.Overlap, cs.ChunkSize)
				addSliceContent(string(overlap))
			}

			emptySlice = true
		}

		pushSlice := func() {
			if !emptySlice && last.Content != "" {
				docs = append(docs, last)
				newSlice(true)
			}
		}

		trim := func(text string) string {
			if cs.TrimURLAndEmail {
				text = urlRegex.ReplaceAllString(text, "")
				text = emailRegex.ReplaceAllString(text, "")
			}
			if cs.TrimSpace {
				text = strings.TrimSpace(text)
				text = spaceRegex.ReplaceAllString(text, " ")
			}
			return text
		}

		// validateImageURL 验证图片URL的安全性
		validateImageURL := func(urlString string) error {
			parsedURL, err := url.Parse(urlString)
			if err != nil {
				return err
			}
			
			// 只允许HTTP/HTTPS
			if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
				return fmt.Errorf("unsupported scheme: %s", parsedURL.Scheme)
			}
			
			// 检查域名白名单
			allowedDomains := []string{
				"images.unsplash.com",
				"cdn.example.com",
				"github.com",
				"githubusercontent.com",
				// 可以根据需要添加其他受信任的域名
			}
			
			hostname := parsedURL.Hostname()
			for _, domain := range allowedDomains {
				if hostname == domain || strings.HasSuffix(hostname, "."+domain) {
					return nil
				}
			}
			
			return fmt.Errorf("domain not allowed: %s", hostname)
		}

		// isPrivateIPAddress 检查IP地址是否为私有地址
		isPrivateIPAddress := func(ip net.IP) bool {
			// 检查私有IP范围
			privateRanges := []struct {
				cidr string
			}{
				{"10.0.0.0/8"},
				{"172.16.0.0/12"},
				{"192.168.0.0/16"},
				{"127.0.0.0/8"},
				{"169.254.0.0/16"}, // 链路本地地址
				{"::1/128"},        // IPv6 loopback
				{"fc00::/7"},       // IPv6 私有地址
			}
			
			for _, r := range privateRanges {
				_, cidr, _ := net.ParseCIDR(r.cidr)
				if cidr.Contains(ip) {
					return true
				}
			}
			
			return false
		}

		// isPrivateIP 检查是否为私有IP地址
		isPrivateIP := func(host string) bool {
			ip := net.ParseIP(host)
			if ip == nil {
				// 可能是域名，需要解析
				ips, err := net.LookupIP(host)
				if err != nil {
					return true // 解析失败，拒绝访问
				}
				
				// 检查所有解析的IP
				for _, resolvedIP := range ips {
					if isPrivateIPAddress(resolvedIP) {
						return true
					}
				}
				return false
			}
			
			return isPrivateIPAddress(ip)
		}

		downloadImage := func(ctx context.Context, url string) ([]byte, error) {
			// URL验证
			if err := validateImageURL(url); err != nil {
				return nil, fmt.Errorf("invalid URL: %w", err)
			}
			
			// 使用安全的HTTP客户端
			client := &http.Client{
				Timeout: 5 * time.Second,
				Transport: &http.Transport{
					DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
						// 禁止访问私有IP
						host, _, err := net.SplitHostPort(addr)
						if err != nil {
							return nil, err
						}
						
						if isPrivateIP(host) {
							return nil, fmt.Errorf("access to private IP denied: %s", host)
						}
						
						return (&net.Dialer{}).DialContext(ctx, network, addr)
					},
				},
			}
			
			req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
			if err != nil {
				return nil, fmt.Errorf("failed to create HTTP request: %w", err)
			}
			
			// 添加安全头
			req.Header.Set("User-Agent", "CozeStudio/1.0")
			
			resp, err := client.Do(req)
			if err != nil {
				return nil, fmt.Errorf("failed to download image: %w", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				return nil, fmt.Errorf("failed to download image, status code: %d", resp.StatusCode)
			}

			// 限制响应大小
			const maxImageSize = 10 * 1024 * 1024 // 10MB
			limitedReader := io.LimitReader(resp.Body, maxImageSize)
			
			data, err := io.ReadAll(limitedReader)
			if err != nil {
				return nil, fmt.Errorf("failed to read image content: %w", err)
			}

			return data, nil
		}

		walker := func(n ast.Node, entering bool) (ast.WalkStatus, error) {
			if !entering {
				return ast.WalkContinue, nil
			}

			switch n.Kind() {
			case ast.KindText:
				if n.HasChildren() {
					break
				}
				textNode := n.(*ast.Text)
				plainText := trim(string(textNode.Segment.Value(b)))

				for _, part := range strings.Split(plainText, cs.Separator) {
					runes := []rune(part)
					for partLength := int64(len(runes)); partLength > 0; partLength = int64(len(runes)) {
						pos := min(partLength, cs.ChunkSize-charCount(last.Content))
						chunk := runes[:pos]
						addSliceContent(string(chunk))
						runes = runes[pos:]
						if charCount(last.Content) >= cs.ChunkSize {
							pushSlice()
						}
					}
				}

			case ast.KindImage:
				if !ps.ExtractImage {
					break
				}

				imageNode := n.(*ast.Image)

				if ps.ExtractImage {
					imageURL := string(imageNode.Destination)
					if _, err = url.ParseRequestURI(imageURL); err == nil {
						sp := strings.Split(imageURL, ".")
						if len(sp) == 0 {
							return ast.WalkStop, fmt.Errorf("failed to extract image extension, url=%s", imageURL)
						}
						ext := sp[len(sp)-1]

						img, err := downloadImage(ctx, imageURL)
						if err != nil {
							return ast.WalkStop, fmt.Errorf("failed to download image: %w", err)
						}

						imgSrc, err := PutImageObject(ctx, storage, ext, GetCreatorIDFromExtraMeta(options.ExtraMeta), img)
						if err != nil {
							return ast.WalkStop, err
						}

						if !emptySlice && last.Content != "" {
							pushSlice()
						} else {
							newSlice(false)
						}

						addSliceContent(fmt.Sprintf("\n%s\n", imgSrc))

						if ps.ImageOCR && ocr != nil {
							texts, err := ocr.FromBase64(ctx, base64.StdEncoding.EncodeToString(img))
							if err != nil {
								return ast.WalkStop, fmt.Errorf("failed to perform OCR on image: %w", err)
							}
							addSliceContent(strings.Join(texts, "\n"))
						}

						if charCount(last.Content) >= cs.ChunkSize {
							pushSlice()
						}
					} else {
						logs.CtxInfof(ctx, "[ParseMarkdown] not a valid image url, skip, got=%s", imageURL)
					}
				}
			}

			return ast.WalkContinue, nil
		}

		newSlice(false)

		if err = ast.Walk(node, walker); err != nil {
			return nil, err
		}

		if !emptySlice {
			pushSlice()
		}

		return docs, nil
	}
}
