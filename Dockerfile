FROM node:6

RUN apt-get update \
    && apt-get install -y \
        git \
        # watchman
        build-essential \
        automake \
        autoconf \
        python-dev \
    && apt-get clean \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

ENV WATCHMAN_VERSION 4.7.0
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

COPY ./package.json /code/package.json
RUN npm install

COPY ./.bowerrc /code/.bowerrc
COPY ./bower.json /code/bower.json
RUN ./node_modules/bower/bin/bower install --allow-root --config.interactive=false

COPY ./ /code/

ARG GIT_COMMIT=
ENV GIT_COMMIT ${GIT_COMMIT}

ARG APP_ENV=production
ENV APP_ENV ${APP_ENV}
ARG BACKEND=local
ENV BACKEND ${BACKEND}
RUN ./node_modules/ember-cli/bin/ember build --env ${APP_ENV}

CMD ["node"]
