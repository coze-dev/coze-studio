#
# Copyright 2025 coze-dev Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

retry() {
  local retries=$1   # number of retries
  local wait_time=$2 # waiting time
  shift 2
  local count=0

  cd $(pwd)

  until "$@"; do
    exit_code=$?
    count=$((count + 1))
    if [ $count -lt $retries ]; then
      echo "Attempt $count/$retries failed with exit code $exit_code. Retrying in $wait_time seconds..."
      sleep $wait_time
    else
      echo "Attempt $count/$retries failed with exit code $exit_code. No more retries left."
      return $exit_code
    fi
  done
  return 0
}
