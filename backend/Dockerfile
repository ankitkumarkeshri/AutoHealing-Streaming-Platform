# ================= BASE IMAGE =================
FROM node:20-alpine

# ================= WORKDIR =================
WORKDIR /app

# ================= COPY PACKAGE =================
COPY package*.json ./

# ================= INSTALL DEPENDENCIES =================
RUN npm install

# ================= COPY PROJECT =================
COPY . .

# ================= INSTALL FFMPEG =================
RUN apk add --no-cache ffmpeg

# ================= EXPOSE PORT =================
EXPOSE 3000

# ================= START APP =================
CMD ["node", "server.js"]