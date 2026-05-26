FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制所有源码
COPY . .

# 暴露前端端口和后端端口
EXPOSE 3000
EXPOSE 3001

# 使用 dev 脚本同时启动 Express 服务器 + Vite 前端
CMD ["npm", "run", "dev"]
