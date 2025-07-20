#!/bin/sh

# usage:
# cd $path/to/monorepo
# sh scripts/subdir-cloc.sh $relative_path/to/some/dir
#
# example: sh scripts/subdir-cloc.sh apps/bot/src/routes

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 directory"
    exit 1
fi

directory=$1

#首先创建或清空已有的结果文件
echo "Directory, files,language,blank,comment,code" > cloc_results2.csv

#使用find命令来查找foo目录下的所有子目录
#如果你只想遍历直接子目录，可以去掉-maxdepth和-mindepth选项
find $directory -type d -mindepth 1 -maxdepth 1 | while read subdir
do
    #使用cloc工具计算每个子目录的代码行数
    #然后使用awk工具来提取需要的数据：目录名、文件数、代码行数
    cloc_result=$(cloc $subdir --csv --quiet | tail -n 1)
    lines=$(echo "$cloc_result" | awk -F "\"*,\"*" 'NR==3 {print $4}')
    echo "$subdir, $cloc_result" >> cloc_results2.csv
done
