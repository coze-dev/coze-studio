package main

import (
	"fmt"
	"io"
	"log"
	"net"
)

func main() {
	listen("mysql:3306")
	listen("redis:6379")
	listen("elasticsearch:9200")
	listen("milvus:19530")
	listen("rocketmq-namesrv:9876")
	listen("rocketmq-broker:10909")
	listen("rocketmq-broker:10911")
	listen("rocketmq-broker:10912")
	listen("minio:9000")
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
