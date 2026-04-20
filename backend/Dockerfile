
FROM node:20-alpine


WORKDIR /app


COPY package*.json ./

RUN npm install


COPY . .


RUN apk add --no-cache ffmpeg


EXPOSE 3000

CMD ["node", "server.js"]