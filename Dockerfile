FROM node:alpine as build
WORKDIR /app
COPY . .
RUN npm install && \
    npm install typescript -g && \
    npm run test && \
    npm run build

FROM node:alpine as prod
WORKDIR /app
COPY --from=build /app/dist/ ./
COPY package*.json ./
RUN npm install --only=prod
EXPOSE 3000
CMD ["node", "./src/server.js"]