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

	"github.com/volcengine/volcengine-go-sdk/service/vedbm"
	"github.com/volcengine/volcengine-go-sdk/volcengine"
)

func CreateMySQLInstance(vpcID, subnetID, zoneID, ts string) (string, error) {
	if os.Getenv("VE_MYSQL_INSTANCE_ID") != "" {
		return os.Getenv("VE_MYSQL_INSTANCE_ID"), nil
	}
	svc := vedbm.New(sess)
	reqTags := &vedbm.TagForCreateDBInstanceInput{
		Key:   volcengine.String("opencoze"),
		Value: volcengine.String("1"),
	}

	createDBInstanceInput := &vedbm.CreateDBInstanceInput{
		ChargeType:           volcengine.String("PostPaid"),
		DBEngineVersion:      volcengine.String(mysqlDBEngineVersion),
		DBTimeZone:           volcengine.String("UTC +08:00"),
		InstanceName:         volcengine.String(mysqlDBName + "-" + ts),
		LowerCaseTableNames:  volcengine.String("1"),
		NodeNumber:           volcengine.Int32(2),
		NodeSpec:             volcengine.String(mysqlInstanceClass),
		Number:               volcengine.Int32(1),
		ProjectName:          volcengine.String(projectName),
		StorageChargeType:    volcengine.String("PostPaid"),
		SubnetId:             volcengine.String(subnetID),
		SuperAccountName:     volcengine.String(mysqlUserName),
		SuperAccountPassword: volcengine.String(mysqlUserPassword),
		Tags:                 []*vedbm.TagForCreateDBInstanceInput{reqTags},
		VpcId:                volcengine.String(vpcID),
		ZoneIds:              volcengine.String(zoneID),
	}

	resp, err := svc.CreateDBInstance(createDBInstanceInput)
	if err != nil {
		return "", err
	}

	if resp.InstanceId == nil {
		return "", errors.New("CreateDBInstance resp.InstanceId is nil")
	}

	return *resp.InstanceId, nil
}

func GetMySQLConnectAddress(mysqlInstanceID string) (string, string, error) {
	svc := vedbm.New(sess)
	describeDBInstanceDetailInput := &vedbm.DescribeDBInstanceDetailInput{
		InstanceId: volcengine.String(mysqlInstanceID),
	}

	for {
		resp, err := svc.DescribeDBInstanceDetail(describeDBInstanceDetailInput)
		if resp.InstanceDetail != nil && resp.InstanceDetail.InstanceStatus != nil && *resp.InstanceDetail.InstanceStatus != "Running" {
			fmt.Printf("[MySQL] instance(%s) is %s, waiting for it to become ready... \n", mysqlInstanceID, *resp.InstanceDetail.InstanceStatus)
			time.Sleep(retryTime)
			continue
		}

		if resp.Metadata != nil && resp.Metadata.Error != nil &&
			resp.Metadata.Error.Code == "OperationDenied.UnsupportedOperation" {
			fmt.Printf("[MySQL] instance[%s] is creating, waiting for it to become ready... \n", mysqlInstanceID)
			time.Sleep(retryTime)
			continue
		}

		if err != nil {
			fmt.Printf("[MySQL] failed, err: %s \n", err)
			time.Sleep(retryTime)
			continue
		}

		if len(resp.Endpoints) == 0 {
			fmt.Printf("[MySQL] endpoints is empty, will try it later \n")
			time.Sleep(retryTime)
			continue
		}

		if len(resp.Endpoints[0].Addresses) == 0 {
			fmt.Printf("[MySQL] endpoints[0].Addresses is nil, will try it later \n")
			time.Sleep(retryTime)
			continue
		}

		if resp.Endpoints[0].Addresses[0].Domain == nil || resp.Endpoints[0].Addresses[0].Port == nil {
			fmt.Printf("[MySQL] endpoints[0].Addresses[0].Domain or endpoints[0].Addresses[0].Port is nil, will try it later \n")
			time.Sleep(retryTime)
			continue
		}

		return *resp.Endpoints[0].Addresses[0].Domain, *resp.Endpoints[0].Addresses[0].Port, nil
	}
}

func CreateDB(mysqlInstanceID string) error {
	svc := vedbm.New(sess)
	createDatabaseInput := &vedbm.CreateDatabaseInput{
		CharacterSetName: volcengine.String("utf8mb4"),
		DBName:           volcengine.String(mysqlDBName),
		InstanceId:       volcengine.String(mysqlInstanceID),
	}

	resp, err := svc.CreateDatabase(createDatabaseInput)
	if resp.Metadata != nil && resp.Metadata.Error != nil &&
		resp.Metadata.Error.Code == "InvalidDatabaseName.Duplicate" {
		return nil
	}
	if err != nil {
		return fmt.Errorf("[MySQL] CreateDB failed, err: %w", err)
	}

	return nil
}

func CreateMySQLWhiteList(mysqlInstanceID, ts string) (string, error) {
	svc := vedbm.New(sess)
	createAllowListInput := &vedbm.CreateAllowListInput{
		AllowList:     volcengine.String("172.16.0.0/12"),
		AllowListName: volcengine.String("opencoze-mysql-" + ts),
		ProjectName:   volcengine.String(projectName),
	}

	// Copy the code to run the example, please print the API return value yourself.
	resp, err := svc.CreateAllowList(createAllowListInput)
	if err != nil {
		return "", err
	}

	if resp.AllowListId == nil {
		return "", errors.New("[MySQL] CreateAllowList resp.AllowListId is nil")
	}

	return *resp.AllowListId, nil
}

func AssociateMySQLWhiteList(mysqlInstanceID, whitelistID string) error {
	svc := vedbm.New(sess)
	associateAllowListInput := &vedbm.AssociateAllowListInput{
		AllowListIds: volcengine.StringSlice([]string{whitelistID}),
		InstanceIds:  volcengine.StringSlice([]string{mysqlInstanceID}),
	}

	// Copy the code to run the example, please print the API return value yourself.
	_, err := svc.AssociateAllowList(associateAllowListInput)
	if err != nil {
		return err
	}

	return nil
}
