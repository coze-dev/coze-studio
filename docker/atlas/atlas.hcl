
env "local" {
  url = "mysql://root:1234@localhost:3306/opencoze?charset=utf8mb4&parseTime=True"
  dev = "mysql://root:1234@localhost:3306/devdb"


  migration {
    dir = "file://migrations"
    exclude = ["atlas_schema_revisions", "table_*"]
    baseline = "20250618025620"
  }
}