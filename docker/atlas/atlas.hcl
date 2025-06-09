
env "local" {
  url = "mysql://coze:coze123@localhost:3306/opencoze?charset=utf8mb4&parseTime=True"
  dev = "docker://mysql/8"

  migration {
    dir = "file://migrations"
    exclude = ["atlas_schema_revisions"]
    baseline = "20250609083036"
  }
}