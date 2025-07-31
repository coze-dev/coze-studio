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

	"github.com/volcengine/volcengine-go-sdk/service/vpc"
	"github.com/volcengine/volcengine-go-sdk/volcengine"
)

func CreatePrivateNetwork(vName, ts, zoneID string) (string, error) {
	if os.Getenv("VE_VPC_ID") != "" {
		return os.Getenv("VE_VPC_ID"), nil
	}

	svc := vpc.New(sess)

	reqTags := &vpc.TagForCreateVpcInput{
		Key:   volcengine.String("opencoze"),
		Value: volcengine.String("1"),
	}

	newVpcName := vName + ts
	createVpcInput := &vpc.CreateVpcInput{
		CidrBlock:   volcengine.String("172.16.0.0/12"),
		ClientToken: volcengine.String(newVpcName),
		ProjectName: volcengine.String(projectName),
		Tags:        []*vpc.TagForCreateVpcInput{reqTags},
		VpcName:     volcengine.String(newVpcName),
	}

	resp, err := svc.CreateVpc(createVpcInput)
	if err != nil {
		return "", err
	}

	if resp.VpcId == nil {
		return "", errors.New("[VPC] VpcId is empty")
	}

	return *resp.VpcId, nil
}

func CheckVpcStatus(vpcID string) {
	svc := vpc.New(sess)

	describeVpcAttributesInput := &vpc.DescribeVpcAttributesInput{
		VpcId: volcengine.String(vpcID),
	}

	for {
		resp, err := svc.DescribeVpcAttributes(describeVpcAttributesInput)
		if resp.Status != nil && *resp.Status != "Available" {
			fmt.Printf("[VPC] VPC(%s) is %s, waiting for it to become ready... \n", vpcID, *resp.Status)
			time.Sleep(retryTime)
			continue
		}
		if err != nil {
			fmt.Printf("[VPC] get vpc id = %s failed, err= %s will retry\n", vpcID, err.Error())
			time.Sleep(retryTime)
			continue
		}

		if resp.Status == nil {
			fmt.Printf("[VPC] get vpc id = %s failed, status is nil will retry\n", vpcID)
			time.Sleep(retryTime)
			continue
		}

		if *resp.Status == "Available" {
			break
		}
	}
}

func CreateSubnet(vName, ts, vpcID, zoneID string) (string, error) {
	if os.Getenv("VE_SUBNET_ID") != "" {
		return os.Getenv("VE_SUBNET_ID"), nil
	}

	reqSubTags := &vpc.TagForCreateSubnetInput{
		Key:   volcengine.String("opencoze"),
		Value: volcengine.String("1"),
	}

	newSubnetName := vName + "-subnet-" + ts
	createSubnetInput := &vpc.CreateSubnetInput{
		CidrBlock:   volcengine.String("172.16.0.0/24"),
		ClientToken: volcengine.String(newSubnetName),
		SubnetName:  volcengine.String(newSubnetName),
		Tags:        []*vpc.TagForCreateSubnetInput{reqSubTags},
		VpcId:       volcengine.String(vpcID),
		ZoneId:      volcengine.String(zoneID),
	}

	svc := vpc.New(sess)
	resp, err := svc.CreateSubnet(createSubnetInput)
	if err != nil {
		return "", err
	}

	if resp.SubnetId == nil {
		return "", errors.New("[Subnet] SubnetId is empty")
	}

	return *resp.SubnetId, nil
}

func CreateNetworkACL(vName, ts, vpcID string) (string, error) {
	if os.Getenv("VE_ACL_ID") != "" {
		return os.Getenv("VE_ACL_ID"), nil
	}

	svc := vpc.New(sess)

	reqTags := &vpc.TagForCreateNetworkAclInput{
		Key:   volcengine.String("opencoze"),
		Value: volcengine.String("1"),
	}

	newACLName := vName + "-acl-" + ts

	createNetworkAclInput := &vpc.CreateNetworkAclInput{
		NetworkAclName: volcengine.String(newACLName),
		ProjectName:    volcengine.String(projectName),
		Tags:           []*vpc.TagForCreateNetworkAclInput{reqTags},
		VpcId:          volcengine.String(vpcID),
	}

	resp, err := svc.CreateNetworkAcl(createNetworkAclInput)
	if err != nil {
		return "", err
	}

	if resp.NetworkAclId == nil {
		return "", errors.New("NetworkAclId is empty")
	}

	return *resp.NetworkAclId, nil
}

func CheckACLStatus(aclID string) {
	svc := vpc.New(sess)

	describeNetworkAclAttributesInput := &vpc.DescribeNetworkAclAttributesInput{
		NetworkAclId: volcengine.String(aclID),
	}

	for {
		resp, err := svc.DescribeNetworkAclAttributes(describeNetworkAclAttributesInput)
		if resp.NetworkAclAttribute != nil && resp.NetworkAclAttribute.Status != nil && *resp.NetworkAclAttribute.Status != "Available" {
			fmt.Printf("[ACL] ACL(%s) is %s, waiting for it to become ready... \n", aclID, *resp.NetworkAclAttribute.Status)
			time.Sleep(retryTime)
			continue
		}

		if err != nil {
			fmt.Printf("[ACL] will retry get acl = %s failed, err= %s\n", aclID, err.Error())
			time.Sleep(retryTime)
			continue
		}

		if resp.NetworkAclAttribute == nil || resp.NetworkAclAttribute.Status == nil {
			fmt.Printf("[ACL] ACL(%s) Status is nil, will retry\n", aclID)
			time.Sleep(retryTime)
			continue
		}

		if *resp.NetworkAclAttribute.Status == "Available" {
			break
		}
	}
}

func AttachSubnetToACL(aclID, subnetID string) error {
	svc := vpc.New(sess)

	reqResource := &vpc.ResourceForAssociateNetworkAclInput{
		ResourceId: volcengine.String(subnetID),
	}
	associateNetworkAclInput := &vpc.AssociateNetworkAclInput{
		NetworkAclId: volcengine.String(aclID),
		Resource:     []*vpc.ResourceForAssociateNetworkAclInput{reqResource},
	}

	resp, err := svc.AssociateNetworkAcl(associateNetworkAclInput)
	if resp.Metadata != nil && resp.Metadata.Error != nil &&
		resp.Metadata.Error.Code == "InvalidResource.Associated" {
		return nil
	}

	if err != nil {
		return err
	}

	return nil
}

func CreateSafeGroup(ts, vpcID string) (string, error) {
	if os.Getenv("VE_SAFE_GROUP_ID") != "" {
		return os.Getenv("VE_SAFE_GROUP_ID"), nil
	}

	svc := vpc.New(sess)
	reqTags := &vpc.TagForCreateSecurityGroupInput{
		Key:   volcengine.String("opencoze"),
		Value: volcengine.String("1"),
	}
	createSecurityGroupInput := &vpc.CreateSecurityGroupInput{
		ProjectName:       volcengine.String(projectName),
		SecurityGroupName: volcengine.String("opencoze-sg-" + ts),
		Tags:              []*vpc.TagForCreateSecurityGroupInput{reqTags},
		VpcId:             volcengine.String(vpcID),
	}

	resp, err := svc.CreateSecurityGroup(createSecurityGroupInput)
	if err != nil {
		return "", err
	}

	if resp.SecurityGroupId == nil {
		return "", errors.New("SecurityGroupId is empty")
	}

	return *resp.SecurityGroupId, nil
}

func CheckSafeGroupStatus(sgID string) {
	for {
		svc := vpc.New(sess)
		describeSecurityGroupAttributesInput := &vpc.DescribeSecurityGroupAttributesInput{
			SecurityGroupId: volcengine.String(sgID),
		}

		// Copy the code to run the example, please print the API return value yourself.
		resp, err := svc.DescribeSecurityGroupAttributes(describeSecurityGroupAttributesInput)
		if err != nil {
			fmt.Printf("[SafeGroup] will retry get safe group = %s failed, err= %s\n", sgID, err.Error())
			time.Sleep(retryTime)
			continue
		}

		if resp.Status == nil || *resp.Status != "Available" {
			fmt.Printf("[SafeGroup] safe group(%s) is %s, waiting for it to become ready... \n", sgID, *resp.Status)
			time.Sleep(retryTime)
			continue
		}

		break
	}
}

func CreateSafeGroupRule(sgID string) error {
	svc := vpc.New(sess)

	type Rule struct {
		PortStart int64
		PortEnd   int64
		Protocol  string
	}

	defaultRules := []Rule{
		{
			PortStart: 8000,
			PortEnd:   10000,
			Protocol:  "tcp",
		},
		{
			PortStart: 80,
			PortEnd:   80,
			Protocol:  "tcp",
		},
		{
			PortStart: 22,
			PortEnd:   22,
			Protocol:  "tcp",
		},
		{
			PortStart: 443,
			PortEnd:   443,
			Protocol:  "tcp",
		},
		{
			PortStart: 3389,
			PortEnd:   3389,
			Protocol:  "tcp",
		},

		{
			PortStart: -1,
			PortEnd:   -1,
			Protocol:  "ALL",
		},
	}

	for _, rule := range defaultRules {
		authorizeSecurityGroupIngressInput := &vpc.AuthorizeSecurityGroupIngressInput{
			CidrIp:          volcengine.String("0.0.0.0/0"),
			PortEnd:         volcengine.Int64(rule.PortEnd),
			PortStart:       volcengine.Int64(rule.PortStart),
			Protocol:        volcengine.String(rule.Protocol),
			SecurityGroupId: volcengine.String(sgID),
		}

		if rule.PortStart == -1 {
			authorizeSecurityGroupIngressInput.SourceGroupId = &sgID
			authorizeSecurityGroupIngressInput.CidrIp = nil
		}

		resp, err := svc.AuthorizeSecurityGroupIngress(authorizeSecurityGroupIngressInput)
		if resp != nil && resp.Metadata != nil && resp.Metadata.Error != nil &&
			resp.Metadata.Error.Code == "InvalidSecurityRule.Conflict" {
			continue
		}
		if err != nil {
			return err
		}
	}

	return nil
}
