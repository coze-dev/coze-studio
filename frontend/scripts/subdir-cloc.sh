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

#First create or empty an existing result file
echo "Directory, files,language,blank,comment,code" > cloc_results2.csv

#Use the find command to find all subdirectories in the foo directory
#If you only want to iterate through direct subdirectories, you can remove the -maxdepth and -mindepth options
find $directory -type d -mindepth 1 -maxdepth 1 | while read subdir
do
    #Use the cloc tool to calculate the number of lines of code per subdirectory
    #Then use the awk tool to extract the required data: directory name, number of files, and number of lines of code
    cloc_result=$(cloc $subdir --csv --quiet | tail -n 1)
    lines=$(echo "$cloc_result" | awk -F "\"*,\"*" 'NR==3 {print $4}')
    echo "$subdir, $cloc_result" >> cloc_results2.csv
done
