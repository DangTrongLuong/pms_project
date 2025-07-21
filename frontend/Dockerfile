# Sử dụng Node.js làm base image để build React
FROM node:18 AS build

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Build ứng dụng React
RUN npm run build

# Sử dụng Nginx để phục vụ file tĩnh
FROM nginx:alpine

# Copy file build từ bước trước vào Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy tệp cấu hình Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cổng mà Nginx chạy
EXPOSE 80

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]