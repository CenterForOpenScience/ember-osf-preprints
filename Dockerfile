FROM node:8

RUN apt-get update \
    && apt-get install -y \
        git \
        # Next 2 needed for yarn
        apt-transport-https \
        ca-certificates \
        # watchman
        build-essential \
        automake \
        autoconf \
        python-dev \
    && apt-get clean \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get install -y \
        yarn \
    && apt-get clean \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

ENV WATCHMAN_VERSION 4.9.0
RUN cd /tmp \
    && git clone https://github.com/facebook/watchman.git \
    && cd watchman \
    && git checkout v$WATCHMAN_VERSION \
    && ./autogen.sh \
    && ./configure --enable-statedir=/tmp \
    && make \
    && make install \
    && mv watchman /usr/local/bin/watchman \
    && rm -Rf /tmp/watchman

RUN mkdir -p /code
WORKDIR /code

COPY ./package.json ./yarn.lock /code/
RUN yarn --frozen-lockfile --ignore-engines

COPY ./.bowerrc /code/.bowerrc
COPY ./bower.json /code/bower.json
RUN ./node_modules/.bin/bower install --allow-root --config.interactive=false

COPY ./ /code/

ARG GIT_COMMIT=
ENV GIT_COMMIT ${GIT_COMMIT}

RUN ./node_modules/.bin/ember build --env ${APP_ENV}

CMD ["yarn", "start"]
