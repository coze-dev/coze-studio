#!/bin/bash

git fetch

# 要删除的远程分支完整名称列表，包含origin前缀
declare -a branches_to_delete_full=(
  origin/feat/analysis-tyy
  origin/feat/query_classify
)

# 远程仓库的名称，默认为origin
remote_name="origin"

# 函数，用于删除远程分支
delete_branch() {
  local branch_name_with_origin=$1
  # 去除origin前缀
  local branch_name=$(echo "$branch_name_with_origin" | sed 's/^'"$remote_name"'\///')

  if git show-ref --verify --quiet "refs/remotes/$branch_name_with_origin"; then
    echo "正在删除远程分支: $branch_name"
    git push "$remote_name" --delete "$branch_name" --no-verify
    if [ $? -eq 0 ]; then
      echo "远程分支 $branch_name 已被删除。"
    else
      echo "删除远程分支 $branch_name 失败，请检查分支名称或权限。"
    fi
  else
    echo "分支 $branch_name 不存在，无需删除。"
  fi
}

# 遍历分支列表并调用删除函数
for full_branch_name in "${branches_to_delete_full[@]}"; do
  delete_branch "$full_branch_name"
done

echo "批量删除操作完成。"
