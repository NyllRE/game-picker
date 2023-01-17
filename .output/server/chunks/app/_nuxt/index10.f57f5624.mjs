import { F as now$1, G as pointerCoord } from '../server.mjs';
import 'vue';
import 'ofetch';
import 'hookable';
import 'unctx';
import 'ufo';
import 'h3';
import 'vue-router';
import '@unhead/vue';
import '@unhead/dom';
import 'vue/server-renderer';
import '../../nitro/node-server.mjs';
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

/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const startTapClick = (config) => {
  let lastTouch = -MOUSE_WAIT * 10;
  let lastActivated = 0;
  let activatableEle;
  let activeRipple;
  let activeDefer;
  const useRippleEffect = config.getBoolean("animated", true) && config.getBoolean("rippleEffect", true);
  const clearDefers = /* @__PURE__ */ new WeakMap();
  const onTouchStart = (ev) => {
    lastTouch = now$1(ev);
    pointerDown(ev);
  };
  const onTouchEnd = (ev) => {
    lastTouch = now$1(ev);
    pointerUp(ev);
  };
  const onMouseDown = (ev) => {
    if (ev.button === 2) {
      return;
    }
    const t = now$1(ev) - MOUSE_WAIT;
    if (lastTouch < t) {
      pointerDown(ev);
    }
  };
  const onMouseUp = (ev) => {
    const t = now$1(ev) - MOUSE_WAIT;
    if (lastTouch < t) {
      pointerUp(ev);
    }
  };
  const cancelActive = () => {
    clearTimeout(activeDefer);
    activeDefer = void 0;
    if (activatableEle) {
      removeActivated(false);
      activatableEle = void 0;
    }
  };
  const pointerDown = (ev) => {
    if (activatableEle) {
      return;
    }
    setActivatedElement(getActivatableTarget(ev), ev);
  };
  const pointerUp = (ev) => {
    setActivatedElement(void 0, ev);
  };
  const setActivatedElement = (el, ev) => {
    if (el && el === activatableEle) {
      return;
    }
    clearTimeout(activeDefer);
    activeDefer = void 0;
    const { x, y } = pointerCoord(ev);
    if (activatableEle) {
      if (clearDefers.has(activatableEle)) {
        throw new Error("internal error");
      }
      if (!activatableEle.classList.contains(ACTIVATED)) {
        addActivated(activatableEle, x, y);
      }
      removeActivated(true);
    }
    if (el) {
      const deferId = clearDefers.get(el);
      if (deferId) {
        clearTimeout(deferId);
        clearDefers.delete(el);
      }
      const delay = isInstant(el) ? 0 : ADD_ACTIVATED_DEFERS;
      el.classList.remove(ACTIVATED);
      activeDefer = setTimeout(() => {
        addActivated(el, x, y);
        activeDefer = void 0;
      }, delay);
    }
    activatableEle = el;
  };
  const addActivated = (el, x, y) => {
    lastActivated = Date.now();
    el.classList.add(ACTIVATED);
    if (!useRippleEffect)
      return;
    const rippleEffect = getRippleEffect(el);
    if (rippleEffect !== null) {
      removeRipple();
      activeRipple = rippleEffect.addRipple(x, y);
    }
  };
  const removeRipple = () => {
    if (activeRipple !== void 0) {
      activeRipple.then((remove) => remove());
      activeRipple = void 0;
    }
  };
  const removeActivated = (smooth) => {
    removeRipple();
    const active = activatableEle;
    if (!active) {
      return;
    }
    const time = CLEAR_STATE_DEFERS - Date.now() + lastActivated;
    if (smooth && time > 0 && !isInstant(active)) {
      const deferId = setTimeout(() => {
        active.classList.remove(ACTIVATED);
        clearDefers.delete(active);
      }, CLEAR_STATE_DEFERS);
      clearDefers.set(active, deferId);
    } else {
      active.classList.remove(ACTIVATED);
    }
  };
  const doc = document;
  doc.addEventListener("ionGestureCaptured", cancelActive);
  doc.addEventListener("touchstart", onTouchStart, true);
  doc.addEventListener("touchcancel", onTouchEnd, true);
  doc.addEventListener("touchend", onTouchEnd, true);
  doc.addEventListener("pointercancel", cancelActive, true);
  doc.addEventListener("mousedown", onMouseDown, true);
  doc.addEventListener("mouseup", onMouseUp, true);
};
const getActivatableTarget = (ev) => {
  if (ev.composedPath !== void 0) {
    const path = ev.composedPath();
    for (let i = 0; i < path.length - 2; i++) {
      const el = path[i];
      if (!(el instanceof ShadowRoot) && el.classList.contains("ion-activatable")) {
        return el;
      }
    }
  } else {
    return ev.target.closest(".ion-activatable");
  }
};
const isInstant = (el) => {
  return el.classList.contains("ion-activatable-instant");
};
const getRippleEffect = (el) => {
  if (el.shadowRoot) {
    const ripple = el.shadowRoot.querySelector("ion-ripple-effect");
    if (ripple) {
      return ripple;
    }
  }
  return el.querySelector("ion-ripple-effect");
};
const ACTIVATED = "ion-activated";
const ADD_ACTIVATED_DEFERS = 200;
const CLEAR_STATE_DEFERS = 200;
const MOUSE_WAIT = 2500;

export { startTapClick };
//# sourceMappingURL=index10.f57f5624.mjs.map
