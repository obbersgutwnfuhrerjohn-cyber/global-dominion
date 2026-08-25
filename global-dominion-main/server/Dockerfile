# Global Dominion API — zero-dependency Node server
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY src/index.js ./src/index.js
RUN mkdir -p /app/data
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV DATA_DIR=/app/data
EXPOSE 3000
VOLUME ["/app/data"]
CMD ["node", "src/index.js"]
