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
	"os"

	"github.com/volcengine/volcengine-go-sdk/service/ecs"
	"github.com/volcengine/volcengine-go-sdk/volcengine"
)

func CreateECSInstance(zoneID, sgID, subnetID, ts string) (string, error) {
	if os.Getenv("VE_ECS_INSTANCE_ID") != "" {
		return os.Getenv("VE_ECS_INSTANCE_ID"), nil
	}
	svc := ecs.New(sess)
	reqEipAddress := &ecs.EipAddressForRunInstancesInput{
		BandwidthMbps:       volcengine.Int32(10),
		ChargeType:          volcengine.String("PayByBandwidth"),
		ISP:                 volcengine.String("BGP"),
		ReleaseWithInstance: volcengine.Bool(true),
	}
	reqNetworkInterfaces := &ecs.NetworkInterfaceForRunInstancesInput{
		SecurityGroupIds: volcengine.StringSlice([]string{sgID}),
		SubnetId:         volcengine.String(subnetID),
	}
	reqTags := &ecs.TagForRunInstancesInput{
		Key:   volcengine.String("opencoze"),
		Value: volcengine.String("1"),
	}
	reqVolumes := &ecs.VolumeForRunInstancesInput{
		Size: volcengine.Int32(100),
	}

	name := "opencoze-ecs-" + ts
	runInstancesInput := &ecs.RunInstancesInput{
		DryRun:             volcengine.Bool(false),
		EipAddress:         reqEipAddress,
		Hostname:           volcengine.String("opencoze-server"),
		ImageId:            volcengine.String("image-yd6lmt386vgqef1r7xpu"),
		InstanceChargeType: volcengine.String("PostPaid"),
		InstanceName:       volcengine.String(name),
		InstanceTypeId:     volcengine.String("ecs.c4il.4xlarge"),
		NetworkInterfaces:  []*ecs.NetworkInterfaceForRunInstancesInput{reqNetworkInterfaces},
		Password:           volcengine.String(password),
		ProjectName:        volcengine.String(projectName),
		Tags:               []*ecs.TagForRunInstancesInput{reqTags},
		Volumes:            []*ecs.VolumeForRunInstancesInput{reqVolumes},
		ZoneId:             volcengine.String(zoneID),
	}

	resp, err := svc.RunInstances(runInstancesInput)
	if err != nil {
		return "", err
	}

	if len(resp.InstanceIds) == 0 {
		return "", errors.New("[ECS] InstanceIds is empty")
	}

	return *resp.InstanceIds[0], nil
}
