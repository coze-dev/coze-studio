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
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"strings"
)

func main() {
	proxyURLListString := os.Getenv("COZE_SERVER_PROXY_URL_LIST")
	if proxyURLListString == "" {
		proxyURLListString = "mysql:3306,redis:6379,elasticsearch:9200,milvus:19530,minio:9000,nsqd:4150"
	}

	proxyURLList := strings.Split(proxyURLListString, ",")
	for _, serverAddInDockerNet := range proxyURLList {
		err := listen(serverAddInDockerNet)
		if err != nil {
			fmt.Printf("listen %s failed: %v\n", serverAddInDockerNet, err)
		}
	}

	// 阻塞主程序，防止退出
	select {}
}

func listen(serverAddInDockerNet string) error {
	tcpAddr, err := net.ResolveTCPAddr("tcp", serverAddInDockerNet)
	if err != nil {
		fmt.Printf("解析失败: %v\n", err)
		return err
	}

	fmt.Printf("host %s : %s:%d\n", serverAddInDockerNet, tcpAddr.IP, tcpAddr.Port)
	localAddr := fmt.Sprintf(":%d", tcpAddr.Port)
	addr := fmt.Sprintf("%s:%d", tcpAddr.IP, tcpAddr.Port)

	go startListener(localAddr, addr)

	return nil
}

func startListener(localAddr, targetAddr string) {
	// 监听本地端口
	listener, err := net.Listen("tcp", localAddr)
	if err != nil {
		log.Printf("无法监听端口 %s: %v", localAddr, err)
		return
	}
	defer listener.Close()

	log.Printf("TCP 服务器已启动，监听端口 %s\n", localAddr)

	for {
		// 接受客户端连接
		clientConn, err := listener.Accept()
		if err != nil {
			log.Printf("接受连接失败: %v", err)
			continue
		}

		// 处理客户端连接
		go handleConnection(clientConn, targetAddr)
	}
}

func handleConnection(clientConn net.Conn, targetAddr string) {
	defer clientConn.Close()

	// 连接到目标服务器
	targetConn, err := net.Dial("tcp", targetAddr)
	if err != nil {
		log.Printf("无法连接到目标服务器 %s: %v", targetAddr, err)
		return
	}
	defer targetConn.Close()

	// 启动两个协程进行双向数据转发
	go io.Copy(targetConn, clientConn)
	io.Copy(clientConn, targetConn)
}
