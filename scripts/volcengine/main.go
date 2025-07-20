/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package main

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/volcengine/volcengine-go-sdk/volcengine"
	"github.com/volcengine/volcengine-go-sdk/volcengine/credentials"
	"github.com/volcengine/volcengine-go-sdk/volcengine/session"
)

var (
	ak          string
	sk          string
	region      string
	sess        *session.Session
	projectName string
	vpcName     string
)

const (
	password = "Opencoze123"
)

// MySQL
var (
	mysqlDBName          string
	mysqlUserName        string
	mysqlUserPassword    string
	mysqlPort            string
	mysqlDBEngineVersion string
	mysqlInstanceClass   string
)

const retryTime = 10 * time.Second

func main() {
	if err := loadEnv(); err != nil {
		panic("loadEnv failed, err=" + err.Error())
	}

	if err := initServer(); err != nil {
		panic("initServer failed, err=" + err.Error())
	}
	ts := time.Now().Format("0102-150405")

	// -----------------------------------------------------------------
	// ------------------------- Setup Network -------------------------
	// -----------------------------------------------------------------

	// 1. get zoneID
	zoneID, err := GetChosenZoneID()
	if err != nil {
		panic("[Zone] GetZoneID failed, err=" + err.Error())
	}
	fmt.Println("[Zone] Chosen ZoneID:", zoneID)
	updateEnvVarInFile("VE_ZONE_ID", zoneID)

	// 2.1 create vpc
	vpcID, err := CreatePrivateNetwork(vpcName, ts, zoneID)
	if err != nil {
		panic("CreatePrivateNetwork failed, err=" + err.Error())
	}
	fmt.Println("[VPC] Created successfully vpcID:", vpcID)
	updateEnvVarInFile("VE_VPC_ID", vpcID)

	CheckVpcStatus(vpcID)

	// 2.2 create subnet
	subnetID, err := CreateSubnet(vpcName, ts, vpcID, zoneID)
	if err != nil {
		panic("CreateSubnet failed, err=" + err.Error())
	}
	fmt.Println("[Subnet] Created successfully subnetID:", subnetID)
	updateEnvVarInFile("VE_SUBNET_ID", subnetID)

	CheckVpcStatus(vpcID)

	// 2.3 create network acl
	aclID, err := CreateNetworkACL(vpcName, ts, vpcID)
	if err != nil {
		panic("CreateNetworkACL failed, err=" + err.Error())
	}
	fmt.Println("[ACL] Created successfully aclID:", aclID)
	updateEnvVarInFile("VE_ACL_ID", aclID)

	CheckACLStatus(aclID)

	// 2.4 attach subnet to acl
	if err = AttachSubnetToACL(aclID, subnetID); err != nil {
		panic("AttachSubnetToACL failed, err=" + err.Error())
	}
	fmt.Println("[ACL] Attached successfully subnetID:", subnetID)

	// 2.5 create safe group
	sgID, err := CreateSafeGroup(ts, vpcID)
	if err != nil {
		panic("CreateSafeGroup failed, err=" + err.Error())
	}
	fmt.Println("[SafeGroup] Created successfully safe group ID:", sgID)
	updateEnvVarInFile("VE_SAFE_GROUP_ID", sgID)

	CheckSafeGroupStatus(sgID)

	// 2.6 create rule
	if err = CreateSafeGroupRule(sgID); err != nil {
		panic("CreateSafeGroupRule failed, err=" + err.Error())
	}
	fmt.Println("[SafeGroup] Created safe group rule successfully")
	// -----------------------------------------------------------------

	// -----------------------------------------------------------------
	// ----------------- Create All Instances First---------------------
	// -----------------------------------------------------------------
	// 3.1 create mysql instance
	mysqlInstanceID, err := CreateMySQLInstance(vpcID, subnetID, zoneID, ts)
	if err != nil {
		panic("CreateMySQLInstance failed, err=" + err.Error())
	}
	fmt.Println("[MySQL] Created mysqlInstanceID:", mysqlInstanceID)
	updateEnvVarInFile("VE_MYSQL_INSTANCE_ID", mysqlInstanceID)

	// 4.1 create redis white list
	allowListID, err := CreateRedisAllowList(ts)
	if err != nil {
		panic("CreateRedisAllowList failed, err=" + err.Error())
	}
	fmt.Printf("[Redis] Created successfully AllowListID : %s\n", allowListID)
	updateEnvVarInFile("VE_REDIS_ALLOWLIST_ID", allowListID)

	// 4.2 create redis instance with allow list id
	redisInstanceID, err := CreateRedisInstance(zoneID, allowListID, vpcID, subnetID, ts)
	if err != nil {
		panic("CreateRedisInstance failed, err=" + err.Error())
	}
	fmt.Printf("[Redis] Created successfully RedisInstanceID : %s\n", redisInstanceID)
	updateEnvVarInFile("VE_REDIS_INSTANCE_ID", redisInstanceID)

	// 5.1 create rocketmq allow list
	rmqAllowListID, err := CreateRocketMQAllowList(ts)
	if err != nil {
		panic("CreateRocketMQAllowList failed, err=" + err.Error())
	}
	fmt.Printf("[RocketMQ] Created successfully AllowListID : %s\n", rmqAllowListID)
	updateEnvVarInFile("VE_ROCKETMQ_ALLOWLIST_ID", rmqAllowListID)

	// 6.1 create elasticsearch instance
	esInstanceID, err := CreateESInstance(vpcID, subnetID, zoneID, ts)
	if err != nil {
		panic("CreateESInstance failed, err=" + err.Error())
	}
	fmt.Printf("[Elasticsearch] Created successfully instanceID : %s\n", esInstanceID)
	updateEnvVarInFile("VE_ES_INSTANCE_ID", esInstanceID)

	// ecsInstanceID, err := CreateECSInstance(zoneID, sgID, subnetID, ts)
	// if err != nil {
	// 	panic("CreateECSInstance failed, err=" + err.Error())
	// }
	// fmt.Printf("[ECS] Created successfully instanceID : %s\n", ecsInstanceID)
	// updateEnvVarInFile("VE_ECS_INSTANCE_ID", ecsInstanceID)

	// -----------------------------------------------------------------
	// -------- Waiting for the instance to become available -----------
	// -----------------------------------------------------------------

	fmt.Println("-----------------------------------------------------------------")
	fmt.Println("Waiting for the instance to become available")
	// ----------------- MySQL -------------------
	// 3.2 get mysql connect host and port
	mysqlHost, mysqlPort, err := GetMySQLConnectAddress(mysqlInstanceID)
	if err != nil {
		panic("GetMySQLConnectAddress failed, err=" + err.Error())
	}
	fmt.Printf("[MySQL] MySQL connect address: %s:%s\n", mysqlHost, mysqlPort)

	// 3.3 Create DB
	if err = CreateDB(mysqlInstanceID); err != nil {
		panic("CreateDB failed, err=" + err.Error())
	}
	fmt.Printf("[MySQL] Created successfully db : %s\n", mysqlDBName)

	// 3.4 Create mysql whitelist
	whitelistID, err := CreateMySQLWhiteList(mysqlInstanceID, ts)
	if err != nil {
		panic("CreateMySQLWhiteList failed, err=" + err.Error())
	}
	fmt.Printf("[MySQL] Created successfully AllowListID : %s \n", whitelistID)
	updateEnvVarInFile("VE_MYSQL_WHITELIST_ID", whitelistID)

	// 3.5 Associate whitelist to instance
	if err = AssociateMySQLWhiteList(mysqlInstanceID, whitelistID); err != nil {
		panic("AssociateMySQLWhiteList failed, err=" + err.Error())
	}
	fmt.Printf("[MySQL] Associated AllowListID(%s) to MySQLInstanceID(%s)\n", whitelistID, mysqlInstanceID)

	// ----------------- Redis -------------------
	// 4.3 get redis connection string
	redisConn, err := GetRedisConnectionString(redisInstanceID)
	if err != nil {
		panic("GetRedisConnectionString failed, err=" + err.Error())
	}
	fmt.Printf("[Redis] Redis connection: %s\n", redisConn)

	// ----------------- RocketMQ -------------------

	// 5.2 create rocketmq instance
	rmqInstanceID, err := CreateRocketMQInstance(vpcID, subnetID, zoneID, ts, rmqAllowListID)
	if err != nil {
		panic("CreateRocketMQInstance failed, err=" + err.Error())
	}
	fmt.Printf("[RocketMQ] Created successfully instanceID : %s\n", rmqInstanceID)
	updateEnvVarInFile("VE_ROCKETMQ_INSTANCE_ID", rmqInstanceID)

	// 5.3 get rocketmq connect address
	rmqConnectAddress, err := GetRocketMQConnectAddress(rmqInstanceID)
	if err != nil {
		panic("GetRocketMQConnectAddress failed, err=" + err.Error())
	}
	fmt.Printf("[RocketMQ] connect address: %s\n", rmqConnectAddress)

	rmqAK, rmqSK, err := CreateRocketMQAccessKey(rmqInstanceID)
	if err != nil {
		panic("CreateRocketMQAccessKey failed, err=" + err.Error())
	}
	fmt.Printf("[RocketMQ] access key: %s, secret key: %s\n", rmqAK, rmqSK)

	if err = CreateRocketMQTopic(rmqAK, rmqInstanceID); err != nil {
		panic("CreateRocketMQTopic failed, err=" + err.Error())
	}
	fmt.Printf("[RocketMQ] topic created successfully\n")

	if err = CreateRocketMQGroup(rmqInstanceID); err != nil {
		panic("CreateRocketMQGroup failed, err=" + err.Error())
	}
	fmt.Printf("[RocketMQ] group created successfully\n")

	// ----------------- Elasticsearch -------------------

	// 5.2 get elasticsearch connect address
	esConnectAddress, err := GetESConnectAddress(esInstanceID)
	if err != nil {
		panic("GetESConnectAddress failed, err=" + err.Error())
	}
	fmt.Printf("[Elasticsearch]  connect address: %s\n", esConnectAddress)

	// -----------------------------------------------------------------
	// ------------------------ Output Env -----------------------------
	// -----------------------------------------------------------------
	fmt.Println("-----------------------------------------------------------------")
	fmt.Println("Output Env :")

	fmt.Printf("# MySQL\n")
	fmt.Printf("export MYSQL_DATABASE=%s\n", mysqlDBName)
	fmt.Printf("export MYSQL_USER=%s\n", mysqlUserName)
	fmt.Printf("export MYSQL_PASSWORD=%s\n", mysqlUserPassword)
	fmt.Printf("export MYSQL_HOST=%s\n", mysqlHost)
	fmt.Printf("export MYSQL_PORT=%s\n", mysqlPort)
	fmt.Println("")

	fmt.Printf("# Redis\n")
	fmt.Printf("export REDIS_AOF_ENABLED=no\n")
	fmt.Printf("export REDIS_IO_THREADS=4\n")
	fmt.Printf("export ALLOW_EMPTY_PASSWORD=yes\n")
	fmt.Printf("export REDIS_ADDR=%s\n", redisConn)
	fmt.Println("")

	fmt.Printf("# Elasticsearch\n")
	fmt.Printf("export ES_VERSION=v7\n")
	fmt.Printf("export ES_ADDR=%s\n", esConnectAddress)
	fmt.Printf("export ES_USERNAME=admin\n")
	fmt.Printf("export ES_PASSWORD=%s\n", password)
	fmt.Println("")

	fmt.Printf("# RocketMQ\n")
	fmt.Printf("export RMQ_NAME_SERVER=%s\n", rmqConnectAddress)
	fmt.Printf("export RMQ_ACCESS_KEY=%s\n", rmqAK)
	fmt.Printf("export RMQ_SECRET_KEY=%s\n", rmqSK)
	fmt.Println("")
}

func initServer() error {
	config := volcengine.NewConfig().WithRegion(region).
		WithCredentials(credentials.NewStaticCredentials(ak, sk, ""))

	var err error
	sess, err = session.NewSession(config)
	if err != nil {
		return err
	}

	return nil
}

func loadEnv() error {
	err := godotenv.Load()
	if err != nil {
		return err
	}

	ak = os.Getenv("VE_AK")
	sk = os.Getenv("VE_SK")
	region = os.Getenv("VE_REGION")
	projectName = os.Getenv("VE_PROJECT_NAME")
	vpcName = os.Getenv("VE_VPC_NAME")

	// MySQL
	mysqlDBName = os.Getenv("VE_MYSQL_DB_NAME")
	mysqlUserName = os.Getenv("VE_MYSQL_USER_NAME")
	mysqlUserPassword = os.Getenv("VE_MYSQL_USER_PASSWORD")
	mysqlPort = os.Getenv("VE_MYSQL_PORT")
	mysqlDBEngineVersion = os.Getenv("VE_MYSQL_DB_ENGINE_VERSION")
	mysqlInstanceClass = os.Getenv("VE_MYSQL_INSTANCE_CLASS")

	if ak == "" {
		return errors.New("VE_AK is empty")
	}

	if sk == "" {
		return errors.New("VE_SK is empty")
	}

	if region == "" {
		return errors.New("VE_REGION is empty")
	}

	if projectName == "" {
		return errors.New("VE_PROJECT_NAME is empty")
	}

	if vpcName == "" {
		return errors.New("VE_VPC_NAME is empty")
	}

	// MySQL
	if mysqlDBName == "" {
		return errors.New("VE_MYSQL_INSTANCE_NAME is empty")
	}

	if mysqlUserName == "" {
		return errors.New("VE_MYSQL_USER_NAME is empty")
	}

	if mysqlUserPassword == "" {
		return errors.New("VE_MYSQL_USER_PASSWORD is empty")
	}

	if mysqlPort == "" {
		return errors.New("VE_MYSQL_PORT is empty")
	}

	if mysqlDBEngineVersion == "" {
		return errors.New("VE_MYSQL_DB_ENGINE_VERSION is empty")
	}

	if mysqlInstanceClass == "" {
		return errors.New("VE_MYSQL_INSTANCE_CLASS is empty")
	}

	return nil
}

func s(p *string) string {
	if p == nil {
		return ""
	}
	return *p
}
