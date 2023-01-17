globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import 'node-fetch-native/polyfill';
import { Server as Server$1 } from 'http';
import { Server } from 'https';
import destr from 'destr';
import { withoutTrailingSlash, getQuery as getQuery$1, parseURL, joinURL, withQuery, withLeadingSlash } from 'ufo';
import { createFetch as createFetch$1, Headers } from 'ofetch';
import { createCall, createFetch } from 'unenv/runtime/fetch/index';
import { createHooks } from 'hookable';
import { snakeCase } from 'scule';
import { hash } from 'ohash';
import { createStorage } from 'unstorage';
import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'pathe';

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode !== void 0) {
      node = nextNode;
    } else {
      node = node.placeholderChildNode;
      if (node !== null) {
        params[node.paramName] = section;
        paramsFound = true;
      } else {
        break;
      }
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildNode = childNode;
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.substring(3) || "_";
        isStaticRoute = false;
      }
      node = childNode;
    }
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections[sections.length - 1];
    node.data = null;
    if (Object.keys(node.children).length === 0) {
      const parentNode = node.parent;
      delete parentNode[lastSection];
      parentNode.wildcardChildNode = null;
      parentNode.placeholderChildNode = null;
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildNode: null
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table);
}
function _createMatcher(table) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table) {
  const matches = [];
  for (const [key, value] of table.wildcard) {
    if (path.startsWith(key)) {
      matches.push(value);
    }
  }
  for (const [key, value] of table.dynamic) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.substring(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        table.static.set(path, node.data);
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

class H3Error extends Error {
  constructor() {
    super(...arguments);
    this.statusCode = 500;
    this.fatal = false;
    this.unhandled = false;
    this.statusMessage = void 0;
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: this.statusCode
    };
    if (this.statusMessage) {
      obj.statusMessage = this.statusMessage;
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
H3Error.__h3_error__ = true;
function createError(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(
    input.message ?? input.statusMessage,
    input.cause ? { cause: input.cause } : void 0
  );
  if ("stack" in input) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = input.statusCode;
  } else if (input.status) {
    err.statusCode = input.status;
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.node.res.writableEnded) {
    return;
  }
  const h3Error = isError(error) ? error : createError(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.node.res.writableEnded) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  if (_code) {
    event.node.res.statusCode = _code;
  }
  if (h3Error.statusMessage) {
    event.node.res.statusMessage = h3Error.statusMessage;
  }
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function getQuery(event) {
  return getQuery$1(event.node.req.url || "");
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= opts.modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    event.node.res.end();
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const defer = typeof setImmediate !== "undefined" ? setImmediate : (fn) => fn();
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      event.node.res.end(data);
      resolve();
    });
  });
}
function defaultContentType(event, type) {
  if (type && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = code;
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(name, value);
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
function isStream(data) {
  return data && typeof data === "object" && typeof data.pipe === "function" && typeof data.on === "function";
}
function sendStream(event, data) {
  return new Promise((resolve, reject) => {
    data.pipe(event.node.res);
    data.on("end", () => resolve());
    data.on("error", (error) => reject(createError(error)));
  });
}

class H3Headers {
  constructor(init) {
    if (!init) {
      this._headers = {};
    } else if (Array.isArray(init)) {
      this._headers = Object.fromEntries(
        init.map(([key, value]) => [key.toLowerCase(), value])
      );
    } else if (init && "append" in init) {
      this._headers = Object.fromEntries(init.entries());
    } else {
      this._headers = Object.fromEntries(
        Object.entries(init).map(([key, value]) => [key.toLowerCase(), value])
      );
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  entries() {
    throw Object.entries(this._headers)[Symbol.iterator]();
  }
  keys() {
    return Object.keys(this._headers)[Symbol.iterator]();
  }
  values() {
    throw Object.values(this._headers)[Symbol.iterator]();
  }
  append(name, value) {
    const _name = name.toLowerCase();
    this.set(_name, [this.get(_name), value].filter(Boolean).join(", "));
  }
  delete(name) {
    delete this._headers[name.toLowerCase()];
  }
  get(name) {
    return this._headers[name.toLowerCase()];
  }
  has(name) {
    return name.toLowerCase() in this._headers;
  }
  set(name, value) {
    this._headers[name.toLowerCase()] = String(value);
  }
  forEach(callbackfn) {
    for (const [key, value] of Object.entries(this._headers)) {
      callbackfn(value, key, this);
    }
  }
}

class H3Response {
  constructor(body = null, init = {}) {
    this.body = null;
    this.type = "default";
    this.bodyUsed = false;
    this.headers = new H3Headers(init.headers);
    this.status = init.status ?? 200;
    this.statusText = init.statusText || "";
    this.redirected = !!init.status && [301, 302, 307, 308].includes(init.status);
    this._body = body;
    this.url = "";
    this.ok = this.status < 300 && this.status > 199;
  }
  clone() {
    return new H3Response(this.body, {
      headers: this.headers,
      status: this.status,
      statusText: this.statusText
    });
  }
  arrayBuffer() {
    return Promise.resolve(this._body);
  }
  blob() {
    return Promise.resolve(this._body);
  }
  formData() {
    return Promise.resolve(this._body);
  }
  json() {
    return Promise.resolve(this._body);
  }
  text() {
    return Promise.resolve(this._body);
  }
}

class H3Event {
  constructor(req, res) {
    this["__is_event__"] = true;
    this.context = {};
    this.node = { req, res };
  }
  get path() {
    return this.req.url;
  }
  get req() {
    return this.node.req;
  }
  get res() {
    return this.node.res;
  }
  respondWith(r) {
    Promise.resolve(r).then((_response) => {
      if (this.res.writableEnded) {
        return;
      }
      const response = _response instanceof H3Response ? _response : new H3Response(_response);
      for (const [key, value] of response.headers.entries()) {
        this.res.setHeader(key, value);
      }
      if (response.status) {
        this.res.statusCode = response.status;
      }
      if (response.statusText) {
        this.res.statusMessage = response.statusText;
      }
      if (response.redirected) {
        this.res.setHeader("location", response.url);
      }
      if (!response._body) {
        return this.res.end();
      }
      if (typeof response._body === "string" || "buffer" in response._body || "byteLength" in response._body) {
        return this.res.end(response._body);
      }
      if (!response.headers.has("content-type")) {
        response.headers.set("content-type", MIMES.json);
      }
      this.res.end(JSON.stringify(response._body));
    });
  }
}
function createEvent(req, res) {
  return new H3Event(req, res);
}

function defineEventHandler(handler) {
  handler.__is_handler__ = true;
  return handler;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return "__is_handler__" in input;
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler = r.default || r;
        if (typeof handler !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler
          );
        }
        _resolved = toEventHandler(r.default || r);
        return _resolved;
      });
    }
    return _promise;
  };
  return eventHandler((event) => {
    if (_resolved) {
      return _resolved(event);
    }
    return resolveHandler().then((handler) => handler(event));
  });
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const app = {
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    handler,
    stack,
    options
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(
      normalizeLayer({ ...arg2, route: "/", handler: arg1 })
    );
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const reqUrl = event.node.req.url || "/";
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!reqUrl.startsWith(layer.route)) {
          continue;
        }
        event.node.req.url = reqUrl.slice(layer.route.length) || "/";
      } else {
        event.node.req.url = reqUrl;
      }
      if (layer.match && !layer.match(event.node.req.url, event)) {
        continue;
      }
      const val = await layer.handler(event);
      if (event.node.res.writableEnded) {
        return;
      }
      const type = typeof val;
      if (type === "string") {
        return send(event, val, MIMES.html);
      } else if (isStream(val)) {
        return sendStream(event, val);
      } else if (val === null) {
        event.node.res.statusCode = 204;
        return send(event);
      } else if (type === "object" || type === "boolean" || type === "number") {
        if (val.buffer) {
          return send(event, val);
        } else if (val instanceof Error) {
          throw createError(val);
        } else {
          return send(
            event,
            JSON.stringify(val, void 0, spacing),
            MIMES.json
          );
        }
      }
    }
    if (!event.node.res.writableEnded) {
      throw createError({
        statusCode: 404,
        statusMessage: `Cannot find any route matching ${event.node.req.url || "/"}.`
      });
    }
  });
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      if (app.options.onError) {
        await app.options.onError(error, event);
      } else {
        if (error.unhandled || error.fatal) {
          console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
        }
        await sendError(event, error, !!app.options.debug);
      }
    }
  };
  return toNodeHandle;
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  router.handler = eventHandler((event) => {
    let path = event.node.req.url || "/";
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      if (opts.preemptive || opts.preemtive) {
        throw createError({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${event.node.req.url || "/"}.`
        });
      } else {
        return;
      }
    }
    const method = (event.node.req.method || "get").toLowerCase();
    const handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      throw createError({
        statusCode: 405,
        name: "Method Not Allowed",
        statusMessage: `Method ${method} is not allowed on this route.`
      });
    }
    const params = matched.params || {};
    event.context.params = params;
    return handler(event);
  });
  return router;
}

const _runtimeConfig = {"app":{"baseURL":"/","buildAssetsDir":"/_nuxt/","cdnURL":""},"nitro":{"routeRules":{"/__nuxt_error":{"cache":false}},"envPrefix":"NUXT_"},"public":{"pwaManifest":{"name":"Nuxt PWA","lang":"en","start_url":"/?standalone=true","display":"standalone","background_color":"#ffffff","theme_color":"#000000","icons":[{"src":"/_nuxt/icons/64x64.405b10f0.png","type":"image/png","sizes":"64x64","purpose":"any"},{"src":"/_nuxt/icons/64x64.maskable.405b10f0.png","type":"image/png","sizes":"64x64","purpose":"maskable"},{"src":"/_nuxt/icons/120x120.405b10f0.png","type":"image/png","sizes":"120x120","purpose":"any"},{"src":"/_nuxt/icons/120x120.maskable.405b10f0.png","type":"image/png","sizes":"120x120","purpose":"maskable"},{"src":"/_nuxt/icons/144x144.405b10f0.png","type":"image/png","sizes":"144x144","purpose":"any"},{"src":"/_nuxt/icons/144x144.maskable.405b10f0.png","type":"image/png","sizes":"144x144","purpose":"maskable"},{"src":"/_nuxt/icons/152x152.405b10f0.png","type":"image/png","sizes":"152x152","purpose":"any"},{"src":"/_nuxt/icons/152x152.maskable.405b10f0.png","type":"image/png","sizes":"152x152","purpose":"maskable"},{"src":"/_nuxt/icons/192x192.405b10f0.png","type":"image/png","sizes":"192x192","purpose":"any"},{"src":"/_nuxt/icons/192x192.maskable.405b10f0.png","type":"image/png","sizes":"192x192","purpose":"maskable"},{"src":"/_nuxt/icons/384x384.405b10f0.png","type":"image/png","sizes":"384x384","purpose":"any"},{"src":"/_nuxt/icons/384x384.maskable.405b10f0.png","type":"image/png","sizes":"384x384","purpose":"maskable"},{"src":"/_nuxt/icons/512x512.405b10f0.png","type":"image/png","sizes":"512x512","purpose":"any"},{"src":"/_nuxt/icons/512x512.maskable.405b10f0.png","type":"image/png","sizes":"512x512","purpose":"maskable"}]}}};
const ENV_PREFIX = "NITRO_";
const ENV_PREFIX_ALT = _runtimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_";
const getEnv = (key) => {
  const envKey = snakeCase(key).toUpperCase();
  return destr(process.env[ENV_PREFIX + envKey] ?? process.env[ENV_PREFIX_ALT + envKey]);
};
function isObject$1(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function overrideConfig(obj, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey);
    if (isObject$1(obj[key])) {
      if (isObject$1(envValue)) {
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

function isObject(value) {
  return value !== null && typeof value === "object";
}
function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isObject(value) && isObject(object[key])) {
      object[key] = _defu(value, object[key], (namespace ? `${namespace}.` : "") + key.toString(), merger);
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => arguments_.reduce((p, c) => _defu(p, c, "", merger), {});
}
const defu = createDefu();

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(createRouter$1({ routes: config.nitro.routeRules }));
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
    "mtime": "2023-01-17T17:31:12.425Z",
    "size": 1813,
    "path": "../public/icon.png"
  },
  "/manifest.json": {
    "type": "application/json",
    "etag": "\"63d-/t5HYA2nHaVSeF/0nsxYsvpQ2C8\"",
    "mtime": "2023-01-17T17:31:12.366Z",
    "size": 1597,
    "path": "../public/manifest.json"
  },
  "/sw.js": {
    "type": "application/javascript",
    "etag": "\"5a2-l8fKxp+EeYRWHojyorrxEV5RUi8\"",
    "mtime": "2023-01-17T17:31:12.361Z",
    "size": 1442,
    "path": "../public/sw.js"
  },
  "/_nuxt/composables.635966f5.js": {
    "type": "application/javascript",
    "etag": "\"61-zQRB1/W4QA0J3DD+5z+/IWy4ros\"",
    "mtime": "2023-01-17T17:31:12.424Z",
    "size": 97,
    "path": "../public/_nuxt/composables.635966f5.js"
  },
  "/_nuxt/entry.39fcf656.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2aaa-IWE1NkZCghmrWmyPDy51Oqh5cXA\"",
    "mtime": "2023-01-17T17:31:12.424Z",
    "size": 10922,
    "path": "../public/_nuxt/entry.39fcf656.css"
  },
  "/_nuxt/entry.b48213f9.js": {
    "type": "application/javascript",
    "etag": "\"6fc3c-cjCtdFGcXleBDLNbbpiB7iCe7D4\"",
    "mtime": "2023-01-17T17:31:12.423Z",
    "size": 457788,
    "path": "../public/_nuxt/entry.b48213f9.js"
  },
  "/_nuxt/error-404.615d41ac.js": {
    "type": "application/javascript",
    "etag": "\"8d5-IqYF6fBOBG5xxfn34h/zzZgxyN8\"",
    "mtime": "2023-01-17T17:31:12.421Z",
    "size": 2261,
    "path": "../public/_nuxt/error-404.615d41ac.js"
  },
  "/_nuxt/error-404.8ccf2fec.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"e2e-68eKZYx67s9CKnFHWVX/8c82buY\"",
    "mtime": "2023-01-17T17:31:12.421Z",
    "size": 3630,
    "path": "../public/_nuxt/error-404.8ccf2fec.css"
  },
  "/_nuxt/error-500.42b82e7a.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"79e-jt/pmAC9IZJecj9LqnPml6NZ4oA\"",
    "mtime": "2023-01-17T17:31:12.421Z",
    "size": 1950,
    "path": "../public/_nuxt/error-500.42b82e7a.css"
  },
  "/_nuxt/error-500.c37c6a4c.js": {
    "type": "application/javascript",
    "etag": "\"77d-RLGjUQHgAIdDeb/HKprBvJ0BJSI\"",
    "mtime": "2023-01-17T17:31:12.420Z",
    "size": 1917,
    "path": "../public/_nuxt/error-500.c37c6a4c.js"
  },
  "/_nuxt/error-component.077f48d2.js": {
    "type": "application/javascript",
    "etag": "\"4ad-RB+cxPZK450IRdReYdBB8ZYK9fI\"",
    "mtime": "2023-01-17T17:31:12.420Z",
    "size": 1197,
    "path": "../public/_nuxt/error-component.077f48d2.js"
  },
  "/_nuxt/index.d4e758c0.js": {
    "type": "application/javascript",
    "etag": "\"11bb-uMZ0hwKiyQ5bVqXRfqKY20I6htA\"",
    "mtime": "2023-01-17T17:31:12.419Z",
    "size": 4539,
    "path": "../public/_nuxt/index.d4e758c0.js"
  },
  "/_nuxt/index10.e1a5f7a7.js": {
    "type": "application/javascript",
    "etag": "\"736-u/wnlIQQ9dajGzhLU4YHcmi4trA\"",
    "mtime": "2023-01-17T17:31:12.419Z",
    "size": 1846,
    "path": "../public/_nuxt/index10.e1a5f7a7.js"
  },
  "/_nuxt/input-shims.ca96360f.js": {
    "type": "application/javascript",
    "etag": "\"1235-dTtTte7GQ1LO49NV3zyY664XwNo\"",
    "mtime": "2023-01-17T17:31:12.418Z",
    "size": 4661,
    "path": "../public/_nuxt/input-shims.ca96360f.js"
  },
  "/_nuxt/ios.transition.03f4f6aa.js": {
    "type": "application/javascript",
    "etag": "\"24fa-Aa0mKUa5+jwwCoWWGE3UE5aI+tY\"",
    "mtime": "2023-01-17T17:31:12.418Z",
    "size": 9466,
    "path": "../public/_nuxt/ios.transition.03f4f6aa.js"
  },
  "/_nuxt/md.transition.bb5ebcfb.js": {
    "type": "application/javascript",
    "etag": "\"40b-+xZcXg9e4R9t6Nm4u/SFh5y/yLM\"",
    "mtime": "2023-01-17T17:31:12.417Z",
    "size": 1035,
    "path": "../public/_nuxt/md.transition.bb5ebcfb.js"
  },
  "/_nuxt/status-tap.48399ba2.js": {
    "type": "application/javascript",
    "etag": "\"1e5-pKPnnbmczle1bcMBlsRXP8930V0\"",
    "mtime": "2023-01-17T17:31:12.417Z",
    "size": 485,
    "path": "../public/_nuxt/status-tap.48399ba2.js"
  },
  "/_nuxt/swipe-back.cc72694a.js": {
    "type": "application/javascript",
    "etag": "\"297-/u6phxNRGwkr25uOlxqJxTrh0dQ\"",
    "mtime": "2023-01-17T17:31:12.416Z",
    "size": 663,
    "path": "../public/_nuxt/swipe-back.cc72694a.js"
  },
  "/_nuxt/swiper.bundle.92f6ddf1.js": {
    "type": "application/javascript",
    "etag": "\"175cf-N/Mn+q5yur/db6uZVS9OoSUGbmw\"",
    "mtime": "2023-01-17T17:31:12.416Z",
    "size": 95695,
    "path": "../public/_nuxt/swiper.bundle.92f6ddf1.js"
  },
  "/_nuxt/tab1.e438d912.js": {
    "type": "application/javascript",
    "etag": "\"3e0-QaDMCQ1CysAhYFawoTWa5cKyEQo\"",
    "mtime": "2023-01-17T17:31:12.416Z",
    "size": 992,
    "path": "../public/_nuxt/tab1.e438d912.js"
  },
  "/_nuxt/tab2.2811c144.js": {
    "type": "application/javascript",
    "etag": "\"30da-/0mGWyWOO8xf0N6bj0NaQZ+Viq4\"",
    "mtime": "2023-01-17T17:31:12.415Z",
    "size": 12506,
    "path": "../public/_nuxt/tab2.2811c144.js"
  },
  "/_nuxt/tab3.22bab7a2.js": {
    "type": "application/javascript",
    "etag": "\"3eb-hn4RbVNj/Bht3YyUO+1IA7JnpSY\"",
    "mtime": "2023-01-17T17:31:12.415Z",
    "size": 1003,
    "path": "../public/_nuxt/tab3.22bab7a2.js"
  },
  "/_nuxt/tab3.da778b44.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"13e-rCM9tEtbffgT/XDW6T2P1y7rtk4\"",
    "mtime": "2023-01-17T17:31:12.415Z",
    "size": 318,
    "path": "../public/_nuxt/tab3.da778b44.css"
  },
  "/_nuxt/tab4.91ca317e.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2b-4BGCkIykSjvT11+f2aU/9sGtFkA\"",
    "mtime": "2023-01-17T17:31:12.414Z",
    "size": 43,
    "path": "../public/_nuxt/tab4.91ca317e.css"
  },
  "/_nuxt/tab4.c61367c6.js": {
    "type": "application/javascript",
    "etag": "\"475-74J4E0jOnPhHKxHoJyR8yZqtb4o\"",
    "mtime": "2023-01-17T17:31:12.414Z",
    "size": 1141,
    "path": "../public/_nuxt/tab4.c61367c6.js"
  },
  "/_nuxt/tabs.4d7d8e29.js": {
    "type": "application/javascript",
    "etag": "\"443-nE6NhhIdAQsEnE9OKKYWeYQGbX0\"",
    "mtime": "2023-01-17T17:31:12.414Z",
    "size": 1091,
    "path": "../public/_nuxt/tabs.4d7d8e29.js"
  },
  "/_nuxt/web.49526e0a.js": {
    "type": "application/javascript",
    "etag": "\"f87-Dme560rZ+eBFqN3r2DQlmsbZEYo\"",
    "mtime": "2023-01-17T17:31:12.413Z",
    "size": 3975,
    "path": "../public/_nuxt/web.49526e0a.js"
  },
  "/_nuxt/web.70400112.js": {
    "type": "application/javascript",
    "etag": "\"510-ysijwIr1ZwId/MujE8sNK6xSslM\"",
    "mtime": "2023-01-17T17:31:12.413Z",
    "size": 1296,
    "path": "../public/_nuxt/web.70400112.js"
  },
  "/_nuxt/web.f9c1128b.js": {
    "type": "application/javascript",
    "etag": "\"1dce-4jJRiJN3oLmJ9SmTWov/Ibjf+PI\"",
    "mtime": "2023-01-17T17:31:12.412Z",
    "size": 7630,
    "path": "../public/_nuxt/web.f9c1128b.js"
  },
  "/_nuxt/icons/120x120.405b10f0.png": {
    "type": "image/png",
    "etag": "\"16a0-lM1txwGrTY2isMDTT4QX/DFIGL8\"",
    "mtime": "2023-01-17T17:31:12.407Z",
    "size": 5792,
    "path": "../public/_nuxt/icons/120x120.405b10f0.png"
  },
  "/_nuxt/icons/120x120.maskable.405b10f0.png": {
    "type": "image/png",
    "etag": "\"d76-XbQ5+tzlnzr+AVpO0XGNYy5uxdk\"",
    "mtime": "2023-01-17T17:31:12.407Z",
    "size": 3446,
    "path": "../public/_nuxt/icons/120x120.maskable.405b10f0.png"
  },
  "/_nuxt/icons/144x144.405b10f0.png": {
    "type": "image/png",
    "etag": "\"158b-LsC2xI+L329gYIPJvNbn/S65A34\"",
    "mtime": "2023-01-17T17:31:12.406Z",
    "size": 5515,
    "path": "../public/_nuxt/icons/144x144.405b10f0.png"
  },
  "/_nuxt/icons/144x144.maskable.405b10f0.png": {
    "type": "image/png",
    "etag": "\"1107-+iRVLCUlf6uWvOdXvWdZosJbky0\"",
    "mtime": "2023-01-17T17:31:12.405Z",
    "size": 4359,
    "path": "../public/_nuxt/icons/144x144.maskable.405b10f0.png"
  },
  "/_nuxt/icons/152x152.405b10f0.png": {
    "type": "image/png",
    "etag": "\"181f-r0uHZgIfffIUZa356sn6+5tIez8\"",
    "mtime": "2023-01-17T17:31:12.404Z",
    "size": 6175,
    "path": "../public/_nuxt/icons/152x152.405b10f0.png"
  },
  "/_nuxt/icons/152x152.maskable.405b10f0.png": {
    "type": "image/png",
    "etag": "\"11ff-s/KdfUfOuf/ejOBQkg8J2FPv0/E\"",
    "mtime": "2023-01-17T17:31:12.403Z",
    "size": 4607,
    "path": "../public/_nuxt/icons/152x152.maskable.405b10f0.png"
  },
  "/_nuxt/icons/192x192.405b10f0.png": {
    "type": "image/png",
    "etag": "\"23b0-s+A25Fk5Nx1JFyYCUV2Vzdtqhx8\"",
    "mtime": "2023-01-17T17:31:12.402Z",
    "size": 9136,
    "path": "../public/_nuxt/icons/192x192.405b10f0.png"
  },
  "/_nuxt/icons/192x192.maskable.405b10f0.png": {
    "type": "image/png",
    "etag": "\"1389-EO+kcKUMOrhfZh/erDnD464n3fI\"",
    "mtime": "2023-01-17T17:31:12.400Z",
    "size": 5001,
    "path": "../public/_nuxt/icons/192x192.maskable.405b10f0.png"
  },
  "/_nuxt/icons/384x384.405b10f0.png": {
    "type": "image/png",
    "etag": "\"76c5-oQIOOGplKhhgxiasoFaJdEP21Tw\"",
    "mtime": "2023-01-17T17:31:12.400Z",
    "size": 30405,
    "path": "../public/_nuxt/icons/384x384.405b10f0.png"
  },
  "/_nuxt/icons/384x384.maskable.405b10f0.png": {
    "type": "image/png",
    "etag": "\"411b-B86KdfPcbU18gmULSLvcZkhEqvU\"",
    "mtime": "2023-01-17T17:31:12.399Z",
    "size": 16667,
    "path": "../public/_nuxt/icons/384x384.maskable.405b10f0.png"
  },
  "/_nuxt/icons/512x512.405b10f0.png": {
    "type": "image/png",
    "etag": "\"c638-skrTiL1x4VYZepOkrZSqAcC62Ts\"",
    "mtime": "2023-01-17T17:31:12.399Z",
    "size": 50744,
    "path": "../public/_nuxt/icons/512x512.405b10f0.png"
  },
  "/_nuxt/icons/512x512.maskable.405b10f0.png": {
    "type": "image/png",
    "etag": "\"6e47-WacVpE7uXYl7ZiREpLsGtoq/VEE\"",
    "mtime": "2023-01-17T17:31:12.398Z",
    "size": 28231,
    "path": "../public/_nuxt/icons/512x512.maskable.405b10f0.png"
  },
  "/_nuxt/icons/64x64.405b10f0.png": {
    "type": "image/png",
    "etag": "\"abc-1KOQDjNQYSbAOIUsgXmOFndL9o4\"",
    "mtime": "2023-01-17T17:31:12.398Z",
    "size": 2748,
    "path": "../public/_nuxt/icons/64x64.405b10f0.png"
  },
  "/_nuxt/icons/64x64.maskable.405b10f0.png": {
    "type": "image/png",
    "etag": "\"6c4-biC9h/oXkXKXNWyUW1U82WyoTGw\"",
    "mtime": "2023-01-17T17:31:12.397Z",
    "size": 1732,
    "path": "../public/_nuxt/icons/64x64.maskable.405b10f0.png"
  },
  "/_nuxt/splash/1125x2436.405b10f0.png": {
    "type": "image/png",
    "etag": "\"d70b-u8Wo7yRLQxoJVyxHuvIuQPitNOc\"",
    "mtime": "2023-01-17T17:31:12.393Z",
    "size": 55051,
    "path": "../public/_nuxt/splash/1125x2436.405b10f0.png"
  },
  "/_nuxt/splash/1136x640.405b10f0.png": {
    "type": "image/png",
    "etag": "\"a8e9-3/DFZ2sFLW4cvcYPGAGwoJQh3SA\"",
    "mtime": "2023-01-17T17:31:12.390Z",
    "size": 43241,
    "path": "../public/_nuxt/splash/1136x640.405b10f0.png"
  },
  "/_nuxt/splash/1170x2532.405b10f0.png": {
    "type": "image/png",
    "etag": "\"de64-fIbUKoF+gK4Gld7MLq7n5mcGINQ\"",
    "mtime": "2023-01-17T17:31:12.389Z",
    "size": 56932,
    "path": "../public/_nuxt/splash/1170x2532.405b10f0.png"
  },
  "/_nuxt/splash/1242x2208.405b10f0.png": {
    "type": "image/png",
    "etag": "\"d83f-9rhL/A7ssSyRozBkWaIZPydS7hA\"",
    "mtime": "2023-01-17T17:31:12.388Z",
    "size": 55359,
    "path": "../public/_nuxt/splash/1242x2208.405b10f0.png"
  },
  "/_nuxt/splash/1242x2688.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e735-sLMYOqFYO2Vj9i5CEoWmFI70imI\"",
    "mtime": "2023-01-17T17:31:12.388Z",
    "size": 59189,
    "path": "../public/_nuxt/splash/1242x2688.405b10f0.png"
  },
  "/_nuxt/splash/1284x2778.405b10f0.png": {
    "type": "image/png",
    "etag": "\"eaf8-5NpC6aN/z7nZvW36O1WrqRRLlWY\"",
    "mtime": "2023-01-17T17:31:12.387Z",
    "size": 60152,
    "path": "../public/_nuxt/splash/1284x2778.405b10f0.png"
  },
  "/_nuxt/splash/1334x750.405b10f0.png": {
    "type": "image/png",
    "etag": "\"b210-/qJn9fYqicbPavnW6QySBKbtt5w\"",
    "mtime": "2023-01-17T17:31:12.386Z",
    "size": 45584,
    "path": "../public/_nuxt/splash/1334x750.405b10f0.png"
  },
  "/_nuxt/splash/1536x2048.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e21f-O5+OcjGd7uYbF0q3FU7k6oTt3Dc\"",
    "mtime": "2023-01-17T17:31:12.386Z",
    "size": 57887,
    "path": "../public/_nuxt/splash/1536x2048.405b10f0.png"
  },
  "/_nuxt/splash/1620x2160.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e721-6SzkAE6tfceIcfS50AFdgpuXukc\"",
    "mtime": "2023-01-17T17:31:12.385Z",
    "size": 59169,
    "path": "../public/_nuxt/splash/1620x2160.405b10f0.png"
  },
  "/_nuxt/splash/1668x2224.405b10f0.png": {
    "type": "image/png",
    "etag": "\"ec1e-Sm7oEmUNQ4Eht31esqpdqU/G1oI\"",
    "mtime": "2023-01-17T17:31:12.383Z",
    "size": 60446,
    "path": "../public/_nuxt/splash/1668x2224.405b10f0.png"
  },
  "/_nuxt/splash/1668x2388.405b10f0.png": {
    "type": "image/png",
    "etag": "\"f012-5RTxyqGOVgDHqad7qIgq4mxZef0\"",
    "mtime": "2023-01-17T17:31:12.382Z",
    "size": 61458,
    "path": "../public/_nuxt/splash/1668x2388.405b10f0.png"
  },
  "/_nuxt/splash/1792x828.405b10f0.png": {
    "type": "image/png",
    "etag": "\"be3b-rXvlW9kK344k7FlpR85VZfKm7lM\"",
    "mtime": "2023-01-17T17:31:12.382Z",
    "size": 48699,
    "path": "../public/_nuxt/splash/1792x828.405b10f0.png"
  },
  "/_nuxt/splash/2048x1536.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e234-Bvk9iWMdaN5yVQ27utDnKCqo9W0\"",
    "mtime": "2023-01-17T17:31:12.381Z",
    "size": 57908,
    "path": "../public/_nuxt/splash/2048x1536.405b10f0.png"
  },
  "/_nuxt/splash/2160x1620.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e73a-vISgpD3Y77S7DYT+yXVZPbZiVKg\"",
    "mtime": "2023-01-17T17:31:12.380Z",
    "size": 59194,
    "path": "../public/_nuxt/splash/2160x1620.405b10f0.png"
  },
  "/_nuxt/splash/2208x1242.405b10f0.png": {
    "type": "image/png",
    "etag": "\"d7b7-ttoUR4A/LGtl6Z/GCJqMTYSWCts\"",
    "mtime": "2023-01-17T17:31:12.380Z",
    "size": 55223,
    "path": "../public/_nuxt/splash/2208x1242.405b10f0.png"
  },
  "/_nuxt/splash/2224x1668.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e969-aG0COBtK75FfQaMQTcXhalAoIxs\"",
    "mtime": "2023-01-17T17:31:12.378Z",
    "size": 59753,
    "path": "../public/_nuxt/splash/2224x1668.405b10f0.png"
  },
  "/_nuxt/splash/2388x1668.405b10f0.png": {
    "type": "image/png",
    "etag": "\"ecb8-iX9M/Nfmpw0ZtUK0ZUSNTm1Kl+w\"",
    "mtime": "2023-01-17T17:31:12.378Z",
    "size": 60600,
    "path": "../public/_nuxt/splash/2388x1668.405b10f0.png"
  },
  "/_nuxt/splash/2436x1125.405b10f0.png": {
    "type": "image/png",
    "etag": "\"d732-UJ0gXwvsgCxisEXDXyx1NT0xLkY\"",
    "mtime": "2023-01-17T17:31:12.377Z",
    "size": 55090,
    "path": "../public/_nuxt/splash/2436x1125.405b10f0.png"
  },
  "/_nuxt/splash/2532x1170.405b10f0.png": {
    "type": "image/png",
    "etag": "\"dab4-T8iY63O9jUz8MglhTW4uazuDXsc\"",
    "mtime": "2023-01-17T17:31:12.377Z",
    "size": 55988,
    "path": "../public/_nuxt/splash/2532x1170.405b10f0.png"
  },
  "/_nuxt/splash/2688x1242.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e226-J7wYtFfZH/bpDY5ZICtjvZA5/1c\"",
    "mtime": "2023-01-17T17:31:12.375Z",
    "size": 57894,
    "path": "../public/_nuxt/splash/2688x1242.405b10f0.png"
  },
  "/_nuxt/splash/2732x2048.405b10f0.png": {
    "type": "image/png",
    "etag": "\"10cb0-UWg6QS3DOUAVoou6bFxml/V8so4\"",
    "mtime": "2023-01-17T17:31:12.374Z",
    "size": 68784,
    "path": "../public/_nuxt/splash/2732x2048.405b10f0.png"
  },
  "/_nuxt/splash/2778x1284.405b10f0.png": {
    "type": "image/png",
    "etag": "\"e6da-TA6sS4YoAJFWmmbj28qdOTHRzrk\"",
    "mtime": "2023-01-17T17:31:12.374Z",
    "size": 59098,
    "path": "../public/_nuxt/splash/2778x1284.405b10f0.png"
  },
  "/_nuxt/splash/640x1136.405b10f0.png": {
    "type": "image/png",
    "etag": "\"a87c-Frh30MVF/KgRtzKHZKtFjpCtK8c\"",
    "mtime": "2023-01-17T17:31:12.373Z",
    "size": 43132,
    "path": "../public/_nuxt/splash/640x1136.405b10f0.png"
  },
  "/_nuxt/splash/750x1334.405b10f0.png": {
    "type": "image/png",
    "etag": "\"acd0-gGHka4NYRwtDFr43GfI82VQOTxI\"",
    "mtime": "2023-01-17T17:31:12.373Z",
    "size": 44240,
    "path": "../public/_nuxt/splash/750x1334.405b10f0.png"
  },
  "/_nuxt/splash/828x1792.405b10f0.png": {
    "type": "image/png",
    "etag": "\"bb31-RM3yrPBHIF8ZpcGFgl/0ycuVUEM\"",
    "mtime": "2023-01-17T17:31:12.372Z",
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

const _lazy_LZ5bhz = () => import('../_name_.mjs');
const _lazy_mKQlfi = () => import('../count.mjs');
const _lazy_LcKAiQ = () => import('../handlers/renderer.mjs');

const handlers = [
  { route: '', handler: _f4b49z, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _f6NkHf, lazy: false, middleware: true, method: undefined },
  { route: '/api/custom/:name', handler: _lazy_LZ5bhz, lazy: true, middleware: false, method: undefined },
  { route: '/api/count', handler: _lazy_mKQlfi, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_LcKAiQ, lazy: true, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_LcKAiQ, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const h3App = createApp({
    debug: destr(false),
    onError: errorHandler
  });
  h3App.use(config.app.baseURL, timingMiddleware);
  const router = createRouter();
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

export { useRuntimeConfig as a, getRouteRules as b, createError as c, defineEventHandler as d, eventHandler as e, getQuery as g, nodeServer as n, useNitroApp as u };
//# sourceMappingURL=node-server.mjs.map
