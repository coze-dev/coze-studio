#!/bin/bash

# 工作流API测试脚本
# 测试工作流链接: http://172.31.114.205:8888/work_flow?workflow_id=7538251939654402048&space_id=7537995730808471552
# API格式参考: https://www.coze.cn/open/docs/developer_guides/workflow_run

# 配置参数
BASE_URL="http://172.31.114.205:8888"
SPACE_ID="7537995730808471552"
BOT_ID="7537995730808471552"
WORKFLOW_ID="7538251939654402048"  # 临时使用bot_id作为workflow_id

# 认证信息
SESSION_KEY="eyJpZCI6NzUzODI2MTQzMDM0MDk0Mzg3MiwiY3JlYXRlZF9hdCI6IjIwMjUtMDgtMTRUMDI6MjQ6MjAuODc5MjE4MTM5WiIsImV4cGlyZXNfYXQiOiIyMDI1LTA5LTEzVDAyOjI0OjIwLjg3OTIxODMxWiJ9pIgoX-SLpYgcEUnbYsmRJCTIRkAnqlcwQaeMmIHlK7A"
PAT_TOKEN="pat_584de059f23e525c134cf374e7870f2d151364877ebf0f8c6862272d2bd39f5e"
COOKIE_HEADER="i18next=zh-CN; session_key=$SESSION_KEY"
AUTH_HEADER="Bearer $PAT_TOKEN"

# 日志文件
LOG_FILE="workflow_api_test.log"
REPORT_FILE="workflow_api_test_report.txt"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
SUCCESSFUL_TESTS=0
FAILED_TESTS=0

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
    ((SUCCESSFUL_TESTS++))
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# 测试函数
test_api_call() {
    local test_name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected_status="$5"
    
    ((TOTAL_TESTS++))
    
    log_info "测试: $test_name"
    log_info "URL: $url"
    if [ -n "$data" ]; then
        log_info "数据: $data"
    fi
    
         # 执行API调用
     if [ "$method" = "GET" ]; then
         response=$(curl -s -w "\n%{http_code}" "$url" \
             -H "Content-Type: application/json" \
             -H "User-Agent: WorkflowAPITester/1.0" \
             -H "Cookie: $COOKIE_HEADER" \
             -H "Authorization: $AUTH_HEADER" \
             --connect-timeout 10 \
             --max-time 30)
     else
         response=$(curl -s -w "\n%{http_code}" "$url" \
             -H "Content-Type: application/json" \
             -H "User-Agent: WorkflowAPITester/1.0" \
             -H "Cookie: $COOKIE_HEADER" \
             -H "Authorization: $AUTH_HEADER" \
             -d "$data" \
             --connect-timeout 10 \
             --max-time 30)
     fi
    
    # 解析响应
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    log_info "HTTP状态码: $http_code"
    log_info "响应内容: $response_body"
    
    # 检查结果
    if [ "$http_code" = "$expected_status" ]; then
        log_success "$test_name 成功"
        return 0
    else
        log_error "$test_name 失败 - 期望状态码: $expected_status, 实际状态码: $http_code"
        return 1
    fi
}

# 测试服务器连接
test_server_connection() {
    log_info "测试服务器连接..."
    
    if curl -s --connect-timeout 5 "$BASE_URL" > /dev/null 2>&1; then
        log_success "服务器连接正常"
        return 0
    else
        log_error "无法连接到服务器: $BASE_URL"
        return 1
    fi
}

# 测试获取工作流信息
test_workflow_info() {
    local url="$BASE_URL/v1/workflows/$WORKFLOW_ID"
    test_api_call "获取工作流信息" "GET" "$url" "" "200"
}

# 测试工作流执行（同步）
test_workflow_run_sync() {
    local url="$BASE_URL/v1/workflow/run"
    local data='{
        "workflow_id": "'$WORKFLOW_ID'",
        "bot_id": "'$BOT_ID'",
        "parameters": "{\"input\": \"你好，请介绍一下你自己\", \"user_id\": \"test_user_001\"}",
        "ext": {},
        "is_async": false
    }'
    test_api_call "工作流执行（同步）" "POST" "$url" "$data" "200"
}

# 测试工作流执行（异步）
test_workflow_run_async() {
    local url="$BASE_URL/v1/workflow/run"
    local data='{
        "workflow_id": "'$WORKFLOW_ID'",
        "bot_id": "'$BOT_ID'",
        "parameters": "{\"input\": \"你好，请介绍一下你自己\", \"user_id\": \"test_user_001\"}",
        "ext": {},
        "is_async": true
    }'
    test_api_call "工作流执行（异步）" "POST" "$url" "$data" "200"
}

# 测试工作流流式执行
test_workflow_stream_run() {
    local url="$BASE_URL/v1/workflow/stream_run"
    local data='{
        "workflow_id": "'$WORKFLOW_ID'",
        "bot_id": "'$BOT_ID'",
        "parameters": "{\"input\": \"你好，请介绍一下你自己\", \"user_id\": \"test_user_001\"}",
        "ext": {}
    }'
    
    log_info "测试: 工作流流式执行"
    log_info "URL: $url"
    log_info "数据: $data"
    
    ((TOTAL_TESTS++))
    
         # 流式执行需要特殊处理
     response=$(curl -s -w "\n%{http_code}" "$url" \
         -H "Content-Type: application/json" \
         -H "User-Agent: WorkflowAPITester/1.0" \
         -H "Cookie: $COOKIE_HEADER" \
         -H "Authorization: $AUTH_HEADER" \
         -d "$data" \
         --connect-timeout 10 \
         --max-time 10)
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    log_info "HTTP状态码: $http_code"
    log_info "响应内容: $response_body"
    
    if [ "$http_code" = "200" ]; then
        log_success "工作流流式执行 成功"
    else
        log_error "工作流流式执行 失败 - 状态码: $http_code"
    fi
}

# 测试获取工作流执行历史
test_workflow_run_history() {
    local url="$BASE_URL/v1/workflow/get_run_history?workflow_id=$WORKFLOW_ID"
    test_api_call "获取工作流执行历史" "GET" "$url" "" "200"
}

# 测试聊天流执行
test_chat_flow_run() {
    local url="$BASE_URL/v1/workflows/chat"
    local data='{
        "workflow_id": "'$WORKFLOW_ID'",
        "message": "你好，请介绍一下你自己"
    }'
    test_api_call "聊天流执行" "POST" "$url" "$data" "200"
}

# 生成测试报告
generate_report() {
    local success_rate=0
    if [ $TOTAL_TESTS -gt 0 ]; then
        success_rate=$(echo "scale=1; $SUCCESSFUL_TESTS * 100 / $TOTAL_TESTS" | bc)
    fi
    
    local report="
============================================================
工作流API测试报告
============================================================
测试时间: $(date '+%Y-%m-%d %H:%M:%S')
基础URL: $BASE_URL
Space ID: $SPACE_ID
Bot ID: $BOT_ID
Workflow ID: $WORKFLOW_ID

测试统计:
总测试数: $TOTAL_TESTS
成功: $SUCCESSFUL_TESTS
失败: $FAILED_TESTS
成功率: ${success_rate}%

详细结果请查看日志文件: $LOG_FILE
============================================================
"
    
    echo "$report" > "$REPORT_FILE"
    log_info "测试报告已保存到: $REPORT_FILE"
}

# 主函数
main() {
    # 清空日志文件
    > "$LOG_FILE"
    
    log_info "============================================================"
    log_info "工作流API测试开始"
    log_info "============================================================"
    log_info "基础URL: $BASE_URL"
    log_info "Space ID: $SPACE_ID"
    log_info "Bot ID: $BOT_ID"
    log_info "Workflow ID: $WORKFLOW_ID"
    log_info ""
    
    # 1. 测试服务器连接
    log_info "1. 测试服务器连接"
    log_info "----------------------------------------"
    if ! test_server_connection; then
        log_error "服务器连接失败，停止测试"
        exit 1
    fi
    log_info ""
    
    # 2. 测试获取工作流信息
    log_info "2. 测试获取工作流信息"
    log_info "----------------------------------------"
    test_workflow_info
    log_info ""
    
    # 3. 测试工作流执行（同步）
    log_info "3. 测试工作流执行（同步）"
    log_info "----------------------------------------"
    test_workflow_run_sync
    log_info ""
    
    # 4. 测试工作流执行（异步）
    log_info "4. 测试工作流执行（异步）"
    log_info "----------------------------------------"
    test_workflow_run_async
    log_info ""
    
    # 5. 测试工作流流式执行
    log_info "5. 测试工作流流式执行"
    log_info "----------------------------------------"
    test_workflow_stream_run
    log_info ""
    
    # 6. 测试聊天流执行
    log_info "6. 测试聊天流执行"
    log_info "----------------------------------------"
    test_chat_flow_run
    log_info ""
    
    # 7. 测试获取工作流执行历史
    log_info "7. 测试获取工作流执行历史"
    log_info "----------------------------------------"
    test_workflow_run_history
    log_info ""
    
    # 8. 生成测试报告
    log_info "8. 生成测试报告"
    log_info "----------------------------------------"
    generate_report
    log_info ""
    
    log_info "============================================================"
    log_info "工作流API测试完成"
    log_info "测试报告已保存到: $REPORT_FILE"
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
        echo "警告: 未找到 bc，将使用简单计算"
        # 可以在这里添加简单的计算替代方案
    fi
}

# 显示帮助信息
show_help() {
    echo "工作流API测试脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -v, --version  显示版本信息"
    echo "  -d, --debug    启用调试模式"
    echo ""
    echo "示例:"
    echo "  $0             运行所有测试"
    echo "  $0 --debug     运行调试模式测试"
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--version)
            echo "工作流API测试脚本 v1.0"
            exit 0
            ;;
        -d|--debug)
            set -x  # 启用调试模式
            shift
            ;;
        *)
            echo "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 检查依赖并运行主函数
check_dependencies
main 