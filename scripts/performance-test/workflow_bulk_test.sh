#!/bin/bash

# 工作流批量性能测试脚本
# 用于测试工作流API的吞吐率、延迟、并发性能等指标

# 配置参数
BASE_URL="http://172.31.114.205:8888"
SPACE_ID="7537995730808471552"
BOT_ID="7537995730808471552"
WORKFLOW_ID="7538251939654402048"

# 认证信息
SESSION_KEY="eyJpZCI6NzUzODI2MTQzMDM0MDk0Mzg3MiwiY3JlYXRlZF9hdCI6IjIwMjUtMDgtMTRUMDI6MjQ6MjAuODc5MjE4MTM5WiIsImV4cGlyZXNfYXQiOiIyMDI1LTA5LTEzVDAyOjI0OjIwLjg3OTIxODMxWiJ9pIgoX-SLpYgcEUnbYsmRJCTIRkAnqlcwQaeMmIHlK7A"
PAT_TOKEN="pat_584de059f23e525c134cf374e7870f2d151364877ebf0f8c6862272d2bd39f5e"
COOKIE_HEADER="i18next=zh-CN; session_key=$SESSION_KEY"
AUTH_HEADER="Bearer $PAT_TOKEN"

# 测试配置
CONCURRENT_USERS=10          # 并发用户数
TOTAL_REQUESTS=100          # 总请求数
REQUEST_INTERVAL=0.1        # 请求间隔（秒）
TEST_DURATION=300           # 测试持续时间（秒）
WARMUP_REQUESTS=10          # 预热请求数

# 日志文件
LOG_FILE="workflow_bulk_test.log"
REPORT_FILE="workflow_bulk_test_report.txt"
METRICS_FILE="workflow_metrics.json"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 性能指标
declare -a RESPONSE_TIMES
declare -a SUCCESS_COUNT=0
declare -a FAILURE_COUNT=0
declare -a START_TIME
declare -a END_TIME

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_performance() {
    echo -e "${PURPLE}[PERFORMANCE]${NC} $1" | tee -a "$LOG_FILE"
}

# 生成随机用户ID
generate_user_id() {
    echo "test_user_$(date +%s)_$RANDOM"
}

# 生成随机输入内容
generate_random_input() {
    local inputs=(
        "你好，请介绍一下你自己"
        "今天天气怎么样？"
        "请帮我写一个简单的Python函数"
        "解释一下什么是机器学习"
        "推荐几本好书"
        "如何提高工作效率？"
        "请分析一下当前的市场趋势"
        "帮我制定一个学习计划"
        "什么是区块链技术？"
        "请推荐一些健康的生活方式"
    )
    echo "${inputs[$((RANDOM % ${#inputs[@]}))]}"
}

# 执行单个工作流请求
execute_workflow_request() {
    local request_id="$1"
    local user_id="$2"
    local input_text="$3"
    
    local url="$BASE_URL/v1/workflow/run"
    local data='{
        "workflow_id": "'$WORKFLOW_ID'",
        "bot_id": "'$BOT_ID'",
        "parameters": "{\"input\": \"'$input_text'\", \"user_id\": \"'$user_id'\"}",
        "ext": {},
        "is_async": false
    }'
    
    local start_time=$(date +%s.%N)
    
    # 执行API调用
    local response=$(curl -s -w "\n%{http_code}\n%{time_total}\n%{time_connect}\n%{time_starttransfer}" "$url" \
        -H "Content-Type: application/json" \
        -H "User-Agent: WorkflowBulkTester/1.0" \
        -H "Cookie: $COOKIE_HEADER" \
        -H "Authorization: $AUTH_HEADER" \
        -d "$data" \
        --connect-timeout 10 \
        --max-time 60)
    
    local end_time=$(date +%s.%N)
    
    # 解析响应
    local http_code=$(echo "$response" | tail -n4 | head -n1)
    local time_total=$(echo "$response" | tail -n3 | head -n1)
    local time_connect=$(echo "$response" | tail -n2 | head -n1)
    local time_starttransfer=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -4)
    
    # 计算响应时间
    local response_time=$(echo "$end_time - $start_time" | bc -l)
    
    # 记录结果
    if [ "$http_code" = "200" ]; then
        ((SUCCESS_COUNT++))
        log_success "请求 $request_id 成功 - 响应时间: ${response_time}s"
    else
        ((FAILURE_COUNT++))
        log_error "请求 $request_id 失败 - HTTP: $http_code, 响应时间: ${response_time}s"
    fi
    
    # 保存性能指标
    RESPONSE_TIMES+=("$response_time")
    
    # 返回结果
    echo "$http_code|$response_time|$time_total|$time_connect|$time_starttransfer"
}

# 预热测试
warmup_test() {
    log_info "开始预热测试..."
    
    for i in $(seq 1 $WARMUP_REQUESTS); do
        local user_id=$(generate_user_id)
        local input_text=$(generate_random_input)
        
        log_info "预热请求 $i/$WARMUP_REQUESTS"
        execute_workflow_request "$i" "$user_id" "$input_text" > /dev/null
        
        # 预热间隔
        sleep 0.5
    done
    
    log_success "预热测试完成"
}

# 并发测试
concurrent_test() {
    log_info "开始并发测试 - 并发用户数: $CONCURRENT_USERS, 总请求数: $TOTAL_REQUESTS"
    
    local start_time=$(date +%s)
    local pids=()
    local request_count=0
    
    # 创建并发进程
    for ((i=1; i<=$TOTAL_REQUESTS; i++)); do
        local user_id=$(generate_user_id)
        local input_text=$(generate_random_input)
        
        # 执行请求（后台运行）
        execute_workflow_request "$i" "$user_id" "$input_text" &
        pids+=($!)
        
        ((request_count++))
        
        # 控制并发数
        if [ ${#pids[@]} -ge $CONCURRENT_USERS ]; then
            # 等待一个进程完成
            wait ${pids[0]}
            pids=("${pids[@]:1}")
        fi
        
        # 请求间隔
        sleep $REQUEST_INTERVAL
    done
    
    # 等待所有进程完成
    for pid in "${pids[@]}"; do
        wait $pid
    done
    
    local end_time=$(date +%s)
    local test_duration=$((end_time - start_time))
    
    log_performance "并发测试完成 - 总耗时: ${test_duration}s"
}

# 持续负载测试
sustained_load_test() {
    log_info "开始持续负载测试 - 持续时间: ${TEST_DURATION}s"
    
    local start_time=$(date +%s)
    local end_time=$((start_time + TEST_DURATION))
    local request_count=0
    
    while [ $(date +%s) -lt $end_time ]; do
        local user_id=$(generate_user_id)
        local input_text=$(generate_random_input)
        
        ((request_count++))
        execute_workflow_request "$request_count" "$user_id" "$input_text" > /dev/null
        
        sleep $REQUEST_INTERVAL
    done
    
    log_performance "持续负载测试完成 - 总请求数: $request_count"
}

# 计算性能指标
calculate_metrics() {
    log_info "计算性能指标..."
    
    # 计算响应时间统计
    local total_time=0
    local min_time=999999
    local max_time=0
    
    for time in "${RESPONSE_TIMES[@]}"; do
        total_time=$(echo "$total_time + $time" | bc -l)
        
        if (( $(echo "$time < $min_time" | bc -l) )); then
            min_time=$time
        fi
        
        if (( $(echo "$time > $max_time" | bc -l) )); then
            max_time=$time
        fi
    done
    
    local avg_time=0
    local count=${#RESPONSE_TIMES[@]}
    
    if [ $count -gt 0 ]; then
        avg_time=$(echo "scale=3; $total_time / $count" | bc -l)
    fi
    
    # 计算吞吐率
    local total_requests=$((SUCCESS_COUNT + FAILURE_COUNT))
    local throughput=0
    
    if [ $total_requests -gt 0 ]; then
        throughput=$(echo "scale=2; $total_requests / 60" | bc -l)  # 每分钟请求数
    fi
    
    # 计算成功率
    local success_rate=0
    if [ $total_requests -gt 0 ]; then
        success_rate=$(echo "scale=2; $SUCCESS_COUNT * 100 / $total_requests" | bc -l)
    fi
    
    # 计算百分位数
    local sorted_times=($(printf '%s\n' "${RESPONSE_TIMES[@]}" | sort -n))
    local p50_idx=$((count * 50 / 100))
    local p90_idx=$((count * 90 / 100))
    local p95_idx=$((count * 95 / 100))
    local p99_idx=$((count * 99 / 100))
    
    local p50=${sorted_times[$p50_idx]}
    local p90=${sorted_times[$p90_idx]}
    local p95=${sorted_times[$p95_idx]}
    local p99=${sorted_times[$p99_idx]}
    
    # 保存指标到JSON文件
    cat > "$METRICS_FILE" << EOF
{
    "test_config": {
        "base_url": "$BASE_URL",
        "workflow_id": "$WORKFLOW_ID",
        "concurrent_users": $CONCURRENT_USERS,
        "total_requests": $TOTAL_REQUESTS,
        "test_duration": $TEST_DURATION
    },
    "performance_metrics": {
        "total_requests": $total_requests,
        "successful_requests": $SUCCESS_COUNT,
        "failed_requests": $FAILURE_COUNT,
        "success_rate": $success_rate,
        "throughput_rpm": $throughput,
        "response_time": {
            "min": $min_time,
            "max": $max_time,
            "average": $avg_time,
            "p50": $p50,
            "p90": $p90,
            "p95": $p95,
            "p99": $p99
        }
    },
    "test_timestamp": "$(date -Iseconds)"
}
EOF
    
    # 输出指标
    log_performance "性能指标计算完成:"
    log_performance "总请求数: $total_requests"
    log_performance "成功请求: $SUCCESS_COUNT"
    log_performance "失败请求: $FAILURE_COUNT"
    log_performance "成功率: ${success_rate}%"
    log_performance "吞吐率: ${throughput} RPM"
    log_performance "响应时间统计:"
    log_performance "  最小: ${min_time}s"
    log_performance "  最大: ${max_time}s"
    log_performance "  平均: ${avg_time}s"
    log_performance "  P50: ${p50}s"
    log_performance "  P90: ${p90}s"
    log_performance "  P95: ${p95}s"
    log_performance "  P99: ${p99}s"
}

# 生成测试报告
generate_report() {
    local report="
============================================================
工作流批量性能测试报告
============================================================
测试时间: $(date '+%Y-%m-%d %H:%M:%S')
基础URL: $BASE_URL
Space ID: $SPACE_ID
Bot ID: $BOT_ID
Workflow ID: $WORKFLOW_ID

测试配置:
并发用户数: $CONCURRENT_USERS
总请求数: $TOTAL_REQUESTS
请求间隔: ${REQUEST_INTERVAL}s
测试持续时间: ${TEST_DURATION}s
预热请求数: $WARMUP_REQUESTS

测试结果:
总请求数: $((SUCCESS_COUNT + FAILURE_COUNT))
成功请求: $SUCCESS_COUNT
失败请求: $FAILURE_COUNT
成功率: $(echo "scale=2; $SUCCESS_COUNT * 100 / ($SUCCESS_COUNT + $FAILURE_COUNT)" | bc -l)%

详细性能指标请查看: $METRICS_FILE
详细日志请查看: $LOG_FILE
============================================================
"
    
    echo "$report" > "$REPORT_FILE"
    log_info "测试报告已保存到: $REPORT_FILE"
}

# 检查依赖
check_dependencies() {
    if ! command -v curl &> /dev/null; then
        echo "错误: 需要安装 curl"
        exit 1
    fi
    
    if ! command -v bc &> /dev/null; then
        echo "错误: 需要安装 bc"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_warning "未找到 jq，将使用简单JSON格式"
    fi
}

# 显示帮助信息
show_help() {
    echo "工作流批量性能测试脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help             显示此帮助信息"
    echo "  -c, --concurrent N     设置并发用户数 (默认: $CONCURRENT_USERS)"
    echo "  -n, --requests N       设置总请求数 (默认: $TOTAL_REQUESTS)"
    echo "  -i, --interval N       设置请求间隔秒数 (默认: $REQUEST_INTERVAL)"
    echo "  -d, --duration N       设置测试持续时间秒数 (默认: $TEST_DURATION)"
    echo "  -w, --warmup N         设置预热请求数 (默认: $WARMUP_REQUESTS)"
    echo "  -t, --test-type TYPE   测试类型: concurrent|sustained|both (默认: concurrent)"
    echo "  --no-warmup           跳过预热测试"
    echo ""
    echo "示例:"
    echo "  $0                     运行默认并发测试"
    echo "  $0 -c 20 -n 200       20并发，200请求"
    echo "  $0 -t sustained -d 600 持续负载测试10分钟"
    echo "  $0 -t both -c 10 -n 100 运行预热+并发+持续测试"
}

# 解析命令行参数
TEST_TYPE="concurrent"
SKIP_WARMUP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--concurrent)
            CONCURRENT_USERS="$2"
            shift 2
            ;;
        -n|--requests)
            TOTAL_REQUESTS="$2"
            shift 2
            ;;
        -i|--interval)
            REQUEST_INTERVAL="$2"
            shift 2
            ;;
        -d|--duration)
            TEST_DURATION="$2"
            shift 2
            ;;
        -w|--warmup)
            WARMUP_REQUESTS="$2"
            shift 2
            ;;
        -t|--test-type)
            TEST_TYPE="$2"
            shift 2
            ;;
        --no-warmup)
            SKIP_WARMUP=true
            shift
            ;;
        *)
            echo "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 主函数
main() {
    # 清空日志文件
    > "$LOG_FILE"
    
    log_info "============================================================"
    log_info "工作流批量性能测试开始"
    log_info "============================================================"
    log_info "基础URL: $BASE_URL"
    log_info "Space ID: $SPACE_ID"
    log_info "Bot ID: $BOT_ID"
    log_info "Workflow ID: $WORKFLOW_ID"
    log_info "测试类型: $TEST_TYPE"
    log_info "并发用户数: $CONCURRENT_USERS"
    log_info "总请求数: $TOTAL_REQUESTS"
    log_info "请求间隔: ${REQUEST_INTERVAL}s"
    log_info "测试持续时间: ${TEST_DURATION}s"
    log_info ""
    
    # 1. 预热测试
    if [ "$SKIP_WARMUP" = false ]; then
        log_info "1. 预热测试"
        log_info "----------------------------------------"
        warmup_test
        log_info ""
    fi
    
    # 2. 根据测试类型执行测试
    case $TEST_TYPE in
        "concurrent")
            log_info "2. 并发性能测试"
            log_info "----------------------------------------"
            concurrent_test
            ;;
        "sustained")
            log_info "2. 持续负载测试"
            log_info "----------------------------------------"
            sustained_load_test
            ;;
        "both")
            log_info "2. 并发性能测试"
            log_info "----------------------------------------"
            concurrent_test
            log_info ""
            log_info "3. 持续负载测试"
            log_info "----------------------------------------"
            sustained_load_test
            ;;
        *)
            log_error "未知的测试类型: $TEST_TYPE"
            exit 1
            ;;
    esac
    log_info ""
    
    # 3. 计算性能指标
    log_info "3. 计算性能指标"
    log_info "----------------------------------------"
    calculate_metrics
    log_info ""
    
    # 4. 生成测试报告
    log_info "4. 生成测试报告"
    log_info "----------------------------------------"
    generate_report
    log_info ""
    
    log_info "============================================================"
    log_info "工作流批量性能测试完成"
    log_info "测试报告已保存到: $REPORT_FILE"
    log_info "性能指标已保存到: $METRICS_FILE"
    log_info "详细日志已保存到: $LOG_FILE"
    log_info "============================================================"
}

# 检查依赖并运行主函数
check_dependencies
main 