# https://github.com/mhart/alpine-node
FROM mhart/alpine-node:7

ENV DIR=/opt/este PORT=8000 SERVER_URL=https://api.example.net NODE_ENV=production GOOGLE_ANALYTICS_ID=UA-87654321-0

COPY . $DIR

# Installs (and removes) python and build deps for source builds, ex. node-sass.
# Removing in the same instruction reduces image size bloat.
RUN apk add --update python python-dev build-base tar && \
  apk add --no-cache --virtual .yarn-deps curl gnupg && \
  touch ${HOME}/.bashrc && curl -o- -L https://yarnpkg.com/install.sh | sh && export PATH="$HOME/.yarn/bin:$PATH" && \
  echo "# SUPPRESS WARNING" > ${DIR}/README.md && \
  cd ${DIR} && npm install -g gulp-cli && yarn install && gulp eslint-ci jest && \
  npm uninstall -g gulp-cli && apk del python python-dev build-base tar .yarn-deps curl gnupg && \
  rm -rf /etc/ssl /usr/share/man /tmp/* /var/cache/apk/* /root/.yarn /root/.npm /root/.node-gyp

WORKDIR $DIR

EXPOSE $PORT

ENTRYPOINT ["npm"]

CMD ["start"]
