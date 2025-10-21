# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# if you located in China, you can use aliyun mirror to speed up
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# Install bash git dos2unix for TypeScript compiler
RUN apk add --no-cache bash git dos2unix

# if you located in China, you can use aliyun mirror to speed up
RUN npm config set registry https://registry.npmmirror.com

# Copy rush.json from root directory first
COPY rush.json ./

# Install rush with retry logic
RUN npm install -g @microsoft/rush --registry=https://registry.npmjs.org

# Copy the frontend source code (excluding node_modules and build artifacts)
COPY frontend/ ./frontend/

# Copy common directory for Rush
COPY common/ ./common/

# Copy scripts directory for Rush hooks
COPY scripts/ ./scripts/

# Convert line endings for shell scripts in scripts directory to Unix format
RUN find . -name "*.sh" -type f -exec dos2unix {} \;

# Install all dependencies
RUN chmod +x scripts/hooks/post-rush-install.sh && rm -rf /app/common/temp && rush install

# Use rush build to build the specific project
RUN rush build --to @coze-studio/app

# Production image stage
FROM nginx:1.25-alpine


# if you located in China, you can use aliyun mirror to speed up
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
# Install necessary tools for SSL configuration
RUN apk add --no-cache bash

# Copy build artifacts to nginx static directory
COPY --from=builder /app/frontend/apps/coze-studio/dist /usr/share/nginx/html

EXPOSE 8888

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
