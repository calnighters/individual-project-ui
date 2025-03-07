FROM node:20-alpine
COPY ./package.json /app/
COPY ./build /app/build
COPY ./node_modules /app/node_modules

RUN npm install -g @react-router/serve
WORKDIR /app
CMD ["npm", "run", "start"]