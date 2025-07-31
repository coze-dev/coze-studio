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

	"github.com/volcengine/volcengine-go-sdk/service/rocketmq"
	"github.com/volcengine/volcengine-go-sdk/volcengine"
)

func CreateRocketMQAllowList(ts string) (string, error) {
	if os.Getenv("VE_ROCKETMQ_ALLOWLIST_ID") != "" {
		return os.Getenv("VE_ROCKETMQ_ALLOWLIST_ID"), nil
	}
	svc := rocketmq.New(sess)
	name := fmt.Sprintf("opencoze-rmq-%s", ts)
	createAllowListInput := &rocketmq.CreateAllowListInput{
		AllowList:     volcengine.String("172.16.0.0/12"),
		AllowListName: volcengine.String(name),
		AllowListType: volcengine.String("IPv4"),
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

func CreateRocketMQInstance(vpcID, subnetID, zoneID, ts, allowListID string) (string, error) {
	if os.Getenv("VE_ROCKETMQ_INSTANCE_ID") != "" {
		return os.Getenv("VE_ROCKETMQ_INSTANCE_ID"), nil
	}
	svc := rocketmq.New(sess)
	reqBindTags := &rocketmq.BindTagForCreateInstanceInput{
		Key:   volcengine.String("opencoze"),
		Value: volcengine.String("1"),
	}
	reqChargeInfo := &rocketmq.ChargeInfoForCreateInstanceInput{
		ChargeType: volcengine.String("PostPaid"),
	}
	createInstanceInput := &rocketmq.CreateInstanceInput{
		AllowListIds:     volcengine.StringSlice([]string{allowListID}),
		BindTags:         []*rocketmq.BindTagForCreateInstanceInput{reqBindTags},
		ChargeInfo:       reqChargeInfo,
		ComputeSpec:      volcengine.String("rocketmq.n1.x2.micro"),
		FileReservedTime: volcengine.Int32(72),
		IPVersionType:    volcengine.String("IPv4"),
		InstanceName:     volcengine.String(fmt.Sprintf("opencoze-rmq-%s", ts)),
		NetworkTypes:     volcengine.String("PrivateNetwork"),
		ProjectName:      volcengine.String(projectName),
		StorageSpace:     volcengine.Int32(300),
		SubnetId:         volcengine.String(subnetID),
		Version:          volcengine.String("4.8"),
		VpcId:            volcengine.String(vpcID),
		ZoneId:           volcengine.String(zoneID),
	}

	resp, err := svc.CreateInstance(createInstanceInput)
	if err != nil {
		return "", err
	}

	if resp.InstanceId == nil {
		return "", errors.New("[RocketMQ] CreateInstance resp.InstanceId is nil")
	}

	return *resp.InstanceId, nil
}

func GetRocketMQConnectAddress(instanceID string) (string, error) {
	svc := rocketmq.New(sess)
	describeInstanceDetailInput := &rocketmq.DescribeInstanceDetailInput{
		InstanceId: volcengine.String(instanceID),
	}

	for {
		resp, err := svc.DescribeInstanceDetail(describeInstanceDetailInput)
		if err != nil {
			return "", err
		}

		if resp.BasicInfo == nil || resp.BasicInfo.InstanceStatus == nil || *resp.BasicInfo.InstanceStatus != "Running" {
			fmt.Printf("[RocketMQ] instance(%s) is %s, waiting for it to become ready... \n", instanceID, *resp.BasicInfo.InstanceStatus)
			time.Sleep(retryTime)
			continue
		}

		if len(resp.ConnectionInfo) == 0 || resp.ConnectionInfo[0].InternalEndpoint == nil {
			fmt.Println("[RocketMQ] DescribeInstanceDetail resp.ConnectionInfo is empty, will retry")
			time.Sleep(retryTime)
			continue
		}

		if *resp.ConnectionInfo[0].InternalEndpoint == "" {
			fmt.Printf("[RocketMQ] instance(%s) is creating, waiting for it to become ready... \n", instanceID)
			time.Sleep(retryTime)
			continue
		}

		return *resp.ConnectionInfo[0].InternalEndpoint, nil
	}
}

func getRocketMQAccessKey(instanceID string) (string, error) {
	describeAccessKeysInput := &rocketmq.DescribeAccessKeysInput{
		InstanceId: volcengine.String(instanceID),
		PageNumber: volcengine.Int32(1),
		PageSize:   volcengine.Int32(100),
	}

	svc := rocketmq.New(sess)
	resp, err := svc.DescribeAccessKeys(describeAccessKeysInput)
	if err != nil {
		return "", err
	}

	ak := ""
	for _, info := range resp.AccessKeysInfo {
		if info.AccessKey == nil || info.AllAuthority == nil {
			continue
		}
		if *info.AllAuthority == "ALL" {
			return *info.AccessKey, nil
		}
		ak = *info.AccessKey
	}

	return ak, nil
}

func CreateRocketMQAccessKey(instanceID string) (string, string, error) {
	ak, err := getRocketMQAccessKey(instanceID)
	if err != nil {
		return "", "", err
	}

	svc := rocketmq.New(sess)
	if ak == "" {
		createAccessKeyInput := &rocketmq.CreateAccessKeyInput{
			AllAuthority: volcengine.String("ALL"),
			InstanceId:   volcengine.String(instanceID),
		}

		// Copy the code to run the example, please print the API return value yourself.
		_, err = svc.CreateAccessKey(createAccessKeyInput)
		if err != nil {
			return "", "", err
		}

		ak, err = getRocketMQAccessKey(instanceID)
		if err != nil {
			return "", "", err
		}
	}

	if ak == "" {
		return "", "", errors.New("[RocketMQ] CreateRocketMQAccessKey ak is empty")
	}

	describeSecretKeyInput := &rocketmq.DescribeSecretKeyInput{
		AccessKey:  volcengine.String(ak),
		InstanceId: volcengine.String(instanceID),
	}

	resp, err := svc.DescribeSecretKey(describeSecretKeyInput)
	if err != nil {
		return "", "", err
	}

	if resp.SecretKey == nil {
		return "", "", errors.New("[RocketMQ] CreateRocketMQAccessKey resp.SecretKey is nil")
	}

	return ak, *resp.SecretKey, nil
}

func CreateRocketMQTopic(ak, instanceID string) error {
	svc := rocketmq.New(sess)
	describeTopicsInput := &rocketmq.DescribeTopicsInput{
		InstanceId: volcengine.String(instanceID),
		PageNumber: volcengine.Int32(1),
		PageSize:   volcengine.Int32(100),
	}

	topicNeedCreate := map[string]bool{
		"opencoze_search_resource": true,
		"opencoze_search_app":      true,
		"opencoze_knowledge":       true,
	}

	resp, err := svc.DescribeTopics(describeTopicsInput)
	if err != nil {
		return err
	}

	for _, info := range resp.TopicsInfo {
		if info.TopicName == nil {
			continue
		}
		if topicNeedCreate[*info.TopicName] {
			topicNeedCreate[*info.TopicName] = false
		}
	}

	reqAccessPolicies := &rocketmq.AccessPolicyForCreateTopicInput{
		AccessKey: volcengine.String(ak),
		Authority: volcengine.String("ALL"),
	}

	for topicName, needCreate := range topicNeedCreate {
		if !needCreate {
			fmt.Printf("[RocketMQ] topic %s already exists, skip\n", topicName)
			continue
		}

		createTopicInput := &rocketmq.CreateTopicInput{
			AccessPolicies: []*rocketmq.AccessPolicyForCreateTopicInput{reqAccessPolicies},
			InstanceId:     volcengine.String(instanceID),
			MessageType:    volcengine.Int32(0),
			QueueNumber:    volcengine.Int32(2),
			TopicName:      volcengine.String(topicName),
		}

		// Copy the code to run the example, please print the API return value yourself.
		_, err = svc.CreateTopic(createTopicInput)
		if err != nil {
			return err
		}
		fmt.Printf("[RocketMQ] topic %s created\n", topicName)
	}

	return nil
}

func CreateRocketMQGroup(instanceID string) error {
	groupNeedCreate := map[string]bool{
		"cg_search_resource": true,
		"cg_search_app":      true,
		"cg_knowledge":       true,
	}

	svc := rocketmq.New(sess)
	describeGroupsInput := &rocketmq.DescribeGroupsInput{
		InstanceId: volcengine.String(instanceID),
		PageNumber: volcengine.Int32(1),
		PageSize:   volcengine.Int32(100),
	}

	resp, err := svc.DescribeGroups(describeGroupsInput)
	if err != nil {
		return err
	}

	for _, info := range resp.GroupsInfo {
		if info.GroupId == nil {
			continue
		}

		if groupNeedCreate[*info.GroupId] {
			groupNeedCreate[*info.GroupId] = false
		}
	}

	for groupName, needCreate := range groupNeedCreate {
		if !needCreate {
			fmt.Printf("[RocketMQ] group %s already exists, skip\n", groupName)
			continue
		}

		createGroupInput := &rocketmq.CreateGroupInput{
			GroupId:    volcengine.String(groupName),
			GroupType:  volcengine.String("TCP"),
			InstanceId: volcengine.String(instanceID),
		}

		_, err = svc.CreateGroup(createGroupInput)
		if err != nil {
			return err
		}
	}

	return nil
}
