# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package.json ./
RUN npm install --legacy-peer-deps --force

# Copy code và build
COPY . .
ENV NODE_ENV=production
RUN npm run build --force

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Chỉ copy những file cần thiết cho production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Chỉ cài đặt dependencies cho production
RUN npm install --only=production --legacy-peer-deps

EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "start"]