FROM node:fermium-alpine

RUN apk update
RUN apk add zip

# Get NPM Dependencies (done in tmp directory to improve docker caching performance)
COPY package.json /tmp/package.json
COPY package-lock.json /tmp/package-lock.json
RUN cd /tmp && npm install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/
RUN npm install -g serve

# Build the app
WORKDIR /app
ADD package.json ./
ADD tailwind.config.js ./
ADD craco.config.js ./
ADD public ./public
ADD src ./src
RUN npm run build

# Copy the output, dump the source
RUN mv /app/build /_site
WORKDIR /_site
RUN rm -fR /app

# Setup & run static server
CMD ["serve"]