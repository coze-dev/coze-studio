package main

import (
	"fmt"
	"os"
	"text/tabwriter"

	"github.com/volcengine/volcengine-go-sdk/service/rocketmq"
)

func GetChosenZoneID() (string, error) {
	zoneID := os.Getenv("VE_ZONE_ID")
	if zoneID != "" {
		return zoneID, nil
	}

	resp, err := listZoneInfos()
	if err != nil {
		return "", err
	}

	return chooseZone(resp), nil
}

func chooseZone(resp *rocketmq.DescribeAvailabilityZonesOutput) string {
	fmt.Printf("Please choose a zone id in list: ")
	var zoneId string
	fmt.Scanln(&zoneId)

	// zoneId := "cn-beijing-a"
	var found bool
	for _, zone := range resp.Zones {
		if zoneId == s(zone.ZoneId) {
			found = true
			break
		}
	}
	if !found {
		fmt.Printf("Zone id %s does not exist, please choose again\n", zoneId)
		return chooseZone(resp)
	}

	return zoneId
}

func listZoneInfos() (*rocketmq.DescribeAvailabilityZonesOutput, error) {
	svc := rocketmq.New(sess)

	resp, err := svc.DescribeAvailabilityZones(&rocketmq.DescribeAvailabilityZonesInput{})
	if err != nil {
		return nil, err
	}

	fmt.Printf("AvailabilityZones:\n")
	w := tabwriter.NewWriter(os.Stdout, 0, 0, 4, ' ', 0)
	fmt.Fprintln(w, "Zone\tZoneID\tStatus\tDescription")
	for _, zone := range resp.Zones {
		fmt.Fprintf(w, "%s\t%s\t%s\t%s\n", s(zone.ZoneName), s(zone.ZoneId), s(zone.ZoneStatus), s(zone.Description))
	}
	w.Flush()

	return resp, nil
}
