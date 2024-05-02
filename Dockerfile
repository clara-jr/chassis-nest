# Image with node and npm from Docker Hub
FROM node:22.1.0
# Create app directory
WORKDIR /usr/src/app
# Bundle app source
COPY . .
# Install app dependencies
RUN npm install
# Run app
EXPOSE 8080
CMD [ "npm", "run", "start" ]