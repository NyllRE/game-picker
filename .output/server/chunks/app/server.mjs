import { getCurrentInstance, version, defineComponent, h as h$1, inject, computed, provide, ref, shallowRef, watch, onUnmounted, resolveComponent, reactive, useSSRContext, createApp, toRef, isRef, defineAsyncComponent, onErrorCaptured, unref, nextTick as nextTick$1, Teleport, withCtx, createVNode } from 'vue';
import { $fetch } from 'ofetch';
import { createHooks } from 'hookable';
import { getContext, executeAsync } from 'unctx';
import { hasProtocol, isEqual, parseURL, joinURL } from 'ufo';
import { createError as createError$1, sendRedirect } from 'h3';
import { routeLocationKey, useRoute as useRoute$1, matchedRouteKey, createRouter as createRouter$1, createMemoryHistory as createMemoryHistory$1, parseQuery } from 'vue-router';
import { useHead, createHead as createHead$1 } from '@unhead/vue';
import { renderDOMHead, debouncedRenderDOMHead } from '@unhead/dom';
import { ssrRenderSuspense, ssrRenderComponent } from 'vue/server-renderer';
import { a as useRuntimeConfig$1 } from '../nitro/node-server.mjs';
import 'node-fetch-native/polyfill';
import 'http';
import 'https';
import 'destr';
import 'unenv/runtime/fetch/index';
import 'scule';
import 'ohash';
import 'unstorage';
import 'defu';
import 'radix3';
import 'node:fs';
import 'node:url';
import 'pathe';

var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
const appConfig = useRuntimeConfig$1().app;
const baseURL = () => appConfig.baseURL;
const nuxtAppCtx = getContext("nuxt-app");
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    provide: void 0,
    globalName: "nuxt",
    payload: reactive({
      data: {},
      state: {},
      _errors: {},
      ...{ serverRendered: true }
    }),
    static: {
      data: {}
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: {},
    ...options
  };
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  {
    if (nuxtApp.ssrContext) {
      nuxtApp.ssrContext.nuxt = nuxtApp;
    }
    nuxtApp.ssrContext = nuxtApp.ssrContext || {};
    if (nuxtApp.ssrContext.payload) {
      Object.assign(nuxtApp.payload, nuxtApp.ssrContext.payload);
    }
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.payload.config = {
      public: options.ssrContext.runtimeConfig.public,
      app: options.ssrContext.runtimeConfig.app
    };
  }
  const runtimeConfig = options.ssrContext.runtimeConfig;
  const compatibilityConfig = new Proxy(runtimeConfig, {
    get(target, prop) {
      var _a2;
      if (prop === "public") {
        return target.public;
      }
      return (_a2 = target[prop]) != null ? _a2 : target.public[prop];
    },
    set(target, prop, value) {
      {
        return false;
      }
    }
  });
  nuxtApp.provide("config", compatibilityConfig);
  return nuxtApp;
}
async function applyPlugin(nuxtApp, plugin) {
  if (typeof plugin !== "function") {
    return;
  }
  const { provide: provide2 } = await callWithNuxt(nuxtApp, plugin, [nuxtApp]) || {};
  if (provide2 && typeof provide2 === "object") {
    for (const key in provide2) {
      nuxtApp.provide(key, provide2[key]);
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  for (const plugin of plugins2) {
    await applyPlugin(nuxtApp, plugin);
  }
}
function normalizePlugins(_plugins2) {
  const plugins2 = _plugins2.map((plugin) => {
    if (typeof plugin !== "function") {
      return null;
    }
    if (plugin.length > 1) {
      return (nuxtApp) => plugin(nuxtApp, nuxtApp.provide);
    }
    return plugin;
  }).filter(Boolean);
  return plugins2;
}
function defineNuxtPlugin(plugin) {
  plugin[NuxtPluginIndicator] = true;
  return plugin;
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => args ? setup(...args) : setup();
  {
    return nuxtAppCtx.callAsync(nuxt, fn);
  }
}
function useNuxtApp() {
  const nuxtAppInstance = nuxtAppCtx.tryUse();
  if (!nuxtAppInstance) {
    const vm = getCurrentInstance();
    if (!vm) {
      throw new Error("nuxt instance unavailable");
    }
    return vm.appContext.app.$nuxt;
  }
  return nuxtAppInstance;
}
function useRuntimeConfig() {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const useError = () => toRef(useNuxtApp().payload, "error");
const showError = (_err) => {
  const err = createError(_err);
  try {
    const nuxtApp = useNuxtApp();
    nuxtApp.callHook("app:error", err);
    const error = useError();
    error.value = error.value || err;
  } catch {
    throw err;
  }
  return err;
};
const createError = (err) => {
  const _err = createError$1(err);
  _err.__nuxt_error = true;
  return _err;
};
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = "$s" + _key;
  const nuxt = useNuxtApp();
  const state = toRef(nuxt.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxt.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
const useRouter = () => {
  var _a2;
  return (_a2 = useNuxtApp()) == null ? void 0 : _a2.$router;
};
const useRoute = () => {
  if (getCurrentInstance()) {
    return inject("_route", useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
const defineNuxtRouteMiddleware = (middleware) => middleware;
const navigateTo = (to, options) => {
  if (!to) {
    to = "/";
  }
  const toPath = typeof to === "string" ? to : to.path || "/";
  const isExternal = hasProtocol(toPath, true);
  if (isExternal && !(options == null ? void 0 : options.external)) {
    throw new Error("Navigating to external URL is not allowed by default. Use `nagivateTo (url, { external: true })`.");
  }
  if (isExternal && parseURL(toPath).protocol === "script:") {
    throw new Error("Cannot navigate to an URL with script protocol.");
  }
  const router = useRouter();
  {
    const nuxtApp = useNuxtApp();
    if (nuxtApp.ssrContext && nuxtApp.ssrContext.event) {
      const redirectLocation = isExternal ? toPath : joinURL(useRuntimeConfig().app.baseURL, router.resolve(to).fullPath || "/");
      return nuxtApp.callHook("app:redirected").then(() => sendRedirect(nuxtApp.ssrContext.event, redirectLocation, (options == null ? void 0 : options.redirectCode) || 302));
    }
  }
  if (isExternal) {
    if (options == null ? void 0 : options.replace) {
      location.replace(toPath);
    } else {
      location.href = toPath;
    }
    return Promise.resolve();
  }
  return (options == null ? void 0 : options.replace) ? router.replace(to) : router.push(to);
};
const firstNonUndefined = (...args) => args.find((arg) => arg !== void 0);
const DEFAULT_EXTERNAL_REL_ATTRIBUTE = "noopener noreferrer";
function defineNuxtLink(options) {
  const componentName = options.componentName || "NuxtLink";
  return defineComponent({
    name: componentName,
    props: {
      to: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      href: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      target: {
        type: String,
        default: void 0,
        required: false
      },
      rel: {
        type: String,
        default: void 0,
        required: false
      },
      noRel: {
        type: Boolean,
        default: void 0,
        required: false
      },
      prefetch: {
        type: Boolean,
        default: void 0,
        required: false
      },
      noPrefetch: {
        type: Boolean,
        default: void 0,
        required: false
      },
      activeClass: {
        type: String,
        default: void 0,
        required: false
      },
      exactActiveClass: {
        type: String,
        default: void 0,
        required: false
      },
      prefetchedClass: {
        type: String,
        default: void 0,
        required: false
      },
      replace: {
        type: Boolean,
        default: void 0,
        required: false
      },
      ariaCurrentValue: {
        type: String,
        default: void 0,
        required: false
      },
      external: {
        type: Boolean,
        default: void 0,
        required: false
      },
      custom: {
        type: Boolean,
        default: void 0,
        required: false
      }
    },
    setup(props, { slots }) {
      const router = useRouter();
      const to = computed(() => {
        return props.to || props.href || "";
      });
      const isExternal = computed(() => {
        if (props.external) {
          return true;
        }
        if (props.target && props.target !== "_self") {
          return true;
        }
        if (typeof to.value === "object") {
          return false;
        }
        return to.value === "" || hasProtocol(to.value, true);
      });
      const prefetched = ref(false);
      const el = void 0;
      return () => {
        var _a2, _b2, _c2;
        if (!isExternal.value) {
          return h$1(
            resolveComponent("RouterLink"),
            {
              ref: void 0,
              to: to.value,
              ...prefetched.value && !props.custom ? { class: props.prefetchedClass || options.prefetchedClass } : {},
              activeClass: props.activeClass || options.activeClass,
              exactActiveClass: props.exactActiveClass || options.exactActiveClass,
              replace: props.replace,
              ariaCurrentValue: props.ariaCurrentValue,
              custom: props.custom
            },
            slots.default
          );
        }
        const href = typeof to.value === "object" ? (_b2 = (_a2 = router.resolve(to.value)) == null ? void 0 : _a2.href) != null ? _b2 : null : to.value || null;
        const target = props.target || null;
        const rel = props.noRel ? null : firstNonUndefined(props.rel, options.externalRelAttribute, href ? DEFAULT_EXTERNAL_REL_ATTRIBUTE : "") || null;
        const navigate = () => navigateTo(href, { replace: props.replace });
        if (props.custom) {
          if (!slots.default) {
            return null;
          }
          return slots.default({
            href,
            navigate,
            route: router.resolve(href),
            rel,
            target,
            isExternal: isExternal.value,
            isActive: false,
            isExactActive: false
          });
        }
        return h$1("a", { ref: el, href, rel, target }, (_c2 = slots.default) == null ? void 0 : _c2.call(slots));
      };
    }
  });
}
const __nuxt_component_0 = defineNuxtLink({ componentName: "NuxtLink" });
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
const defuFn = createDefu((object, key, currentValue, _namespace) => {
  if (typeof object[key] !== "undefined" && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});
const inlineConfig = {};
defuFn(inlineConfig);
const createLocationHistory = () => {
  const locationHistory = [];
  const tabsHistory = {};
  const add = (routeInfo) => {
    switch (routeInfo.routerAction) {
      case "pop":
        pop(routeInfo);
        break;
      default:
        addRoute(routeInfo);
        break;
    }
    if (routeInfo.routerDirection === "root") {
      clearHistory();
      addRoute(routeInfo);
    }
  };
  const update = (routeInfo) => {
    const locationIndex = locationHistory.findIndex((x) => x.id === routeInfo.id);
    if (locationIndex > -1) {
      locationHistory.splice(locationIndex, 1, routeInfo);
    }
    const tabArray = tabsHistory[routeInfo.tab || ""];
    if (tabArray) {
      const tabIndex = tabArray.findIndex((x) => x.id === routeInfo.id);
      if (tabIndex > -1) {
        tabArray.splice(tabIndex, 1, routeInfo);
      } else {
        tabArray.push(routeInfo);
      }
    } else if (routeInfo.tab) {
      tabsHistory[routeInfo.tab] = [routeInfo];
    }
  };
  const pop = (routeInfo) => {
    const tabHistory = getTabsHistory(routeInfo.tab);
    let ri;
    if (tabHistory) {
      ri = tabHistory[tabHistory.length - 1];
      while (ri && ri.id !== routeInfo.id) {
        tabHistory.pop();
        ri = tabHistory[tabHistory.length - 1];
      }
      tabHistory.pop();
      tabHistory.push(routeInfo);
    }
    ri = locationHistory[locationHistory.length - 1];
    while (ri && ri.id !== routeInfo.id) {
      locationHistory.pop();
      ri = locationHistory[locationHistory.length - 1];
    }
    locationHistory.pop();
    locationHistory.push(routeInfo);
  };
  const addRoute = (routeInfo) => {
    const tabHistory = getTabsHistory(routeInfo.tab);
    if (tabHistory) {
      if (tabHistory[tabHistory.length - 1] && tabHistory[tabHistory.length - 1].id === routeInfo.id) {
        tabHistory.pop();
      }
      tabHistory.push(routeInfo);
    }
    locationHistory.push(routeInfo);
  };
  const clearHistory = (routeInfo) => {
    if (routeInfo) {
      const { position, tab } = routeInfo;
      const existingRouteIndex = locationHistory.findIndex((r) => r.position === position);
      if (existingRouteIndex === -1)
        return;
      locationHistory.splice(existingRouteIndex);
      const clearTabHistory = (tab2) => {
        const existingTabRouteIndex = tabsHistory[tab2].findIndex((r) => r.position === position);
        if (existingTabRouteIndex === -1)
          return;
        tabsHistory[tab2].splice(existingTabRouteIndex);
      };
      const tabHistory = tabsHistory[tab];
      if (tab && tabHistory) {
        clearTabHistory(tab);
      } else {
        for (const tab2 in tabsHistory) {
          clearTabHistory(tab2);
        }
      }
    } else {
      for (const tab in tabsHistory) {
        tabsHistory[tab] = [];
      }
      locationHistory.length = 0;
    }
  };
  const getTabsHistory = (tab) => {
    let history;
    if (tab) {
      history = tabsHistory[tab];
      if (!history) {
        history = tabsHistory[tab] = [];
      }
    }
    return history;
  };
  const size = () => locationHistory.length;
  const current = (initialHistory, currentHistory) => {
    const index = currentHistory - initialHistory;
    return locationHistory[index] || last();
  };
  const last = () => locationHistory[locationHistory.length - 1];
  const canGoBack = (deep = 1, initialHistory, currentHistory) => {
    return currentHistory - deep >= initialHistory;
  };
  const getFirstRouteInfoForTab = (tab) => {
    const tabHistory = getTabsHistory(tab);
    if (tabHistory) {
      return tabHistory[0];
    }
    return void 0;
  };
  const getCurrentRouteInfoForTab = (tab) => {
    const tabHistory = getTabsHistory(tab);
    if (tabHistory) {
      return tabHistory[tabHistory.length - 1];
    }
    return void 0;
  };
  const findLastLocation = (routeInfo, delta = -1) => {
    const routeInfos = getTabsHistory(routeInfo.tab);
    if (routeInfos) {
      if (delta < -1) {
        return routeInfos[routeInfos.length - 1 + delta];
      } else {
        for (let i = routeInfos.length - 2; i >= 0; i--) {
          const ri = routeInfos[i];
          if (ri) {
            if (ri.pathname === routeInfo.pushedByRoute) {
              return ri;
            }
          }
        }
      }
    }
    if (delta < -1) {
      return locationHistory[locationHistory.length - 1 + delta];
    } else {
      for (let i = locationHistory.length - 2; i >= 0; i--) {
        const ri = locationHistory[i];
        if (ri) {
          if (ri.pathname === routeInfo.pushedByRoute) {
            return ri;
          }
        }
      }
    }
    return void 0;
  };
  return {
    current,
    size,
    last,
    add,
    canGoBack,
    update,
    getFirstRouteInfoForTab,
    getCurrentRouteInfoForTab,
    findLastLocation,
    clearHistory
  };
};
const ids$2 = { main: 0 };
const generateId$1 = (type = "main") => {
  var _a2;
  const id = ((_a2 = ids$2[type]) !== null && _a2 !== void 0 ? _a2 : 0) + 1;
  ids$2[type] = id;
  return id.toString();
};
const createIonRouter = (opts, router) => {
  let currentNavigationInfo = { direction: void 0, action: void 0, delta: void 0 };
  router.afterEach((to, _, failure) => {
    if (failure)
      return;
    const { direction, action, delta } = currentNavigationInfo;
    currentHistoryPosition = opts.history.state.position;
    const replaceAction = opts.history.state.replaced ? "replace" : void 0;
    handleHistoryChange(to, action || replaceAction, direction, delta);
    currentNavigationInfo = { direction: void 0, action: void 0, delta: void 0 };
  });
  const locationHistory = createLocationHistory();
  let initialHistoryPosition = opts.history.state.position;
  let currentHistoryPosition = opts.history.state.position;
  let currentRouteInfo;
  let incomingRouteParams;
  let historyChangeListeners = [];
  opts.history.listen((_, _x, info) => {
    currentNavigationInfo = {
      delta: info.delta,
      action: info.type === "pop" && info.delta >= 1 ? "push" : info.type,
      direction: info.direction === "" ? "forward" : info.direction
    };
  });
  const handleNavigateBack = (defaultHref, routerAnimation) => {
    const routeInfo = locationHistory.current(initialHistoryPosition, currentHistoryPosition);
    if (routeInfo && routeInfo.pushedByRoute) {
      const prevInfo = locationHistory.findLastLocation(routeInfo);
      if (prevInfo) {
        incomingRouteParams = Object.assign(Object.assign({}, prevInfo), { routerAction: "pop", routerDirection: "back", routerAnimation: routerAnimation || routeInfo.routerAnimation });
        if (routeInfo.lastPathname === routeInfo.pushedByRoute || prevInfo.pathname === routeInfo.pushedByRoute && !routeInfo.tab && !prevInfo.tab) {
          router.back();
        } else {
          router.go(prevInfo.position - routeInfo.position);
        }
      } else {
        handleNavigate(defaultHref, "pop", "back");
      }
    } else {
      handleNavigate(defaultHref, "pop", "back");
    }
  };
  const handleNavigate = (path, routerAction, routerDirection, routerAnimation, tab) => {
    setIncomingRouteParams(routerAction, routerDirection, routerAnimation, tab);
    if (routerAction === "push") {
      router.push(path);
    } else {
      router.replace(path);
    }
  };
  const handleHistoryChange = (location2, action, direction, delta) => {
    let leavingLocationInfo;
    if (incomingRouteParams) {
      if (incomingRouteParams.routerAction === "replace") {
        leavingLocationInfo = locationHistory.current(initialHistoryPosition, currentHistoryPosition);
      } else if (incomingRouteParams.routerAction === "pop") {
        leavingLocationInfo = locationHistory.current(initialHistoryPosition, currentHistoryPosition + 1);
        if (action === "replace") {
          locationHistory.clearHistory();
        }
      } else {
        const position = incomingRouteParams.routerDirection === "root" ? currentHistoryPosition : currentHistoryPosition - 1;
        leavingLocationInfo = locationHistory.current(initialHistoryPosition, position);
      }
    } else {
      leavingLocationInfo = currentRouteInfo;
    }
    if (!leavingLocationInfo) {
      leavingLocationInfo = {
        pathname: "",
        search: ""
      };
    }
    const leavingUrl = leavingLocationInfo.pathname + leavingLocationInfo.search;
    if (leavingUrl !== location2.fullPath) {
      if (!incomingRouteParams) {
        if (action === "replace") {
          incomingRouteParams = {
            routerAction: "replace",
            routerDirection: "none"
          };
        } else if (action === "pop") {
          const routeInfo2 = locationHistory.current(initialHistoryPosition, currentHistoryPosition - delta);
          if (routeInfo2 && routeInfo2.pushedByRoute) {
            const prevRouteInfo = locationHistory.findLastLocation(routeInfo2, delta);
            incomingRouteParams = Object.assign(Object.assign({}, prevRouteInfo), { routerAction: "pop", routerDirection: "back" });
          } else {
            incomingRouteParams = {
              routerAction: "pop",
              routerDirection: "none"
            };
          }
        }
        if (!incomingRouteParams) {
          incomingRouteParams = {
            routerAction: "push",
            routerDirection: direction || "forward"
          };
        }
      }
      let routeInfo;
      if (incomingRouteParams === null || incomingRouteParams === void 0 ? void 0 : incomingRouteParams.id) {
        routeInfo = Object.assign(Object.assign({}, incomingRouteParams), { lastPathname: leavingLocationInfo.pathname });
      } else {
        const isPushed = incomingRouteParams.routerAction === "push" && incomingRouteParams.routerDirection === "forward";
        routeInfo = Object.assign(Object.assign({ id: generateId$1("routeInfo") }, incomingRouteParams), { lastPathname: leavingLocationInfo.pathname, pathname: location2.path, search: location2.fullPath && location2.fullPath.split("?")[1] || "", params: location2.params && location2.params, prevRouteLastPathname: leavingLocationInfo.lastPathname });
        if (isPushed) {
          routeInfo.pushedByRoute = leavingLocationInfo.pathname !== "" ? leavingLocationInfo.pathname : void 0;
        } else if (routeInfo.routerAction === "pop") {
          const route = locationHistory.findLastLocation(routeInfo);
          routeInfo.pushedByRoute = route === null || route === void 0 ? void 0 : route.pushedByRoute;
        } else if (routeInfo.routerAction === "push" && routeInfo.tab !== leavingLocationInfo.tab) {
          const lastRoute = locationHistory.getCurrentRouteInfoForTab(routeInfo.tab);
          routeInfo.pushedByRoute = lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.pushedByRoute;
        } else if (routeInfo.routerAction === "replace") {
          const currentRouteInfo2 = locationHistory.current(initialHistoryPosition, currentHistoryPosition);
          const currentPushedBy = currentRouteInfo2 === null || currentRouteInfo2 === void 0 ? void 0 : currentRouteInfo2.pushedByRoute;
          const pushedByRoute = currentPushedBy !== void 0 && currentPushedBy !== routeInfo.pathname ? currentPushedBy : routeInfo.pushedByRoute;
          routeInfo.lastPathname = (currentRouteInfo2 === null || currentRouteInfo2 === void 0 ? void 0 : currentRouteInfo2.pathname) || routeInfo.lastPathname;
          routeInfo.pushedByRoute = pushedByRoute;
          routeInfo.routerDirection = (currentRouteInfo2 === null || currentRouteInfo2 === void 0 ? void 0 : currentRouteInfo2.routerDirection) || routeInfo.routerDirection;
          routeInfo.routerAnimation = (currentRouteInfo2 === null || currentRouteInfo2 === void 0 ? void 0 : currentRouteInfo2.routerAnimation) || routeInfo.routerAnimation;
          routeInfo.prevRouteLastPathname = currentRouteInfo2 === null || currentRouteInfo2 === void 0 ? void 0 : currentRouteInfo2.lastPathname;
        }
      }
      routeInfo.position = currentHistoryPosition;
      routeInfo.delta = delta;
      const historySize = locationHistory.size();
      const historyDiff = currentHistoryPosition - initialHistoryPosition;
      const isReplacing = historySize === historyDiff && historySize > 0 && action === "replace";
      if (historySize > historyDiff || isReplacing) {
        if ((routeInfo.routerAction === "push" || routeInfo.routerAction === "replace") && delta === void 0) {
          locationHistory.clearHistory(routeInfo);
          locationHistory.add(routeInfo);
        }
      } else {
        locationHistory.add(routeInfo);
      }
      if (locationHistory.size() === 1) {
        initialHistoryPosition = routeInfo.position;
      }
      currentRouteInfo = routeInfo;
    }
    incomingRouteParams = void 0;
    historyChangeListeners.forEach((cb) => cb(currentRouteInfo));
  };
  const getCurrentRouteInfo = () => currentRouteInfo;
  const canGoBack = (deep = 1) => locationHistory.canGoBack(deep, initialHistoryPosition, currentHistoryPosition);
  const navigate = (navigationOptions) => {
    const { routerAnimation, routerDirection, routerLink } = navigationOptions;
    setIncomingRouteParams("push", routerDirection, routerAnimation);
    router.push(routerLink);
  };
  const resetTab = (tab) => {
    const routeInfo = locationHistory.getFirstRouteInfoForTab(tab);
    if (routeInfo) {
      router.go(routeInfo.position - currentHistoryPosition);
    }
  };
  const changeTab = (tab, path) => {
    if (!path)
      return;
    const routeInfo = locationHistory.getCurrentRouteInfoForTab(tab);
    const [pathname] = path.split("?");
    if (routeInfo) {
      incomingRouteParams = Object.assign(Object.assign({}, incomingRouteParams), { routerAction: "push", routerDirection: "none", tab });
      if (routeInfo.pathname === pathname) {
        router.push({ path: routeInfo.pathname, query: parseQuery(routeInfo.search) });
      } else {
        router.push({ path: pathname, query: parseQuery(routeInfo.search) });
      }
    } else {
      handleNavigate(pathname, "push", "none", void 0, tab);
    }
  };
  const handleSetCurrentTab = (tab) => {
    const ri = Object.assign({}, locationHistory.current(initialHistoryPosition, currentHistoryPosition));
    if (ri.tab !== tab) {
      ri.tab = tab;
      locationHistory.update(ri);
    }
    const pushedByRoute = locationHistory.findLastLocation(ri);
    if (ri.pushedByRoute !== ri.lastPathname && (pushedByRoute === null || pushedByRoute === void 0 ? void 0 : pushedByRoute.tab) !== tab) {
      ri.pushedByRoute = void 0;
      locationHistory.update(ri);
    }
  };
  const registerHistoryChangeListener = (cb) => {
    historyChangeListeners.push(cb);
  };
  const setIncomingRouteParams = (routerAction = "push", routerDirection = "forward", routerAnimation, tab) => {
    incomingRouteParams = {
      routerAction,
      routerDirection,
      routerAnimation,
      tab
    };
  };
  const goBack = (routerAnimation) => {
    setIncomingRouteParams("pop", "back", routerAnimation);
    router.back();
  };
  const goForward = (routerAnimation) => {
    setIncomingRouteParams("push", "forward", routerAnimation);
    router.forward();
  };
  const getLeavingRouteInfo = () => {
    return locationHistory.current(initialHistoryPosition, currentHistoryPosition);
  };
  return {
    handleNavigate,
    getLeavingRouteInfo,
    handleNavigateBack,
    handleSetCurrentTab,
    getCurrentRouteInfo,
    canGoBack,
    navigate,
    resetTab,
    changeTab,
    registerHistoryChangeListener,
    goBack,
    goForward
  };
};
const createViewStacks = (router) => {
  let viewStacks = {};
  const size = () => Object.keys(viewStacks).length;
  const clear = (outletId) => {
    delete viewStacks[outletId];
  };
  const getViewStack = (outletId) => {
    return viewStacks[outletId];
  };
  const registerIonPage = (viewItem, ionPage) => {
    viewItem.ionPageElement = ionPage;
    viewItem.ionRoute = true;
    viewItem.matchedRoute.instances = { default: viewItem.vueComponentRef.value };
  };
  const findViewItemByRouteInfo = (routeInfo, outletId) => {
    return findViewItemByPath(routeInfo.pathname, outletId, false);
  };
  const findLeavingViewItemByRouteInfo = (routeInfo, outletId, mustBeIonRoute = true) => {
    return findViewItemByPath(routeInfo.lastPathname, outletId, mustBeIonRoute);
  };
  const findViewItemByPathname = (pathname, outletId) => {
    return findViewItemByPath(pathname, outletId, false);
  };
  const findViewItemInStack = (path, stack) => {
    return stack.find((viewItem) => {
      if (viewItem.pathname === path) {
        return viewItem;
      }
      return void 0;
    });
  };
  const findViewItemByPath = (path, outletId, mustBeIonRoute = false) => {
    const matchView = (viewItem) => {
      if (mustBeIonRoute && !viewItem.ionRoute || path === "") {
        return false;
      }
      const resolvedPath = router.resolve(path);
      const findMatchedRoute = resolvedPath.matched.find((matchedRoute) => matchedRoute === viewItem.matchedRoute);
      if (findMatchedRoute) {
        const hasParameter = findMatchedRoute.path.includes(":");
        if (hasParameter && path !== viewItem.pathname) {
          return false;
        }
        return viewItem;
      }
      return void 0;
    };
    if (outletId) {
      const stack = viewStacks[outletId];
      if (!stack)
        return void 0;
      const match = router ? stack.find(matchView) : findViewItemInStack(path, stack);
      if (match)
        return match;
    } else {
      for (let outletId2 in viewStacks) {
        const stack = viewStacks[outletId2];
        const viewItem = findViewItemInStack(path, stack);
        if (viewItem) {
          return viewItem;
        }
      }
    }
    return void 0;
  };
  const createViewItem = (outletId, vueComponent, matchedRoute, routeInfo, ionPage) => {
    return {
      id: generateId$1("viewItem"),
      pathname: routeInfo.pathname,
      outletId,
      matchedRoute,
      ionPageElement: ionPage,
      vueComponent,
      vueComponentRef: shallowRef(),
      ionRoute: false,
      mount: false,
      exact: routeInfo.pathname === matchedRoute.path,
      params: routeInfo.params,
      vueComponentData: {}
    };
  };
  const add = (viewItem) => {
    const { outletId } = viewItem;
    if (!viewStacks[outletId]) {
      viewStacks[outletId] = [viewItem];
    } else {
      viewStacks[outletId].push(viewItem);
    }
  };
  const remove = (viewItem, outletId) => {
    if (!outletId) {
      throw Error("outletId required");
    }
    const viewStack = viewStacks[outletId];
    if (viewStack) {
      viewStacks[outletId] = viewStack.filter((item) => item.id !== viewItem.id);
    }
  };
  const getChildrenToRender = (outletId) => {
    const viewStack = viewStacks[outletId];
    if (viewStack) {
      const components2 = viewStacks[outletId].filter((v) => v.mount);
      return components2;
    }
    return [];
  };
  const unmountLeavingViews = (outletId, viewItem, delta = 1) => {
    const viewStack = viewStacks[outletId];
    if (!viewStack)
      return;
    const startIndex = viewStack.findIndex((v) => v === viewItem);
    for (let i = startIndex + 1; i < startIndex - delta; i++) {
      const viewItem2 = viewStack[i];
      viewItem2.mount = false;
      viewItem2.ionPageElement = void 0;
      viewItem2.ionRoute = false;
      viewItem2.matchedRoute.instances = {};
    }
  };
  const mountIntermediaryViews = (outletId, viewItem, delta = 1) => {
    const viewStack = viewStacks[outletId];
    if (!viewStack)
      return;
    const startIndex = viewStack.findIndex((v) => v === viewItem);
    for (let i = startIndex + 1; i < startIndex + delta; i++) {
      viewStack[i].mount = true;
    }
  };
  return {
    unmountLeavingViews,
    mountIntermediaryViews,
    clear,
    findViewItemByRouteInfo,
    findLeavingViewItemByRouteInfo,
    findViewItemByPathname,
    createViewItem,
    getChildrenToRender,
    add,
    remove,
    registerIonPage,
    getViewStack,
    size
  };
};
const createRouter = (opts) => {
  const routerOptions2 = Object.assign({}, opts);
  delete routerOptions2.tabsPrefix;
  const router = createRouter$1(routerOptions2);
  const ionRouter = createIonRouter(opts, router);
  const viewStacks = createViewStacks(router);
  const oldInstall = router.install.bind(router);
  router.install = (app) => {
    app.provide("navManager", ionRouter);
    app.provide("viewStacks", viewStacks);
    oldInstall(app);
  };
  const oldIsReady = router.isReady.bind(router);
  router.isReady = () => oldIsReady();
  return router;
};
const createMemoryHistory = (base) => createMemoryHistory$1(base);
const validate = defineNuxtRouteMiddleware(async (to) => {
  var _a2;
  let __temp, __restore;
  if (!((_a2 = to.meta) == null ? void 0 : _a2.validate)) {
    return;
  }
  const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
  if (typeof result === "boolean") {
    return result;
  }
  return createError(result);
});
const auth_45global = defineNuxtRouteMiddleware((to) => {
  console.log("ran middleware");
});
const globalMiddleware = [
  validate,
  auth_45global
];
const namedMiddleware = {};
const appHead = { "meta": [{ "name": "msapplication-tap-highlight", "content": "no" }, { "name": "format-detection", "content": "telephone: no" }, { "name": "color-scheme", "content": "light dark" }, { "name": "viewport", "content": "width=device-width, initial-scale=1" }, { "charset": "utf-8" }, { "name": "mobile-web-app-capable", "content": "yes" }, { "name": "apple-mobile-web-app-capable", "content": "yes" }, { "name": "apple-mobile-web-app-status-bar-style", "content": "default" }, { "name": "apple-mobile-web-app-title", "content": "nuxt-ionic-playground" }, { "name": "theme-color", "content": "#000000" }, { "property": "og:type", "content": "website" }, { "property": "og:title", "content": "nuxt-ionic-playground" }, { "property": "og:site_name", "content": "nuxt-ionic-playground" }], "link": [{ "href": "/_nuxt/splash/640x1136.405b10f0.png", "media": "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/750x1334.405b10f0.png", "media": "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/828x1792.405b10f0.png", "media": "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/1125x2436.405b10f0.png", "media": "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/1170x2532.405b10f0.png", "media": "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/1242x2208.405b10f0.png", "media": "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/1242x2688.405b10f0.png", "media": "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/1284x2778.405b10f0.png", "media": "(device-width: 642px) and (device-height: 1389px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/1536x2048.405b10f0.png", "media": "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/1620x2160.405b10f0.png", "media": "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/1668x2224.405b10f0.png", "media": "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/1668x2388.405b10f0.png", "media": "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/1136x640.405b10f0.png", "media": "(device-width: 568px) and (device-height: 320px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/1334x750.405b10f0.png", "media": "(device-width: 667px) and (device-height: 375px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/1792x828.405b10f0.png", "media": "(device-width: 896px) and (device-height: 414px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/2048x1536.405b10f0.png", "media": "(device-width: 1024px) and (device-height: 768px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/2160x1620.405b10f0.png", "media": "(device-width: 1080px) and (device-height: 810px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/2208x1242.405b10f0.png", "media": "(device-width: 736px) and (device-height: 414px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/2224x1668.405b10f0.png", "media": "(device-width: 1112px) and (device-height: 834px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/2388x1668.405b10f0.png", "media": "(device-width: 1194px) and (device-height: 834px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/2436x1125.405b10f0.png", "media": "(device-width: 812px) and (device-height: 375px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/2532x1170.405b10f0.png", "media": "(device-width: 844px) and (device-height: 390px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/2688x1242.405b10f0.png", "media": "(device-width: 896px) and (device-height: 414px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/2732x2048.405b10f0.png", "media": "(device-width: 1366px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)", "rel": "apple-touch-startup-image" }, { "href": "/_nuxt/splash/2778x1284.405b10f0.png", "media": "(device-width: 926px) and (device-height: 428px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)", "rel": "apple-touch-startup-image" }, { "rel": "shortcut icon", "href": "/_nuxt/icons/64x64.405b10f0.png" }, { "rel": "apple-touch-icon", "href": "/_nuxt/icons/512x512.maskable.405b10f0.png", "sizes": "512x512" }, { "rel": "manifest", "href": "/manifest.json" }], "style": [], "script": [], "noscript": [], "viewport": "viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no", "title": "nuxt-ionic-playground", "htmlAttrs": { "lang": "en" } };
const appPageTransition = false;
const routerOptions0 = {
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp();
    let position = savedPosition || void 0;
    if (!position && from && to && to.meta.scrollToTop !== false && _isDifferentRoute(from, to)) {
      position = { left: 0, top: 0 };
    }
    if (to.path === from.path) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash) };
      }
    }
    const hasTransition = (route) => {
      var _a2;
      return !!((_a2 = route.meta.pageTransition) != null ? _a2 : appPageTransition);
    };
    const hookToWait = hasTransition(from) && hasTransition(to) ? "page:transition:finish" : "page:finish";
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce(hookToWait, async () => {
        await nextTick$1();
        if (to.hash) {
          position = { el: to.hash, top: _getHashElementScrollMarginTop(to.hash) };
        }
        resolve(position);
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = document.querySelector(selector);
    if (elem) {
      return parseFloat(getComputedStyle(elem).scrollMarginTop);
    }
  } catch {
  }
  return 0;
}
function _isDifferentRoute(a, b) {
  const samePageComponent = a.matched[0] === b.matched[0];
  if (!samePageComponent) {
    return true;
  }
  if (samePageComponent && JSON.stringify(a.params) !== JSON.stringify(b.params)) {
    return true;
  }
  return false;
}
const configRouterOptions = {};
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0
};
const __nuxt_page_meta$4 = {};
const __nuxt_page_meta$3 = {
  alias: ["/", "/tabs"]
};
const __nuxt_page_meta$2 = {};
const __nuxt_page_meta$1 = {};
const __nuxt_page_meta = {};
const _routes = [
  {
    name: (_a = __nuxt_page_meta$4 == null ? void 0 : __nuxt_page_meta$4.name) != null ? _a : "tabs",
    path: (_b = __nuxt_page_meta$4 == null ? void 0 : __nuxt_page_meta$4.path) != null ? _b : "/tabs",
    file: "/home/nyll/dev/mobile/playground/pages/tabs.vue",
    children: [
      {
        name: (_c = __nuxt_page_meta$3 == null ? void 0 : __nuxt_page_meta$3.name) != null ? _c : "tabs-tab1",
        path: (_d = __nuxt_page_meta$3 == null ? void 0 : __nuxt_page_meta$3.path) != null ? _d : "tab1",
        file: "/home/nyll/dev/mobile/playground/pages/tabs/tab1.vue",
        children: [],
        meta: __nuxt_page_meta$3,
        alias: (__nuxt_page_meta$3 == null ? void 0 : __nuxt_page_meta$3.alias) || [],
        redirect: (__nuxt_page_meta$3 == null ? void 0 : __nuxt_page_meta$3.redirect) || void 0,
        component: () => import('./_nuxt/tab1.a5e649a3.mjs').then((m) => m.default || m)
      },
      {
        name: (_e = __nuxt_page_meta$2 == null ? void 0 : __nuxt_page_meta$2.name) != null ? _e : "tabs-tab2",
        path: (_f = __nuxt_page_meta$2 == null ? void 0 : __nuxt_page_meta$2.path) != null ? _f : "tab2",
        file: "/home/nyll/dev/mobile/playground/pages/tabs/tab2.vue",
        children: [],
        meta: __nuxt_page_meta$2,
        alias: (__nuxt_page_meta$2 == null ? void 0 : __nuxt_page_meta$2.alias) || [],
        redirect: (__nuxt_page_meta$2 == null ? void 0 : __nuxt_page_meta$2.redirect) || void 0,
        component: () => import('./_nuxt/tab2.240ab16a.mjs').then((m) => m.default || m)
      },
      {
        name: (_g = __nuxt_page_meta$1 == null ? void 0 : __nuxt_page_meta$1.name) != null ? _g : "tabs-tab3",
        path: (_h = __nuxt_page_meta$1 == null ? void 0 : __nuxt_page_meta$1.path) != null ? _h : "tab3",
        file: "/home/nyll/dev/mobile/playground/pages/tabs/tab3.vue",
        children: [],
        meta: __nuxt_page_meta$1,
        alias: (__nuxt_page_meta$1 == null ? void 0 : __nuxt_page_meta$1.alias) || [],
        redirect: (__nuxt_page_meta$1 == null ? void 0 : __nuxt_page_meta$1.redirect) || void 0,
        component: () => import('./_nuxt/tab3.03a9124a.mjs').then((m) => m.default || m)
      },
      {
        name: (_i = __nuxt_page_meta == null ? void 0 : __nuxt_page_meta.name) != null ? _i : "tabs-tab4",
        path: (_j = __nuxt_page_meta == null ? void 0 : __nuxt_page_meta.path) != null ? _j : "tab4",
        file: "/home/nyll/dev/mobile/playground/pages/tabs/tab4.vue",
        children: [],
        meta: __nuxt_page_meta,
        alias: (__nuxt_page_meta == null ? void 0 : __nuxt_page_meta.alias) || [],
        redirect: (__nuxt_page_meta == null ? void 0 : __nuxt_page_meta.redirect) || void 0,
        component: () => import('./_nuxt/tab4.c60a7cac.mjs').then((m) => m.default || m)
      }
    ],
    meta: __nuxt_page_meta$4,
    alias: (__nuxt_page_meta$4 == null ? void 0 : __nuxt_page_meta$4.alias) || [],
    redirect: (__nuxt_page_meta$4 == null ? void 0 : __nuxt_page_meta$4.redirect) || void 0,
    component: () => import('./_nuxt/tabs.2921fc2a.mjs').then((m) => m.default || m)
  }
];
const node_modules__64nuxtjs_ionic_dist_runtime_router_mjs_h7T2ZmMnVl = defineNuxtPlugin(async (nuxtApp) => {
  var _a2, _b2, _c2, _d2, _e2;
  let routerBase = useRuntimeConfig().app.baseURL;
  if (routerOptions.hashMode && !routerBase.includes("#")) {
    routerBase += "#";
  }
  const history = (_b2 = (_a2 = routerOptions.history) == null ? void 0 : _a2.call(routerOptions, routerBase)) != null ? _b2 : createMemoryHistory(routerBase);
  const routes = (_d2 = (_c2 = routerOptions.routes) == null ? void 0 : _c2.call(routerOptions, _routes)) != null ? _d2 : _routes;
  const initialURL = (_e2 = nuxtApp.ssrContext) == null ? void 0 : _e2.url;
  const router = createRouter({
    ...routerOptions,
    history,
    routes
  });
  nuxtApp.vueApp.use(router);
  const previousRoute = shallowRef(router.currentRoute.value);
  router.afterEach((_to, from) => {
    previousRoute.value = from;
  });
  Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
    get: () => previousRoute.value
  });
  const _route = shallowRef(router.resolve(initialURL));
  const syncCurrentRoute = () => {
    _route.value = router.currentRoute.value;
  };
  nuxtApp.hook("page:finish", syncCurrentRoute);
  router.afterEach((to, from) => {
    var _a3, _b3, _c3, _d3;
    if (((_b3 = (_a3 = to.matched[0]) == null ? void 0 : _a3.components) == null ? void 0 : _b3.default) === ((_d3 = (_c3 = from.matched[0]) == null ? void 0 : _c3.components) == null ? void 0 : _d3.default)) {
      syncCurrentRoute();
    }
  });
  const route = {};
  for (const key in _route.value) {
    route[key] = computed(() => _route.value[key]);
  }
  nuxtApp._route = reactive(route);
  nuxtApp._middleware = nuxtApp._middleware || {
    global: [],
    named: {}
  };
  useError();
  const initialLayout = useState("_layout");
  router.beforeEach(async (to, from) => {
    var _a3, _b3;
    to.meta = reactive(to.meta);
    if (nuxtApp.isHydrating) {
      to.meta.layout = (_a3 = initialLayout.value) != null ? _a3 : to.meta.layout;
    }
    nuxtApp._processingMiddleware = true;
    const middlewareEntries = /* @__PURE__ */ new Set([
      ...globalMiddleware,
      ...nuxtApp._middleware.global
    ]);
    for (const component of to.matched) {
      const componentMiddleware = component.meta.middleware;
      if (!componentMiddleware) {
        continue;
      }
      if (Array.isArray(componentMiddleware)) {
        for (const entry2 of componentMiddleware) {
          middlewareEntries.add(entry2);
        }
      } else {
        middlewareEntries.add(componentMiddleware);
      }
    }
    for (const entry2 of middlewareEntries) {
      const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await ((_b3 = namedMiddleware[entry2]) == null ? void 0 : _b3.call(namedMiddleware).then((r) => r.default || r)) : entry2;
      if (!middleware) {
        throw new Error(`Unknown route middleware: '${entry2}'.`);
      }
      const result = await callWithNuxt(nuxtApp, middleware, [to, from]);
      {
        if (result === false || result instanceof Error) {
          const error2 = result || createError$1({
            statusMessage: `Route navigation aborted: ${initialURL}`
          });
          return callWithNuxt(nuxtApp, showError, [error2]);
        }
      }
      if (result || result === false) {
        return result;
      }
    }
  });
  router.afterEach(async (to) => {
    delete nuxtApp._processingMiddleware;
    if (to.matched.length === 0) {
      callWithNuxt(nuxtApp, showError, [
        createError$1({
          statusCode: 404,
          fatal: false,
          statusMessage: `Page not found: ${to.fullPath}`
        })
      ]);
    } else if (to.matched[0].name === "404" && nuxtApp.ssrContext) {
      nuxtApp.ssrContext.event.res.statusCode = 404;
    } else {
      const currentURL = to.fullPath || "/";
      if (!isEqual(currentURL, initialURL)) {
        await callWithNuxt(nuxtApp, navigateTo, [currentURL]);
      }
    }
  });
  return { provide: { router } };
});
const components = {};
const _nuxt_components_plugin_mjs_KR1HBZs4kY = defineNuxtPlugin((nuxtApp) => {
  for (const name in components) {
    nuxtApp.vueApp.component(name, components[name]);
    nuxtApp.vueApp.component("Lazy" + name, components[name]);
  }
});
function createHead(initHeadObject) {
  const unhead = createHead$1();
  const legacyHead = {
    unhead,
    install(app) {
      if (version.startsWith("3")) {
        app.config.globalProperties.$head = unhead;
        app.provide("usehead", unhead);
      }
    },
    use(plugin) {
      unhead.use(plugin);
    },
    resolveTags() {
      return unhead.resolveTags();
    },
    headEntries() {
      return unhead.headEntries();
    },
    headTags() {
      return unhead.resolveTags();
    },
    push(input, options) {
      return unhead.push(input, options);
    },
    addEntry(input, options) {
      return unhead.push(input, options);
    },
    addHeadObjs(input, options) {
      return unhead.push(input, options);
    },
    addReactiveEntry(input, options) {
      const api = useHead(input, options);
      if (typeof api !== "undefined")
        return api.dispose;
      return () => {
      };
    },
    removeHeadObjs() {
    },
    updateDOM(document2, force) {
      if (force)
        renderDOMHead(unhead, { document: document2 });
      else
        debouncedRenderDOMHead(unhead, { delayFn: (fn) => setTimeout(() => fn(), 50), document: document2 });
    },
    internalHooks: unhead.hooks,
    hooks: {
      "before:dom": [],
      "resolved:tags": [],
      "resolved:entries": []
    }
  };
  unhead.addHeadObjs = legacyHead.addHeadObjs;
  unhead.updateDOM = legacyHead.updateDOM;
  unhead.hooks.hook("dom:beforeRender", (ctx) => {
    for (const hook of legacyHead.hooks["before:dom"]) {
      if (hook() === false)
        ctx.shouldRender = false;
    }
  });
  if (initHeadObject)
    legacyHead.addHeadObjs(initHeadObject);
  return legacyHead;
}
version.startsWith("2.");
const node_modules_nuxt_dist_head_runtime_lib_vueuse_head_plugin_mjs_D7WGfuP1A0 = defineNuxtPlugin((nuxtApp) => {
  const head = createHead();
  head.push(appHead);
  nuxtApp.vueApp.use(head);
  nuxtApp._useHead = useHead;
  {
    nuxtApp.ssrContext.renderMeta = async () => {
      const { renderSSRHead } = await import('@unhead/ssr');
      const meta = await renderSSRHead(head.unhead);
      return {
        ...meta,
        bodyScriptsPrepend: meta.bodyTagsOpen,
        bodyScripts: meta.bodyTags
      };
    };
  }
});
const BUILD = {
  allRenderFn: false,
  cmpDidLoad: true,
  cmpDidUnload: false,
  cmpDidUpdate: true,
  cmpDidRender: true,
  cmpWillLoad: true,
  cmpWillUpdate: true,
  cmpWillRender: true,
  connectedCallback: true,
  disconnectedCallback: true,
  element: true,
  event: true,
  hasRenderFn: true,
  lifecycle: true,
  hostListener: true,
  hostListenerTargetWindow: true,
  hostListenerTargetDocument: true,
  hostListenerTargetBody: true,
  hostListenerTargetParent: false,
  hostListenerTarget: true,
  member: true,
  method: true,
  mode: true,
  observeAttribute: true,
  prop: true,
  propMutable: true,
  reflect: true,
  scoped: true,
  shadowDom: true,
  slot: true,
  cssAnnotations: true,
  state: true,
  style: true,
  svg: true,
  updatable: true,
  vdomAttribute: true,
  vdomXlink: true,
  vdomClass: true,
  vdomFunctional: true,
  vdomKey: true,
  vdomListener: true,
  vdomRef: true,
  vdomPropOrAttr: true,
  vdomRender: true,
  vdomStyle: true,
  vdomText: true,
  watchCallback: true,
  taskQueue: true,
  hotModuleReplacement: false,
  isDebug: false,
  isDev: false,
  isTesting: false,
  hydrateServerSide: false,
  hydrateClientSide: false,
  lifecycleDOMEvents: false,
  lazyLoad: false,
  profile: false,
  slotRelocation: true,
  appendChildSlotFix: false,
  cloneNodeFix: false,
  hydratedAttribute: false,
  hydratedClass: true,
  safari10: false,
  scriptDataOpts: false,
  scopedSlotTextContentFix: false,
  shadowDomShim: false,
  slotChildNodesFix: false,
  invisiblePrehydration: true,
  propBoolean: true,
  propNumber: true,
  propString: true,
  cssVarShim: false,
  constructableCSS: true,
  cmpShouldUpdate: true,
  devTools: false,
  dynamicImportShim: false,
  shadowDelegatesFocus: true,
  initializeNextTick: false,
  asyncLoading: false,
  asyncQueue: false,
  transformTagName: false,
  attachStyles: true
};
let scopeId;
let contentRef;
let hostTagName;
let useNativeShadowDom = false;
let checkSlotFallbackVisibility = false;
let checkSlotRelocate = false;
let isSvgMode = false;
let renderingRef = null;
let queuePending = false;
const Build = {
  isDev: false,
  isBrowser: true,
  isServer: false,
  isTesting: false
};
const getAssetPath = (path) => {
  const assetUrl = new URL(path, plt.$resourcesUrl$);
  return assetUrl.origin !== win$1.location.origin ? assetUrl.href : assetUrl.pathname;
};
const createTime = (fnName, tagName = "") => {
  {
    return () => {
      return;
    };
  }
};
const XLINK_NS = "http://www.w3.org/1999/xlink";
const EMPTY_OBJ = {};
const SVG_NS = "http://www.w3.org/2000/svg";
const HTML_NS = "http://www.w3.org/1999/xhtml";
const isDef = (v) => v != null;
const isComplexType = (o) => {
  o = typeof o;
  return o === "object" || o === "function";
};
const h = (nodeName, vnodeData, ...children) => {
  let child = null;
  let key = null;
  let slotName = null;
  let simple = false;
  let lastSimple = false;
  const vNodeChildren = [];
  const walk = (c) => {
    for (let i = 0; i < c.length; i++) {
      child = c[i];
      if (Array.isArray(child)) {
        walk(child);
      } else if (child != null && typeof child !== "boolean") {
        if (simple = typeof nodeName !== "function" && !isComplexType(child)) {
          child = String(child);
        }
        if (simple && lastSimple) {
          vNodeChildren[vNodeChildren.length - 1].$text$ += child;
        } else {
          vNodeChildren.push(simple ? newVNode(null, child) : child);
        }
        lastSimple = simple;
      }
    }
  };
  walk(children);
  if (vnodeData) {
    if (vnodeData.key) {
      key = vnodeData.key;
    }
    if (vnodeData.name) {
      slotName = vnodeData.name;
    }
    {
      const classData = vnodeData.className || vnodeData.class;
      if (classData) {
        vnodeData.class = typeof classData !== "object" ? classData : Object.keys(classData).filter((k) => classData[k]).join(" ");
      }
    }
  }
  if (typeof nodeName === "function") {
    return nodeName(vnodeData === null ? {} : vnodeData, vNodeChildren, vdomFnUtils);
  }
  const vnode = newVNode(nodeName, null);
  vnode.$attrs$ = vnodeData;
  if (vNodeChildren.length > 0) {
    vnode.$children$ = vNodeChildren;
  }
  {
    vnode.$key$ = key;
  }
  {
    vnode.$name$ = slotName;
  }
  return vnode;
};
const newVNode = (tag, text) => {
  const vnode = {
    $flags$: 0,
    $tag$: tag,
    $text$: text,
    $elm$: null,
    $children$: null
  };
  {
    vnode.$attrs$ = null;
  }
  {
    vnode.$key$ = null;
  }
  {
    vnode.$name$ = null;
  }
  return vnode;
};
const Host = {};
const isHost = (node) => node && node.$tag$ === Host;
const vdomFnUtils = {
  forEach: (children, cb) => children.map(convertToPublic).forEach(cb),
  map: (children, cb) => children.map(convertToPublic).map(cb).map(convertToPrivate)
};
const convertToPublic = (node) => ({
  vattrs: node.$attrs$,
  vchildren: node.$children$,
  vkey: node.$key$,
  vname: node.$name$,
  vtag: node.$tag$,
  vtext: node.$text$
});
const convertToPrivate = (node) => {
  if (typeof node.vtag === "function") {
    const vnodeData = Object.assign({}, node.vattrs);
    if (node.vkey) {
      vnodeData.key = node.vkey;
    }
    if (node.vname) {
      vnodeData.name = node.vname;
    }
    return h(node.vtag, vnodeData, ...node.vchildren || []);
  }
  const vnode = newVNode(node.vtag, node.vtext);
  vnode.$attrs$ = node.vattrs;
  vnode.$children$ = node.vchildren;
  vnode.$key$ = node.vkey;
  vnode.$name$ = node.vname;
  return vnode;
};
const computeMode = (elm) => modeResolutionChain.map((h2) => h2(elm)).find((m) => !!m);
const getMode = (ref2) => getHostRef(ref2).$modeName$;
const parsePropertyValue = (propValue, propType) => {
  if (propValue != null && !isComplexType(propValue)) {
    if (propType & 4) {
      return propValue === "false" ? false : propValue === "" || !!propValue;
    }
    if (propType & 2) {
      return parseFloat(propValue);
    }
    if (propType & 1) {
      return String(propValue);
    }
    return propValue;
  }
  return propValue;
};
const getElement = (ref2) => ref2;
const createEvent = (ref2, name, flags) => {
  const elm = getElement(ref2);
  return {
    emit: (detail) => {
      return emitEvent(elm, name, {
        bubbles: !!(flags & 4),
        composed: !!(flags & 2),
        cancelable: !!(flags & 1),
        detail
      });
    }
  };
};
const emitEvent = (elm, name, opts) => {
  const ev = plt.ce(name, opts);
  elm.dispatchEvent(ev);
  return ev;
};
const rootAppliedStyles = /* @__PURE__ */ new WeakMap();
const registerStyle = (scopeId2, cssText, allowCS) => {
  let style = styles.get(scopeId2);
  if (supportsConstructableStylesheets && allowCS) {
    style = style || new CSSStyleSheet();
    if (typeof style === "string") {
      style = cssText;
    } else {
      style.replaceSync(cssText);
    }
  } else {
    style = cssText;
  }
  styles.set(scopeId2, style);
};
const addStyle = (styleContainerNode, cmpMeta, mode, hostElm) => {
  let scopeId2 = getScopeId(cmpMeta, mode);
  const style = styles.get(scopeId2);
  styleContainerNode = styleContainerNode.nodeType === 11 ? styleContainerNode : doc;
  if (style) {
    if (typeof style === "string") {
      styleContainerNode = styleContainerNode.head || styleContainerNode;
      let appliedStyles = rootAppliedStyles.get(styleContainerNode);
      let styleElm;
      if (!appliedStyles) {
        rootAppliedStyles.set(styleContainerNode, appliedStyles = /* @__PURE__ */ new Set());
      }
      if (!appliedStyles.has(scopeId2)) {
        {
          {
            styleElm = doc.createElement("style");
            styleElm.innerHTML = style;
          }
          styleContainerNode.insertBefore(styleElm, styleContainerNode.querySelector("link"));
        }
        if (appliedStyles) {
          appliedStyles.add(scopeId2);
        }
      }
    } else if (!styleContainerNode.adoptedStyleSheets.includes(style)) {
      styleContainerNode.adoptedStyleSheets = [...styleContainerNode.adoptedStyleSheets, style];
    }
  }
  return scopeId2;
};
const attachStyles = (hostRef) => {
  const cmpMeta = hostRef.$cmpMeta$;
  const elm = hostRef.$hostElement$;
  const flags = cmpMeta.$flags$;
  const endAttachStyles = createTime("attachStyles", cmpMeta.$tagName$);
  const scopeId2 = addStyle(elm.shadowRoot ? elm.shadowRoot : elm.getRootNode(), cmpMeta, hostRef.$modeName$);
  if (flags & 10) {
    elm["s-sc"] = scopeId2;
    elm.classList.add(scopeId2 + "-h");
    if (flags & 2) {
      elm.classList.add(scopeId2 + "-s");
    }
  }
  endAttachStyles();
};
const getScopeId = (cmp, mode) => "sc-" + (mode && cmp.$flags$ & 32 ? cmp.$tagName$ + "-" + mode : cmp.$tagName$);
const setAccessor = (elm, memberName, oldValue, newValue, isSvg, flags) => {
  if (oldValue !== newValue) {
    let isProp = isMemberInElement(elm, memberName);
    let ln = memberName.toLowerCase();
    if (memberName === "class") {
      const classList = elm.classList;
      const oldClasses = parseClassList(oldValue);
      const newClasses = parseClassList(newValue);
      classList.remove(...oldClasses.filter((c) => c && !newClasses.includes(c)));
      classList.add(...newClasses.filter((c) => c && !oldClasses.includes(c)));
    } else if (memberName === "style") {
      {
        for (const prop in oldValue) {
          if (!newValue || newValue[prop] == null) {
            if (prop.includes("-")) {
              elm.style.removeProperty(prop);
            } else {
              elm.style[prop] = "";
            }
          }
        }
      }
      for (const prop in newValue) {
        if (!oldValue || newValue[prop] !== oldValue[prop]) {
          if (prop.includes("-")) {
            elm.style.setProperty(prop, newValue[prop]);
          } else {
            elm.style[prop] = newValue[prop];
          }
        }
      }
    } else if (memberName === "key")
      ;
    else if (memberName === "ref") {
      if (newValue) {
        newValue(elm);
      }
    } else if (!elm.__lookupSetter__(memberName) && memberName[0] === "o" && memberName[1] === "n") {
      if (memberName[2] === "-") {
        memberName = memberName.slice(3);
      } else if (isMemberInElement(win$1, ln)) {
        memberName = ln.slice(2);
      } else {
        memberName = ln[2] + memberName.slice(3);
      }
      if (oldValue) {
        plt.rel(elm, memberName, oldValue, false);
      }
      if (newValue) {
        plt.ael(elm, memberName, newValue, false);
      }
    } else {
      const isComplex = isComplexType(newValue);
      if ((isProp || isComplex && newValue !== null) && !isSvg) {
        try {
          if (!elm.tagName.includes("-")) {
            const n = newValue == null ? "" : newValue;
            if (memberName === "list") {
              isProp = false;
            } else if (oldValue == null || elm[memberName] != n) {
              elm[memberName] = n;
            }
          } else {
            elm[memberName] = newValue;
          }
        } catch (e) {
        }
      }
      let xlink = false;
      {
        if (ln !== (ln = ln.replace(/^xlink\:?/, ""))) {
          memberName = ln;
          xlink = true;
        }
      }
      if (newValue == null || newValue === false) {
        if (newValue !== false || elm.getAttribute(memberName) === "") {
          if (xlink) {
            elm.removeAttributeNS(XLINK_NS, memberName);
          } else {
            elm.removeAttribute(memberName);
          }
        }
      } else if ((!isProp || flags & 4 || isSvg) && !isComplex) {
        newValue = newValue === true ? "" : newValue;
        if (xlink) {
          elm.setAttributeNS(XLINK_NS, memberName, newValue);
        } else {
          elm.setAttribute(memberName, newValue);
        }
      }
    }
  }
};
const parseClassListRegex = /\s/;
const parseClassList = (value) => !value ? [] : value.split(parseClassListRegex);
const updateElement = (oldVnode, newVnode, isSvgMode2, memberName) => {
  const elm = newVnode.$elm$.nodeType === 11 && newVnode.$elm$.host ? newVnode.$elm$.host : newVnode.$elm$;
  const oldVnodeAttrs = oldVnode && oldVnode.$attrs$ || EMPTY_OBJ;
  const newVnodeAttrs = newVnode.$attrs$ || EMPTY_OBJ;
  {
    for (memberName in oldVnodeAttrs) {
      if (!(memberName in newVnodeAttrs)) {
        setAccessor(elm, memberName, oldVnodeAttrs[memberName], void 0, isSvgMode2, newVnode.$flags$);
      }
    }
  }
  for (memberName in newVnodeAttrs) {
    setAccessor(elm, memberName, oldVnodeAttrs[memberName], newVnodeAttrs[memberName], isSvgMode2, newVnode.$flags$);
  }
};
const createElm = (oldParentVNode, newParentVNode, childIndex, parentElm) => {
  const newVNode2 = newParentVNode.$children$[childIndex];
  let i = 0;
  let elm;
  let childNode;
  let oldVNode;
  if (!useNativeShadowDom) {
    checkSlotRelocate = true;
    if (newVNode2.$tag$ === "slot") {
      if (scopeId) {
        parentElm.classList.add(scopeId + "-s");
      }
      newVNode2.$flags$ |= newVNode2.$children$ ? 2 : 1;
    }
  }
  if (newVNode2.$text$ !== null) {
    elm = newVNode2.$elm$ = doc.createTextNode(newVNode2.$text$);
  } else if (newVNode2.$flags$ & 1) {
    elm = newVNode2.$elm$ = doc.createTextNode("");
  } else {
    if (!isSvgMode) {
      isSvgMode = newVNode2.$tag$ === "svg";
    }
    elm = newVNode2.$elm$ = doc.createElementNS(isSvgMode ? SVG_NS : HTML_NS, newVNode2.$flags$ & 2 ? "slot-fb" : newVNode2.$tag$);
    if (isSvgMode && newVNode2.$tag$ === "foreignObject") {
      isSvgMode = false;
    }
    {
      updateElement(null, newVNode2, isSvgMode);
    }
    if (isDef(scopeId) && elm["s-si"] !== scopeId) {
      elm.classList.add(elm["s-si"] = scopeId);
    }
    if (newVNode2.$children$) {
      for (i = 0; i < newVNode2.$children$.length; ++i) {
        childNode = createElm(oldParentVNode, newVNode2, i, elm);
        if (childNode) {
          elm.appendChild(childNode);
        }
      }
    }
    {
      if (newVNode2.$tag$ === "svg") {
        isSvgMode = false;
      } else if (elm.tagName === "foreignObject") {
        isSvgMode = true;
      }
    }
  }
  {
    elm["s-hn"] = hostTagName;
    if (newVNode2.$flags$ & (2 | 1)) {
      elm["s-sr"] = true;
      elm["s-cr"] = contentRef;
      elm["s-sn"] = newVNode2.$name$ || "";
      oldVNode = oldParentVNode && oldParentVNode.$children$ && oldParentVNode.$children$[childIndex];
      if (oldVNode && oldVNode.$tag$ === newVNode2.$tag$ && oldParentVNode.$elm$) {
        putBackInOriginalLocation(oldParentVNode.$elm$, false);
      }
    }
  }
  return elm;
};
const putBackInOriginalLocation = (parentElm, recursive) => {
  plt.$flags$ |= 1;
  const oldSlotChildNodes = parentElm.childNodes;
  for (let i = oldSlotChildNodes.length - 1; i >= 0; i--) {
    const childNode = oldSlotChildNodes[i];
    if (childNode["s-hn"] !== hostTagName && childNode["s-ol"]) {
      parentReferenceNode(childNode).insertBefore(childNode, referenceNode(childNode));
      childNode["s-ol"].remove();
      childNode["s-ol"] = void 0;
      checkSlotRelocate = true;
    }
    if (recursive) {
      putBackInOriginalLocation(childNode, recursive);
    }
  }
  plt.$flags$ &= ~1;
};
const addVnodes = (parentElm, before, parentVNode, vnodes, startIdx, endIdx) => {
  let containerElm = parentElm["s-cr"] && parentElm["s-cr"].parentNode || parentElm;
  let childNode;
  if (containerElm.shadowRoot && containerElm.tagName === hostTagName) {
    containerElm = containerElm.shadowRoot;
  }
  for (; startIdx <= endIdx; ++startIdx) {
    if (vnodes[startIdx]) {
      childNode = createElm(null, parentVNode, startIdx, parentElm);
      if (childNode) {
        vnodes[startIdx].$elm$ = childNode;
        containerElm.insertBefore(childNode, referenceNode(before));
      }
    }
  }
};
const removeVnodes = (vnodes, startIdx, endIdx, vnode, elm) => {
  for (; startIdx <= endIdx; ++startIdx) {
    if (vnode = vnodes[startIdx]) {
      elm = vnode.$elm$;
      callNodeRefs(vnode);
      {
        checkSlotFallbackVisibility = true;
        if (elm["s-ol"]) {
          elm["s-ol"].remove();
        } else {
          putBackInOriginalLocation(elm, true);
        }
      }
      elm.remove();
    }
  }
};
const updateChildren = (parentElm, oldCh, newVNode2, newCh) => {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let idxInOld = 0;
  let i = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];
  let node;
  let elmToMove;
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVnode == null) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (newStartVnode == null) {
      newStartVnode = newCh[++newStartIdx];
    } else if (newEndVnode == null) {
      newEndVnode = newCh[--newEndIdx];
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      patch(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      patch(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      if (oldStartVnode.$tag$ === "slot" || newEndVnode.$tag$ === "slot") {
        putBackInOriginalLocation(oldStartVnode.$elm$.parentNode, false);
      }
      patch(oldStartVnode, newEndVnode);
      parentElm.insertBefore(oldStartVnode.$elm$, oldEndVnode.$elm$.nextSibling);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      if (oldStartVnode.$tag$ === "slot" || newEndVnode.$tag$ === "slot") {
        putBackInOriginalLocation(oldEndVnode.$elm$.parentNode, false);
      }
      patch(oldEndVnode, newStartVnode);
      parentElm.insertBefore(oldEndVnode.$elm$, oldStartVnode.$elm$);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      idxInOld = -1;
      {
        for (i = oldStartIdx; i <= oldEndIdx; ++i) {
          if (oldCh[i] && oldCh[i].$key$ !== null && oldCh[i].$key$ === newStartVnode.$key$) {
            idxInOld = i;
            break;
          }
        }
      }
      if (idxInOld >= 0) {
        elmToMove = oldCh[idxInOld];
        if (elmToMove.$tag$ !== newStartVnode.$tag$) {
          node = createElm(oldCh && oldCh[newStartIdx], newVNode2, idxInOld, parentElm);
        } else {
          patch(elmToMove, newStartVnode);
          oldCh[idxInOld] = void 0;
          node = elmToMove.$elm$;
        }
        newStartVnode = newCh[++newStartIdx];
      } else {
        node = createElm(oldCh && oldCh[newStartIdx], newVNode2, newStartIdx, parentElm);
        newStartVnode = newCh[++newStartIdx];
      }
      if (node) {
        {
          parentReferenceNode(oldStartVnode.$elm$).insertBefore(node, referenceNode(oldStartVnode.$elm$));
        }
      }
    }
  }
  if (oldStartIdx > oldEndIdx) {
    addVnodes(parentElm, newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].$elm$, newVNode2, newCh, newStartIdx, newEndIdx);
  } else if (newStartIdx > newEndIdx) {
    removeVnodes(oldCh, oldStartIdx, oldEndIdx);
  }
};
const isSameVnode = (leftVNode, rightVNode) => {
  if (leftVNode.$tag$ === rightVNode.$tag$) {
    if (leftVNode.$tag$ === "slot") {
      return leftVNode.$name$ === rightVNode.$name$;
    }
    {
      return leftVNode.$key$ === rightVNode.$key$;
    }
  }
  return false;
};
const referenceNode = (node) => {
  return node && node["s-ol"] || node;
};
const parentReferenceNode = (node) => (node["s-ol"] ? node["s-ol"] : node).parentNode;
const patch = (oldVNode, newVNode2) => {
  const elm = newVNode2.$elm$ = oldVNode.$elm$;
  const oldChildren = oldVNode.$children$;
  const newChildren = newVNode2.$children$;
  const tag = newVNode2.$tag$;
  const text = newVNode2.$text$;
  let defaultHolder;
  if (text === null) {
    {
      isSvgMode = tag === "svg" ? true : tag === "foreignObject" ? false : isSvgMode;
    }
    {
      if (tag === "slot")
        ;
      else {
        updateElement(oldVNode, newVNode2, isSvgMode);
      }
    }
    if (oldChildren !== null && newChildren !== null) {
      updateChildren(elm, oldChildren, newVNode2, newChildren);
    } else if (newChildren !== null) {
      if (oldVNode.$text$ !== null) {
        elm.textContent = "";
      }
      addVnodes(elm, null, newVNode2, newChildren, 0, newChildren.length - 1);
    } else if (oldChildren !== null) {
      removeVnodes(oldChildren, 0, oldChildren.length - 1);
    }
    if (isSvgMode && tag === "svg") {
      isSvgMode = false;
    }
  } else if (defaultHolder = elm["s-cr"]) {
    defaultHolder.parentNode.textContent = text;
  } else if (oldVNode.$text$ !== text) {
    elm.data = text;
  }
};
const updateFallbackSlotVisibility = (elm) => {
  const childNodes = elm.childNodes;
  let childNode;
  let i;
  let ilen;
  let j;
  let slotNameAttr;
  let nodeType;
  for (i = 0, ilen = childNodes.length; i < ilen; i++) {
    childNode = childNodes[i];
    if (childNode.nodeType === 1) {
      if (childNode["s-sr"]) {
        slotNameAttr = childNode["s-sn"];
        childNode.hidden = false;
        for (j = 0; j < ilen; j++) {
          nodeType = childNodes[j].nodeType;
          if (childNodes[j]["s-hn"] !== childNode["s-hn"] || slotNameAttr !== "") {
            if (nodeType === 1 && slotNameAttr === childNodes[j].getAttribute("slot")) {
              childNode.hidden = true;
              break;
            }
          } else {
            if (nodeType === 1 || nodeType === 3 && childNodes[j].textContent.trim() !== "") {
              childNode.hidden = true;
              break;
            }
          }
        }
      }
      updateFallbackSlotVisibility(childNode);
    }
  }
};
const relocateNodes = [];
const relocateSlotContent = (elm) => {
  let childNode;
  let node;
  let hostContentNodes;
  let slotNameAttr;
  let relocateNodeData;
  let j;
  let i = 0;
  const childNodes = elm.childNodes;
  const ilen = childNodes.length;
  for (; i < ilen; i++) {
    childNode = childNodes[i];
    if (childNode["s-sr"] && (node = childNode["s-cr"]) && node.parentNode) {
      hostContentNodes = node.parentNode.childNodes;
      slotNameAttr = childNode["s-sn"];
      for (j = hostContentNodes.length - 1; j >= 0; j--) {
        node = hostContentNodes[j];
        if (!node["s-cn"] && !node["s-nr"] && node["s-hn"] !== childNode["s-hn"]) {
          if (isNodeLocatedInSlot(node, slotNameAttr)) {
            relocateNodeData = relocateNodes.find((r) => r.$nodeToRelocate$ === node);
            checkSlotFallbackVisibility = true;
            node["s-sn"] = node["s-sn"] || slotNameAttr;
            if (relocateNodeData) {
              relocateNodeData.$slotRefNode$ = childNode;
            } else {
              relocateNodes.push({
                $slotRefNode$: childNode,
                $nodeToRelocate$: node
              });
            }
            if (node["s-sr"]) {
              relocateNodes.map((relocateNode) => {
                if (isNodeLocatedInSlot(relocateNode.$nodeToRelocate$, node["s-sn"])) {
                  relocateNodeData = relocateNodes.find((r) => r.$nodeToRelocate$ === node);
                  if (relocateNodeData && !relocateNode.$slotRefNode$) {
                    relocateNode.$slotRefNode$ = relocateNodeData.$slotRefNode$;
                  }
                }
              });
            }
          } else if (!relocateNodes.some((r) => r.$nodeToRelocate$ === node)) {
            relocateNodes.push({
              $nodeToRelocate$: node
            });
          }
        }
      }
    }
    if (childNode.nodeType === 1) {
      relocateSlotContent(childNode);
    }
  }
};
const isNodeLocatedInSlot = (nodeToRelocate, slotNameAttr) => {
  if (nodeToRelocate.nodeType === 1) {
    if (nodeToRelocate.getAttribute("slot") === null && slotNameAttr === "") {
      return true;
    }
    if (nodeToRelocate.getAttribute("slot") === slotNameAttr) {
      return true;
    }
    return false;
  }
  if (nodeToRelocate["s-sn"] === slotNameAttr) {
    return true;
  }
  return slotNameAttr === "";
};
const callNodeRefs = (vNode) => {
  {
    vNode.$attrs$ && vNode.$attrs$.ref && vNode.$attrs$.ref(null);
    vNode.$children$ && vNode.$children$.map(callNodeRefs);
  }
};
const renderVdom = (hostRef, renderFnResults) => {
  const hostElm = hostRef.$hostElement$;
  const cmpMeta = hostRef.$cmpMeta$;
  const oldVNode = hostRef.$vnode$ || newVNode(null, null);
  const rootVnode = isHost(renderFnResults) ? renderFnResults : h(null, null, renderFnResults);
  hostTagName = hostElm.tagName;
  if (cmpMeta.$attrsToReflect$) {
    rootVnode.$attrs$ = rootVnode.$attrs$ || {};
    cmpMeta.$attrsToReflect$.map(([propName, attribute]) => rootVnode.$attrs$[attribute] = hostElm[propName]);
  }
  rootVnode.$tag$ = null;
  rootVnode.$flags$ |= 4;
  hostRef.$vnode$ = rootVnode;
  rootVnode.$elm$ = oldVNode.$elm$ = hostElm.shadowRoot || hostElm;
  {
    scopeId = hostElm["s-sc"];
  }
  {
    contentRef = hostElm["s-cr"];
    useNativeShadowDom = (cmpMeta.$flags$ & 1) !== 0;
    checkSlotFallbackVisibility = false;
  }
  patch(oldVNode, rootVnode);
  {
    plt.$flags$ |= 1;
    if (checkSlotRelocate) {
      relocateSlotContent(rootVnode.$elm$);
      let relocateData;
      let nodeToRelocate;
      let orgLocationNode;
      let parentNodeRef;
      let insertBeforeNode;
      let refNode;
      let i = 0;
      for (; i < relocateNodes.length; i++) {
        relocateData = relocateNodes[i];
        nodeToRelocate = relocateData.$nodeToRelocate$;
        if (!nodeToRelocate["s-ol"]) {
          orgLocationNode = doc.createTextNode("");
          orgLocationNode["s-nr"] = nodeToRelocate;
          nodeToRelocate.parentNode.insertBefore(nodeToRelocate["s-ol"] = orgLocationNode, nodeToRelocate);
        }
      }
      for (i = 0; i < relocateNodes.length; i++) {
        relocateData = relocateNodes[i];
        nodeToRelocate = relocateData.$nodeToRelocate$;
        if (relocateData.$slotRefNode$) {
          parentNodeRef = relocateData.$slotRefNode$.parentNode;
          insertBeforeNode = relocateData.$slotRefNode$.nextSibling;
          orgLocationNode = nodeToRelocate["s-ol"];
          while (orgLocationNode = orgLocationNode.previousSibling) {
            refNode = orgLocationNode["s-nr"];
            if (refNode && refNode["s-sn"] === nodeToRelocate["s-sn"] && parentNodeRef === refNode.parentNode) {
              refNode = refNode.nextSibling;
              if (!refNode || !refNode["s-nr"]) {
                insertBeforeNode = refNode;
                break;
              }
            }
          }
          if (!insertBeforeNode && parentNodeRef !== nodeToRelocate.parentNode || nodeToRelocate.nextSibling !== insertBeforeNode) {
            if (nodeToRelocate !== insertBeforeNode) {
              if (!nodeToRelocate["s-hn"] && nodeToRelocate["s-ol"]) {
                nodeToRelocate["s-hn"] = nodeToRelocate["s-ol"].parentNode.nodeName;
              }
              parentNodeRef.insertBefore(nodeToRelocate, insertBeforeNode);
            }
          }
        } else {
          if (nodeToRelocate.nodeType === 1) {
            nodeToRelocate.hidden = true;
          }
        }
      }
    }
    if (checkSlotFallbackVisibility) {
      updateFallbackSlotVisibility(rootVnode.$elm$);
    }
    plt.$flags$ &= ~1;
    relocateNodes.length = 0;
  }
};
const attachToAncestor = (hostRef, ancestorComponent) => {
};
const scheduleUpdate = (hostRef, isInitialLoad) => {
  {
    hostRef.$flags$ |= 16;
  }
  attachToAncestor(hostRef, hostRef.$ancestorComponent$);
  const dispatch = () => dispatchHooks(hostRef, isInitialLoad);
  return writeTask(dispatch);
};
const dispatchHooks = (hostRef, isInitialLoad) => {
  const elm = hostRef.$hostElement$;
  const endSchedule = createTime("scheduleUpdate", hostRef.$cmpMeta$.$tagName$);
  const instance = elm;
  let promise;
  if (isInitialLoad) {
    {
      promise = safeCall$1(instance, "componentWillLoad");
    }
  } else {
    {
      promise = safeCall$1(instance, "componentWillUpdate");
    }
  }
  {
    promise = then(promise, () => safeCall$1(instance, "componentWillRender"));
  }
  endSchedule();
  return then(promise, () => updateComponent(hostRef, instance, isInitialLoad));
};
const updateComponent = async (hostRef, instance, isInitialLoad) => {
  const elm = hostRef.$hostElement$;
  const endUpdate = createTime("update", hostRef.$cmpMeta$.$tagName$);
  elm["s-rc"];
  if (isInitialLoad) {
    attachStyles(hostRef);
  }
  const endRender = createTime("render", hostRef.$cmpMeta$.$tagName$);
  {
    callRender(hostRef, instance);
  }
  endRender();
  endUpdate();
  {
    postUpdateComponent(hostRef);
  }
};
const callRender = (hostRef, instance, elm) => {
  const allRenderFn = false;
  const lazyLoad = false;
  const taskQueue = true;
  const updatable = true;
  try {
    renderingRef = instance;
    instance = allRenderFn ? instance.render() : instance.render && instance.render();
    if (updatable && taskQueue) {
      hostRef.$flags$ &= ~16;
    }
    if (updatable || lazyLoad) {
      hostRef.$flags$ |= 2;
    }
    if (BUILD.hasRenderFn || BUILD.reflect) {
      if (BUILD.vdomRender || BUILD.reflect) {
        if (BUILD.hydrateServerSide)
          ;
        else {
          renderVdom(hostRef, instance);
        }
      }
    }
  } catch (e) {
    consoleError(e, hostRef.$hostElement$);
  }
  renderingRef = null;
  return null;
};
const postUpdateComponent = (hostRef) => {
  const tagName = hostRef.$cmpMeta$.$tagName$;
  const elm = hostRef.$hostElement$;
  const endPostUpdate = createTime("postUpdate", tagName);
  const instance = elm;
  hostRef.$ancestorComponent$;
  {
    safeCall$1(instance, "componentDidRender");
  }
  if (!(hostRef.$flags$ & 64)) {
    hostRef.$flags$ |= 64;
    {
      safeCall$1(instance, "componentDidLoad");
    }
    endPostUpdate();
  } else {
    {
      safeCall$1(instance, "componentDidUpdate");
    }
    endPostUpdate();
  }
};
const forceUpdate = (ref2) => {
  {
    const hostRef = getHostRef(ref2);
    const isConnected = hostRef.$hostElement$.isConnected;
    if (isConnected && (hostRef.$flags$ & (2 | 16)) === 2) {
      scheduleUpdate(hostRef, false);
    }
    return isConnected;
  }
};
const safeCall$1 = (instance, method, arg) => {
  if (instance && instance[method]) {
    try {
      return instance[method](arg);
    } catch (e) {
      consoleError(e);
    }
  }
  return void 0;
};
const then = (promise, thenFn) => {
  return promise && promise.then ? promise.then(thenFn) : thenFn();
};
const getValue = (ref2, propName) => getHostRef(ref2).$instanceValues$.get(propName);
const setValue = (ref2, propName, newVal, cmpMeta) => {
  const hostRef = getHostRef(ref2);
  const elm = ref2;
  const oldVal = hostRef.$instanceValues$.get(propName);
  const flags = hostRef.$flags$;
  const instance = elm;
  newVal = parsePropertyValue(newVal, cmpMeta.$members$[propName][0]);
  const areBothNaN = Number.isNaN(oldVal) && Number.isNaN(newVal);
  const didValueChange = newVal !== oldVal && !areBothNaN;
  if (didValueChange) {
    hostRef.$instanceValues$.set(propName, newVal);
    {
      if (cmpMeta.$watchers$ && flags & 128) {
        const watchMethods = cmpMeta.$watchers$[propName];
        if (watchMethods) {
          watchMethods.map((watchMethodName) => {
            try {
              instance[watchMethodName](newVal, oldVal, propName);
            } catch (e) {
              consoleError(e, elm);
            }
          });
        }
      }
      if ((flags & (2 | 16)) === 2) {
        if (instance.componentShouldUpdate) {
          if (instance.componentShouldUpdate(newVal, oldVal, propName) === false) {
            return;
          }
        }
        scheduleUpdate(hostRef, false);
      }
    }
  }
};
const proxyComponent = (Cstr, cmpMeta, flags) => {
  if (cmpMeta.$members$) {
    if (Cstr.watchers) {
      cmpMeta.$watchers$ = Cstr.watchers;
    }
    const members = Object.entries(cmpMeta.$members$);
    const prototype = Cstr.prototype;
    members.map(([memberName, [memberFlags]]) => {
      if (memberFlags & 31 || memberFlags & 32) {
        Object.defineProperty(prototype, memberName, {
          get() {
            return getValue(this, memberName);
          },
          set(newValue) {
            setValue(this, memberName, newValue, cmpMeta);
          },
          configurable: true,
          enumerable: true
        });
      }
    });
    {
      const attrNameToPropName = /* @__PURE__ */ new Map();
      prototype.attributeChangedCallback = function(attrName, _oldValue, newValue) {
        plt.jmp(() => {
          const propName = attrNameToPropName.get(attrName);
          if (this.hasOwnProperty(propName)) {
            newValue = this[propName];
            delete this[propName];
          } else if (prototype.hasOwnProperty(propName) && typeof this[propName] === "number" && this[propName] == newValue) {
            return;
          }
          this[propName] = newValue === null && typeof this[propName] === "boolean" ? false : newValue;
        });
      };
      Cstr.observedAttributes = members.filter(([_, m]) => m[0] & 15).map(([propName, m]) => {
        const attrName = m[1] || propName;
        attrNameToPropName.set(attrName, propName);
        if (m[0] & 512) {
          cmpMeta.$attrsToReflect$.push([propName, attrName]);
        }
        return attrName;
      });
    }
  }
  return Cstr;
};
const initializeComponent = async (elm, hostRef, cmpMeta, hmrVersionId, Cstr) => {
  if ((hostRef.$flags$ & 32) === 0) {
    {
      Cstr = elm.constructor;
      hostRef.$flags$ |= 32;
      customElements.whenDefined(cmpMeta.$tagName$).then(() => hostRef.$flags$ |= 128);
    }
    if (Cstr.style) {
      let style = Cstr.style;
      if (typeof style !== "string") {
        style = style[hostRef.$modeName$ = computeMode(elm)];
      }
      const scopeId2 = getScopeId(cmpMeta, hostRef.$modeName$);
      if (!styles.has(scopeId2)) {
        const endRegisterStyles = createTime("registerStyles", cmpMeta.$tagName$);
        registerStyle(scopeId2, style, !!(cmpMeta.$flags$ & 1));
        endRegisterStyles();
      }
    }
  }
  hostRef.$ancestorComponent$;
  const schedule = () => scheduleUpdate(hostRef, true);
  {
    schedule();
  }
};
const fireConnectedCallback = (instance) => {
};
const connectedCallback = (elm) => {
  if ((plt.$flags$ & 1) === 0) {
    const hostRef = getHostRef(elm);
    const cmpMeta = hostRef.$cmpMeta$;
    const endConnected = createTime("connectedCallback", cmpMeta.$tagName$);
    if (!(hostRef.$flags$ & 1)) {
      hostRef.$flags$ |= 1;
      {
        if (cmpMeta.$flags$ & (4 | 8)) {
          setContentReference(elm);
        }
      }
      if (cmpMeta.$members$) {
        Object.entries(cmpMeta.$members$).map(([memberName, [memberFlags]]) => {
          if (memberFlags & 31 && elm.hasOwnProperty(memberName)) {
            const value = elm[memberName];
            delete elm[memberName];
            elm[memberName] = value;
          }
        });
      }
      {
        initializeComponent(elm, hostRef, cmpMeta);
      }
    } else {
      addHostEventListeners(elm, hostRef, cmpMeta.$listeners$);
      fireConnectedCallback(hostRef.$lazyInstance$);
    }
    endConnected();
  }
};
const setContentReference = (elm) => {
  const contentRefElm = elm["s-cr"] = doc.createComment("");
  contentRefElm["s-cn"] = true;
  elm.insertBefore(contentRefElm, elm.firstChild);
};
const disconnectedCallback = (elm) => {
  if ((plt.$flags$ & 1) === 0) {
    const hostRef = getHostRef(elm);
    {
      if (hostRef.$rmListeners$) {
        hostRef.$rmListeners$.map((rmListener) => rmListener());
        hostRef.$rmListeners$ = void 0;
      }
    }
  }
};
const proxyCustomElement = (Cstr, compactMeta) => {
  const cmpMeta = {
    $flags$: compactMeta[0],
    $tagName$: compactMeta[1]
  };
  {
    cmpMeta.$members$ = compactMeta[2];
  }
  {
    cmpMeta.$listeners$ = compactMeta[3];
  }
  {
    cmpMeta.$watchers$ = Cstr.$watchers$;
  }
  {
    cmpMeta.$attrsToReflect$ = [];
  }
  const originalConnectedCallback = Cstr.prototype.connectedCallback;
  const originalDisconnectedCallback = Cstr.prototype.disconnectedCallback;
  Object.assign(Cstr.prototype, {
    __registerHost() {
      registerHost(this, cmpMeta);
    },
    connectedCallback() {
      connectedCallback(this);
      if (originalConnectedCallback) {
        originalConnectedCallback.call(this);
      }
    },
    disconnectedCallback() {
      disconnectedCallback(this);
      if (originalDisconnectedCallback) {
        originalDisconnectedCallback.call(this);
      }
    },
    __attachShadow() {
      {
        {
          this.attachShadow({
            mode: "open",
            delegatesFocus: !!(cmpMeta.$flags$ & 16)
          });
        }
      }
    }
  });
  Cstr.is = cmpMeta.$tagName$;
  return proxyComponent(Cstr, cmpMeta);
};
const addHostEventListeners = (elm, hostRef, listeners, attachParentListeners) => {
  if (listeners) {
    listeners.map(([flags, name, method]) => {
      const target = getHostListenerTarget(elm, flags);
      const handler = hostListenerProxy(hostRef, method);
      const opts = hostListenerOpts(flags);
      plt.ael(target, name, handler, opts);
      (hostRef.$rmListeners$ = hostRef.$rmListeners$ || []).push(() => plt.rel(target, name, handler, opts));
    });
  }
};
const hostListenerProxy = (hostRef, methodName) => (ev) => {
  try {
    if (BUILD.lazyLoad)
      ;
    else {
      hostRef.$hostElement$[methodName](ev);
    }
  } catch (e) {
    consoleError(e);
  }
};
const getHostListenerTarget = (elm, flags) => {
  if (flags & 4)
    return doc;
  if (flags & 8)
    return win$1;
  if (flags & 16)
    return doc.body;
  return elm;
};
const hostListenerOpts = (flags) => supportsListenerOptions ? {
  passive: (flags & 1) !== 0,
  capture: (flags & 2) !== 0
} : (flags & 2) !== 0;
const hostRefs = /* @__PURE__ */ new WeakMap();
const getHostRef = (ref2) => hostRefs.get(ref2);
const registerHost = (elm, cmpMeta) => {
  const hostRef = {
    $flags$: 0,
    $hostElement$: elm,
    $cmpMeta$: cmpMeta,
    $instanceValues$: /* @__PURE__ */ new Map()
  };
  addHostEventListeners(elm, hostRef, cmpMeta.$listeners$);
  return hostRefs.set(elm, hostRef);
};
const isMemberInElement = (elm, memberName) => memberName in elm;
const consoleError = (e, el) => (0, console.error)(e, el);
const styles = /* @__PURE__ */ new Map();
const modeResolutionChain = [];
const win$1 = {};
const doc = win$1.document || { head: {} };
const H = win$1.HTMLElement || class {
};
const plt = {
  $flags$: 0,
  $resourcesUrl$: "",
  jmp: (h2) => h2(),
  raf: (h2) => requestAnimationFrame(h2),
  ael: (el, eventName, listener, opts) => el.addEventListener(eventName, listener, opts),
  rel: (el, eventName, listener, opts) => el.removeEventListener(eventName, listener, opts),
  ce: (eventName, opts) => new CustomEvent(eventName, opts)
};
const supportsListenerOptions = /* @__PURE__ */ (() => {
  let supportsListenerOptions2 = false;
  try {
    doc.addEventListener("e", null, Object.defineProperty({}, "passive", {
      get() {
        supportsListenerOptions2 = true;
      }
    }));
  } catch (e) {
  }
  return supportsListenerOptions2;
})();
const promiseResolve = (v) => Promise.resolve(v);
const supportsConstructableStylesheets = /* @__PURE__ */ (() => {
  try {
    new CSSStyleSheet();
    return typeof new CSSStyleSheet().replaceSync === "function";
  } catch (e) {
  }
  return false;
})() ;
const queueDomReads = [];
const queueDomWrites = [];
const queueTask = (queue, write) => (cb) => {
  queue.push(cb);
  if (!queuePending) {
    queuePending = true;
    if (write && plt.$flags$ & 4) {
      nextTick(flush);
    } else {
      plt.raf(flush);
    }
  }
};
const consume = (queue) => {
  for (let i = 0; i < queue.length; i++) {
    try {
      queue[i](performance.now());
    } catch (e) {
      consoleError(e);
    }
  }
  queue.length = 0;
};
const flush = () => {
  consume(queueDomReads);
  {
    consume(queueDomWrites);
    if (queuePending = queueDomReads.length > 0) {
      plt.raf(flush);
    }
  }
};
const nextTick = (cb) => promiseResolve().then(cb);
const readTask = /* @__PURE__ */ queueTask(queueDomReads, false);
const writeTask = /* @__PURE__ */ queueTask(queueDomWrites, true);
const chevronForward = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Chevron Forward</title><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M184 112l144 144-144 144' class='ionicon-fill-none'/></svg>";
const close = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Close</title><path d='M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z'/></svg>";
const closeCircle = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Close Circle</title><path d='M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm75.31 260.69a16 16 0 11-22.62 22.62L256 278.63l-52.69 52.68a16 16 0 01-22.62-22.62L233.37 256l-52.68-52.69a16 16 0 0122.62-22.62L256 233.37l52.69-52.68a16 16 0 0122.62 22.62L278.63 256z'/></svg>";
const closeSharp = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Close</title><path d='M400 145.49L366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49z'/></svg>";
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
class Config {
  constructor() {
    this.m = /* @__PURE__ */ new Map();
  }
  reset(configObj) {
    this.m = new Map(Object.entries(configObj));
  }
  get(key, fallback) {
    const value = this.m.get(key);
    return value !== void 0 ? value : fallback;
  }
  getBoolean(key, fallback = false) {
    const val = this.m.get(key);
    if (val === void 0) {
      return fallback;
    }
    if (typeof val === "string") {
      return val === "true";
    }
    return !!val;
  }
  getNumber(key, fallback) {
    const val = parseFloat(this.m.get(key));
    return isNaN(val) ? fallback !== void 0 ? fallback : NaN : val;
  }
  set(key, value) {
    this.m.set(key, value);
  }
}
const config = /* @__PURE__ */ new Config();
const getPlatforms = (win2) => setupPlatforms(win2);
const isPlatform = (winOrPlatform, platform) => {
  if (typeof winOrPlatform === "string") {
    platform = winOrPlatform;
    winOrPlatform = void 0;
  }
  return getPlatforms(winOrPlatform).includes(platform);
};
const setupPlatforms = (win2 = window) => {
  if (typeof win2 === "undefined") {
    return [];
  }
  win2.Ionic = win2.Ionic || {};
  let platforms = win2.Ionic.platforms;
  if (platforms == null) {
    platforms = win2.Ionic.platforms = detectPlatforms(win2);
    platforms.forEach((p) => win2.document.documentElement.classList.add(`plt-${p}`));
  }
  return platforms;
};
const detectPlatforms = (win2) => {
  const customPlatformMethods = config.get("platform");
  return Object.keys(PLATFORMS_MAP).filter((p) => {
    const customMethod = customPlatformMethods === null || customPlatformMethods === void 0 ? void 0 : customPlatformMethods[p];
    return typeof customMethod === "function" ? customMethod(win2) : PLATFORMS_MAP[p](win2);
  });
};
const isMobileWeb = (win2) => isMobile(win2) && !isHybrid(win2);
const isIpad = (win2) => {
  if (testUserAgent(win2, /iPad/i)) {
    return true;
  }
  if (testUserAgent(win2, /Macintosh/i) && isMobile(win2)) {
    return true;
  }
  return false;
};
const isIphone = (win2) => testUserAgent(win2, /iPhone/i);
const isIOS = (win2) => testUserAgent(win2, /iPhone|iPod/i) || isIpad(win2);
const isAndroid = (win2) => testUserAgent(win2, /android|sink/i);
const isAndroidTablet = (win2) => {
  return isAndroid(win2) && !testUserAgent(win2, /mobile/i);
};
const isPhablet = (win2) => {
  const width = win2.innerWidth;
  const height = win2.innerHeight;
  const smallest = Math.min(width, height);
  const largest = Math.max(width, height);
  return smallest > 390 && smallest < 520 && largest > 620 && largest < 800;
};
const isTablet = (win2) => {
  const width = win2.innerWidth;
  const height = win2.innerHeight;
  const smallest = Math.min(width, height);
  const largest = Math.max(width, height);
  return isIpad(win2) || isAndroidTablet(win2) || smallest > 460 && smallest < 820 && largest > 780 && largest < 1400;
};
const isMobile = (win2) => matchMedia(win2, "(any-pointer:coarse)");
const isDesktop = (win2) => !isMobile(win2);
const isHybrid = (win2) => isCordova(win2) || isCapacitorNative(win2);
const isCordova = (win2) => !!(win2["cordova"] || win2["phonegap"] || win2["PhoneGap"]);
const isCapacitorNative = (win2) => {
  const capacitor = win2["Capacitor"];
  return !!(capacitor === null || capacitor === void 0 ? void 0 : capacitor.isNative);
};
const isElectron = (win2) => testUserAgent(win2, /electron/i);
const isPWA = (win2) => {
  var _a2;
  return !!(((_a2 = win2.matchMedia) === null || _a2 === void 0 ? void 0 : _a2.call(win2, "(display-mode: standalone)").matches) || win2.navigator.standalone);
};
const testUserAgent = (win2, expr) => expr.test(win2.navigator.userAgent);
const matchMedia = (win2, query) => {
  var _a2;
  return (_a2 = win2.matchMedia) === null || _a2 === void 0 ? void 0 : _a2.call(win2, query).matches;
};
const PLATFORMS_MAP = {
  ipad: isIpad,
  iphone: isIphone,
  ios: isIOS,
  android: isAndroid,
  phablet: isPhablet,
  tablet: isTablet,
  cordova: isCordova,
  capacitor: isCapacitorNative,
  electron: isElectron,
  pwa: isPWA,
  mobile: isMobile,
  mobileweb: isMobileWeb,
  desktop: isDesktop,
  hybrid: isHybrid
};
let defaultMode;
const getIonMode$2 = (ref2) => {
  return ref2 && getMode(ref2) || defaultMode;
};
const initialize = (userConfig = {}) => {
  {
    return;
  }
};
const componentOnReady = (el, callback) => {
  if (el.componentOnReady) {
    el.componentOnReady().then((resolvedEl) => callback(resolvedEl));
  } else {
    raf(() => callback(el));
  }
};
const inheritAttributes$2 = (el, attributes = []) => {
  const attributeObject = {};
  attributes.forEach((attr) => {
    if (el.hasAttribute(attr)) {
      const value = el.getAttribute(attr);
      if (value !== null) {
        attributeObject[attr] = el.getAttribute(attr);
      }
      el.removeAttribute(attr);
    }
  });
  return attributeObject;
};
const ariaAttributes = [
  "role",
  "aria-activedescendant",
  "aria-atomic",
  "aria-autocomplete",
  "aria-braillelabel",
  "aria-brailleroledescription",
  "aria-busy",
  "aria-checked",
  "aria-colcount",
  "aria-colindex",
  "aria-colindextext",
  "aria-colspan",
  "aria-controls",
  "aria-current",
  "aria-describedby",
  "aria-description",
  "aria-details",
  "aria-disabled",
  "aria-errormessage",
  "aria-expanded",
  "aria-flowto",
  "aria-haspopup",
  "aria-hidden",
  "aria-invalid",
  "aria-keyshortcuts",
  "aria-label",
  "aria-labelledby",
  "aria-level",
  "aria-live",
  "aria-multiline",
  "aria-multiselectable",
  "aria-orientation",
  "aria-owns",
  "aria-placeholder",
  "aria-posinset",
  "aria-pressed",
  "aria-readonly",
  "aria-relevant",
  "aria-required",
  "aria-roledescription",
  "aria-rowcount",
  "aria-rowindex",
  "aria-rowindextext",
  "aria-rowspan",
  "aria-selected",
  "aria-setsize",
  "aria-sort",
  "aria-valuemax",
  "aria-valuemin",
  "aria-valuenow",
  "aria-valuetext"
];
const inheritAriaAttributes = (el, ignoreList) => {
  let attributesToInherit = ariaAttributes;
  if (ignoreList && ignoreList.length > 0) {
    attributesToInherit = attributesToInherit.filter((attr) => !ignoreList.includes(attr));
  }
  return inheritAttributes$2(el, attributesToInherit);
};
const addEventListener$1 = (el, eventName, callback, opts) => {
  return el.addEventListener(eventName, callback, opts);
};
const removeEventListener = (el, eventName, callback, opts) => {
  return el.removeEventListener(eventName, callback, opts);
};
const raf = (h2) => {
  if (typeof __zone_symbol__requestAnimationFrame === "function") {
    return __zone_symbol__requestAnimationFrame(h2);
  }
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(h2);
  }
  return setTimeout(h2);
};
const hasShadowDom = (el) => {
  return !!el.shadowRoot && !!el.attachShadow;
};
const findItemLabel = (componentEl) => {
  const itemEl = componentEl.closest("ion-item");
  if (itemEl) {
    return itemEl.querySelector("ion-label");
  }
  return null;
};
const getAriaLabel = (componentEl, inputId) => {
  let labelText;
  const labelledBy = componentEl.getAttribute("aria-labelledby");
  const componentId = componentEl.id;
  let labelId = labelledBy !== null && labelledBy.trim() !== "" ? labelledBy : inputId + "-lbl";
  let label = labelledBy !== null && labelledBy.trim() !== "" ? document.getElementById(labelledBy) : findItemLabel(componentEl);
  if (label) {
    if (labelledBy === null) {
      label.id = labelId;
    }
    labelText = label.textContent;
    label.setAttribute("aria-hidden", "true");
  } else if (componentId.trim() !== "") {
    label = document.querySelector(`label[for="${componentId}"]`);
    if (label) {
      if (label.id !== "") {
        labelId = label.id;
      } else {
        label.id = labelId = `${componentId}-lbl`;
      }
      labelText = label.textContent;
    }
  }
  return { label, labelId, labelText };
};
const renderHiddenInput = (always, container, name, value, disabled) => {
  if (always || hasShadowDom(container)) {
    let input = container.querySelector("input.aux-input");
    if (!input) {
      input = container.ownerDocument.createElement("input");
      input.type = "hidden";
      input.classList.add("aux-input");
      container.appendChild(input);
    }
    input.disabled = disabled;
    input.name = name;
    input.value = value || "";
  }
};
const clamp = (min, n, max) => {
  return Math.max(min, Math.min(n, max));
};
const now$1 = (ev) => {
  return ev.timeStamp || Date.now();
};
const pointerCoord = (ev) => {
  if (ev) {
    const changedTouches = ev.changedTouches;
    if (changedTouches && changedTouches.length > 0) {
      const touch = changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    if (ev.pageX !== void 0) {
      return { x: ev.pageX, y: ev.pageY };
    }
  }
  return { x: 0, y: 0 };
};
const debounceEvent = (event, wait) => {
  const original = event._original || event;
  return {
    _original: event,
    emit: debounce(original.emit.bind(original), wait)
  };
};
const debounce = (func, wait = 0) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(func, wait, ...args);
  };
};
const shallowEqualStringMap = (map1, map2) => {
  map1 !== null && map1 !== void 0 ? map1 : map1 = {};
  map2 !== null && map2 !== void 0 ? map2 : map2 = {};
  if (map1 === map2) {
    return true;
  }
  const keys1 = Object.keys(map1);
  if (keys1.length !== Object.keys(map2).length) {
    return false;
  }
  for (const k1 of keys1) {
    if (!(k1 in map2)) {
      return false;
    }
    if (map1[k1] !== map2[k1]) {
      return false;
    }
  }
  return true;
};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const getIconMap$1 = () => {
  {
    return /* @__PURE__ */ new Map();
  }
};
const getUrl$1 = (i) => {
  let url = getSrc$1(i.src);
  if (url) {
    return url;
  }
  url = getName$1(i.name, i.icon, i.mode, i.ios, i.md);
  if (url) {
    return getNamedUrl$1(url);
  }
  if (i.icon) {
    url = getSrc$1(i.icon);
    if (url) {
      return url;
    }
    url = getSrc$1(i.icon[i.mode]);
    if (url) {
      return url;
    }
  }
  return null;
};
const getNamedUrl$1 = (iconName) => {
  const url = getIconMap$1().get(iconName);
  if (url) {
    return url;
  }
  return getAssetPath(`svg/${iconName}.svg`);
};
const getName$1 = (iconName, icon, mode, ios, md) => {
  mode = (mode && toLower$1(mode)) === "ios" ? "ios" : "md";
  if (ios && mode === "ios") {
    iconName = toLower$1(ios);
  } else if (md && mode === "md") {
    iconName = toLower$1(md);
  } else {
    if (!iconName && icon && !isSrc$1(icon)) {
      iconName = icon;
    }
    if (isStr$1(iconName)) {
      iconName = toLower$1(iconName);
    }
  }
  if (!isStr$1(iconName) || iconName.trim() === "") {
    return null;
  }
  const invalidChars = iconName.replace(/[a-z]|-|\d/gi, "");
  if (invalidChars !== "") {
    return null;
  }
  return iconName;
};
const getSrc$1 = (src) => {
  if (isStr$1(src)) {
    src = src.trim();
    if (isSrc$1(src)) {
      return src;
    }
  }
  return null;
};
const isSrc$1 = (str) => str.length > 0 && /(\/|\.)/.test(str);
const isStr$1 = (val) => typeof val === "string";
const toLower$1 = (val) => val.toLowerCase();
const inheritAttributes$1 = (el, attributes = []) => {
  const attributeObject = {};
  attributes.forEach((attr) => {
    if (el.hasAttribute(attr)) {
      const value = el.getAttribute(attr);
      if (value !== null) {
        attributeObject[attr] = el.getAttribute(attr);
      }
      el.removeAttribute(attr);
    }
  });
  return attributeObject;
};
const isRTL$2 = (hostEl) => {
  if (hostEl) {
    if (hostEl.dir !== "") {
      return hostEl.dir.toLowerCase() === "rtl";
    }
  }
  return (document === null || document === void 0 ? void 0 : document.dir.toLowerCase()) === "rtl";
};
const validateContent$1 = (svgContent) => {
  const div = document.createElement("div");
  div.innerHTML = svgContent;
  for (let i = div.childNodes.length - 1; i >= 0; i--) {
    if (div.childNodes[i].nodeName.toLowerCase() !== "svg") {
      div.removeChild(div.childNodes[i]);
    }
  }
  const svgElm = div.firstElementChild;
  if (svgElm && svgElm.nodeName.toLowerCase() === "svg") {
    const svgClass = svgElm.getAttribute("class") || "";
    svgElm.setAttribute("class", (svgClass + " s-ion-icon").trim());
    if (isValid$1(svgElm)) {
      return div.innerHTML;
    }
  }
  return "";
};
const isValid$1 = (elm) => {
  if (elm.nodeType === 1) {
    if (elm.nodeName.toLowerCase() === "script") {
      return false;
    }
    for (let i = 0; i < elm.attributes.length; i++) {
      const name = elm.attributes[i].name;
      if (isStr$1(name) && name.toLowerCase().indexOf("on") === 0) {
        return false;
      }
    }
    for (let i = 0; i < elm.childNodes.length; i++) {
      if (!isValid$1(elm.childNodes[i])) {
        return false;
      }
    }
  }
  return true;
};
const ioniconContent$1 = /* @__PURE__ */ new Map();
const requests$1 = /* @__PURE__ */ new Map();
const getSvgContent$1 = (url, sanitize) => {
  let req = requests$1.get(url);
  if (!req) {
    if (typeof fetch !== "undefined" && false) {
      req = fetch(url).then((rsp) => {
        if (rsp.ok) {
          return rsp.text().then((svgContent) => {
            if (svgContent && sanitize !== false) {
              svgContent = validateContent$1(svgContent);
            }
            ioniconContent$1.set(url, svgContent || "");
          });
        }
        ioniconContent$1.set(url, "");
      });
      requests$1.set(url, req);
    } else {
      ioniconContent$1.set(url, "");
      return Promise.resolve();
    }
  }
  return req;
};
const iconCss$1 = ":host{display:inline-block;width:1em;height:1em;contain:strict;fill:currentColor;-webkit-box-sizing:content-box !important;box-sizing:content-box !important}:host .ionicon{stroke:currentColor}.ionicon-fill-none{fill:none}.ionicon-stroke-width{stroke-width:32px;stroke-width:var(--ionicon-stroke-width, 32px)}.icon-inner,.ionicon,svg{display:block;height:100%;width:100%}:host(.flip-rtl) .icon-inner{-webkit-transform:scaleX(-1);transform:scaleX(-1)}:host(.icon-small){font-size:18px !important}:host(.icon-large){font-size:32px !important}:host(.ion-color){color:var(--ion-color-base) !important}:host(.ion-color-primary){--ion-color-base:var(--ion-color-primary, #3880ff)}:host(.ion-color-secondary){--ion-color-base:var(--ion-color-secondary, #0cd1e8)}:host(.ion-color-tertiary){--ion-color-base:var(--ion-color-tertiary, #f4a942)}:host(.ion-color-success){--ion-color-base:var(--ion-color-success, #10dc60)}:host(.ion-color-warning){--ion-color-base:var(--ion-color-warning, #ffce00)}:host(.ion-color-danger){--ion-color-base:var(--ion-color-danger, #f14141)}:host(.ion-color-light){--ion-color-base:var(--ion-color-light, #f4f5f8)}:host(.ion-color-medium){--ion-color-base:var(--ion-color-medium, #989aa2)}:host(.ion-color-dark){--ion-color-base:var(--ion-color-dark, #222428)}";
let parser$1;
const Icon$1 = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.iconName = null;
    this.inheritedAttributes = {};
    this.isVisible = false;
    this.mode = getIonMode$1();
    this.lazy = false;
    this.sanitize = true;
    this.hasAriaHidden = () => {
      const { el } = this;
      return el.hasAttribute("aria-hidden") && el.getAttribute("aria-hidden") === "true";
    };
  }
  componentWillLoad() {
    this.inheritedAttributes = inheritAttributes$1(this.el, ["aria-label"]);
  }
  connectedCallback() {
    this.waitUntilVisible(this.el, "50px", () => {
      this.isVisible = true;
      this.loadIcon();
    });
  }
  disconnectedCallback() {
    if (this.io) {
      this.io.disconnect();
      this.io = void 0;
    }
  }
  waitUntilVisible(el, rootMargin, cb) {
    if (this.lazy && false) {
      const io = this.io = new window.IntersectionObserver((data) => {
        if (data[0].isIntersecting) {
          io.disconnect();
          this.io = void 0;
          cb();
        }
      }, { rootMargin });
      io.observe(el);
    } else {
      cb();
    }
  }
  loadIcon() {
    if (this.isVisible) {
      if (!parser$1) {
        parser$1 = new DOMParser();
      }
      const url = getUrl$1(this);
      if (url) {
        if (ioniconContent$1.has(url)) {
          this.svgContent = ioniconContent$1.get(url);
        } else if (url.startsWith("data:")) {
          const doc2 = parser$1.parseFromString(url, "text/html");
          const svgEl = doc2.body.querySelector("svg");
          if (svgEl !== null) {
            this.svgContent = svgEl.outerHTML;
          } else {
            this.svgContent = "";
          }
        } else {
          getSvgContent$1(url, this.sanitize).then(() => this.svgContent = ioniconContent$1.get(url));
        }
      }
    }
    const label = this.iconName = getName$1(this.name, this.icon, this.mode, this.ios, this.md);
    if (label) {
      this.ariaLabel = label.replace(/\-/g, " ");
    }
  }
  render() {
    const { iconName, ariaLabel, el, inheritedAttributes } = this;
    const mode = this.mode || "md";
    const flipRtl = this.flipRtl || iconName && (iconName.indexOf("arrow") > -1 || iconName.indexOf("chevron") > -1) && this.flipRtl !== false;
    return h(Host, Object.assign({ "aria-label": ariaLabel !== void 0 && !this.hasAriaHidden() ? ariaLabel : null, role: "img", class: Object.assign(Object.assign({ [mode]: true }, createColorClasses$2(this.color)), { [`icon-${this.size}`]: !!this.size, "flip-rtl": !!flipRtl && isRTL$2(el) }) }, inheritedAttributes), this.svgContent ? h("div", { class: "icon-inner", innerHTML: this.svgContent }) : h("div", { class: "icon-inner" }));
  }
  static get assetsDirs() {
    return ["svg"];
  }
  get el() {
    return this;
  }
  static get watchers() {
    return {
      "name": ["loadIcon"],
      "src": ["loadIcon"],
      "icon": ["loadIcon"]
    };
  }
  static get style() {
    return iconCss$1;
  }
}, [1, "ion-icon", {
  "mode": [1025],
  "color": [1],
  "ios": [1],
  "md": [1],
  "flipRtl": [4, "flip-rtl"],
  "name": [513],
  "src": [1],
  "icon": [8],
  "size": [1],
  "lazy": [4],
  "sanitize": [4],
  "svgContent": [32],
  "isVisible": [32],
  "ariaLabel": [32]
}]);
const getIonMode$1 = () => "md";
const createColorClasses$2 = (color) => {
  return color ? {
    "ion-color": true,
    [`ion-color-${color}`]: true
  } : null;
};
function defineCustomElement$1E() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-icon"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-icon":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Icon$1);
        }
        break;
    }
  });
}
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
class GestureController {
  constructor() {
    this.gestureId = 0;
    this.requestedStart = /* @__PURE__ */ new Map();
    this.disabledGestures = /* @__PURE__ */ new Map();
    this.disabledScroll = /* @__PURE__ */ new Set();
  }
  createGesture(config2) {
    var _a2;
    return new GestureDelegate(this, this.newID(), config2.name, (_a2 = config2.priority) !== null && _a2 !== void 0 ? _a2 : 0, !!config2.disableScroll);
  }
  createBlocker(opts = {}) {
    return new BlockerDelegate(this, this.newID(), opts.disable, !!opts.disableScroll);
  }
  start(gestureName, id, priority) {
    if (!this.canStart(gestureName)) {
      this.requestedStart.delete(id);
      return false;
    }
    this.requestedStart.set(id, priority);
    return true;
  }
  capture(gestureName, id, priority) {
    if (!this.start(gestureName, id, priority)) {
      return false;
    }
    const requestedStart = this.requestedStart;
    let maxPriority = -1e4;
    requestedStart.forEach((value) => {
      maxPriority = Math.max(maxPriority, value);
    });
    if (maxPriority === priority) {
      this.capturedId = id;
      requestedStart.clear();
      const event = new CustomEvent("ionGestureCaptured", { detail: { gestureName } });
      document.dispatchEvent(event);
      return true;
    }
    requestedStart.delete(id);
    return false;
  }
  release(id) {
    this.requestedStart.delete(id);
    if (this.capturedId === id) {
      this.capturedId = void 0;
    }
  }
  disableGesture(gestureName, id) {
    let set = this.disabledGestures.get(gestureName);
    if (set === void 0) {
      set = /* @__PURE__ */ new Set();
      this.disabledGestures.set(gestureName, set);
    }
    set.add(id);
  }
  enableGesture(gestureName, id) {
    const set = this.disabledGestures.get(gestureName);
    if (set !== void 0) {
      set.delete(id);
    }
  }
  disableScroll(id) {
    this.disabledScroll.add(id);
    if (this.disabledScroll.size === 1) {
      document.body.classList.add(BACKDROP_NO_SCROLL);
    }
  }
  enableScroll(id) {
    this.disabledScroll.delete(id);
    if (this.disabledScroll.size === 0) {
      document.body.classList.remove(BACKDROP_NO_SCROLL);
    }
  }
  canStart(gestureName) {
    if (this.capturedId !== void 0) {
      return false;
    }
    if (this.isDisabled(gestureName)) {
      return false;
    }
    return true;
  }
  isCaptured() {
    return this.capturedId !== void 0;
  }
  isScrollDisabled() {
    return this.disabledScroll.size > 0;
  }
  isDisabled(gestureName) {
    const disabled = this.disabledGestures.get(gestureName);
    if (disabled && disabled.size > 0) {
      return true;
    }
    return false;
  }
  newID() {
    this.gestureId++;
    return this.gestureId;
  }
}
class GestureDelegate {
  constructor(ctrl, id, name, priority, disableScroll) {
    this.id = id;
    this.name = name;
    this.disableScroll = disableScroll;
    this.priority = priority * 1e6 + id;
    this.ctrl = ctrl;
  }
  canStart() {
    if (!this.ctrl) {
      return false;
    }
    return this.ctrl.canStart(this.name);
  }
  start() {
    if (!this.ctrl) {
      return false;
    }
    return this.ctrl.start(this.name, this.id, this.priority);
  }
  capture() {
    if (!this.ctrl) {
      return false;
    }
    const captured = this.ctrl.capture(this.name, this.id, this.priority);
    if (captured && this.disableScroll) {
      this.ctrl.disableScroll(this.id);
    }
    return captured;
  }
  release() {
    if (this.ctrl) {
      this.ctrl.release(this.id);
      if (this.disableScroll) {
        this.ctrl.enableScroll(this.id);
      }
    }
  }
  destroy() {
    this.release();
    this.ctrl = void 0;
  }
}
class BlockerDelegate {
  constructor(ctrl, id, disable, disableScroll) {
    this.id = id;
    this.disable = disable;
    this.disableScroll = disableScroll;
    this.ctrl = ctrl;
  }
  block() {
    if (!this.ctrl) {
      return;
    }
    if (this.disable) {
      for (const gesture of this.disable) {
        this.ctrl.disableGesture(gesture, this.id);
      }
    }
    if (this.disableScroll) {
      this.ctrl.disableScroll(this.id);
    }
  }
  unblock() {
    if (!this.ctrl) {
      return;
    }
    if (this.disable) {
      for (const gesture of this.disable) {
        this.ctrl.enableGesture(gesture, this.id);
      }
    }
    if (this.disableScroll) {
      this.ctrl.enableScroll(this.id);
    }
  }
  destroy() {
    this.unblock();
    this.ctrl = void 0;
  }
}
const BACKDROP_NO_SCROLL = "backdrop-no-scroll";
const GESTURE_CONTROLLER = new GestureController();
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const backdropIosCss = ":host{left:0;right:0;top:0;bottom:0;display:block;position:absolute;-webkit-transform:translateZ(0);transform:translateZ(0);contain:strict;cursor:pointer;opacity:0.01;-ms-touch-action:none;touch-action:none;z-index:2}:host(.backdrop-hide){background:transparent}:host(.backdrop-no-tappable){cursor:auto}:host{background-color:var(--ion-backdrop-color, #000)}";
const backdropMdCss = ":host{left:0;right:0;top:0;bottom:0;display:block;position:absolute;-webkit-transform:translateZ(0);transform:translateZ(0);contain:strict;cursor:pointer;opacity:0.01;-ms-touch-action:none;touch-action:none;z-index:2}:host(.backdrop-hide){background:transparent}:host(.backdrop-no-tappable){cursor:auto}:host{background-color:var(--ion-backdrop-color, #000)}";
const Backdrop = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.ionBackdropTap = createEvent(this, "ionBackdropTap", 7);
    this.blocker = GESTURE_CONTROLLER.createBlocker({
      disableScroll: true
    });
    this.visible = true;
    this.tappable = true;
    this.stopPropagation = true;
  }
  connectedCallback() {
    if (this.stopPropagation) {
      this.blocker.block();
    }
  }
  disconnectedCallback() {
    this.blocker.unblock();
  }
  onMouseDown(ev) {
    this.emitTap(ev);
  }
  emitTap(ev) {
    if (this.stopPropagation) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    if (this.tappable) {
      this.ionBackdropTap.emit();
    }
  }
  render() {
    const mode = getIonMode$2(this);
    return h(Host, { tabindex: "-1", "aria-hidden": "true", class: {
      [mode]: true,
      "backdrop-hide": !this.visible,
      "backdrop-no-tappable": !this.tappable
    } });
  }
  static get style() {
    return {
      ios: backdropIosCss,
      md: backdropMdCss
    };
  }
}, [33, "ion-backdrop", {
  "visible": [4],
  "tappable": [4],
  "stopPropagation": [4, "stop-propagation"]
}, [[2, "click", "onMouseDown"]]]);
function defineCustomElement$1A() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-backdrop"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-backdrop":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Backdrop);
        }
        break;
    }
  });
}
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const hostContext = (selector, el) => {
  return el.closest(selector) !== null;
};
const createColorClasses$1 = (color, cssClassMap) => {
  return typeof color === "string" && color.length > 0 ? Object.assign({ "ion-color": true, [`ion-color-${color}`]: true }, cssClassMap) : cssClassMap;
};
const getClassList = (classes) => {
  if (classes !== void 0) {
    const array = Array.isArray(classes) ? classes : classes.split(" ");
    return array.filter((c) => c != null).map((c) => c.trim()).filter((c) => c !== "");
  }
  return [];
};
const getClassMap = (classes) => {
  const map = {};
  getClassList(classes).forEach((c) => map[c] = true);
  return map;
};
const SCHEME = /^[a-z][a-z0-9+\-.]*:/;
const openURL = async (url, ev, direction, animation2) => {
  if (url != null && url[0] !== "#" && !SCHEME.test(url)) {
    const router = document.querySelector("ion-router");
    if (router) {
      if (ev != null) {
        ev.preventDefault();
      }
      return router.push(url, direction, animation2);
    }
  }
  return false;
};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const badgeIosCss = ":host{--background:var(--ion-color-primary, #3880ff);--color:var(--ion-color-primary-contrast, #fff);--padding-top:3px;--padding-end:8px;--padding-bottom:3px;--padding-start:8px;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);display:inline-block;min-width:10px;background:var(--background);color:var(--color);font-family:var(--ion-font-family, inherit);font-size:13px;font-weight:bold;line-height:1;text-align:center;white-space:nowrap;contain:content;vertical-align:baseline}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}:host(.ion-color){background:var(--ion-color-base);color:var(--ion-color-contrast)}:host(:empty){display:none}:host{border-radius:10px}";
const badgeMdCss = ":host{--background:var(--ion-color-primary, #3880ff);--color:var(--ion-color-primary-contrast, #fff);--padding-top:3px;--padding-end:8px;--padding-bottom:3px;--padding-start:8px;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);display:inline-block;min-width:10px;background:var(--background);color:var(--color);font-family:var(--ion-font-family, inherit);font-size:13px;font-weight:bold;line-height:1;text-align:center;white-space:nowrap;contain:content;vertical-align:baseline}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}:host(.ion-color){background:var(--ion-color-base);color:var(--ion-color-contrast)}:host(:empty){display:none}:host{--padding-top:3px;--padding-end:4px;--padding-bottom:4px;--padding-start:4px;border-radius:4px}";
const Badge = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
  }
  render() {
    const mode = getIonMode$2(this);
    return h(Host, { class: createColorClasses$1(this.color, {
      [mode]: true
    }) }, h("slot", null));
  }
  static get style() {
    return {
      ios: badgeIosCss,
      md: badgeMdCss
    };
  }
}, [33, "ion-badge", {
  "color": [513]
}]);
function defineCustomElement$1$$() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-badge"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-badge":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Badge);
        }
        break;
    }
  });
}
const defineCustomElement$1y = defineCustomElement$1$$;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const printIonWarning = (message, ...params) => {
  return console.warn(`[Ionic Warning]: ${message}`, ...params);
};
const printIonError = (message, ...params) => {
  return console.error(`[Ionic Error]: ${message}`, ...params);
};
const printRequiredElementError = (el, ...targetSelectors) => {
  return console.error(`<${el.tagName.toLowerCase()}> must be used inside ${targetSelectors.join(" or ")}.`);
};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const rippleEffectCss = ":host{left:0;right:0;top:0;bottom:0;position:absolute;contain:strict;pointer-events:none}:host(.unbounded){contain:layout size style}.ripple-effect{border-radius:50%;position:absolute;background-color:currentColor;color:inherit;contain:strict;opacity:0;-webkit-animation:225ms rippleAnimation forwards, 75ms fadeInAnimation forwards;animation:225ms rippleAnimation forwards, 75ms fadeInAnimation forwards;will-change:transform, opacity;pointer-events:none}.fade-out{-webkit-transform:translate(var(--translate-end)) scale(var(--final-scale, 1));transform:translate(var(--translate-end)) scale(var(--final-scale, 1));-webkit-animation:150ms fadeOutAnimation forwards;animation:150ms fadeOutAnimation forwards}@-webkit-keyframes rippleAnimation{from{-webkit-animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);-webkit-transform:scale(1);transform:scale(1)}to{-webkit-transform:translate(var(--translate-end)) scale(var(--final-scale, 1));transform:translate(var(--translate-end)) scale(var(--final-scale, 1))}}@keyframes rippleAnimation{from{-webkit-animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);-webkit-transform:scale(1);transform:scale(1)}to{-webkit-transform:translate(var(--translate-end)) scale(var(--final-scale, 1));transform:translate(var(--translate-end)) scale(var(--final-scale, 1))}}@-webkit-keyframes fadeInAnimation{from{-webkit-animation-timing-function:linear;animation-timing-function:linear;opacity:0}to{opacity:0.16}}@keyframes fadeInAnimation{from{-webkit-animation-timing-function:linear;animation-timing-function:linear;opacity:0}to{opacity:0.16}}@-webkit-keyframes fadeOutAnimation{from{-webkit-animation-timing-function:linear;animation-timing-function:linear;opacity:0.16}to{opacity:0}}@keyframes fadeOutAnimation{from{-webkit-animation-timing-function:linear;animation-timing-function:linear;opacity:0.16}to{opacity:0}}";
const RippleEffect = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.type = "bounded";
  }
  async addRipple(x, y) {
    return new Promise((resolve) => {
      readTask(() => {
        const rect = this.el.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const hypotenuse = Math.sqrt(width * width + height * height);
        const maxDim = Math.max(height, width);
        const maxRadius = this.unbounded ? maxDim : hypotenuse + PADDING;
        const initialSize = Math.floor(maxDim * INITIAL_ORIGIN_SCALE);
        const finalScale = maxRadius / initialSize;
        let posX = x - rect.left;
        let posY = y - rect.top;
        if (this.unbounded) {
          posX = width * 0.5;
          posY = height * 0.5;
        }
        const styleX = posX - initialSize * 0.5;
        const styleY = posY - initialSize * 0.5;
        const moveX = width * 0.5 - posX;
        const moveY = height * 0.5 - posY;
        writeTask(() => {
          const div = document.createElement("div");
          div.classList.add("ripple-effect");
          const style = div.style;
          style.top = styleY + "px";
          style.left = styleX + "px";
          style.width = style.height = initialSize + "px";
          style.setProperty("--final-scale", `${finalScale}`);
          style.setProperty("--translate-end", `${moveX}px, ${moveY}px`);
          const container = this.el.shadowRoot || this.el;
          container.appendChild(div);
          setTimeout(() => {
            resolve(() => {
              removeRipple(div);
            });
          }, 225 + 100);
        });
      });
    });
  }
  get unbounded() {
    return this.type === "unbounded";
  }
  render() {
    const mode = getIonMode$2(this);
    return h(Host, { role: "presentation", class: {
      [mode]: true,
      unbounded: this.unbounded
    } });
  }
  get el() {
    return this;
  }
  static get style() {
    return rippleEffectCss;
  }
}, [1, "ion-ripple-effect", {
  "type": [1],
  "addRipple": [64]
}]);
const removeRipple = (ripple) => {
  ripple.classList.add("fade-out");
  setTimeout(() => {
    ripple.remove();
  }, 200);
};
const PADDING = 10;
const INITIAL_ORIGIN_SCALE = 0.5;
function defineCustomElement$1v() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-ripple-effect"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-ripple-effect":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, RippleEffect);
        }
        break;
    }
  });
}
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const buttonIosCss = ':host{--overflow:hidden;--ripple-color:currentColor;--border-width:initial;--border-color:initial;--border-style:initial;--color-activated:var(--color);--color-focused:var(--color);--color-hover:var(--color);--box-shadow:none;display:inline-block;width:auto;color:var(--color);font-family:var(--ion-font-family, inherit);text-align:center;text-decoration:none;text-overflow:ellipsis;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;vertical-align:top;vertical-align:-webkit-baseline-middle;-webkit-font-kerning:none;font-kerning:none}:host(.button-disabled){cursor:default;opacity:0.5;pointer-events:none}:host(.button-solid){--background:var(--ion-color-primary, #3880ff);--color:var(--ion-color-primary-contrast, #fff)}:host(.button-outline){--border-color:var(--ion-color-primary, #3880ff);--background:transparent;--color:var(--ion-color-primary, #3880ff)}:host(.button-clear){--border-width:0;--background:transparent;--color:var(--ion-color-primary, #3880ff)}:host(.button-block){display:block}:host(.button-block) .button-native{margin-left:0;margin-right:0;display:block;width:100%;clear:both;contain:content}:host(.button-block) .button-native::after{clear:both}:host(.button-full){display:block}:host(.button-full) .button-native{margin-left:0;margin-right:0;display:block;width:100%;contain:content}:host(.button-full:not(.button-round)) .button-native{border-radius:0;border-right-width:0;border-left-width:0}.button-native{border-radius:var(--border-radius);-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;display:block;position:relative;width:100%;height:100%;-webkit-transition:var(--transition);transition:var(--transition);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);outline:none;background:var(--background);line-height:1;-webkit-box-shadow:var(--box-shadow);box-shadow:var(--box-shadow);contain:layout style;cursor:pointer;opacity:var(--opacity);overflow:var(--overflow);z-index:0;-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-appearance:none;-moz-appearance:none;appearance:none}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.button-native{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.button-native::-moz-focus-inner{border:0}.button-inner{display:-ms-flexbox;display:flex;position:relative;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-ms-flex-negative:0;flex-shrink:0;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;width:100%;height:100%;z-index:1}::slotted(ion-icon){font-size:1.4em;pointer-events:none}::slotted(ion-icon[slot=start]){margin-left:-0.3em;margin-right:0.3em;margin-top:0;margin-bottom:0}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(ion-icon[slot=start]){margin-left:unset;margin-right:unset;-webkit-margin-start:-0.3em;margin-inline-start:-0.3em;-webkit-margin-end:0.3em;margin-inline-end:0.3em}}::slotted(ion-icon[slot=end]){margin-left:0.3em;margin-right:-0.2em;margin-top:0;margin-bottom:0}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(ion-icon[slot=end]){margin-left:unset;margin-right:unset;-webkit-margin-start:0.3em;margin-inline-start:0.3em;-webkit-margin-end:-0.2em;margin-inline-end:-0.2em}}::slotted(ion-icon[slot=icon-only]){font-size:1.8em}ion-ripple-effect{color:var(--ripple-color)}.button-native::after{left:0;right:0;top:0;bottom:0;position:absolute;content:"";opacity:0}:host(.ion-activated){color:var(--color-activated)}:host(.ion-activated) .button-native::after{background:var(--background-activated);opacity:var(--background-activated-opacity)}:host(.ion-focused){color:var(--color-focused)}:host(.ion-focused) .button-native::after{background:var(--background-focused);opacity:var(--background-focused-opacity)}@media (any-hover: hover){:host(:hover){color:var(--color-hover)}:host(:hover) .button-native::after{background:var(--background-hover);opacity:var(--background-hover-opacity)}}:host(.button-solid.ion-color) .button-native{background:var(--ion-color-base);color:var(--ion-color-contrast)}:host(.button-outline.ion-color) .button-native{border-color:var(--ion-color-base);background:transparent;color:var(--ion-color-base)}:host(.button-clear.ion-color) .button-native{background:transparent;color:var(--ion-color-base)}:host(.in-toolbar:not(.ion-color):not(.in-toolbar-color)) .button-native{color:var(--ion-toolbar-color, var(--color))}:host(.button-outline.in-toolbar:not(.ion-color):not(.in-toolbar-color)) .button-native{border-color:var(--ion-toolbar-color, var(--color, var(--border-color)))}:host(.button-solid.in-toolbar:not(.ion-color):not(.in-toolbar-color)) .button-native{background:var(--ion-toolbar-color, var(--background));color:var(--ion-toolbar-background, var(--color))}:host{--border-radius:10px;--padding-top:0;--padding-bottom:0;--padding-start:1em;--padding-end:1em;--transition:background-color, opacity 100ms linear;margin-left:2px;margin-right:2px;margin-top:4px;margin-bottom:4px;height:2.8em;font-size:16px;font-weight:500;letter-spacing:-0.03em}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{margin-left:unset;margin-right:unset;-webkit-margin-start:2px;margin-inline-start:2px;-webkit-margin-end:2px;margin-inline-end:2px}}:host(.button-solid){--background-activated:var(--ion-color-primary-shade, #3171e0);--background-focused:var(--ion-color-primary-shade, #3171e0);--background-hover:var(--ion-color-primary-tint, #4c8dff);--background-activated-opacity:1;--background-focused-opacity:1;--background-hover-opacity:1}:host(.button-outline){--border-radius:10px;--border-width:1px;--border-style:solid;--background-activated:var(--ion-color-primary, #3880ff);--background-focused:var(--ion-color-primary, #3880ff);--background-hover:transparent;--background-focused-opacity:.1;--color-activated:var(--ion-color-primary-contrast, #fff)}:host(.button-clear){--background-activated:transparent;--background-focused:var(--ion-color-primary, #3880ff);--background-hover:transparent;--background-focused-opacity:.1;font-size:17px;font-weight:normal;letter-spacing:0}:host(.button-large){--border-radius:12px;--padding-top:0;--padding-start:1em;--padding-end:1em;--padding-bottom:0;height:2.8em;font-size:20px}:host(.button-small){--border-radius:6px;--padding-top:0;--padding-start:0.9em;--padding-end:0.9em;--padding-bottom:0;height:2.1em;font-size:13px}:host(.button-round){--border-radius:64px;--padding-top:0;--padding-start:26px;--padding-end:26px;--padding-bottom:0}:host(.button-strong){font-weight:600}:host(.button-clear.ion-activated){opacity:0.4}:host(.button-outline.ion-activated.ion-color) .button-native{color:var(--ion-color-contrast)}:host(.button-outline.ion-activated.ion-color) .button-native::after{background:var(--ion-color-base)}:host(.button-solid.ion-color.ion-activated) .button-native::after{background:var(--ion-color-shade)}:host(.button-outline.ion-focused.ion-color) .button-native,:host(.button-clear.ion-focused.ion-color) .button-native{color:var(--ion-color-base)}:host(.button-outline.ion-focused.ion-color) .button-native::after,:host(.button-clear.ion-focused.ion-color) .button-native::after{background:var(--ion-color-base)}:host(.button-solid.ion-color.ion-focused) .button-native::after{background:var(--ion-color-shade)}@media (any-hover: hover){:host(.button-clear:hover),:host(.button-outline:hover){opacity:0.6}:host(.button-clear.ion-color:hover) .button-native,:host(.button-outline.ion-color:hover) .button-native{color:var(--ion-color-base)}:host(.button-clear.ion-color:hover) .button-native::after,:host(.button-outline.ion-color:hover) .button-native::after{background:transparent}:host(.button-solid.ion-color:hover) .button-native::after{background:var(--ion-color-tint)}:host(:hover.button-solid.in-toolbar:not(.ion-color):not(.in-toolbar-color)) .button-native::after{background:#fff;opacity:0.1}}';
const buttonMdCss = ':host{--overflow:hidden;--ripple-color:currentColor;--border-width:initial;--border-color:initial;--border-style:initial;--color-activated:var(--color);--color-focused:var(--color);--color-hover:var(--color);--box-shadow:none;display:inline-block;width:auto;color:var(--color);font-family:var(--ion-font-family, inherit);text-align:center;text-decoration:none;text-overflow:ellipsis;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;vertical-align:top;vertical-align:-webkit-baseline-middle;-webkit-font-kerning:none;font-kerning:none}:host(.button-disabled){cursor:default;opacity:0.5;pointer-events:none}:host(.button-solid){--background:var(--ion-color-primary, #3880ff);--color:var(--ion-color-primary-contrast, #fff)}:host(.button-outline){--border-color:var(--ion-color-primary, #3880ff);--background:transparent;--color:var(--ion-color-primary, #3880ff)}:host(.button-clear){--border-width:0;--background:transparent;--color:var(--ion-color-primary, #3880ff)}:host(.button-block){display:block}:host(.button-block) .button-native{margin-left:0;margin-right:0;display:block;width:100%;clear:both;contain:content}:host(.button-block) .button-native::after{clear:both}:host(.button-full){display:block}:host(.button-full) .button-native{margin-left:0;margin-right:0;display:block;width:100%;contain:content}:host(.button-full:not(.button-round)) .button-native{border-radius:0;border-right-width:0;border-left-width:0}.button-native{border-radius:var(--border-radius);-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;display:block;position:relative;width:100%;height:100%;-webkit-transition:var(--transition);transition:var(--transition);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);outline:none;background:var(--background);line-height:1;-webkit-box-shadow:var(--box-shadow);box-shadow:var(--box-shadow);contain:layout style;cursor:pointer;opacity:var(--opacity);overflow:var(--overflow);z-index:0;-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-appearance:none;-moz-appearance:none;appearance:none}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.button-native{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.button-native::-moz-focus-inner{border:0}.button-inner{display:-ms-flexbox;display:flex;position:relative;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-ms-flex-negative:0;flex-shrink:0;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;width:100%;height:100%;z-index:1}::slotted(ion-icon){font-size:1.4em;pointer-events:none}::slotted(ion-icon[slot=start]){margin-left:-0.3em;margin-right:0.3em;margin-top:0;margin-bottom:0}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(ion-icon[slot=start]){margin-left:unset;margin-right:unset;-webkit-margin-start:-0.3em;margin-inline-start:-0.3em;-webkit-margin-end:0.3em;margin-inline-end:0.3em}}::slotted(ion-icon[slot=end]){margin-left:0.3em;margin-right:-0.2em;margin-top:0;margin-bottom:0}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(ion-icon[slot=end]){margin-left:unset;margin-right:unset;-webkit-margin-start:0.3em;margin-inline-start:0.3em;-webkit-margin-end:-0.2em;margin-inline-end:-0.2em}}::slotted(ion-icon[slot=icon-only]){font-size:1.8em}ion-ripple-effect{color:var(--ripple-color)}.button-native::after{left:0;right:0;top:0;bottom:0;position:absolute;content:"";opacity:0}:host(.ion-activated){color:var(--color-activated)}:host(.ion-activated) .button-native::after{background:var(--background-activated);opacity:var(--background-activated-opacity)}:host(.ion-focused){color:var(--color-focused)}:host(.ion-focused) .button-native::after{background:var(--background-focused);opacity:var(--background-focused-opacity)}@media (any-hover: hover){:host(:hover){color:var(--color-hover)}:host(:hover) .button-native::after{background:var(--background-hover);opacity:var(--background-hover-opacity)}}:host(.button-solid.ion-color) .button-native{background:var(--ion-color-base);color:var(--ion-color-contrast)}:host(.button-outline.ion-color) .button-native{border-color:var(--ion-color-base);background:transparent;color:var(--ion-color-base)}:host(.button-clear.ion-color) .button-native{background:transparent;color:var(--ion-color-base)}:host(.in-toolbar:not(.ion-color):not(.in-toolbar-color)) .button-native{color:var(--ion-toolbar-color, var(--color))}:host(.button-outline.in-toolbar:not(.ion-color):not(.in-toolbar-color)) .button-native{border-color:var(--ion-toolbar-color, var(--color, var(--border-color)))}:host(.button-solid.in-toolbar:not(.ion-color):not(.in-toolbar-color)) .button-native{background:var(--ion-toolbar-color, var(--background));color:var(--ion-toolbar-background, var(--color))}:host{--border-radius:4px;--padding-top:0;--padding-bottom:0;--padding-start:1.1em;--padding-end:1.1em;--transition:box-shadow 280ms cubic-bezier(.4, 0, .2, 1),\n                background-color 15ms linear,\n                color 15ms linear;margin-left:2px;margin-right:2px;margin-top:4px;margin-bottom:4px;height:36px;font-size:14px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{margin-left:unset;margin-right:unset;-webkit-margin-start:2px;margin-inline-start:2px;-webkit-margin-end:2px;margin-inline-end:2px}}:host(.button-solid){--background-activated:transparent;--background-hover:var(--ion-color-primary-contrast, #fff);--background-focused:var(--ion-color-primary-contrast, #fff);--background-activated-opacity:0;--background-focused-opacity:.24;--background-hover-opacity:.08;--box-shadow:0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)}:host(.button-solid.ion-activated){--box-shadow:0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12)}:host(.button-outline){--border-width:2px;--border-style:solid;--box-shadow:none;--background-activated:transparent;--background-focused:var(--ion-color-primary, #3880ff);--background-hover:var(--ion-color-primary, #3880ff);--background-activated-opacity:0;--background-focused-opacity:.12;--background-hover-opacity:.04}:host(.button-outline.ion-activated.ion-color) .button-native{background:transparent}:host(.button-clear){--background-activated:transparent;--background-focused:var(--ion-color-primary, #3880ff);--background-hover:var(--ion-color-primary, #3880ff);--background-activated-opacity:0;--background-focused-opacity:.12;--background-hover-opacity:.04}:host(.button-round){--border-radius:64px;--padding-top:0;--padding-start:26px;--padding-end:26px;--padding-bottom:0}:host(.button-large){--padding-top:0;--padding-start:1em;--padding-end:1em;--padding-bottom:0;height:2.8em;font-size:20px}:host(.button-small){--padding-top:0;--padding-start:0.9em;--padding-end:0.9em;--padding-bottom:0;height:2.1em;font-size:13px}:host(.button-strong){font-weight:bold}::slotted(ion-icon[slot=icon-only]){padding-left:0;padding-right:0;padding-top:0;padding-bottom:0}:host(.button-solid.ion-color.ion-focused) .button-native::after{background:var(--ion-color-contrast)}:host(.button-clear.ion-color.ion-focused) .button-native::after,:host(.button-outline.ion-color.ion-focused) .button-native::after{background:var(--ion-color-base)}@media (any-hover: hover){:host(.button-solid.ion-color:hover) .button-native::after{background:var(--ion-color-contrast)}:host(.button-clear.ion-color:hover) .button-native::after,:host(.button-outline.ion-color:hover) .button-native::after{background:var(--ion-color-base)}}';
const Button = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.ionFocus = createEvent(this, "ionFocus", 7);
    this.ionBlur = createEvent(this, "ionBlur", 7);
    this.inItem = false;
    this.inListHeader = false;
    this.inToolbar = false;
    this.inheritedAttributes = {};
    this.buttonType = "button";
    this.disabled = false;
    this.routerDirection = "forward";
    this.strong = false;
    this.type = "button";
    this.handleClick = (ev) => {
      const { el } = this;
      if (this.type === "button") {
        openURL(this.href, ev, this.routerDirection, this.routerAnimation);
      } else if (hasShadowDom(el)) {
        let formEl = this.findForm();
        const { form } = this;
        if (!formEl && form !== void 0) {
          if (typeof form === "string") {
            printIonWarning(`Form with selector: "#${form}" could not be found. Verify that the id is correct and the form is rendered in the DOM.`, el);
          } else {
            printIonWarning(`The provided "form" element is invalid. Verify that the form is a HTMLFormElement and rendered in the DOM.`, el);
          }
          return;
        }
        if (!formEl) {
          formEl = el.closest("form");
        }
        if (formEl) {
          ev.preventDefault();
          const fakeButton = document.createElement("button");
          fakeButton.type = this.type;
          fakeButton.style.display = "none";
          formEl.appendChild(fakeButton);
          fakeButton.click();
          fakeButton.remove();
        }
      }
    };
    this.onFocus = () => {
      this.ionFocus.emit();
    };
    this.onBlur = () => {
      this.ionBlur.emit();
    };
  }
  componentWillLoad() {
    this.inToolbar = !!this.el.closest("ion-buttons");
    this.inListHeader = !!this.el.closest("ion-list-header");
    this.inItem = !!this.el.closest("ion-item") || !!this.el.closest("ion-item-divider");
    this.inheritedAttributes = inheritAriaAttributes(this.el);
  }
  get hasIconOnly() {
    return !!this.el.querySelector('[slot="icon-only"]');
  }
  get rippleType() {
    const hasClearFill = this.fill === void 0 || this.fill === "clear";
    if (hasClearFill && this.hasIconOnly && this.inToolbar) {
      return "unbounded";
    }
    return "bounded";
  }
  findForm() {
    const { form } = this;
    if (form instanceof HTMLFormElement) {
      return form;
    }
    if (typeof form === "string") {
      const el = document.getElementById(form);
      if (el instanceof HTMLFormElement) {
        return el;
      }
    }
    return null;
  }
  render() {
    const mode = getIonMode$2(this);
    const { buttonType, type, disabled, rel, target, size, href, color, expand, hasIconOnly, shape, strong, inheritedAttributes } = this;
    const finalSize = size === void 0 && this.inItem ? "small" : size;
    const TagType = href === void 0 ? "button" : "a";
    const attrs = TagType === "button" ? { type } : {
      download: this.download,
      href,
      rel,
      target
    };
    let fill = this.fill;
    if (fill == null) {
      fill = this.inToolbar || this.inListHeader ? "clear" : "solid";
    }
    return h(Host, { onClick: this.handleClick, "aria-disabled": disabled ? "true" : null, class: createColorClasses$1(color, {
      [mode]: true,
      [buttonType]: true,
      [`${buttonType}-${expand}`]: expand !== void 0,
      [`${buttonType}-${finalSize}`]: finalSize !== void 0,
      [`${buttonType}-${shape}`]: shape !== void 0,
      [`${buttonType}-${fill}`]: true,
      [`${buttonType}-strong`]: strong,
      "in-toolbar": hostContext("ion-toolbar", this.el),
      "in-toolbar-color": hostContext("ion-toolbar[color]", this.el),
      "button-has-icon-only": hasIconOnly,
      "button-disabled": disabled,
      "ion-activatable": true,
      "ion-focusable": true
    }) }, h(TagType, Object.assign({}, attrs, { class: "button-native", part: "native", disabled, onFocus: this.onFocus, onBlur: this.onBlur }, inheritedAttributes), h("span", { class: "button-inner" }, h("slot", { name: "icon-only" }), h("slot", { name: "start" }), h("slot", null), h("slot", { name: "end" })), mode === "md" && h("ion-ripple-effect", { type: this.rippleType })));
  }
  get el() {
    return this;
  }
  static get style() {
    return {
      ios: buttonIosCss,
      md: buttonMdCss
    };
  }
}, [33, "ion-button", {
  "color": [513],
  "buttonType": [1025, "button-type"],
  "disabled": [516],
  "expand": [513],
  "fill": [1537],
  "routerDirection": [1, "router-direction"],
  "routerAnimation": [16],
  "download": [1],
  "href": [1],
  "rel": [1],
  "shape": [513],
  "size": [513],
  "strong": [4],
  "target": [1],
  "type": [1],
  "form": [1]
}]);
function defineCustomElement$1u() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-button", "ion-ripple-effect"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-button":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Button);
        }
        break;
      case "ion-ripple-effect":
        if (!customElements.get(tagName)) {
          defineCustomElement$1v();
        }
        break;
    }
  });
}
const defineCustomElement$1t = defineCustomElement$1u;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const checkboxIosCss = ":host{--background-checked:var(--ion-color-primary, #3880ff);--border-color-checked:var(--ion-color-primary, #3880ff);--checkmark-color:var(--ion-color-primary-contrast, #fff);--checkmark-width:1;--transition:none;display:inline-block;position:relative;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;z-index:2}:host(.ion-color){--background-checked:var(--ion-color-base);--border-color-checked:var(--ion-color-base);--checkmark-color:var(--ion-color-contrast)}label{left:0;top:0;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;position:absolute;width:100%;height:100%;border:0;background:transparent;cursor:pointer;-webkit-appearance:none;-moz-appearance:none;appearance:none;outline:none;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;opacity:0}[dir=rtl] label,:host-context([dir=rtl]) label{left:unset;right:unset;right:0}label::-moz-focus-inner{border:0}input{position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;margin:0;padding:0;border:0;outline:0;clip:rect(0 0 0 0);opacity:0;overflow:hidden;-webkit-appearance:none;-moz-appearance:none}.checkbox-icon{border-radius:var(--border-radius);display:block;position:relative;width:100%;height:100%;-webkit-transition:var(--transition);transition:var(--transition);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);background:var(--background);-webkit-box-sizing:border-box;box-sizing:border-box}.checkbox-icon path{fill:none;stroke:var(--checkmark-color);stroke-width:var(--checkmark-width);opacity:0}:host(.checkbox-checked) .checkbox-icon,:host(.checkbox-indeterminate) .checkbox-icon{border-color:var(--border-color-checked);background:var(--background-checked)}:host(.checkbox-checked) .checkbox-icon path,:host(.checkbox-indeterminate) .checkbox-icon path{opacity:1}:host(.checkbox-disabled){pointer-events:none}:host{--border-radius:50%;--border-width:1px;--border-style:solid;--border-color:rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.23);--background:var(--ion-item-background, var(--ion-background-color, #fff));--size:26px;width:var(--size);height:var(--size)}:host(.checkbox-disabled){opacity:0.3}:host(.in-item){margin-left:0;margin-right:8px;margin-top:10px;margin-bottom:9px;display:block;position:static}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host(.in-item){margin-left:unset;margin-right:unset;-webkit-margin-start:0;margin-inline-start:0;-webkit-margin-end:8px;margin-inline-end:8px}}:host(.in-item[slot=start]){margin-left:2px;margin-right:20px;margin-top:8px;margin-bottom:8px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host(.in-item[slot=start]){margin-left:unset;margin-right:unset;-webkit-margin-start:2px;margin-inline-start:2px;-webkit-margin-end:20px;margin-inline-end:20px}}";
const checkboxMdCss = ":host{--background-checked:var(--ion-color-primary, #3880ff);--border-color-checked:var(--ion-color-primary, #3880ff);--checkmark-color:var(--ion-color-primary-contrast, #fff);--checkmark-width:1;--transition:none;display:inline-block;position:relative;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;z-index:2}:host(.ion-color){--background-checked:var(--ion-color-base);--border-color-checked:var(--ion-color-base);--checkmark-color:var(--ion-color-contrast)}label{left:0;top:0;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;position:absolute;width:100%;height:100%;border:0;background:transparent;cursor:pointer;-webkit-appearance:none;-moz-appearance:none;appearance:none;outline:none;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;opacity:0}[dir=rtl] label,:host-context([dir=rtl]) label{left:unset;right:unset;right:0}label::-moz-focus-inner{border:0}input{position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;margin:0;padding:0;border:0;outline:0;clip:rect(0 0 0 0);opacity:0;overflow:hidden;-webkit-appearance:none;-moz-appearance:none}.checkbox-icon{border-radius:var(--border-radius);display:block;position:relative;width:100%;height:100%;-webkit-transition:var(--transition);transition:var(--transition);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);background:var(--background);-webkit-box-sizing:border-box;box-sizing:border-box}.checkbox-icon path{fill:none;stroke:var(--checkmark-color);stroke-width:var(--checkmark-width);opacity:0}:host(.checkbox-checked) .checkbox-icon,:host(.checkbox-indeterminate) .checkbox-icon{border-color:var(--border-color-checked);background:var(--background-checked)}:host(.checkbox-checked) .checkbox-icon path,:host(.checkbox-indeterminate) .checkbox-icon path{opacity:1}:host(.checkbox-disabled){pointer-events:none}:host{--border-radius:calc(var(--size) * .125);--border-width:2px;--border-style:solid;--border-color:rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.51);--checkmark-width:3;--background:var(--ion-item-background, var(--ion-background-color, #fff));--transition:background 180ms cubic-bezier(0.4, 0, 0.2, 1);--size:18px;width:var(--size);height:var(--size)}.checkbox-icon path{stroke-dasharray:30;stroke-dashoffset:30}:host(.checkbox-checked) .checkbox-icon path,:host(.checkbox-indeterminate) .checkbox-icon path{stroke-dashoffset:0;-webkit-transition:stroke-dashoffset 90ms linear 90ms;transition:stroke-dashoffset 90ms linear 90ms}:host(.checkbox-disabled){opacity:0.3}:host(.in-item){margin-left:0;margin-right:0;margin-top:18px;margin-bottom:18px;display:block;position:static}:host(.in-item[slot=start]){margin-left:4px;margin-right:36px;margin-top:18px;margin-bottom:18px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host(.in-item[slot=start]){margin-left:unset;margin-right:unset;-webkit-margin-start:4px;margin-inline-start:4px;-webkit-margin-end:36px;margin-inline-end:36px}}";
const Checkbox = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.ionChange = createEvent(this, "ionChange", 7);
    this.ionFocus = createEvent(this, "ionFocus", 7);
    this.ionBlur = createEvent(this, "ionBlur", 7);
    this.ionStyle = createEvent(this, "ionStyle", 7);
    this.inputId = `ion-cb-${checkboxIds++}`;
    this.name = this.inputId;
    this.checked = false;
    this.indeterminate = false;
    this.disabled = false;
    this.value = "on";
    this.onClick = (ev) => {
      ev.preventDefault();
      this.setFocus();
      this.checked = !this.checked;
      this.indeterminate = false;
    };
    this.onFocus = () => {
      this.ionFocus.emit();
    };
    this.onBlur = () => {
      this.ionBlur.emit();
    };
  }
  componentWillLoad() {
    this.emitStyle();
  }
  checkedChanged(isChecked) {
    this.ionChange.emit({
      checked: isChecked,
      value: this.value
    });
    this.emitStyle();
  }
  disabledChanged() {
    this.emitStyle();
  }
  emitStyle() {
    this.ionStyle.emit({
      "checkbox-checked": this.checked,
      "interactive-disabled": this.disabled
    });
  }
  setFocus() {
    if (this.focusEl) {
      this.focusEl.focus();
    }
  }
  render() {
    const { color, checked, disabled, el, indeterminate, inputId, name, value } = this;
    const mode = getIonMode$2(this);
    const { label, labelId, labelText } = getAriaLabel(el, inputId);
    renderHiddenInput(true, el, name, checked ? value : "", disabled);
    let path = indeterminate ? h("path", { d: "M6 12L18 12", part: "mark" }) : h("path", { d: "M5.9,12.5l3.8,3.8l8.8-8.8", part: "mark" });
    if (mode === "md") {
      path = indeterminate ? h("path", { d: "M2 12H22", part: "mark" }) : h("path", { d: "M1.73,12.91 8.1,19.28 22.79,4.59", part: "mark" });
    }
    return h(Host, { onClick: this.onClick, "aria-labelledby": label ? labelId : null, "aria-checked": `${checked}`, "aria-hidden": disabled ? "true" : null, role: "checkbox", class: createColorClasses$1(color, {
      [mode]: true,
      "in-item": hostContext("ion-item", el),
      "checkbox-checked": checked,
      "checkbox-disabled": disabled,
      "checkbox-indeterminate": indeterminate,
      interactive: true
    }) }, h("svg", { class: "checkbox-icon", viewBox: "0 0 24 24", part: "container" }, path), h("label", { htmlFor: inputId }, labelText), h("input", { type: "checkbox", "aria-checked": `${checked}`, disabled, id: inputId, onFocus: () => this.onFocus(), onBlur: () => this.onBlur(), ref: (focusEl) => this.focusEl = focusEl }));
  }
  get el() {
    return this;
  }
  static get watchers() {
    return {
      "checked": ["checkedChanged"],
      "disabled": ["disabledChanged"]
    };
  }
  static get style() {
    return {
      ios: checkboxIosCss,
      md: checkboxMdCss
    };
  }
}, [33, "ion-checkbox", {
  "color": [513],
  "name": [1],
  "checked": [1028],
  "indeterminate": [1028],
  "disabled": [4],
  "value": [8]
}]);
let checkboxIds = 0;
function defineCustomElement$1l() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-checkbox"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-checkbox":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Checkbox);
        }
        break;
    }
  });
}
const defineCustomElement$1k = defineCustomElement$1l;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const SIZE_TO_MEDIA = {
  xs: "(min-width: 0px)",
  sm: "(min-width: 576px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 992px)",
  xl: "(min-width: 1200px)"
};
const matchBreakpoint = (breakpoint) => {
  if (breakpoint === void 0 || breakpoint === "") {
    return true;
  }
  if (window.matchMedia) {
    const mediaQuery = SIZE_TO_MEDIA[breakpoint];
    return window.matchMedia(mediaQuery).matches;
  }
  return false;
};
const colCss = ":host{padding-left:var(--ion-grid-column-padding-xs, var(--ion-grid-column-padding, 5px));padding-right:var(--ion-grid-column-padding-xs, var(--ion-grid-column-padding, 5px));padding-top:var(--ion-grid-column-padding-xs, var(--ion-grid-column-padding, 5px));padding-bottom:var(--ion-grid-column-padding-xs, var(--ion-grid-column-padding, 5px));margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;-webkit-box-sizing:border-box;box-sizing:border-box;position:relative;-ms-flex-preferred-size:0;flex-basis:0;-ms-flex-positive:1;flex-grow:1;width:100%;max-width:100%;min-height:1px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--ion-grid-column-padding-xs, var(--ion-grid-column-padding, 5px));padding-inline-start:var(--ion-grid-column-padding-xs, var(--ion-grid-column-padding, 5px));-webkit-padding-end:var(--ion-grid-column-padding-xs, var(--ion-grid-column-padding, 5px));padding-inline-end:var(--ion-grid-column-padding-xs, var(--ion-grid-column-padding, 5px))}}@media (min-width: 576px){:host{padding-left:var(--ion-grid-column-padding-sm, var(--ion-grid-column-padding, 5px));padding-right:var(--ion-grid-column-padding-sm, var(--ion-grid-column-padding, 5px));padding-top:var(--ion-grid-column-padding-sm, var(--ion-grid-column-padding, 5px));padding-bottom:var(--ion-grid-column-padding-sm, var(--ion-grid-column-padding, 5px))}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--ion-grid-column-padding-sm, var(--ion-grid-column-padding, 5px));padding-inline-start:var(--ion-grid-column-padding-sm, var(--ion-grid-column-padding, 5px));-webkit-padding-end:var(--ion-grid-column-padding-sm, var(--ion-grid-column-padding, 5px));padding-inline-end:var(--ion-grid-column-padding-sm, var(--ion-grid-column-padding, 5px))}}}@media (min-width: 768px){:host{padding-left:var(--ion-grid-column-padding-md, var(--ion-grid-column-padding, 5px));padding-right:var(--ion-grid-column-padding-md, var(--ion-grid-column-padding, 5px));padding-top:var(--ion-grid-column-padding-md, var(--ion-grid-column-padding, 5px));padding-bottom:var(--ion-grid-column-padding-md, var(--ion-grid-column-padding, 5px))}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--ion-grid-column-padding-md, var(--ion-grid-column-padding, 5px));padding-inline-start:var(--ion-grid-column-padding-md, var(--ion-grid-column-padding, 5px));-webkit-padding-end:var(--ion-grid-column-padding-md, var(--ion-grid-column-padding, 5px));padding-inline-end:var(--ion-grid-column-padding-md, var(--ion-grid-column-padding, 5px))}}}@media (min-width: 992px){:host{padding-left:var(--ion-grid-column-padding-lg, var(--ion-grid-column-padding, 5px));padding-right:var(--ion-grid-column-padding-lg, var(--ion-grid-column-padding, 5px));padding-top:var(--ion-grid-column-padding-lg, var(--ion-grid-column-padding, 5px));padding-bottom:var(--ion-grid-column-padding-lg, var(--ion-grid-column-padding, 5px))}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--ion-grid-column-padding-lg, var(--ion-grid-column-padding, 5px));padding-inline-start:var(--ion-grid-column-padding-lg, var(--ion-grid-column-padding, 5px));-webkit-padding-end:var(--ion-grid-column-padding-lg, var(--ion-grid-column-padding, 5px));padding-inline-end:var(--ion-grid-column-padding-lg, var(--ion-grid-column-padding, 5px))}}}@media (min-width: 1200px){:host{padding-left:var(--ion-grid-column-padding-xl, var(--ion-grid-column-padding, 5px));padding-right:var(--ion-grid-column-padding-xl, var(--ion-grid-column-padding, 5px));padding-top:var(--ion-grid-column-padding-xl, var(--ion-grid-column-padding, 5px));padding-bottom:var(--ion-grid-column-padding-xl, var(--ion-grid-column-padding, 5px))}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--ion-grid-column-padding-xl, var(--ion-grid-column-padding, 5px));padding-inline-start:var(--ion-grid-column-padding-xl, var(--ion-grid-column-padding, 5px));-webkit-padding-end:var(--ion-grid-column-padding-xl, var(--ion-grid-column-padding, 5px));padding-inline-end:var(--ion-grid-column-padding-xl, var(--ion-grid-column-padding, 5px))}}}";
const BREAKPOINTS = ["", "xs", "sm", "md", "lg", "xl"];
const Col = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
  }
  onResize() {
    forceUpdate(this);
  }
  getColumns(property) {
    let matched;
    for (const breakpoint of BREAKPOINTS) {
      const matches = matchBreakpoint(breakpoint);
      const columns = this[property + breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1)];
      if (matches && columns !== void 0) {
        matched = columns;
      }
    }
    return matched;
  }
  calculateSize() {
    const columns = this.getColumns("size");
    if (!columns || columns === "") {
      return;
    }
    const colSize = columns === "auto" ? "auto" : columns / 12 * 100 + "%";
    return {
      flex: `0 0 ${colSize}`,
      width: `${colSize}`,
      "max-width": `${colSize}`
    };
  }
  calculatePosition(property, modifier) {
    const columns = this.getColumns(property);
    if (!columns) {
      return;
    }
    const amount = columns > 0 && columns < 12 ? columns / 12 * 100 + "%" : "auto";
    return {
      [modifier]: amount
    };
  }
  calculateOffset(isRTL2) {
    return this.calculatePosition("offset", isRTL2 ? "margin-right" : "margin-left");
  }
  calculatePull(isRTL2) {
    return this.calculatePosition("pull", isRTL2 ? "left" : "right");
  }
  calculatePush(isRTL2) {
    return this.calculatePosition("push", isRTL2 ? "right" : "left");
  }
  render() {
    const isRTL2 = document.dir === "rtl";
    const mode = getIonMode$2(this);
    return h(Host, { class: {
      [mode]: true
    }, style: Object.assign(Object.assign(Object.assign(Object.assign({}, this.calculateOffset(isRTL2)), this.calculatePull(isRTL2)), this.calculatePush(isRTL2)), this.calculateSize()) }, h("slot", null));
  }
  static get style() {
    return colCss;
  }
}, [1, "ion-col", {
  "offset": [1],
  "offsetXs": [1, "offset-xs"],
  "offsetSm": [1, "offset-sm"],
  "offsetMd": [1, "offset-md"],
  "offsetLg": [1, "offset-lg"],
  "offsetXl": [1, "offset-xl"],
  "pull": [1],
  "pullXs": [1, "pull-xs"],
  "pullSm": [1, "pull-sm"],
  "pullMd": [1, "pull-md"],
  "pullLg": [1, "pull-lg"],
  "pullXl": [1, "pull-xl"],
  "push": [1],
  "pushXs": [1, "push-xs"],
  "pushSm": [1, "push-sm"],
  "pushMd": [1, "push-md"],
  "pushLg": [1, "push-lg"],
  "pushXl": [1, "push-xl"],
  "size": [1],
  "sizeXs": [1, "size-xs"],
  "sizeSm": [1, "size-sm"],
  "sizeMd": [1, "size-md"],
  "sizeLg": [1, "size-lg"],
  "sizeXl": [1, "size-xl"]
}, [[9, "resize", "onResize"]]]);
function defineCustomElement$1$S() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-col"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-col":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Col);
        }
        break;
    }
  });
}
const defineCustomElement$1i = defineCustomElement$1$S;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const isRTL$1 = (hostEl) => {
  if (hostEl) {
    if (hostEl.dir !== "") {
      return hostEl.dir.toLowerCase() === "rtl";
    }
  }
  return (document === null || document === void 0 ? void 0 : document.dir.toLowerCase()) === "rtl";
};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const contentCss = ':host{--background:var(--ion-background-color, #fff);--color:var(--ion-text-color, #000);--padding-top:0px;--padding-bottom:0px;--padding-start:0px;--padding-end:0px;--keyboard-offset:0px;--offset-top:0px;--offset-bottom:0px;--overflow:auto;display:block;position:relative;-ms-flex:1;flex:1;width:100%;height:100%;margin:0 !important;padding:0 !important;font-family:var(--ion-font-family, inherit);contain:size style}:host(.ion-color) .inner-scroll{background:var(--ion-color-base);color:var(--ion-color-contrast)}:host(.outer-content){--background:var(--ion-color-step-50, #f2f2f2)}#background-content{left:0px;right:0px;top:calc(var(--offset-top) * -1);bottom:calc(var(--offset-bottom) * -1);position:absolute;background:var(--background)}.inner-scroll{left:0px;right:0px;top:calc(var(--offset-top) * -1);bottom:calc(var(--offset-bottom) * -1);padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:calc(var(--padding-top) + var(--offset-top));padding-bottom:calc(var(--padding-bottom) + var(--keyboard-offset) + var(--offset-bottom));position:absolute;color:var(--color);-webkit-box-sizing:border-box;box-sizing:border-box;overflow:hidden;-ms-touch-action:pan-x pan-y pinch-zoom;touch-action:pan-x pan-y pinch-zoom}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.inner-scroll{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.scroll-y,.scroll-x{-webkit-overflow-scrolling:touch;z-index:0;will-change:scroll-position}.scroll-y{overflow-y:var(--overflow);overscroll-behavior-y:contain}.scroll-x{overflow-x:var(--overflow);overscroll-behavior-x:contain}.overscroll::before,.overscroll::after{position:absolute;width:1px;height:1px;content:""}.overscroll::before{bottom:-1px}.overscroll::after{top:-1px}:host(.content-sizing){display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;min-height:0;contain:none}:host(.content-sizing) .inner-scroll{position:relative;top:0;bottom:0;margin-top:calc(var(--offset-top) * -1);margin-bottom:calc(var(--offset-bottom) * -1)}.transition-effect{display:none;position:absolute;width:100%;height:100vh;opacity:0;pointer-events:none}:host(.content-ltr) .transition-effect{left:-100%;}:host(.content-rtl) .transition-effect{right:-100%;}.transition-cover{position:absolute;right:0;width:100%;height:100%;background:black;opacity:0.1}.transition-shadow{display:block;position:absolute;width:10px;height:100%;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAgCAYAAAAIXrg4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTE3MDgzRkQ5QTkyMTFFOUEwNzQ5MkJFREE1NUY2MjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTE3MDgzRkU5QTkyMTFFOUEwNzQ5MkJFREE1NUY2MjQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxMTcwODNGQjlBOTIxMUU5QTA3NDkyQkVEQTU1RjYyNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxMTcwODNGQzlBOTIxMUU5QTA3NDkyQkVEQTU1RjYyNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PmePEuQAAABNSURBVHjaYvz//z8DIxAwMDAwATGMhmFmPDQuOSZks0AMmoJBaQHjkPfB0Lfg/2gQjVow+HPy/yHvg9GiYjQfjMbBqAWjFgy/4hogwADYqwdzxy5BuwAAAABJRU5ErkJggg==);background-repeat:repeat-y;background-size:10px 16px}:host(.content-ltr) .transition-shadow{right:0;}:host(.content-rtl) .transition-shadow{left:0;-webkit-transform:scaleX(-1);transform:scaleX(-1)}::slotted([slot=fixed]){position:absolute;-webkit-transform:translateZ(0);transform:translateZ(0)}';
const Content = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.ionScrollStart = createEvent(this, "ionScrollStart", 7);
    this.ionScroll = createEvent(this, "ionScroll", 7);
    this.ionScrollEnd = createEvent(this, "ionScrollEnd", 7);
    this.isScrolling = false;
    this.lastScroll = 0;
    this.queued = false;
    this.cTop = -1;
    this.cBottom = -1;
    this.isMainContent = true;
    this.detail = {
      scrollTop: 0,
      scrollLeft: 0,
      type: "scroll",
      event: void 0,
      startX: 0,
      startY: 0,
      startTime: 0,
      currentX: 0,
      currentY: 0,
      velocityX: 0,
      velocityY: 0,
      deltaX: 0,
      deltaY: 0,
      currentTime: 0,
      data: void 0,
      isScrolling: true
    };
    this.fullscreen = false;
    this.scrollX = false;
    this.scrollY = true;
    this.scrollEvents = false;
  }
  connectedCallback() {
    this.isMainContent = this.el.closest("ion-menu, ion-popover, ion-modal") === null;
  }
  disconnectedCallback() {
    this.onScrollEnd();
  }
  onAppLoad() {
    this.resize();
  }
  shouldForceOverscroll() {
    const { forceOverscroll } = this;
    const mode = getIonMode$2(this);
    return forceOverscroll === void 0 ? mode === "ios" && isPlatform("ios") : forceOverscroll;
  }
  resize() {
    if (this.fullscreen) {
      readTask(() => this.readDimensions());
    } else if (this.cTop !== 0 || this.cBottom !== 0) {
      this.cTop = this.cBottom = 0;
      forceUpdate(this);
    }
  }
  readDimensions() {
    const page = getPageElement(this.el);
    const top = Math.max(this.el.offsetTop, 0);
    const bottom = Math.max(page.offsetHeight - top - this.el.offsetHeight, 0);
    const dirty = top !== this.cTop || bottom !== this.cBottom;
    if (dirty) {
      this.cTop = top;
      this.cBottom = bottom;
      forceUpdate(this);
    }
  }
  onScroll(ev) {
    const timeStamp = Date.now();
    const shouldStart = !this.isScrolling;
    this.lastScroll = timeStamp;
    if (shouldStart) {
      this.onScrollStart();
    }
    if (!this.queued && this.scrollEvents) {
      this.queued = true;
      readTask((ts) => {
        this.queued = false;
        this.detail.event = ev;
        updateScrollDetail(this.detail, this.scrollEl, ts, shouldStart);
        this.ionScroll.emit(this.detail);
      });
    }
  }
  async getScrollElement() {
    if (!this.scrollEl) {
      await new Promise((resolve) => componentOnReady(this.el, resolve));
    }
    return Promise.resolve(this.scrollEl);
  }
  async getBackgroundElement() {
    if (!this.backgroundContentEl) {
      await new Promise((resolve) => componentOnReady(this.el, resolve));
    }
    return Promise.resolve(this.backgroundContentEl);
  }
  scrollToTop(duration = 0) {
    return this.scrollToPoint(void 0, 0, duration);
  }
  async scrollToBottom(duration = 0) {
    const scrollEl = await this.getScrollElement();
    const y = scrollEl.scrollHeight - scrollEl.clientHeight;
    return this.scrollToPoint(void 0, y, duration);
  }
  async scrollByPoint(x, y, duration) {
    const scrollEl = await this.getScrollElement();
    return this.scrollToPoint(x + scrollEl.scrollLeft, y + scrollEl.scrollTop, duration);
  }
  async scrollToPoint(x, y, duration = 0) {
    const el = await this.getScrollElement();
    if (duration < 32) {
      if (y != null) {
        el.scrollTop = y;
      }
      if (x != null) {
        el.scrollLeft = x;
      }
      return;
    }
    let resolve;
    let startTime = 0;
    const promise = new Promise((r) => resolve = r);
    const fromY = el.scrollTop;
    const fromX = el.scrollLeft;
    const deltaY = y != null ? y - fromY : 0;
    const deltaX = x != null ? x - fromX : 0;
    const step = (timeStamp) => {
      const linearTime = Math.min(1, (timeStamp - startTime) / duration) - 1;
      const easedT = Math.pow(linearTime, 3) + 1;
      if (deltaY !== 0) {
        el.scrollTop = Math.floor(easedT * deltaY + fromY);
      }
      if (deltaX !== 0) {
        el.scrollLeft = Math.floor(easedT * deltaX + fromX);
      }
      if (easedT < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };
    requestAnimationFrame((ts) => {
      startTime = ts;
      step(ts);
    });
    return promise;
  }
  onScrollStart() {
    this.isScrolling = true;
    this.ionScrollStart.emit({
      isScrolling: true
    });
    if (this.watchDog) {
      clearInterval(this.watchDog);
    }
    this.watchDog = setInterval(() => {
      if (this.lastScroll < Date.now() - 120) {
        this.onScrollEnd();
      }
    }, 100);
  }
  onScrollEnd() {
    clearInterval(this.watchDog);
    this.watchDog = null;
    if (this.isScrolling) {
      this.isScrolling = false;
      this.ionScrollEnd.emit({
        isScrolling: false
      });
    }
  }
  render() {
    const { isMainContent, scrollX, scrollY, el } = this;
    const rtl = isRTL$1(el) ? "rtl" : "ltr";
    const mode = getIonMode$2(this);
    const forceOverscroll = this.shouldForceOverscroll();
    const transitionShadow = mode === "ios";
    const TagType = isMainContent ? "main" : "div";
    this.resize();
    return h(Host, { class: createColorClasses$1(this.color, {
      [mode]: true,
      "content-sizing": hostContext("ion-popover", this.el),
      overscroll: forceOverscroll,
      [`content-${rtl}`]: true
    }), style: {
      "--offset-top": `${this.cTop}px`,
      "--offset-bottom": `${this.cBottom}px`
    } }, h("div", { ref: (el2) => this.backgroundContentEl = el2, id: "background-content", part: "background" }), h(TagType, { class: {
      "inner-scroll": true,
      "scroll-x": scrollX,
      "scroll-y": scrollY,
      overscroll: (scrollX || scrollY) && forceOverscroll
    }, ref: (scrollEl) => this.scrollEl = scrollEl, onScroll: this.scrollEvents ? (ev) => this.onScroll(ev) : void 0, part: "scroll" }, h("slot", null)), transitionShadow ? h("div", { class: "transition-effect" }, h("div", { class: "transition-cover" }), h("div", { class: "transition-shadow" })) : null, h("slot", { name: "fixed" }));
  }
  get el() {
    return this;
  }
  static get style() {
    return contentCss;
  }
}, [1, "ion-content", {
  "color": [513],
  "fullscreen": [4],
  "forceOverscroll": [1028, "force-overscroll"],
  "scrollX": [4, "scroll-x"],
  "scrollY": [4, "scroll-y"],
  "scrollEvents": [4, "scroll-events"],
  "getScrollElement": [64],
  "getBackgroundElement": [64],
  "scrollToTop": [64],
  "scrollToBottom": [64],
  "scrollByPoint": [64],
  "scrollToPoint": [64]
}, [[8, "appload", "onAppLoad"]]]);
const getParentElement = (el) => {
  var _a2;
  if (el.parentElement) {
    return el.parentElement;
  }
  if ((_a2 = el.parentNode) === null || _a2 === void 0 ? void 0 : _a2.host) {
    return el.parentNode.host;
  }
  return null;
};
const getPageElement = (el) => {
  const tabs = el.closest("ion-tabs");
  if (tabs) {
    return tabs;
  }
  const page = el.closest("ion-app, ion-page, .ion-page, page-inner, .popover-content");
  if (page) {
    return page;
  }
  return getParentElement(el);
};
const updateScrollDetail = (detail, el, timestamp, shouldStart) => {
  const prevX = detail.currentX;
  const prevY = detail.currentY;
  const prevT = detail.currentTime;
  const currentX = el.scrollLeft;
  const currentY = el.scrollTop;
  const timeDelta = timestamp - prevT;
  if (shouldStart) {
    detail.startTime = timestamp;
    detail.startX = currentX;
    detail.startY = currentY;
    detail.velocityX = detail.velocityY = 0;
  }
  detail.currentTime = timestamp;
  detail.currentX = detail.scrollLeft = currentX;
  detail.currentY = detail.scrollTop = currentY;
  detail.deltaX = currentX - detail.startX;
  detail.deltaY = currentY - detail.startY;
  if (timeDelta > 0 && timeDelta < 100) {
    const velocityX = (currentX - prevX) / timeDelta;
    const velocityY = (currentY - prevY) / timeDelta;
    detail.velocityX = velocityX * 0.7 + detail.velocityX * 0.3;
    detail.velocityY = velocityY * 0.7 + detail.velocityY * 0.3;
  }
};
function defineCustomElement$1$R() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-content"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-content":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Content);
        }
        break;
    }
  });
}
const defineCustomElement$1h = defineCustomElement$1$R;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const ION_FOCUSED = "ion-focused";
const ION_FOCUSABLE = "ion-focusable";
const FOCUS_KEYS = [
  "Tab",
  "ArrowDown",
  "Space",
  "Escape",
  " ",
  "Shift",
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "Home",
  "End"
];
const startFocusVisible = (rootEl) => {
  let currentFocus = [];
  let keyboardMode = true;
  const ref2 = rootEl ? rootEl.shadowRoot : document;
  const root = rootEl ? rootEl : document.body;
  const setFocus = (elements) => {
    currentFocus.forEach((el) => el.classList.remove(ION_FOCUSED));
    elements.forEach((el) => el.classList.add(ION_FOCUSED));
    currentFocus = elements;
  };
  const pointerDown = () => {
    keyboardMode = false;
    setFocus([]);
  };
  const onKeydown = (ev) => {
    keyboardMode = FOCUS_KEYS.includes(ev.key);
    if (!keyboardMode) {
      setFocus([]);
    }
  };
  const onFocusin = (ev) => {
    if (keyboardMode && ev.composedPath !== void 0) {
      const toFocus = ev.composedPath().filter((el) => {
        if (el.classList) {
          return el.classList.contains(ION_FOCUSABLE);
        }
        return false;
      });
      setFocus(toFocus);
    }
  };
  const onFocusout = () => {
    if (ref2.activeElement === root) {
      setFocus([]);
    }
  };
  ref2.addEventListener("keydown", onKeydown);
  ref2.addEventListener("focusin", onFocusin);
  ref2.addEventListener("focusout", onFocusout);
  ref2.addEventListener("touchstart", pointerDown);
  ref2.addEventListener("mousedown", pointerDown);
  const destroy = () => {
    ref2.removeEventListener("keydown", onKeydown);
    ref2.removeEventListener("focusin", onFocusin);
    ref2.removeEventListener("focusout", onFocusout);
    ref2.removeEventListener("touchstart", pointerDown);
    ref2.removeEventListener("mousedown", pointerDown);
  };
  return {
    destroy,
    setFocus
  };
};
const focusVisible = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  startFocusVisible
}, Symbol.toStringTag, { value: "Module" }));
const removeDateTzOffset = (date) => {
  const tzOffset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() - tzOffset);
  return date;
};
removeDateTzOffset(new Date("2022T01:00"));
removeDateTzOffset(new Date("2022T13:00"));
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const noteIosCss = ":host{color:var(--color);font-family:var(--ion-font-family, inherit);-webkit-box-sizing:border-box;box-sizing:border-box}:host(.ion-color){color:var(--ion-color-base)}:host{--color:var(--ion-color-step-350, #a6a6a6)}";
const noteMdCss = ":host{color:var(--color);font-family:var(--ion-font-family, inherit);-webkit-box-sizing:border-box;box-sizing:border-box}:host(.ion-color){color:var(--ion-color-base)}:host{--color:var(--ion-color-step-600, #666666);font-size:14px}";
const Note = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
  }
  render() {
    const mode = getIonMode$2(this);
    return h(Host, { class: createColorClasses$1(this.color, {
      [mode]: true
    }) }, h("slot", null));
  }
  static get style() {
    return {
      ios: noteIosCss,
      md: noteMdCss
    };
  }
}, [33, "ion-note", {
  "color": [513]
}]);
function defineCustomElement$1g() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-note"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-note":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Note);
        }
        break;
    }
  });
}
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const itemIosCss = ':host{--border-radius:0px;--border-width:0px;--border-style:solid;--padding-top:0px;--padding-bottom:0px;--padding-end:0px;--padding-start:0px;--inner-border-width:0px;--inner-padding-top:0px;--inner-padding-bottom:0px;--inner-padding-start:0px;--inner-padding-end:0px;--inner-box-shadow:none;--show-full-highlight:0;--show-inset-highlight:0;--detail-icon-color:initial;--detail-icon-font-size:20px;--detail-icon-opacity:0.25;--color-activated:var(--color);--color-focused:var(--color);--color-hover:var(--color);--ripple-color:currentColor;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:block;position:relative;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;outline:none;color:var(--color);font-family:var(--ion-font-family, inherit);text-align:initial;text-decoration:none;overflow:hidden;-webkit-box-sizing:border-box;box-sizing:border-box}:host(.ion-color:not(.item-fill-solid):not(.item-fill-outline)) .item-native{background:var(--ion-color-base);color:var(--ion-color-contrast)}:host(.ion-color:not(.item-fill-solid):not(.item-fill-outline)) .item-native,:host(.ion-color:not(.item-fill-solid):not(.item-fill-outline)) .item-inner{border-color:var(--ion-color-shade)}:host(.ion-activated) .item-native{color:var(--color-activated)}:host(.ion-activated) .item-native::after{background:var(--background-activated);opacity:var(--background-activated-opacity)}:host(.ion-color.ion-activated) .item-native{color:var(--ion-color-contrast)}:host(.ion-focused) .item-native{color:var(--color-focused)}:host(.ion-focused) .item-native::after{background:var(--background-focused);opacity:var(--background-focused-opacity)}:host(.ion-color.ion-focused) .item-native{color:var(--ion-color-contrast)}:host(.ion-color.ion-focused) .item-native::after{background:var(--ion-color-contrast)}@media (any-hover: hover){:host(.ion-activatable:not(.ion-focused):hover) .item-native{color:var(--color-hover)}:host(.ion-activatable:not(.ion-focused):hover) .item-native::after{background:var(--background-hover);opacity:var(--background-hover-opacity)}:host(.ion-color.ion-activatable:not(.ion-focused):hover) .item-native{color:var(--ion-color-contrast)}:host(.ion-color.ion-activatable:not(.ion-focused):hover) .item-native::after{background:var(--ion-color-contrast)}}:host(.item-interactive-disabled:not(.item-multiple-inputs)){cursor:default;pointer-events:none}:host(.item-disabled){cursor:default;opacity:0.3;pointer-events:none}.item-native{border-radius:var(--border-radius);margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:calc(var(--padding-start) + var(--ion-safe-area-left, 0px));padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;display:-ms-flexbox;display:flex;position:relative;-ms-flex-align:inherit;align-items:inherit;-ms-flex-pack:inherit;justify-content:inherit;width:100%;min-height:var(--min-height);-webkit-transition:var(--transition);transition:var(--transition);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);outline:none;background:var(--background);overflow:inherit;-webkit-box-sizing:border-box;box-sizing:border-box;z-index:1}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.item-native{padding-left:unset;padding-right:unset;-webkit-padding-start:calc(var(--padding-start) + var(--ion-safe-area-left, 0px));padding-inline-start:calc(var(--padding-start) + var(--ion-safe-area-left, 0px));-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.item-native::-moz-focus-inner{border:0}.item-native::after{left:0;right:0;top:0;bottom:0;position:absolute;content:"";opacity:0;-webkit-transition:var(--transition);transition:var(--transition);z-index:-1}button,a{cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-user-drag:none}.item-inner{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:var(--inner-padding-start);padding-right:calc(var(--ion-safe-area-right, 0px) + var(--inner-padding-end));padding-top:var(--inner-padding-top);padding-bottom:var(--inner-padding-bottom);display:-ms-flexbox;display:flex;position:relative;-ms-flex:1;flex:1;-ms-flex-direction:inherit;flex-direction:inherit;-ms-flex-align:inherit;align-items:inherit;-ms-flex-item-align:stretch;align-self:stretch;min-height:inherit;border-width:var(--inner-border-width);border-style:var(--border-style);border-color:var(--border-color);-webkit-box-shadow:var(--inner-box-shadow);box-shadow:var(--inner-box-shadow);overflow:inherit;-webkit-box-sizing:border-box;box-sizing:border-box}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.item-inner{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--inner-padding-start);padding-inline-start:var(--inner-padding-start);-webkit-padding-end:calc(var(--ion-safe-area-right, 0px) + var(--inner-padding-end));padding-inline-end:calc(var(--ion-safe-area-right, 0px) + var(--inner-padding-end))}}.item-bottom{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:calc(var(--padding-start) + var(--ion-safe-area-left, 0px));padding-right:var(--inner-padding-end);padding-top:0;padding-bottom:0;display:-ms-flexbox;display:flex;-ms-flex-pack:justify;justify-content:space-between}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.item-bottom{padding-left:unset;padding-right:unset;-webkit-padding-start:calc(var(--padding-start) + var(--ion-safe-area-left, 0px));padding-inline-start:calc(var(--padding-start) + var(--ion-safe-area-left, 0px));-webkit-padding-end:var(--inner-padding-end);padding-inline-end:var(--inner-padding-end)}}.item-detail-icon{color:var(--detail-icon-color);font-size:var(--detail-icon-font-size);opacity:var(--detail-icon-opacity)}::slotted(ion-icon){font-size:1.6em}::slotted(ion-button){--margin-top:0;--margin-bottom:0;--margin-start:0;--margin-end:0;z-index:1}::slotted(ion-label:not([slot=end])){-ms-flex:1;flex:1}:host(.item-input){-ms-flex-align:center;align-items:center}.input-wrapper{display:-ms-flexbox;display:flex;-ms-flex:1;flex:1;-ms-flex-direction:inherit;flex-direction:inherit;-ms-flex-align:inherit;align-items:inherit;-ms-flex-item-align:stretch;align-self:stretch;text-overflow:ellipsis;overflow:inherit;-webkit-box-sizing:border-box;box-sizing:border-box}:host(.item-label-stacked),:host(.item-label-floating){-ms-flex-align:start;align-items:start}:host(.item-label-stacked) .input-wrapper,:host(.item-label-floating) .input-wrapper{-ms-flex:1;flex:1;-ms-flex-direction:column;flex-direction:column}.item-highlight,.item-inner-highlight{left:0;right:0;top:0;bottom:0;border-radius:inherit;position:absolute;width:100%;height:100%;-webkit-transform:scaleX(0);transform:scaleX(0);-webkit-transition:border-bottom-width 200ms, -webkit-transform 200ms;transition:border-bottom-width 200ms, -webkit-transform 200ms;transition:transform 200ms, border-bottom-width 200ms;transition:transform 200ms, border-bottom-width 200ms, -webkit-transform 200ms;z-index:2;-webkit-box-sizing:border-box;box-sizing:border-box;pointer-events:none}:host(.item-interactive.ion-focused),:host(.item-interactive.item-has-focus),:host(.item-interactive.ion-touched.ion-invalid){--full-highlight-height:calc(var(--highlight-height) * var(--show-full-highlight));--inset-highlight-height:calc(var(--highlight-height) * var(--show-inset-highlight))}:host(.ion-focused) .item-highlight,:host(.ion-focused) .item-inner-highlight,:host(.item-has-focus) .item-highlight,:host(.item-has-focus) .item-inner-highlight{-webkit-transform:scaleX(1);transform:scaleX(1);border-style:var(--border-style);border-color:var(--highlight-background)}:host(.ion-focused) .item-highlight,:host(.item-has-focus) .item-highlight{border-width:var(--full-highlight-height);opacity:var(--show-full-highlight)}:host(.ion-focused) .item-inner-highlight,:host(.item-has-focus) .item-inner-highlight{border-bottom-width:var(--inset-highlight-height);opacity:var(--show-inset-highlight)}:host(.ion-focused.item-fill-solid) .item-highlight,:host(.item-has-focus.item-fill-solid) .item-highlight{border-width:calc(var(--full-highlight-height) - 1px)}:host(.ion-focused) .item-inner-highlight,:host(.ion-focused:not(.item-fill-outline)) .item-highlight,:host(.item-has-focus) .item-inner-highlight,:host(.item-has-focus:not(.item-fill-outline)) .item-highlight{border-top:none;border-right:none;border-left:none}:host(.item-interactive.ion-focused),:host(.item-interactive.item-has-focus){--highlight-background:var(--highlight-color-focused)}:host(.item-interactive.ion-valid){--highlight-background:var(--highlight-color-valid)}:host(.item-interactive.ion-invalid){--highlight-background:var(--highlight-color-invalid)}:host(.item-interactive.ion-invalid) ::slotted([slot=helper]){display:none}::slotted([slot=error]){display:none;color:var(--highlight-color-invalid)}:host(.item-interactive.ion-invalid) ::slotted([slot=error]){display:block}:host(:not(.item-label)) ::slotted(ion-select){--padding-start:0;max-width:none}:host(.item-label-stacked) ::slotted(ion-select),:host(.item-label-floating) ::slotted(ion-select){--padding-top:8px;--padding-bottom:8px;--padding-start:0;-ms-flex-item-align:stretch;align-self:stretch;width:100%;max-width:100%}:host(:not(.item-label)) ::slotted(ion-datetime){--padding-start:0}:host(.item-label-stacked) ::slotted(ion-datetime),:host(.item-label-floating) ::slotted(ion-datetime){--padding-start:0;width:100%}:host(.item-multiple-inputs) ::slotted(ion-checkbox),:host(.item-multiple-inputs) ::slotted(ion-datetime),:host(.item-multiple-inputs) ::slotted(ion-radio),:host(.item-multiple-inputs) ::slotted(ion-select){position:relative}:host(.item-textarea){-ms-flex-align:stretch;align-items:stretch}::slotted(ion-reorder[slot]){margin-top:0;margin-bottom:0}ion-ripple-effect{color:var(--ripple-color)}:host(.item-fill-solid) ::slotted([slot=start]),:host(.item-fill-solid) ::slotted([slot=end]),:host(.item-fill-outline) ::slotted([slot=start]),:host(.item-fill-outline) ::slotted([slot=end]){-ms-flex-item-align:center;align-self:center}::slotted([slot=helper]),::slotted([slot=error]),.item-counter{padding-top:5px;font-size:12px;z-index:1}.item-counter{margin-left:auto;color:var(--ion-color-step-550, #737373);white-space:nowrap;-webkit-padding-start:16px;padding-inline-start:16px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.item-counter{margin-left:unset;-webkit-margin-start:auto;margin-inline-start:auto}}@media (prefers-reduced-motion: reduce){.item-highlight,.item-inner-highlight{-webkit-transition:none;transition:none}}:host{--min-height:44px;--transition:background-color 200ms linear, opacity 200ms linear;--padding-start:20px;--inner-padding-end:10px;--inner-border-width:0px 0px 0.55px 0px;--background:var(--ion-item-background, var(--ion-background-color, #fff));--background-activated:#000;--background-focused:#000;--background-hover:currentColor;--background-activated-opacity:.12;--background-focused-opacity:.15;--background-hover-opacity:.04;--border-color:var(--ion-item-border-color, var(--ion-border-color, var(--ion-color-step-250, #c8c7cc)));--color:var(--ion-item-color, var(--ion-text-color, #000));--highlight-height:0px;--highlight-color-focused:var(--ion-color-primary, #3880ff);--highlight-color-valid:var(--ion-color-success, #2dd36f);--highlight-color-invalid:var(--ion-color-danger, #eb445a);--bottom-padding-start:0px;font-size:17px}:host(.ion-activated){--transition:none}:host(.ion-color.ion-focused) .item-native::after{background:#000;opacity:0.15}:host(.ion-color.ion-activated) .item-native::after{background:#000;opacity:0.12}:host(.item-interactive){--show-full-highlight:0;--show-inset-highlight:1}:host(.item-lines-full){--border-width:0px 0px 0.55px 0px;--show-full-highlight:1;--show-inset-highlight:0}:host(.item-lines-inset){--inner-border-width:0px 0px 0.55px 0px;--show-full-highlight:0;--show-inset-highlight:1}:host(.item-lines-inset),:host(.item-lines-none){--border-width:0px;--show-full-highlight:0}:host(.item-lines-full),:host(.item-lines-none){--inner-border-width:0px;--show-inset-highlight:0}.item-highlight,.item-inner-highlight{-webkit-transition:none;transition:none}:host(.item-has-focus) .item-inner-highlight,:host(.item-has-focus) .item-highlight{border-top:none;border-right:none;border-left:none}::slotted([slot=start]){margin-left:0;margin-right:20px;margin-top:2px;margin-bottom:2px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted([slot=start]){margin-left:unset;margin-right:unset;-webkit-margin-start:0;margin-inline-start:0;-webkit-margin-end:20px;margin-inline-end:20px}}::slotted([slot=end]){margin-left:10px;margin-right:10px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted([slot=end]){margin-left:unset;margin-right:unset;-webkit-margin-start:10px;margin-inline-start:10px;-webkit-margin-end:10px;margin-inline-end:10px}}::slotted(ion-icon[slot=start]),::slotted(ion-icon[slot=end]){margin-top:7px;margin-bottom:7px}::slotted(ion-toggle[slot=start]),::slotted(ion-toggle[slot=end]){margin-left:0;margin-right:0;margin-top:0;margin-bottom:0}:host(.item-label-stacked) ::slotted([slot=end]),:host(.item-label-floating) ::slotted([slot=end]){margin-top:7px;margin-bottom:7px}::slotted(.button-small){--padding-top:0px;--padding-bottom:0px;--padding-start:.5em;--padding-end:.5em;height:24px;font-size:13px}::slotted(ion-avatar){width:36px;height:36px}::slotted(ion-thumbnail){width:56px;height:56px}::slotted(ion-avatar[slot=end]),::slotted(ion-thumbnail[slot=end]){margin-left:10px;margin-right:10px;margin-top:10px;margin-bottom:10px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(ion-avatar[slot=end]),::slotted(ion-thumbnail[slot=end]){margin-left:unset;margin-right:unset;-webkit-margin-start:10px;margin-inline-start:10px;-webkit-margin-end:10px;margin-inline-end:10px}}:host(.item-radio) ::slotted(ion-label),:host(.item-toggle) ::slotted(ion-label){margin-left:0px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host(.item-radio) ::slotted(ion-label),:host(.item-toggle) ::slotted(ion-label){margin-left:unset;-webkit-margin-start:0px;margin-inline-start:0px}}::slotted(ion-label){margin-left:0;margin-right:8px;margin-top:10px;margin-bottom:10px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(ion-label){margin-left:unset;margin-right:unset;-webkit-margin-start:0;margin-inline-start:0;-webkit-margin-end:8px;margin-inline-end:8px}}:host(.item-label-floating),:host(.item-label-stacked){--min-height:68px}:host(.item-label-stacked) ::slotted(ion-select),:host(.item-label-floating) ::slotted(ion-select){--padding-top:8px;--padding-bottom:8px;--padding-start:0px}:host(.item-label-fixed) ::slotted(ion-select),:host(.item-label-fixed) ::slotted(ion-datetime){--padding-start:0}';
const itemMdCss = ':host{--border-radius:0px;--border-width:0px;--border-style:solid;--padding-top:0px;--padding-bottom:0px;--padding-end:0px;--padding-start:0px;--inner-border-width:0px;--inner-padding-top:0px;--inner-padding-bottom:0px;--inner-padding-start:0px;--inner-padding-end:0px;--inner-box-shadow:none;--show-full-highlight:0;--show-inset-highlight:0;--detail-icon-color:initial;--detail-icon-font-size:20px;--detail-icon-opacity:0.25;--color-activated:var(--color);--color-focused:var(--color);--color-hover:var(--color);--ripple-color:currentColor;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:block;position:relative;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;outline:none;color:var(--color);font-family:var(--ion-font-family, inherit);text-align:initial;text-decoration:none;overflow:hidden;-webkit-box-sizing:border-box;box-sizing:border-box}:host(.ion-color:not(.item-fill-solid):not(.item-fill-outline)) .item-native{background:var(--ion-color-base);color:var(--ion-color-contrast)}:host(.ion-color:not(.item-fill-solid):not(.item-fill-outline)) .item-native,:host(.ion-color:not(.item-fill-solid):not(.item-fill-outline)) .item-inner{border-color:var(--ion-color-shade)}:host(.ion-activated) .item-native{color:var(--color-activated)}:host(.ion-activated) .item-native::after{background:var(--background-activated);opacity:var(--background-activated-opacity)}:host(.ion-color.ion-activated) .item-native{color:var(--ion-color-contrast)}:host(.ion-focused) .item-native{color:var(--color-focused)}:host(.ion-focused) .item-native::after{background:var(--background-focused);opacity:var(--background-focused-opacity)}:host(.ion-color.ion-focused) .item-native{color:var(--ion-color-contrast)}:host(.ion-color.ion-focused) .item-native::after{background:var(--ion-color-contrast)}@media (any-hover: hover){:host(.ion-activatable:not(.ion-focused):hover) .item-native{color:var(--color-hover)}:host(.ion-activatable:not(.ion-focused):hover) .item-native::after{background:var(--background-hover);opacity:var(--background-hover-opacity)}:host(.ion-color.ion-activatable:not(.ion-focused):hover) .item-native{color:var(--ion-color-contrast)}:host(.ion-color.ion-activatable:not(.ion-focused):hover) .item-native::after{background:var(--ion-color-contrast)}}:host(.item-interactive-disabled:not(.item-multiple-inputs)){cursor:default;pointer-events:none}:host(.item-disabled){cursor:default;opacity:0.3;pointer-events:none}.item-native{border-radius:var(--border-radius);margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:calc(var(--padding-start) + var(--ion-safe-area-left, 0px));padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;display:-ms-flexbox;display:flex;position:relative;-ms-flex-align:inherit;align-items:inherit;-ms-flex-pack:inherit;justify-content:inherit;width:100%;min-height:var(--min-height);-webkit-transition:var(--transition);transition:var(--transition);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);outline:none;background:var(--background);overflow:inherit;-webkit-box-sizing:border-box;box-sizing:border-box;z-index:1}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.item-native{padding-left:unset;padding-right:unset;-webkit-padding-start:calc(var(--padding-start) + var(--ion-safe-area-left, 0px));padding-inline-start:calc(var(--padding-start) + var(--ion-safe-area-left, 0px));-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.item-native::-moz-focus-inner{border:0}.item-native::after{left:0;right:0;top:0;bottom:0;position:absolute;content:"";opacity:0;-webkit-transition:var(--transition);transition:var(--transition);z-index:-1}button,a{cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-user-drag:none}.item-inner{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:var(--inner-padding-start);padding-right:calc(var(--ion-safe-area-right, 0px) + var(--inner-padding-end));padding-top:var(--inner-padding-top);padding-bottom:var(--inner-padding-bottom);display:-ms-flexbox;display:flex;position:relative;-ms-flex:1;flex:1;-ms-flex-direction:inherit;flex-direction:inherit;-ms-flex-align:inherit;align-items:inherit;-ms-flex-item-align:stretch;align-self:stretch;min-height:inherit;border-width:var(--inner-border-width);border-style:var(--border-style);border-color:var(--border-color);-webkit-box-shadow:var(--inner-box-shadow);box-shadow:var(--inner-box-shadow);overflow:inherit;-webkit-box-sizing:border-box;box-sizing:border-box}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.item-inner{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--inner-padding-start);padding-inline-start:var(--inner-padding-start);-webkit-padding-end:calc(var(--ion-safe-area-right, 0px) + var(--inner-padding-end));padding-inline-end:calc(var(--ion-safe-area-right, 0px) + var(--inner-padding-end))}}.item-bottom{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:calc(var(--padding-start) + var(--ion-safe-area-left, 0px));padding-right:var(--inner-padding-end);padding-top:0;padding-bottom:0;display:-ms-flexbox;display:flex;-ms-flex-pack:justify;justify-content:space-between}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.item-bottom{padding-left:unset;padding-right:unset;-webkit-padding-start:calc(var(--padding-start) + var(--ion-safe-area-left, 0px));padding-inline-start:calc(var(--padding-start) + var(--ion-safe-area-left, 0px));-webkit-padding-end:var(--inner-padding-end);padding-inline-end:var(--inner-padding-end)}}.item-detail-icon{color:var(--detail-icon-color);font-size:var(--detail-icon-font-size);opacity:var(--detail-icon-opacity)}::slotted(ion-icon){font-size:1.6em}::slotted(ion-button){--margin-top:0;--margin-bottom:0;--margin-start:0;--margin-end:0;z-index:1}::slotted(ion-label:not([slot=end])){-ms-flex:1;flex:1}:host(.item-input){-ms-flex-align:center;align-items:center}.input-wrapper{display:-ms-flexbox;display:flex;-ms-flex:1;flex:1;-ms-flex-direction:inherit;flex-direction:inherit;-ms-flex-align:inherit;align-items:inherit;-ms-flex-item-align:stretch;align-self:stretch;text-overflow:ellipsis;overflow:inherit;-webkit-box-sizing:border-box;box-sizing:border-box}:host(.item-label-stacked),:host(.item-label-floating){-ms-flex-align:start;align-items:start}:host(.item-label-stacked) .input-wrapper,:host(.item-label-floating) .input-wrapper{-ms-flex:1;flex:1;-ms-flex-direction:column;flex-direction:column}.item-highlight,.item-inner-highlight{left:0;right:0;top:0;bottom:0;border-radius:inherit;position:absolute;width:100%;height:100%;-webkit-transform:scaleX(0);transform:scaleX(0);-webkit-transition:border-bottom-width 200ms, -webkit-transform 200ms;transition:border-bottom-width 200ms, -webkit-transform 200ms;transition:transform 200ms, border-bottom-width 200ms;transition:transform 200ms, border-bottom-width 200ms, -webkit-transform 200ms;z-index:2;-webkit-box-sizing:border-box;box-sizing:border-box;pointer-events:none}:host(.item-interactive.ion-focused),:host(.item-interactive.item-has-focus),:host(.item-interactive.ion-touched.ion-invalid){--full-highlight-height:calc(var(--highlight-height) * var(--show-full-highlight));--inset-highlight-height:calc(var(--highlight-height) * var(--show-inset-highlight))}:host(.ion-focused) .item-highlight,:host(.ion-focused) .item-inner-highlight,:host(.item-has-focus) .item-highlight,:host(.item-has-focus) .item-inner-highlight{-webkit-transform:scaleX(1);transform:scaleX(1);border-style:var(--border-style);border-color:var(--highlight-background)}:host(.ion-focused) .item-highlight,:host(.item-has-focus) .item-highlight{border-width:var(--full-highlight-height);opacity:var(--show-full-highlight)}:host(.ion-focused) .item-inner-highlight,:host(.item-has-focus) .item-inner-highlight{border-bottom-width:var(--inset-highlight-height);opacity:var(--show-inset-highlight)}:host(.ion-focused.item-fill-solid) .item-highlight,:host(.item-has-focus.item-fill-solid) .item-highlight{border-width:calc(var(--full-highlight-height) - 1px)}:host(.ion-focused) .item-inner-highlight,:host(.ion-focused:not(.item-fill-outline)) .item-highlight,:host(.item-has-focus) .item-inner-highlight,:host(.item-has-focus:not(.item-fill-outline)) .item-highlight{border-top:none;border-right:none;border-left:none}:host(.item-interactive.ion-focused),:host(.item-interactive.item-has-focus){--highlight-background:var(--highlight-color-focused)}:host(.item-interactive.ion-valid){--highlight-background:var(--highlight-color-valid)}:host(.item-interactive.ion-invalid){--highlight-background:var(--highlight-color-invalid)}:host(.item-interactive.ion-invalid) ::slotted([slot=helper]){display:none}::slotted([slot=error]){display:none;color:var(--highlight-color-invalid)}:host(.item-interactive.ion-invalid) ::slotted([slot=error]){display:block}:host(:not(.item-label)) ::slotted(ion-select){--padding-start:0;max-width:none}:host(.item-label-stacked) ::slotted(ion-select),:host(.item-label-floating) ::slotted(ion-select){--padding-top:8px;--padding-bottom:8px;--padding-start:0;-ms-flex-item-align:stretch;align-self:stretch;width:100%;max-width:100%}:host(:not(.item-label)) ::slotted(ion-datetime){--padding-start:0}:host(.item-label-stacked) ::slotted(ion-datetime),:host(.item-label-floating) ::slotted(ion-datetime){--padding-start:0;width:100%}:host(.item-multiple-inputs) ::slotted(ion-checkbox),:host(.item-multiple-inputs) ::slotted(ion-datetime),:host(.item-multiple-inputs) ::slotted(ion-radio),:host(.item-multiple-inputs) ::slotted(ion-select){position:relative}:host(.item-textarea){-ms-flex-align:stretch;align-items:stretch}::slotted(ion-reorder[slot]){margin-top:0;margin-bottom:0}ion-ripple-effect{color:var(--ripple-color)}:host(.item-fill-solid) ::slotted([slot=start]),:host(.item-fill-solid) ::slotted([slot=end]),:host(.item-fill-outline) ::slotted([slot=start]),:host(.item-fill-outline) ::slotted([slot=end]){-ms-flex-item-align:center;align-self:center}::slotted([slot=helper]),::slotted([slot=error]),.item-counter{padding-top:5px;font-size:12px;z-index:1}.item-counter{margin-left:auto;color:var(--ion-color-step-550, #737373);white-space:nowrap;-webkit-padding-start:16px;padding-inline-start:16px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.item-counter{margin-left:unset;-webkit-margin-start:auto;margin-inline-start:auto}}@media (prefers-reduced-motion: reduce){.item-highlight,.item-inner-highlight{-webkit-transition:none;transition:none}}:host{--min-height:48px;--background:var(--ion-item-background, var(--ion-background-color, #fff));--background-activated:transparent;--background-focused:currentColor;--background-hover:currentColor;--background-activated-opacity:0;--background-focused-opacity:.12;--background-hover-opacity:.04;--border-color:var(--ion-item-border-color, var(--ion-border-color, var(--ion-color-step-150, rgba(0, 0, 0, 0.13))));--color:var(--ion-item-color, var(--ion-text-color, #000));--transition:opacity 15ms linear, background-color 15ms linear;--padding-start:16px;--inner-padding-end:16px;--inner-border-width:0 0 1px 0;--highlight-height:1px;--highlight-color-focused:var(--ion-color-primary, #3880ff);--highlight-color-valid:var(--ion-color-success, #2dd36f);--highlight-color-invalid:var(--ion-color-danger, #eb445a);font-size:16px;font-weight:normal;text-transform:none}:host(.item-fill-outline){--highlight-height:2px}:host(.item-fill-none.item-interactive.ion-focus) .item-highlight,:host(.item-fill-none.item-interactive.item-has-focus) .item-highlight,:host(.item-fill-none.item-interactive.ion-touched.ion-invalid) .item-highlight{-webkit-transform:scaleX(1);transform:scaleX(1);border-width:0 0 var(--full-highlight-height) 0;border-style:var(--border-style);border-color:var(--highlight-background)}:host(.item-fill-none.item-interactive.ion-focus) .item-native,:host(.item-fill-none.item-interactive.item-has-focus) .item-native,:host(.item-fill-none.item-interactive.ion-touched.ion-invalid) .item-native{border-bottom-color:var(--highlight-background)}:host(.item-fill-outline.item-interactive.ion-focus) .item-highlight,:host(.item-fill-outline.item-interactive.item-has-focus) .item-highlight{-webkit-transform:scaleX(1);transform:scaleX(1)}:host(.item-fill-outline.item-interactive.ion-focus) .item-highlight,:host(.item-fill-outline.item-interactive.item-has-focus) .item-highlight,:host(.item-fill-outline.item-interactive.ion-touched.ion-invalid) .item-highlight{border-width:var(--full-highlight-height);border-style:var(--border-style);border-color:var(--highlight-background)}:host(.item-fill-outline.item-interactive.ion-touched.ion-invalid) .item-native{border-color:var(--highlight-background)}:host(.item-fill-solid.item-interactive.ion-focus) .item-highlight,:host(.item-fill-solid.item-interactive.item-has-focus) .item-highlight,:host(.item-fill-solid.item-interactive.ion-touched.ion-invalid) .item-highlight{-webkit-transform:scaleX(1);transform:scaleX(1);border-width:0 0 var(--full-highlight-height) 0;border-style:var(--border-style);border-color:var(--highlight-background)}:host(.item-fill-solid.item-interactive.ion-focus) .item-native,:host(.item-fill-solid.item-interactive.item-has-focus) .item-native,:host(.item-fill-solid.item-interactive.ion-touched.ion-invalid) .item-native{border-bottom-color:var(--highlight-background)}:host(.ion-color.ion-activated) .item-native::after{background:transparent}:host(.item-has-focus) .item-native{caret-color:var(--highlight-background)}:host(.item-interactive){--border-width:0 0 1px 0;--inner-border-width:0;--show-full-highlight:1;--show-inset-highlight:0}:host(.item-lines-full){--border-width:0 0 1px 0;--show-full-highlight:1;--show-inset-highlight:0}:host(.item-lines-inset){--inner-border-width:0 0 1px 0;--show-full-highlight:0;--show-inset-highlight:1}:host(.item-lines-inset),:host(.item-lines-none){--border-width:0;--show-full-highlight:0}:host(.item-lines-full),:host(.item-lines-none){--inner-border-width:0;--show-inset-highlight:0}:host(.item-fill-outline) .item-highlight{--position-offset:calc(-1 * var(--border-width));left:var(--position-offset);top:var(--position-offset);width:calc(100% + 2 * var(--border-width));height:calc(100% + 2 * var(--border-width));-webkit-transition:none;transition:none}:host-context([dir=rtl]):host(.item-fill-outline) .item-highlight,:host-context([dir=rtl]).item-fill-outline .item-highlight{left:unset;right:unset;right:var(--position-offset)}:host(.item-fill-outline.ion-focused) .item-native,:host(.item-fill-outline.item-has-focus) .item-native{border-color:transparent}:host(.item-multi-line) ::slotted([slot=start]),:host(.item-multi-line) ::slotted([slot=end]){margin-top:16px;margin-bottom:16px;-ms-flex-item-align:start;align-self:flex-start}::slotted([slot=start]){margin-right:32px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted([slot=start]){margin-right:unset;-webkit-margin-end:32px;margin-inline-end:32px}}::slotted([slot=end]){margin-left:32px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted([slot=end]){margin-left:unset;-webkit-margin-start:32px;margin-inline-start:32px}}:host(.item-fill-solid) ::slotted([slot=start]),:host(.item-fill-solid) ::slotted([slot=end]),:host(.item-fill-outline) ::slotted([slot=start]),:host(.item-fill-outline) ::slotted([slot=end]){-ms-flex-item-align:center;align-self:center}::slotted(ion-icon){color:rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.54);font-size:24px}:host(.ion-color:not(.item-fill-solid):not(.item-fill-outline)) ::slotted(ion-icon){color:var(--ion-color-contrast)}::slotted(ion-icon[slot]){margin-top:12px;margin-bottom:12px}::slotted(ion-icon[slot=start]){margin-right:32px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(ion-icon[slot=start]){margin-right:unset;-webkit-margin-end:32px;margin-inline-end:32px}}::slotted(ion-icon[slot=end]){margin-left:16px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(ion-icon[slot=end]){margin-left:unset;-webkit-margin-start:16px;margin-inline-start:16px}}:host(.item-fill-solid) ::slotted(ion-icon[slot=start]),:host(.item-fill-outline) ::slotted(ion-icon[slot=start]){margin-right:8px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host(.item-fill-solid) ::slotted(ion-icon[slot=start]),:host(.item-fill-outline) ::slotted(ion-icon[slot=start]){margin-right:unset;-webkit-margin-end:8px;margin-inline-end:8px}}::slotted(ion-toggle[slot=start]),::slotted(ion-toggle[slot=end]){margin-left:0;margin-right:0;margin-top:0;margin-bottom:0}::slotted(ion-note){margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;-ms-flex-item-align:start;align-self:flex-start;font-size:11px}::slotted(ion-note[slot]:not([slot=helper]):not([slot=error])){padding-left:0;padding-right:0;padding-top:18px;padding-bottom:10px}::slotted(ion-note[slot=start]){padding-right:16px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(ion-note[slot=start]){padding-right:unset;-webkit-padding-end:16px;padding-inline-end:16px}}::slotted(ion-note[slot=end]){padding-left:16px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(ion-note[slot=end]){padding-left:unset;-webkit-padding-start:16px;padding-inline-start:16px}}::slotted(ion-avatar){width:40px;height:40px}::slotted(ion-thumbnail){width:56px;height:56px}::slotted(ion-avatar),::slotted(ion-thumbnail){margin-top:8px;margin-bottom:8px}::slotted(ion-avatar[slot=start]),::slotted(ion-thumbnail[slot=start]){margin-right:16px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(ion-avatar[slot=start]),::slotted(ion-thumbnail[slot=start]){margin-right:unset;-webkit-margin-end:16px;margin-inline-end:16px}}::slotted(ion-avatar[slot=end]),::slotted(ion-thumbnail[slot=end]){margin-left:16px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(ion-avatar[slot=end]),::slotted(ion-thumbnail[slot=end]){margin-left:unset;-webkit-margin-start:16px;margin-inline-start:16px}}::slotted(ion-label){margin-left:0;margin-right:0;margin-top:10px;margin-bottom:10px}:host(.item-label-stacked) ::slotted([slot=end]),:host(.item-label-floating) ::slotted([slot=end]){margin-top:7px;margin-bottom:7px}:host(.item-label-fixed) ::slotted(ion-select),:host(.item-label-fixed) ::slotted(ion-datetime){--padding-start:8px}:host(.item-toggle) ::slotted(ion-label),:host(.item-radio) ::slotted(ion-label){margin-left:0}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host(.item-toggle) ::slotted(ion-label),:host(.item-radio) ::slotted(ion-label){margin-left:unset;-webkit-margin-start:0;margin-inline-start:0}}::slotted(.button-small){--padding-top:0;--padding-bottom:0;--padding-start:.6em;--padding-end:.6em;height:25px;font-size:12px}:host(.item-label-floating),:host(.item-label-stacked){--min-height:55px}:host(.item-label-stacked) ::slotted(ion-select),:host(.item-label-floating) ::slotted(ion-select){--padding-top:8px;--padding-bottom:8px;--padding-start:0}:host(.ion-focused:not(.ion-color)) ::slotted(.label-stacked),:host(.ion-focused:not(.ion-color)) ::slotted(.label-floating),:host(.item-has-focus:not(.ion-color)) ::slotted(.label-stacked),:host(.item-has-focus:not(.ion-color)) ::slotted(.label-floating){color:var(--ion-color-primary, #3880ff)}:host(.ion-color){--highlight-color-focused:var(--ion-color-contrast)}:host(.item-label-color){--highlight-color-focused:var(--ion-color-base)}:host(.item-fill-solid.ion-color),:host(.item-fill-outline.ion-color){--highlight-color-focused:var(--ion-color-base)}:host(.item-fill-solid){--background:var(--ion-color-step-50, #f2f2f2);--background-hover:var(--ion-color-step-100, #e6e6e6);--background-focused:var(--ion-color-step-150, #d9d9d9);--border-width:0 0 1px 0;--inner-border-width:0;border-top-left-radius:4px;border-top-right-radius:4px;border-bottom-right-radius:0;border-bottom-left-radius:0}:host-context([dir=rtl]):host(.item-fill-solid),:host-context([dir=rtl]).item-fill-solid{border-top-left-radius:4px;border-top-right-radius:4px;border-bottom-right-radius:0;border-bottom-left-radius:0}:host(.item-fill-solid) .item-native{--border-color:var(--ion-color-step-500, gray)}:host(.item-fill-solid.ion-focused) .item-native,:host(.item-fill-solid.item-has-focus) .item-native{--background:var(--background-focused)}:host(.item-fill-solid.item-shape-round){border-top-left-radius:16px;border-top-right-radius:16px;border-bottom-right-radius:0;border-bottom-left-radius:0}:host-context([dir=rtl]):host(.item-fill-solid.item-shape-round),:host-context([dir=rtl]).item-fill-solid.item-shape-round{border-top-left-radius:16px;border-top-right-radius:16px;border-bottom-right-radius:0;border-bottom-left-radius:0}@media (any-hover: hover){:host(.item-fill-solid:hover) .item-native{--background:var(--background-hover);--border-color:var(--ion-color-step-750, #404040)}}:host(.item-fill-outline){--ripple-color:transparent;--background-focused:transparent;--background-hover:transparent;--border-color:var(--ion-color-step-500, gray);--border-width:1px;border:none;overflow:visible}:host(.item-fill-outline) .item-native{--native-padding-left:16px;border-radius:4px}:host(.item-fill-outline.item-shape-round) .item-native{--inner-padding-start:16px;border-radius:28px}:host(.item-fill-outline.item-shape-round) .item-bottom{padding-left:32px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host(.item-fill-outline.item-shape-round) .item-bottom{padding-left:unset;-webkit-padding-start:32px;padding-inline-start:32px}}:host(.item-fill-outline.item-label-floating.ion-focused) .item-native ::slotted(ion-input:not(:first-child)),:host(.item-fill-outline.item-label-floating.ion-focused) .item-native ::slotted(ion-textarea:not(:first-child)),:host(.item-fill-outline.item-label-floating.item-has-focus) .item-native ::slotted(ion-input:not(:first-child)),:host(.item-fill-outline.item-label-floating.item-has-focus) .item-native ::slotted(ion-textarea:not(:first-child)),:host(.item-fill-outline.item-label-floating.item-has-value) .item-native ::slotted(ion-input:not(:first-child)),:host(.item-fill-outline.item-label-floating.item-has-value) .item-native ::slotted(ion-textarea:not(:first-child)){-webkit-transform:translateY(-14px);transform:translateY(-14px)}@media (any-hover: hover){:host(.item-fill-outline:hover) .item-native{--border-color:var(--ion-color-step-750, #404040)}}.item-counter{letter-spacing:0.0333333333em}';
const Item = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.labelColorStyles = {};
    this.itemStyles = /* @__PURE__ */ new Map();
    this.inheritedAriaAttributes = {};
    this.multipleInputs = false;
    this.focusable = true;
    this.button = false;
    this.detailIcon = chevronForward;
    this.disabled = false;
    this.counter = false;
    this.routerDirection = "forward";
    this.type = "button";
  }
  counterFormatterChanged() {
    this.updateCounterOutput(this.getFirstInput());
  }
  handleIonChange(ev) {
    if (this.counter && ev.target === this.getFirstInput()) {
      this.updateCounterOutput(ev.target);
    }
  }
  labelColorChanged(ev) {
    const { color } = this;
    if (color === void 0) {
      this.labelColorStyles = ev.detail;
    }
  }
  itemStyle(ev) {
    ev.stopPropagation();
    const tagName = ev.target.tagName;
    const updatedStyles = ev.detail;
    const newStyles = {};
    const childStyles = this.itemStyles.get(tagName) || {};
    let hasStyleChange = false;
    Object.keys(updatedStyles).forEach((key) => {
      if (updatedStyles[key]) {
        const itemKey = `item-${key}`;
        if (!childStyles[itemKey]) {
          hasStyleChange = true;
        }
        newStyles[itemKey] = true;
      }
    });
    if (!hasStyleChange && Object.keys(newStyles).length !== Object.keys(childStyles).length) {
      hasStyleChange = true;
    }
    if (hasStyleChange) {
      this.itemStyles.set(tagName, newStyles);
      forceUpdate(this);
    }
  }
  connectedCallback() {
    if (this.counter) {
      this.updateCounterOutput(this.getFirstInput());
    }
    this.hasStartEl();
  }
  componentDidUpdate() {
    const input = this.getFirstInput();
    if (input !== void 0 && !this.clickListener) {
      this.clickListener = (ev) => this.delegateFocus(ev, input);
      this.el.addEventListener("click", this.clickListener);
    }
  }
  disconnectedCallback() {
    const input = this.getFirstInput();
    if (input !== void 0 && this.clickListener) {
      this.el.removeEventListener("click", this.clickListener);
      this.clickListener = void 0;
    }
  }
  componentDidLoad() {
    raf(() => {
      this.inheritedAriaAttributes = inheritAttributes$2(this.el, ["aria-label"]);
      this.setMultipleInputs();
      this.focusable = this.isFocusable();
    });
  }
  setMultipleInputs() {
    const covers = this.el.querySelectorAll("ion-checkbox, ion-datetime, ion-select, ion-radio");
    const inputs = this.el.querySelectorAll("ion-input, ion-range, ion-searchbar, ion-segment, ion-textarea, ion-toggle");
    const clickables = this.el.querySelectorAll("ion-anchor, ion-button, a, button");
    this.multipleInputs = covers.length + inputs.length > 1 || covers.length + clickables.length > 1 || covers.length > 0 && this.isClickable();
  }
  hasCover() {
    const inputs = this.el.querySelectorAll("ion-checkbox, ion-datetime, ion-select, ion-radio");
    return inputs.length === 1 && !this.multipleInputs;
  }
  isClickable() {
    return this.href !== void 0 || this.button;
  }
  canActivate() {
    return this.isClickable() || this.hasCover();
  }
  isFocusable() {
    const focusableChild = this.el.querySelector(".ion-focusable");
    return this.canActivate() || focusableChild !== null;
  }
  getFirstInput() {
    const inputs = this.el.querySelectorAll("ion-input, ion-textarea");
    return inputs[0];
  }
  delegateFocus(ev, input) {
    const clickedItem = ev.target.tagName === "ION-ITEM";
    let firstActive = false;
    if (document.activeElement) {
      firstActive = input.querySelector("input, textarea") === document.activeElement;
    }
    if (clickedItem && (firstActive || !this.multipleInputs)) {
      input.fireFocusEvents = false;
      input.setBlur();
      input.setFocus();
      raf(() => {
        input.fireFocusEvents = true;
      });
    }
  }
  updateCounterOutput(inputEl) {
    var _a2, _b2;
    const { counter, counterFormatter, defaultCounterFormatter } = this;
    if (counter && !this.multipleInputs && (inputEl === null || inputEl === void 0 ? void 0 : inputEl.maxlength) !== void 0) {
      const length = (_b2 = (_a2 = inputEl === null || inputEl === void 0 ? void 0 : inputEl.value) === null || _a2 === void 0 ? void 0 : _a2.toString().length) !== null && _b2 !== void 0 ? _b2 : 0;
      if (counterFormatter === void 0) {
        this.counterString = defaultCounterFormatter(length, inputEl.maxlength);
      } else {
        try {
          this.counterString = counterFormatter(length, inputEl.maxlength);
        } catch (e) {
          printIonError("Exception in provided `counterFormatter`.", e);
          this.counterString = defaultCounterFormatter(length, inputEl.maxlength);
        }
      }
    }
  }
  defaultCounterFormatter(length, maxlength) {
    return `${length} / ${maxlength}`;
  }
  hasStartEl() {
    const startEl = this.el.querySelector('[slot="start"]');
    if (startEl !== null) {
      this.el.classList.add("item-has-start-slot");
    }
  }
  render() {
    const { counterString, detail, detailIcon, download, fill, labelColorStyles, lines, disabled, href, rel, shape, target, routerAnimation, routerDirection, inheritedAriaAttributes } = this;
    const childStyles = {};
    const mode = getIonMode$2(this);
    const clickable = this.isClickable();
    const canActivate = this.canActivate();
    const TagType = clickable ? href === void 0 ? "button" : "a" : "div";
    const attrs = TagType === "button" ? { type: this.type } : {
      download,
      href,
      rel,
      target
    };
    const clickFn = clickable ? {
      onClick: (ev) => {
        openURL(href, ev, routerDirection, routerAnimation);
      }
    } : {};
    const showDetail = detail !== void 0 ? detail : mode === "ios" && clickable;
    this.itemStyles.forEach((value) => {
      Object.assign(childStyles, value);
    });
    const ariaDisabled = disabled || childStyles["item-interactive-disabled"] ? "true" : null;
    const fillValue = fill || "none";
    const inList = hostContext("ion-list", this.el);
    return h(Host, { "aria-disabled": ariaDisabled, class: Object.assign(Object.assign(Object.assign({}, childStyles), labelColorStyles), createColorClasses$1(this.color, {
      item: true,
      [mode]: true,
      [`item-lines-${lines}`]: lines !== void 0,
      [`item-fill-${fillValue}`]: true,
      [`item-shape-${shape}`]: shape !== void 0,
      "item-disabled": disabled,
      "in-list": inList,
      "item-multiple-inputs": this.multipleInputs,
      "ion-activatable": canActivate,
      "ion-focusable": this.focusable,
      "item-rtl": document.dir === "rtl"
    })), role: inList ? "listitem" : null }, h(TagType, Object.assign({}, attrs, inheritedAriaAttributes, { class: "item-native", part: "native", disabled }, clickFn), h("slot", { name: "start" }), h("div", { class: "item-inner" }, h("div", { class: "input-wrapper" }, h("slot", null)), h("slot", { name: "end" }), showDetail && h("ion-icon", { icon: detailIcon, lazy: false, class: "item-detail-icon", part: "detail-icon", "aria-hidden": "true", "flip-rtl": detailIcon === chevronForward }), h("div", { class: "item-inner-highlight" })), canActivate && mode === "md" && h("ion-ripple-effect", null), h("div", { class: "item-highlight" })), h("div", { class: "item-bottom" }, h("slot", { name: "error" }), h("slot", { name: "helper" }), counterString && h("ion-note", { class: "item-counter" }, counterString)));
  }
  static get delegatesFocus() {
    return true;
  }
  get el() {
    return this;
  }
  static get watchers() {
    return {
      "counterFormatter": ["counterFormatterChanged"]
    };
  }
  static get style() {
    return {
      ios: itemIosCss,
      md: itemMdCss
    };
  }
}, [49, "ion-item", {
  "color": [513],
  "button": [4],
  "detail": [4],
  "detailIcon": [1, "detail-icon"],
  "disabled": [4],
  "download": [1],
  "fill": [1],
  "shape": [1],
  "href": [1],
  "rel": [1],
  "lines": [1],
  "counter": [4],
  "routerAnimation": [16],
  "routerDirection": [1, "router-direction"],
  "target": [1],
  "type": [1],
  "counterFormatter": [16],
  "multipleInputs": [32],
  "focusable": [32],
  "counterString": [32]
}, [[0, "ionChange", "handleIonChange"], [0, "ionColor", "labelColorChanged"], [0, "ionStyle", "itemStyle"]]]);
function defineCustomElement$1f() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-item", "ion-icon", "ion-note", "ion-ripple-effect"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-item":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Item);
        }
        break;
      case "ion-icon":
        if (!customElements.get(tagName)) {
          defineCustomElement$1E();
        }
        break;
      case "ion-note":
        if (!customElements.get(tagName)) {
          defineCustomElement$1g();
        }
        break;
      case "ion-ripple-effect":
        if (!customElements.get(tagName)) {
          defineCustomElement$1v();
        }
        break;
    }
  });
}
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const labelIosCss = ".item.sc-ion-label-ios-h,.item .sc-ion-label-ios-h{--color:initial;display:block;color:var(--color);font-family:var(--ion-font-family, inherit);font-size:inherit;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;-webkit-box-sizing:border-box;box-sizing:border-box}.ion-color.sc-ion-label-ios-h{color:var(--ion-color-base)}.ion-text-wrap.sc-ion-label-ios-h,[text-wrap].sc-ion-label-ios-h{white-space:normal}.item-interactive-disabled.sc-ion-label-ios-h:not(.item-multiple-inputs),.item-interactive-disabled:not(.item-multiple-inputs) .sc-ion-label-ios-h{cursor:default;opacity:0.3;pointer-events:none}.item-input.sc-ion-label-ios-h,.item-input .sc-ion-label-ios-h{-ms-flex:initial;flex:initial;max-width:200px;pointer-events:none}.item-textarea.sc-ion-label-ios-h,.item-textarea .sc-ion-label-ios-h{-ms-flex-item-align:baseline;align-self:baseline}.label-fixed.sc-ion-label-ios-h{-ms-flex:0 0 100px;flex:0 0 100px;width:100px;min-width:100px;max-width:200px}.label-stacked.sc-ion-label-ios-h,.label-floating.sc-ion-label-ios-h{margin-bottom:0;-ms-flex-item-align:stretch;align-self:stretch;width:auto;max-width:100%}.label-no-animate.label-floating.sc-ion-label-ios-h{-webkit-transition:none;transition:none}.sc-ion-label-ios-s h1,.sc-ion-label-ios-s h2,.sc-ion-label-ios-s h3,.sc-ion-label-ios-s h4,.sc-ion-label-ios-s h5,.sc-ion-label-ios-s h6{text-overflow:inherit;overflow:inherit}.ion-text-wrap.sc-ion-label-ios-h,[text-wrap].sc-ion-label-ios-h{font-size:14px;line-height:1.5}.label-stacked.sc-ion-label-ios-h{margin-bottom:4px;font-size:14px}.label-floating.sc-ion-label-ios-h{margin-bottom:0;-webkit-transform:translate(0, 29px);transform:translate(0, 29px);-webkit-transform-origin:left top;transform-origin:left top;-webkit-transition:-webkit-transform 150ms ease-in-out;transition:-webkit-transform 150ms ease-in-out;transition:transform 150ms ease-in-out;transition:transform 150ms ease-in-out, -webkit-transform 150ms ease-in-out}[dir=rtl].sc-ion-label-ios-h -no-combinator.label-floating.sc-ion-label-ios-h,[dir=rtl] .sc-ion-label-ios-h -no-combinator.label-floating.sc-ion-label-ios-h,[dir=rtl].label-floating.sc-ion-label-ios-h,[dir=rtl] .label-floating.sc-ion-label-ios-h{-webkit-transform-origin:right top;transform-origin:right top}.item-textarea.label-floating.sc-ion-label-ios-h,.item-textarea .label-floating.sc-ion-label-ios-h{-webkit-transform:translate(0, 28px);transform:translate(0, 28px)}.item-has-focus.label-floating.sc-ion-label-ios-h,.item-has-focus .label-floating.sc-ion-label-ios-h,.item-has-placeholder.sc-ion-label-ios-h:not(.item-input).label-floating,.item-has-placeholder:not(.item-input) .label-floating.sc-ion-label-ios-h,.item-has-value.label-floating.sc-ion-label-ios-h,.item-has-value .label-floating.sc-ion-label-ios-h{-webkit-transform:scale(0.82);transform:scale(0.82)}.sc-ion-label-ios-s h1{margin-left:0;margin-right:0;margin-top:3px;margin-bottom:2px;font-size:22px;font-weight:normal}.sc-ion-label-ios-s h2{margin-left:0;margin-right:0;margin-top:0;margin-bottom:2px;font-size:17px;font-weight:normal}.sc-ion-label-ios-s h3,.sc-ion-label-ios-s h4,.sc-ion-label-ios-s h5,.sc-ion-label-ios-s h6{margin-left:0;margin-right:0;margin-top:0;margin-bottom:3px;font-size:14px;font-weight:normal;line-height:normal}.sc-ion-label-ios-s p{margin-left:0;margin-right:0;margin-top:0;margin-bottom:2px;font-size:14px;line-height:normal;text-overflow:inherit;overflow:inherit}.sc-ion-label-ios-s>p{color:rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.4)}.sc-ion-label-ios-h.in-item-color.sc-ion-label-ios-s>p{color:inherit}.sc-ion-label-ios-s h2:last-child,.sc-ion-label-ios-s h3:last-child,.sc-ion-label-ios-s h4:last-child,.sc-ion-label-ios-s h5:last-child,.sc-ion-label-ios-s h6:last-child,.sc-ion-label-ios-s p:last-child{margin-bottom:0}";
const labelMdCss = '.item.sc-ion-label-md-h,.item .sc-ion-label-md-h{--color:initial;display:block;color:var(--color);font-family:var(--ion-font-family, inherit);font-size:inherit;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;-webkit-box-sizing:border-box;box-sizing:border-box}.ion-color.sc-ion-label-md-h{color:var(--ion-color-base)}.ion-text-wrap.sc-ion-label-md-h,[text-wrap].sc-ion-label-md-h{white-space:normal}.item-interactive-disabled.sc-ion-label-md-h:not(.item-multiple-inputs),.item-interactive-disabled:not(.item-multiple-inputs) .sc-ion-label-md-h{cursor:default;opacity:0.3;pointer-events:none}.item-input.sc-ion-label-md-h,.item-input .sc-ion-label-md-h{-ms-flex:initial;flex:initial;max-width:200px;pointer-events:none}.item-textarea.sc-ion-label-md-h,.item-textarea .sc-ion-label-md-h{-ms-flex-item-align:baseline;align-self:baseline}.label-fixed.sc-ion-label-md-h{-ms-flex:0 0 100px;flex:0 0 100px;width:100px;min-width:100px;max-width:200px}.label-stacked.sc-ion-label-md-h,.label-floating.sc-ion-label-md-h{margin-bottom:0;-ms-flex-item-align:stretch;align-self:stretch;width:auto;max-width:100%}.label-no-animate.label-floating.sc-ion-label-md-h{-webkit-transition:none;transition:none}.sc-ion-label-md-s h1,.sc-ion-label-md-s h2,.sc-ion-label-md-s h3,.sc-ion-label-md-s h4,.sc-ion-label-md-s h5,.sc-ion-label-md-s h6{text-overflow:inherit;overflow:inherit}.ion-text-wrap.sc-ion-label-md-h,[text-wrap].sc-ion-label-md-h{line-height:1.5}.label-stacked.sc-ion-label-md-h,.label-floating.sc-ion-label-md-h{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;-webkit-transform-origin:top left;transform-origin:top left}.label-stacked.label-rtl.sc-ion-label-md-h,.label-floating.label-rtl.sc-ion-label-md-h{-webkit-transform-origin:top right;transform-origin:top right}.label-stacked.sc-ion-label-md-h{-webkit-transform:translateY(50%) scale(0.75);transform:translateY(50%) scale(0.75);-webkit-transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1);transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1)}.label-floating.sc-ion-label-md-h{-webkit-transform:translateY(96%);transform:translateY(96%);-webkit-transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), -webkit-transform 150ms cubic-bezier(0.4, 0, 0.2, 1);transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), -webkit-transform 150ms cubic-bezier(0.4, 0, 0.2, 1);transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1);transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1), -webkit-transform 150ms cubic-bezier(0.4, 0, 0.2, 1)}.ion-focused.label-floating.sc-ion-label-md-h,.ion-focused .label-floating.sc-ion-label-md-h,.item-has-focus.label-floating.sc-ion-label-md-h,.item-has-focus .label-floating.sc-ion-label-md-h,.item-has-placeholder.sc-ion-label-md-h:not(.item-input).label-floating,.item-has-placeholder:not(.item-input) .label-floating.sc-ion-label-md-h,.item-has-value.label-floating.sc-ion-label-md-h,.item-has-value .label-floating.sc-ion-label-md-h{-webkit-transform:translateY(50%) scale(0.75);transform:translateY(50%) scale(0.75)}.item-fill-outline.ion-focused.label-floating.sc-ion-label-md-h,.item-fill-outline.ion-focused .label-floating.sc-ion-label-md-h,.item-fill-outline.item-has-focus.label-floating.sc-ion-label-md-h,.item-fill-outline.item-has-focus .label-floating.sc-ion-label-md-h,.item-fill-outline.item-has-placeholder.sc-ion-label-md-h:not(.item-input).label-floating,.item-fill-outline.item-has-placeholder:not(.item-input) .label-floating.sc-ion-label-md-h,.item-fill-outline.item-has-value.label-floating.sc-ion-label-md-h,.item-fill-outline.item-has-value .label-floating.sc-ion-label-md-h{-webkit-transform:translateY(-6px) scale(0.75);transform:translateY(-6px) scale(0.75);position:relative;max-width:-webkit-min-content;max-width:-moz-min-content;max-width:min-content;background-color:var(--ion-item-background, var(--ion-background-color, #fff));overflow:visible;z-index:3}.item-fill-outline.ion-focused.label-floating.sc-ion-label-md-h::before,.item-fill-outline.ion-focused .label-floating.sc-ion-label-md-h::before,.item-fill-outline.ion-focused.label-floating.sc-ion-label-md-h::after,.item-fill-outline.ion-focused .label-floating.sc-ion-label-md-h::after,.item-fill-outline.item-has-focus.label-floating.sc-ion-label-md-h::before,.item-fill-outline.item-has-focus .label-floating.sc-ion-label-md-h::before,.item-fill-outline.item-has-focus.label-floating.sc-ion-label-md-h::after,.item-fill-outline.item-has-focus .label-floating.sc-ion-label-md-h::after,.item-fill-outline.item-has-placeholder.sc-ion-label-md-h:not(.item-input).label-floating::before,.item-fill-outline.item-has-placeholder:not(.item-input) .label-floating.sc-ion-label-md-h::before,.item-fill-outline.item-has-placeholder.sc-ion-label-md-h:not(.item-input).label-floating::after,.item-fill-outline.item-has-placeholder:not(.item-input) .label-floating.sc-ion-label-md-h::after,.item-fill-outline.item-has-value.label-floating.sc-ion-label-md-h::before,.item-fill-outline.item-has-value .label-floating.sc-ion-label-md-h::before,.item-fill-outline.item-has-value.label-floating.sc-ion-label-md-h::after,.item-fill-outline.item-has-value .label-floating.sc-ion-label-md-h::after{position:absolute;width:4px;height:100%;background-color:var(--ion-item-background, var(--ion-background-color, #fff));content:""}.item-fill-outline.ion-focused.label-floating.sc-ion-label-md-h::before,.item-fill-outline.ion-focused .label-floating.sc-ion-label-md-h::before,.item-fill-outline.item-has-focus.label-floating.sc-ion-label-md-h::before,.item-fill-outline.item-has-focus .label-floating.sc-ion-label-md-h::before,.item-fill-outline.item-has-placeholder.sc-ion-label-md-h:not(.item-input).label-floating::before,.item-fill-outline.item-has-placeholder:not(.item-input) .label-floating.sc-ion-label-md-h::before,.item-fill-outline.item-has-value.label-floating.sc-ion-label-md-h::before,.item-fill-outline.item-has-value .label-floating.sc-ion-label-md-h::before{left:calc(-1 * 4px)}.item-fill-outline.ion-focused.label-floating.sc-ion-label-md-h::after,.item-fill-outline.ion-focused .label-floating.sc-ion-label-md-h::after,.item-fill-outline.item-has-focus.label-floating.sc-ion-label-md-h::after,.item-fill-outline.item-has-focus .label-floating.sc-ion-label-md-h::after,.item-fill-outline.item-has-placeholder.sc-ion-label-md-h:not(.item-input).label-floating::after,.item-fill-outline.item-has-placeholder:not(.item-input) .label-floating.sc-ion-label-md-h::after,.item-fill-outline.item-has-value.label-floating.sc-ion-label-md-h::after,.item-fill-outline.item-has-value .label-floating.sc-ion-label-md-h::after{right:calc(-1 * 4px)}.item-fill-outline.ion-focused.item-has-start-slot.label-floating.sc-ion-label-md-h,.item-fill-outline.ion-focused.item-has-start-slot .label-floating.sc-ion-label-md-h,.item-fill-outline.item-has-focus.item-has-start-slot.label-floating.sc-ion-label-md-h,.item-fill-outline.item-has-focus.item-has-start-slot .label-floating.sc-ion-label-md-h,.item-fill-outline.item-has-placeholder.sc-ion-label-md-h:not(.item-input).item-has-start-slot.label-floating,.item-fill-outline.item-has-placeholder:not(.item-input).item-has-start-slot .label-floating.sc-ion-label-md-h,.item-fill-outline.item-has-value.item-has-start-slot.label-floating.sc-ion-label-md-h,.item-fill-outline.item-has-value.item-has-start-slot .label-floating.sc-ion-label-md-h{-webkit-transform:translateX(-32px) translateY(-6px) scale(0.75);transform:translateX(-32px) translateY(-6px) scale(0.75)}.item-fill-outline.ion-focused.item-has-start-slot.label-floating.label-rtl.sc-ion-label-md-h,.item-fill-outline.ion-focused.item-has-start-slot .label-floating.label-rtl.sc-ion-label-md-h,.item-fill-outline.item-has-focus.item-has-start-slot.label-floating.label-rtl.sc-ion-label-md-h,.item-fill-outline.item-has-focus.item-has-start-slot .label-floating.label-rtl.sc-ion-label-md-h,.item-fill-outline.item-has-placeholder.sc-ion-label-md-h:not(.item-input).item-has-start-slot.label-floating.label-rtl,.item-fill-outline.item-has-placeholder:not(.item-input).item-has-start-slot .label-floating.label-rtl.sc-ion-label-md-h,.item-fill-outline.item-has-value.item-has-start-slot.label-floating.label-rtl.sc-ion-label-md-h,.item-fill-outline.item-has-value.item-has-start-slot .label-floating.label-rtl.sc-ion-label-md-h{-webkit-transform:translateX(calc(-1 * -32px)) translateY(-6px) scale(0.75);transform:translateX(calc(-1 * -32px)) translateY(-6px) scale(0.75)}.ion-focused.label-stacked.sc-ion-label-md-h:not(.ion-color),.ion-focused .label-stacked.sc-ion-label-md-h:not(.ion-color),.ion-focused.label-floating.sc-ion-label-md-h:not(.ion-color),.ion-focused .label-floating.sc-ion-label-md-h:not(.ion-color),.item-has-focus.label-stacked.sc-ion-label-md-h:not(.ion-color),.item-has-focus .label-stacked.sc-ion-label-md-h:not(.ion-color),.item-has-focus.label-floating.sc-ion-label-md-h:not(.ion-color),.item-has-focus .label-floating.sc-ion-label-md-h:not(.ion-color){color:var(--ion-color-primary, #3880ff)}.ion-focused.ion-color.label-stacked.sc-ion-label-md-h:not(.ion-color),.ion-focused.ion-color .label-stacked.sc-ion-label-md-h:not(.ion-color),.ion-focused.ion-color.label-floating.sc-ion-label-md-h:not(.ion-color),.ion-focused.ion-color .label-floating.sc-ion-label-md-h:not(.ion-color),.item-has-focus.ion-color.label-stacked.sc-ion-label-md-h:not(.ion-color),.item-has-focus.ion-color .label-stacked.sc-ion-label-md-h:not(.ion-color),.item-has-focus.ion-color.label-floating.sc-ion-label-md-h:not(.ion-color),.item-has-focus.ion-color .label-floating.sc-ion-label-md-h:not(.ion-color){color:var(--ion-color-contrast)}.item-fill-solid.ion-focused.ion-color.label-stacked.sc-ion-label-md-h:not(.ion-color),.item-fill-solid.ion-focused.ion-color .label-stacked.sc-ion-label-md-h:not(.ion-color),.item-fill-solid.ion-focused.ion-color.label-floating.sc-ion-label-md-h:not(.ion-color),.item-fill-solid.ion-focused.ion-color .label-floating.sc-ion-label-md-h:not(.ion-color),.item-fill-outline.ion-focused.ion-color.label-stacked.sc-ion-label-md-h:not(.ion-color),.item-fill-outline.ion-focused.ion-color .label-stacked.sc-ion-label-md-h:not(.ion-color),.item-fill-outline.ion-focused.ion-color.label-floating.sc-ion-label-md-h:not(.ion-color),.item-fill-outline.ion-focused.ion-color .label-floating.sc-ion-label-md-h:not(.ion-color),.item-fill-solid.item-has-focus.ion-color.label-stacked.sc-ion-label-md-h:not(.ion-color),.item-fill-solid.item-has-focus.ion-color .label-stacked.sc-ion-label-md-h:not(.ion-color),.item-fill-solid.item-has-focus.ion-color.label-floating.sc-ion-label-md-h:not(.ion-color),.item-fill-solid.item-has-focus.ion-color .label-floating.sc-ion-label-md-h:not(.ion-color),.item-fill-outline.item-has-focus.ion-color.label-stacked.sc-ion-label-md-h:not(.ion-color),.item-fill-outline.item-has-focus.ion-color .label-stacked.sc-ion-label-md-h:not(.ion-color),.item-fill-outline.item-has-focus.ion-color.label-floating.sc-ion-label-md-h:not(.ion-color),.item-fill-outline.item-has-focus.ion-color .label-floating.sc-ion-label-md-h:not(.ion-color){color:var(--ion-color-base)}.ion-invalid.ion-touched.label-stacked.sc-ion-label-md-h:not(.ion-color),.ion-invalid.ion-touched .label-stacked.sc-ion-label-md-h:not(.ion-color),.ion-invalid.ion-touched.label-floating.sc-ion-label-md-h:not(.ion-color),.ion-invalid.ion-touched .label-floating.sc-ion-label-md-h:not(.ion-color){color:var(--highlight-color-invalid)}.sc-ion-label-md-s h1{margin-left:0;margin-right:0;margin-top:0;margin-bottom:2px;font-size:24px;font-weight:normal}.sc-ion-label-md-s h2{margin-left:0;margin-right:0;margin-top:2px;margin-bottom:2px;font-size:16px;font-weight:normal}.sc-ion-label-md-s h3,.sc-ion-label-md-s h4,.sc-ion-label-md-s h5,.sc-ion-label-md-s h6{margin-left:0;margin-right:0;margin-top:2px;margin-bottom:2px;font-size:14px;font-weight:normal;line-height:normal}.sc-ion-label-md-s p{margin-left:0;margin-right:0;margin-top:0;margin-bottom:2px;font-size:14px;line-height:20px;text-overflow:inherit;overflow:inherit}.sc-ion-label-md-s>p{color:var(--ion-color-step-600, #666666)}.sc-ion-label-md-h.in-item-color.sc-ion-label-md-s>p{color:inherit}';
const Label = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.ionColor = createEvent(this, "ionColor", 7);
    this.ionStyle = createEvent(this, "ionStyle", 7);
    this.inRange = false;
    this.noAnimate = false;
  }
  componentWillLoad() {
    this.inRange = !!this.el.closest("ion-range");
    this.noAnimate = this.position === "floating";
    this.emitStyle();
    this.emitColor();
  }
  componentDidLoad() {
    if (this.noAnimate) {
      setTimeout(() => {
        this.noAnimate = false;
      }, 1e3);
    }
  }
  colorChanged() {
    this.emitColor();
  }
  positionChanged() {
    this.emitStyle();
  }
  emitColor() {
    const { color } = this;
    this.ionColor.emit({
      "item-label-color": color !== void 0,
      [`ion-color-${color}`]: color !== void 0
    });
  }
  emitStyle() {
    const { inRange, position } = this;
    if (!inRange) {
      this.ionStyle.emit({
        label: true,
        [`label-${position}`]: position !== void 0
      });
    }
  }
  render() {
    const position = this.position;
    const mode = getIonMode$2(this);
    return h(Host, { class: createColorClasses$1(this.color, {
      [mode]: true,
      "in-item-color": hostContext("ion-item.ion-color", this.el),
      [`label-${position}`]: position !== void 0,
      [`label-no-animate`]: this.noAnimate,
      "label-rtl": document.dir === "rtl"
    }) });
  }
  get el() {
    return this;
  }
  static get watchers() {
    return {
      "color": ["colorChanged"],
      "position": ["positionChanged"]
    };
  }
  static get style() {
    return {
      ios: labelIosCss,
      md: labelMdCss
    };
  }
}, [34, "ion-label", {
  "color": [513],
  "position": [1],
  "noAnimate": [32]
}]);
function defineCustomElement$1e() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-label"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-label":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Label);
        }
        break;
    }
  });
}
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const HapticEngine = {
  getEngine() {
    var _a2;
    const win2 = window;
    return win2.TapticEngine || ((_a2 = win2.Capacitor) === null || _a2 === void 0 ? void 0 : _a2.isPluginAvailable("Haptics")) && win2.Capacitor.Plugins.Haptics;
  },
  available() {
    var _a2;
    const win2 = window;
    const engine = this.getEngine();
    if (!engine) {
      return false;
    }
    if (((_a2 = win2.Capacitor) === null || _a2 === void 0 ? void 0 : _a2.getPlatform()) === "web") {
      return false;
    }
    return true;
  },
  isCordova() {
    return !!window.TapticEngine;
  },
  isCapacitor() {
    const win2 = window;
    return !!win2.Capacitor;
  },
  impact(options) {
    const engine = this.getEngine();
    if (!engine) {
      return;
    }
    const style = this.isCapacitor() ? options.style.toUpperCase() : options.style;
    engine.impact({ style });
  },
  notification(options) {
    const engine = this.getEngine();
    if (!engine) {
      return;
    }
    const style = this.isCapacitor() ? options.style.toUpperCase() : options.style;
    engine.notification({ style });
  },
  selection() {
    this.impact({ style: "light" });
  },
  selectionStart() {
    const engine = this.getEngine();
    if (!engine) {
      return;
    }
    if (this.isCapacitor()) {
      engine.selectionStart();
    } else {
      engine.gestureSelectionStart();
    }
  },
  selectionChanged() {
    const engine = this.getEngine();
    if (!engine) {
      return;
    }
    if (this.isCapacitor()) {
      engine.selectionChanged();
    } else {
      engine.gestureSelectionChanged();
    }
  },
  selectionEnd() {
    const engine = this.getEngine();
    if (!engine) {
      return;
    }
    if (this.isCapacitor()) {
      engine.selectionEnd();
    } else {
      engine.gestureSelectionEnd();
    }
  }
};
const hapticAvailable = () => {
  return HapticEngine.available();
};
const hapticSelectionEnd = () => {
  hapticAvailable() && HapticEngine.selectionEnd();
};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const attachComponent = async (delegate, container, component, cssClasses, componentProps, inline) => {
  var _a2;
  if (delegate) {
    return delegate.attachViewToDom(container, component, componentProps, cssClasses);
  }
  if (!inline && typeof component !== "string" && !(component instanceof HTMLElement)) {
    throw new Error("framework delegate is missing");
  }
  const el = typeof component === "string" ? (_a2 = container.ownerDocument) === null || _a2 === void 0 ? void 0 : _a2.createElement(component) : component;
  if (cssClasses) {
    cssClasses.forEach((c) => el.classList.add(c));
  }
  if (componentProps) {
    Object.assign(el, componentProps);
  }
  container.appendChild(el);
  await new Promise((resolve) => componentOnReady(el, resolve));
  return el;
};
const detachComponent = (delegate, element) => {
  if (element) {
    if (delegate) {
      const container = element.parentElement;
      return delegate.removeViewFromDom(container, element);
    }
    element.remove();
  }
  return Promise.resolve();
};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
let lastId = 0;
const activeAnimations = /* @__PURE__ */ new WeakMap();
const createController$1 = (tagName) => {
  return {
    create(options) {
      return createOverlay();
    },
    dismiss(data, role, id) {
      return dismissOverlay(document, data, role, tagName, id);
    },
    async getTop() {
      return getOverlay(document, tagName);
    }
  };
};
const actionSheetController$1 = /* @__PURE__ */ createController$1("ion-action-sheet");
const prepareOverlay = (el) => {
  const overlayIndex = lastId++;
  el.overlayIndex = overlayIndex;
  if (!el.hasAttribute("id")) {
    el.id = `ion-overlay-${overlayIndex}`;
  }
};
const createOverlay = (tagName, opts) => {
  return Promise.resolve();
};
const focusableQueryString$1 = '[tabindex]:not([tabindex^="-"]):not([hidden]):not([disabled]), input:not([type=hidden]):not([tabindex^="-"]):not([hidden]):not([disabled]), textarea:not([tabindex^="-"]):not([hidden]):not([disabled]), button:not([tabindex^="-"]):not([hidden]):not([disabled]), select:not([tabindex^="-"]):not([hidden]):not([disabled]), .ion-focusable:not([tabindex^="-"]):not([hidden]):not([disabled]), .ion-focusable[disabled="false"]:not([tabindex^="-"]):not([hidden])';
const isOverlayHidden = (overlay) => overlay.classList.contains("overlay-hidden");
const dismissOverlay = (doc2, data, role, overlayTag, id) => {
  const overlay = getOverlay(doc2, overlayTag, id);
  if (!overlay) {
    return Promise.reject("overlay does not exist");
  }
  return overlay.dismiss(data, role);
};
const getOverlays = (doc2, selector) => {
  if (selector === void 0) {
    selector = "ion-alert,ion-action-sheet,ion-loading,ion-modal,ion-picker,ion-popover,ion-toast";
  }
  return Array.from(doc2.querySelectorAll(selector)).filter((c) => c.overlayIndex > 0);
};
const getOverlay = (doc2, overlayTag, id) => {
  const overlays = getOverlays(doc2, overlayTag).filter((o) => !isOverlayHidden(o));
  return id === void 0 ? overlays[overlays.length - 1] : overlays.find((o) => o.id === id);
};
const setRootAriaHidden = (hidden = false) => {
  const root = getAppRoot(document);
  const viewContainer = root.querySelector("ion-router-outlet, ion-nav, #ion-view-container-root");
  if (!viewContainer) {
    return;
  }
  if (hidden) {
    viewContainer.setAttribute("aria-hidden", "true");
  } else {
    viewContainer.removeAttribute("aria-hidden");
  }
};
const present = async (overlay, name, iosEnterAnimation2, mdEnterAnimation2, opts) => {
  var _a2, _b2;
  if (overlay.presented) {
    return;
  }
  setRootAriaHidden(true);
  overlay.presented = true;
  overlay.willPresent.emit();
  (_a2 = overlay.willPresentShorthand) === null || _a2 === void 0 ? void 0 : _a2.emit();
  const mode = getIonMode$2(overlay);
  const animationBuilder = overlay.enterAnimation ? overlay.enterAnimation : config.get(name, mode === "ios" ? iosEnterAnimation2 : mdEnterAnimation2);
  const completed = await overlayAnimation(overlay, animationBuilder, overlay.el, opts);
  if (completed) {
    overlay.didPresent.emit();
    (_b2 = overlay.didPresentShorthand) === null || _b2 === void 0 ? void 0 : _b2.emit();
  }
  if (overlay.el.tagName !== "ION-TOAST") {
    focusPreviousElementOnDismiss(overlay.el);
  }
  if (overlay.keyboardClose && (document.activeElement === null || !overlay.el.contains(document.activeElement))) {
    overlay.el.focus();
  }
};
const focusPreviousElementOnDismiss = async (overlayEl) => {
  let previousElement = document.activeElement;
  if (!previousElement) {
    return;
  }
  const shadowRoot = previousElement === null || previousElement === void 0 ? void 0 : previousElement.shadowRoot;
  if (shadowRoot) {
    previousElement = shadowRoot.querySelector(focusableQueryString$1) || previousElement;
  }
  await overlayEl.onDidDismiss();
  previousElement.focus();
};
const dismiss = async (overlay, data, role, name, iosLeaveAnimation2, mdLeaveAnimation2, opts) => {
  var _a2, _b2;
  if (!overlay.presented) {
    return false;
  }
  setRootAriaHidden(false);
  overlay.presented = false;
  try {
    overlay.el.style.setProperty("pointer-events", "none");
    overlay.willDismiss.emit({ data, role });
    (_a2 = overlay.willDismissShorthand) === null || _a2 === void 0 ? void 0 : _a2.emit({ data, role });
    const mode = getIonMode$2(overlay);
    const animationBuilder = overlay.leaveAnimation ? overlay.leaveAnimation : config.get(name, mode === "ios" ? iosLeaveAnimation2 : mdLeaveAnimation2);
    if (role !== GESTURE) {
      await overlayAnimation(overlay, animationBuilder, overlay.el, opts);
    }
    overlay.didDismiss.emit({ data, role });
    (_b2 = overlay.didDismissShorthand) === null || _b2 === void 0 ? void 0 : _b2.emit({ data, role });
    activeAnimations.delete(overlay);
    overlay.el.classList.add("overlay-hidden");
    overlay.el.style.removeProperty("pointer-events");
  } catch (err) {
    console.error(err);
  }
  overlay.el.remove();
  return true;
};
const getAppRoot = (doc2) => {
  return doc2.querySelector("ion-app") || doc2.body;
};
const overlayAnimation = async (overlay, animationBuilder, baseEl, opts) => {
  baseEl.classList.remove("overlay-hidden");
  const aniRoot = overlay.el;
  const animation2 = animationBuilder(aniRoot, opts);
  if (!overlay.animated || !config.getBoolean("animated", true)) {
    animation2.duration(0);
  }
  if (overlay.keyboardClose) {
    animation2.beforeAddWrite(() => {
      const activeElement = baseEl.ownerDocument.activeElement;
      if (activeElement === null || activeElement === void 0 ? void 0 : activeElement.matches("input,ion-input, ion-textarea")) {
        activeElement.blur();
      }
    });
  }
  const activeAni = activeAnimations.get(overlay) || [];
  activeAnimations.set(overlay, [...activeAni, animation2]);
  await animation2.play();
  return true;
};
const eventMethod = (element, eventName) => {
  let resolve;
  const promise = new Promise((r) => resolve = r);
  onceEvent(element, eventName, (event) => {
    resolve(event.detail);
  });
  return promise;
};
const onceEvent = (element, eventName, callback) => {
  const handler = (ev) => {
    removeEventListener(element, eventName, handler);
    callback(ev);
  };
  addEventListener$1(element, eventName, handler);
};
const isCancel = (role) => {
  return role === "cancel" || role === BACKDROP;
};
const defaultGate = (h2) => h2();
const safeCall = (handler, arg) => {
  if (typeof handler === "function") {
    const jmp = config.get("_zoneGate", defaultGate);
    return jmp(() => {
      try {
        return handler(arg);
      } catch (e) {
        throw e;
      }
    });
  }
  return void 0;
};
const BACKDROP = "backdrop";
const GESTURE = "gesture";
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const LIFECYCLE_WILL_ENTER = "ionViewWillEnter";
const LIFECYCLE_DID_ENTER = "ionViewDidEnter";
const LIFECYCLE_WILL_LEAVE = "ionViewWillLeave";
const LIFECYCLE_DID_LEAVE = "ionViewDidLeave";
const iosTransitionAnimation = () => import('./_nuxt/ios.transition.0a7f132a.mjs');
const mdTransitionAnimation = () => import('./_nuxt/md.transition.da3f83a9.mjs');
const transition = (opts) => {
  return new Promise((resolve, reject) => {
    writeTask(() => {
      beforeTransition(opts);
      runTransition(opts).then((result) => {
        if (result.animation) {
          result.animation.destroy();
        }
        afterTransition(opts);
        resolve(result);
      }, (error) => {
        afterTransition(opts);
        reject(error);
      });
    });
  });
};
const beforeTransition = (opts) => {
  const enteringEl = opts.enteringEl;
  const leavingEl = opts.leavingEl;
  setZIndex(enteringEl, leavingEl, opts.direction);
  if (opts.showGoBack) {
    enteringEl.classList.add("can-go-back");
  } else {
    enteringEl.classList.remove("can-go-back");
  }
  setPageHidden(enteringEl, false);
  enteringEl.style.setProperty("pointer-events", "none");
  if (leavingEl) {
    setPageHidden(leavingEl, false);
    leavingEl.style.setProperty("pointer-events", "none");
  }
};
const runTransition = async (opts) => {
  const animationBuilder = await getAnimationBuilder(opts);
  const ani = animationBuilder && Build.isBrowser ? animation(animationBuilder, opts) : noAnimation(opts);
  return ani;
};
const afterTransition = (opts) => {
  const enteringEl = opts.enteringEl;
  const leavingEl = opts.leavingEl;
  enteringEl.classList.remove("ion-page-invisible");
  enteringEl.style.removeProperty("pointer-events");
  if (leavingEl !== void 0) {
    leavingEl.classList.remove("ion-page-invisible");
    leavingEl.style.removeProperty("pointer-events");
  }
};
const getAnimationBuilder = async (opts) => {
  if (!opts.leavingEl || !opts.animated || opts.duration === 0) {
    return void 0;
  }
  if (opts.animationBuilder) {
    return opts.animationBuilder;
  }
  const getAnimation = opts.mode === "ios" ? (await iosTransitionAnimation()).iosTransitionAnimation : (await mdTransitionAnimation()).mdTransitionAnimation;
  return getAnimation;
};
const animation = async (animationBuilder, opts) => {
  await waitForReady(opts, true);
  const trans = animationBuilder(opts.baseEl, opts);
  fireWillEvents(opts.enteringEl, opts.leavingEl);
  const didComplete = await playTransition(trans, opts);
  if (opts.progressCallback) {
    opts.progressCallback(void 0);
  }
  if (didComplete) {
    fireDidEvents(opts.enteringEl, opts.leavingEl);
  }
  return {
    hasCompleted: didComplete,
    animation: trans
  };
};
const noAnimation = async (opts) => {
  const enteringEl = opts.enteringEl;
  const leavingEl = opts.leavingEl;
  await waitForReady(opts, false);
  fireWillEvents(enteringEl, leavingEl);
  fireDidEvents(enteringEl, leavingEl);
  return {
    hasCompleted: true
  };
};
const waitForReady = async (opts, defaultDeep) => {
  const deep = opts.deepWait !== void 0 ? opts.deepWait : defaultDeep;
  const promises = deep ? [deepReady(opts.enteringEl), deepReady(opts.leavingEl)] : [shallowReady(opts.enteringEl), shallowReady(opts.leavingEl)];
  await Promise.all(promises);
  await notifyViewReady(opts.viewIsReady, opts.enteringEl);
};
const notifyViewReady = async (viewIsReady, enteringEl) => {
  if (viewIsReady) {
    await viewIsReady(enteringEl);
  }
};
const playTransition = (trans, opts) => {
  const progressCallback = opts.progressCallback;
  const promise = new Promise((resolve) => {
    trans.onFinish((currentStep) => resolve(currentStep === 1));
  });
  if (progressCallback) {
    trans.progressStart(true);
    progressCallback(trans);
  } else {
    trans.play();
  }
  return promise;
};
const fireWillEvents = (enteringEl, leavingEl) => {
  lifecycle(leavingEl, LIFECYCLE_WILL_LEAVE);
  lifecycle(enteringEl, LIFECYCLE_WILL_ENTER);
};
const fireDidEvents = (enteringEl, leavingEl) => {
  lifecycle(enteringEl, LIFECYCLE_DID_ENTER);
  lifecycle(leavingEl, LIFECYCLE_DID_LEAVE);
};
const lifecycle = (el, eventName) => {
  if (el) {
    const ev = new CustomEvent(eventName, {
      bubbles: false,
      cancelable: false
    });
    el.dispatchEvent(ev);
  }
};
const shallowReady = (el) => {
  if (el) {
    return new Promise((resolve) => componentOnReady(el, resolve));
  }
  return Promise.resolve();
};
const deepReady = async (el) => {
  const element = el;
  if (element) {
    if (element.componentOnReady != null) {
      const stencilEl = await element.componentOnReady();
      if (stencilEl != null) {
        return;
      }
    } else if (element.__registerHost != null) {
      const waitForCustomElement = new Promise((resolve) => raf(resolve));
      await waitForCustomElement;
      return;
    }
    await Promise.all(Array.from(element.children).map(deepReady));
  }
};
const setPageHidden = (el, hidden) => {
  if (hidden) {
    el.setAttribute("aria-hidden", "true");
    el.classList.add("ion-page-hidden");
  } else {
    el.hidden = false;
    el.removeAttribute("aria-hidden");
    el.classList.remove("ion-page-hidden");
  }
};
const setZIndex = (enteringEl, leavingEl, direction) => {
  if (enteringEl !== void 0) {
    enteringEl.style.zIndex = direction === "back" ? "99" : "101";
  }
  if (leavingEl !== void 0) {
    leavingEl.style.zIndex = "100";
  }
};
const getIonPageElement = (element) => {
  if (element.classList.contains("ion-page")) {
    return element;
  }
  const ionPage = element.querySelector(":scope > .ion-page, :scope > ion-nav, :scope > ion-tabs");
  if (ionPage) {
    return ionPage;
  }
  return element;
};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const win = void 0;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
let animationPrefix;
const processKeyframes = (keyframes) => {
  keyframes.forEach((keyframe) => {
    for (const key in keyframe) {
      if (keyframe.hasOwnProperty(key)) {
        const value = keyframe[key];
        if (key === "easing") {
          const newKey = "animation-timing-function";
          keyframe[newKey] = value;
          delete keyframe[key];
        } else {
          const newKey = convertCamelCaseToHypen(key);
          if (newKey !== key) {
            keyframe[newKey] = value;
            delete keyframe[key];
          }
        }
      }
    }
  });
  return keyframes;
};
const convertCamelCaseToHypen = (str) => {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
};
const getAnimationPrefix = (el) => {
  if (animationPrefix === void 0) {
    const supportsUnprefixed = el.style.animationName !== void 0;
    const supportsWebkitPrefix = el.style.webkitAnimationName !== void 0;
    animationPrefix = !supportsUnprefixed && supportsWebkitPrefix ? "-webkit-" : "";
  }
  return animationPrefix;
};
const setStyleProperty = (element, propertyName, value) => {
  const prefix = propertyName.startsWith("animation") ? getAnimationPrefix(element) : "";
  element.style.setProperty(prefix + propertyName, value);
};
const removeStyleProperty = (element, propertyName) => {
  const prefix = propertyName.startsWith("animation") ? getAnimationPrefix(element) : "";
  element.style.removeProperty(prefix + propertyName);
};
const animationEnd = (el, callback) => {
  let unRegTrans;
  const opts = { passive: true };
  const unregister = () => {
    if (unRegTrans) {
      unRegTrans();
    }
  };
  const onTransitionEnd = (ev) => {
    if (el === ev.target) {
      unregister();
      callback(ev);
    }
  };
  if (el) {
    el.addEventListener("webkitAnimationEnd", onTransitionEnd, opts);
    el.addEventListener("animationend", onTransitionEnd, opts);
    unRegTrans = () => {
      el.removeEventListener("webkitAnimationEnd", onTransitionEnd, opts);
      el.removeEventListener("animationend", onTransitionEnd, opts);
    };
  }
  return unregister;
};
const generateKeyframeRules = (keyframes = []) => {
  return keyframes.map((keyframe) => {
    const offset = keyframe.offset;
    const frameString = [];
    for (const property in keyframe) {
      if (keyframe.hasOwnProperty(property) && property !== "offset") {
        frameString.push(`${property}: ${keyframe[property]};`);
      }
    }
    return `${offset * 100}% { ${frameString.join(" ")} }`;
  }).join(" ");
};
const keyframeIds = [];
const generateKeyframeName = (keyframeRules) => {
  let index = keyframeIds.indexOf(keyframeRules);
  if (index < 0) {
    index = keyframeIds.push(keyframeRules) - 1;
  }
  return `ion-animation-${index}`;
};
const getStyleContainer = (element) => {
  const rootNode = element.getRootNode !== void 0 ? element.getRootNode() : element;
  return rootNode.head || rootNode;
};
const createKeyframeStylesheet = (keyframeName, keyframeRules, element) => {
  var _a2;
  const styleContainer = getStyleContainer(element);
  const keyframePrefix = getAnimationPrefix(element);
  const existingStylesheet = styleContainer.querySelector("#" + keyframeName);
  if (existingStylesheet) {
    return existingStylesheet;
  }
  const stylesheet = ((_a2 = element.ownerDocument) !== null && _a2 !== void 0 ? _a2 : document).createElement("style");
  stylesheet.id = keyframeName;
  stylesheet.textContent = `@${keyframePrefix}keyframes ${keyframeName} { ${keyframeRules} } @${keyframePrefix}keyframes ${keyframeName}-alt { ${keyframeRules} }`;
  styleContainer.appendChild(stylesheet);
  return stylesheet;
};
const addClassToArray = (classes = [], className) => {
  if (className !== void 0) {
    const classNameToAppend = Array.isArray(className) ? className : [className];
    return [...classes, ...classNameToAppend];
  }
  return classes;
};
const createAnimation = (animationId) => {
  let _delay;
  let _duration;
  let _easing;
  let _iterations;
  let _fill;
  let _direction;
  let _keyframes = [];
  let beforeAddClasses = [];
  let beforeRemoveClasses = [];
  let initialized = false;
  let parentAnimation;
  let beforeStylesValue = {};
  let afterAddClasses = [];
  let afterRemoveClasses = [];
  let afterStylesValue = {};
  let numAnimationsRunning = 0;
  let shouldForceLinearEasing = false;
  let shouldForceSyncPlayback = false;
  let cssAnimationsTimerFallback;
  let forceDirectionValue;
  let forceDurationValue;
  let forceDelayValue;
  let willComplete = true;
  let finished = false;
  let shouldCalculateNumAnimations = true;
  let keyframeName;
  let ani;
  let paused = false;
  const id = animationId;
  const onFinishCallbacks = [];
  const onFinishOneTimeCallbacks = [];
  const elements = [];
  const childAnimations = [];
  const stylesheets = [];
  const _beforeAddReadFunctions = [];
  const _beforeAddWriteFunctions = [];
  const _afterAddReadFunctions = [];
  const _afterAddWriteFunctions = [];
  const webAnimations = [];
  const supportsAnimationEffect = typeof AnimationEffect === "function" || win !== void 0 ;
  const supportsWebAnimations = typeof Element === "function" && typeof Element.prototype.animate === "function" && supportsAnimationEffect;
  const ANIMATION_END_FALLBACK_PADDING_MS = 100;
  const getWebAnimations = () => {
    return webAnimations;
  };
  const destroy = (clearStyleSheets) => {
    childAnimations.forEach((childAnimation) => {
      childAnimation.destroy(clearStyleSheets);
    });
    cleanUp(clearStyleSheets);
    elements.length = 0;
    childAnimations.length = 0;
    _keyframes.length = 0;
    clearOnFinish();
    initialized = false;
    shouldCalculateNumAnimations = true;
    return ani;
  };
  const cleanUp = (clearStyleSheets) => {
    cleanUpElements();
    if (clearStyleSheets) {
      cleanUpStyleSheets();
    }
  };
  const resetFlags = () => {
    shouldForceLinearEasing = false;
    shouldForceSyncPlayback = false;
    shouldCalculateNumAnimations = true;
    forceDirectionValue = void 0;
    forceDurationValue = void 0;
    forceDelayValue = void 0;
    numAnimationsRunning = 0;
    finished = false;
    willComplete = true;
    paused = false;
  };
  const isRunning = () => {
    return numAnimationsRunning !== 0 && !paused;
  };
  const onFinish = (callback, opts) => {
    const callbacks = (opts === null || opts === void 0 ? void 0 : opts.oneTimeCallback) ? onFinishOneTimeCallbacks : onFinishCallbacks;
    callbacks.push({ c: callback, o: opts });
    return ani;
  };
  const clearOnFinish = () => {
    onFinishCallbacks.length = 0;
    onFinishOneTimeCallbacks.length = 0;
    return ani;
  };
  const cleanUpElements = () => {
    if (supportsWebAnimations) {
      webAnimations.forEach((animation2) => {
        animation2.cancel();
      });
      webAnimations.length = 0;
    } else {
      const elementsArray = elements.slice();
      raf(() => {
        elementsArray.forEach((element) => {
          removeStyleProperty(element, "animation-name");
          removeStyleProperty(element, "animation-duration");
          removeStyleProperty(element, "animation-timing-function");
          removeStyleProperty(element, "animation-iteration-count");
          removeStyleProperty(element, "animation-delay");
          removeStyleProperty(element, "animation-play-state");
          removeStyleProperty(element, "animation-fill-mode");
          removeStyleProperty(element, "animation-direction");
        });
      });
    }
  };
  const cleanUpStyleSheets = () => {
    stylesheets.forEach((stylesheet) => {
      if (stylesheet === null || stylesheet === void 0 ? void 0 : stylesheet.parentNode) {
        stylesheet.parentNode.removeChild(stylesheet);
      }
    });
    stylesheets.length = 0;
  };
  const beforeAddRead = (readFn) => {
    _beforeAddReadFunctions.push(readFn);
    return ani;
  };
  const beforeAddWrite = (writeFn) => {
    _beforeAddWriteFunctions.push(writeFn);
    return ani;
  };
  const afterAddRead = (readFn) => {
    _afterAddReadFunctions.push(readFn);
    return ani;
  };
  const afterAddWrite = (writeFn) => {
    _afterAddWriteFunctions.push(writeFn);
    return ani;
  };
  const beforeAddClass = (className) => {
    beforeAddClasses = addClassToArray(beforeAddClasses, className);
    return ani;
  };
  const beforeRemoveClass = (className) => {
    beforeRemoveClasses = addClassToArray(beforeRemoveClasses, className);
    return ani;
  };
  const beforeStyles = (styles2 = {}) => {
    beforeStylesValue = styles2;
    return ani;
  };
  const beforeClearStyles = (propertyNames = []) => {
    for (const property of propertyNames) {
      beforeStylesValue[property] = "";
    }
    return ani;
  };
  const afterAddClass = (className) => {
    afterAddClasses = addClassToArray(afterAddClasses, className);
    return ani;
  };
  const afterRemoveClass = (className) => {
    afterRemoveClasses = addClassToArray(afterRemoveClasses, className);
    return ani;
  };
  const afterStyles = (styles2 = {}) => {
    afterStylesValue = styles2;
    return ani;
  };
  const afterClearStyles = (propertyNames = []) => {
    for (const property of propertyNames) {
      afterStylesValue[property] = "";
    }
    return ani;
  };
  const getFill = () => {
    if (_fill !== void 0) {
      return _fill;
    }
    if (parentAnimation) {
      return parentAnimation.getFill();
    }
    return "both";
  };
  const getDirection = () => {
    if (forceDirectionValue !== void 0) {
      return forceDirectionValue;
    }
    if (_direction !== void 0) {
      return _direction;
    }
    if (parentAnimation) {
      return parentAnimation.getDirection();
    }
    return "normal";
  };
  const getEasing = () => {
    if (shouldForceLinearEasing) {
      return "linear";
    }
    if (_easing !== void 0) {
      return _easing;
    }
    if (parentAnimation) {
      return parentAnimation.getEasing();
    }
    return "linear";
  };
  const getDuration = () => {
    if (shouldForceSyncPlayback) {
      return 0;
    }
    if (forceDurationValue !== void 0) {
      return forceDurationValue;
    }
    if (_duration !== void 0) {
      return _duration;
    }
    if (parentAnimation) {
      return parentAnimation.getDuration();
    }
    return 0;
  };
  const getIterations = () => {
    if (_iterations !== void 0) {
      return _iterations;
    }
    if (parentAnimation) {
      return parentAnimation.getIterations();
    }
    return 1;
  };
  const getDelay = () => {
    if (forceDelayValue !== void 0) {
      return forceDelayValue;
    }
    if (_delay !== void 0) {
      return _delay;
    }
    if (parentAnimation) {
      return parentAnimation.getDelay();
    }
    return 0;
  };
  const getKeyframes = () => {
    return _keyframes;
  };
  const direction = (animationDirection) => {
    _direction = animationDirection;
    update(true);
    return ani;
  };
  const fill = (animationFill) => {
    _fill = animationFill;
    update(true);
    return ani;
  };
  const delay = (animationDelay) => {
    _delay = animationDelay;
    update(true);
    return ani;
  };
  const easing = (animationEasing) => {
    _easing = animationEasing;
    update(true);
    return ani;
  };
  const duration = (animationDuration) => {
    if (!supportsWebAnimations && animationDuration === 0) {
      animationDuration = 1;
    }
    _duration = animationDuration;
    update(true);
    return ani;
  };
  const iterations = (animationIterations) => {
    _iterations = animationIterations;
    update(true);
    return ani;
  };
  const parent = (animation2) => {
    parentAnimation = animation2;
    return ani;
  };
  const addElement = (el) => {
    if (el != null) {
      if (el.nodeType === 1) {
        elements.push(el);
      } else if (el.length >= 0) {
        for (let i = 0; i < el.length; i++) {
          elements.push(el[i]);
        }
      } else {
        console.error("Invalid addElement value");
      }
    }
    return ani;
  };
  const addAnimation = (animationToAdd) => {
    if (animationToAdd != null) {
      if (Array.isArray(animationToAdd)) {
        for (const animation2 of animationToAdd) {
          animation2.parent(ani);
          childAnimations.push(animation2);
        }
      } else {
        animationToAdd.parent(ani);
        childAnimations.push(animationToAdd);
      }
    }
    return ani;
  };
  const keyframes = (keyframeValues) => {
    const different = _keyframes !== keyframeValues;
    _keyframes = keyframeValues;
    if (different) {
      updateKeyframes(_keyframes);
    }
    return ani;
  };
  const updateKeyframes = (keyframeValues) => {
    if (supportsWebAnimations) {
      getWebAnimations().forEach((animation2) => {
        if (animation2.effect.setKeyframes) {
          animation2.effect.setKeyframes(keyframeValues);
        } else {
          const newEffect = new KeyframeEffect(animation2.effect.target, keyframeValues, animation2.effect.getTiming());
          animation2.effect = newEffect;
        }
      });
    } else {
      initializeCSSAnimation();
    }
  };
  const beforeAnimation = () => {
    _beforeAddReadFunctions.forEach((callback) => callback());
    _beforeAddWriteFunctions.forEach((callback) => callback());
    const addClasses = beforeAddClasses;
    const removeClasses = beforeRemoveClasses;
    const styles2 = beforeStylesValue;
    elements.forEach((el) => {
      const elementClassList = el.classList;
      addClasses.forEach((c) => elementClassList.add(c));
      removeClasses.forEach((c) => elementClassList.remove(c));
      for (const property in styles2) {
        if (styles2.hasOwnProperty(property)) {
          setStyleProperty(el, property, styles2[property]);
        }
      }
    });
  };
  const afterAnimation = () => {
    clearCSSAnimationsTimeout();
    _afterAddReadFunctions.forEach((callback) => callback());
    _afterAddWriteFunctions.forEach((callback) => callback());
    const currentStep = willComplete ? 1 : 0;
    const addClasses = afterAddClasses;
    const removeClasses = afterRemoveClasses;
    const styles2 = afterStylesValue;
    elements.forEach((el) => {
      const elementClassList = el.classList;
      addClasses.forEach((c) => elementClassList.add(c));
      removeClasses.forEach((c) => elementClassList.remove(c));
      for (const property in styles2) {
        if (styles2.hasOwnProperty(property)) {
          setStyleProperty(el, property, styles2[property]);
        }
      }
    });
    onFinishCallbacks.forEach((onFinishCallback) => {
      return onFinishCallback.c(currentStep, ani);
    });
    onFinishOneTimeCallbacks.forEach((onFinishCallback) => {
      return onFinishCallback.c(currentStep, ani);
    });
    onFinishOneTimeCallbacks.length = 0;
    shouldCalculateNumAnimations = true;
    if (willComplete) {
      finished = true;
    }
    willComplete = true;
  };
  const animationFinish = () => {
    if (numAnimationsRunning === 0) {
      return;
    }
    numAnimationsRunning--;
    if (numAnimationsRunning === 0) {
      afterAnimation();
      if (parentAnimation) {
        parentAnimation.animationFinish();
      }
    }
  };
  const initializeCSSAnimation = (toggleAnimationName = true) => {
    cleanUpStyleSheets();
    const processedKeyframes = processKeyframes(_keyframes);
    elements.forEach((element) => {
      if (processedKeyframes.length > 0) {
        const keyframeRules = generateKeyframeRules(processedKeyframes);
        keyframeName = animationId !== void 0 ? animationId : generateKeyframeName(keyframeRules);
        const stylesheet = createKeyframeStylesheet(keyframeName, keyframeRules, element);
        stylesheets.push(stylesheet);
        setStyleProperty(element, "animation-duration", `${getDuration()}ms`);
        setStyleProperty(element, "animation-timing-function", getEasing());
        setStyleProperty(element, "animation-delay", `${getDelay()}ms`);
        setStyleProperty(element, "animation-fill-mode", getFill());
        setStyleProperty(element, "animation-direction", getDirection());
        const iterationsCount = getIterations() === Infinity ? "infinite" : getIterations().toString();
        setStyleProperty(element, "animation-iteration-count", iterationsCount);
        setStyleProperty(element, "animation-play-state", "paused");
        if (toggleAnimationName) {
          setStyleProperty(element, "animation-name", `${stylesheet.id}-alt`);
        }
        raf(() => {
          setStyleProperty(element, "animation-name", stylesheet.id || null);
        });
      }
    });
  };
  const initializeWebAnimation = () => {
    elements.forEach((element) => {
      const animation2 = element.animate(_keyframes, {
        id,
        delay: getDelay(),
        duration: getDuration(),
        easing: getEasing(),
        iterations: getIterations(),
        fill: getFill(),
        direction: getDirection()
      });
      animation2.pause();
      webAnimations.push(animation2);
    });
    if (webAnimations.length > 0) {
      webAnimations[0].onfinish = () => {
        animationFinish();
      };
    }
  };
  const initializeAnimation = (toggleAnimationName = true) => {
    beforeAnimation();
    if (_keyframes.length > 0) {
      if (supportsWebAnimations) {
        initializeWebAnimation();
      } else {
        initializeCSSAnimation(toggleAnimationName);
      }
    }
    initialized = true;
  };
  const setAnimationStep = (step) => {
    step = Math.min(Math.max(step, 0), 0.9999);
    if (supportsWebAnimations) {
      webAnimations.forEach((animation2) => {
        animation2.currentTime = animation2.effect.getComputedTiming().delay + getDuration() * step;
        animation2.pause();
      });
    } else {
      const animationDuration = `-${getDuration() * step}ms`;
      elements.forEach((element) => {
        if (_keyframes.length > 0) {
          setStyleProperty(element, "animation-delay", animationDuration);
          setStyleProperty(element, "animation-play-state", "paused");
        }
      });
    }
  };
  const updateWebAnimation = (step) => {
    webAnimations.forEach((animation2) => {
      animation2.effect.updateTiming({
        delay: getDelay(),
        duration: getDuration(),
        easing: getEasing(),
        iterations: getIterations(),
        fill: getFill(),
        direction: getDirection()
      });
    });
    if (step !== void 0) {
      setAnimationStep(step);
    }
  };
  const updateCSSAnimation = (toggleAnimationName = true, step) => {
    raf(() => {
      elements.forEach((element) => {
        setStyleProperty(element, "animation-name", keyframeName || null);
        setStyleProperty(element, "animation-duration", `${getDuration()}ms`);
        setStyleProperty(element, "animation-timing-function", getEasing());
        setStyleProperty(element, "animation-delay", step !== void 0 ? `-${step * getDuration()}ms` : `${getDelay()}ms`);
        setStyleProperty(element, "animation-fill-mode", getFill() || null);
        setStyleProperty(element, "animation-direction", getDirection() || null);
        const iterationsCount = getIterations() === Infinity ? "infinite" : getIterations().toString();
        setStyleProperty(element, "animation-iteration-count", iterationsCount);
        if (toggleAnimationName) {
          setStyleProperty(element, "animation-name", `${keyframeName}-alt`);
        }
        raf(() => {
          setStyleProperty(element, "animation-name", keyframeName || null);
        });
      });
    });
  };
  const update = (deep = false, toggleAnimationName = true, step) => {
    if (deep) {
      childAnimations.forEach((animation2) => {
        animation2.update(deep, toggleAnimationName, step);
      });
    }
    if (supportsWebAnimations) {
      updateWebAnimation(step);
    } else {
      updateCSSAnimation(toggleAnimationName, step);
    }
    return ani;
  };
  const progressStart = (forceLinearEasing = false, step) => {
    childAnimations.forEach((animation2) => {
      animation2.progressStart(forceLinearEasing, step);
    });
    pauseAnimation();
    shouldForceLinearEasing = forceLinearEasing;
    if (!initialized) {
      initializeAnimation();
    }
    update(false, true, step);
    return ani;
  };
  const progressStep = (step) => {
    childAnimations.forEach((animation2) => {
      animation2.progressStep(step);
    });
    setAnimationStep(step);
    return ani;
  };
  const progressEnd = (playTo, step, dur) => {
    shouldForceLinearEasing = false;
    childAnimations.forEach((animation2) => {
      animation2.progressEnd(playTo, step, dur);
    });
    if (dur !== void 0) {
      forceDurationValue = dur;
    }
    finished = false;
    willComplete = true;
    if (playTo === 0) {
      forceDirectionValue = getDirection() === "reverse" ? "normal" : "reverse";
      if (forceDirectionValue === "reverse") {
        willComplete = false;
      }
      if (supportsWebAnimations) {
        update();
        setAnimationStep(1 - step);
      } else {
        forceDelayValue = (1 - step) * getDuration() * -1;
        update(false, false);
      }
    } else if (playTo === 1) {
      if (supportsWebAnimations) {
        update();
        setAnimationStep(step);
      } else {
        forceDelayValue = step * getDuration() * -1;
        update(false, false);
      }
    }
    if (playTo !== void 0) {
      onFinish(() => {
        forceDurationValue = void 0;
        forceDirectionValue = void 0;
        forceDelayValue = void 0;
      }, {
        oneTimeCallback: true
      });
      if (!parentAnimation) {
        play();
      }
    }
    return ani;
  };
  const pauseAnimation = () => {
    if (initialized) {
      if (supportsWebAnimations) {
        webAnimations.forEach((animation2) => {
          animation2.pause();
        });
      } else {
        elements.forEach((element) => {
          setStyleProperty(element, "animation-play-state", "paused");
        });
      }
      paused = true;
    }
  };
  const pause = () => {
    childAnimations.forEach((animation2) => {
      animation2.pause();
    });
    pauseAnimation();
    return ani;
  };
  const onAnimationEndFallback = () => {
    cssAnimationsTimerFallback = void 0;
    animationFinish();
  };
  const clearCSSAnimationsTimeout = () => {
    if (cssAnimationsTimerFallback) {
      clearTimeout(cssAnimationsTimerFallback);
    }
  };
  const playCSSAnimations = () => {
    clearCSSAnimationsTimeout();
    raf(() => {
      elements.forEach((element) => {
        if (_keyframes.length > 0) {
          setStyleProperty(element, "animation-play-state", "running");
        }
      });
    });
    if (_keyframes.length === 0 || elements.length === 0) {
      animationFinish();
    } else {
      const animationDelay = getDelay() || 0;
      const animationDuration = getDuration() || 0;
      const animationIterations = getIterations() || 1;
      if (isFinite(animationIterations)) {
        cssAnimationsTimerFallback = setTimeout(onAnimationEndFallback, animationDelay + animationDuration * animationIterations + ANIMATION_END_FALLBACK_PADDING_MS);
      }
      animationEnd(elements[0], () => {
        clearCSSAnimationsTimeout();
        raf(() => {
          clearCSSAnimationPlayState();
          raf(animationFinish);
        });
      });
    }
  };
  const clearCSSAnimationPlayState = () => {
    elements.forEach((element) => {
      removeStyleProperty(element, "animation-duration");
      removeStyleProperty(element, "animation-delay");
      removeStyleProperty(element, "animation-play-state");
    });
  };
  const playWebAnimations = () => {
    webAnimations.forEach((animation2) => {
      animation2.play();
    });
    if (_keyframes.length === 0 || elements.length === 0) {
      animationFinish();
    }
  };
  const resetAnimation = () => {
    if (supportsWebAnimations) {
      setAnimationStep(0);
      updateWebAnimation();
    } else {
      updateCSSAnimation();
    }
  };
  const play = (opts) => {
    return new Promise((resolve) => {
      if (opts === null || opts === void 0 ? void 0 : opts.sync) {
        shouldForceSyncPlayback = true;
        onFinish(() => shouldForceSyncPlayback = false, { oneTimeCallback: true });
      }
      if (!initialized) {
        initializeAnimation();
      }
      if (finished) {
        resetAnimation();
        finished = false;
      }
      if (shouldCalculateNumAnimations) {
        numAnimationsRunning = childAnimations.length + 1;
        shouldCalculateNumAnimations = false;
      }
      onFinish(() => resolve(), { oneTimeCallback: true });
      childAnimations.forEach((animation2) => {
        animation2.play();
      });
      if (supportsWebAnimations) {
        playWebAnimations();
      } else {
        playCSSAnimations();
      }
      paused = false;
    });
  };
  const stop = () => {
    childAnimations.forEach((animation2) => {
      animation2.stop();
    });
    if (initialized) {
      cleanUpElements();
      initialized = false;
    }
    resetFlags();
  };
  const from = (property, value) => {
    const firstFrame = _keyframes[0];
    if (firstFrame !== void 0 && (firstFrame.offset === void 0 || firstFrame.offset === 0)) {
      firstFrame[property] = value;
    } else {
      _keyframes = [{ offset: 0, [property]: value }, ..._keyframes];
    }
    return ani;
  };
  const to = (property, value) => {
    const lastFrame = _keyframes[_keyframes.length - 1];
    if (lastFrame !== void 0 && (lastFrame.offset === void 0 || lastFrame.offset === 1)) {
      lastFrame[property] = value;
    } else {
      _keyframes = [..._keyframes, { offset: 1, [property]: value }];
    }
    return ani;
  };
  const fromTo = (property, fromValue, toValue) => {
    return from(property, fromValue).to(property, toValue);
  };
  return ani = {
    parentAnimation,
    elements,
    childAnimations,
    id,
    animationFinish,
    from,
    to,
    fromTo,
    parent,
    play,
    pause,
    stop,
    destroy,
    keyframes,
    addAnimation,
    addElement,
    update,
    fill,
    direction,
    iterations,
    duration,
    easing,
    delay,
    getWebAnimations,
    getKeyframes,
    getFill,
    getDirection,
    getDelay,
    getIterations,
    getEasing,
    getDuration,
    afterAddRead,
    afterAddWrite,
    afterClearStyles,
    afterStyles,
    afterRemoveClass,
    afterAddClass,
    beforeAddRead,
    beforeAddWrite,
    beforeClearStyles,
    beforeStyles,
    beforeRemoveClass,
    beforeAddClass,
    onFinish,
    isRunning,
    progressStart,
    progressStep,
    progressEnd
  };
};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const fabCss = ":host{position:absolute;z-index:999}:host(.fab-horizontal-center){left:50%;margin-left:-28px}:host-context([dir=rtl]):host(.fab-horizontal-center),:host-context([dir=rtl]).fab-horizontal-center{left:unset;right:unset;right:50%}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host(.fab-horizontal-center){margin-left:unset;-webkit-margin-start:-28px;margin-inline-start:-28px}}:host(.fab-horizontal-start){left:calc(10px + var(--ion-safe-area-left, 0px))}:host-context([dir=rtl]):host(.fab-horizontal-start),:host-context([dir=rtl]).fab-horizontal-start{left:unset;right:unset;right:calc(10px + var(--ion-safe-area-left, 0px))}:host(.fab-horizontal-end){right:calc(10px + var(--ion-safe-area-right, 0px))}:host-context([dir=rtl]):host(.fab-horizontal-end),:host-context([dir=rtl]).fab-horizontal-end{left:unset;right:unset;left:calc(10px + var(--ion-safe-area-right, 0px))}:host(.fab-vertical-top){top:10px}:host(.fab-vertical-top.fab-edge){top:-28px}:host(.fab-vertical-bottom){bottom:10px}:host(.fab-vertical-bottom.fab-edge){bottom:-28px}:host(.fab-vertical-center){margin-top:-28px;top:50%}";
const Fab = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.edge = false;
    this.activated = false;
  }
  activatedChanged() {
    const activated = this.activated;
    const fab = this.getFab();
    if (fab) {
      fab.activated = activated;
    }
    Array.from(this.el.querySelectorAll("ion-fab-list")).forEach((list) => {
      list.activated = activated;
    });
  }
  componentDidLoad() {
    if (this.activated) {
      this.activatedChanged();
    }
  }
  async close() {
    this.activated = false;
  }
  getFab() {
    return this.el.querySelector("ion-fab-button");
  }
  async toggle() {
    const hasList = !!this.el.querySelector("ion-fab-list");
    if (hasList) {
      this.activated = !this.activated;
    }
  }
  render() {
    const { horizontal, vertical, edge } = this;
    const mode = getIonMode$2(this);
    return h(Host, { class: {
      [mode]: true,
      [`fab-horizontal-${horizontal}`]: horizontal !== void 0,
      [`fab-vertical-${vertical}`]: vertical !== void 0,
      "fab-edge": edge
    } }, h("slot", null));
  }
  get el() {
    return this;
  }
  static get watchers() {
    return {
      "activated": ["activatedChanged"]
    };
  }
  static get style() {
    return fabCss;
  }
}, [1, "ion-fab", {
  "horizontal": [1],
  "vertical": [1],
  "edge": [4],
  "activated": [1028],
  "close": [64],
  "toggle": [64]
}]);
function defineCustomElement$1$O() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-fab"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-fab":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Fab);
        }
        break;
    }
  });
}
const defineCustomElement$18 = defineCustomElement$1$O;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const fabButtonIosCss = ':host{--color-activated:var(--color);--color-focused:var(--color);--color-hover:var(--color);--background-hover:var(--ion-color-primary-contrast, #fff);--background-hover-opacity:.08;--transition:background-color, opacity 100ms linear;--ripple-color:currentColor;--border-radius:50%;--border-width:0;--border-style:none;--border-color:initial;--padding-top:0;--padding-end:0;--padding-bottom:0;--padding-start:0;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;display:block;width:56px;height:56px;font-size:14px;text-align:center;text-overflow:ellipsis;text-transform:none;white-space:nowrap;-webkit-font-kerning:none;font-kerning:none}.button-native{border-radius:var(--border-radius);padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;display:block;position:relative;width:100%;height:100%;-webkit-transform:var(--transform);transform:var(--transform);-webkit-transition:var(--transition);transition:var(--transition);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);outline:none;background:var(--background);background-clip:padding-box;color:var(--color);-webkit-box-shadow:var(--box-shadow);box-shadow:var(--box-shadow);contain:strict;cursor:pointer;overflow:hidden;z-index:0;-webkit-appearance:none;-moz-appearance:none;appearance:none;-webkit-box-sizing:border-box;box-sizing:border-box}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.button-native{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}::slotted(ion-icon){line-height:1}.button-native::after{left:0;right:0;top:0;bottom:0;position:absolute;content:"";opacity:0}.button-inner{left:0;right:0;top:0;display:-ms-flexbox;display:flex;position:absolute;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-ms-flex-negative:0;flex-shrink:0;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;height:100%;-webkit-transition:all ease-in-out 300ms;transition:all ease-in-out 300ms;-webkit-transition-property:opacity, -webkit-transform;transition-property:opacity, -webkit-transform;transition-property:transform, opacity;transition-property:transform, opacity, -webkit-transform;z-index:1}:host(.fab-button-disabled){cursor:default;opacity:0.5;pointer-events:none}@media (any-hover: hover){:host(:hover) .button-native{color:var(--color-hover)}:host(:hover) .button-native::after{background:var(--background-hover);opacity:var(--background-hover-opacity)}}:host(.ion-focused) .button-native{color:var(--color-focused)}:host(.ion-focused) .button-native::after{background:var(--background-focused);opacity:var(--background-focused-opacity)}:host(.ion-activated) .button-native{color:var(--color-activated)}:host(.ion-activated) .button-native::after{background:var(--background-activated);opacity:var(--background-activated-opacity)}::slotted(ion-icon){line-height:1}:host(.fab-button-small){margin-left:8px;margin-right:8px;margin-top:8px;margin-bottom:8px;width:40px;height:40px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host(.fab-button-small){margin-left:unset;margin-right:unset;-webkit-margin-start:8px;margin-inline-start:8px;-webkit-margin-end:8px;margin-inline-end:8px}}.close-icon{margin-left:auto;margin-right:auto;margin-top:0;margin-bottom:0;left:0;right:0;top:0;position:absolute;height:100%;-webkit-transform:scale(0.4) rotateZ(-45deg);transform:scale(0.4) rotateZ(-45deg);-webkit-transition:all ease-in-out 300ms;transition:all ease-in-out 300ms;-webkit-transition-property:opacity, -webkit-transform;transition-property:opacity, -webkit-transform;transition-property:transform, opacity;transition-property:transform, opacity, -webkit-transform;font-size:var(--close-icon-font-size);opacity:0;z-index:1}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.close-icon{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}:host(.fab-button-close-active) .close-icon{-webkit-transform:scale(1) rotateZ(0deg);transform:scale(1) rotateZ(0deg);opacity:1}:host(.fab-button-close-active) .button-inner{-webkit-transform:scale(0.4) rotateZ(45deg);transform:scale(0.4) rotateZ(45deg);opacity:0}ion-ripple-effect{color:var(--ripple-color)}@supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))){:host(.fab-button-translucent) .button-native{-webkit-backdrop-filter:var(--backdrop-filter);backdrop-filter:var(--backdrop-filter)}}:host(.ion-color) .button-native{background:var(--ion-color-base);color:var(--ion-color-contrast)}:host{--background:var(--ion-color-primary, #3880ff);--background-activated:var(--ion-color-primary-shade, #3171e0);--background-focused:var(--ion-color-primary-shade, #3171e0);--background-hover:var(--ion-color-primary-tint, #4c8dff);--background-activated-opacity:1;--background-focused-opacity:1;--background-hover-opacity:1;--color:var(--ion-color-primary-contrast, #fff);--box-shadow:0 4px 16px rgba(0, 0, 0, 0.12);--transition:0.2s transform cubic-bezier(0.25, 1.11, 0.78, 1.59);--close-icon-font-size:28px}:host(.ion-activated){--box-shadow:0 4px 16px rgba(0, 0, 0, 0.12);--transform:scale(1.1);--transition:0.2s transform ease-out}::slotted(ion-icon){font-size:28px}:host(.fab-button-in-list){--background:var(--ion-color-light, #f4f5f8);--background-activated:var(--ion-color-light-shade, #d7d8da);--background-focused:var(--background-activated);--background-hover:var(--ion-color-light-tint, #f5f6f9);--color:var(--ion-color-light-contrast, #000);--color-activated:var(--ion-color-light-contrast, #000);--color-focused:var(--color-activated);--transition:transform 200ms ease 10ms, opacity 200ms ease 10ms}:host(.fab-button-in-list) ::slotted(ion-icon){font-size:18px}:host(.ion-color.ion-focused) .button-native::after{background:var(--ion-color-shade)}:host(.ion-color.ion-focused) .button-native,:host(.ion-color.ion-activated) .button-native{color:var(--ion-color-contrast)}:host(.ion-color.ion-focused) .button-native::after,:host(.ion-color.ion-activated) .button-native::after{background:var(--ion-color-shade)}@media (any-hover: hover){:host(.ion-color:hover) .button-native{color:var(--ion-color-contrast)}:host(.ion-color:hover) .button-native::after{background:var(--ion-color-tint)}}@supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))){:host(.fab-button-translucent){--background:rgba(var(--ion-color-primary-rgb, 56, 128, 255), 0.9);--background-hover:rgba(var(--ion-color-primary-rgb, 56, 128, 255), 0.8);--background-focused:rgba(var(--ion-color-primary-rgb, 56, 128, 255), 0.82);--backdrop-filter:saturate(180%) blur(20px)}:host(.fab-button-translucent-in-list){--background:rgba(var(--ion-color-light-rgb, 244, 245, 248), 0.9);--background-hover:rgba(var(--ion-color-light-rgb, 244, 245, 248), 0.8);--background-focused:rgba(var(--ion-color-light-rgb, 244, 245, 248), 0.82)}}@supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))){@media (any-hover: hover){:host(.fab-button-translucent.ion-color:hover) .button-native{background:rgba(var(--ion-color-base-rgb), 0.8)}}:host(.ion-color.fab-button-translucent) .button-native{background:rgba(var(--ion-color-base-rgb), 0.9)}:host(.ion-color.ion-focused.fab-button-translucent) .button-native,:host(.ion-color.ion-activated.fab-button-translucent) .button-native{background:var(--ion-color-base)}}';
const fabButtonMdCss = ':host{--color-activated:var(--color);--color-focused:var(--color);--color-hover:var(--color);--background-hover:var(--ion-color-primary-contrast, #fff);--background-hover-opacity:.08;--transition:background-color, opacity 100ms linear;--ripple-color:currentColor;--border-radius:50%;--border-width:0;--border-style:none;--border-color:initial;--padding-top:0;--padding-end:0;--padding-bottom:0;--padding-start:0;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;display:block;width:56px;height:56px;font-size:14px;text-align:center;text-overflow:ellipsis;text-transform:none;white-space:nowrap;-webkit-font-kerning:none;font-kerning:none}.button-native{border-radius:var(--border-radius);padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;display:block;position:relative;width:100%;height:100%;-webkit-transform:var(--transform);transform:var(--transform);-webkit-transition:var(--transition);transition:var(--transition);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);outline:none;background:var(--background);background-clip:padding-box;color:var(--color);-webkit-box-shadow:var(--box-shadow);box-shadow:var(--box-shadow);contain:strict;cursor:pointer;overflow:hidden;z-index:0;-webkit-appearance:none;-moz-appearance:none;appearance:none;-webkit-box-sizing:border-box;box-sizing:border-box}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.button-native{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}::slotted(ion-icon){line-height:1}.button-native::after{left:0;right:0;top:0;bottom:0;position:absolute;content:"";opacity:0}.button-inner{left:0;right:0;top:0;display:-ms-flexbox;display:flex;position:absolute;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-ms-flex-negative:0;flex-shrink:0;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;height:100%;-webkit-transition:all ease-in-out 300ms;transition:all ease-in-out 300ms;-webkit-transition-property:opacity, -webkit-transform;transition-property:opacity, -webkit-transform;transition-property:transform, opacity;transition-property:transform, opacity, -webkit-transform;z-index:1}:host(.fab-button-disabled){cursor:default;opacity:0.5;pointer-events:none}@media (any-hover: hover){:host(:hover) .button-native{color:var(--color-hover)}:host(:hover) .button-native::after{background:var(--background-hover);opacity:var(--background-hover-opacity)}}:host(.ion-focused) .button-native{color:var(--color-focused)}:host(.ion-focused) .button-native::after{background:var(--background-focused);opacity:var(--background-focused-opacity)}:host(.ion-activated) .button-native{color:var(--color-activated)}:host(.ion-activated) .button-native::after{background:var(--background-activated);opacity:var(--background-activated-opacity)}::slotted(ion-icon){line-height:1}:host(.fab-button-small){margin-left:8px;margin-right:8px;margin-top:8px;margin-bottom:8px;width:40px;height:40px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host(.fab-button-small){margin-left:unset;margin-right:unset;-webkit-margin-start:8px;margin-inline-start:8px;-webkit-margin-end:8px;margin-inline-end:8px}}.close-icon{margin-left:auto;margin-right:auto;margin-top:0;margin-bottom:0;left:0;right:0;top:0;position:absolute;height:100%;-webkit-transform:scale(0.4) rotateZ(-45deg);transform:scale(0.4) rotateZ(-45deg);-webkit-transition:all ease-in-out 300ms;transition:all ease-in-out 300ms;-webkit-transition-property:opacity, -webkit-transform;transition-property:opacity, -webkit-transform;transition-property:transform, opacity;transition-property:transform, opacity, -webkit-transform;font-size:var(--close-icon-font-size);opacity:0;z-index:1}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.close-icon{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}:host(.fab-button-close-active) .close-icon{-webkit-transform:scale(1) rotateZ(0deg);transform:scale(1) rotateZ(0deg);opacity:1}:host(.fab-button-close-active) .button-inner{-webkit-transform:scale(0.4) rotateZ(45deg);transform:scale(0.4) rotateZ(45deg);opacity:0}ion-ripple-effect{color:var(--ripple-color)}@supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))){:host(.fab-button-translucent) .button-native{-webkit-backdrop-filter:var(--backdrop-filter);backdrop-filter:var(--backdrop-filter)}}:host(.ion-color) .button-native{background:var(--ion-color-base);color:var(--ion-color-contrast)}:host{--background:var(--ion-color-primary, #3880ff);--background-activated:transparent;--background-focused:currentColor;--background-hover:currentColor;--background-activated-opacity:0;--background-focused-opacity:.24;--background-hover-opacity:.08;--color:var(--ion-color-primary-contrast, #fff);--box-shadow:0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);--transition:box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1), background-color 280ms cubic-bezier(0.4, 0, 0.2, 1), color 280ms cubic-bezier(0.4, 0, 0.2, 1), opacity 15ms linear 30ms, transform 270ms cubic-bezier(0, 0, 0.2, 1) 0ms;--close-icon-font-size:24px}:host(.ion-activated){--box-shadow:0 7px 8px -4px rgba(0, 0, 0, 0.2), 0 12px 17px 2px rgba(0, 0, 0, 0.14), 0 5px 22px 4px rgba(0, 0, 0, 0.12)}::slotted(ion-icon){font-size:24px}:host(.fab-button-in-list){--color:rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.54);--color-activated:rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.54);--color-focused:var(--color-activated);--background:var(--ion-color-light, #f4f5f8);--background-activated:transparent;--background-focused:var(--ion-color-light-shade, #d7d8da);--background-hover:var(--ion-color-light-tint, #f5f6f9)}:host(.fab-button-in-list) ::slotted(ion-icon){font-size:18px}:host(.ion-color.ion-focused) .button-native{color:var(--ion-color-contrast)}:host(.ion-color.ion-focused) .button-native::after{background:var(--ion-color-contrast)}:host(.ion-color.ion-activated) .button-native{color:var(--ion-color-contrast)}:host(.ion-color.ion-activated) .button-native::after{background:transparent}@media (any-hover: hover){:host(.ion-color:hover) .button-native{color:var(--ion-color-contrast)}:host(.ion-color:hover) .button-native::after{background:var(--ion-color-contrast)}}';
const FabButton = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.ionFocus = createEvent(this, "ionFocus", 7);
    this.ionBlur = createEvent(this, "ionBlur", 7);
    this.fab = null;
    this.inheritedAttributes = {};
    this.activated = false;
    this.disabled = false;
    this.routerDirection = "forward";
    this.show = false;
    this.translucent = false;
    this.type = "button";
    this.closeIcon = close;
    this.onFocus = () => {
      this.ionFocus.emit();
    };
    this.onBlur = () => {
      this.ionBlur.emit();
    };
    this.onClick = () => {
      const { fab } = this;
      if (!fab) {
        return;
      }
      fab.toggle();
    };
  }
  connectedCallback() {
    this.fab = this.el.closest("ion-fab");
  }
  componentWillLoad() {
    this.inheritedAttributes = inheritAriaAttributes(this.el);
  }
  render() {
    const { el, disabled, color, href, activated, show, translucent, size, inheritedAttributes } = this;
    const inList = hostContext("ion-fab-list", el);
    const mode = getIonMode$2(this);
    const TagType = href === void 0 ? "button" : "a";
    const attrs = TagType === "button" ? { type: this.type } : {
      download: this.download,
      href,
      rel: this.rel,
      target: this.target
    };
    return h(Host, { onClick: this.onClick, "aria-disabled": disabled ? "true" : null, class: createColorClasses$1(color, {
      [mode]: true,
      "fab-button-in-list": inList,
      "fab-button-translucent-in-list": inList && translucent,
      "fab-button-close-active": activated,
      "fab-button-show": show,
      "fab-button-disabled": disabled,
      "fab-button-translucent": translucent,
      "ion-activatable": true,
      "ion-focusable": true,
      [`fab-button-${size}`]: size !== void 0
    }) }, h(TagType, Object.assign({}, attrs, { class: "button-native", part: "native", disabled, onFocus: this.onFocus, onBlur: this.onBlur, onClick: (ev) => openURL(href, ev, this.routerDirection, this.routerAnimation) }, inheritedAttributes), h("ion-icon", { icon: this.closeIcon, part: "close-icon", class: "close-icon", lazy: false }), h("span", { class: "button-inner" }, h("slot", null)), mode === "md" && h("ion-ripple-effect", null)));
  }
  get el() {
    return this;
  }
  static get style() {
    return {
      ios: fabButtonIosCss,
      md: fabButtonMdCss
    };
  }
}, [33, "ion-fab-button", {
  "color": [513],
  "activated": [4],
  "disabled": [4],
  "download": [1],
  "href": [1],
  "rel": [1],
  "routerDirection": [1, "router-direction"],
  "routerAnimation": [16],
  "target": [1],
  "show": [4],
  "translucent": [4],
  "type": [1],
  "size": [1],
  "closeIcon": [1, "close-icon"]
}]);
function defineCustomElement$1$N() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-fab-button", "ion-icon", "ion-ripple-effect"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-fab-button":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, FabButton);
        }
        break;
      case "ion-icon":
        if (!customElements.get(tagName)) {
          defineCustomElement$1E();
        }
        break;
      case "ion-ripple-effect":
        if (!customElements.get(tagName)) {
          defineCustomElement$1v();
        }
        break;
    }
  });
}
const defineCustomElement$17 = defineCustomElement$1$N;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const ION_CONTENT_TAG_NAME = "ION-CONTENT";
const ION_CONTENT_ELEMENT_SELECTOR = "ion-content";
const ION_CONTENT_CLASS_SELECTOR = ".ion-content-scroll-host";
const ION_CONTENT_SELECTOR = `${ION_CONTENT_ELEMENT_SELECTOR}, ${ION_CONTENT_CLASS_SELECTOR}`;
const isIonContent = (el) => el.tagName === ION_CONTENT_TAG_NAME;
const getScrollElement = async (el) => {
  if (isIonContent(el)) {
    await new Promise((resolve) => componentOnReady(el, resolve));
    return el.getScrollElement();
  }
  return el;
};
const findIonContent = (el) => {
  const customContentHost = el.querySelector(ION_CONTENT_CLASS_SELECTOR);
  if (customContentHost) {
    return customContentHost;
  }
  return el.querySelector(ION_CONTENT_SELECTOR);
};
const findClosestIonContent = (el) => {
  return el.closest(ION_CONTENT_SELECTOR);
};
const scrollToTop = (el, durationMs) => {
  if (isIonContent(el)) {
    const content = el;
    return content.scrollToTop(durationMs);
  }
  return Promise.resolve(el.scrollTo({
    top: 0,
    left: 0,
    behavior: durationMs > 0 ? "smooth" : "auto"
  }));
};
const printIonContentErrorMsg = (el) => {
  return printRequiredElementError(el, ION_CONTENT_ELEMENT_SELECTOR);
};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const createKeyboardController = (keyboardChangeCallback) => {
  let keyboardVisible;
  const init = () => {
  };
  const destroy = () => {
  };
  const isKeyboardVisible = () => keyboardVisible;
  return { init, destroy, isKeyboardVisible };
};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const gridCss = ":host{padding-left:var(--ion-grid-padding-xs, var(--ion-grid-padding, 5px));padding-right:var(--ion-grid-padding-xs, var(--ion-grid-padding, 5px));padding-top:var(--ion-grid-padding-xs, var(--ion-grid-padding, 5px));padding-bottom:var(--ion-grid-padding-xs, var(--ion-grid-padding, 5px));margin-left:auto;margin-right:auto;display:block;-ms-flex:1;flex:1}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--ion-grid-padding-xs, var(--ion-grid-padding, 5px));padding-inline-start:var(--ion-grid-padding-xs, var(--ion-grid-padding, 5px));-webkit-padding-end:var(--ion-grid-padding-xs, var(--ion-grid-padding, 5px));padding-inline-end:var(--ion-grid-padding-xs, var(--ion-grid-padding, 5px))}}@media (min-width: 576px){:host{padding-left:var(--ion-grid-padding-sm, var(--ion-grid-padding, 5px));padding-right:var(--ion-grid-padding-sm, var(--ion-grid-padding, 5px));padding-top:var(--ion-grid-padding-sm, var(--ion-grid-padding, 5px));padding-bottom:var(--ion-grid-padding-sm, var(--ion-grid-padding, 5px))}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--ion-grid-padding-sm, var(--ion-grid-padding, 5px));padding-inline-start:var(--ion-grid-padding-sm, var(--ion-grid-padding, 5px));-webkit-padding-end:var(--ion-grid-padding-sm, var(--ion-grid-padding, 5px));padding-inline-end:var(--ion-grid-padding-sm, var(--ion-grid-padding, 5px))}}}@media (min-width: 768px){:host{padding-left:var(--ion-grid-padding-md, var(--ion-grid-padding, 5px));padding-right:var(--ion-grid-padding-md, var(--ion-grid-padding, 5px));padding-top:var(--ion-grid-padding-md, var(--ion-grid-padding, 5px));padding-bottom:var(--ion-grid-padding-md, var(--ion-grid-padding, 5px))}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--ion-grid-padding-md, var(--ion-grid-padding, 5px));padding-inline-start:var(--ion-grid-padding-md, var(--ion-grid-padding, 5px));-webkit-padding-end:var(--ion-grid-padding-md, var(--ion-grid-padding, 5px));padding-inline-end:var(--ion-grid-padding-md, var(--ion-grid-padding, 5px))}}}@media (min-width: 992px){:host{padding-left:var(--ion-grid-padding-lg, var(--ion-grid-padding, 5px));padding-right:var(--ion-grid-padding-lg, var(--ion-grid-padding, 5px));padding-top:var(--ion-grid-padding-lg, var(--ion-grid-padding, 5px));padding-bottom:var(--ion-grid-padding-lg, var(--ion-grid-padding, 5px))}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--ion-grid-padding-lg, var(--ion-grid-padding, 5px));padding-inline-start:var(--ion-grid-padding-lg, var(--ion-grid-padding, 5px));-webkit-padding-end:var(--ion-grid-padding-lg, var(--ion-grid-padding, 5px));padding-inline-end:var(--ion-grid-padding-lg, var(--ion-grid-padding, 5px))}}}@media (min-width: 1200px){:host{padding-left:var(--ion-grid-padding-xl, var(--ion-grid-padding, 5px));padding-right:var(--ion-grid-padding-xl, var(--ion-grid-padding, 5px));padding-top:var(--ion-grid-padding-xl, var(--ion-grid-padding, 5px));padding-bottom:var(--ion-grid-padding-xl, var(--ion-grid-padding, 5px))}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--ion-grid-padding-xl, var(--ion-grid-padding, 5px));padding-inline-start:var(--ion-grid-padding-xl, var(--ion-grid-padding, 5px));-webkit-padding-end:var(--ion-grid-padding-xl, var(--ion-grid-padding, 5px));padding-inline-end:var(--ion-grid-padding-xl, var(--ion-grid-padding, 5px))}}}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}:host(.grid-fixed){width:var(--ion-grid-width-xs, var(--ion-grid-width, 100%));max-width:100%}@media (min-width: 576px){:host(.grid-fixed){width:var(--ion-grid-width-sm, var(--ion-grid-width, 540px))}}@media (min-width: 768px){:host(.grid-fixed){width:var(--ion-grid-width-md, var(--ion-grid-width, 720px))}}@media (min-width: 992px){:host(.grid-fixed){width:var(--ion-grid-width-lg, var(--ion-grid-width, 960px))}}@media (min-width: 1200px){:host(.grid-fixed){width:var(--ion-grid-width-xl, var(--ion-grid-width, 1140px))}}:host(.ion-no-padding){--ion-grid-column-padding:0;--ion-grid-column-padding-xs:0;--ion-grid-column-padding-sm:0;--ion-grid-column-padding-md:0;--ion-grid-column-padding-lg:0;--ion-grid-column-padding-xl:0}";
const Grid = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.fixed = false;
  }
  render() {
    const mode = getIonMode$2(this);
    return h(Host, { class: {
      [mode]: true,
      "grid-fixed": this.fixed
    } }, h("slot", null));
  }
  static get style() {
    return gridCss;
  }
}, [1, "ion-grid", {
  "fixed": [4]
}]);
function defineCustomElement$1$K() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-grid"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-grid":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Grid);
        }
        break;
    }
  });
}
const defineCustomElement$14 = defineCustomElement$1$K;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const TRANSITION = "all 0.2s ease-in-out";
const cloneElement = (tagName) => {
  const getCachedEl = document.querySelector(`${tagName}.ion-cloned-element`);
  if (getCachedEl !== null) {
    return getCachedEl;
  }
  const clonedEl = document.createElement(tagName);
  clonedEl.classList.add("ion-cloned-element");
  clonedEl.style.setProperty("display", "none");
  document.body.appendChild(clonedEl);
  return clonedEl;
};
const createHeaderIndex = (headerEl) => {
  if (!headerEl) {
    return;
  }
  const toolbars = headerEl.querySelectorAll("ion-toolbar");
  return {
    el: headerEl,
    toolbars: Array.from(toolbars).map((toolbar) => {
      const ionTitleEl = toolbar.querySelector("ion-title");
      return {
        el: toolbar,
        background: toolbar.shadowRoot.querySelector(".toolbar-background"),
        ionTitleEl,
        innerTitleEl: ionTitleEl ? ionTitleEl.shadowRoot.querySelector(".toolbar-title") : null,
        ionButtonsEl: Array.from(toolbar.querySelectorAll("ion-buttons"))
      };
    })
  };
};
const handleContentScroll = (scrollEl, scrollHeaderIndex, contentEl) => {
  readTask(() => {
    const scrollTop = scrollEl.scrollTop;
    const scale = clamp(1, 1 + -scrollTop / 500, 1.1);
    const nativeRefresher = contentEl.querySelector("ion-refresher.refresher-native");
    if (nativeRefresher === null) {
      writeTask(() => {
        scaleLargeTitles(scrollHeaderIndex.toolbars, scale);
      });
    }
  });
};
const setToolbarBackgroundOpacity = (headerEl, opacity) => {
  if (headerEl.collapse === "fade") {
    return;
  }
  if (opacity === void 0) {
    headerEl.style.removeProperty("--opacity-scale");
  } else {
    headerEl.style.setProperty("--opacity-scale", opacity.toString());
  }
};
const handleToolbarBorderIntersection = (ev, mainHeaderIndex, scrollTop) => {
  if (!ev[0].isIntersecting) {
    return;
  }
  const scale = ev[0].intersectionRatio > 0.9 || scrollTop <= 0 ? 0 : (1 - ev[0].intersectionRatio) * 100 / 75;
  setToolbarBackgroundOpacity(mainHeaderIndex.el, scale === 1 ? void 0 : scale);
};
const handleToolbarIntersection = (ev, mainHeaderIndex, scrollHeaderIndex, scrollEl) => {
  writeTask(() => {
    const scrollTop = scrollEl.scrollTop;
    handleToolbarBorderIntersection(ev, mainHeaderIndex, scrollTop);
    const event = ev[0];
    const intersection = event.intersectionRect;
    const intersectionArea = intersection.width * intersection.height;
    const rootArea = event.rootBounds.width * event.rootBounds.height;
    const isPageHidden = intersectionArea === 0 && rootArea === 0;
    const leftDiff = Math.abs(intersection.left - event.boundingClientRect.left);
    const rightDiff = Math.abs(intersection.right - event.boundingClientRect.right);
    const isPageTransitioning = intersectionArea > 0 && (leftDiff >= 5 || rightDiff >= 5);
    if (isPageHidden || isPageTransitioning) {
      return;
    }
    if (event.isIntersecting) {
      setHeaderActive(mainHeaderIndex, false);
      setHeaderActive(scrollHeaderIndex);
    } else {
      const hasValidIntersection = intersection.x === 0 && intersection.y === 0 || intersection.width !== 0 && intersection.height !== 0;
      if (hasValidIntersection && scrollTop > 0) {
        setHeaderActive(mainHeaderIndex);
        setHeaderActive(scrollHeaderIndex, false);
        setToolbarBackgroundOpacity(mainHeaderIndex.el);
      }
    }
  });
};
const setHeaderActive = (headerIndex, active = true) => {
  const headerEl = headerIndex.el;
  if (active) {
    headerEl.classList.remove("header-collapse-condense-inactive");
    headerEl.removeAttribute("aria-hidden");
  } else {
    headerEl.classList.add("header-collapse-condense-inactive");
    headerEl.setAttribute("aria-hidden", "true");
  }
};
const scaleLargeTitles = (toolbars = [], scale = 1, transition2 = false) => {
  toolbars.forEach((toolbar) => {
    const ionTitle = toolbar.ionTitleEl;
    const titleDiv = toolbar.innerTitleEl;
    if (!ionTitle || ionTitle.size !== "large") {
      return;
    }
    titleDiv.style.transition = transition2 ? TRANSITION : "";
    titleDiv.style.transform = `scale3d(${scale}, ${scale}, 1)`;
  });
};
const handleHeaderFade = (scrollEl, baseEl, condenseHeader) => {
  readTask(() => {
    const scrollTop = scrollEl.scrollTop;
    const baseElHeight = baseEl.clientHeight;
    const fadeStart = condenseHeader ? condenseHeader.clientHeight : 0;
    if (condenseHeader !== null && scrollTop < fadeStart) {
      baseEl.style.setProperty("--opacity-scale", "0");
      scrollEl.style.setProperty("clip-path", `inset(${baseElHeight}px 0px 0px 0px)`);
      return;
    }
    const distanceToStart = scrollTop - fadeStart;
    const fadeDuration = 10;
    const scale = clamp(0, distanceToStart / fadeDuration, 1);
    writeTask(() => {
      scrollEl.style.removeProperty("clip-path");
      baseEl.style.setProperty("--opacity-scale", scale.toString());
    });
  });
};
const headerIosCss = "ion-header{display:block;position:relative;-ms-flex-order:-1;order:-1;width:100%;z-index:10}ion-header ion-toolbar:first-of-type{padding-top:var(--ion-safe-area-top, 0)}.header-ios ion-toolbar:last-of-type{--border-width:0 0 0.55px}@supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))){.header-background{left:0;right:0;top:0;bottom:0;position:absolute;-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px)}.header-translucent-ios ion-toolbar{--opacity:.8}.header-collapse-condense-inactive .header-background{-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px)}}.header-ios.ion-no-border ion-toolbar:last-of-type{--border-width:0}.header-collapse-fade ion-toolbar{--opacity-scale:inherit}.header-collapse-condense{z-index:9}.header-collapse-condense ion-toolbar{position:-webkit-sticky;position:sticky;top:0}.header-collapse-condense ion-toolbar:first-of-type{padding-top:7px;z-index:1}.header-collapse-condense ion-toolbar{--background:var(--ion-background-color, #fff);z-index:0}.header-collapse-condense ion-toolbar:last-of-type{--border-width:0px}.header-collapse-condense ion-toolbar ion-searchbar{height:48px;padding-top:0px;padding-bottom:13px}.header-collapse-main{--opacity-scale:1}.header-collapse-main ion-toolbar{--opacity-scale:inherit}.header-collapse-main ion-toolbar.in-toolbar ion-title,.header-collapse-main ion-toolbar.in-toolbar ion-buttons{-webkit-transition:all 0.2s ease-in-out;transition:all 0.2s ease-in-out}.header-collapse-condense-inactive:not(.header-collapse-condense) ion-toolbar.in-toolbar ion-title,.header-collapse-condense-inactive:not(.header-collapse-condense) ion-toolbar.in-toolbar ion-buttons.buttons-collapse{opacity:0;pointer-events:none}.header-collapse-condense-inactive.header-collapse-condense ion-toolbar.in-toolbar ion-title,.header-collapse-condense-inactive.header-collapse-condense ion-toolbar.in-toolbar ion-buttons.buttons-collapse{visibility:hidden}";
const headerMdCss = 'ion-header{display:block;position:relative;-ms-flex-order:-1;order:-1;width:100%;z-index:10}ion-header ion-toolbar:first-of-type{padding-top:var(--ion-safe-area-top, 0)}.header-md::after{left:0;bottom:-5px;background-position:left 0 top -2px;position:absolute;width:100%;height:5px;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAHBAMAAADzDtBxAAAAD1BMVEUAAAAAAAAAAAAAAAAAAABPDueNAAAABXRSTlMUCS0gBIh/TXEAAAAaSURBVAjXYxCEAgY4UIICBmMogMsgFLtAAQCNSwXZKOdPxgAAAABJRU5ErkJggg==);background-repeat:repeat-x;content:""}[dir=rtl] .header-md::after,:host-context([dir=rtl]) .header-md::after{left:unset;right:unset;right:0}[dir=rtl] .header-md::after,:host-context([dir=rtl]) .header-md::after{background-position:right 0 top -2px}.header-collapse-condense{display:none}.header-md.ion-no-border::after{display:none}';
const Header = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.inheritedAttributes = {};
    this.translucent = false;
    this.setupFadeHeader = async (contentEl, condenseHeader) => {
      const scrollEl = this.scrollEl = await getScrollElement(contentEl);
      this.contentScrollCallback = () => {
        handleHeaderFade(this.scrollEl, this.el, condenseHeader);
      };
      scrollEl.addEventListener("scroll", this.contentScrollCallback);
      handleHeaderFade(this.scrollEl, this.el, condenseHeader);
    };
  }
  componentWillLoad() {
    this.inheritedAttributes = inheritAriaAttributes(this.el);
  }
  componentDidLoad() {
    this.checkCollapsibleHeader();
  }
  componentDidUpdate() {
    this.checkCollapsibleHeader();
  }
  disconnectedCallback() {
    this.destroyCollapsibleHeader();
  }
  async checkCollapsibleHeader() {
    const mode = getIonMode$2(this);
    if (mode !== "ios") {
      return;
    }
    const { collapse } = this;
    const hasCondense = collapse === "condense";
    const hasFade = collapse === "fade";
    this.destroyCollapsibleHeader();
    if (hasCondense) {
      const pageEl = this.el.closest("ion-app,ion-page,.ion-page,page-inner");
      const contentEl = pageEl ? findIonContent(pageEl) : null;
      writeTask(() => {
        const title = cloneElement("ion-title");
        title.size = "large";
        cloneElement("ion-back-button");
      });
      await this.setupCondenseHeader(contentEl, pageEl);
    } else if (hasFade) {
      const pageEl = this.el.closest("ion-app,ion-page,.ion-page,page-inner");
      const contentEl = pageEl ? findIonContent(pageEl) : null;
      if (!contentEl) {
        printIonContentErrorMsg(this.el);
        return;
      }
      const condenseHeader = contentEl.querySelector('ion-header[collapse="condense"]');
      await this.setupFadeHeader(contentEl, condenseHeader);
    }
  }
  destroyCollapsibleHeader() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = void 0;
    }
    if (this.scrollEl && this.contentScrollCallback) {
      this.scrollEl.removeEventListener("scroll", this.contentScrollCallback);
      this.contentScrollCallback = void 0;
    }
    if (this.collapsibleMainHeader) {
      this.collapsibleMainHeader.classList.remove("header-collapse-main");
      this.collapsibleMainHeader = void 0;
    }
  }
  async setupCondenseHeader(contentEl, pageEl) {
    if (!contentEl || !pageEl) {
      printIonContentErrorMsg(this.el);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      return;
    }
    this.scrollEl = await getScrollElement(contentEl);
    const headers = pageEl.querySelectorAll("ion-header");
    this.collapsibleMainHeader = Array.from(headers).find((header) => header.collapse !== "condense");
    if (!this.collapsibleMainHeader) {
      return;
    }
    const mainHeaderIndex = createHeaderIndex(this.collapsibleMainHeader);
    const scrollHeaderIndex = createHeaderIndex(this.el);
    if (!mainHeaderIndex || !scrollHeaderIndex) {
      return;
    }
    setHeaderActive(mainHeaderIndex, false);
    setToolbarBackgroundOpacity(mainHeaderIndex.el, 0);
    const toolbarIntersection = (ev) => {
      handleToolbarIntersection(ev, mainHeaderIndex, scrollHeaderIndex, this.scrollEl);
    };
    this.intersectionObserver = new IntersectionObserver(toolbarIntersection, {
      root: contentEl,
      threshold: [0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
    });
    this.intersectionObserver.observe(scrollHeaderIndex.toolbars[scrollHeaderIndex.toolbars.length - 1].el);
    this.contentScrollCallback = () => {
      handleContentScroll(this.scrollEl, scrollHeaderIndex, contentEl);
    };
    this.scrollEl.addEventListener("scroll", this.contentScrollCallback);
    writeTask(() => {
      if (this.collapsibleMainHeader !== void 0) {
        this.collapsibleMainHeader.classList.add("header-collapse-main");
      }
    });
  }
  render() {
    const { translucent, inheritedAttributes } = this;
    const mode = getIonMode$2(this);
    const collapse = this.collapse || "none";
    const roleType = hostContext("ion-menu", this.el) ? "none" : "banner";
    return h(Host, Object.assign({ role: roleType, class: {
      [mode]: true,
      [`header-${mode}`]: true,
      [`header-translucent`]: this.translucent,
      [`header-collapse-${collapse}`]: true,
      [`header-translucent-${mode}`]: this.translucent
    } }, inheritedAttributes), mode === "ios" && translucent && h("div", { class: "header-background" }), h("slot", null));
  }
  get el() {
    return this;
  }
  static get style() {
    return {
      ios: headerIosCss,
      md: headerMdCss
    };
  }
}, [36, "ion-header", {
  "collapse": [1],
  "translucent": [4]
}]);
function defineCustomElement$1$J() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-header"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-header":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Header);
        }
        break;
    }
  });
}
const defineCustomElement$13 = defineCustomElement$1$J;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const imgCss = ":host{display:block;-o-object-fit:contain;object-fit:contain}img{display:block;width:100%;height:100%;-o-object-fit:inherit;object-fit:inherit;-o-object-position:inherit;object-position:inherit}";
const Img = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.ionImgWillLoad = createEvent(this, "ionImgWillLoad", 7);
    this.ionImgDidLoad = createEvent(this, "ionImgDidLoad", 7);
    this.ionError = createEvent(this, "ionError", 7);
    this.inheritedAttributes = {};
    this.onLoad = () => {
      this.ionImgDidLoad.emit();
    };
    this.onError = () => {
      this.ionError.emit();
    };
  }
  srcChanged() {
    this.addIO();
  }
  componentWillLoad() {
    this.inheritedAttributes = inheritAttributes$2(this.el, ["draggable"]);
  }
  componentDidLoad() {
    this.addIO();
  }
  addIO() {
    if (this.src === void 0) {
      return;
    }
    {
      setTimeout(() => this.load(), 200);
    }
  }
  load() {
    this.loadError = this.onError;
    this.loadSrc = this.src;
    this.ionImgWillLoad.emit();
  }
  removeIO() {
    if (this.io) {
      this.io.disconnect();
      this.io = void 0;
    }
  }
  render() {
    const { loadSrc, alt, onLoad, loadError, inheritedAttributes } = this;
    const { draggable } = inheritedAttributes;
    return h(Host, { class: getIonMode$2(this) }, h("img", { decoding: "async", src: loadSrc, alt, onLoad, onError: loadError, part: "image", draggable: isDraggable(draggable) }));
  }
  get el() {
    return this;
  }
  static get watchers() {
    return {
      "src": ["srcChanged"]
    };
  }
  static get style() {
    return imgCss;
  }
}, [1, "ion-img", {
  "alt": [1],
  "src": [1],
  "loadSrc": [32],
  "loadError": [32]
}]);
const isDraggable = (draggable) => {
  switch (draggable) {
    case "true":
      return true;
    case "false":
      return false;
    default:
      return void 0;
  }
};
function defineCustomElement$1$I() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-img"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-img":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Img);
        }
        break;
    }
  });
}
const defineCustomElement$12 = defineCustomElement$1$I;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const inputIosCss = ".sc-ion-input-ios-h{--placeholder-color:initial;--placeholder-font-style:initial;--placeholder-font-weight:initial;--placeholder-opacity:.5;--padding-top:0;--padding-end:0;--padding-bottom:0;--padding-start:0;--background:transparent;--color:initial;display:-ms-flexbox;display:flex;position:relative;-ms-flex:1;flex:1;-ms-flex-align:center;align-items:center;width:100%;padding:0 !important;background:var(--background);color:var(--color);font-family:var(--ion-font-family, inherit);z-index:2}ion-item.sc-ion-input-ios-h:not(.item-label),ion-item:not(.item-label) .sc-ion-input-ios-h{--padding-start:0}.ion-color.sc-ion-input-ios-h{color:var(--ion-color-base)}.native-input.sc-ion-input-ios{border-radius:var(--border-radius);padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;display:inline-block;-ms-flex:1;flex:1;width:100%;max-width:100%;max-height:100%;border:0;outline:none;background:transparent;-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-appearance:none;-moz-appearance:none;appearance:none}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.native-input.sc-ion-input-ios{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.native-input.sc-ion-input-ios::-webkit-input-placeholder{color:var(--placeholder-color);font-family:inherit;font-style:var(--placeholder-font-style);font-weight:var(--placeholder-font-weight);opacity:var(--placeholder-opacity)}.native-input.sc-ion-input-ios::-moz-placeholder{color:var(--placeholder-color);font-family:inherit;font-style:var(--placeholder-font-style);font-weight:var(--placeholder-font-weight);opacity:var(--placeholder-opacity)}.native-input.sc-ion-input-ios:-ms-input-placeholder{color:var(--placeholder-color);font-family:inherit;font-style:var(--placeholder-font-style);font-weight:var(--placeholder-font-weight);opacity:var(--placeholder-opacity)}.native-input.sc-ion-input-ios::-ms-input-placeholder{color:var(--placeholder-color);font-family:inherit;font-style:var(--placeholder-font-style);font-weight:var(--placeholder-font-weight);opacity:var(--placeholder-opacity)}.native-input.sc-ion-input-ios::placeholder{color:var(--placeholder-color);font-family:inherit;font-style:var(--placeholder-font-style);font-weight:var(--placeholder-font-weight);opacity:var(--placeholder-opacity)}.native-input.sc-ion-input-ios:-webkit-autofill{background-color:transparent}.native-input.sc-ion-input-ios:invalid{-webkit-box-shadow:none;box-shadow:none}.native-input.sc-ion-input-ios::-ms-clear{display:none}.native-input[disabled].sc-ion-input-ios:not(.cloned-input){opacity:0.4}.cloned-input.sc-ion-input-ios{left:0;top:0;position:absolute;pointer-events:none}[dir=rtl].sc-ion-input-ios .cloned-input.sc-ion-input-ios,[dir=rtl].sc-ion-input-ios-h .cloned-input.sc-ion-input-ios,[dir=rtl] .sc-ion-input-ios-h .cloned-input.sc-ion-input-ios{left:unset;right:unset;right:0}.cloned-input.sc-ion-input-ios:disabled{opacity:1}.input-clear-icon.sc-ion-input-ios{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;background-position:center;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;width:30px;height:30px;border:0;outline:none;background-color:transparent;background-repeat:no-repeat;visibility:hidden;-webkit-appearance:none;-moz-appearance:none;appearance:none}.input-clear-icon.sc-ion-input-ios ion-icon.sc-ion-input-ios{color:var(--ion-color-step-600, #666666)}.input-clear-icon.sc-ion-input-ios:focus{opacity:0.5}.has-value.sc-ion-input-ios-h .input-clear-icon.sc-ion-input-ios{visibility:visible}.has-focus.sc-ion-input-ios-h{pointer-events:none}.has-focus.sc-ion-input-ios-h input.sc-ion-input-ios,.has-focus.sc-ion-input-ios-h a.sc-ion-input-ios,.has-focus.sc-ion-input-ios-h button.sc-ion-input-ios{pointer-events:auto}.item-label-floating.item-has-placeholder.sc-ion-input-ios-h:not(.item-has-value),.item-label-floating.item-has-placeholder:not(.item-has-value) .sc-ion-input-ios-h{opacity:0}.item-label-floating.item-has-placeholder.sc-ion-input-ios-h:not(.item-has-value).item-has-focus,.item-label-floating.item-has-placeholder:not(.item-has-value).item-has-focus .sc-ion-input-ios-h{-webkit-transition:opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);transition:opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);opacity:1}.sc-ion-input-ios-h{--padding-top:10px;--padding-end:10px;--padding-bottom:10px;--padding-start:0;font-size:inherit}.item-label-stacked.sc-ion-input-ios-h,.item-label-stacked .sc-ion-input-ios-h,.item-label-floating.sc-ion-input-ios-h,.item-label-floating .sc-ion-input-ios-h{--padding-top:8px;--padding-bottom:8px;--padding-start:0px}.input-clear-icon.sc-ion-input-ios ion-icon.sc-ion-input-ios{width:18px;height:18px}";
const inputMdCss = ".sc-ion-input-md-h{--placeholder-color:initial;--placeholder-font-style:initial;--placeholder-font-weight:initial;--placeholder-opacity:.5;--padding-top:0;--padding-end:0;--padding-bottom:0;--padding-start:0;--background:transparent;--color:initial;display:-ms-flexbox;display:flex;position:relative;-ms-flex:1;flex:1;-ms-flex-align:center;align-items:center;width:100%;padding:0 !important;background:var(--background);color:var(--color);font-family:var(--ion-font-family, inherit);z-index:2}ion-item.sc-ion-input-md-h:not(.item-label),ion-item:not(.item-label) .sc-ion-input-md-h{--padding-start:0}.ion-color.sc-ion-input-md-h{color:var(--ion-color-base)}.native-input.sc-ion-input-md{border-radius:var(--border-radius);padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;display:inline-block;-ms-flex:1;flex:1;width:100%;max-width:100%;max-height:100%;border:0;outline:none;background:transparent;-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-appearance:none;-moz-appearance:none;appearance:none}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.native-input.sc-ion-input-md{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.native-input.sc-ion-input-md::-webkit-input-placeholder{color:var(--placeholder-color);font-family:inherit;font-style:var(--placeholder-font-style);font-weight:var(--placeholder-font-weight);opacity:var(--placeholder-opacity)}.native-input.sc-ion-input-md::-moz-placeholder{color:var(--placeholder-color);font-family:inherit;font-style:var(--placeholder-font-style);font-weight:var(--placeholder-font-weight);opacity:var(--placeholder-opacity)}.native-input.sc-ion-input-md:-ms-input-placeholder{color:var(--placeholder-color);font-family:inherit;font-style:var(--placeholder-font-style);font-weight:var(--placeholder-font-weight);opacity:var(--placeholder-opacity)}.native-input.sc-ion-input-md::-ms-input-placeholder{color:var(--placeholder-color);font-family:inherit;font-style:var(--placeholder-font-style);font-weight:var(--placeholder-font-weight);opacity:var(--placeholder-opacity)}.native-input.sc-ion-input-md::placeholder{color:var(--placeholder-color);font-family:inherit;font-style:var(--placeholder-font-style);font-weight:var(--placeholder-font-weight);opacity:var(--placeholder-opacity)}.native-input.sc-ion-input-md:-webkit-autofill{background-color:transparent}.native-input.sc-ion-input-md:invalid{-webkit-box-shadow:none;box-shadow:none}.native-input.sc-ion-input-md::-ms-clear{display:none}.native-input[disabled].sc-ion-input-md:not(.cloned-input){opacity:0.4}.cloned-input.sc-ion-input-md{left:0;top:0;position:absolute;pointer-events:none}[dir=rtl].sc-ion-input-md .cloned-input.sc-ion-input-md,[dir=rtl].sc-ion-input-md-h .cloned-input.sc-ion-input-md,[dir=rtl] .sc-ion-input-md-h .cloned-input.sc-ion-input-md{left:unset;right:unset;right:0}.cloned-input.sc-ion-input-md:disabled{opacity:1}.input-clear-icon.sc-ion-input-md{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;background-position:center;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;width:30px;height:30px;border:0;outline:none;background-color:transparent;background-repeat:no-repeat;visibility:hidden;-webkit-appearance:none;-moz-appearance:none;appearance:none}.input-clear-icon.sc-ion-input-md ion-icon.sc-ion-input-md{color:var(--ion-color-step-600, #666666)}.input-clear-icon.sc-ion-input-md:focus{opacity:0.5}.has-value.sc-ion-input-md-h .input-clear-icon.sc-ion-input-md{visibility:visible}.has-focus.sc-ion-input-md-h{pointer-events:none}.has-focus.sc-ion-input-md-h input.sc-ion-input-md,.has-focus.sc-ion-input-md-h a.sc-ion-input-md,.has-focus.sc-ion-input-md-h button.sc-ion-input-md{pointer-events:auto}.item-label-floating.item-has-placeholder.sc-ion-input-md-h:not(.item-has-value),.item-label-floating.item-has-placeholder:not(.item-has-value) .sc-ion-input-md-h{opacity:0}.item-label-floating.item-has-placeholder.sc-ion-input-md-h:not(.item-has-value).item-has-focus,.item-label-floating.item-has-placeholder:not(.item-has-value).item-has-focus .sc-ion-input-md-h{-webkit-transition:opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);transition:opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);opacity:1}.sc-ion-input-md-h{--padding-top:10px;--padding-end:0;--padding-bottom:10px;--padding-start:8px;font-size:inherit}.item-label-stacked.sc-ion-input-md-h,.item-label-stacked .sc-ion-input-md-h,.item-label-floating.sc-ion-input-md-h,.item-label-floating .sc-ion-input-md-h{--padding-top:8px;--padding-bottom:8px;--padding-start:0}.input-clear-icon.sc-ion-input-md ion-icon.sc-ion-input-md{width:22px;height:22px}";
const Input = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.ionInput = createEvent(this, "ionInput", 7);
    this.ionChange = createEvent(this, "ionChange", 7);
    this.ionBlur = createEvent(this, "ionBlur", 7);
    this.ionFocus = createEvent(this, "ionFocus", 7);
    this.ionStyle = createEvent(this, "ionStyle", 7);
    this.inputId = `ion-input-${inputIds++}`;
    this.didBlurAfterEdit = false;
    this.inheritedAttributes = {};
    this.isComposing = false;
    this.fireFocusEvents = true;
    this.hasFocus = false;
    this.autocapitalize = "off";
    this.autocomplete = "off";
    this.autocorrect = "off";
    this.autofocus = false;
    this.clearInput = false;
    this.debounce = 0;
    this.disabled = false;
    this.name = this.inputId;
    this.readonly = false;
    this.required = false;
    this.spellcheck = false;
    this.type = "text";
    this.value = "";
    this.onInput = (ev) => {
      const input = ev.target;
      if (input) {
        this.value = input.value || "";
      }
      this.ionInput.emit(ev);
    };
    this.onBlur = (ev) => {
      this.hasFocus = false;
      this.focusChanged();
      this.emitStyle();
      if (this.fireFocusEvents) {
        this.ionBlur.emit(ev);
      }
    };
    this.onFocus = (ev) => {
      this.hasFocus = true;
      this.focusChanged();
      this.emitStyle();
      if (this.fireFocusEvents) {
        this.ionFocus.emit(ev);
      }
    };
    this.onKeydown = (ev) => {
      if (this.shouldClearOnEdit()) {
        if (this.didBlurAfterEdit && this.hasValue() && ev.key !== "Enter") {
          this.clearTextInput();
        }
        this.didBlurAfterEdit = false;
      }
    };
    this.onCompositionStart = () => {
      this.isComposing = true;
    };
    this.onCompositionEnd = () => {
      this.isComposing = false;
    };
    this.clearTextInput = (ev) => {
      if (this.clearInput && !this.readonly && !this.disabled && ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.setFocus();
      }
      this.value = "";
      if (this.nativeInput) {
        this.nativeInput.value = "";
      }
    };
  }
  debounceChanged() {
    this.ionChange = debounceEvent(this.ionChange, this.debounce);
  }
  disabledChanged() {
    this.emitStyle();
  }
  placeholderChanged() {
    this.emitStyle();
  }
  valueChanged() {
    const nativeInput = this.nativeInput;
    const value = this.getValue();
    if (nativeInput && nativeInput.value !== value && !this.isComposing) {
      nativeInput.value = value;
    }
    this.emitStyle();
    this.ionChange.emit({ value: this.value == null ? this.value : this.value.toString() });
  }
  componentWillLoad() {
    this.inheritedAttributes = Object.assign(Object.assign({}, inheritAriaAttributes(this.el)), inheritAttributes$2(this.el, ["tabindex", "title", "data-form-type"]));
  }
  connectedCallback() {
    this.emitStyle();
    this.debounceChanged();
    {
      document.dispatchEvent(new CustomEvent("ionInputDidLoad", {
        detail: this.el
      }));
    }
  }
  componentDidLoad() {
    const nativeInput = this.nativeInput;
    if (nativeInput) {
      nativeInput.addEventListener("compositionstart", this.onCompositionStart);
      nativeInput.addEventListener("compositionend", this.onCompositionEnd);
    }
  }
  disconnectedCallback() {
    {
      document.dispatchEvent(new CustomEvent("ionInputDidUnload", {
        detail: this.el
      }));
    }
    const nativeInput = this.nativeInput;
    if (nativeInput) {
      nativeInput.removeEventListener("compositionstart", this.onCompositionStart);
      nativeInput.removeEventListener("compositionEnd", this.onCompositionEnd);
    }
  }
  async setFocus() {
    if (this.nativeInput) {
      this.nativeInput.focus();
    }
  }
  async setBlur() {
    if (this.nativeInput) {
      this.nativeInput.blur();
    }
  }
  getInputElement() {
    return Promise.resolve(this.nativeInput);
  }
  shouldClearOnEdit() {
    const { type, clearOnEdit } = this;
    return clearOnEdit === void 0 ? type === "password" : clearOnEdit;
  }
  getValue() {
    return typeof this.value === "number" ? this.value.toString() : (this.value || "").toString();
  }
  emitStyle() {
    this.ionStyle.emit({
      interactive: true,
      input: true,
      "has-placeholder": this.placeholder !== void 0,
      "has-value": this.hasValue(),
      "has-focus": this.hasFocus,
      "interactive-disabled": this.disabled
    });
  }
  focusChanged() {
    if (!this.hasFocus && this.shouldClearOnEdit() && this.hasValue()) {
      this.didBlurAfterEdit = true;
    }
  }
  hasValue() {
    return this.getValue().length > 0;
  }
  render() {
    const mode = getIonMode$2(this);
    const value = this.getValue();
    const labelId = this.inputId + "-lbl";
    const label = findItemLabel(this.el);
    if (label) {
      label.id = labelId;
    }
    return h(Host, { "aria-disabled": this.disabled ? "true" : null, class: createColorClasses$1(this.color, {
      [mode]: true,
      "has-value": this.hasValue(),
      "has-focus": this.hasFocus
    }) }, h("input", Object.assign({ class: "native-input", ref: (input) => this.nativeInput = input, "aria-labelledby": label ? labelId : null, disabled: this.disabled, accept: this.accept, autoCapitalize: this.autocapitalize, autoComplete: this.autocomplete, autoCorrect: this.autocorrect, autoFocus: this.autofocus, enterKeyHint: this.enterkeyhint, inputMode: this.inputmode, min: this.min, max: this.max, minLength: this.minlength, maxLength: this.maxlength, multiple: this.multiple, name: this.name, pattern: this.pattern, placeholder: this.placeholder || "", readOnly: this.readonly, required: this.required, spellcheck: this.spellcheck, step: this.step, size: this.size, type: this.type, value, onInput: this.onInput, onBlur: this.onBlur, onFocus: this.onFocus, onKeyDown: this.onKeydown }, this.inheritedAttributes)), this.clearInput && !this.readonly && !this.disabled && h("button", { "aria-label": "reset", type: "button", class: "input-clear-icon", onPointerDown: (ev) => {
      ev.preventDefault();
    }, onClick: this.clearTextInput }, h("ion-icon", { "aria-hidden": "true", icon: mode === "ios" ? closeCircle : closeSharp })));
  }
  get el() {
    return this;
  }
  static get watchers() {
    return {
      "debounce": ["debounceChanged"],
      "disabled": ["disabledChanged"],
      "placeholder": ["placeholderChanged"],
      "value": ["valueChanged"]
    };
  }
  static get style() {
    return {
      ios: inputIosCss,
      md: inputMdCss
    };
  }
}, [34, "ion-input", {
  "fireFocusEvents": [4, "fire-focus-events"],
  "color": [513],
  "accept": [1],
  "autocapitalize": [1],
  "autocomplete": [1],
  "autocorrect": [1],
  "autofocus": [4],
  "clearInput": [4, "clear-input"],
  "clearOnEdit": [4, "clear-on-edit"],
  "debounce": [2],
  "disabled": [4],
  "enterkeyhint": [1],
  "inputmode": [1],
  "max": [8],
  "maxlength": [2],
  "min": [8],
  "minlength": [2],
  "multiple": [4],
  "name": [1],
  "pattern": [1],
  "placeholder": [1],
  "readonly": [4],
  "required": [4],
  "spellcheck": [4],
  "step": [1],
  "size": [2],
  "type": [1],
  "value": [1032],
  "hasFocus": [32],
  "setFocus": [64],
  "setBlur": [64],
  "getInputElement": [64]
}]);
let inputIds = 0;
function defineCustomElement$1$F() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-input", "ion-icon"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-input":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Input);
        }
        break;
      case "ion-icon":
        if (!customElements.get(tagName)) {
          defineCustomElement$1E();
        }
        break;
    }
  });
}
const defineCustomElement$_ = defineCustomElement$1$F;
const defineCustomElement$Z = defineCustomElement$1f;
const defineCustomElement$T = defineCustomElement$1e;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const listIosCss = "ion-list{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;display:block;contain:content;list-style-type:none}ion-list.list-inset{-webkit-transform:translateZ(0);transform:translateZ(0);overflow:hidden}.list-ios{background:var(--ion-item-background, var(--ion-background-color, #fff))}.list-ios.list-inset{margin-left:16px;margin-right:16px;margin-top:16px;margin-bottom:16px;border-radius:10px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.list-ios.list-inset{margin-left:unset;margin-right:unset;-webkit-margin-start:16px;margin-inline-start:16px;-webkit-margin-end:16px;margin-inline-end:16px}}.list-ios.list-inset ion-item{--border-width:0 0 1px 0;--inner-border-width:0}.list-ios.list-inset ion-item:last-child{--border-width:0;--inner-border-width:0}.list-ios.list-inset+ion-list.list-inset{margin-top:0}.list-ios-lines-none .item{--border-width:0;--inner-border-width:0}.list-ios-lines-full .item,.list-ios .item-lines-full{--border-width:0 0 0.55px 0}.list-ios-lines-full .item{--inner-border-width:0}.list-ios-lines-inset .item,.list-ios .item-lines-inset{--inner-border-width:0 0 0.55px 0}.list-ios .item-lines-inset{--border-width:0}.list-ios .item-lines-full{--inner-border-width:0}.list-ios .item-lines-none{--border-width:0;--inner-border-width:0}ion-card .list-ios{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0}";
const listMdCss = "ion-list{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;display:block;contain:content;list-style-type:none}ion-list.list-inset{-webkit-transform:translateZ(0);transform:translateZ(0);overflow:hidden}.list-md{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:8px;padding-bottom:8px;background:var(--ion-item-background, var(--ion-background-color, #fff))}.list-md>.input:last-child::after{left:0}[dir=rtl] .list-md>.input:last-child::after,:host-context([dir=rtl]) .list-md>.input:last-child::after{left:unset;right:unset;right:0}.list-md.list-inset{margin-left:16px;margin-right:16px;margin-top:16px;margin-bottom:16px;border-radius:2px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.list-md.list-inset{margin-left:unset;margin-right:unset;-webkit-margin-start:16px;margin-inline-start:16px;-webkit-margin-end:16px;margin-inline-end:16px}}.list-md.list-inset ion-item:first-child{--border-radius:2px 2px 0 0}.list-md.list-inset ion-item:last-child{--border-radius:0 0 2px, 2px;--border-width:0;--inner-border-width:0}.list-md.list-inset .item-interactive{--padding-start:0;--padding-end:0}.list-md.list-inset+ion-list.list-inset{margin-top:0}.list-md-lines-none .item{--border-width:0;--inner-border-width:0}.list-md-lines-full .item,.list-md .item-lines-full{--border-width:0 0 1px 0}.list-md-lines-full .item{--inner-border-width:0}.list-md-lines-inset .item,.list-md .item-lines-inset{--inner-border-width:0 0 1px 0}.list-md .item-lines-inset{--border-width:0}.list-md .item-lines-full{--inner-border-width:0}.list-md .item-lines-none{--border-width:0;--inner-border-width:0}ion-card .list-md{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0}";
const List = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.inset = false;
  }
  async closeSlidingItems() {
    const item = this.el.querySelector("ion-item-sliding");
    if (item === null || item === void 0 ? void 0 : item.closeOpened) {
      return item.closeOpened();
    }
    return false;
  }
  render() {
    const mode = getIonMode$2(this);
    const { lines, inset } = this;
    return h(Host, { role: "list", class: {
      [mode]: true,
      [`list-${mode}`]: true,
      "list-inset": inset,
      [`list-lines-${lines}`]: lines !== void 0,
      [`list-${mode}-lines-${lines}`]: lines !== void 0
    } });
  }
  get el() {
    return this;
  }
  static get style() {
    return {
      ios: listIosCss,
      md: listMdCss
    };
  }
}, [32, "ion-list", {
  "lines": [1],
  "inset": [4],
  "closeSlidingItems": [64]
}]);
function defineCustomElement$S() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-list"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-list":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, List);
        }
        break;
    }
  });
}
const defineCustomElement$R = defineCustomElement$S;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const getTimeGivenProgression = (p0, p1, p2, p3, progression) => {
  return solveCubicBezier(p0[1], p1[1], p2[1], p3[1], progression).map((tValue) => {
    return solveCubicParametricEquation(p0[0], p1[0], p2[0], p3[0], tValue);
  });
};
const solveCubicParametricEquation = (p0, p1, p2, p3, t) => {
  const partA = 3 * p1 * Math.pow(t - 1, 2);
  const partB = -3 * p2 * t + 3 * p2 + p3 * t;
  const partC = p0 * Math.pow(t - 1, 3);
  return t * (partA + t * partB) - partC;
};
const solveCubicBezier = (p0, p1, p2, p3, refPoint) => {
  p0 -= refPoint;
  p1 -= refPoint;
  p2 -= refPoint;
  p3 -= refPoint;
  const roots = solveCubicEquation(p3 - 3 * p2 + 3 * p1 - p0, 3 * p2 - 6 * p1 + 3 * p0, 3 * p1 - 3 * p0, p0);
  return roots.filter((root) => root >= 0 && root <= 1);
};
const solveQuadraticEquation = (a, b, c) => {
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    return [];
  } else {
    return [(-b + Math.sqrt(discriminant)) / (2 * a), (-b - Math.sqrt(discriminant)) / (2 * a)];
  }
};
const solveCubicEquation = (a, b, c, d) => {
  if (a === 0) {
    return solveQuadraticEquation(b, c, d);
  }
  b /= a;
  c /= a;
  d /= a;
  const p = (3 * c - b * b) / 3;
  const q = (2 * b * b * b - 9 * b * c + 27 * d) / 27;
  if (p === 0) {
    return [Math.pow(-q, 1 / 3)];
  } else if (q === 0) {
    return [Math.sqrt(-p), -Math.sqrt(-p)];
  }
  const discriminant = Math.pow(q / 2, 2) + Math.pow(p / 3, 3);
  if (discriminant === 0) {
    return [Math.pow(q / 2, 1 / 2) - b / 3];
  } else if (discriminant > 0) {
    return [
      Math.pow(-(q / 2) + Math.sqrt(discriminant), 1 / 3) - Math.pow(q / 2 + Math.sqrt(discriminant), 1 / 3) - b / 3
    ];
  }
  const r = Math.sqrt(Math.pow(-(p / 3), 3));
  const phi = Math.acos(-(q / (2 * Math.sqrt(Math.pow(-(p / 3), 3)))));
  const s = 2 * Math.pow(r, 1 / 3);
  return [
    s * Math.cos(phi / 3) - b / 3,
    s * Math.cos((phi + 2 * Math.PI) / 3) - b / 3,
    s * Math.cos((phi + 4 * Math.PI) / 3) - b / 3
  ];
};
const defineCustomElement$K = defineCustomElement$1g;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const rowCss = ":host{display:-ms-flexbox;display:flex;-ms-flex-wrap:wrap;flex-wrap:wrap}";
const Row = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
  }
  render() {
    return h(Host, { class: getIonMode$2(this) }, h("slot", null));
  }
  static get style() {
    return rowCss;
  }
}, [1, "ion-row"]);
function defineCustomElement$1$p() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-row"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-row":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Row);
        }
        break;
    }
  });
}
const defineCustomElement$y = defineCustomElement$1$p;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const addEventListener = (el, eventName, callback, opts) => {
  const listenerOpts = supportsPassive(el) ? {
    capture: !!opts.capture,
    passive: !!opts.passive
  } : !!opts.capture;
  let add;
  let remove;
  if (el["__zone_symbol__addEventListener"]) {
    add = "__zone_symbol__addEventListener";
    remove = "__zone_symbol__removeEventListener";
  } else {
    add = "addEventListener";
    remove = "removeEventListener";
  }
  el[add](eventName, callback, listenerOpts);
  return () => {
    el[remove](eventName, callback, listenerOpts);
  };
};
const supportsPassive = (node) => {
  if (_sPassive === void 0) {
    try {
      const opts = Object.defineProperty({}, "passive", {
        get: () => {
          _sPassive = true;
        }
      });
      node.addEventListener("optsTest", () => {
        return;
      }, opts);
    } catch (e) {
      _sPassive = false;
    }
  }
  return !!_sPassive;
};
let _sPassive;
const MOUSE_WAIT = 2e3;
const createPointerEvents = (el, pointerDown, pointerMove, pointerUp, options) => {
  let rmTouchStart;
  let rmTouchMove;
  let rmTouchEnd;
  let rmTouchCancel;
  let rmMouseStart;
  let rmMouseMove;
  let rmMouseUp;
  let lastTouchEvent = 0;
  const handleTouchStart = (ev) => {
    lastTouchEvent = Date.now() + MOUSE_WAIT;
    if (!pointerDown(ev)) {
      return;
    }
    if (!rmTouchMove && pointerMove) {
      rmTouchMove = addEventListener(el, "touchmove", pointerMove, options);
    }
    if (!rmTouchEnd) {
      rmTouchEnd = addEventListener(ev.target, "touchend", handleTouchEnd, options);
    }
    if (!rmTouchCancel) {
      rmTouchCancel = addEventListener(ev.target, "touchcancel", handleTouchEnd, options);
    }
  };
  const handleMouseDown = (ev) => {
    if (lastTouchEvent > Date.now()) {
      return;
    }
    if (!pointerDown(ev)) {
      return;
    }
    if (!rmMouseMove && pointerMove) {
      rmMouseMove = addEventListener(getDocument(el), "mousemove", pointerMove, options);
    }
    if (!rmMouseUp) {
      rmMouseUp = addEventListener(getDocument(el), "mouseup", handleMouseUp, options);
    }
  };
  const handleTouchEnd = (ev) => {
    stopTouch();
    if (pointerUp) {
      pointerUp(ev);
    }
  };
  const handleMouseUp = (ev) => {
    stopMouse();
    if (pointerUp) {
      pointerUp(ev);
    }
  };
  const stopTouch = () => {
    if (rmTouchMove) {
      rmTouchMove();
    }
    if (rmTouchEnd) {
      rmTouchEnd();
    }
    if (rmTouchCancel) {
      rmTouchCancel();
    }
    rmTouchMove = rmTouchEnd = rmTouchCancel = void 0;
  };
  const stopMouse = () => {
    if (rmMouseMove) {
      rmMouseMove();
    }
    if (rmMouseUp) {
      rmMouseUp();
    }
    rmMouseMove = rmMouseUp = void 0;
  };
  const stop = () => {
    stopTouch();
    stopMouse();
  };
  const enable = (isEnabled = true) => {
    if (!isEnabled) {
      if (rmTouchStart) {
        rmTouchStart();
      }
      if (rmMouseStart) {
        rmMouseStart();
      }
      rmTouchStart = rmMouseStart = void 0;
      stop();
    } else {
      if (!rmTouchStart) {
        rmTouchStart = addEventListener(el, "touchstart", handleTouchStart, options);
      }
      if (!rmMouseStart) {
        rmMouseStart = addEventListener(el, "mousedown", handleMouseDown, options);
      }
    }
  };
  const destroy = () => {
    enable(false);
    pointerUp = pointerMove = pointerDown = void 0;
  };
  return {
    enable,
    stop,
    destroy
  };
};
const getDocument = (node) => {
  return node instanceof Document ? node : node.ownerDocument;
};
const createPanRecognizer = (direction, thresh, maxAngle) => {
  const radians = maxAngle * (Math.PI / 180);
  const isDirX = direction === "x";
  const maxCosine = Math.cos(radians);
  const threshold = thresh * thresh;
  let startX = 0;
  let startY = 0;
  let dirty = false;
  let isPan = 0;
  return {
    start(x, y) {
      startX = x;
      startY = y;
      isPan = 0;
      dirty = true;
    },
    detect(x, y) {
      if (!dirty) {
        return false;
      }
      const deltaX = x - startX;
      const deltaY = y - startY;
      const distance = deltaX * deltaX + deltaY * deltaY;
      if (distance < threshold) {
        return false;
      }
      const hypotenuse = Math.sqrt(distance);
      const cosine = (isDirX ? deltaX : deltaY) / hypotenuse;
      if (cosine > maxCosine) {
        isPan = 1;
      } else if (cosine < -maxCosine) {
        isPan = -1;
      } else {
        isPan = 0;
      }
      dirty = false;
      return true;
    },
    isGesture() {
      return isPan !== 0;
    },
    getDirection() {
      return isPan;
    }
  };
};
const createGesture = (config2) => {
  let hasCapturedPan = false;
  let hasStartedPan = false;
  let hasFiredStart = true;
  let isMoveQueued = false;
  const finalConfig = Object.assign({ disableScroll: false, direction: "x", gesturePriority: 0, passive: true, maxAngle: 40, threshold: 10 }, config2);
  const canStart = finalConfig.canStart;
  const onWillStart = finalConfig.onWillStart;
  const onStart = finalConfig.onStart;
  const onEnd = finalConfig.onEnd;
  const notCaptured = finalConfig.notCaptured;
  const onMove = finalConfig.onMove;
  const threshold = finalConfig.threshold;
  const passive = finalConfig.passive;
  finalConfig.blurOnStart;
  const detail = {
    type: "pan",
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    velocityX: 0,
    velocityY: 0,
    deltaX: 0,
    deltaY: 0,
    currentTime: 0,
    event: void 0,
    data: void 0
  };
  const pan = createPanRecognizer(finalConfig.direction, finalConfig.threshold, finalConfig.maxAngle);
  const gesture = GESTURE_CONTROLLER.createGesture({
    name: config2.gestureName,
    priority: config2.gesturePriority,
    disableScroll: config2.disableScroll
  });
  const pointerDown = (ev) => {
    const timeStamp = now(ev);
    if (hasStartedPan || !hasFiredStart) {
      return false;
    }
    updateDetail(ev, detail);
    detail.startX = detail.currentX;
    detail.startY = detail.currentY;
    detail.startTime = detail.currentTime = timeStamp;
    detail.velocityX = detail.velocityY = detail.deltaX = detail.deltaY = 0;
    detail.event = ev;
    if (canStart && canStart(detail) === false) {
      return false;
    }
    gesture.release();
    if (!gesture.start()) {
      return false;
    }
    hasStartedPan = true;
    if (threshold === 0) {
      return tryToCapturePan();
    }
    pan.start(detail.startX, detail.startY);
    return true;
  };
  const pointerMove = (ev) => {
    if (hasCapturedPan) {
      if (!isMoveQueued && hasFiredStart) {
        isMoveQueued = true;
        calcGestureData(detail, ev);
        requestAnimationFrame(fireOnMove);
      }
      return;
    }
    calcGestureData(detail, ev);
    if (pan.detect(detail.currentX, detail.currentY)) {
      if (!pan.isGesture() || !tryToCapturePan()) {
        abortGesture();
      }
    }
  };
  const fireOnMove = () => {
    if (!hasCapturedPan) {
      return;
    }
    isMoveQueued = false;
    if (onMove) {
      onMove(detail);
    }
  };
  const tryToCapturePan = () => {
    if (!gesture.capture()) {
      return false;
    }
    hasCapturedPan = true;
    hasFiredStart = false;
    detail.startX = detail.currentX;
    detail.startY = detail.currentY;
    detail.startTime = detail.currentTime;
    if (onWillStart) {
      onWillStart(detail).then(fireOnStart);
    } else {
      fireOnStart();
    }
    return true;
  };
  const fireOnStart = () => {
    if (onStart) {
      onStart(detail);
    }
    hasFiredStart = true;
  };
  const reset = () => {
    hasCapturedPan = false;
    hasStartedPan = false;
    isMoveQueued = false;
    hasFiredStart = true;
    gesture.release();
  };
  const pointerUp = (ev) => {
    const tmpHasCaptured = hasCapturedPan;
    const tmpHasFiredStart = hasFiredStart;
    reset();
    if (!tmpHasFiredStart) {
      return;
    }
    calcGestureData(detail, ev);
    if (tmpHasCaptured) {
      if (onEnd) {
        onEnd(detail);
      }
      return;
    }
    if (notCaptured) {
      notCaptured(detail);
    }
  };
  const pointerEvents = createPointerEvents(finalConfig.el, pointerDown, pointerMove, pointerUp, {
    capture: false,
    passive
  });
  const abortGesture = () => {
    reset();
    pointerEvents.stop();
    if (notCaptured) {
      notCaptured(detail);
    }
  };
  return {
    enable(enable = true) {
      if (!enable) {
        if (hasCapturedPan) {
          pointerUp(void 0);
        }
        reset();
      }
      pointerEvents.enable(enable);
    },
    destroy() {
      gesture.destroy();
      pointerEvents.destroy();
    }
  };
};
const calcGestureData = (detail, ev) => {
  if (!ev) {
    return;
  }
  const prevX = detail.currentX;
  const prevY = detail.currentY;
  const prevT = detail.currentTime;
  updateDetail(ev, detail);
  const currentX = detail.currentX;
  const currentY = detail.currentY;
  const timestamp = detail.currentTime = now(ev);
  const timeDelta = timestamp - prevT;
  if (timeDelta > 0 && timeDelta < 100) {
    const velocityX = (currentX - prevX) / timeDelta;
    const velocityY = (currentY - prevY) / timeDelta;
    detail.velocityX = velocityX * 0.7 + detail.velocityX * 0.3;
    detail.velocityY = velocityY * 0.7 + detail.velocityY * 0.3;
  }
  detail.deltaX = currentX - detail.startX;
  detail.deltaY = currentY - detail.startY;
  detail.event = ev;
};
const updateDetail = (ev, detail) => {
  let x = 0;
  let y = 0;
  if (ev) {
    const changedTouches = ev.changedTouches;
    if (changedTouches && changedTouches.length > 0) {
      const touch = changedTouches[0];
      x = touch.clientX;
      y = touch.clientY;
    } else if (ev.pageX !== void 0) {
      x = ev.pageX;
      y = ev.pageY;
    }
  }
  detail.currentX = x;
  detail.currentY = y;
};
const now = (ev) => {
  return ev.timeStamp || Date.now();
};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const createButtonActiveGesture = (el, isButton) => {
  const activateButtonAtPoint = (x, y, hapticFeedbackFn) => {
    {
      return;
    }
  };
  return createGesture({
    el,
    gestureName: "buttonActiveDrag",
    threshold: 0,
    onStart: (ev) => activateButtonAtPoint(ev.currentX, ev.currentY),
    onMove: (ev) => activateButtonAtPoint(ev.currentX, ev.currentY),
    onEnd: () => {
      hapticSelectionEnd();
    }
  });
};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const iosEnterAnimation$5 = (baseEl) => {
  const baseAnimation2 = createAnimation();
  const backdropAnimation = createAnimation();
  const wrapperAnimation = createAnimation();
  backdropAnimation.addElement(baseEl.querySelector("ion-backdrop")).fromTo("opacity", 0.01, "var(--backdrop-opacity)").beforeStyles({
    "pointer-events": "none"
  }).afterClearStyles(["pointer-events"]);
  wrapperAnimation.addElement(baseEl.querySelector(".action-sheet-wrapper")).fromTo("transform", "translateY(100%)", "translateY(0%)");
  return baseAnimation2.addElement(baseEl).easing("cubic-bezier(.36,.66,.04,1)").duration(400).addAnimation([backdropAnimation, wrapperAnimation]);
};
const iosLeaveAnimation$5 = (baseEl) => {
  const baseAnimation2 = createAnimation();
  const backdropAnimation = createAnimation();
  const wrapperAnimation = createAnimation();
  backdropAnimation.addElement(baseEl.querySelector("ion-backdrop")).fromTo("opacity", "var(--backdrop-opacity)", 0);
  wrapperAnimation.addElement(baseEl.querySelector(".action-sheet-wrapper")).fromTo("transform", "translateY(0%)", "translateY(100%)");
  return baseAnimation2.addElement(baseEl).easing("cubic-bezier(.36,.66,.04,1)").duration(450).addAnimation([backdropAnimation, wrapperAnimation]);
};
const mdEnterAnimation$4 = (baseEl) => {
  const baseAnimation2 = createAnimation();
  const backdropAnimation = createAnimation();
  const wrapperAnimation = createAnimation();
  backdropAnimation.addElement(baseEl.querySelector("ion-backdrop")).fromTo("opacity", 0.01, "var(--backdrop-opacity)").beforeStyles({
    "pointer-events": "none"
  }).afterClearStyles(["pointer-events"]);
  wrapperAnimation.addElement(baseEl.querySelector(".action-sheet-wrapper")).fromTo("transform", "translateY(100%)", "translateY(0%)");
  return baseAnimation2.addElement(baseEl).easing("cubic-bezier(.36,.66,.04,1)").duration(400).addAnimation([backdropAnimation, wrapperAnimation]);
};
const mdLeaveAnimation$4 = (baseEl) => {
  const baseAnimation2 = createAnimation();
  const backdropAnimation = createAnimation();
  const wrapperAnimation = createAnimation();
  backdropAnimation.addElement(baseEl.querySelector("ion-backdrop")).fromTo("opacity", "var(--backdrop-opacity)", 0);
  wrapperAnimation.addElement(baseEl.querySelector(".action-sheet-wrapper")).fromTo("transform", "translateY(0%)", "translateY(100%)");
  return baseAnimation2.addElement(baseEl).easing("cubic-bezier(.36,.66,.04,1)").duration(450).addAnimation([backdropAnimation, wrapperAnimation]);
};
const actionSheetIosCss = '.sc-ion-action-sheet-ios-h{--color:initial;--button-color-activated:var(--button-color);--button-color-focused:var(--button-color);--button-color-hover:var(--button-color);--button-color-selected:var(--button-color);--min-width:auto;--width:100%;--max-width:500px;--min-height:auto;--height:100%;--max-height:calc(100% - (var(--ion-safe-area-top) + var(--ion-safe-area-bottom)));-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;left:0;right:0;top:0;bottom:0;display:block;position:fixed;outline:none;font-family:var(--ion-font-family, inherit);-ms-touch-action:none;touch-action:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;z-index:1001}.overlay-hidden.sc-ion-action-sheet-ios-h{display:none}.action-sheet-wrapper.sc-ion-action-sheet-ios{left:0;right:0;bottom:0;-webkit-transform:translate3d(0,  100%,  0);transform:translate3d(0,  100%,  0);display:block;position:absolute;width:var(--width);min-width:var(--min-width);max-width:var(--max-width);height:var(--height);min-height:var(--min-height);max-height:var(--max-height);z-index:10;pointer-events:none}.action-sheet-button.sc-ion-action-sheet-ios{display:block;position:relative;width:100%;border:0;outline:none;background:var(--button-background);color:var(--button-color);font-family:inherit;overflow:hidden}.action-sheet-button-inner.sc-ion-action-sheet-ios{display:-ms-flexbox;display:flex;position:relative;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-ms-flex-negative:0;flex-shrink:0;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;pointer-events:none;width:100%;height:100%;z-index:1}.action-sheet-container.sc-ion-action-sheet-ios{display:-ms-flexbox;display:flex;-ms-flex-flow:column;flex-flow:column;-ms-flex-pack:end;justify-content:flex-end;height:100%;max-height:100%}.action-sheet-group.sc-ion-action-sheet-ios{-ms-flex-negative:2;flex-shrink:2;overscroll-behavior-y:contain;overflow-y:auto;-webkit-overflow-scrolling:touch;pointer-events:all;background:var(--background)}.action-sheet-group.sc-ion-action-sheet-ios::-webkit-scrollbar{display:none}.action-sheet-group-cancel.sc-ion-action-sheet-ios{-ms-flex-negative:0;flex-shrink:0;overflow:hidden}.action-sheet-button.sc-ion-action-sheet-ios::after{left:0;right:0;top:0;bottom:0;position:absolute;content:"";opacity:0}.action-sheet-selected.sc-ion-action-sheet-ios{color:var(--button-color-selected)}.action-sheet-selected.sc-ion-action-sheet-ios::after{background:var(--button-background-selected);opacity:var(--button-background-selected-opacity)}.action-sheet-button.ion-activated.sc-ion-action-sheet-ios{color:var(--button-color-activated)}.action-sheet-button.ion-activated.sc-ion-action-sheet-ios::after{background:var(--button-background-activated);opacity:var(--button-background-activated-opacity)}.action-sheet-button.ion-focused.sc-ion-action-sheet-ios{color:var(--button-color-focused)}.action-sheet-button.ion-focused.sc-ion-action-sheet-ios::after{background:var(--button-background-focused);opacity:var(--button-background-focused-opacity)}@media (any-hover: hover){.action-sheet-button.sc-ion-action-sheet-ios:hover{color:var(--button-color-hover)}.action-sheet-button.sc-ion-action-sheet-ios:hover::after{background:var(--button-background-hover);opacity:var(--button-background-hover-opacity)}}.sc-ion-action-sheet-ios-h{--background:var(--ion-overlay-background-color, var(--ion-color-step-100, #f9f9f9));--backdrop-opacity:var(--ion-backdrop-opacity, 0.4);--button-background:linear-gradient(0deg, rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.08), rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.08) 50%, transparent 50%) bottom/100% 1px no-repeat transparent;--button-background-activated:var(--ion-text-color, #000);--button-background-activated-opacity:.08;--button-background-hover:currentColor;--button-background-hover-opacity:.04;--button-background-focused:currentColor;--button-background-focused-opacity:.12;--button-background-selected:var(--ion-color-step-150, var(--ion-background-color, #fff));--button-background-selected-opacity:1;--button-color:var(--ion-color-primary, #3880ff);--color:var(--ion-color-step-400, #999999);text-align:center}.action-sheet-wrapper.sc-ion-action-sheet-ios{margin-left:auto;margin-right:auto;margin-top:var(--ion-safe-area-top, 0);margin-bottom:var(--ion-safe-area-bottom, 0)}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.action-sheet-wrapper.sc-ion-action-sheet-ios{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}.action-sheet-container.sc-ion-action-sheet-ios{padding-left:8px;padding-right:8px;padding-top:0;padding-bottom:0}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.action-sheet-container.sc-ion-action-sheet-ios{padding-left:unset;padding-right:unset;-webkit-padding-start:8px;padding-inline-start:8px;-webkit-padding-end:8px;padding-inline-end:8px}}.action-sheet-group.sc-ion-action-sheet-ios{border-radius:13px;margin-bottom:8px}.action-sheet-group.sc-ion-action-sheet-ios:first-child{margin-top:10px}.action-sheet-group.sc-ion-action-sheet-ios:last-child{margin-bottom:10px}@supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))){.action-sheet-translucent.sc-ion-action-sheet-ios-h .action-sheet-group.sc-ion-action-sheet-ios{background-color:transparent;-webkit-backdrop-filter:saturate(280%) blur(20px);backdrop-filter:saturate(280%) blur(20px)}.action-sheet-translucent.sc-ion-action-sheet-ios-h .action-sheet-title.sc-ion-action-sheet-ios,.action-sheet-translucent.sc-ion-action-sheet-ios-h .action-sheet-button.sc-ion-action-sheet-ios{background-color:transparent;background-image:-webkit-gradient(linear, left bottom, left top, from(rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.8)), to(rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.8))), -webkit-gradient(linear, left bottom, left top, from(rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.4)), color-stop(50%, rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.4)), color-stop(50%, rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.8)));background-image:linear-gradient(0deg, rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.8), rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.8) 100%), linear-gradient(0deg, rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.4), rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.4) 50%, rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.8) 50%);background-repeat:no-repeat;background-position:top, bottom;background-size:100% calc(100% - 1px), 100% 1px;-webkit-backdrop-filter:saturate(120%);backdrop-filter:saturate(120%)}.action-sheet-translucent.sc-ion-action-sheet-ios-h .action-sheet-button.ion-activated.sc-ion-action-sheet-ios{background-color:rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.7);background-image:none}.action-sheet-translucent.sc-ion-action-sheet-ios-h .action-sheet-cancel.sc-ion-action-sheet-ios{background:var(--button-background-selected)}}.action-sheet-title.sc-ion-action-sheet-ios{background:-webkit-gradient(linear, left bottom, left top, from(rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.08)), color-stop(50%, rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.08)), color-stop(50%, transparent)) bottom/100% 1px no-repeat transparent;background:linear-gradient(0deg, rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.08), rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.08) 50%, transparent 50%) bottom/100% 1px no-repeat transparent}.action-sheet-title.sc-ion-action-sheet-ios{padding-left:10px;padding-right:10px;padding-top:14px;padding-bottom:13px;color:var(--color, var(--ion-color-step-400, #999999));font-size:13px;font-weight:400;text-align:center}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.action-sheet-title.sc-ion-action-sheet-ios{padding-left:unset;padding-right:unset;-webkit-padding-start:10px;padding-inline-start:10px;-webkit-padding-end:10px;padding-inline-end:10px}}.action-sheet-title.action-sheet-has-sub-title.sc-ion-action-sheet-ios{font-weight:600}.action-sheet-sub-title.sc-ion-action-sheet-ios{padding-left:0;padding-right:0;padding-top:6px;padding-bottom:0;font-size:13px;font-weight:400}.action-sheet-button.sc-ion-action-sheet-ios{padding-left:18px;padding-right:18px;padding-top:18px;padding-bottom:18px;height:56px;font-size:20px;contain:strict}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.action-sheet-button.sc-ion-action-sheet-ios{padding-left:unset;padding-right:unset;-webkit-padding-start:18px;padding-inline-start:18px;-webkit-padding-end:18px;padding-inline-end:18px}}.action-sheet-button.sc-ion-action-sheet-ios .action-sheet-icon.sc-ion-action-sheet-ios{margin-right:0.3em;font-size:28px;pointer-events:none}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.action-sheet-button.sc-ion-action-sheet-ios .action-sheet-icon.sc-ion-action-sheet-ios{margin-right:unset;-webkit-margin-end:0.3em;margin-inline-end:0.3em}}.action-sheet-button.sc-ion-action-sheet-ios:last-child{background-image:none}.action-sheet-selected.sc-ion-action-sheet-ios{font-weight:bold}.action-sheet-cancel.sc-ion-action-sheet-ios{font-weight:600}.action-sheet-cancel.sc-ion-action-sheet-ios::after{background:var(--button-background-selected);opacity:var(--button-background-selected-opacity)}.action-sheet-destructive.sc-ion-action-sheet-ios,.action-sheet-destructive.ion-activated.sc-ion-action-sheet-ios,.action-sheet-destructive.ion-focused.sc-ion-action-sheet-ios{color:var(--ion-color-danger, #eb445a)}@media (any-hover: hover){.action-sheet-destructive.sc-ion-action-sheet-ios:hover{color:var(--ion-color-danger, #eb445a)}}';
const actionSheetMdCss = '.sc-ion-action-sheet-md-h{--color:initial;--button-color-activated:var(--button-color);--button-color-focused:var(--button-color);--button-color-hover:var(--button-color);--button-color-selected:var(--button-color);--min-width:auto;--width:100%;--max-width:500px;--min-height:auto;--height:100%;--max-height:calc(100% - (var(--ion-safe-area-top) + var(--ion-safe-area-bottom)));-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;left:0;right:0;top:0;bottom:0;display:block;position:fixed;outline:none;font-family:var(--ion-font-family, inherit);-ms-touch-action:none;touch-action:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;z-index:1001}.overlay-hidden.sc-ion-action-sheet-md-h{display:none}.action-sheet-wrapper.sc-ion-action-sheet-md{left:0;right:0;bottom:0;-webkit-transform:translate3d(0,  100%,  0);transform:translate3d(0,  100%,  0);display:block;position:absolute;width:var(--width);min-width:var(--min-width);max-width:var(--max-width);height:var(--height);min-height:var(--min-height);max-height:var(--max-height);z-index:10;pointer-events:none}.action-sheet-button.sc-ion-action-sheet-md{display:block;position:relative;width:100%;border:0;outline:none;background:var(--button-background);color:var(--button-color);font-family:inherit;overflow:hidden}.action-sheet-button-inner.sc-ion-action-sheet-md{display:-ms-flexbox;display:flex;position:relative;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-ms-flex-negative:0;flex-shrink:0;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;pointer-events:none;width:100%;height:100%;z-index:1}.action-sheet-container.sc-ion-action-sheet-md{display:-ms-flexbox;display:flex;-ms-flex-flow:column;flex-flow:column;-ms-flex-pack:end;justify-content:flex-end;height:100%;max-height:100%}.action-sheet-group.sc-ion-action-sheet-md{-ms-flex-negative:2;flex-shrink:2;overscroll-behavior-y:contain;overflow-y:auto;-webkit-overflow-scrolling:touch;pointer-events:all;background:var(--background)}.action-sheet-group.sc-ion-action-sheet-md::-webkit-scrollbar{display:none}.action-sheet-group-cancel.sc-ion-action-sheet-md{-ms-flex-negative:0;flex-shrink:0;overflow:hidden}.action-sheet-button.sc-ion-action-sheet-md::after{left:0;right:0;top:0;bottom:0;position:absolute;content:"";opacity:0}.action-sheet-selected.sc-ion-action-sheet-md{color:var(--button-color-selected)}.action-sheet-selected.sc-ion-action-sheet-md::after{background:var(--button-background-selected);opacity:var(--button-background-selected-opacity)}.action-sheet-button.ion-activated.sc-ion-action-sheet-md{color:var(--button-color-activated)}.action-sheet-button.ion-activated.sc-ion-action-sheet-md::after{background:var(--button-background-activated);opacity:var(--button-background-activated-opacity)}.action-sheet-button.ion-focused.sc-ion-action-sheet-md{color:var(--button-color-focused)}.action-sheet-button.ion-focused.sc-ion-action-sheet-md::after{background:var(--button-background-focused);opacity:var(--button-background-focused-opacity)}@media (any-hover: hover){.action-sheet-button.sc-ion-action-sheet-md:hover{color:var(--button-color-hover)}.action-sheet-button.sc-ion-action-sheet-md:hover::after{background:var(--button-background-hover);opacity:var(--button-background-hover-opacity)}}.sc-ion-action-sheet-md-h{--background:var(--ion-overlay-background-color, var(--ion-background-color, #fff));--backdrop-opacity:var(--ion-backdrop-opacity, 0.32);--button-background:transparent;--button-background-selected:currentColor;--button-background-selected-opacity:0;--button-background-activated:transparent;--button-background-activated-opacity:0;--button-background-hover:currentColor;--button-background-hover-opacity:.04;--button-background-focused:currentColor;--button-background-focused-opacity:.12;--button-color:var(--ion-color-step-850, #262626);--color:rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.54)}.action-sheet-wrapper.sc-ion-action-sheet-md{margin-left:auto;margin-right:auto;margin-top:var(--ion-safe-area-top, 0);margin-bottom:0}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.action-sheet-wrapper.sc-ion-action-sheet-md{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}.action-sheet-title.sc-ion-action-sheet-md{padding-left:16px;padding-right:16px;padding-top:20px;padding-bottom:17px;min-height:60px;color:var(--color, rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.54));font-size:16px;text-align:start}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.action-sheet-title.sc-ion-action-sheet-md{padding-left:unset;padding-right:unset;-webkit-padding-start:16px;padding-inline-start:16px;-webkit-padding-end:16px;padding-inline-end:16px}}.action-sheet-sub-title.sc-ion-action-sheet-md{padding-left:0;padding-right:0;padding-top:16px;padding-bottom:0;font-size:14px}.action-sheet-group.sc-ion-action-sheet-md:first-child{padding-top:0}.action-sheet-group.sc-ion-action-sheet-md:last-child{padding-bottom:var(--ion-safe-area-bottom)}.action-sheet-button.sc-ion-action-sheet-md{padding-left:16px;padding-right:16px;padding-top:0;padding-bottom:0;position:relative;height:52px;font-size:16px;text-align:start;contain:strict;overflow:hidden}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.action-sheet-button.sc-ion-action-sheet-md{padding-left:unset;padding-right:unset;-webkit-padding-start:16px;padding-inline-start:16px;-webkit-padding-end:16px;padding-inline-end:16px}}.action-sheet-icon.sc-ion-action-sheet-md{margin-left:0;margin-right:32px;margin-top:0;margin-bottom:0;color:var(--color);font-size:24px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.action-sheet-icon.sc-ion-action-sheet-md{margin-left:unset;margin-right:unset;-webkit-margin-start:0;margin-inline-start:0;-webkit-margin-end:32px;margin-inline-end:32px}}.action-sheet-button-inner.sc-ion-action-sheet-md{-ms-flex-pack:start;justify-content:flex-start}.action-sheet-selected.sc-ion-action-sheet-md{font-weight:bold}';
const ActionSheet = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.didPresent = createEvent(this, "ionActionSheetDidPresent", 7);
    this.willPresent = createEvent(this, "ionActionSheetWillPresent", 7);
    this.willDismiss = createEvent(this, "ionActionSheetWillDismiss", 7);
    this.didDismiss = createEvent(this, "ionActionSheetDidDismiss", 7);
    this.presented = false;
    this.keyboardClose = true;
    this.buttons = [];
    this.backdropDismiss = true;
    this.translucent = false;
    this.animated = true;
    this.onBackdropTap = () => {
      this.dismiss(void 0, BACKDROP);
    };
    this.dispatchCancelHandler = (ev) => {
      const role = ev.detail.role;
      if (isCancel(role)) {
        const cancelButton = this.getButtons().find((b) => b.role === "cancel");
        this.callButtonHandler(cancelButton);
      }
    };
  }
  present() {
    return present(this, "actionSheetEnter", iosEnterAnimation$5, mdEnterAnimation$4);
  }
  connectedCallback() {
    prepareOverlay(this.el);
  }
  dismiss(data, role) {
    return dismiss(this, data, role, "actionSheetLeave", iosLeaveAnimation$5, mdLeaveAnimation$4);
  }
  onDidDismiss() {
    return eventMethod(this.el, "ionActionSheetDidDismiss");
  }
  onWillDismiss() {
    return eventMethod(this.el, "ionActionSheetWillDismiss");
  }
  async buttonClick(button) {
    const role = button.role;
    if (isCancel(role)) {
      return this.dismiss(button.data, role);
    }
    const shouldDismiss = await this.callButtonHandler(button);
    if (shouldDismiss) {
      return this.dismiss(button.data, button.role);
    }
    return Promise.resolve();
  }
  async callButtonHandler(button) {
    if (button) {
      const rtn = await safeCall(button.handler);
      if (rtn === false) {
        return false;
      }
    }
    return true;
  }
  getButtons() {
    return this.buttons.map((b) => {
      return typeof b === "string" ? { text: b } : b;
    });
  }
  disconnectedCallback() {
    if (this.gesture) {
      this.gesture.destroy();
      this.gesture = void 0;
    }
  }
  componentDidLoad() {
    const { groupEl, wrapperEl } = this;
    if (this.gesture || getIonMode$2(this) === "md" || !wrapperEl || !groupEl) {
      return;
    }
    readTask(() => {
      const isScrollable = groupEl.scrollHeight > groupEl.clientHeight;
      if (!isScrollable) {
        this.gesture = createButtonActiveGesture(wrapperEl);
        this.gesture.enable(true);
      }
    });
  }
  render() {
    const { header, htmlAttributes, overlayIndex } = this;
    const mode = getIonMode$2(this);
    const allButtons = this.getButtons();
    const cancelButton = allButtons.find((b) => b.role === "cancel");
    const buttons = allButtons.filter((b) => b.role !== "cancel");
    const headerID = `action-sheet-${overlayIndex}-header`;
    return h(Host, Object.assign({ role: "dialog", "aria-modal": "true", "aria-labelledby": header !== void 0 ? headerID : null, tabindex: "-1" }, htmlAttributes, { style: {
      zIndex: `${2e4 + this.overlayIndex}`
    }, class: Object.assign(Object.assign({ [mode]: true }, getClassMap(this.cssClass)), { "overlay-hidden": true, "action-sheet-translucent": this.translucent }), onIonActionSheetWillDismiss: this.dispatchCancelHandler, onIonBackdropTap: this.onBackdropTap }), h("ion-backdrop", { tappable: this.backdropDismiss }), h("div", { tabindex: "0" }), h("div", { class: "action-sheet-wrapper ion-overlay-wrapper", ref: (el) => this.wrapperEl = el }, h("div", { class: "action-sheet-container" }, h("div", { class: "action-sheet-group", ref: (el) => this.groupEl = el }, header !== void 0 && h("div", { id: headerID, class: {
      "action-sheet-title": true,
      "action-sheet-has-sub-title": this.subHeader !== void 0
    } }, header, this.subHeader && h("div", { class: "action-sheet-sub-title" }, this.subHeader)), buttons.map((b) => h("button", { type: "button", id: b.id, class: buttonClass$3(b), onClick: () => this.buttonClick(b) }, h("span", { class: "action-sheet-button-inner" }, b.icon && h("ion-icon", { icon: b.icon, lazy: false, class: "action-sheet-icon" }), b.text), mode === "md" && h("ion-ripple-effect", null)))), cancelButton && h("div", { class: "action-sheet-group action-sheet-group-cancel" }, h("button", { type: "button", class: buttonClass$3(cancelButton), onClick: () => this.buttonClick(cancelButton) }, h("span", { class: "action-sheet-button-inner" }, cancelButton.icon && h("ion-icon", { icon: cancelButton.icon, lazy: false, class: "action-sheet-icon" }), cancelButton.text), mode === "md" && h("ion-ripple-effect", null))))), h("div", { tabindex: "0" }));
  }
  get el() {
    return this;
  }
  static get style() {
    return {
      ios: actionSheetIosCss,
      md: actionSheetMdCss
    };
  }
}, [34, "ion-action-sheet", {
  "overlayIndex": [2, "overlay-index"],
  "keyboardClose": [4, "keyboard-close"],
  "enterAnimation": [16],
  "leaveAnimation": [16],
  "buttons": [16],
  "cssClass": [1, "css-class"],
  "backdropDismiss": [4, "backdrop-dismiss"],
  "header": [1],
  "subHeader": [1, "sub-header"],
  "translucent": [4],
  "animated": [4],
  "htmlAttributes": [16],
  "present": [64],
  "dismiss": [64],
  "onDidDismiss": [64],
  "onWillDismiss": [64]
}]);
const buttonClass$3 = (button) => {
  return Object.assign({ "action-sheet-button": true, "ion-activatable": true, "ion-focusable": true, [`action-sheet-${button.role}`]: button.role !== void 0 }, getClassMap(button.cssClass));
};
function defineCustomElement$u() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-action-sheet", "ion-backdrop", "ion-icon", "ion-ripple-effect"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-action-sheet":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, ActionSheet);
        }
        break;
      case "ion-backdrop":
        if (!customElements.get(tagName)) {
          defineCustomElement$1A();
        }
        break;
      case "ion-icon":
        if (!customElements.get(tagName)) {
          defineCustomElement$1E();
        }
        break;
      case "ion-ripple-effect":
        if (!customElements.get(tagName)) {
          defineCustomElement$1v();
        }
        break;
    }
  });
}
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const thumbnailCss = ":host{--size:48px;--border-radius:0;border-radius:var(--border-radius);display:block;width:var(--size);height:var(--size)}::slotted(ion-img),::slotted(img){border-radius:var(--border-radius);width:100%;height:100%;-o-object-fit:cover;object-fit:cover;overflow:hidden}";
const Thumbnail = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
  }
  render() {
    return h(Host, { class: getIonMode$2(this) }, h("slot", null));
  }
  static get style() {
    return thumbnailCss;
  }
}, [1, "ion-thumbnail"]);
function defineCustomElement$1$d() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-thumbnail"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-thumbnail":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Thumbnail);
        }
        break;
    }
  });
}
const defineCustomElement$i = defineCustomElement$1$d;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const titleIosCss = ":host{--color:initial;display:-ms-flexbox;display:flex;-ms-flex:1;flex:1;-ms-flex-align:center;align-items:center;-webkit-transform:translateZ(0);transform:translateZ(0);color:var(--color)}:host(.ion-color){color:var(--ion-color-base)}.toolbar-title{display:block;width:100%;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;pointer-events:auto}:host(.title-small) .toolbar-title{white-space:normal}:host{left:0;top:0;padding-left:90px;padding-right:90px;padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);position:absolute;width:100%;height:100%;-webkit-transform:translateZ(0);transform:translateZ(0);font-size:17px;font-weight:600;text-align:center;-webkit-box-sizing:border-box;box-sizing:border-box;pointer-events:none}:host-context([dir=rtl]){left:unset;right:unset;right:0}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:90px;padding-inline-start:90px;-webkit-padding-end:90px;padding-inline-end:90px}}:host(.title-small){padding-left:9px;padding-right:9px;padding-top:6px;padding-bottom:16px;position:relative;font-size:13px;font-weight:normal}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host(.title-small){padding-left:unset;padding-right:unset;-webkit-padding-start:9px;padding-inline-start:9px;-webkit-padding-end:9px;padding-inline-end:9px}}:host(.title-large){padding-left:16px;padding-right:16px;padding-top:0;padding-bottom:0;-webkit-transform-origin:left center;transform-origin:left center;bottom:0;-ms-flex-align:end;align-items:flex-end;min-width:100%;padding-bottom:6px;font-size:34px;font-weight:700;text-align:start}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host(.title-large){padding-left:unset;padding-right:unset;-webkit-padding-start:16px;padding-inline-start:16px;-webkit-padding-end:16px;padding-inline-end:16px}}:host(.title-large.title-rtl){-webkit-transform-origin:right center;transform-origin:right center}:host(.title-large.ion-cloned-element){--color:var(--ion-text-color, #000)}:host(.title-large) .toolbar-title{-webkit-transform-origin:inherit;transform-origin:inherit}:host-context([dir=rtl]):host(.title-large) .toolbar-title,:host-context([dir=rtl]).title-large .toolbar-title{-webkit-transform-origin:calc(100% - inherit);transform-origin:calc(100% - inherit)}";
const titleMdCss = ":host{--color:initial;display:-ms-flexbox;display:flex;-ms-flex:1;flex:1;-ms-flex-align:center;align-items:center;-webkit-transform:translateZ(0);transform:translateZ(0);color:var(--color)}:host(.ion-color){color:var(--ion-color-base)}.toolbar-title{display:block;width:100%;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;pointer-events:auto}:host(.title-small) .toolbar-title{white-space:normal}:host{padding-left:20px;padding-right:20px;padding-top:0;padding-bottom:0;font-size:20px;font-weight:500;letter-spacing:0.0125em}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:20px;padding-inline-start:20px;-webkit-padding-end:20px;padding-inline-end:20px}}:host(.title-small){width:100%;height:100%;font-size:15px;font-weight:normal}";
const ToolbarTitle = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.ionStyle = createEvent(this, "ionStyle", 7);
  }
  sizeChanged() {
    this.emitStyle();
  }
  connectedCallback() {
    this.emitStyle();
  }
  emitStyle() {
    const size = this.getSize();
    this.ionStyle.emit({
      [`title-${size}`]: true
    });
  }
  getSize() {
    return this.size !== void 0 ? this.size : "default";
  }
  render() {
    const mode = getIonMode$2(this);
    const size = this.getSize();
    return h(Host, { class: createColorClasses$1(this.color, {
      [mode]: true,
      [`title-${size}`]: true,
      "title-rtl": document.dir === "rtl"
    }) }, h("div", { class: "toolbar-title" }, h("slot", null)));
  }
  get el() {
    return this;
  }
  static get watchers() {
    return {
      "size": ["sizeChanged"]
    };
  }
  static get style() {
    return {
      ios: titleIosCss,
      md: titleMdCss
    };
  }
}, [33, "ion-title", {
  "color": [513],
  "size": [1]
}]);
function defineCustomElement$1$c() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-title"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-title":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, ToolbarTitle);
        }
        break;
    }
  });
}
const defineCustomElement$h = defineCustomElement$1$c;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const toolbarIosCss = ":host{--border-width:0;--border-style:solid;--opacity:1;--opacity-scale:1;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;padding-left:var(--ion-safe-area-left);padding-right:var(--ion-safe-area-right);display:block;position:relative;width:100%;color:var(--color);font-family:var(--ion-font-family, inherit);contain:content;z-index:10;-webkit-box-sizing:border-box;box-sizing:border-box}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--ion-safe-area-left);padding-inline-start:var(--ion-safe-area-left);-webkit-padding-end:var(--ion-safe-area-right);padding-inline-end:var(--ion-safe-area-right)}}:host(.ion-color){color:var(--ion-color-contrast)}:host(.ion-color) .toolbar-background{background:var(--ion-color-base)}.toolbar-container{padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);display:-ms-flexbox;display:flex;position:relative;-ms-flex-direction:row;flex-direction:row;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;width:100%;min-height:var(--min-height);contain:content;overflow:hidden;z-index:10;-webkit-box-sizing:border-box;box-sizing:border-box}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.toolbar-container{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.toolbar-background{left:0;right:0;top:0;bottom:0;position:absolute;-webkit-transform:translateZ(0);transform:translateZ(0);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);background:var(--background);contain:strict;opacity:calc(var(--opacity) * var(--opacity-scale));z-index:-1;pointer-events:none}::slotted(ion-progress-bar){left:0;right:0;bottom:0;position:absolute}:host{--background:var(--ion-toolbar-background, var(--ion-color-step-50, #f7f7f7));--color:var(--ion-toolbar-color, var(--ion-text-color, #000));--border-color:var(--ion-toolbar-border-color, var(--ion-border-color, var(--ion-color-step-150, rgba(0, 0, 0, 0.2))));--padding-top:3px;--padding-bottom:3px;--padding-start:4px;--padding-end:4px;--min-height:44px}.toolbar-content{-ms-flex:1;flex:1;-ms-flex-order:4;order:4;min-width:0}:host(.toolbar-segment) .toolbar-content{display:-ms-inline-flexbox;display:inline-flex}:host(.toolbar-searchbar) .toolbar-container{padding-top:0;padding-bottom:0}:host(.toolbar-searchbar) ::slotted(*){-ms-flex-item-align:start;align-self:start}:host(.toolbar-searchbar) ::slotted(ion-chip){margin-top:3px}:host(.toolbar-searchbar) ::slotted(ion-back-button){height:38px}::slotted(ion-buttons){min-height:38px}::slotted([slot=start]){-ms-flex-order:2;order:2}::slotted([slot=secondary]){-ms-flex-order:3;order:3}::slotted([slot=primary]){-ms-flex-order:5;order:5;text-align:end}::slotted([slot=end]){-ms-flex-order:6;order:6;text-align:end}:host(.toolbar-title-large) .toolbar-container{-ms-flex-wrap:wrap;flex-wrap:wrap;-ms-flex-align:start;align-items:flex-start}:host(.toolbar-title-large) .toolbar-content ion-title{-ms-flex:1;flex:1;-ms-flex-order:8;order:8;min-width:100%}";
const toolbarMdCss = ":host{--border-width:0;--border-style:solid;--opacity:1;--opacity-scale:1;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;padding-left:var(--ion-safe-area-left);padding-right:var(--ion-safe-area-right);display:block;position:relative;width:100%;color:var(--color);font-family:var(--ion-font-family, inherit);contain:content;z-index:10;-webkit-box-sizing:border-box;box-sizing:border-box}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--ion-safe-area-left);padding-inline-start:var(--ion-safe-area-left);-webkit-padding-end:var(--ion-safe-area-right);padding-inline-end:var(--ion-safe-area-right)}}:host(.ion-color){color:var(--ion-color-contrast)}:host(.ion-color) .toolbar-background{background:var(--ion-color-base)}.toolbar-container{padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);display:-ms-flexbox;display:flex;position:relative;-ms-flex-direction:row;flex-direction:row;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;width:100%;min-height:var(--min-height);contain:content;overflow:hidden;z-index:10;-webkit-box-sizing:border-box;box-sizing:border-box}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.toolbar-container{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.toolbar-background{left:0;right:0;top:0;bottom:0;position:absolute;-webkit-transform:translateZ(0);transform:translateZ(0);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);background:var(--background);contain:strict;opacity:calc(var(--opacity) * var(--opacity-scale));z-index:-1;pointer-events:none}::slotted(ion-progress-bar){left:0;right:0;bottom:0;position:absolute}:host{--background:var(--ion-toolbar-background, var(--ion-background-color, #fff));--color:var(--ion-toolbar-color, var(--ion-text-color, #424242));--border-color:var(--ion-toolbar-border-color, var(--ion-border-color, var(--ion-color-step-150, #c1c4cd)));--padding-top:0;--padding-bottom:0;--padding-start:0;--padding-end:0;--min-height:56px}.toolbar-content{-ms-flex:1;flex:1;-ms-flex-order:3;order:3;min-width:0;max-width:100%}::slotted(.buttons-first-slot){margin-left:4px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(.buttons-first-slot){margin-left:unset;-webkit-margin-start:4px;margin-inline-start:4px}}::slotted(.buttons-last-slot){margin-right:4px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(.buttons-last-slot){margin-right:unset;-webkit-margin-end:4px;margin-inline-end:4px}}::slotted([slot=start]){-ms-flex-order:2;order:2}::slotted([slot=secondary]){-ms-flex-order:4;order:4}::slotted([slot=primary]){-ms-flex-order:5;order:5;text-align:end}::slotted([slot=end]){-ms-flex-order:6;order:6;text-align:end}";
const Toolbar = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.childrenStyles = /* @__PURE__ */ new Map();
  }
  componentWillLoad() {
    const buttons = Array.from(this.el.querySelectorAll("ion-buttons"));
    const firstButtons = buttons.find((button) => {
      return button.slot === "start";
    });
    if (firstButtons) {
      firstButtons.classList.add("buttons-first-slot");
    }
    const buttonsReversed = buttons.reverse();
    const lastButtons = buttonsReversed.find((button) => button.slot === "end") || buttonsReversed.find((button) => button.slot === "primary") || buttonsReversed.find((button) => button.slot === "secondary");
    if (lastButtons) {
      lastButtons.classList.add("buttons-last-slot");
    }
  }
  childrenStyle(ev) {
    ev.stopPropagation();
    const tagName = ev.target.tagName;
    const updatedStyles = ev.detail;
    const newStyles = {};
    const childStyles = this.childrenStyles.get(tagName) || {};
    let hasStyleChange = false;
    Object.keys(updatedStyles).forEach((key) => {
      const childKey = `toolbar-${key}`;
      const newValue = updatedStyles[key];
      if (newValue !== childStyles[childKey]) {
        hasStyleChange = true;
      }
      if (newValue) {
        newStyles[childKey] = true;
      }
    });
    if (hasStyleChange) {
      this.childrenStyles.set(tagName, newStyles);
      forceUpdate(this);
    }
  }
  render() {
    const mode = getIonMode$2(this);
    const childStyles = {};
    this.childrenStyles.forEach((value) => {
      Object.assign(childStyles, value);
    });
    return h(Host, { class: Object.assign(Object.assign({}, childStyles), createColorClasses$1(this.color, {
      [mode]: true,
      "in-toolbar": hostContext("ion-toolbar", this.el)
    })) }, h("div", { class: "toolbar-background" }), h("div", { class: "toolbar-container" }, h("slot", { name: "start" }), h("slot", { name: "secondary" }), h("div", { class: "toolbar-content" }, h("slot", null)), h("slot", { name: "primary" }), h("slot", { name: "end" })));
  }
  get el() {
    return this;
  }
  static get style() {
    return {
      ios: toolbarIosCss,
      md: toolbarMdCss
    };
  }
}, [33, "ion-toolbar", {
  "color": [513]
}, [[0, "ionStyle", "childrenStyle"]]]);
function defineCustomElement$1$a() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-toolbar"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-toolbar":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Toolbar);
        }
        break;
    }
  });
}
const defineCustomElement$f = defineCustomElement$1$a;
const defineCustomElement$d = defineCustomElement$u;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const appCss = "html.plt-mobile ion-app{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}html.plt-mobile ion-app [contenteditable]{-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text}ion-app.force-statusbar-padding{--ion-safe-area-top:20px}";
const App = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
  }
  componentDidLoad() {
    {
      rIC(async () => {
        const isHybrid2 = isPlatform(window, "hybrid");
        if (!config.getBoolean("_testing")) {
          import('./_nuxt/index10.f57f5624.mjs').then((module) => module.startTapClick(config));
        }
        if (config.getBoolean("statusTap", isHybrid2)) {
          import('./_nuxt/status-tap.a3169216.mjs').then((module) => module.startStatusTap());
        }
        if (config.getBoolean("inputShims", needInputShims())) {
          const platform = isPlatform(window, "ios") ? "ios" : "android";
          import('./_nuxt/input-shims.44a57a07.mjs').then((module) => module.startInputShims(config, platform));
        }
        const hardwareBackButtonModule = await import('./_nuxt/hardware-back-button.916acb27.mjs');
        if (config.getBoolean("hardwareBackButton", isHybrid2)) {
          hardwareBackButtonModule.startHardwareBackButton();
        } else {
          hardwareBackButtonModule.blockHardwareBackButton();
        }
        Promise.resolve().then(() => focusVisible).then((module) => this.focusVisible = module.startFocusVisible());
      });
    }
  }
  async setFocus(elements) {
    if (this.focusVisible) {
      this.focusVisible.setFocus(elements);
    }
  }
  render() {
    const mode = getIonMode$2(this);
    return h(Host, { class: {
      [mode]: true,
      "ion-page": true,
      "force-statusbar-padding": config.getBoolean("_forceStatusbarPadding")
    } });
  }
  get el() {
    return this;
  }
  static get style() {
    return appCss;
  }
}, [0, "ion-app", {
  "setFocus": [64]
}]);
const needInputShims = () => {
  const needsShimsIOS = isPlatform(window, "ios") && isPlatform(window, "mobile");
  if (needsShimsIOS) {
    return true;
  }
  const isAndroidMobileWeb = isPlatform(window, "android") && isPlatform(window, "mobileweb");
  if (isAndroidMobileWeb) {
    return true;
  }
  return false;
};
const rIC = (callback) => {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 32);
  }
};
function defineCustomElement$1$8() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-app"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-app":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, App);
        }
        break;
    }
  });
}
const defineCustomElement$b = defineCustomElement$1$8;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
var Style;
(function(Style2) {
  Style2["Dark"] = "DARK";
  Style2["Light"] = "LIGHT";
  Style2["Default"] = "DEFAULT";
})(Style || (Style = {}));
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const routeOutletCss = ":host{left:0;right:0;top:0;bottom:0;position:absolute;contain:layout size style;overflow:hidden;z-index:0}";
const RouterOutlet = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.ionNavWillLoad = createEvent(this, "ionNavWillLoad", 7);
    this.ionNavWillChange = createEvent(this, "ionNavWillChange", 3);
    this.ionNavDidChange = createEvent(this, "ionNavDidChange", 3);
    this.gestureOrAnimationInProgress = false;
    this.mode = getIonMode$2(this);
    this.animated = true;
  }
  swipeHandlerChanged() {
    if (this.gesture) {
      this.gesture.enable(this.swipeHandler !== void 0);
    }
  }
  async connectedCallback() {
    const onStart = () => {
      this.gestureOrAnimationInProgress = true;
      if (this.swipeHandler) {
        this.swipeHandler.onStart();
      }
    };
    this.gesture = (await import('./_nuxt/swipe-back.86dc1660.mjs')).createSwipeBackGesture(this.el, () => !this.gestureOrAnimationInProgress && !!this.swipeHandler && this.swipeHandler.canStart(), () => onStart(), (step) => {
      var _a2;
      return (_a2 = this.ani) === null || _a2 === void 0 ? void 0 : _a2.progressStep(step);
    }, (shouldComplete, step, dur) => {
      if (this.ani) {
        this.ani.onFinish(() => {
          this.gestureOrAnimationInProgress = false;
          if (this.swipeHandler) {
            this.swipeHandler.onEnd(shouldComplete);
          }
        }, { oneTimeCallback: true });
        let newStepValue = shouldComplete ? -1e-3 : 1e-3;
        if (!shouldComplete) {
          this.ani.easing("cubic-bezier(1, 0, 0.68, 0.28)");
          newStepValue += getTimeGivenProgression([0, 0], [1, 0], [0.68, 0.28], [1, 1], step)[0];
        } else {
          newStepValue += getTimeGivenProgression([0, 0], [0.32, 0.72], [0, 1], [1, 1], step)[0];
        }
        this.ani.progressEnd(shouldComplete ? 1 : 0, newStepValue, dur);
      } else {
        this.gestureOrAnimationInProgress = false;
      }
    });
    this.swipeHandlerChanged();
  }
  componentWillLoad() {
    this.ionNavWillLoad.emit();
  }
  disconnectedCallback() {
    if (this.gesture) {
      this.gesture.destroy();
      this.gesture = void 0;
    }
  }
  async commit(enteringEl, leavingEl, opts) {
    const unlock = await this.lock();
    let changed = false;
    try {
      changed = await this.transition(enteringEl, leavingEl, opts);
    } catch (e) {
      console.error(e);
    }
    unlock();
    return changed;
  }
  async setRouteId(id, params, direction, animation2) {
    const changed = await this.setRoot(id, params, {
      duration: direction === "root" ? 0 : void 0,
      direction: direction === "back" ? "back" : "forward",
      animationBuilder: animation2
    });
    return {
      changed,
      element: this.activeEl
    };
  }
  async getRouteId() {
    const active = this.activeEl;
    return active ? {
      id: active.tagName,
      element: active,
      params: this.activeParams
    } : void 0;
  }
  async setRoot(component, params, opts) {
    if (this.activeComponent === component && shallowEqualStringMap(params, this.activeParams)) {
      return false;
    }
    const leavingEl = this.activeEl;
    const enteringEl = await attachComponent(this.delegate, this.el, component, ["ion-page", "ion-page-invisible"], params);
    this.activeComponent = component;
    this.activeEl = enteringEl;
    this.activeParams = params;
    await this.commit(enteringEl, leavingEl, opts);
    await detachComponent(this.delegate, leavingEl);
    return true;
  }
  async transition(enteringEl, leavingEl, opts = {}) {
    if (leavingEl === enteringEl) {
      return false;
    }
    this.ionNavWillChange.emit();
    const { el, mode } = this;
    const animated = this.animated && config.getBoolean("animated", true);
    const animationBuilder = opts.animationBuilder || this.animation || config.get("navAnimation");
    await transition(Object.assign(Object.assign({
      mode,
      animated,
      enteringEl,
      leavingEl,
      baseEl: el,
      progressCallback: opts.progressAnimation ? (ani) => {
        if (ani !== void 0 && !this.gestureOrAnimationInProgress) {
          this.gestureOrAnimationInProgress = true;
          ani.onFinish(() => {
            this.gestureOrAnimationInProgress = false;
            if (this.swipeHandler) {
              this.swipeHandler.onEnd(false);
            }
          }, { oneTimeCallback: true });
          ani.progressEnd(0, 0, 0);
        } else {
          this.ani = ani;
        }
      } : void 0
    }, opts), { animationBuilder }));
    this.ionNavDidChange.emit();
    return true;
  }
  async lock() {
    const p = this.waitPromise;
    let resolve;
    this.waitPromise = new Promise((r) => resolve = r);
    if (p !== void 0) {
      await p;
    }
    return resolve;
  }
  render() {
    return h("slot", null);
  }
  get el() {
    return this;
  }
  static get watchers() {
    return {
      "swipeHandler": ["swipeHandlerChanged"]
    };
  }
  static get style() {
    return routeOutletCss;
  }
}, [1, "ion-router-outlet", {
  "mode": [1025],
  "delegate": [16],
  "animated": [4],
  "animation": [16],
  "swipeHandler": [16],
  "commit": [64],
  "setRouteId": [64],
  "getRouteId": [64]
}]);
function defineCustomElement$1$4() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-router-outlet"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-router-outlet":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, RouterOutlet);
        }
        break;
    }
  });
}
const defineCustomElement$5 = defineCustomElement$1$4;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const tabBarIosCss = ":host{padding-left:var(--ion-safe-area-left);padding-right:var(--ion-safe-area-right);display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;width:auto;padding-bottom:var(--ion-safe-area-bottom, 0);border-top:var(--border);background:var(--background);color:var(--color);text-align:center;contain:strict;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;z-index:10;-webkit-box-sizing:content-box !important;box-sizing:content-box !important}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--ion-safe-area-left);padding-inline-start:var(--ion-safe-area-left);-webkit-padding-end:var(--ion-safe-area-right);padding-inline-end:var(--ion-safe-area-right)}}:host(.ion-color) ::slotted(ion-tab-button){--background-focused:var(--ion-color-shade);--color-selected:var(--ion-color-contrast)}:host(.ion-color) ::slotted(.tab-selected){color:var(--ion-color-contrast)}:host(.ion-color),:host(.ion-color) ::slotted(ion-tab-button){color:rgba(var(--ion-color-contrast-rgb), 0.7)}:host(.ion-color),:host(.ion-color) ::slotted(ion-tab-button){background:var(--ion-color-base)}:host(.ion-color) ::slotted(ion-tab-button.ion-focused),:host(.tab-bar-translucent) ::slotted(ion-tab-button.ion-focused){background:var(--background-focused)}:host(.tab-bar-translucent) ::slotted(ion-tab-button){background:transparent}:host([slot=top]){padding-top:var(--ion-safe-area-top, 0);padding-bottom:0;border-top:0;border-bottom:var(--border)}:host(.tab-bar-hidden){display:none !important}:host{--background:var(--ion-tab-bar-background, var(--ion-color-step-50, #f7f7f7));--background-focused:var(--ion-tab-bar-background-focused, #e0e0e0);--border:0.55px solid var(--ion-tab-bar-border-color, var(--ion-border-color, var(--ion-color-step-150, rgba(0, 0, 0, 0.2))));--color:var(--ion-tab-bar-color, var(--ion-color-step-400, #999999));--color-selected:var(--ion-tab-bar-color-selected, var(--ion-color-primary, #3880ff));height:50px}@supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))){:host(.tab-bar-translucent){--background:rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.8);-webkit-backdrop-filter:saturate(210%) blur(20px);backdrop-filter:saturate(210%) blur(20px)}:host(.ion-color.tab-bar-translucent){background:rgba(var(--ion-color-base-rgb), 0.8)}:host(.tab-bar-translucent) ::slotted(ion-tab-button.ion-focused){background:rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.6)}}";
const tabBarMdCss = ":host{padding-left:var(--ion-safe-area-left);padding-right:var(--ion-safe-area-right);display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;width:auto;padding-bottom:var(--ion-safe-area-bottom, 0);border-top:var(--border);background:var(--background);color:var(--color);text-align:center;contain:strict;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;z-index:10;-webkit-box-sizing:content-box !important;box-sizing:content-box !important}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--ion-safe-area-left);padding-inline-start:var(--ion-safe-area-left);-webkit-padding-end:var(--ion-safe-area-right);padding-inline-end:var(--ion-safe-area-right)}}:host(.ion-color) ::slotted(ion-tab-button){--background-focused:var(--ion-color-shade);--color-selected:var(--ion-color-contrast)}:host(.ion-color) ::slotted(.tab-selected){color:var(--ion-color-contrast)}:host(.ion-color),:host(.ion-color) ::slotted(ion-tab-button){color:rgba(var(--ion-color-contrast-rgb), 0.7)}:host(.ion-color),:host(.ion-color) ::slotted(ion-tab-button){background:var(--ion-color-base)}:host(.ion-color) ::slotted(ion-tab-button.ion-focused),:host(.tab-bar-translucent) ::slotted(ion-tab-button.ion-focused){background:var(--background-focused)}:host(.tab-bar-translucent) ::slotted(ion-tab-button){background:transparent}:host([slot=top]){padding-top:var(--ion-safe-area-top, 0);padding-bottom:0;border-top:0;border-bottom:var(--border)}:host(.tab-bar-hidden){display:none !important}:host{--background:var(--ion-tab-bar-background, var(--ion-background-color, #fff));--background-focused:var(--ion-tab-bar-background-focused, #e0e0e0);--border:1px solid var(--ion-tab-bar-border-color, var(--ion-border-color, var(--ion-color-step-150, rgba(0, 0, 0, 0.07))));--color:var(--ion-tab-bar-color, var(--ion-color-step-600, #666666));--color-selected:var(--ion-tab-bar-color-selected, var(--ion-color-primary, #3880ff));height:56px}";
const TabBar = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.ionTabBarChanged = createEvent(this, "ionTabBarChanged", 7);
    this.keyboardCtrl = null;
    this.keyboardVisible = false;
    this.translucent = false;
  }
  selectedTabChanged() {
    if (this.selectedTab !== void 0) {
      this.ionTabBarChanged.emit({
        tab: this.selectedTab
      });
    }
  }
  componentWillLoad() {
    this.selectedTabChanged();
  }
  connectedCallback() {
    this.keyboardCtrl = createKeyboardController();
  }
  disconnectedCallback() {
    if (this.keyboardCtrl) {
      this.keyboardCtrl.destroy();
    }
  }
  render() {
    const { color, translucent, keyboardVisible } = this;
    const mode = getIonMode$2(this);
    const shouldHide = keyboardVisible && this.el.getAttribute("slot") !== "top";
    return h(Host, { role: "tablist", "aria-hidden": shouldHide ? "true" : null, class: createColorClasses$1(color, {
      [mode]: true,
      "tab-bar-translucent": translucent,
      "tab-bar-hidden": shouldHide
    }) }, h("slot", null));
  }
  get el() {
    return this;
  }
  static get watchers() {
    return {
      "selectedTab": ["selectedTabChanged"]
    };
  }
  static get style() {
    return {
      ios: tabBarIosCss,
      md: tabBarMdCss
    };
  }
}, [33, "ion-tab-bar", {
  "color": [513],
  "selectedTab": [1, "selected-tab"],
  "translucent": [4],
  "keyboardVisible": [32]
}]);
function defineCustomElement$1$3() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-tab-bar"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-tab-bar":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, TabBar);
        }
        break;
    }
  });
}
const defineCustomElement$4 = defineCustomElement$1$3;
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const tabButtonIosCss = ':host{--ripple-color:var(--color-selected);--background-focused-opacity:1;-ms-flex:1;flex:1;-ms-flex-direction:column;flex-direction:column;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;height:100%;outline:none;background:var(--background);color:var(--color)}.button-native{border-radius:inherit;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;display:-ms-flexbox;display:flex;position:relative;-ms-flex-direction:inherit;flex-direction:inherit;-ms-flex-align:inherit;align-items:inherit;-ms-flex-pack:inherit;justify-content:inherit;width:100%;height:100%;border:0;outline:none;background:transparent;text-decoration:none;cursor:pointer;overflow:hidden;-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-user-drag:none}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.button-native{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.button-native::after{left:0;right:0;top:0;bottom:0;position:absolute;content:"";opacity:0}.button-inner{display:-ms-flexbox;display:flex;position:relative;-ms-flex-flow:inherit;flex-flow:inherit;-ms-flex-align:inherit;align-items:inherit;-ms-flex-pack:inherit;justify-content:inherit;width:100%;height:100%;z-index:1}:host(.ion-focused) .button-native{color:var(--color-focused)}:host(.ion-focused) .button-native::after{background:var(--background-focused);opacity:var(--background-focused-opacity)}@media (any-hover: hover){a:hover{color:var(--color-selected)}}:host(.tab-selected){color:var(--color-selected)}:host(.tab-hidden){display:none !important}:host(.tab-disabled){pointer-events:none;opacity:0.4}::slotted(ion-label),::slotted(ion-icon){display:block;-ms-flex-item-align:center;align-self:center;max-width:100%;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;-webkit-box-sizing:border-box;box-sizing:border-box}::slotted(ion-label){-ms-flex-order:0;order:0}::slotted(ion-icon){-ms-flex-order:-1;order:-1;height:1em}:host(.tab-has-label-only) ::slotted(ion-label){white-space:normal}::slotted(ion-badge){-webkit-box-sizing:border-box;box-sizing:border-box;position:absolute;z-index:1}:host(.tab-layout-icon-start){-ms-flex-direction:row;flex-direction:row}:host(.tab-layout-icon-end){-ms-flex-direction:row-reverse;flex-direction:row-reverse}:host(.tab-layout-icon-bottom){-ms-flex-direction:column-reverse;flex-direction:column-reverse}:host(.tab-layout-icon-hide) ::slotted(ion-icon){display:none}:host(.tab-layout-label-hide) ::slotted(ion-label){display:none}ion-ripple-effect{color:var(--ripple-color)}:host{--padding-top:0;--padding-end:2px;--padding-bottom:0;--padding-start:2px;max-width:240px;font-size:10px}::slotted(ion-badge){padding-left:6px;padding-right:6px;padding-top:1px;padding-bottom:1px;left:calc(50% + 6px);top:4px;height:auto;font-size:12px;line-height:16px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(ion-badge){padding-left:unset;padding-right:unset;-webkit-padding-start:6px;padding-inline-start:6px;-webkit-padding-end:6px;padding-inline-end:6px}}[dir=rtl] ::slotted(ion-badge),:host-context([dir=rtl]) ::slotted(ion-badge){left:unset;right:unset;right:calc(50% + 6px)}::slotted(ion-icon){margin-top:2px;margin-bottom:2px;font-size:30px}::slotted(ion-icon::before){vertical-align:top}::slotted(ion-label){margin-top:0;margin-bottom:1px;min-height:11px;font-weight:500}:host(.tab-has-label-only) ::slotted(ion-label){margin-left:0;margin-right:0;margin-top:2px;margin-bottom:2px;font-size:12px;font-size:14px;line-height:1.1}:host(.tab-layout-icon-end) ::slotted(ion-label),:host(.tab-layout-icon-start) ::slotted(ion-label),:host(.tab-layout-icon-hide) ::slotted(ion-label){margin-top:2px;margin-bottom:2px;font-size:14px;line-height:1.1}:host(.tab-layout-icon-end) ::slotted(ion-icon),:host(.tab-layout-icon-start) ::slotted(ion-icon){min-width:24px;height:26px;margin-top:2px;margin-bottom:1px;font-size:24px}:host(.tab-layout-icon-bottom) ::slotted(ion-badge){left:calc(50% + 12px)}:host-context([dir=rtl]):host(.tab-layout-icon-bottom) ::slotted(ion-badge),:host-context([dir=rtl]).tab-layout-icon-bottom ::slotted(ion-badge){left:unset;right:unset;right:calc(50% + 12px)}:host(.tab-layout-icon-bottom) ::slotted(ion-icon){margin-top:0;margin-bottom:1px}:host(.tab-layout-icon-bottom) ::slotted(ion-label){margin-top:4px}:host(.tab-layout-icon-start) ::slotted(ion-badge),:host(.tab-layout-icon-end) ::slotted(ion-badge){left:calc(50% + 35px);top:10px}:host-context([dir=rtl]):host(.tab-layout-icon-start) ::slotted(ion-badge),:host-context([dir=rtl]).tab-layout-icon-start ::slotted(ion-badge),:host-context([dir=rtl]):host(.tab-layout-icon-end) ::slotted(ion-badge),:host-context([dir=rtl]).tab-layout-icon-end ::slotted(ion-badge){left:unset;right:unset;right:calc(50% + 35px)}:host(.tab-layout-icon-hide) ::slotted(ion-badge),:host(.tab-has-label-only) ::slotted(ion-badge){left:calc(50% + 30px);top:10px}:host-context([dir=rtl]):host(.tab-layout-icon-hide) ::slotted(ion-badge),:host-context([dir=rtl]).tab-layout-icon-hide ::slotted(ion-badge),:host-context([dir=rtl]):host(.tab-has-label-only) ::slotted(ion-badge),:host-context([dir=rtl]).tab-has-label-only ::slotted(ion-badge){left:unset;right:unset;right:calc(50% + 30px)}:host(.tab-layout-label-hide) ::slotted(ion-badge),:host(.tab-has-icon-only) ::slotted(ion-badge){top:10px}:host(.tab-layout-label-hide) ::slotted(ion-icon){margin-left:0;margin-right:0;margin-top:0;margin-bottom:0}';
const tabButtonMdCss = ':host{--ripple-color:var(--color-selected);--background-focused-opacity:1;-ms-flex:1;flex:1;-ms-flex-direction:column;flex-direction:column;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;height:100%;outline:none;background:var(--background);color:var(--color)}.button-native{border-radius:inherit;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;display:-ms-flexbox;display:flex;position:relative;-ms-flex-direction:inherit;flex-direction:inherit;-ms-flex-align:inherit;align-items:inherit;-ms-flex-pack:inherit;justify-content:inherit;width:100%;height:100%;border:0;outline:none;background:transparent;text-decoration:none;cursor:pointer;overflow:hidden;-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-user-drag:none}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.button-native{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.button-native::after{left:0;right:0;top:0;bottom:0;position:absolute;content:"";opacity:0}.button-inner{display:-ms-flexbox;display:flex;position:relative;-ms-flex-flow:inherit;flex-flow:inherit;-ms-flex-align:inherit;align-items:inherit;-ms-flex-pack:inherit;justify-content:inherit;width:100%;height:100%;z-index:1}:host(.ion-focused) .button-native{color:var(--color-focused)}:host(.ion-focused) .button-native::after{background:var(--background-focused);opacity:var(--background-focused-opacity)}@media (any-hover: hover){a:hover{color:var(--color-selected)}}:host(.tab-selected){color:var(--color-selected)}:host(.tab-hidden){display:none !important}:host(.tab-disabled){pointer-events:none;opacity:0.4}::slotted(ion-label),::slotted(ion-icon){display:block;-ms-flex-item-align:center;align-self:center;max-width:100%;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;-webkit-box-sizing:border-box;box-sizing:border-box}::slotted(ion-label){-ms-flex-order:0;order:0}::slotted(ion-icon){-ms-flex-order:-1;order:-1;height:1em}:host(.tab-has-label-only) ::slotted(ion-label){white-space:normal}::slotted(ion-badge){-webkit-box-sizing:border-box;box-sizing:border-box;position:absolute;z-index:1}:host(.tab-layout-icon-start){-ms-flex-direction:row;flex-direction:row}:host(.tab-layout-icon-end){-ms-flex-direction:row-reverse;flex-direction:row-reverse}:host(.tab-layout-icon-bottom){-ms-flex-direction:column-reverse;flex-direction:column-reverse}:host(.tab-layout-icon-hide) ::slotted(ion-icon){display:none}:host(.tab-layout-label-hide) ::slotted(ion-label){display:none}ion-ripple-effect{color:var(--ripple-color)}:host{--padding-top:0;--padding-end:12px;--padding-bottom:0;--padding-start:12px;max-width:168px;font-size:12px;font-weight:normal;letter-spacing:0.03em}::slotted(ion-label){margin-left:0;margin-right:0;margin-top:2px;margin-bottom:2px;text-transform:none}::slotted(ion-icon){margin-left:0;margin-right:0;margin-top:16px;margin-bottom:16px;-webkit-transform-origin:center center;transform-origin:center center;font-size:22px}[dir=rtl] ::slotted(ion-icon),:host-context([dir=rtl]) ::slotted(ion-icon){-webkit-transform-origin:calc(100% - center) center;transform-origin:calc(100% - center) center}::slotted(ion-badge){border-radius:8px;padding-left:2px;padding-right:2px;padding-top:3px;padding-bottom:2px;left:calc(50% + 6px);top:8px;min-width:12px;font-size:8px;font-weight:normal}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){::slotted(ion-badge){padding-left:unset;padding-right:unset;-webkit-padding-start:2px;padding-inline-start:2px;-webkit-padding-end:2px;padding-inline-end:2px}}[dir=rtl] ::slotted(ion-badge),:host-context([dir=rtl]) ::slotted(ion-badge){left:unset;right:unset;right:calc(50% + 6px)}::slotted(ion-badge:empty){display:block;min-width:8px;height:8px}:host(.tab-layout-icon-top) ::slotted(ion-icon){margin-top:6px;margin-bottom:2px}:host(.tab-layout-icon-top) ::slotted(ion-label){margin-top:0;margin-bottom:6px}:host(.tab-layout-icon-bottom) ::slotted(ion-badge){left:70%;top:8px}:host-context([dir=rtl]):host(.tab-layout-icon-bottom) ::slotted(ion-badge),:host-context([dir=rtl]).tab-layout-icon-bottom ::slotted(ion-badge){left:unset;right:unset;right:70%}:host(.tab-layout-icon-bottom) ::slotted(ion-icon){margin-top:0;margin-bottom:6px}:host(.tab-layout-icon-bottom) ::slotted(ion-label){margin-top:6px;margin-bottom:0}:host(.tab-layout-icon-start) ::slotted(ion-badge),:host(.tab-layout-icon-end) ::slotted(ion-badge){left:80%;top:16px}:host-context([dir=rtl]):host(.tab-layout-icon-start) ::slotted(ion-badge),:host-context([dir=rtl]).tab-layout-icon-start ::slotted(ion-badge),:host-context([dir=rtl]):host(.tab-layout-icon-end) ::slotted(ion-badge),:host-context([dir=rtl]).tab-layout-icon-end ::slotted(ion-badge){left:unset;right:unset;right:80%}:host(.tab-layout-icon-start) ::slotted(ion-icon){margin-right:6px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host(.tab-layout-icon-start) ::slotted(ion-icon){margin-right:unset;-webkit-margin-end:6px;margin-inline-end:6px}}:host(.tab-layout-icon-end) ::slotted(ion-icon){margin-left:6px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){:host(.tab-layout-icon-end) ::slotted(ion-icon){margin-left:unset;-webkit-margin-start:6px;margin-inline-start:6px}}:host(.tab-layout-icon-hide) ::slotted(ion-badge),:host(.tab-has-label-only) ::slotted(ion-badge){left:70%;top:16px}:host-context([dir=rtl]):host(.tab-layout-icon-hide) ::slotted(ion-badge),:host-context([dir=rtl]).tab-layout-icon-hide ::slotted(ion-badge),:host-context([dir=rtl]):host(.tab-has-label-only) ::slotted(ion-badge),:host-context([dir=rtl]).tab-has-label-only ::slotted(ion-badge){left:unset;right:unset;right:70%}:host(.tab-layout-icon-hide) ::slotted(ion-label),:host(.tab-has-label-only) ::slotted(ion-label){margin-top:0;margin-bottom:0}:host(.tab-layout-label-hide) ::slotted(ion-badge),:host(.tab-has-icon-only) ::slotted(ion-badge){top:16px}:host(.tab-layout-label-hide) ::slotted(ion-icon),:host(.tab-has-icon-only) ::slotted(ion-icon){margin-top:0;margin-bottom:0;font-size:24px}';
const TabButton = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.ionTabButtonClick = createEvent(this, "ionTabButtonClick", 7);
    this.inheritedAttributes = {};
    this.disabled = false;
    this.selected = false;
    this.onKeyUp = (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        this.selectTab(ev);
      }
    };
    this.onClick = (ev) => {
      this.selectTab(ev);
    };
  }
  onTabBarChanged(ev) {
    const dispatchedFrom = ev.target;
    const parent = this.el.parentElement;
    if (ev.composedPath().includes(parent) || (dispatchedFrom === null || dispatchedFrom === void 0 ? void 0 : dispatchedFrom.contains(this.el))) {
      this.selected = this.tab === ev.detail.tab;
    }
  }
  componentWillLoad() {
    this.inheritedAttributes = Object.assign({}, inheritAttributes$2(this.el, ["aria-label"]));
    if (this.layout === void 0) {
      this.layout = config.get("tabButtonLayout", "icon-top");
    }
  }
  selectTab(ev) {
    if (this.tab !== void 0) {
      if (!this.disabled) {
        this.ionTabButtonClick.emit({
          tab: this.tab,
          href: this.href,
          selected: this.selected
        });
      }
      ev.preventDefault();
    }
  }
  get hasLabel() {
    return !!this.el.querySelector("ion-label");
  }
  get hasIcon() {
    return !!this.el.querySelector("ion-icon");
  }
  render() {
    const { disabled, hasIcon, hasLabel, href, rel, target, layout, selected, tab, inheritedAttributes } = this;
    const mode = getIonMode$2(this);
    const attrs = {
      download: this.download,
      href,
      rel,
      target
    };
    return h(Host, { onClick: this.onClick, onKeyup: this.onKeyUp, id: tab !== void 0 ? `tab-button-${tab}` : null, class: {
      [mode]: true,
      "tab-selected": selected,
      "tab-disabled": disabled,
      "tab-has-label": hasLabel,
      "tab-has-icon": hasIcon,
      "tab-has-label-only": hasLabel && !hasIcon,
      "tab-has-icon-only": hasIcon && !hasLabel,
      [`tab-layout-${layout}`]: true,
      "ion-activatable": true,
      "ion-selectable": true,
      "ion-focusable": true
    } }, h("a", Object.assign({}, attrs, { class: "button-native", part: "native", role: "tab", "aria-selected": selected ? "true" : null, "aria-disabled": disabled ? "true" : null, tabindex: disabled ? "-1" : void 0 }, inheritedAttributes), h("span", { class: "button-inner" }, h("slot", null)), mode === "md" && h("ion-ripple-effect", { type: "unbounded" })));
  }
  get el() {
    return this;
  }
  static get style() {
    return {
      ios: tabButtonIosCss,
      md: tabButtonMdCss
    };
  }
}, [33, "ion-tab-button", {
  "disabled": [4],
  "download": [1],
  "href": [1],
  "rel": [1],
  "layout": [1025],
  "selected": [1028],
  "tab": [1],
  "target": [1]
}, [[8, "ionTabBarChanged", "onTabBarChanged"]]]);
function defineCustomElement$1$2() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-tab-button", "ion-ripple-effect"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-tab-button":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, TabButton);
        }
        break;
      case "ion-ripple-effect":
        if (!customElements.get(tagName)) {
          defineCustomElement$1v();
        }
        break;
    }
  });
}
const defineCustomElement$3 = defineCustomElement$1$2;
const getIconMap = () => {
  {
    return /* @__PURE__ */ new Map();
  }
};
const getUrl = (i) => {
  let url = getSrc(i.src);
  if (url) {
    return url;
  }
  url = getName(i.name, i.icon, i.mode, i.ios, i.md);
  if (url) {
    return getNamedUrl(url);
  }
  if (i.icon) {
    url = getSrc(i.icon);
    if (url) {
      return url;
    }
    url = getSrc(i.icon[i.mode]);
    if (url) {
      return url;
    }
  }
  return null;
};
const getNamedUrl = (iconName) => {
  const url = getIconMap().get(iconName);
  if (url) {
    return url;
  }
  return getAssetPath(`svg/${iconName}.svg`);
};
const getName = (iconName, icon, mode, ios, md) => {
  mode = (mode && toLower(mode)) === "ios" ? "ios" : "md";
  if (ios && mode === "ios") {
    iconName = toLower(ios);
  } else if (md && mode === "md") {
    iconName = toLower(md);
  } else {
    if (!iconName && icon && !isSrc(icon)) {
      iconName = icon;
    }
    if (isStr(iconName)) {
      iconName = toLower(iconName);
    }
  }
  if (!isStr(iconName) || iconName.trim() === "") {
    return null;
  }
  const invalidChars = iconName.replace(/[a-z]|-|\d/gi, "");
  if (invalidChars !== "") {
    return null;
  }
  return iconName;
};
const getSrc = (src) => {
  if (isStr(src)) {
    src = src.trim();
    if (isSrc(src)) {
      return src;
    }
  }
  return null;
};
const isSrc = (str) => str.length > 0 && /(\/|\.)/.test(str);
const isStr = (val) => typeof val === "string";
const toLower = (val) => val.toLowerCase();
const inheritAttributes = (el, attributes = []) => {
  const attributeObject = {};
  attributes.forEach((attr) => {
    if (el.hasAttribute(attr)) {
      const value = el.getAttribute(attr);
      if (value !== null) {
        attributeObject[attr] = el.getAttribute(attr);
      }
      el.removeAttribute(attr);
    }
  });
  return attributeObject;
};
const isRTL = (hostEl) => {
  if (hostEl) {
    if (hostEl.dir !== "") {
      return hostEl.dir.toLowerCase() === "rtl";
    }
  }
  return (document === null || document === void 0 ? void 0 : document.dir.toLowerCase()) === "rtl";
};
const validateContent = (svgContent) => {
  const div = document.createElement("div");
  div.innerHTML = svgContent;
  for (let i = div.childNodes.length - 1; i >= 0; i--) {
    if (div.childNodes[i].nodeName.toLowerCase() !== "svg") {
      div.removeChild(div.childNodes[i]);
    }
  }
  const svgElm = div.firstElementChild;
  if (svgElm && svgElm.nodeName.toLowerCase() === "svg") {
    const svgClass = svgElm.getAttribute("class") || "";
    svgElm.setAttribute("class", (svgClass + " s-ion-icon").trim());
    if (isValid(svgElm)) {
      return div.innerHTML;
    }
  }
  return "";
};
const isValid = (elm) => {
  if (elm.nodeType === 1) {
    if (elm.nodeName.toLowerCase() === "script") {
      return false;
    }
    for (let i = 0; i < elm.attributes.length; i++) {
      const name = elm.attributes[i].name;
      if (isStr(name) && name.toLowerCase().indexOf("on") === 0) {
        return false;
      }
    }
    for (let i = 0; i < elm.childNodes.length; i++) {
      if (!isValid(elm.childNodes[i])) {
        return false;
      }
    }
  }
  return true;
};
const ioniconContent = /* @__PURE__ */ new Map();
const requests = /* @__PURE__ */ new Map();
const getSvgContent = (url, sanitize) => {
  let req = requests.get(url);
  if (!req) {
    if (typeof fetch !== "undefined" && false) {
      req = fetch(url).then((rsp) => {
        if (rsp.ok) {
          return rsp.text().then((svgContent) => {
            if (svgContent && sanitize !== false) {
              svgContent = validateContent(svgContent);
            }
            ioniconContent.set(url, svgContent || "");
          });
        }
        ioniconContent.set(url, "");
      });
      requests.set(url, req);
    } else {
      ioniconContent.set(url, "");
      return Promise.resolve();
    }
  }
  return req;
};
const iconCss = ":host{display:inline-block;width:1em;height:1em;contain:strict;fill:currentColor;-webkit-box-sizing:content-box !important;box-sizing:content-box !important}:host .ionicon{stroke:currentColor}.ionicon-fill-none{fill:none}.ionicon-stroke-width{stroke-width:32px;stroke-width:var(--ionicon-stroke-width, 32px)}.icon-inner,.ionicon,svg{display:block;height:100%;width:100%}:host(.flip-rtl) .icon-inner{-webkit-transform:scaleX(-1);transform:scaleX(-1)}:host(.icon-small){font-size:18px !important}:host(.icon-large){font-size:32px !important}:host(.ion-color){color:var(--ion-color-base) !important}:host(.ion-color-primary){--ion-color-base:var(--ion-color-primary, #3880ff)}:host(.ion-color-secondary){--ion-color-base:var(--ion-color-secondary, #0cd1e8)}:host(.ion-color-tertiary){--ion-color-base:var(--ion-color-tertiary, #f4a942)}:host(.ion-color-success){--ion-color-base:var(--ion-color-success, #10dc60)}:host(.ion-color-warning){--ion-color-base:var(--ion-color-warning, #ffce00)}:host(.ion-color-danger){--ion-color-base:var(--ion-color-danger, #f14141)}:host(.ion-color-light){--ion-color-base:var(--ion-color-light, #f4f5f8)}:host(.ion-color-medium){--ion-color-base:var(--ion-color-medium, #989aa2)}:host(.ion-color-dark){--ion-color-base:var(--ion-color-dark, #222428)}";
let parser;
const Icon = /* @__PURE__ */ proxyCustomElement(class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.iconName = null;
    this.inheritedAttributes = {};
    this.isVisible = false;
    this.mode = getIonMode();
    this.lazy = false;
    this.sanitize = true;
    this.hasAriaHidden = () => {
      const { el } = this;
      return el.hasAttribute("aria-hidden") && el.getAttribute("aria-hidden") === "true";
    };
  }
  componentWillLoad() {
    this.inheritedAttributes = inheritAttributes(this.el, ["aria-label"]);
  }
  connectedCallback() {
    this.waitUntilVisible(this.el, "50px", () => {
      this.isVisible = true;
      this.loadIcon();
    });
  }
  disconnectedCallback() {
    if (this.io) {
      this.io.disconnect();
      this.io = void 0;
    }
  }
  waitUntilVisible(el, rootMargin, cb) {
    if (this.lazy && false) {
      const io = this.io = new window.IntersectionObserver((data) => {
        if (data[0].isIntersecting) {
          io.disconnect();
          this.io = void 0;
          cb();
        }
      }, { rootMargin });
      io.observe(el);
    } else {
      cb();
    }
  }
  loadIcon() {
    if (this.isVisible) {
      if (!parser) {
        parser = new DOMParser();
      }
      const url = getUrl(this);
      if (url) {
        if (ioniconContent.has(url)) {
          this.svgContent = ioniconContent.get(url);
        } else if (url.startsWith("data:")) {
          const doc2 = parser.parseFromString(url, "text/html");
          const svgEl = doc2.body.querySelector("svg");
          if (svgEl !== null) {
            this.svgContent = svgEl.outerHTML;
          } else {
            this.svgContent = "";
          }
        } else {
          getSvgContent(url, this.sanitize).then(() => this.svgContent = ioniconContent.get(url));
        }
      }
    }
    const label = this.iconName = getName(this.name, this.icon, this.mode, this.ios, this.md);
    if (label) {
      this.ariaLabel = label.replace(/\-/g, " ");
    }
  }
  render() {
    const { iconName, ariaLabel, el, inheritedAttributes } = this;
    const mode = this.mode || "md";
    const flipRtl = this.flipRtl || iconName && (iconName.indexOf("arrow") > -1 || iconName.indexOf("chevron") > -1) && this.flipRtl !== false;
    return h(Host, Object.assign({ "aria-label": ariaLabel !== void 0 && !this.hasAriaHidden() ? ariaLabel : null, role: "img", class: Object.assign(Object.assign({ [mode]: true }, createColorClasses(this.color)), { [`icon-${this.size}`]: !!this.size, "flip-rtl": !!flipRtl && isRTL(el) }) }, inheritedAttributes), this.svgContent ? h("div", { class: "icon-inner", innerHTML: this.svgContent }) : h("div", { class: "icon-inner" }));
  }
  static get assetsDirs() {
    return ["svg"];
  }
  get el() {
    return this;
  }
  static get watchers() {
    return {
      "name": ["loadIcon"],
      "src": ["loadIcon"],
      "icon": ["loadIcon"]
    };
  }
  static get style() {
    return iconCss;
  }
}, [1, "ion-icon", {
  "mode": [1025],
  "color": [1],
  "ios": [1],
  "md": [1],
  "flipRtl": [4, "flip-rtl"],
  "name": [513],
  "src": [1],
  "icon": [8],
  "size": [1],
  "lazy": [4],
  "sanitize": [4],
  "svgContent": [32],
  "isVisible": [32],
  "ariaLabel": [32]
}]);
const getIonMode = () => "md";
const createColorClasses = (color) => {
  return color ? {
    "ion-color": true,
    [`ion-color-${color}`]: true
  } : null;
};
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components2 = ["ion-icon"];
  components2.forEach((tagName) => {
    switch (tagName) {
      case "ion-icon":
        if (!customElements.get(tagName)) {
          customElements.define(tagName, Icon);
        }
        break;
    }
  });
}
const defineCustomElement = defineCustomElement$1;
const UPDATE_VALUE_EVENT = "update:modelValue";
const MODEL_VALUE = "modelValue";
const ROUTER_LINK_VALUE = "routerLink";
const NAV_MANAGER = "navManager";
const ROUTER_PROP_PREFIX = "router";
const EMPTY_PROP = Symbol();
const DEFAULT_EMPTY_PROP = { default: EMPTY_PROP };
const getComponentClasses = (classes) => {
  return (classes === null || classes === void 0 ? void 0 : classes.split(" ")) || [];
};
const getElementClasses = (ref2, componentClasses, defaultClasses = []) => {
  var _a2;
  return [...Array.from(((_a2 = ref2.value) === null || _a2 === void 0 ? void 0 : _a2.classList) || []), ...defaultClasses].filter((c, i, self) => !componentClasses.has(c) && self.indexOf(c) === i);
};
const defineContainer = (name, defineCustomElement2, componentProps = [], modelProp, modelUpdateEvent, externalModelUpdateEvent) => {
  if (defineCustomElement2 !== void 0) {
    defineCustomElement2();
  }
  const Container = defineComponent((props, { attrs, slots, emit }) => {
    var _a2;
    let modelPropValue = props[modelProp];
    const containerRef = ref();
    const classes = new Set(getComponentClasses(attrs.class));
    const onVnodeBeforeMount = (vnode) => {
      if (vnode.el) {
        const eventsNames = Array.isArray(modelUpdateEvent) ? modelUpdateEvent : [modelUpdateEvent];
        eventsNames.forEach((eventName) => {
          vnode.el.addEventListener(eventName.toLowerCase(), (e) => {
            modelPropValue = (e === null || e === void 0 ? void 0 : e.target)[modelProp];
            emit(UPDATE_VALUE_EVENT, modelPropValue);
            if (externalModelUpdateEvent) {
              emit(externalModelUpdateEvent, e);
            }
          });
        });
      }
    };
    const currentInstance = getCurrentInstance();
    const hasRouter = (_a2 = currentInstance === null || currentInstance === void 0 ? void 0 : currentInstance.appContext) === null || _a2 === void 0 ? void 0 : _a2.provides[NAV_MANAGER];
    const navManager = hasRouter ? inject(NAV_MANAGER) : void 0;
    const handleRouterLink = (ev) => {
      const { routerLink } = props;
      if (routerLink === EMPTY_PROP)
        return;
      if (navManager !== void 0) {
        let navigationPayload = { event: ev };
        for (const key in props) {
          const value = props[key];
          if (props.hasOwnProperty(key) && key.startsWith(ROUTER_PROP_PREFIX) && value !== EMPTY_PROP) {
            navigationPayload[key] = value;
          }
        }
        navManager.navigate(navigationPayload);
      } else {
        console.warn("Tried to navigate, but no router was found. Make sure you have mounted Vue Router.");
      }
    };
    return () => {
      modelPropValue = props[modelProp];
      getComponentClasses(attrs.class).forEach((value) => {
        classes.add(value);
      });
      const oldClick = props.onClick;
      const handleClick = (ev) => {
        if (oldClick !== void 0) {
          oldClick(ev);
        }
        if (!ev.defaultPrevented) {
          handleRouterLink(ev);
        }
      };
      let propsToAdd = {
        ref: containerRef,
        class: getElementClasses(containerRef, classes),
        onClick: handleClick,
        onVnodeBeforeMount: modelUpdateEvent ? onVnodeBeforeMount : void 0
      };
      for (const key in props) {
        const value = props[key];
        if (props.hasOwnProperty(key) && value !== EMPTY_PROP) {
          propsToAdd[key] = value;
        }
      }
      if (modelProp) {
        if (props[MODEL_VALUE] !== EMPTY_PROP) {
          propsToAdd = Object.assign(Object.assign({}, propsToAdd), { [modelProp]: props[MODEL_VALUE] });
        } else if (modelPropValue !== EMPTY_PROP) {
          propsToAdd = Object.assign(Object.assign({}, propsToAdd), { [modelProp]: modelPropValue });
        }
      }
      return h$1(name, propsToAdd, slots.default && slots.default());
    };
  });
  Container.displayName = name;
  Container.props = {
    [ROUTER_LINK_VALUE]: DEFAULT_EMPTY_PROP
  };
  componentProps.forEach((componentProp) => {
    Container.props[componentProp] = DEFAULT_EMPTY_PROP;
  });
  if (modelProp) {
    Container.props[MODEL_VALUE] = DEFAULT_EMPTY_PROP;
    Container.emits = [UPDATE_VALUE_EVENT, externalModelUpdateEvent];
  }
  return Container;
};
const IonBadge = /* @__PURE__ */ defineContainer("ion-badge", defineCustomElement$1y, [
  "color"
]);
const IonButton = /* @__PURE__ */ defineContainer("ion-button", defineCustomElement$1t, [
  "color",
  "buttonType",
  "disabled",
  "expand",
  "fill",
  "routerDirection",
  "routerAnimation",
  "download",
  "href",
  "rel",
  "shape",
  "size",
  "strong",
  "target",
  "type",
  "form",
  "ionFocus",
  "ionBlur"
]);
const IonCheckbox = /* @__PURE__ */ defineContainer("ion-checkbox", defineCustomElement$1k, [
  "color",
  "name",
  "checked",
  "indeterminate",
  "disabled",
  "value",
  "ionChange",
  "ionFocus",
  "ionBlur",
  "ionStyle"
], "checked", "v-ion-change", "ionChange");
const IonCol = /* @__PURE__ */ defineContainer("ion-col", defineCustomElement$1i, [
  "offset",
  "offsetXs",
  "offsetSm",
  "offsetMd",
  "offsetLg",
  "offsetXl",
  "pull",
  "pullXs",
  "pullSm",
  "pullMd",
  "pullLg",
  "pullXl",
  "push",
  "pushXs",
  "pushSm",
  "pushMd",
  "pushLg",
  "pushXl",
  "size",
  "sizeXs",
  "sizeSm",
  "sizeMd",
  "sizeLg",
  "sizeXl"
]);
const IonContent = /* @__PURE__ */ defineContainer("ion-content", defineCustomElement$1h, [
  "color",
  "fullscreen",
  "forceOverscroll",
  "scrollX",
  "scrollY",
  "scrollEvents",
  "ionScrollStart",
  "ionScroll",
  "ionScrollEnd"
]);
const IonFab = /* @__PURE__ */ defineContainer("ion-fab", defineCustomElement$18, [
  "horizontal",
  "vertical",
  "edge",
  "activated"
]);
const IonFabButton = /* @__PURE__ */ defineContainer("ion-fab-button", defineCustomElement$17, [
  "color",
  "activated",
  "disabled",
  "download",
  "href",
  "rel",
  "routerDirection",
  "routerAnimation",
  "target",
  "show",
  "translucent",
  "type",
  "size",
  "closeIcon",
  "ionFocus",
  "ionBlur"
]);
const IonGrid = /* @__PURE__ */ defineContainer("ion-grid", defineCustomElement$14, [
  "fixed"
]);
const IonHeader = /* @__PURE__ */ defineContainer("ion-header", defineCustomElement$13, [
  "collapse",
  "translucent"
]);
const IonImg = /* @__PURE__ */ defineContainer("ion-img", defineCustomElement$12, [
  "alt",
  "src",
  "ionImgWillLoad",
  "ionImgDidLoad",
  "ionError"
]);
const IonInput = /* @__PURE__ */ defineContainer("ion-input", defineCustomElement$_, [
  "fireFocusEvents",
  "color",
  "accept",
  "autocapitalize",
  "autocomplete",
  "autocorrect",
  "autofocus",
  "clearInput",
  "clearOnEdit",
  "debounce",
  "disabled",
  "enterkeyhint",
  "inputmode",
  "max",
  "maxlength",
  "min",
  "minlength",
  "multiple",
  "name",
  "pattern",
  "placeholder",
  "readonly",
  "required",
  "spellcheck",
  "step",
  "size",
  "type",
  "value",
  "ionInput",
  "ionChange",
  "ionBlur",
  "ionFocus",
  "ionStyle"
], "value", "v-ion-change", "ionChange");
const IonItem = /* @__PURE__ */ defineContainer("ion-item", defineCustomElement$Z, [
  "color",
  "button",
  "detail",
  "detailIcon",
  "disabled",
  "download",
  "fill",
  "shape",
  "href",
  "rel",
  "lines",
  "counter",
  "routerAnimation",
  "routerDirection",
  "target",
  "type",
  "counterFormatter"
]);
const IonLabel = /* @__PURE__ */ defineContainer("ion-label", defineCustomElement$T, [
  "color",
  "position",
  "ionColor",
  "ionStyle"
]);
const IonList = /* @__PURE__ */ defineContainer("ion-list", defineCustomElement$R, [
  "lines",
  "inset"
]);
const IonNote = /* @__PURE__ */ defineContainer("ion-note", defineCustomElement$K, [
  "color"
]);
const IonRow = /* @__PURE__ */ defineContainer("ion-row", defineCustomElement$y);
const IonThumbnail = /* @__PURE__ */ defineContainer("ion-thumbnail", defineCustomElement$i);
const IonTitle = /* @__PURE__ */ defineContainer("ion-title", defineCustomElement$h, [
  "color",
  "size",
  "ionStyle"
]);
const IonToolbar = /* @__PURE__ */ defineContainer("ion-toolbar", defineCustomElement$f, [
  "color"
]);
var LifecycleHooks;
(function(LifecycleHooks2) {
  LifecycleHooks2["WillEnter"] = "onIonViewWillEnter";
  LifecycleHooks2["DidEnter"] = "onIonViewDidEnter";
  LifecycleHooks2["WillLeave"] = "onIonViewWillLeave";
  LifecycleHooks2["DidLeave"] = "onIonViewDidLeave";
})(LifecycleHooks || (LifecycleHooks = {}));
const hookNames = {
  [LIFECYCLE_WILL_ENTER]: LifecycleHooks.WillEnter,
  [LIFECYCLE_DID_ENTER]: LifecycleHooks.DidEnter,
  [LIFECYCLE_WILL_LEAVE]: LifecycleHooks.WillLeave,
  [LIFECYCLE_DID_LEAVE]: LifecycleHooks.DidLeave
};
const ids = { main: 0 };
const generateId = (type = "main") => {
  var _a2;
  const id = ((_a2 = ids[type]) !== null && _a2 !== void 0 ? _a2 : 0) + 1;
  ids[type] = id;
  return id.toString();
};
const fireLifecycle = (vueComponent, vueInstance, lifecycle2) => {
  if (vueComponent === null || vueComponent === void 0 ? void 0 : vueComponent[lifecycle2]) {
    vueComponent[lifecycle2].bind(vueInstance === null || vueInstance === void 0 ? void 0 : vueInstance.value)();
  }
  const instance = vueInstance === null || vueInstance === void 0 ? void 0 : vueInstance.value;
  if (instance === null || instance === void 0 ? void 0 : instance[lifecycle2]) {
    instance[lifecycle2]();
  }
  if (instance) {
    const hook = hookNames[lifecycle2];
    const hooks = instance[hook];
    if (hooks) {
      hooks.forEach((hook2) => hook2());
    }
  }
};
const injectHook = (lifecycleType, hook, component) => {
  if (component) {
    const target = component;
    const hooks = target.proxy[lifecycleType] || (target.proxy[lifecycleType] = []);
    if (target.exposed) {
      target.exposed[lifecycleType] = hooks;
    }
    const wrappedHook = (...args) => {
      if (target.isUnmounted) {
        return;
      }
      return args ? hook(...args) : hook();
    };
    hooks.push(wrappedHook);
    return wrappedHook;
  } else {
    console.warn("[@ionic/vue]: Ionic Lifecycle Hooks can only be used during execution of setup().");
  }
};
const createHook = (lifecycle2) => {
  return (hook, target = getCurrentInstance()) => injectHook(lifecycle2, hook, target);
};
createHook(LifecycleHooks.WillEnter);
createHook(LifecycleHooks.DidEnter);
createHook(LifecycleHooks.WillLeave);
createHook(LifecycleHooks.DidLeave);
const toKebabCase = (eventName) => eventName === "ionChange" ? "v-ion-change" : eventName.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
const getHelperFunctions = () => {
  return {
    ael: (el, eventName, cb, opts) => el.addEventListener(toKebabCase(eventName), cb, opts),
    rel: (el, eventName, cb, opts) => el.removeEventListener(toKebabCase(eventName), cb, opts),
    ce: (eventName, opts) => new CustomEvent(toKebabCase(eventName), opts)
  };
};
const IonicVue = {
  async install(_, config2 = {}) {
    const { ael, rel, ce } = getHelperFunctions();
    initialize(Object.assign(Object.assign({}, config2), { _ael: ael, _rel: rel, _ce: ce }));
  }
};
const IonPage = /* @__PURE__ */ defineComponent({
  name: "IonPage",
  props: {
    registerIonPage: { type: Function, default: () => {
    } }
  },
  mounted() {
    this.$props.registerIonPage(this.$refs.ionPage);
  },
  setup(_, { attrs, slots }) {
    return () => {
      return h$1("div", Object.assign(Object.assign({}, attrs), { ["class"]: "ion-page", ref: "ionPage" }), slots.default && slots.default());
    };
  }
});
const isViewVisible = (enteringEl) => {
  return !enteringEl.classList.contains("ion-page-hidden") && !enteringEl.classList.contains("ion-page-invisible");
};
let viewDepthKey = Symbol(0);
const IonRouterOutlet = /* @__PURE__ */ defineComponent({
  name: "IonRouterOutlet",
  setup() {
    defineCustomElement$5();
    const injectedRoute = inject(routeLocationKey);
    const route = useRoute$1();
    const depth = inject(viewDepthKey, 0);
    const matchedRouteRef = computed(() => route.matched[depth]);
    let previousMatchedRouteRef;
    let previousMatchedPath;
    provide(viewDepthKey, depth + 1);
    provide(matchedRouteKey, matchedRouteRef);
    const ionRouterOutlet = ref();
    const id = generateId("ion-router-outlet");
    const ionRouter = inject("navManager");
    const viewStacks = inject("viewStacks");
    const components2 = shallowRef([]);
    let skipTransition = false;
    let parentOutletPath;
    watch(() => [route, matchedRouteRef.value], ([currentRoute, currentMatchedRouteRef]) => {
      if (currentMatchedRouteRef !== void 0) {
        const matchedDifferentRoutes = currentMatchedRouteRef !== previousMatchedRouteRef;
        const matchedDifferentParameterRoutes = currentRoute.matched[currentRoute.matched.length - 1] === currentMatchedRouteRef && currentRoute.path !== previousMatchedPath;
        if (matchedDifferentRoutes || matchedDifferentParameterRoutes) {
          setupViewItem(matchedRouteRef);
        }
      }
      previousMatchedRouteRef = currentMatchedRouteRef;
      previousMatchedPath = currentRoute.path;
    });
    const canStart = () => {
      return false;
    };
    const onStart = async () => {
      const routeInfo = ionRouter.getLeavingRouteInfo();
      const { routerAnimation } = routeInfo;
      const enteringViewItem = viewStacks.findViewItemByRouteInfo({ pathname: routeInfo.pushedByRoute || "" }, id);
      const leavingViewItem = viewStacks.findViewItemByRouteInfo(routeInfo, id);
      if (leavingViewItem) {
        let animationBuilder = routerAnimation;
        const enteringEl = enteringViewItem.ionPageElement;
        const leavingEl = leavingViewItem.ionPageElement;
        const customAnimation = enteringViewItem.routerAnimation;
        if (animationBuilder === void 0 && customAnimation !== void 0) {
          animationBuilder = customAnimation;
        }
        leavingViewItem.routerAnimation = animationBuilder;
        await transition2(enteringEl, leavingEl, "back", ionRouter.canGoBack(2), true, animationBuilder);
      }
      return Promise.resolve();
    };
    const onEnd = (shouldContinue) => {
      if (shouldContinue) {
        skipTransition = true;
        ionRouter.handleNavigateBack();
      } else {
        const routeInfo = ionRouter.getCurrentRouteInfo();
        const enteringViewItem = viewStacks.findViewItemByRouteInfo({ pathname: routeInfo.pushedByRoute || "" }, id);
        enteringViewItem.ionPageElement.setAttribute("aria-hidden", "true");
        enteringViewItem.ionPageElement.classList.add("ion-page-hidden");
      }
    };
    watch(ionRouterOutlet, () => {
      ionRouterOutlet.value.swipeHandler = {
        canStart,
        onStart,
        onEnd
      };
    });
    const transition2 = (enteringEl, leavingEl, direction, showGoBack, progressAnimation, animationBuilder) => {
      return new Promise((resolve) => {
        if (skipTransition) {
          skipTransition = false;
          return resolve(false);
        }
        if (enteringEl === leavingEl) {
          return resolve(false);
        }
        requestAnimationFrame(() => {
          requestAnimationFrame(async () => {
            enteringEl.classList.add("ion-page-invisible");
            const hasRootDirection = direction === void 0 || direction === "root" || direction === "none";
            const result = await ionRouterOutlet.value.commit(enteringEl, leavingEl, {
              deepWait: true,
              duration: hasRootDirection && animationBuilder === void 0 ? 0 : void 0,
              direction,
              showGoBack,
              progressAnimation,
              animationBuilder
            });
            return resolve(result);
          });
        });
      });
    };
    const handlePageTransition = async () => {
      const routeInfo = ionRouter.getCurrentRouteInfo();
      const { routerDirection, routerAction, routerAnimation, prevRouteLastPathname, delta } = routeInfo;
      const enteringViewItem = viewStacks.findViewItemByRouteInfo(routeInfo, id);
      let leavingViewItem = viewStacks.findLeavingViewItemByRouteInfo(routeInfo, id);
      const enteringEl = enteringViewItem.ionPageElement;
      if (enteringEl === void 0) {
        console.warn(`[@ionic/vue Warning]: The view you are trying to render for path ${routeInfo.pathname} does not have the required <ion-page> component. Transitions and lifecycle methods may not work as expected.

See https://ionicframework.com/docs/vue/navigation#ionpage for more information.`);
      }
      if (enteringViewItem === leavingViewItem)
        return;
      if (!leavingViewItem && prevRouteLastPathname) {
        leavingViewItem = viewStacks.findViewItemByPathname(prevRouteLastPathname, id);
      }
      if (isViewVisible(enteringEl) && (leavingViewItem === null || leavingViewItem === void 0 ? void 0 : leavingViewItem.ionPageElement) !== void 0 && !isViewVisible(leavingViewItem.ionPageElement)) {
        return;
      }
      fireLifecycle(enteringViewItem.vueComponent, enteringViewItem.vueComponentRef, LIFECYCLE_WILL_ENTER);
      if ((leavingViewItem === null || leavingViewItem === void 0 ? void 0 : leavingViewItem.ionPageElement) && enteringViewItem !== leavingViewItem) {
        let animationBuilder = routerAnimation;
        const leavingEl = leavingViewItem.ionPageElement;
        fireLifecycle(leavingViewItem.vueComponent, leavingViewItem.vueComponentRef, LIFECYCLE_WILL_LEAVE);
        const customAnimation = enteringViewItem.routerAnimation;
        if (animationBuilder === void 0 && routerDirection === "back" && customAnimation !== void 0) {
          animationBuilder = customAnimation;
        }
        leavingViewItem.routerAnimation = animationBuilder;
        await transition2(enteringEl, leavingEl, routerDirection, !!routeInfo.pushedByRoute, false, animationBuilder);
        leavingEl.classList.add("ion-page-hidden");
        leavingEl.setAttribute("aria-hidden", "true");
        const usingLinearNavigation = viewStacks.size() === 1;
        if (routerAction === "replace") {
          leavingViewItem.mount = false;
          leavingViewItem.ionPageElement = void 0;
          leavingViewItem.ionRoute = false;
        } else if (!(routerAction === "push" && routerDirection === "forward")) {
          const shouldLeavingViewBeRemoved = routerDirection !== "none" && leavingViewItem && enteringViewItem !== leavingViewItem;
          if (shouldLeavingViewBeRemoved) {
            leavingViewItem.mount = false;
            leavingViewItem.ionPageElement = void 0;
            leavingViewItem.ionRoute = false;
            if (usingLinearNavigation) {
              viewStacks.unmountLeavingViews(id, enteringViewItem, delta);
            }
          }
        } else if (usingLinearNavigation) {
          viewStacks.mountIntermediaryViews(id, leavingViewItem, delta);
        }
        fireLifecycle(leavingViewItem.vueComponent, leavingViewItem.vueComponentRef, LIFECYCLE_DID_LEAVE);
      } else {
        requestAnimationFrame(() => enteringEl.classList.remove("ion-page-invisible"));
      }
      fireLifecycle(enteringViewItem.vueComponent, enteringViewItem.vueComponentRef, LIFECYCLE_DID_ENTER);
      components2.value = viewStacks.getChildrenToRender(id);
    };
    const setupViewItem = (matchedRouteRef2) => {
      const firstMatchedRoute = route.matched[0];
      if (!parentOutletPath) {
        parentOutletPath = firstMatchedRoute.path;
      }
      if (!matchedRouteRef2.value || matchedRouteRef2.value !== firstMatchedRoute && firstMatchedRoute.path !== parentOutletPath) {
        return;
      }
      const currentRoute = ionRouter.getCurrentRouteInfo();
      let enteringViewItem = viewStacks.findViewItemByRouteInfo(currentRoute, id);
      if (!enteringViewItem) {
        enteringViewItem = viewStacks.createViewItem(id, matchedRouteRef2.value.components.default, matchedRouteRef2.value, currentRoute);
        viewStacks.add(enteringViewItem);
      }
      if (!enteringViewItem.mount) {
        enteringViewItem.mount = true;
        enteringViewItem.registerCallback = () => {
          handlePageTransition();
          enteringViewItem.registerCallback = void 0;
        };
      } else {
        handlePageTransition();
      }
      components2.value = viewStacks.getChildrenToRender(id);
    };
    if (matchedRouteRef.value) {
      setupViewItem(matchedRouteRef);
    }
    onUnmounted(() => viewStacks.clear(id));
    const registerIonPage = (viewItem, ionPageEl) => {
      const oldIonPageEl = viewItem.ionPageElement;
      viewStacks.registerIonPage(viewItem, ionPageEl);
      if (viewItem.registerCallback) {
        ionPageEl.classList.add("ion-page-invisible");
        viewItem.registerCallback();
      } else if (oldIonPageEl && !oldIonPageEl.classList.contains("ion-page-invisible")) {
        ionPageEl.classList.remove("ion-page-invisible");
      }
    };
    return {
      id,
      components: components2,
      injectedRoute,
      ionRouterOutlet,
      registerIonPage
    };
  },
  render() {
    const { components: components2, registerIonPage, injectedRoute } = this;
    return h$1("ion-router-outlet", { ref: "ionRouterOutlet" }, components2 && components2.map((c) => {
      var _a2, _b2;
      let props = {
        ref: c.vueComponentRef,
        key: c.pathname,
        registerIonPage: (ionPageEl) => registerIonPage(c, ionPageEl)
      };
      const routePropsOption = (_b2 = (_a2 = c.matchedRoute) === null || _a2 === void 0 ? void 0 : _a2.props) === null || _b2 === void 0 ? void 0 : _b2.default;
      const getPropsFunctionResult = () => {
        var _a3;
        const cachedPropsResult = (_a3 = c.vueComponentData) === null || _a3 === void 0 ? void 0 : _a3.propsFunctionResult;
        if (cachedPropsResult) {
          return cachedPropsResult;
        } else {
          const propsFunctionResult = routePropsOption(injectedRoute);
          c.vueComponentData = Object.assign(Object.assign({}, c.vueComponentData), { propsFunctionResult });
          return propsFunctionResult;
        }
      };
      const routeProps = routePropsOption ? routePropsOption === true ? c.params : typeof routePropsOption === "function" ? getPropsFunctionResult() : routePropsOption : null;
      props = Object.assign(Object.assign({}, props), routeProps);
      return h$1(c.vueComponent, props);
    }));
  }
});
const IonTabButton = /* @__PURE__ */ defineComponent({
  name: "IonTabButton",
  props: {
    _getTabState: { type: Function, default: () => {
      return {};
    } },
    disabled: Boolean,
    download: String,
    href: String,
    rel: String,
    layout: String,
    selected: Boolean,
    tab: String,
    target: String
  },
  setup(props, { slots }) {
    defineCustomElement$3();
    const ionRouter = inject("navManager");
    const onClick = (ev) => {
      if (ev.cancelable) {
        ev.preventDefault();
      }
      const { tab, href, _getTabState } = props;
      const tabState = _getTabState();
      const tappedTab = tabState.tabs[tab] || {};
      const originalHref = tappedTab.originalHref || href;
      const currentHref = tappedTab.currentHref || href;
      const prevActiveTab = tabState.activeTab;
      if (prevActiveTab === tab) {
        if (originalHref !== currentHref) {
          ionRouter.resetTab(tab);
        }
      } else {
        ionRouter.changeTab(tab, currentHref);
      }
    };
    return () => {
      return h$1("ion-tab-button", Object.assign({ onClick }, props), slots.default && slots.default());
    };
  }
});
const WILL_CHANGE = "ionTabsWillChange";
const DID_CHANGE = "ionTabsDidChange";
const IonTabs = /* @__PURE__ */ defineComponent({
  name: "IonTabs",
  emits: [WILL_CHANGE, DID_CHANGE],
  render() {
    var _a2;
    const { $slots: slots, $emit } = this;
    const slottedContent = slots.default && slots.default();
    let routerOutlet;
    if (slottedContent && slottedContent.length > 0) {
      routerOutlet = slottedContent.find((child) => child.type && child.type.name === "IonRouterOutlet");
    }
    if (!routerOutlet) {
      throw new Error("IonTabs must contain an IonRouterOutlet. See https://ionicframework.com/docs/vue/navigation#working-with-tabs for more information.");
    }
    let childrenToRender = [
      h$1("div", {
        class: "tabs-inner",
        style: {
          "position": "relative",
          "flex": "1",
          "contain": "layout size style"
        }
      }, routerOutlet)
    ];
    if (slottedContent && slottedContent.length > 0) {
      const filteredContent = slottedContent.filter((child) => !child.type || child.type && child.type.name !== "IonRouterOutlet");
      const slottedTabBar = filteredContent.find((child) => child.type && child.type.name === "IonTabBar");
      const hasTopSlotTabBar = slottedTabBar && ((_a2 = slottedTabBar.props) === null || _a2 === void 0 ? void 0 : _a2.slot) === "top";
      if (slottedTabBar) {
        if (!slottedTabBar.props) {
          slottedTabBar.props = {};
        }
        slottedTabBar.props._tabsWillChange = (tab) => $emit(WILL_CHANGE, { tab });
        slottedTabBar.props._tabsDidChange = (tab) => $emit(DID_CHANGE, { tab });
      }
      if (hasTopSlotTabBar) {
        childrenToRender = [
          ...filteredContent,
          ...childrenToRender
        ];
      } else {
        childrenToRender = [
          ...childrenToRender,
          ...filteredContent
        ];
      }
    }
    return h$1("ion-tabs", {
      style: {
        "display": "flex",
        "position": "absolute",
        "top": "0",
        "left": "0",
        "right": "0",
        "bottom": "0",
        "flex-direction": "column",
        "width": "100%",
        "height": "100%",
        "contain": "layout size style",
        "z-index": "0"
      }
    }, childrenToRender);
  }
});
const isTabButton = (child) => {
  var _a2;
  return ((_a2 = child.type) === null || _a2 === void 0 ? void 0 : _a2.name) === "IonTabButton";
};
const getTabs = (nodes) => {
  let tabs = [];
  nodes.forEach((node) => {
    if (isTabButton(node)) {
      tabs.push(node);
    } else if (Array.isArray(node.children) && node.children.length > 1) {
      const childTabs = getTabs(node.children);
      tabs = [...tabs, ...childTabs];
    }
  });
  return tabs;
};
const IonTabBar = defineComponent({
  name: "IonTabBar",
  props: {
    _tabsWillChange: { type: Function, default: () => {
    } },
    _tabsDidChange: { type: Function, default: () => {
    } }
  },
  data() {
    return {
      tabState: {
        activeTab: void 0,
        tabs: {}
      },
      tabVnodes: []
    };
  },
  updated() {
    this.setupTabState(inject("navManager"));
  },
  methods: {
    setupTabState(ionRouter) {
      const tabState = this.$data.tabState;
      const currentInstance = getCurrentInstance();
      const tabs = this.$data.tabVnodes = getTabs(currentInstance.subTree.children || []);
      tabs.forEach((child) => {
        tabState.tabs[child.props.tab] = {
          originalHref: child.props.href,
          currentHref: child.props.href,
          ref: child
        };
        child.component.props._getTabState = () => tabState;
      });
      this.checkActiveTab(ionRouter);
    },
    checkActiveTab(ionRouter) {
      const currentRoute = ionRouter.getCurrentRouteInfo();
      const childNodes = this.$data.tabVnodes;
      const { tabs, activeTab: prevActiveTab } = this.$data.tabState;
      const tabState = this.$data.tabState;
      const tabKeys = Object.keys(tabs);
      const activeTab = tabKeys.find((key) => {
        const href = tabs[key].originalHref;
        return currentRoute.pathname.startsWith(href);
      });
      childNodes.forEach((child) => {
        const tab = tabs[child.props.tab];
        if (!tab || tab.originalHref !== child.props.href) {
          tabs[child.props.tab] = {
            originalHref: child.props.href,
            currentHref: child.props.href,
            ref: child
          };
        }
      });
      if (activeTab && prevActiveTab) {
        const prevHref = this.$data.tabState.tabs[prevActiveTab].currentHref;
        if (activeTab !== prevActiveTab || prevHref !== currentRoute.pathname) {
          const search = currentRoute.search ? `?${currentRoute.search}` : "";
          tabs[activeTab] = Object.assign(Object.assign({}, tabs[activeTab]), { currentHref: currentRoute.pathname + search });
        }
        if (currentRoute.routerAction === "pop" && activeTab !== prevActiveTab) {
          tabs[prevActiveTab] = Object.assign(Object.assign({}, tabs[prevActiveTab]), { currentHref: tabs[prevActiveTab].originalHref });
        }
      }
      const activeChild = childNodes.find((child) => {
        var _a2;
        return isTabButton(child) && ((_a2 = child.props) === null || _a2 === void 0 ? void 0 : _a2.tab) === activeTab;
      });
      const tabBar = this.$refs.ionTabBar;
      const tabDidChange = activeTab !== prevActiveTab;
      if (tabBar) {
        if (activeChild) {
          tabDidChange && this.$props._tabsWillChange(activeTab);
          ionRouter.handleSetCurrentTab(activeTab);
          tabBar.selectedTab = tabState.activeTab = activeTab;
          tabDidChange && this.$props._tabsDidChange(activeTab);
        } else {
          tabBar.selectedTab = tabState.activeTab = "";
        }
      }
    }
  },
  mounted() {
    const ionRouter = inject("navManager");
    this.setupTabState(ionRouter);
    ionRouter.registerHistoryChangeListener(() => this.checkActiveTab(ionRouter));
  },
  setup(_, { slots }) {
    defineCustomElement$4();
    return () => {
      return h$1("ion-tab-bar", { ref: "ionTabBar" }, slots.default && slots.default());
    };
  }
});
const userComponents = shallowRef([]);
const IonApp = /* @__PURE__ */ defineComponent((_, { attrs, slots }) => {
  defineCustomElement$b();
  return () => {
    return h$1("ion-app", Object.assign({}, attrs), [slots.default && slots.default(), ...userComponents.value]);
  };
});
const addTeleportedUserComponent = (component) => {
  userComponents.value = [
    ...userComponents.value,
    component
  ];
};
const removeTeleportedUserComponent = (component) => {
  const index = userComponents.value.findIndex((cmp) => cmp === component);
  if (index !== -1) {
    userComponents.value.splice(index, 1);
  }
};
const VueDelegate = (addFn = addTeleportedUserComponent, removeFn = removeTeleportedUserComponent) => {
  let Component;
  const attachViewToDom = (parentElement, component, componentProps = {}, classes) => {
    delete componentProps["modal"];
    delete componentProps["popover"];
    const div = document.createElement("div");
    classes && div.classList.add(...classes);
    parentElement.appendChild(div);
    Component = h$1(Teleport, { to: div }, h$1(component, Object.assign({}, componentProps)));
    addFn(Component);
    return Promise.resolve(div);
  };
  const removeViewFromDom = () => {
    Component && removeFn(Component);
    return Promise.resolve();
  };
  return { attachViewToDom, removeViewFromDom };
};
const IonIcon = /* @__PURE__ */ defineComponent({
  name: "IonIcon",
  props: {
    color: String,
    flipRtl: Boolean,
    icon: String,
    ios: String,
    lazy: String,
    md: String,
    mode: String,
    name: String,
    size: String,
    src: String
  },
  setup(props, { slots }) {
    defineCustomElement();
    return () => {
      var _a2, _b2;
      const { icon, ios, md } = props;
      let iconToUse;
      if (ios || md) {
        if (isPlatform("ios")) {
          iconToUse = (_a2 = ios !== null && ios !== void 0 ? ios : md) !== null && _a2 !== void 0 ? _a2 : icon;
        } else {
          iconToUse = (_b2 = md !== null && md !== void 0 ? md : ios) !== null && _b2 !== void 0 ? _b2 : icon;
        }
      } else {
        iconToUse = icon;
      }
      return h$1("ion-icon", Object.assign(Object.assign({}, props), { icon: iconToUse }), slots);
    };
  }
});
const createController = (defineCustomElement2, oldController, useDelegate = false) => {
  const delegate = useDelegate ? VueDelegate() : void 0;
  const oldCreate = oldController.create.bind(oldController);
  oldController.create = (options) => {
    defineCustomElement2();
    return oldCreate(Object.assign(Object.assign({}, options), { delegate }));
  };
  return oldController;
};
const actionSheetController = /* @__PURE__ */ createController(defineCustomElement$d, actionSheetController$1);
const ionicVueConfig = {};
const node_modules__64nuxtjs_ionic_dist_runtime_ionic_mjs_JZxaXwxCQa = defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(IonicVue, ionicVueConfig);
});
const _plugins = [
  node_modules__64nuxtjs_ionic_dist_runtime_router_mjs_h7T2ZmMnVl,
  _nuxt_components_plugin_mjs_KR1HBZs4kY,
  node_modules_nuxt_dist_head_runtime_lib_vueuse_head_plugin_mjs_D7WGfuP1A0,
  node_modules__64nuxtjs_ionic_dist_runtime_ionic_mjs_JZxaXwxCQa
];
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$1 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_ion_app = IonApp;
  const _component_ion_router_outlet = IonRouterOutlet;
  _push(ssrRenderComponent(_component_ion_app, _attrs, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_ion_router_outlet, null, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_ion_router_outlet)
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const AppComponent = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender]]);
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const ErrorComponent = defineAsyncComponent(() => import('./_nuxt/error-component.09a96f3c.mjs').then((r) => r.default || r));
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    provide("_route", useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        callWithNuxt(nuxtApp, showError, [err]);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(error)) {
            _push(ssrRenderComponent(unref(ErrorComponent), { error: unref(error) }, null, _parent));
          } else {
            _push(ssrRenderComponent(unref(AppComponent), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
let entry;
const plugins = normalizePlugins(_plugins);
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (err) {
      await nuxt.callHook("app:error", err);
      nuxt.payload.error = nuxt.payload.error || err;
    }
    return vueApp;
  };
}
const entry$1 = (ctx) => entry(ctx);

export { IonTabButton as A, useNuxtApp as B, isRTL$1 as C, createGesture as D, clamp as E, now$1 as F, pointerCoord as G, readTask as H, IonPage as I, findClosestIonContent as J, componentOnReady as K, writeTask as L, scrollToTop as M, addEventListener$1 as N, removeEventListener as O, raf as P, getIonPageElement as Q, __nuxt_component_0 as R, _export_sfc as _, IonHeader as a, IonToolbar as b, IonThumbnail as c, IonImg as d, entry$1 as default, IonTitle as e, IonContent as f, IonList as g, IonItem as h, IonCheckbox as i, IonLabel as j, IonNote as k, IonBadge as l, isPlatform as m, IonGrid as n, IonRow as o, IonCol as p, IonFab as q, IonFabButton as r, IonIcon as s, actionSheetController as t, createAnimation as u, IonInput as v, IonButton as w, IonTabs as x, IonRouterOutlet as y, IonTabBar as z };
//# sourceMappingURL=server.mjs.map
