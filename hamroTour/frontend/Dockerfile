FROM node:20-alpine

WORKDIR /app

ARG INTERNAL_API_URL=http://backend:8000/api
ENV INTERNAL_API_URL=${INTERNAL_API_URL}

COPY package.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
