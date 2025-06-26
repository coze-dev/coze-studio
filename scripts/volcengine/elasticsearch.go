package main

import (
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/volcengine/volcengine-go-sdk/service/escloud"
	"github.com/volcengine/volcengine-go-sdk/volcengine"
)

func CreateESInstance(vpcID, subnetID, zoneID, ts string) (string, error) {
	if os.Getenv("VE_ES_INSTANCE_ID") != "" {
		return os.Getenv("VE_ES_INSTANCE_ID"), nil
	}
	svc := escloud.New(sess)
	reqNetworkSpecs := &escloud.NetworkSpecForCreateInstanceInOneStepInput{
		Bandwidth: volcengine.Int32(10),
		IsOpen:    volcengine.Bool(true),
		SpecName:  volcengine.String("es.eip.bgp_fixed_bandwidth"),
		Type:      volcengine.String("Kibana"),
	}
	reqExtraPerformance := &escloud.ExtraPerformanceForCreateInstanceInOneStepInput{
		Throughput: volcengine.Int32(0),
	}
	reqNodeSpecsAssigns := &escloud.NodeSpecsAssignForCreateInstanceInOneStepInput{
		ExtraPerformance: reqExtraPerformance,
		Number:           volcengine.Int32(1),
		ResourceSpecName: volcengine.String("kibana.x2.small"),
		StorageSize:      volcengine.Int32(0),
		Type:             volcengine.String("Kibana"),
	}

	reqNodeSpecsAssigns1 := &escloud.NodeSpecsAssignForCreateInstanceInOneStepInput{
		ExtraPerformance: reqExtraPerformance,
		Number:           volcengine.Int32(1),
		ResourceSpecName: volcengine.String("es.x2.medium"),
		StorageSize:      volcengine.Int32(30),
		StorageSpecName:  volcengine.String("es.volume.essd.pl0"),
		Type:             volcengine.String("Hot"),
	}
	reqSubnet := &escloud.SubnetForCreateInstanceInOneStepInput{
		SubnetId: volcengine.String(subnetID),
	}
	reqVPC := &escloud.VPCForCreateInstanceInOneStepInput{
		VpcId: volcengine.String(vpcID),
	}
	name := "opencoze-es-" + ts
	reqInstanceConfiguration := &escloud.InstanceConfigurationForCreateInstanceInOneStepInput{
		AdminPassword:      volcengine.String(password),
		ChargeType:         volcengine.String("PostPaid"),
		EnableHttps:        volcengine.Bool(false),
		EnablePureMaster:   volcengine.Bool(false),
		InstanceName:       volcengine.String(name),
		NetworkSpecs:       []*escloud.NetworkSpecForCreateInstanceInOneStepInput{reqNetworkSpecs},
		NodeSpecsAssigns:   []*escloud.NodeSpecsAssignForCreateInstanceInOneStepInput{reqNodeSpecsAssigns, reqNodeSpecsAssigns1},
		ProjectName:        volcengine.String(projectName),
		RegionId:           volcengine.String(region),
		Subnet:             reqSubnet,
		VPC:                reqVPC,
		Version:            volcengine.String("V7_10"),
		ZoneId:             volcengine.String(zoneID),
		DeletionProtection: volcengine.Bool(false),
	}
	reqTags := &escloud.TagForCreateInstanceInOneStepInput{
		Key:   volcengine.String("opencoze"),
		Value: volcengine.String("1"),
	}
	createInstanceInOneStepInput := &escloud.CreateInstanceInOneStepInput{
		InstanceConfiguration: reqInstanceConfiguration,
		Tags:                  []*escloud.TagForCreateInstanceInOneStepInput{reqTags},
	}

	resp, err := svc.CreateInstanceInOneStep(createInstanceInOneStepInput)
	if err != nil {
		return "", err
	}

	if resp.InstanceId == nil {
		return "", errors.New("InstanceId is empty")
	}

	return *resp.InstanceId, nil
}

func GetESConnectAddress(instanceID string) (string, error) {
	svc := escloud.New(sess)
	describeInstanceInput := &escloud.DescribeInstanceInput{
		InstanceId: volcengine.String(instanceID),
	}

	for {
		resp, err := svc.DescribeInstance(describeInstanceInput)
		if resp.InstanceInfo != nil && resp.InstanceInfo.Status != nil && *resp.InstanceInfo.Status != "Running" {
			fmt.Printf("[Elasticsearch] instance(%s) is %s, waiting for it to become ready... \n", instanceID, *resp.InstanceInfo.Status)
			time.Sleep(retryTime)
			continue
		}

		if err != nil {
			log.Printf("[Elasticsearch] will retry get es instance = %s failed, err= %s\n", instanceID, err.Error())
			time.Sleep(retryTime)
			continue
		}

		if resp.InstanceInfo.ESPrivateEndpoint == nil {
			log.Printf("[Elasticsearch] DescribeInstanceDetail resp.InstanceInfo.ESPrivateEndpoint is empty, will retry")
			time.Sleep(retryTime)
			continue
		}

		return *resp.InstanceInfo.ESPrivateEndpoint, nil
	}
}
