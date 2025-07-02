
# base image
FROM node:18-alpine

# work dir
WORKDIR /app

# copy packages and stuff
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# copy files
COPY . .

# prisma client generation
RUN pnpm db:generate

# build
RUN pnpm build

# copy entrypoint script
COPY docker-entrypoint.sh .
RUN apk add --no-cache dos2unix && dos2unix docker-entrypoint.sh && chmod +x docker-entrypoint.sh

# expose port
EXPOSE 3000

# set entrypoint
# Set entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]

# start
CMD ["pnpm", "start"]
