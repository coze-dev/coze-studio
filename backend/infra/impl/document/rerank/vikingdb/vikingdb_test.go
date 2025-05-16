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
//				{Slice: &entity.Slice{PlainText: "吉尼斯世界纪录网站数据显示，蓝鲸是目前已知世界上最大的动物，体长可达30米，相当于一架波音737飞机的长度"}},
//				{Slice: &entity.Slice{PlainText: "一头成年雌性弓头鲸可以长到22米长，而一头雄性鲸鱼可以长到18米长"}},
//			},
//		},
//		Query: "世界上最大的鲸鱼是什么?",
//		TopN:  nil,
//	})
//	assert.NoError(t, err)
//
//	for _, item := range resp.Sorted {
//		fmt.Println(item.Slice.PlainText, item.Score)
//	}
//	// 吉尼斯世界纪录网站数据显示，蓝鲸是目前已知世界上最大的动物，体长可达30米，相当于一架波音737飞机的长度 0.6209664529733573
//	// 一头成年雌性弓头鲸可以长到22米长，而一头雄性鲸鱼可以长到18米长 0.4269785303456468
//
//	fmt.Println(resp.TokenUsage)
//	// 95
//
//}
