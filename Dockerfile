FROM node:5

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
RUN ./node_modules/ember-cli/bin/ember build --env ${APP_ENV}

CMD ["node"]
