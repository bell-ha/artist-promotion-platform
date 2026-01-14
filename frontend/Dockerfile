# 1단계: 빌드 (React 코드를 최적화된 JS로 변환)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2단계: 서빙 (최적화된 파일을 웹서버로 배포)
FROM nginx:stable-alpine
# 빌드된 결과물을 Nginx 폴더로 복사
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]