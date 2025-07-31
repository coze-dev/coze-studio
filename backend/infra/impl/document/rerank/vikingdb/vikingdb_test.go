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

package vikingdb

//func TestRun(t *testing.T) {
//	AK := os.Getenv("test_ak")
//	SK := os.Getenv("test_sk")
//
//	r := NewReranker(&Config{
//		AK: AK,
//		SK: SK,
//	})
//	resp, err := r.Rerank(context.Background(), &rerank.Request{
//		Data: [][]*knowledge.RetrieveSlice{
//			{
//				{Slice: & entity. Slice {PlainText: "According to the Guinness World Records website, the blue whale is currently the largest animal known in the world, with a body length of up to 30 meters, which is equivalent to the length of a Boeing 737 aircraft"}},
//				{Slice: & entity. Slice {PlainText: "An adult female bowhead whale can grow to 22 meters long, while a male whale can grow to 18 meters long"}},
//			},
//		},
//		Query: "What is the largest whale in the world?"
//		TopN:  nil,
//	})
//	assert.NoError(t, err)
//
//	for _, item := range resp.Sorted {
//		fmt.Println(item.Slice.PlainText, item.Score)
//	}
//	According to the Guinness World Records website, the blue whale is the largest known animal in the world, with a body length of up to 30 meters, which is equivalent to the length of a Boeing 737 aircraft 6209664529733573
//	//An adult female bowhead whale can grow up to 22 meters long, while a male whale can grow up to 18 meters 4269785303456468
//
//	fmt.Println(resp.TokenUsage)
//	// 95
//
//}
