FROM node:fermium-alpine

RUN apk update
RUN apk add zip

# Get NPM Dependencies (done in tmp directory to improve docker caching performance)
COPY saha-web/package.json /tmp/package.json
COPY saha-web/package-lock.json /tmp/package-lock.json
RUN cd /tmp && npm install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/
RUN npm install -g serve

WORKDIR /chrome-extension-build
ADD chrome-extension ./
RUN zip -r saha-chrome-extension.zip ./*

# Build the app
WORKDIR /app 
ADD saha-web/package.json ./
ADD saha-web/tailwind.config.js ./
ADD saha-web/craco.config.js ./
ADD saha-web/public ./public
RUN mv /chrome-extension-build/saha-chrome-extension.zip ./public/
ADD saha-web/src ./src
RUN npm run build

# Copy the output, dump the source
RUN mv /app/build /_site
WORKDIR /_site
RUN rm -fR /app

# Setup & run static server
CMD ["serve"]