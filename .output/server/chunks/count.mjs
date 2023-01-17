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

const count = defineEventHandler((event) => {
  return { api: "works" };
});

export { count as default };
//# sourceMappingURL=count.mjs.map
