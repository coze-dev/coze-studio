#!/bin/bash

# Define the cut-off date, 3 months from now
cutoff=$(date -v-2m +%s)
branches_to_delete=()
outdated_branches_with_change=()

echo "| 分支名 | commits 数量 | 作者 | 最后更新时间 | log |"
echo "| ----- | ----- | ----- | ----- | ----- |"

# Get all remote branches

for branch in $(git for-each-ref refs/remotes/origin --format '%(refname:short)'); do
  # Skip branches with 'release/' in their name
  if [[ $branch == *'release/'* ]]; then
    continue
  fi

  # Get the date of the last commit on the branch
  last_commit=$(git log -1 --pretty=format:%ct $branch)

  # If the last commit is older than the cutoff date, delete the branch
  if [ $last_commit -lt $cutoff ]; then
    # Check if there are commits that are not merged into master
    if [ "$(git log origin/master..$branch)" != "" ]; then
      commits=$(git log --pretty=format:'%an' origin/master..$branch)
      echo "| $branch | $(echo "$commits" | wc -l) | $(echo "$(git show -s --format="%an | %ci | %s" origin/master..$branch )" | head -n 1) |"
      outdated_branches_with_change+=("$branch")
    else
      branches_to_delete+=("$branch")
    fi
  fi
done

echo "these branches should be deleted:\n"

for branch in "${branches_to_delete[@]}"
do
  echo "Deleting $branch"
  git push origin --delete ${branch#origin/} --no-verify
done

echo "----------------------------------------------"

# echo "these branches outdated but with not commit changes:\n"

# for branch in "${outdated_branches_with_change[@]}"
# do
#   echo "$branch"
# done

