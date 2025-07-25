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

	"github.com/volcengine/volcengine-go-sdk/service/redis"
	"github.com/volcengine/volcengine-go-sdk/volcengine"
)

func CreateRedisAllowList(ts string) (string, error) {
	svc := redis.New(sess)

	name := "opencoze-redis" + ts
	createAllowListInput := &redis.CreateAllowListInput{
		AllowList:     volcengine.String("172.16.0.0/12"),
		AllowListName: volcengine.String(name),
		ProjectName:   volcengine.String(projectName),
	}

	resp, err := svc.CreateAllowList(createAllowListInput)
	if err != nil {
		return "", err
	}

	if resp.AllowListId == nil {
		return "", errors.New("CreateAllowList resp.AllowListId is nil")
	}

	return *resp.AllowListId, nil
}

func CreateRedisInstance(zoneID, allowListID, vpcID, subnetID, ts string) (string, error) {
	instanceID := os.Getenv("VE_REDIS_INSTANCE_ID")
	if instanceID != "" {
		return instanceID, nil
	}

	svc := redis.New(sess)
	reqConfigureNodes := &redis.ConfigureNodeForCreateDBInstanceInput{
		AZ: volcengine.String(zoneID),
	}

	reqTags := &redis.TagForCreateDBInstanceInput{
		Key:   volcengine.String("opencoze"),
		Value: volcengine.String("1"),
	}

	name := "opencoze-redis-" + ts
	createDBInstanceInput := &redis.CreateDBInstanceInput{
		AllowListIds:   volcengine.StringSlice([]string{allowListID}),
		ChargeType:     volcengine.String("PostPaid"),
		NoAuthMode:     volcengine.String("open"),
		ConfigureNodes: []*redis.ConfigureNodeForCreateDBInstanceInput{reqConfigureNodes},
		EngineVersion:  volcengine.String("7.0"),
		InstanceName:   volcengine.String(name),
		MultiAZ:        volcengine.String("disabled"),
		NodeNumber:     volcengine.Int32(2),
		ProjectName:    volcengine.String(projectName),
		RegionId:       volcengine.String(region),
		ShardCapacity:  volcengine.Int64(256),
		ShardNumber:    volcengine.Int32(1),
		ShardedCluster: volcengine.Int32(0),
		SubnetId:       volcengine.String(subnetID),
		Tags:           []*redis.TagForCreateDBInstanceInput{reqTags},
		VpcId:          volcengine.String(vpcID),
	}

	resp, err := svc.CreateDBInstance(createDBInstanceInput)
	if err != nil {
		return "", err
	}

	if resp.InstanceId == nil {
		return "", errors.New("[Redis] CreateDBInstance resp.InstanceId is nil")
	}

	return *resp.InstanceId, nil
}

func GetRedisConnectionString(instanceID string) (string, error) {
	svc := redis.New(sess)
	describeDBInstanceDetailInput := &redis.DescribeDBInstanceDetailInput{
		InstanceId: volcengine.String(instanceID),
	}

	for {
		resp, err := svc.DescribeDBInstanceDetail(describeDBInstanceDetailInput)
		if err != nil {
			fmt.Printf("[Redis] failed, err: %s \n", err)
			time.Sleep(retryTime)
			continue
		}

		if resp.Status == nil || *resp.Status != "Running" {
			fmt.Printf("[Redis] instance(%s) is %s, waiting for it to become ready... \n", instanceID, *resp.Status)
			time.Sleep(retryTime)
			continue
		}

		if len(resp.VisitAddrs) == 0 {
			fmt.Printf("[Redis] instance(%s) is creating, waiting for it to become ready... \n", instanceID)
			time.Sleep(retryTime)
			continue
		}

		if resp.VisitAddrs[0].Address == nil || resp.VisitAddrs[0].Port == nil {
			fmt.Printf("[Redis] VisitAddrs[0].Address or VisitAddrs[0].Port is nil, will try it later \n")
			time.Sleep(retryTime)
			continue
		}

		return fmt.Sprintf("%s:%s", *resp.VisitAddrs[0].Address, *resp.VisitAddrs[0].Port), nil
	}
}
