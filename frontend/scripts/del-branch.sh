#!/bin/bash

git fetch

# List of complete names of the remote branch to delete, including the origin prefix
declare -a branches_to_delete_full=(
  origin/feat/analysis-tyy
  origin/feat/query_classify
)

# The name of the remote repository, default is origin
remote_name="origin"

# Function to delete a remote branch
delete_branch() {
  local branch_name_with_origin=$1
  # Remove the origin prefix
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

# Traverse the branch list and call the delete function
for full_branch_name in "${branches_to_delete_full[@]}"; do
  delete_branch "$full_branch_name"
done

echo "批量删除操作完成。"
