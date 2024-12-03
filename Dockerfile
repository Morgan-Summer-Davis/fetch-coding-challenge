# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.10.0

FROM node:${NODE_VERSION}-alpine as tests
WORKDIR /usr/src/app
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
USER node
COPY . .
RUN npm install && npm run build && npm run test

FROM node:${NODE_VERSION}-alpine as build
WORKDIR /usr/src/app
ENV NODE_ENV production
COPY --from=tests /app/dist/src/ ./
COPY package*.json ./
RUN npm install --only=prod
EXPOSE 3000
CMD node src/server.js