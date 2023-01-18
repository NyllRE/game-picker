globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import 'node-fetch-native/polyfill';
import { Server as Server$1 } from 'http';
import { Server } from 'https';
import destr from 'destr';
import { eventHandler, setHeaders, sendRedirect, defineEventHandler, handleCacheHeaders, createEvent, getRequestHeader, getRequestHeaders, setResponseHeader, createError, createApp, createRouter as createRouter$1, lazyEventHandler, toNodeListener } from 'h3';
import { createFetch as createFetch$1, Headers } from 'ofetch';
import { createCall, createFetch } from 'unenv/runtime/fetch/index';
import { createHooks } from 'hookable';
import { snakeCase } from 'scule';
import { hash } from 'ohash';
import { parseURL, joinURL, withQuery, withLeadingSlash, withoutTrailingSlash } from 'ufo';
import { createStorage } from 'unstorage';
import defu from 'defu';
import { toRouteMatcher, createRouter } from 'radix3';
import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'pathe';

const _runtimeConfig = {"app":{"baseURL":"/","buildAssetsDir":"/_nuxt/","cdnURL":""},"nitro":{"routeRules":{"/__nuxt_error":{"cache":false}},"envPrefix":"NUXT_"},"public":{"pwaManifest":{"name":"nuxt-ionic-playground","short_name":"nuxt-ionic-playground","lang":"en","start_url":"/?standalone=true","display":"standalone","background_color":"#ffffff","theme_color":"#000000","icons":[{"src":"/_nuxt/icons/64x64.405b10f0.png","type":"image/png","sizes":"64x64","purpose":"any"},{"src":"/_nuxt/icons/64x64.maskable.405b10f0.png","type":"image/png","sizes":"64x64","purpose":"maskable"},{"src":"/_nuxt/icons/120x120.405b10f0.png","type":"image/png","sizes":"120x120","purpose":"any"},{"src":"/_nuxt/icons/120x120.maskable.405b10f0.png","type":"image/png","sizes":"120x120","purpose":"maskable"},{"src":"/_nuxt/icons/144x144.405b10f0.png","type":"image/png","sizes":"144x144","purpose":"any"},{"src":"/_nuxt/icons/144x144.maskable.405b10f0.png","type":"image/png","sizes":"144x144","purpose":"maskable"},{"src":"/_nuxt/icons/152x152.405b10f0.png","type":"image/png","sizes":"152x152","purpose":"any"},{"src":"/_nuxt/icons/152x152.maskable.405b10f0.png","type":"image/png","sizes":"152x152","purpose":"maskable"},{"src":"/_nuxt/icons/192x192.405b10f0.png","type":"image/png","sizes":"192x192","purpose":"any"},{"src":"/_nuxt/icons/192x192.maskable.405b10f0.png","type":"image/png","sizes":"192x192","purpose":"maskable"},{"src":"/_nuxt/icons/384x384.405b10f0.png","type":"image/png","sizes":"384x384","purpose":"any"},{"src":"/_nuxt/icons/384x384.maskable.405b10f0.png","type":"image/png","sizes":"384x384","purpose":"maskable"},{"src":"/_nuxt/icons/512x512.405b10f0.png","type":"image/png","sizes":"512x512","purpose":"any"},{"src":"/_nuxt/icons/512x512.maskable.405b10f0.png","type":"image/png","sizes":"512x512","purpose":"maskable"}]}}};
const ENV_PREFIX = "NITRO_";
const ENV_PREFIX_ALT = _runtimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_";
const getEnv = (key) => {
  const envKey = snakeCase(key).toUpperCase();
  return destr(process.env[ENV_PREFIX + envKey] ?? process.env[ENV_PREFIX_ALT + envKey]);
};
function isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function overrideConfig(obj, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey);
    if (isObject(obj[key])) {
      if (isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
      }
      overrideConfig(obj[key], subKey);
    } else {
      obj[key] = envValue ?? obj[key];
    }
  }
}
overrideConfig(_runtimeConfig);
const config$1 = deepFreeze(_runtimeConfig);
const useRuntimeConfig = () => config$1;
function deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }
  return Object.freeze(object);
}

const globalTiming = globalThis.__timing__ || {
  start: () => 0,
  end: () => 0,
  metrics: []
};
const timingMiddleware = eventHandler((event) => {
  const start = globalTiming.start();
  const _end = event.res.end;
  event.res.end = function(chunk, encoding, cb) {
    const metrics = [["Generate", globalTiming.end(start)], ...globalTiming.metrics];
    const serverTiming = metrics.map((m) => `-;dur=${m[1]};desc="${encodeURIComponent(m[0])}"`).join(", ");
    if (!event.res.headersSent) {
      event.res.setHeader("Server-Timing", serverTiming);
    }
    _end.call(event.res, chunk, encoding, cb);
    return this;
  }.bind(event.res);
});

const _assets = {

};

function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
}

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

const storage = createStorage({});

const useStorage = () => storage;

storage.mount('/assets', assets$1);

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(createRouter({ routes: config.nitro.routeRules }));
function createRouteRulesHandler() {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      return sendRedirect(event, routeRules.redirect.to, routeRules.redirect.statusCode);
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    const path = new URL(event.req.url, "http://localhost").pathname;
    event.context._nitro.routeRules = getRouteRulesForPath(path);
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

const defaultCacheOptions = {
  name: "_",
  base: "/cache",
  swr: true,
  maxAge: 1
};
function defineCachedFunction(fn, opts) {
  opts = { ...defaultCacheOptions, ...opts };
  const pending = {};
  const group = opts.group || "nitro";
  const name = opts.name || fn.name || "_";
  const integrity = hash([opts.integrity, fn, opts]);
  const validate = opts.validate || (() => true);
  async function get(key, resolver) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    const entry = await useStorage().getItem(cacheKey) || {};
    const ttl = (opts.maxAge ?? opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || !validate(entry);
    const _resolve = async () => {
      if (!pending[key]) {
        entry.value = void 0;
        entry.integrity = void 0;
        entry.mtime = void 0;
        entry.expires = void 0;
        pending[key] = Promise.resolve(resolver());
      }
      entry.value = await pending[key];
      entry.mtime = Date.now();
      entry.integrity = integrity;
      delete pending[key];
      if (validate(entry)) {
        useStorage().setItem(cacheKey, entry).catch((error) => console.error("[nitro] [cache]", error));
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (opts.swr && entry.value) {
      _resolvePromise.catch(console.error);
      return Promise.resolve(entry);
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const key = (opts.getKey || getKey)(...args);
    const entry = await get(key, () => fn(...args));
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
const cachedFunction = defineCachedFunction;
function getKey(...args) {
  return args.length ? hash(args, {}) : "";
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions) {
  const _opts = {
    ...opts,
    getKey: (event) => {
      const url = event.req.originalUrl || event.req.url;
      const friendlyName = decodeURI(parseURL(url).pathname).replace(/[^a-zA-Z0-9]/g, "").substring(0, 16);
      const urlHash = hash(url);
      return `${friendlyName}.${urlHash}`;
    },
    validate: (entry) => {
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: [
      opts.integrity,
      handler
    ]
  };
  const _cachedHandler = cachedFunction(async (incomingEvent) => {
    const reqProxy = cloneWithProxy(incomingEvent.req, { headers: {} });
    const resHeaders = {};
    let _resSendBody;
    const resProxy = cloneWithProxy(incomingEvent.res, {
      statusCode: 200,
      getHeader(name) {
        return resHeaders[name];
      },
      setHeader(name, value) {
        resHeaders[name] = value;
        return this;
      },
      getHeaderNames() {
        return Object.keys(resHeaders);
      },
      hasHeader(name) {
        return name in resHeaders;
      },
      removeHeader(name) {
        delete resHeaders[name];
      },
      getHeaders() {
        return resHeaders;
      },
      end(chunk, arg2, arg3) {
        if (typeof chunk === "string") {
          _resSendBody = chunk;
        }
        if (typeof arg2 === "function") {
          arg2();
        }
        if (typeof arg3 === "function") {
          arg3();
        }
        return this;
      },
      write(chunk, arg2, arg3) {
        if (typeof chunk === "string") {
          _resSendBody = chunk;
        }
        if (typeof arg2 === "function") {
          arg2();
        }
        if (typeof arg3 === "function") {
          arg3();
        }
        return this;
      },
      writeHead(statusCode, headers2) {
        this.statusCode = statusCode;
        if (headers2) {
          for (const header in headers2) {
            this.setHeader(header, headers2[header]);
          }
        }
        return this;
      }
    });
    const event = createEvent(reqProxy, resProxy);
    event.context = incomingEvent.context;
    const body = await handler(event) || _resSendBody;
    const headers = event.res.getHeaders();
    headers.etag = headers.Etag || headers.etag || `W/"${hash(body)}"`;
    headers["last-modified"] = headers["Last-Modified"] || headers["last-modified"] || new Date().toUTCString();
    const cacheControl = [];
    if (opts.swr) {
      if (opts.maxAge) {
        cacheControl.push(`s-maxage=${opts.maxAge}`);
      }
      if (opts.staleMaxAge) {
        cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
      } else {
        cacheControl.push("stale-while-revalidate");
      }
    } else if (opts.maxAge) {
      cacheControl.push(`max-age=${opts.maxAge}`);
    }
    if (cacheControl.length) {
      headers["cache-control"] = cacheControl.join(", ");
    }
    const cacheEntry = {
      code: event.res.statusCode,
      headers,
      body
    };
    return cacheEntry;
  }, _opts);
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(event);
    if (event.res.headersSent || event.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.res.statusCode = response.code;
    for (const name in response.headers) {
      event.res.setHeader(name, response.headers[name]);
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const _6sYZn6aD3a = (function(nitro) {
  nitro.hooks.hook("render:html", (htmlContext) => {
    htmlContext.head.push(
      [
        "<script>",
        "if ('serviceWorker' in navigator) {",
        `  window.addEventListener('load', () => navigator.serviceWorker.register('${joinURL(useRuntimeConfig().app.baseURL, "sw.js")}'))`,
        "}",
        "<\/script>"
      ].join("\n")
    );
  });
});

const plugins = [
  _6sYZn6aD3a
];

function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function isJsonRequest(event) {
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || event.req.url?.endsWith(".json") || event.req.url?.includes("/api/");
}
function normalizeError(error) {
  const cwd = process.cwd();
  const stack = (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Not Found" : "");
  const message = error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}

const errorHandler = (async function errorhandler(error, event) {
  const { stack, statusCode, statusMessage, message } = normalizeError(error);
  const errorObject = {
    url: event.node.req.url,
    statusCode,
    statusMessage,
    message,
    stack: "",
    data: error.data
  };
  event.node.res.statusCode = errorObject.statusCode !== 200 && errorObject.statusCode || 500;
  if (errorObject.statusMessage) {
    event.node.res.statusMessage = errorObject.statusMessage;
  }
  if (error.unhandled || error.fatal) {
    const tags = [
      "[nuxt]",
      "[request error]",
      error.unhandled && "[unhandled]",
      error.fatal && "[fatal]",
      Number(errorObject.statusCode) !== 200 && `[${errorObject.statusCode}]`
    ].filter(Boolean).join(" ");
    console.error(tags, errorObject.message + "\n" + stack.map((l) => "  " + l.text).join("  \n"));
  }
  if (isJsonRequest(event)) {
    event.node.res.setHeader("Content-Type", "application/json");
    event.node.res.end(JSON.stringify(errorObject));
    return;
  }
  const isErrorPage = event.node.req.url?.startsWith("/__nuxt_error");
  const res = !isErrorPage ? await useNitroApp().localFetch(withQuery(joinURL(useRuntimeConfig().app.baseURL, "/__nuxt_error"), errorObject), {
    headers: getRequestHeaders(event),
    redirect: "manual"
  }).catch(() => null) : null;
  if (!res) {
    const { template } = await import('../error-500.mjs');
    event.node.res.setHeader("Content-Type", "text/html;charset=UTF-8");
    event.node.res.end(template(errorObject));
    return;
  }
  for (const [header, value] of res.headers.entries()) {
    setResponseHeader(event, header, value);
  }
  if (res.status && res.status !== 200) {
    event.node.res.statusCode = res.status;
  }
  if (res.statusText) {
    event.node.res.statusMessage = res.statusText;
  }
  event.node.res.end(await res.text());
});

const assets = {
  "/icon.png": {
    "type": "image/png",
    "etag": "\"715-2yYzOmjmD+fHwIvoccZu7TlcLFI\"",
    "mtime": "2023-01-17T20:53:43.084Z",
    "size": 1813,
    "path": "../public/icon.png"
  },
  "/sw.js": {
    "type": "application/javascript",
    "etag": "\"5a2-l8fKxp+EeYRWHojyorrxEV5RUi8\"",
    "mtime": "2023-01-17T20:53:43.002Z",
    "size": 1442,
    "path": "../public/sw.js"
  },
  "/_nuxt/composables.2eda92bb.js": {
    "type": "application/javascript",
    "etag": "\"61-lqcOf6CkUI2YhvbPlfLd9MN5UI4\"",
    "mtime": "2023-01-17T20:53:43.083Z",
    "size": 97,
    "path": "../public/_nuxt/composables.2eda92bb.js"
  },
  "/_nuxt/entry.39fcf656.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2aaa-IWE1NkZCghmrWmyPDy51Oqh5cXA\"",
    "mtime": "2023-01-17T20:53:43.083Z",
    "size": 10922,
    "path": "../public/_nuxt/entry.39fcf656.css"
  },
  "/_nuxt/entry.ec259545.js": {
    "type": "application/javascript",
    "etag": "\"6fc70-eqwzCRH5XhCBw9D2GAZJA9QEhWc\"",
    "mtime": "2023-01-17T20:53:43.082Z",
    "size": 457840,
    "path": "../public/_nuxt/entry.ec259545.js"
  },
  "/_nuxt/error-404.23f2309d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"e2e-ivsbEmi48+s9HDOqtrSdWFvddYQ\"",
    "mtime": "2023-01-17T20:53:43.079Z",
    "size": 3630,
    "path": "../public/_nuxt/error-404.23f2309d.css"
  },
  "/_nuxt/error-404.bfb70f0b.js": {
    "type": "application/javascript",
    "etag": "\"8d5-BLZ283K0W++K7ChDsQgdZbOSGG8\"",
    "mtime": "2023-01-17T20:53:43.078Z",
    "size": 2261,
    "path": "../public/_nuxt/error-404.bfb70f0b.js"
  },
  "/_nuxt/error-500.aa16ed4d.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"79e-7j4Tsx89siDo85YoIs0XqsPWmPI\"",
    "mtime": "2023-01-17T20:53:43.077Z",
    "size": 1950,
    "path": "../public/_nuxt/error-500.aa16ed4d.css"
  },
  "/_nuxt/error-500.e1036cbc.js": {
    "type": "application/javascript",
    "etag": "\"77d-sFJUCiK5u5AF3gIU7bK45u5yKsc\"",
    "mtime": "2023-01-17T20:53:43.077Z",
    "size": 1917,
    "path": "../public/_nuxt/error-500.e1036cbc.js"
  },
  "/_nuxt/error-component.6593acde.js": {
    "type": "application/javascript",
    "etag": "\"4ad-RS0Qy4pBkIFEY0IeG9b+enZVxFY\"",
    "mtime": "2023-01-17T20:53:43.076Z",
    "size": 1197,
    "path": "../public/_nuxt/error-component.6593acde.js"
  },
  "/_nuxt/index.d4e758c0.js": {
    "type": "application/javascript",
    "etag": "\"11bb-uMZ0hwKiyQ5bVqXRfqKY20I6htA\"",
    "mtime": "2023-01-17T20:53:43.076Z",
    "size": 4539,
    "path": "../public/_nuxt/index.d4e758c0.js"
  },
  "/_nuxt/index10.2af86a7f.js": {
    "type": "application/javascript",
    "etag": "\"736-42qCs+r2vAUZFMSJKKBGTnoKBI4\"",
    "mtime": "2023-01-17T20:53:43.075Z",
    "size": 1846,
    "path": "../public/_nuxt/index10.2af86a7f.js"
  },
  "/_nuxt/input-shims.d0b39aac.js": {
    "type": "application/javascript",
    "etag": "\"1235-XZq6UOm/+rowUZ3Q1BFm9MwYLCA\"",
    "mtime": "2023-01-17T20:53:43.075Z",
    "size": 4661,
    "path": "../public/_nuxt/input-shims.d0b39aac.js"
  },
  "/_nuxt/ios.transition.00f3692d.js": {
    "type": "application/javascript",
    "etag": "\"24fa-cQ4meIL6PpFJtBvqwNTl1dLgQwc\"",
    "mtime": "2023-01-17T20:53:43.074Z",
    "size": 9466,
    "path": "../public/_nuxt/ios.transition.00f3692d.js"
  },
  "/_nuxt/md.transition.73a23a6c.js": {
    "type": "application/javascript",
    "etag": "\"40b-r6m5LgccpeknUfyjqGukWFgrqmU\"",
    "mtime": "2023-01-17T20:53:43.074Z",
    "size": 1035,
    "path": "../public/_nuxt/md.transition.73a23a6c.js"
  },
  "/_nuxt/status-tap.82277796.js": {
    "type": "application/javascript",
    "etag": "\"1e5-1kcemQCKy/4/lnTyUZlysfTt/Ns\"",
    "mtime": "2023-01-17T20:53:43.073Z",
    "size": 485,
    "path": "../public/_nuxt/status-tap.82277796.js"
  },
  "/_nuxt/swipe-back.8da1f7cb.js": {
    "type": "application/javascript",
    "etag": "\"297-d7yFYu3JPPNyN598ceGpaAxuI5g\"",
    "mtime": "2023-01-17T20:53:43.073Z",
    "size": 663,
    "path": "../public/_nuxt/swipe-back.8da1f7cb.js"
  },
  "/_nuxt/swiper.bundle.11376ed7.js": {
    "type": "application/javascript",
    "etag": "\"175cf-N/Mn+q5yur/db6uZVS9OoSUGbmw\"",
    "mtime": "2023-01-17T20:53:43.073Z",
    "size": 95695,
    "path": "../public/_nuxt/swiper.bundle.11376ed7.js"
  },
  "/_nuxt/tab1.69ccb396.js": {
    "type": "application/javascript",
    "etag": "\"3e0-yhAk//SPh++XEfL1XvekPGLq0Js\"",
    "mtime": "2023-01-17T20:53:43.072Z",
    "size": 992,
    "path": "../public/_nuxt/tab1.69ccb396.js"
  },
  "/_nuxt/tab2.de7053d8.js": {
    "type": "application/javascript",
    "etag": "\"30da-OkVqR4RmxRb+YAQ277xTy+Ut6V4\"",
    "mtime": "2023-01-17T20:53:43.071Z",
    "size": 12506,
    "path": "../public/_nuxt/tab2.de7053d8.js"
  },
  "/_nuxt/tab3.da778b44.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"13e-rCM9tEtbffgT/XDW6T2P1y7rtk4\"",
    "mtime": "2023-01-17T20:53:43.071Z",
    "size": 318,
    "path": "../public/_nuxt/tab3.da778b44.css"
  },
  "/_nuxt/tab3.dd2a4020.js": {
    "type": "application/javascript",
    "etag": "\"3eb-iPJ9R4KXlfYR5sUCORAFXbFQpaI\"",
    "mtime": "2023-01-17T20:53:43.070Z",
    "size": 1003,
    "path": "../public/_nuxt/tab3.dd2a4020.js"
  },
  "/_nuxt/tab4.8b98b5ca.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2b-SkrMOhfgIrQzlcmjodBAqukZoIg\"",
    "mtime": "2023-01-17T20:53:43.070Z",
    "size": 43,
    "path": "../public/_nuxt/tab4.8b98b5ca.css"
  },
  "/_nuxt/tab4.c17ba08f.js": {
    "type": "application/javascript",
    "etag": "\"471-N3v3KHtJ7ISJkfzKkUhXoiZd2Ho\"",
    "mtime": "2023-01-17T20:53:43.070Z",
    "size": 1137,
    "path": "../public/_nuxt/tab4.c17ba08f.js"
  },
  "/_nuxt/tabs.8c8ce1d4.js": {
    "type": "application/javascript",
    "etag": "\"443-Oc2xxHIDQpkHMx5LKstcdda88AA\"",
    "mtime": "2023-01-17T20:53:43.069Z",
    "size": 1091,
    "path": "../public/_nuxt/tabs.8c8ce1d4.js"
  },
  "/_nuxt/web.264f61fd.js": {
    "type": "application/javascript",
    "etag": "\"1dce-H8B4BCJvkg/dJZpITnIyaEB1Zxk\"",
    "mtime": "2023-01-17T20:53:43.069Z",
    "size": 7630,
    "path": "../public/_nuxt/web.264f61fd.js"
  },
  "/_nuxt/web.56e31b29.js": {
    "type": "application/javascript",
    "etag": "\"f87-mSbzMXzOAi4SCFfuEh46OPXX8nM\"",
    "mtime": "2023-01-17T20:53:43.069Z",
    "size": 3975,
    "path": "../public/_nuxt/web.56e31b29.js"
  },
  "/_nuxt/web.f890fb5d.js": {
    "type": "application/javascript",
    "etag": "\"510-dka49ttzq7gmNv+uqGX8/yA7sB0\"",
    "mtime": "2023-01-17T20:53:43.068Z",
    "size": 1296,
    "path": "../public/_nuxt/web.f890fb5d.js"
  },
  "/_nuxt/icons/120x120.405b10f0.png": {
    "type": "image/png",
    "etag": "\"16a0-lM1txwGrTY2isMDTT4QX/DFIGL8\"",
    "mtime": "2023-01-17T20:53:43.067Z",
    "size": 5792,
    "path": "../public/_nuxt/icons/120x120.405b10f0.png"
  },
  "/_nuxt/icons/120x120.maskable.405b10f0.png": {
    "type": "image/png",
    "etag": "\"d76-XbQ5+tzlnzr+AVpO0XGNYy5uxdk\"",
    "mtime": "2023-01-17T20:53:43.066Z",
    "size": 3446,
    "path": "../public/_nuxt/icons/120x120.maskable.405b10f0.png"
  },
  "/_nuxt/icons/144x144.405b10f0.png": {
    "type": "image/png",
    "etag": "\"158b-LsC2xI+L329gYIPJvNbn/S65A34\"",
    "mtime": "2023-01-17T20:53:43.065Z",
    "size": 5515,
    "path": "../public/_nuxt/icons/144x144.405b10f0.png"
  },
  "/_nuxt/icons/144x144.maskable.405b10f0.png": {
    "type": "image/png",
    "etag": "\"1107-+iRVLCUlf6uWvOdXvWdZosJbky0\"",
    "mtime": "2023-01-17T20:53:43.065Z",
    "size": 4359,
    "path": "../public/_nuxt/icons/144x144.maskable.405b10f0.png"
  },
  "/_nuxt/icons/152x152.405b10f0.png": {
    "type": "image/png",
    "etag": "\"181f-r0uHZgIfffIUZa356sn6+5tIez8\"",
    "mtime": "2023-01-17T20:53:43.064Z",
    "size": 6175,
    "path": "../public/_nuxt/icons/152x152.405b10f0.png"
  },
  "/_nuxt/icons/152x152.maskable.405b10f0.png": {
    "type": "image/png",
    "etag": "\"11ff-s/KdfUfOuf/ejOBQkg8J2FPv0/E\"",
    "mtime": "2023-01-17T20:53:43.063Z",
    "size": 4607,
    "path": "../public/_nuxt/icons/152x152.maskable.405b10f0.png"
  },
  "/_nuxt/icons/192x192.405b10f0.png": {
    "type": "image/png",
    "etag": "\"23b0-s+A25Fk5Nx1JFyYCUV2Vzdtqhx8\"",
    "mtime": "2023-01-17T20:53:43.062Z",
    "size": 9136,
    "path": "../public/_nuxt/icons/192x192.405b10f0.png"
  },
  "/_nuxt/icons/192x192.maskable.405b10f0.png": {
    "type": "image/png",
    "etag": "\"1389-EO+kcKUMOrhfZh/erDnD464n3fI\"",
    "mtime": "2023-01-17T20:53:43.061Z",
    "size": 5001,
    "path": "../public/_nuxt/icons/192x192.maskable.405b10f0.png"
  },
  "/_nuxt/icons/384x384.405b10f0.png": {
    "type": "image/png",
    "etag": "\"76c5-oQIOOGplKhhgxiasoFaJdEP21Tw\"",
    "mtime": "2023-01-17T20:53:43.061Z",
    "size": 30405,
    "path": "../public/_nuxt/icons/384x384.405b10f0.png"
  },
  "/_nuxt/icons/384x384.maskable.405b10f0.png": {
    "type": "image/png",
    "etag": "\"411b-B86KdfPcbU18gmULSLvcZkhEqvU\"",
    "mtime": "2023-01-17T20:53:43.058Z",
    "size": 16667,
    "path": "../public/_nuxt/icons/384x384.maskable.405b10f0.png"
  },
  "/_nuxt/icons/512x512.405b10f0.png": {
    "type": "image/png",
    "etag": "\"c638-skrTiL1x4VYZepOkrZSqAcC62Ts\"",
    "mtime": "2023-01-17T20:53:43.056Z",
    "size": 50744,
    "path": "../public/_nuxt/icons/512x512.405b10f0.png"
  },
  "/_nuxt/icons/512x512.maskable.405b10f0.png": {
    "type": "image/png",
    "etag": "\"6e47-WacVpE7uXYl7ZiREpLsGtoq/VEE\"",
    "mtime": "2023-01-17T20:53:43.055Z",
    "size": 28231,
    "path": "../public/_nuxt/icons/512x512.maskable.405b10f0.png"
  },
  "/_nuxt/icons/64x64.405b10f0.png": {
    "type": "image/png",
    "etag": "\"abc-1KOQDjNQYSbAOIUsgXmOFndL9o4\"",
    "mtime": "2023-01-17T20:53:43.055Z",
    "size": 2748,
    "path": "../public/_nuxt/icons/64x64.405b10f0.png"
  },
  "/_nuxt/icons/64x64.maskable.405b10f0.png": {
    "type": "image/png",
    "etag": "\"6c4-biC9h/oXkXKXNWyUW1U82WyoTGw\"",
    "mtime": "2023-01-17T20:53:43.054Z",
    "size": 1732,
    "path": "../public/_nuxt/icons/64x64.maskable.405b10f0.png"
  },
  "/_nuxt/splash/1125x2436.405b10f0.png": {
    "type": "image/png",
    "etag": "\"d70b-u8Wo7yRLQxoJVyxHuvIuQPitNOc\"",
    "mtime": "2023-01-17T20:53:43.053Z",
    "size": 55051,
    "path": "../public/_nuxt/splash/1125x2436.405b10f0.png"
  },
  "/_nuxt/splash/1136x640.405b10f0.png": {
    "type": "image/png",
    "etag": "\"a8e9-3/DFZ2sFLW4cvcYPGAGwoJQh3SA\"",
    "mtime": "2023-01-17T20:53:43.053Z",
    "size": 43241,
    "path": "../public/_nuxt/splash/1136x640.405b10f0.png"
  },
  "/_nuxt/splash/1170x2532.405b10f0.png": {
    "type": "image/png",
    "etag": "\"de64-fIbUKoF+gK4Gld7MLq7n5mcGINQ\"",
    "mtime": "2023-01-17T20:53:43.052Z",
    "size": 56932,
    "path": "../public/_nuxt/splash/1170x2532.405b10f0.png"
  },
  "/_nuxt/splash/1242x2208.405b10f0.png": {
    "type": "image/png",
    "etag": "\"d83f-9rhL/A7ssSyRozBkWaIZPydS7hA\"",
    "mtime": "2023-01-17T20:53:43.051Z",
    "size": 55359,
    "path": "../public/_nuxt/splash/1242x2208.405b10f0.png"
  },
  "/_nuxt/splash/1242x2688.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e735-sLMYOqFYO2Vj9i5CEoWmFI70imI\"",
    "mtime": "2023-01-17T20:53:43.051Z",
    "size": 59189,
    "path": "../public/_nuxt/splash/1242x2688.405b10f0.png"
  },
  "/_nuxt/splash/1284x2778.405b10f0.png": {
    "type": "image/png",
    "etag": "\"eaf8-5NpC6aN/z7nZvW36O1WrqRRLlWY\"",
    "mtime": "2023-01-17T20:53:43.050Z",
    "size": 60152,
    "path": "../public/_nuxt/splash/1284x2778.405b10f0.png"
  },
  "/_nuxt/splash/1334x750.405b10f0.png": {
    "type": "image/png",
    "etag": "\"b210-/qJn9fYqicbPavnW6QySBKbtt5w\"",
    "mtime": "2023-01-17T20:53:43.049Z",
    "size": 45584,
    "path": "../public/_nuxt/splash/1334x750.405b10f0.png"
  },
  "/_nuxt/splash/1536x2048.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e21f-O5+OcjGd7uYbF0q3FU7k6oTt3Dc\"",
    "mtime": "2023-01-17T20:53:43.049Z",
    "size": 57887,
    "path": "../public/_nuxt/splash/1536x2048.405b10f0.png"
  },
  "/_nuxt/splash/1620x2160.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e721-6SzkAE6tfceIcfS50AFdgpuXukc\"",
    "mtime": "2023-01-17T20:53:43.048Z",
    "size": 59169,
    "path": "../public/_nuxt/splash/1620x2160.405b10f0.png"
  },
  "/_nuxt/splash/1668x2224.405b10f0.png": {
    "type": "image/png",
    "etag": "\"ec1e-Sm7oEmUNQ4Eht31esqpdqU/G1oI\"",
    "mtime": "2023-01-17T20:53:43.047Z",
    "size": 60446,
    "path": "../public/_nuxt/splash/1668x2224.405b10f0.png"
  },
  "/_nuxt/splash/1668x2388.405b10f0.png": {
    "type": "image/png",
    "etag": "\"f012-5RTxyqGOVgDHqad7qIgq4mxZef0\"",
    "mtime": "2023-01-17T20:53:43.047Z",
    "size": 61458,
    "path": "../public/_nuxt/splash/1668x2388.405b10f0.png"
  },
  "/_nuxt/splash/1792x828.405b10f0.png": {
    "type": "image/png",
    "etag": "\"be3b-rXvlW9kK344k7FlpR85VZfKm7lM\"",
    "mtime": "2023-01-17T20:53:43.046Z",
    "size": 48699,
    "path": "../public/_nuxt/splash/1792x828.405b10f0.png"
  },
  "/_nuxt/splash/2048x1536.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e234-Bvk9iWMdaN5yVQ27utDnKCqo9W0\"",
    "mtime": "2023-01-17T20:53:43.045Z",
    "size": 57908,
    "path": "../public/_nuxt/splash/2048x1536.405b10f0.png"
  },
  "/_nuxt/splash/2160x1620.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e73a-vISgpD3Y77S7DYT+yXVZPbZiVKg\"",
    "mtime": "2023-01-17T20:53:43.045Z",
    "size": 59194,
    "path": "../public/_nuxt/splash/2160x1620.405b10f0.png"
  },
  "/_nuxt/splash/2208x1242.405b10f0.png": {
    "type": "image/png",
    "etag": "\"d7b7-ttoUR4A/LGtl6Z/GCJqMTYSWCts\"",
    "mtime": "2023-01-17T20:53:43.044Z",
    "size": 55223,
    "path": "../public/_nuxt/splash/2208x1242.405b10f0.png"
  },
  "/_nuxt/splash/2224x1668.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e969-aG0COBtK75FfQaMQTcXhalAoIxs\"",
    "mtime": "2023-01-17T20:53:43.043Z",
    "size": 59753,
    "path": "../public/_nuxt/splash/2224x1668.405b10f0.png"
  },
  "/_nuxt/splash/2388x1668.405b10f0.png": {
    "type": "image/png",
    "etag": "\"ecb8-iX9M/Nfmpw0ZtUK0ZUSNTm1Kl+w\"",
    "mtime": "2023-01-17T20:53:43.043Z",
    "size": 60600,
    "path": "../public/_nuxt/splash/2388x1668.405b10f0.png"
  },
  "/_nuxt/splash/2436x1125.405b10f0.png": {
    "type": "image/png",
    "etag": "\"d732-UJ0gXwvsgCxisEXDXyx1NT0xLkY\"",
    "mtime": "2023-01-17T20:53:43.042Z",
    "size": 55090,
    "path": "../public/_nuxt/splash/2436x1125.405b10f0.png"
  },
  "/_nuxt/splash/2532x1170.405b10f0.png": {
    "type": "image/png",
    "etag": "\"dab4-T8iY63O9jUz8MglhTW4uazuDXsc\"",
    "mtime": "2023-01-17T20:53:43.041Z",
    "size": 55988,
    "path": "../public/_nuxt/splash/2532x1170.405b10f0.png"
  },
  "/_nuxt/splash/2688x1242.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e226-J7wYtFfZH/bpDY5ZICtjvZA5/1c\"",
    "mtime": "2023-01-17T20:53:43.040Z",
    "size": 57894,
    "path": "../public/_nuxt/splash/2688x1242.405b10f0.png"
  },
  "/_nuxt/splash/2732x2048.405b10f0.png": {
    "type": "image/png",
    "etag": "\"10cb0-UWg6QS3DOUAVoou6bFxml/V8so4\"",
    "mtime": "2023-01-17T20:53:43.039Z",
    "size": 68784,
    "path": "../public/_nuxt/splash/2732x2048.405b10f0.png"
  },
  "/_nuxt/splash/2778x1284.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e6da-TA6sS4YoAJFWmmbj28qdOTHRzrk\"",
    "mtime": "2023-01-17T20:53:43.035Z",
    "size": 59098,
    "path": "../public/_nuxt/splash/2778x1284.405b10f0.png"
  },
  "/_nuxt/splash/640x1136.405b10f0.png": {
    "type": "image/png",
    "etag": "\"a87c-Frh30MVF/KgRtzKHZKtFjpCtK8c\"",
    "mtime": "2023-01-17T20:53:43.026Z",
    "size": 43132,
    "path": "../public/_nuxt/splash/640x1136.405b10f0.png"
  },
  "/_nuxt/splash/750x1334.405b10f0.png": {
    "type": "image/png",
    "etag": "\"acd0-gGHka4NYRwtDFr43GfI82VQOTxI\"",
    "mtime": "2023-01-17T20:53:43.024Z",
    "size": 44240,
    "path": "../public/_nuxt/splash/750x1334.405b10f0.png"
  },
  "/_nuxt/splash/828x1792.405b10f0.png": {
    "type": "image/png",
    "etag": "\"bb31-RM3yrPBHIF8ZpcGFgl/0ycuVUEM\"",
    "mtime": "2023-01-17T20:53:43.012Z",
    "size": 47921,
    "path": "../public/_nuxt/splash/828x1792.405b10f0.png"
  }
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = [];

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base of publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = ["HEAD", "GET"];
const EncodingMap = { gzip: ".gz", br: ".br" };
const _f4b49z = eventHandler((event) => {
  if (event.req.method && !METHODS.includes(event.req.method)) {
    return;
  }
  let id = decodeURIComponent(withLeadingSlash(withoutTrailingSlash(parseURL(event.req.url).pathname)));
  let asset;
  const encodingHeader = String(event.req.headers["accept-encoding"] || "");
  const encodings = encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort().concat([""]);
  if (encodings.length > 1) {
    event.res.setHeader("Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      throw createError({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = event.req.headers["if-none-match"] === asset.etag;
  if (ifNotMatch) {
    event.res.statusCode = 304;
    event.res.end();
    return;
  }
  const ifModifiedSinceH = event.req.headers["if-modified-since"];
  if (ifModifiedSinceH && asset.mtime) {
    if (new Date(ifModifiedSinceH) >= new Date(asset.mtime)) {
      event.res.statusCode = 304;
      event.res.end();
      return;
    }
  }
  if (asset.type && !event.res.getHeader("Content-Type")) {
    event.res.setHeader("Content-Type", asset.type);
  }
  if (asset.etag && !event.res.getHeader("ETag")) {
    event.res.setHeader("ETag", asset.etag);
  }
  if (asset.mtime && !event.res.getHeader("Last-Modified")) {
    event.res.setHeader("Last-Modified", asset.mtime);
  }
  if (asset.encoding && !event.res.getHeader("Content-Encoding")) {
    event.res.setHeader("Content-Encoding", asset.encoding);
  }
  if (asset.size && !event.res.getHeader("Content-Length")) {
    event.res.setHeader("Content-Length", asset.size);
  }
  return readAsset(id);
});

const _f6NkHf = defineEventHandler((event) => {
});

const _sALeXJ = defineEventHandler(() => useRuntimeConfig().public.pwaManifest);

const _lazy_LZ5bhz = () => import('../_name_.mjs');
const _lazy_mKQlfi = () => import('../count.mjs');
const _lazy_GG9VB5 = () => import('../handlers/renderer.mjs');

const handlers = [
  { route: '', handler: _f4b49z, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _f6NkHf, lazy: false, middleware: true, method: undefined },
  { route: '/api/custom/:name', handler: _lazy_LZ5bhz, lazy: true, middleware: false, method: undefined },
  { route: '/api/count', handler: _lazy_mKQlfi, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_GG9VB5, lazy: true, middleware: false, method: undefined },
  { route: '/manifest.json', handler: _sALeXJ, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_GG9VB5, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const h3App = createApp({
    debug: destr(false),
    onError: errorHandler
  });
  h3App.use(config.app.baseURL, timingMiddleware);
  const router = createRouter$1();
  h3App.use(createRouteRulesHandler());
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(/\/+/g, "/");
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(h.route.replace(/:\w+|\*\*/g, "_"));
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router);
  const localCall = createCall(toNodeListener(h3App));
  const localFetch = createFetch(localCall, globalThis.fetch);
  const $fetch = createFetch$1({ fetch: localFetch, Headers, defaults: { baseURL: config.app.baseURL } });
  globalThis.$fetch = $fetch;
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch
  };
  for (const plugin of plugins) {
    plugin(app);
  }
  return app;
}
const nitroApp = createNitroApp();
const useNitroApp = () => nitroApp;

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const s = server.listen(port, host, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const i = s.address();
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${i.family === "IPv6" ? `[${i.address}]` : i.address}:${i.port}${baseURL}`;
  console.log(`Listening ${url}`);
});
{
  process.on("unhandledRejection", (err) => console.error("[nitro] [dev] [unhandledRejection] " + err));
  process.on("uncaughtException", (err) => console.error("[nitro] [dev] [uncaughtException] " + err));
}
const nodeServer = {};

export { useRuntimeConfig as a, getRouteRules as g, nodeServer as n, useNitroApp as u };
//# sourceMappingURL=node-server.mjs.map
