FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm ci

EXPOSE 3000

ENTRYPOINT ["sh", "docker-start.sh"]