#!/bin/bash

# Coze Studio 工作流性能测试脚本
# 基于简单工作流测试脚本进行性能测试

# 配置变量
BASE_URL="http://172.31.114.205:8888"
AUTH_TOKEN="pat_cdd26ecc3ad2d1cd7c4aae46590e73a285da7869f4bbef38fb2b401b18363368"
BOT_ID="7538251426875572224"
USER_ID="test_user_123"

# 性能测试配置
CONCURRENT_REQUESTS=10
TOTAL_REQUESTS=100
TEST_DURATION=60  # 秒

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

log_success() {
    echo -e "${PURPLE}[SUCCESS]${NC} $1"
}

# 性能统计变量
declare -a response_times
declare -a http_codes
success_count=0
error_count=0
total_count=0

# 发送单个请求并记录性能
send_request() {
    local request_id=$1
    local message="性能测试消息 #${request_id}"
    
    local request_body="{
        \"bot_id\": \"${BOT_ID}\",
        \"user_id\": \"${USER_ID}_${request_id}\",
        \"stream\": false,
        \"auto_save_history\": true,
        \"additional_messages\": [
            {
                \"role\": \"user\",
                \"content\": \"${message}\",
                \"content_type\": \"text\"
            }
        ]
    }"
    
    # 记录开始时间
    local start_time=$(date +%s.%N)
    
    # 发送请求
    local response=$(curl -s -w "\nHTTP_CODE:%{http_code}\nTIME:%{time_total}\n" \
        -X POST \
        -H "Authorization: Bearer ${AUTH_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "$request_body" \
        "${BASE_URL}/v3/chat")
    
    # 记录结束时间
    local end_time=$(date +%s.%N)
    
    # 解析响应
    local http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    local curl_time=$(echo "$response" | grep "TIME:" | cut -d: -f2)
    local body=$(echo "$response" | sed '/HTTP_CODE:/d' | sed '/TIME:/d')
    
    # 计算实际响应时间
    local actual_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "$curl_time")
    
    # 将结果写入临时文件，避免子进程变量问题
    echo "$request_id|$actual_time|$http_code" >> /tmp/workflow_test_results_$$
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓${NC} 请求 #${request_id} 成功 (${actual_time}s)"
    else
        echo -e "${RED}✗${NC} 请求 #${request_id} 失败 (HTTP ${http_code}, ${actual_time}s)"
    fi
}

# 并发测试
run_concurrent_test() {
    log_step "开始并发性能测试..."
    echo "并发数: $CONCURRENT_REQUESTS"
    echo "总请求数: $TOTAL_REQUESTS"
    echo "测试时长: ${TEST_DURATION}秒"
    echo ""
    
    local test_start_time=$(date +%s)
    local current_request=1
    
    # 创建临时文件存储后台进程PID和结果
    local pids_file="/tmp/workflow_test_pids_$$"
    local results_file="/tmp/workflow_test_results_$$"
    rm -f "$pids_file" "$results_file"
    
    while [ $current_request -le $TOTAL_REQUESTS ]; do
        # 检查当前运行的进程数
        local running_pids=$(cat "$pids_file" 2>/dev/null | wc -l)
        
        if [ $running_pids -lt $CONCURRENT_REQUESTS ]; then
            # 启动新请求
            send_request $current_request &
            local pid=$!
            echo $pid >> "$pids_file"
            ((current_request++))
        else
            # 等待一个进程完成
            sleep 0.1
        fi
        
        # 检查是否超时
        local elapsed=$(($(date +%s) - test_start_time))
        if [ $elapsed -ge $TEST_DURATION ]; then
            log_warn "测试时间达到 ${TEST_DURATION} 秒，停止发送新请求"
            break
        fi
    done
    
    # 等待所有后台进程完成
    log_step "等待所有请求完成..."
    wait
    
    # 从临时文件读取结果
    if [ -f "$results_file" ]; then
        while IFS='|' read -r req_id time code; do
            if [ ! -z "$req_id" ] && [ ! -z "$time" ] && [ ! -z "$code" ]; then
                response_times[$req_id]=$time
                http_codes[$req_id]=$code
                ((total_count++))
                
                if [ "$code" = "200" ]; then
                    ((success_count++))
                else
                    ((error_count++))
                fi
            fi
        done < "$results_file"
    fi
    
    # 清理临时文件
    rm -f "$pids_file" "$results_file"
    
    echo ""
    log_info "并发测试完成，共发送 $total_count 个请求"
}

# 计算性能统计
calculate_statistics() {
    log_step "计算性能统计..."
    
    if [ ${#response_times[@]} -eq 0 ]; then
        log_error "没有响应时间数据"
        return 1
    fi
    
    # 计算平均响应时间
    local total_time=0
    local min_time=999999
    local max_time=0
    local valid_count=0
    
    for time in "${response_times[@]}"; do
        if [ ! -z "$time" ] && [ "$time" != "0" ]; then
            total_time=$(echo "$total_time + $time" | bc -l 2>/dev/null || echo "$total_time")
            ((valid_count++))
            
            # 更新最小时间
            if (( $(echo "$time < $min_time" | bc -l 2>/dev/null || echo "0") )); then
                min_time=$time
            fi
            
            # 更新最大时间
            if (( $(echo "$time > $max_time" | bc -l 2>/dev/null || echo "0") )); then
                max_time=$time
            fi
        fi
    done
    
    local avg_time=0
    if [ $valid_count -gt 0 ]; then
        avg_time=$(echo "scale=3; $total_time / $valid_count" | bc -l 2>/dev/null || echo "0")
    fi
    
    # 计算成功率
    local success_rate=0
    if [ $total_count -gt 0 ]; then
        success_rate=$(echo "scale=2; $success_count * 100 / $total_count" | bc -l 2>/dev/null || echo "0")
    fi
    
    # 计算吞吐量 (请求/秒)
    local test_duration_actual=$(($(date +%s) - start_time))
    local throughput=0
    if [ $test_duration_actual -gt 0 ]; then
        throughput=$(echo "scale=2; $total_count / $test_duration_actual" | bc -l 2>/dev/null || echo "0")
    fi
    
    # 输出统计结果
    echo ""
    echo "=================================="
    echo "性能测试结果"
    echo "=================================="
    echo "总请求数: $total_count"
    echo "成功请求: $success_count"
    echo "失败请求: $error_count"
    echo "成功率: ${success_rate}%"
    echo ""
    echo "响应时间统计:"
    echo "  平均响应时间: ${avg_time}秒"
    echo "  最小响应时间: ${min_time}秒"
    echo "  最大响应时间: ${max_time}秒"
    echo ""
    echo "吞吐量: ${throughput} 请求/秒"
    echo "测试时长: ${test_duration_actual}秒"
    echo ""
    
    # HTTP状态码统计
    echo "HTTP状态码统计:"
    declare -A status_counts
    for code in "${http_codes[@]}"; do
        if [ ! -z "$code" ]; then
            ((status_counts[$code]++))
        fi
    done
    
    for code in "${!status_counts[@]}"; do
        echo "  HTTP $code: ${status_counts[$code]} 次"
    done
}

# 保存测试报告
save_report() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local report_file="workflow_performance_report_${timestamp}.txt"
    
    log_step "保存测试报告到: $report_file"
    
    # 重新计算统计值用于报告
    local total_time=0
    local valid_count=0
    for time in "${response_times[@]}"; do
        if [ ! -z "$time" ] && [ "$time" != "0" ]; then
            total_time=$(echo "$total_time + $time" | bc -l 2>/dev/null || echo "$total_time")
            ((valid_count++))
        fi
    done
    
    local avg_time=0
    if [ $valid_count -gt 0 ]; then
        avg_time=$(echo "scale=3; $total_time / $valid_count" | bc -l 2>/dev/null || echo "0")
    fi
    
    local success_rate=0
    if [ $total_count -gt 0 ]; then
        success_rate=$(echo "scale=2; $success_count * 100 / $total_count" | bc -l 2>/dev/null || echo "0")
    fi
    
    local test_duration_actual=$(($(date +%s) - start_time))
    local throughput=0
    if [ $test_duration_actual -gt 0 ]; then
        throughput=$(echo "scale=2; $total_count / $test_duration_actual" | bc -l 2>/dev/null || echo "0")
    fi
    
    {
        echo "Coze Studio 工作流性能测试报告"
        echo "生成时间: $(date)"
        echo "=================================="
        echo ""
        echo "测试配置:"
        echo "  基础URL: $BASE_URL"
        echo "  Bot ID: $BOT_ID"
        echo "  并发数: $CONCURRENT_REQUESTS"
        echo "  总请求数: $TOTAL_REQUESTS"
        echo "  测试时长: ${TEST_DURATION}秒"
        echo ""
        echo "测试结果:"
        echo "  总请求数: $total_count"
        echo "  成功请求: $success_count"
        echo "  失败请求: $error_count"
        echo "  成功率: ${success_rate}%"
        echo "  平均响应时间: ${avg_time}秒"
        echo "  吞吐量: ${throughput} 请求/秒"
        echo "  实际测试时长: ${test_duration_actual}秒"
        echo ""
        echo "响应时间详情:"
        for i in "${!response_times[@]}"; do
            if [ ! -z "${response_times[$i]}" ]; then
                echo "  请求 #$i: ${response_times[$i]}s (HTTP ${http_codes[$i]})"
            fi
        done
    } > "$report_file"
    
    log_success "测试报告已保存: $report_file"
}

# 主测试函数
run_performance_test() {
    echo "=================================="
    echo "Coze Studio 工作流性能测试"
    echo "=================================="
    echo "基础URL: $BASE_URL"
    echo "Bot ID: $BOT_ID"
    echo "并发数: $CONCURRENT_REQUESTS"
    echo "总请求数: $TOTAL_REQUESTS"
    echo "=================================="
    echo ""
    
    # 检查依赖
    if ! command -v bc &> /dev/null; then
        log_warn "bc 命令不可用，将使用简化计算"
    fi
    
    # 记录开始时间
    start_time=$(date +%s)
    
    # 运行并发测试
    run_concurrent_test
    
    # 计算统计结果
    calculate_statistics
    
    # 保存报告
    save_report
    
    echo ""
    log_success "性能测试完成！"
}

# 清理函数
cleanup() {
    rm -f /tmp/workflow_test_pids_*
    rm -f /tmp/workflow_test_results_*
}

# 设置退出时清理
trap cleanup EXIT

# 执行性能测试
run_performance_test 