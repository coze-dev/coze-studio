package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
	minio "github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

const (
	iconDir       = "default_icon"
	MinIO_AK      = "MINIO_AK"
	MinIO_SK      = "MINIO_SK"
	MinIOEndpoint = "MINIO_ENDPOINT"
	MinIOBucket   = "MINIO_BUCKET"
)

var (
	minioEndpoint  = "localhost:9000"
	minioAccessKey = "minioadmin"
	minioSecretKey = "minioadmin123"
	bucketName     = "opencoze"
)

func initMinioENV() {
	goPATH := os.Getenv("GOPATH")
	envPath := goPATH + "/src/code.byted.org/flow/opencoze/backend/.env"

	err := godotenv.Load(envPath)
	if err != nil {
		fmt.Println("Error loading .env file")
		// 兜底用默认的
		return
	}

	minioEndpoint = os.Getenv(MinIOEndpoint)
	minioAccessKey = os.Getenv(MinIO_AK)
	minioSecretKey = os.Getenv(MinIO_SK)
	bucketName = os.Getenv(MinIOBucket)
}

func main() {
	initMinioENV()

	iconDir := "default_icon"
	err := uploadDirectoryToMinio(bucketName, iconDir, "default_icon/")
	if err != nil {
		log.Fatalln(err)
	}
}

func uploadDirectoryToMinio(bucket, iconDir, prefix string) error {
	// Initialize MinIO client
	minioClient, err := minio.New(minioEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(minioAccessKey, minioSecretKey, ""),
		Secure: false,
	})
	if err != nil {
		return fmt.Errorf("Failed to initialize MinIO client: %v", err)
	}

	// Check if the bucket exists
	exists, errBucketExists := minioClient.BucketExists(context.Background(), bucket)
	if errBucketExists != nil {
		return fmt.Errorf("Failed to check if bucket exists: %v", errBucketExists)
	}
	if !exists {
		// Create the bucket
		err = minioClient.MakeBucket(context.Background(), bucket, minio.MakeBucketOptions{})
		if err != nil {
			return fmt.Errorf("Failed to create bucket: %v", err)
		}
		fmt.Printf("✅ Bucket %s created successfully\n", bucket)
	}

	// Check if the directory exists
	if _, err = os.Stat(iconDir); os.IsNotExist(err) {
		return fmt.Errorf("错误: 目录不存在: %s", iconDir)
	}

	// Walk through the directory
	err = filepath.Walk(iconDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			// Upload each file
			err = uploadFile(minioClient, path, bucket, prefix)
			if err == errAlreadyExists {
				fmt.Printf("✅ %s%s 文件已存在\n", prefix, info.Name())
				return nil
			}

			if err != nil {
				fmt.Printf("❌ %s 上传失败: %v\n", info.Name(), err)
			} else {
				fmt.Printf("✅ %s 上传成功\n", info.Name())
			}
		}
		return nil
	})
	if err != nil {
		return fmt.Errorf("Failed to walk through directory: %v", err)
	}

	return nil
}

var errAlreadyExists = fmt.Errorf("file already exists")

func uploadFile(client *minio.Client, filePath, bucketName, prefix string) error {
	fileName := filepath.Base(filePath)
	contentType := getContentType(fileName)

	fileName = prefix + fileName

	// Check if the file already exists in the bucket
	_, err := client.StatObject(context.Background(), bucketName, fileName, minio.StatObjectOptions{})
	if err == nil {
		return errAlreadyExists
	}

	// Upload the file
	_, err = client.FPutObject(context.Background(), bucketName, fileName, filePath, minio.PutObjectOptions{ContentType: contentType})
	return err
}

func getContentType(fileName string) string {
	switch filepath.Ext(fileName) {
	case ".png":
		return "image/png"
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".svg":
		return "image/svg+xml"
	default:
		return "application/octet-stream"
	}
}
