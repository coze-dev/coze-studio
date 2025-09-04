# Coze Studio 简单负载测试报告

## 测试概述
- 测试时间: Wed Aug 13 17:31:14 CST 2025
- 服务地址: http://localhost:8888
- 测试工具: wrk

## 最大并发量测试结果

| 端点 | 最大并发数 | 最大QPS |
|------|------------|---------|
| endpoint | concurrent | qps |
| /health | 100 | 15135.75 |
| /api/user/profile | 100 | 5456.38 |
| /api/conversation/create | 150 | 5316.43 |
| /api/conversation/send_message | 150 | 5344.58 |

## 压力测试结果

```
Running 1m test @ http://localhost:8888
  12 threads and 2000 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    94.73ms   44.38ms   1.94s    63.24%
    Req/Sec   556.61    359.62     2.52k    67.14%
  Latency Distribution
     50%  114.85ms
     75%  123.84ms
     90%  133.44ms
     99%  149.98ms
  356894 requests in 1.00m, 220.93MB read
  Socket errors: connect 0, read 1538, write 0, timeout 1524
Requests/sec:   5939.67
Transfer/sec:      3.68MB
```

## 测试结论

1. **最大并发量**: 系统能够稳定处理的最大并发用户数
2. **最大吞吐量**: 系统每秒能够处理的最大请求数
3. **系统瓶颈**: 根据测试结果识别系统性能瓶颈

## 建议

- 如果并发量不足，考虑增加服务器资源或优化代码
- 如果吞吐量不足，考虑使用负载均衡或缓存优化
- 监控系统资源使用情况，避免过载

