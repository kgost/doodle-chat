FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Bundle app source
COPY . .

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

ENV JWTKEY="there is a jeff out there"
ENV PRIVATE_VAPID_KEY=""
ENV PORT=8080

CMD [ "node", "app.js" ]
