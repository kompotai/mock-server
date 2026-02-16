FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server.js .
EXPOSE 4444
CMD ["node", "server.js"]
