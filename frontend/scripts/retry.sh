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
