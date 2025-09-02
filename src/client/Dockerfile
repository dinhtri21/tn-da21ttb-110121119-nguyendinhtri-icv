FROM node:18-alpine

WORKDIR /app

# Nhận build args từ docker-compose.yml
ARG NEXT_PUBLIC_API
ENV NEXT_PUBLIC_API=$NEXT_PUBLIC_API

# Copy file cấu hình package và cài đặt dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy toàn bộ source code
COPY . .

# Build Next.js
RUN npm run build

# Mở port 3000
EXPOSE 3000

# Chạy app
CMD ["npm", "start"]
