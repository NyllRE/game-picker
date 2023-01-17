import { d as defineEventHandler } from './nitro/node-server.mjs';
import 'node-fetch-native/polyfill';
import 'http';
import 'https';
import 'destr';
import 'ufo';
import 'ofetch';
import 'unenv/runtime/fetch/index';
import 'hookable';
import 'scule';
import 'ohash';
import 'unstorage';
import 'node:fs';
import 'node:url';
import 'pathe';

const _name_ = defineEventHandler((event) => {
  return `Hello, ${event.context.params.name}!`;
});

export { _name_ as default };
//# sourceMappingURL=_name_.mjs.map
