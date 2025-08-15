#!/bin/bash

# 工作流压力测试脚本
# 用于进行阶梯式压力测试，监控系统性能指标

# 配置参数
BASE_URL="http://172.31.114.205:8888"
SPACE_ID="7537995730808471552"
BOT_ID="7537995730808471552"
WORKFLOW_ID="7538347491373088768"

# 认证信息
SESSION_KEY="eyJpZCI6NzUzODI2MTQzMDM0MDk0Mzg3MiwiY3JlYXRlZF9hdCI6IjIwMjUtMDgtMTRUMDI6MjQ6MjAuODc5MjE4MTM5WiIsImV4cGlyZXNfYXQiOiIyMDI1LTA5LTEzVDAyOjI0OjIwLjg3OTIxODMxWiJ9pIgoX-SLpYgcEUnbYsmRJCTIRkAnqlcwQaeMmIHlK7A"
PAT_TOKEN="pat_584de059f23e525c134cf374e7870f2d151364877ebf0f8c6862272d2bd39f5e"
COOKIE_HEADER="i18next=zh-CN; session_key=$SESSION_KEY"
AUTH_HEADER="Bearer $PAT_TOKEN"

# 压力测试配置
STEP_DURATION=60          # 每个压力阶梯持续时间（秒）- 增加到2分钟
STEP_INTERVAL=15           # 阶梯间休息时间（秒）- 减少到15秒
MAX_CONCURRENT=1000        # 最大并发用户数 - 增加到1000
CONCURRENT_STEP=50         # 每次递增的并发数 - 增加到50
MIN_CONCURRENT=20          # 最小并发数 - 增加到20
REQUEST_INTERVAL=0.005     # 请求间隔（秒）- 减少到0.005秒，进一步提高请求频率

# 激进模式配置（可通过命令行参数启用）
AGGRESSIVE_MODE=false      # 激进模式开关
AGGRESSIVE_MAX_CONCURRENT=2000  # 激进模式最大并发数
AGGRESSIVE_CONCURRENT_STEP=100  # 激进模式并发递增步长
AGGRESSIVE_REQUEST_INTERVAL=0.001  # 激进模式请求间隔

# 监控配置
MONITOR_INTERVAL=3         # 监控间隔（秒）- 减少到3秒，更频繁监控
CPU_THRESHOLD=90           # CPU使用率阈值（%）- 提高到90%
MEMORY_THRESHOLD=90        # 内存使用率阈值（%）- 提高到90%
ERROR_RATE_THRESHOLD=10    # 错误率阈值（%）- 提高到10%，更宽松的停止条件

# 日志文件
LOG_FILE="workflow_stress_test.log"
REPORT_FILE="workflow_stress_test_report.txt"
METRICS_FILE="workflow_stress_metrics.json"
MONITOR_FILE="system_monitor.log"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 全局变量
declare -A STEP_METRICS
declare -a ALL_RESPONSE_TIMES
CURRENT_STEP=0
TOTAL_SUCCESS=0
TOTAL_FAILURE=0

# 确保全局变量是数字
TOTAL_SUCCESS=${TOTAL_SUCCESS:-0}
TOTAL_FAILURE=${TOTAL_FAILURE:-0}
CURRENT_STEP=${CURRENT_STEP:-0}

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

log_stress() {
    echo -e "${CYAN}[STRESS]${NC} $1" | tee -a "$LOG_FILE"
}

# 测试API连接
test_api_connection() {
    log_info "测试API连接..."
    
    local test_url="$BASE_URL/v1/workflows/$WORKFLOW_ID"
    local response=$(curl -s -w "\n%{http_code}" "$test_url" \
        -H "Content-Type: application/json" \
        -H "User-Agent: WorkflowStressTester/1.0" \
        -H "Cookie: $COOKIE_HEADER" \
        -H "Authorization: $AUTH_HEADER" \
        --connect-timeout 5 \
        --max-time 15)
    
    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)
    
    log_info "API连接测试结果:"
    log_info "  URL: $test_url"
    log_info "  HTTP状态码: $http_code"
    log_info "  响应体长度: ${#response_body} 字符"
    
    if [ "$http_code" = "200" ]; then
        log_success "API连接测试成功"
        if [ -n "$response_body" ]; then
            log_info "  响应内容预览: $(echo "$response_body" | head -c 200)"
        fi
        return 0
    else
        log_error "API连接测试失败 - HTTP: $http_code"
        if [ -n "$response_body" ]; then
            log_error "  错误响应: $response_body"
        fi
        return 1
    fi
}

# 生成随机用户ID
generate_user_id() {
    echo "stress_user_$(date +%s)_$RANDOM"
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
        "解释一下什么是微服务架构"
        "如何优化数据库查询性能？"
        "请介绍一些常用的设计模式"
        "什么是容器化技术？"
        "如何保证系统的可用性？"
        "请帮我分析这个复杂的JSON数据结构：{\"user\":{\"id\":12345,\"name\":\"张三\",\"preferences\":{\"theme\":\"dark\",\"language\":\"zh-CN\"}},\"data\":[1,2,3,4,5]}"
        "我需要一个能够处理大规模并发请求的微服务架构设计，包括负载均衡、服务发现、熔断器、限流等组件的详细实现方案"
        "请帮我写一个完整的RESTful API，包括用户认证、权限控制、数据验证、错误处理、日志记录等功能"
        "分析一下当前AI技术的发展趋势，包括大语言模型、多模态AI、AI Agent等技术的应用场景和未来发展方向"
        "请设计一个高可用的分布式系统架构，需要考虑容错、扩展性、一致性、性能优化等方面"
        "帮我写一个完整的机器学习项目，包括数据预处理、特征工程、模型训练、评估、部署等全流程"
        "请分析一下区块链技术在供应链管理、数字身份、去中心化金融等领域的应用前景和技术挑战"
        "设计一个实时数据处理系统，需要处理每秒数万条数据流，包括数据采集、清洗、分析、存储等环节"
        "请帮我优化这个SQL查询的性能：SELECT u.name, o.order_id, p.product_name FROM users u JOIN orders o ON u.id = o.user_id JOIN products p ON o.product_id = p.id WHERE u.created_at > '2024-01-01' AND o.status = 'completed' ORDER BY o.created_at DESC LIMIT 1000"
        "分析一下当前云原生技术的发展趋势，包括容器编排、服务网格、无服务器计算、GitOps等技术的应用"
        "请设计一个支持多租户的SaaS平台架构，需要考虑数据隔离、资源管理、计费系统、监控告警等方面"
    )
    echo "${inputs[$((RANDOM % ${#inputs[@]}))]}"
}

# 执行单个工作流请求
execute_workflow_request() {
    local request_id="$1"
    local user_id="$2"
    local input_text="$3"
    local step_id="$4"
    
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
        -H "User-Agent: WorkflowStressTester/1.0" \
        -H "Cookie: $COOKIE_HEADER" \
        -H "Authorization: $AUTH_HEADER" \
        -d "$data" \
        --connect-timeout 5 \
        --max-time 30)
    
    local end_time=$(date +%s.%N)
    
    # 解析响应
    local http_code=$(echo "$response" | tail -n4 | head -n1)
    local time_total=$(echo "$response" | tail -n3 | head -n1)
    local time_connect=$(echo "$response" | tail -n2 | head -n1)
    local time_starttransfer=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -4)
    
    # 计算响应时间
    local response_time=$(echo "$end_time - $start_time" | bc -l)
    
    # 验证响应内容
    local is_valid_response=false
    local response_info=""
    
    if [ "$http_code" = "200" ]; then
        # 检查响应内容是否包含有效的工作流执行结果
        if [ -n "$response_body" ]; then
            # 检查是否包含错误信息
            if echo "$response_body" | grep -q "error\|Error\|ERROR"; then
                response_info="HTTP 200 but contains error"
                log_warning "请求 $request_id - HTTP 200 但包含错误信息"
            # 检查是否包含工作流执行结果
            elif echo "$response_body" | grep -q "result\|data\|output\|content"; then
                is_valid_response=true
                response_info="Valid workflow response"
                log_success "请求 $request_id 成功 - 响应时间: ${response_time}s - 包含有效内容"
            # 检查响应体长度
            elif [ ${#response_body} -gt 50 ]; then
                is_valid_response=true
                response_info="Response body length: ${#response_body}"
                log_success "请求 $request_id 成功 - 响应时间: ${response_time}s - 响应体长度: ${#response_body}"
            else
                response_info="HTTP 200 but empty/short response"
                log_warning "请求 $request_id - HTTP 200 但响应内容过短: ${#response_body} 字符"
            fi
        else
            response_info="HTTP 200 but no response body"
            log_warning "请求 $request_id - HTTP 200 但无响应体"
        fi
    else
        response_info="HTTP $http_code"
        log_error "请求 $request_id 失败 - HTTP: $http_code, 响应时间: ${response_time}s"
    fi
    
    # 性能检查 - 记录慢响应
    if [ $(echo "$response_time > 5.0" | bc -l) -eq 1 ]; then
        log_warning "请求 $request_id 响应时间过长: ${response_time}s"
    fi
    
    if [ $(echo "$response_time > 10.0" | bc -l) -eq 1 ]; then
        log_error "请求 $request_id 响应时间严重超时: ${response_time}s"
    fi
    
    # 记录详细的响应信息到日志
    log_info "请求 $request_id 详细信息:"
    log_info "  HTTP状态码: $http_code"
    log_info "  curl总时间: ${time_total}s"
    log_info "  连接时间: ${time_connect}s"
    log_info "  开始传输时间: ${time_starttransfer}s"
    log_info "  实际响应时间: ${response_time}s"
    log_info "  响应体长度: ${#response_body} 字符"
    log_info "  响应信息: $response_info"
    
    # 如果响应体不为空，记录前200个字符
    if [ -n "$response_body" ] && [ ${#response_body} -gt 0 ]; then
        local response_preview=$(echo "$response_body" | head -c 200)
        log_info "  响应内容预览: $response_preview"
    fi
    
    # 记录结果到文件，避免并发问题
    local result_file="step_${step_id}_results.txt"
    if [ "$is_valid_response" = true ]; then
        echo "SUCCESS|$response_time|$response_info" >> "$result_file"
    else
        echo "FAILURE|$response_time|$response_info" >> "$result_file"
    fi
    
    # 返回结果
    echo "$http_code|$response_time|$time_total|$time_connect|$time_starttransfer|$response_info"
}

# 系统监控
monitor_system() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # CPU使用率
    local cpu_usage=0
    if command -v top &> /dev/null; then
        cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 2>/dev/null || echo "0")
    fi
    
    # 内存使用率
    local memory_usage=0
    if command -v free &> /dev/null; then
        local memory_info=$(free | grep Mem 2>/dev/null || echo "Mem: 0 0 0 0 0 0")
        local memory_total=$(echo $memory_info | awk '{print $2}')
        local memory_used=$(echo $memory_info | awk '{print $3}')
        if [ "$memory_total" -gt 0 ] 2>/dev/null; then
            memory_usage=$(echo "scale=2; $memory_used * 100 / $memory_total" | bc -l 2>/dev/null || echo "0")
        fi
    fi
    
    # 网络连接数
    local connections=0
    if command -v netstat &> /dev/null; then
        connections=$(netstat -an | grep ESTABLISHED | wc -l 2>/dev/null || echo "0")
    fi
    
    # 磁盘使用率
    local disk_usage=0
    if command -v df &> /dev/null; then
        disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1 2>/dev/null || echo "0")
    fi
    
    # 记录监控数据
    echo "$timestamp|$cpu_usage|$memory_usage|$connections|$disk_usage" >> "$MONITOR_FILE"
    
    # 检查阈值
    if [ $(echo "$cpu_usage > $CPU_THRESHOLD" | bc -l 2>/dev/null || echo "0") -eq 1 ]; then
        log_warning "CPU使用率过高: ${cpu_usage}%"
    fi
    
    if [ $(echo "$memory_usage > $MEMORY_THRESHOLD" | bc -l 2>/dev/null || echo "0") -eq 1 ]; then
        log_warning "内存使用率过高: ${memory_usage}%"
    fi
    
    return 0
}

# 执行压力阶梯测试
execute_stress_step() {
    local concurrent_users="$1"
    local step_duration="$2"
    local step_id="$3"
    
    log_stress "开始压力阶梯 $step_id - 并发用户数: $concurrent_users, 持续时间: ${step_duration}s"
    
    # 清理之前的结果文件
    local result_file="step_${step_id}_results.txt"
    rm -f "$result_file"
    
    local start_time=$(date +%s)
    local end_time=$((start_time + step_duration))
    local pids=()
    local request_count=0
    
    # 启动系统监控
    monitor_system &
    local monitor_pid=$!
    
    # 创建并发请求
    while [ $(date +%s) -lt $end_time ]; do
        # 控制并发数
        while [ ${#pids[@]} -ge $concurrent_users ]; do
            # 检查已完成的进程
            for i in "${!pids[@]}"; do
                if ! kill -0 ${pids[$i]} 2>/dev/null; then
                    unset pids[$i]
                fi
            done
            pids=("${pids[@]}")  # 重新索引数组
            sleep 0.1
        done
        
        # 创建新请求
        local user_id=$(generate_user_id)
        local input_text=$(generate_random_input)
        
        ((request_count++))
        execute_workflow_request "$request_count" "$user_id" "$input_text" "$step_id" &
        pids+=($!)
        
        sleep $REQUEST_INTERVAL
    done
    
    # 等待所有进程完成
    for pid in "${pids[@]}"; do
        wait $pid 2>/dev/null
    done
    
    # 停止监控
    kill $monitor_pid 2>/dev/null
    
    local step_end_time=$(date +%s)
    local step_duration_actual=$((step_end_time - start_time))
    
    # 从结果文件统计当前阶梯的指标
    local step_success=0
    local step_failure=0
    
    if [ -f "$result_file" ]; then
        # 使用更安全的方式统计，确保返回数字
        step_success=$(grep -c "SUCCESS" "$result_file" 2>/dev/null)
        step_failure=$(grep -c "FAILURE" "$result_file" 2>/dev/null)
        
        # 确保变量是数字，避免语法错误
        step_success=${step_success:-0}
        step_failure=${step_failure:-0}
        
        # 额外检查：如果变量不是数字，设为0
        if ! [[ "$step_success" =~ ^[0-9]+$ ]]; then
            step_success=0
        fi
        if ! [[ "$step_failure" =~ ^[0-9]+$ ]]; then
            step_failure=0
        fi
        
        # 读取响应时间和响应信息到全局数组
        while IFS='|' read -r status response_time response_info; do
            if [ -n "$response_time" ]; then
                ALL_RESPONSE_TIMES+=("$response_time")
            fi
        done < "$result_file"
        
        # 记录详细的统计信息
        log_info "阶梯 $step_id 统计信息:"
        log_info "  成功请求: $step_success"
        log_info "  失败请求: $step_failure"
        log_info "  总请求数: $((step_success + step_failure))"
        
        # 显示失败请求的详细信息
        if [ $step_failure -gt 0 ]; then
            log_warning "阶梯 $step_id 失败请求详情:"
            grep "FAILURE" "$result_file" | head -5 | while IFS='|' read -r status response_time response_info; do
                log_warning "  响应时间: ${response_time}s, 原因: $response_info"
            done
        fi
    fi
    
    local step_total=$((step_success + step_failure))
    local step_success_rate=0
    
    if [ $step_total -gt 0 ]; then
        step_success_rate=$(echo "scale=2; $step_success * 100 / $step_total" | bc -l)
    fi
    
    local step_throughput=0
    step_duration_actual=${step_duration_actual:-0}
    if [ $step_duration_actual -gt 0 ]; then
        step_throughput=$(echo "scale=2; $step_total / $step_duration_actual" | bc -l)
    fi
    
    # 更新全局计数器
    TOTAL_SUCCESS=${TOTAL_SUCCESS:-0}
    TOTAL_FAILURE=${TOTAL_FAILURE:-0}
    TOTAL_SUCCESS=$((TOTAL_SUCCESS + step_success))
    TOTAL_FAILURE=$((TOTAL_FAILURE + step_failure))
    
    # 保存阶梯指标
    STEP_METRICS[$step_id]="$concurrent_users|$step_success|$step_failure|$step_success_rate|$step_throughput|$step_duration_actual"
    
    log_stress "压力阶梯 $step_id 完成:"
    log_stress "  并发用户数: $concurrent_users"
    log_stress "  总请求数: $step_total"
    log_stress "  成功请求: $step_success"
    log_stress "  失败请求: $step_failure"
    log_stress "  成功率: ${step_success_rate}%"
    log_stress "  吞吐率: ${step_throughput} RPS"
    log_stress "  实际耗时: ${step_duration_actual}s"
    
    # 检查是否达到错误率阈值
    if [ $(echo "$step_success_rate < $((100 - ${ERROR_RATE_THRESHOLD:-5}))" | bc -l) -eq 1 ]; then
        local error_rate=$(echo "100 - $step_success_rate" | bc -l)
        log_warning "阶梯 $step_id 错误率过高: ${error_rate}%"
    fi
}

# 阶梯式压力测试
staircase_stress_test() {
    log_info "开始阶梯式压力测试..."
    
    local current_concurrent=${MIN_CONCURRENT:-5}
    
    while [ $current_concurrent -le ${MAX_CONCURRENT:-100} ]; do
        ((CURRENT_STEP++))
        
        # 执行当前阶梯测试
        execute_stress_step $current_concurrent ${STEP_DURATION:-60} $CURRENT_STEP
        
        # 检查是否应该停止测试
        local last_step_metrics=${STEP_METRICS[$CURRENT_STEP]}
        local last_success_rate=$(echo "$last_step_metrics" | cut -d'|' -f4)
        
        if [ $(echo "$last_success_rate < $((100 - ${ERROR_RATE_THRESHOLD:-5}))" | bc -l) -eq 1 ]; then
            log_warning "错误率超过阈值，停止压力测试"
            break
        fi
        
        # 阶梯间休息
        if [ $current_concurrent -lt ${MAX_CONCURRENT:-100} ]; then
            log_info "阶梯间休息 ${STEP_INTERVAL:-30}s..."
            sleep ${STEP_INTERVAL:-30}
        fi
        
        # 增加并发数
        current_concurrent=${current_concurrent:-0}
        current_concurrent=$((current_concurrent + ${CONCURRENT_STEP:-10}))
    done
    
    log_success "阶梯式压力测试完成，共执行 $CURRENT_STEP 个阶梯"
}

# 计算总体性能指标
calculate_overall_metrics() {
    log_info "计算总体性能指标..."
    
    # 计算响应时间统计
    local total_time=0
    local min_time=999999
    local max_time=0
    
    # 响应时间分布统计
    local response_time_distribution=()
    for i in {0..20}; do
        response_time_distribution[$i]=0
    done
    
    for time in "${ALL_RESPONSE_TIMES[@]}"; do
        total_time=$(echo "$total_time + $time" | bc -l)
        
        if [ $(echo "$time < $min_time" | bc -l) -eq 1 ]; then
            min_time=$time
        fi
        
        if [ $(echo "$time > $max_time" | bc -l) -eq 1 ]; then
            max_time=$time
        fi
        
        # 统计响应时间分布
        local time_bucket=$(echo "$time / 0.5" | bc -l | cut -d. -f1)
        if [ "$time_bucket" -lt 0 ]; then
            time_bucket=0
        elif [ "$time_bucket" -gt 20 ]; then
            time_bucket=20
        fi
        response_time_distribution[$time_bucket]=$((${response_time_distribution[$time_bucket]} + 1))
    done
    
    local avg_time=0
    local count=${#ALL_RESPONSE_TIMES[@]}
    
    if [ $count -gt 0 ]; then
        avg_time=$(echo "scale=3; $total_time / $count" | bc -l)
    fi
    
    # 计算总体吞吐率
    local total_requests=$((TOTAL_SUCCESS + TOTAL_FAILURE))
    local overall_throughput=0
    
    if [ $count -gt 0 ]; then
        overall_throughput=$(echo "scale=2; $total_requests / 60" | bc -l)
    fi
    
    # 计算总体成功率
    local overall_success_rate=0
    if [ $total_requests -gt 0 ]; then
        overall_success_rate=$(echo "scale=2; $TOTAL_SUCCESS * 100 / $total_requests" | bc -l)
    fi
    
    # 计算百分位数
    local sorted_times=($(printf '%s\n' "${ALL_RESPONSE_TIMES[@]}" | sort -n))
    local p50_idx=$((count * 50 / 100))
    local p90_idx=$((count * 90 / 100))
    local p95_idx=$((count * 95 / 100))
    local p99_idx=$((count * 99 / 100))
    
    local p50=${sorted_times[$p50_idx]}
    local p90=${sorted_times[$p90_idx]}
    local p95=${sorted_times[$p95_idx]}
    local p99=${sorted_times[$p99_idx]}
    
    # 生成阶梯详细报告
    local step_details=""
    for step_id in $(seq 1 $CURRENT_STEP); do
        if [ -n "${STEP_METRICS[$step_id]}" ]; then
            local step_metrics=${STEP_METRICS[$step_id]}
            local concurrent=$(echo "$step_metrics" | cut -d'|' -f1)
            local success=$(echo "$step_metrics" | cut -d'|' -f2)
            local failure=$(echo "$step_metrics" | cut -d'|' -f3)
            local success_rate=$(echo "$step_metrics" | cut -d'|' -f4)
            local throughput=$(echo "$step_metrics" | cut -d'|' -f5)
            local duration=$(echo "$step_metrics" | cut -d'|' -f6)
            
            step_details="$step_details{\"step\":$step_id,\"concurrent\":$concurrent,\"success\":$success,\"failure\":$failure,\"success_rate\":$success_rate,\"throughput\":$throughput,\"duration\":$duration},"
        fi
    done
    step_details=${step_details%,}  # 移除最后一个逗号
    
    # 保存指标到JSON文件
    cat > "$METRICS_FILE" << EOF
{
    "test_config": {
        "base_url": "$BASE_URL",
        "workflow_id": "$WORKFLOW_ID",
        "min_concurrent": $MIN_CONCURRENT,
        "max_concurrent": $MAX_CONCURRENT,
        "concurrent_step": $CONCURRENT_STEP,
        "step_duration": $STEP_DURATION,
        "step_interval": $STEP_INTERVAL
    },
    "overall_metrics": {
        "total_requests": $total_requests,
        "successful_requests": $TOTAL_SUCCESS,
        "failed_requests": $TOTAL_FAILURE,
        "success_rate": $overall_success_rate,
        "throughput_rpm": $overall_throughput,
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
    "step_details": [$step_details],
    "test_timestamp": "$(date -Iseconds)"
}
EOF
    
    # 输出总体指标
    log_performance "总体性能指标:"
    log_performance "总请求数: $total_requests"
    log_performance "成功请求: $TOTAL_SUCCESS"
    log_performance "失败请求: $TOTAL_FAILURE"
    log_performance "成功率: ${overall_success_rate}%"
    log_performance "吞吐率: ${overall_throughput} RPM"
    log_performance "响应时间统计:"
    log_performance "  最小: ${min_time}s"
    log_performance "  最大: ${max_time}s"
    log_performance "  平均: ${avg_time}s"
    log_performance "  P50: ${p50}s"
    log_performance "  P90: ${p90}s"
    log_performance "  P95: ${p95}s"
    log_performance "  P99: ${p99}s"
    
    # 输出响应时间分布
    log_performance "响应时间分布 (0.5秒区间):"
    for i in {0..20}; do
        local bucket_start=$(echo "$i * 0.5" | bc -l)
        local bucket_end=$(echo "($i + 1) * 0.5" | bc -l)
        local count=${response_time_distribution[$i]}
        if [ $count -gt 0 ]; then
            log_performance "  ${bucket_start}s-${bucket_end}s: $count 个请求"
        fi
    done
}

# 生成压力测试报告
generate_stress_report() {
    local report="
============================================================
工作流压力测试报告
============================================================
测试时间: $(date '+%Y-%m-%d %H:%M:%S')
基础URL: $BASE_URL
Space ID: $SPACE_ID
Bot ID: $BOT_ID
Workflow ID: $WORKFLOW_ID

压力测试配置:
最小并发数: $MIN_CONCURRENT
最大并发数: $MAX_CONCURRENT
并发递增步长: $CONCURRENT_STEP
阶梯持续时间: ${STEP_DURATION}s
阶梯间休息时间: ${STEP_INTERVAL}s
请求间隔: ${REQUEST_INTERVAL}s

测试结果:
总阶梯数: $CURRENT_STEP
总请求数: $((TOTAL_SUCCESS + TOTAL_FAILURE))
成功请求: $TOTAL_SUCCESS
失败请求: $TOTAL_FAILURE
成功率: $(echo "scale=2; $TOTAL_SUCCESS * 100 / ($TOTAL_SUCCESS + $TOTAL_FAILURE)" | bc -l)%

阶梯详细结果:
"
    
    # 添加阶梯详细结果
    for step_id in $(seq 1 $CURRENT_STEP); do
        if [ -n "${STEP_METRICS[$step_id]}" ]; then
            local step_metrics=${STEP_METRICS[$step_id]}
            local concurrent=$(echo "$step_metrics" | cut -d'|' -f1)
            local success=$(echo "$step_metrics" | cut -d'|' -f2)
            local failure=$(echo "$step_metrics" | cut -d'|' -f3)
            local success_rate=$(echo "$step_metrics" | cut -d'|' -f4)
            local throughput=$(echo "$step_metrics" | cut -d'|' -f5)
            local duration=$(echo "$step_metrics" | cut -d'|' -f6)
            
            report="$report
阶梯 $step_id:
  并发用户数: $concurrent
  总请求数: $((success + failure))
  成功请求: $success
  失败请求: $failure
  成功率: ${success_rate}%
  吞吐率: ${throughput} RPS
  持续时间: ${duration}s"
        fi
    done
    
    report="$report

详细性能指标请查看: $METRICS_FILE
系统监控数据请查看: $MONITOR_FILE
详细日志请查看: $LOG_FILE
============================================================
"
    
    echo "$report" > "$REPORT_FILE"
    log_info "压力测试报告已保存到: $REPORT_FILE"
}

# 显示帮助信息
show_help() {
    echo "工作流压力测试脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help             显示此帮助信息"
    echo "  --min-concurrent N     设置最小并发数 (默认: $MIN_CONCURRENT)"
    echo "  --max-concurrent N     设置最大并发数 (默认: $MAX_CONCURRENT)"
    echo "  --step-size N          设置并发递增步长 (默认: $CONCURRENT_STEP)"
    echo "  --step-duration N      设置阶梯持续时间秒数 (默认: $STEP_DURATION)"
    echo "  --step-interval N      设置阶梯间休息时间秒数 (默认: $STEP_INTERVAL)"
    echo "  --request-interval N   设置请求间隔秒数 (默认: $REQUEST_INTERVAL)"
    echo "  --monitor-interval N   设置监控间隔秒数 (默认: $MONITOR_INTERVAL)"
    echo "  --cpu-threshold N      设置CPU使用率阈值 (默认: $CPU_THRESHOLD%)"
    echo "  --memory-threshold N   设置内存使用率阈值 (默认: $MEMORY_THRESHOLD%)"
    echo "  --error-threshold N    设置错误率阈值 (默认: $ERROR_RATE_THRESHOLD%)"
    echo "  --aggressive           启用激进模式 (最大2000并发，更短请求间隔)"
    echo ""
    echo "示例:"
    echo "  $0                     运行默认压力测试"
    echo "  $0 --max-concurrent 50 最大50并发"
    echo "  $0 --step-duration 120 每个阶梯2分钟"
    echo "  $0 --error-threshold 10 错误率阈值10%"
    echo "  $0 --aggressive        启用激进模式进行极限压力测试"
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --min-concurrent)
            MIN_CONCURRENT="$2"
            shift 2
            ;;
        --max-concurrent)
            MAX_CONCURRENT="$2"
            shift 2
            ;;
        --step-size)
            CONCURRENT_STEP="$2"
            shift 2
            ;;
        --step-duration)
            STEP_DURATION="$2"
            shift 2
            ;;
        --step-interval)
            STEP_INTERVAL="$2"
            shift 2
            ;;
        --request-interval)
            REQUEST_INTERVAL="$2"
            shift 2
            ;;
        --monitor-interval)
            MONITOR_INTERVAL="$2"
            shift 2
            ;;
        --cpu-threshold)
            CPU_THRESHOLD="$2"
            shift 2
            ;;
        --memory-threshold)
            MEMORY_THRESHOLD="$2"
            shift 2
            ;;
        --error-threshold)
            ERROR_RATE_THRESHOLD="$2"
            shift 2
            ;;
        --aggressive)
            AGGRESSIVE_MODE=true
            MAX_CONCURRENT=$AGGRESSIVE_MAX_CONCURRENT
            CONCURRENT_STEP=$AGGRESSIVE_CONCURRENT_STEP
            REQUEST_INTERVAL=$AGGRESSIVE_REQUEST_INTERVAL
            MIN_CONCURRENT=50
            log_info "启用激进模式 - 最大并发: $MAX_CONCURRENT, 步长: $CONCURRENT_STEP, 请求间隔: $REQUEST_INTERVAL"
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
    > "$MONITOR_FILE"
    
    log_info "============================================================"
    log_info "工作流压力测试开始"
    log_info "============================================================"
    log_info "基础URL: $BASE_URL"
    log_info "Space ID: $SPACE_ID"
    log_info "Bot ID: $BOT_ID"
    log_info "Workflow ID: $WORKFLOW_ID"
    log_info "最小并发数: $MIN_CONCURRENT"
    log_info "最大并发数: $MAX_CONCURRENT"
    log_info "并发递增步长: $CONCURRENT_STEP"
    log_info "阶梯持续时间: ${STEP_DURATION}s"
    log_info "阶梯间休息时间: ${STEP_INTERVAL}s"
    log_info "请求间隔: ${REQUEST_INTERVAL}s"
    if [ "$AGGRESSIVE_MODE" = true ]; then
        log_info "测试模式: 激进模式 (极限压力测试)"
    else
        log_info "测试模式: 标准模式"
    fi
    log_info ""
    
    # 1. 测试API连接
    log_info "1. 测试API连接"
    log_info "----------------------------------------"
    test_api_connection
    log_info ""
    
    # 2. 阶梯式压力测试
    log_info "2. 阶梯式压力测试"
    log_info "----------------------------------------"
    staircase_stress_test
    log_info ""
    
    # 3. 计算总体性能指标
    log_info "3. 计算总体性能指标"
    log_info "----------------------------------------"
    calculate_overall_metrics
    log_info ""
    
    # 4. 生成压力测试报告
    log_info "4. 生成压力测试报告"
    log_info "----------------------------------------"
    generate_stress_report
    log_info ""
    
    # 清理临时文件
    log_info "清理临时文件..."
    rm -f step_*_results.txt
    
    log_info "============================================================"
    log_info "工作流压力测试完成"
    log_info "压力测试报告已保存到: $REPORT_FILE"
    log_info "性能指标已保存到: $METRICS_FILE"
    log_info "系统监控数据已保存到: $MONITOR_FILE"
    log_info "详细日志已保存到: $LOG_FILE"
    log_info "============================================================"
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
    
    # 系统监控工具是可选的
    if ! command -v top &> /dev/null; then
        log_warning "未找到 top，将跳过CPU监控"
    fi
    
    if ! command -v free &> /dev/null; then
        log_warning "未找到 free，将跳过内存监控"
    fi
    
    if ! command -v netstat &> /dev/null; then
        log_warning "未找到 netstat，将跳过网络连接监控"
    fi
    
    if ! command -v df &> /dev/null; then
        log_warning "未找到 df，将跳过磁盘使用率监控"
    fi
}

# 检查依赖并运行主函数
check_dependencies
main 