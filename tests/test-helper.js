import resolver from './helpers/resolver';
import { start } from 'ember-cli-qunit';

start();

import {
  setResolver
} from 'ember-qunit';

setResolver(resolver);
