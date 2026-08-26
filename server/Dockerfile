# Global Dominion API Server
FROM node:20-alpine
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src/index.js ./src/index.js
COPY src/iapVerification.js ./src/iapVerification.js

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=10000
ENV DATA_DIR=/app/data

EXPOSE 10000

CMD ["node", "src/index.js"]
