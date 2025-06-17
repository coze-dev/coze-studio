#!/bin/bash
set -ex

basename=$(basename "$CHANGE_URL")
lastParam=$(echo "$basename" | cut -d'/' -f1)

targetBranch="${targetBranch}"
sourceBranch="${SOURCE_BRANCH}"
mrTitle="${MR_TITLE}"
mrDescription="${MR_DESCRIPTION}"

echo "::set-output name=mrId::$lastParam" # 输出 lastParam 的值

result=$(curl --location "https://code.byted.org/api/v4/projects/548801/merge_requests/$lastParam" \
    --header "Private-Token: $GITLAB_TOKEN")

commits=$(curl --location "https://code.byted.org/api/v4/projects/548801/merge_requests/$lastParam/commits" \
    --header "Private-Token: $GITLAB_TOKEN")

isSquash=$(echo "$result" | jq -r '.squash') # 使用jq提取isSquash的值

commitsCount=$(echo "$commits" | jq length)

echo "::set-output name=squash::$isSquash"           # 输出 isSquash 的值
echo "::set-output name=commitsCount::$commitsCount" # 输出 commitsCount 的值

if [[ $isSquash == true ]]; then
    # 勾选squash

    if [[ $sourceBranch == release/* && $targetBranch == master ]]; then
        echo "::add-message level=error::**release 分支合入 master 时，不可开启 squash **"
        exit 1
    fi

    if [[ $mrDescription == \[no-squash\]* ]]; then
        echo "::add-message level=error::**当前 MR 勾选了 Squash 选项，但是描述中包含[no-squash]**"
        exit 1
    fi

else
    # 没有勾选squash

    if [[ $mrDescription == \[no-squash\]* ||
        $commitsCount -le 1 ||
        $mrTitle == WIP:* ||
        $mrTitle == wip:* ||
        $sourceBranch == release/* ]]; then
        exit 0
    fi

    echo "::add-message level=error::**当前 MR 应该勾选 Squash 选项**"
    exit 1

fi
