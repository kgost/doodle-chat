FROM node:12 AS build-env

RUN npm -g config set user root

RUN npm i -g grunt-cli
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Bundle app source
COPY . .

RUN npm install
RUN npm run build

WORKDIR /usr/src/app/dist
# If you are building your code for production
# RUN npm ci --only=production

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
COPY --from=build-env /usr/src/app/dist /usr/share/nginx/html
