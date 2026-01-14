# 1단계: 빌드 (동일)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# 2단계: 서빙 (수정됨: unprivileged 이미지 사용)
FROM nginxinc/nginx-unprivileged:stable-alpine
# 빌드된 결과물을 Nginx 폴더로 복사
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
# 비특권 이미지는 기본적으로 8080 포트를 사용합니다.
CMD ["nginx", "-g", "daemon off;"]