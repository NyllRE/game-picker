import { N as addEventListener, O as removeEventListener, K as componentOnReady, J as findClosestIonContent, G as pointerCoord, P as raf } from "../server.mjs";
import "vue";
import "ofetch";
import "#internal/nitro";
import "hookable";
import "unctx";
import "destr";
import "ufo";
import "h3";
import "vue-router";
import "@unhead/vue";
import "@unhead/dom";
import "vue/server-renderer";
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const cloneMap = /* @__PURE__ */ new WeakMap();
const relocateInput = (componentEl, inputEl, shouldRelocate, inputRelativeY = 0, disabledClonedInput = false) => {
  if (cloneMap.has(componentEl) === shouldRelocate) {
    return;
  }
  if (shouldRelocate) {
    addClone(componentEl, inputEl, inputRelativeY, disabledClonedInput);
  } else {
    removeClone(componentEl, inputEl);
  }
};
const isFocused = (input) => {
  return input === input.getRootNode().activeElement;
};
const addClone = (componentEl, inputEl, inputRelativeY, disabledClonedInput = false) => {
  const parentEl = inputEl.parentNode;
  const clonedEl = inputEl.cloneNode(false);
  clonedEl.classList.add("cloned-input");
  clonedEl.tabIndex = -1;
  if (disabledClonedInput) {
    clonedEl.disabled = true;
  }
  parentEl.appendChild(clonedEl);
  cloneMap.set(componentEl, clonedEl);
  const doc = componentEl.ownerDocument;
  const tx = doc.dir === "rtl" ? 9999 : -9999;
  componentEl.style.pointerEvents = "none";
  inputEl.style.transform = `translate3d(${tx}px,${inputRelativeY}px,0) scale(0)`;
};
const removeClone = (componentEl, inputEl) => {
  const clone = cloneMap.get(componentEl);
  if (clone) {
    cloneMap.delete(componentEl);
    clone.remove();
  }
  componentEl.style.pointerEvents = "";
  inputEl.style.transform = "";
};
const enableHideCaretOnScroll = (componentEl, inputEl, scrollEl) => {
  if (!scrollEl || !inputEl) {
    return () => {
      return;
    };
  }
  const scrollHideCaret = (shouldHideCaret) => {
    if (isFocused(inputEl)) {
      relocateInput(componentEl, inputEl, shouldHideCaret);
    }
  };
  const onBlur = () => relocateInput(componentEl, inputEl, false);
  const hideCaret = () => scrollHideCaret(true);
  const showCaret = () => scrollHideCaret(false);
  addEventListener(scrollEl, "ionScrollStart", hideCaret);
  addEventListener(scrollEl, "ionScrollEnd", showCaret);
  inputEl.addEventListener("blur", onBlur);
  return () => {
    removeEventListener(scrollEl, "ionScrollStart", hideCaret);
    removeEventListener(scrollEl, "ionScrollEnd", showCaret);
    inputEl.addEventListener("ionBlur", onBlur);
  };
};
const SKIP_SELECTOR = "input, textarea, [no-blur], [contenteditable]";
const enableInputBlurring = () => {
  let focused = true;
  let didScroll = false;
  const doc = document;
  const onScroll = () => {
    didScroll = true;
  };
  const onFocusin = () => {
    focused = true;
  };
  const onTouchend = (ev) => {
    if (didScroll) {
      didScroll = false;
      return;
    }
    const active = doc.activeElement;
    if (!active) {
      return;
    }
    if (active.matches(SKIP_SELECTOR)) {
      return;
    }
    const tapped = ev.target;
    if (tapped === active) {
      return;
    }
    if (tapped.matches(SKIP_SELECTOR) || tapped.closest(SKIP_SELECTOR)) {
      return;
    }
    focused = false;
    setTimeout(() => {
      if (!focused) {
        active.blur();
      }
    }, 50);
  };
  addEventListener(doc, "ionScrollStart", onScroll);
  doc.addEventListener("focusin", onFocusin, true);
  doc.addEventListener("touchend", onTouchend, false);
  return () => {
    removeEventListener(doc, "ionScrollStart", onScroll, true);
    doc.removeEventListener("focusin", onFocusin, true);
    doc.removeEventListener("touchend", onTouchend, false);
  };
};
const SCROLL_ASSIST_SPEED = 0.3;
const getScrollData = (componentEl, contentEl, keyboardHeight) => {
  var _a;
  const itemEl = (_a = componentEl.closest("ion-item,[ion-item]")) !== null && _a !== void 0 ? _a : componentEl;
  return calcScrollData(itemEl.getBoundingClientRect(), contentEl.getBoundingClientRect(), keyboardHeight, componentEl.ownerDocument.defaultView.innerHeight);
};
const calcScrollData = (inputRect, contentRect, keyboardHeight, platformHeight) => {
  const inputTop = inputRect.top;
  const inputBottom = inputRect.bottom;
  const visibleAreaTop = contentRect.top;
  const visibleAreaBottom = Math.min(contentRect.bottom, platformHeight - keyboardHeight);
  const safeAreaTop = visibleAreaTop + 15;
  const safeAreaBottom = visibleAreaBottom * 0.75;
  const distanceToBottom = safeAreaBottom - inputBottom;
  const distanceToTop = safeAreaTop - inputTop;
  const desiredScrollAmount = Math.round(distanceToBottom < 0 ? -distanceToBottom : distanceToTop > 0 ? -distanceToTop : 0);
  const scrollAmount = Math.min(desiredScrollAmount, inputTop - visibleAreaTop);
  const distance = Math.abs(scrollAmount);
  const duration = distance / SCROLL_ASSIST_SPEED;
  const scrollDuration = Math.min(400, Math.max(150, duration));
  return {
    scrollAmount,
    scrollDuration,
    scrollPadding: keyboardHeight,
    inputSafeY: -(inputTop - safeAreaTop) + 4
  };
};
const enableScrollAssist = (componentEl, inputEl, contentEl, footerEl, keyboardHeight, disableClonedInput = false) => {
  let coord;
  const touchStart = (ev) => {
    coord = pointerCoord(ev);
  };
  const touchEnd = (ev) => {
    if (!coord) {
      return;
    }
    const endCoord = pointerCoord(ev);
    if (!hasPointerMoved(6, coord, endCoord) && !isFocused(inputEl)) {
      jsSetFocus(componentEl, inputEl, contentEl, footerEl, keyboardHeight, disableClonedInput);
    }
  };
  componentEl.addEventListener("touchstart", touchStart, { capture: true, passive: true });
  componentEl.addEventListener("touchend", touchEnd, true);
  return () => {
    componentEl.removeEventListener("touchstart", touchStart, true);
    componentEl.removeEventListener("touchend", touchEnd, true);
  };
};
const jsSetFocus = async (componentEl, inputEl, contentEl, footerEl, keyboardHeight, disableClonedInput = false) => {
  if (!contentEl && !footerEl) {
    return;
  }
  const scrollData = getScrollData(componentEl, contentEl || footerEl, keyboardHeight);
  if (contentEl && Math.abs(scrollData.scrollAmount) < 4) {
    inputEl.focus();
    return;
  }
  relocateInput(componentEl, inputEl, true, scrollData.inputSafeY, disableClonedInput);
  inputEl.focus();
  raf(() => componentEl.click());
};
const hasPointerMoved = (threshold, startCoord, endCoord) => {
  if (startCoord && endCoord) {
    const deltaX = startCoord.x - endCoord.x;
    const deltaY = startCoord.y - endCoord.y;
    const distance = deltaX * deltaX + deltaY * deltaY;
    return distance > threshold * threshold;
  }
  return false;
};
const PADDING_TIMER_KEY = "$ionPaddingTimer";
const enableScrollPadding = (keyboardHeight) => {
  const doc = document;
  const onFocusin = (ev) => {
    setScrollPadding(ev.target, keyboardHeight);
  };
  const onFocusout = (ev) => {
    setScrollPadding(ev.target, 0);
  };
  doc.addEventListener("focusin", onFocusin);
  doc.addEventListener("focusout", onFocusout);
  return () => {
    doc.removeEventListener("focusin", onFocusin);
    doc.removeEventListener("focusout", onFocusout);
  };
};
const setScrollPadding = (input, keyboardHeight) => {
  var _a, _b;
  if (input.tagName !== "INPUT") {
    return;
  }
  if (input.parentElement && input.parentElement.tagName === "ION-INPUT") {
    return;
  }
  if (((_b = (_a = input.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.tagName) === "ION-SEARCHBAR") {
    return;
  }
  const el = findClosestIonContent(input);
  if (el === null) {
    return;
  }
  const timer = el[PADDING_TIMER_KEY];
  if (timer) {
    clearTimeout(timer);
  }
  if (keyboardHeight > 0) {
    el.style.setProperty("--keyboard-offset", `${keyboardHeight}px`);
  } else {
    el[PADDING_TIMER_KEY] = setTimeout(() => {
      el.style.setProperty("--keyboard-offset", "0px");
    }, 120);
  }
};
const INPUT_BLURRING = true;
const SCROLL_PADDING = true;
const startInputShims = (config, platform) => {
  const doc = document;
  const isIOS = platform === "ios";
  const isAndroid = platform === "android";
  const keyboardHeight = config.getNumber("keyboardHeight", 290);
  const scrollAssist = config.getBoolean("scrollAssist", true);
  const hideCaret = config.getBoolean("hideCaretOnScroll", isIOS);
  const inputBlurring = config.getBoolean("inputBlurring", isIOS);
  const scrollPadding = config.getBoolean("scrollPadding", true);
  const inputs = Array.from(doc.querySelectorAll("ion-input, ion-textarea"));
  const hideCaretMap = /* @__PURE__ */ new WeakMap();
  const scrollAssistMap = /* @__PURE__ */ new WeakMap();
  const registerInput = async (componentEl) => {
    await new Promise((resolve) => componentOnReady(componentEl, resolve));
    const inputRoot = componentEl.shadowRoot || componentEl;
    const inputEl = inputRoot.querySelector("input") || inputRoot.querySelector("textarea");
    const scrollEl = findClosestIonContent(componentEl);
    const footerEl = !scrollEl ? componentEl.closest("ion-footer") : null;
    if (!inputEl) {
      return;
    }
    if (!!scrollEl && hideCaret && !hideCaretMap.has(componentEl)) {
      const rmFn = enableHideCaretOnScroll(componentEl, inputEl, scrollEl);
      hideCaretMap.set(componentEl, rmFn);
    }
    const isDateInput = inputEl.type === "date" || inputEl.type === "datetime-local";
    if (!isDateInput && (!!scrollEl || !!footerEl) && scrollAssist && !scrollAssistMap.has(componentEl)) {
      const rmFn = enableScrollAssist(componentEl, inputEl, scrollEl, footerEl, keyboardHeight, isAndroid);
      scrollAssistMap.set(componentEl, rmFn);
    }
  };
  const unregisterInput = (componentEl) => {
    if (hideCaret) {
      const fn = hideCaretMap.get(componentEl);
      if (fn) {
        fn();
      }
      hideCaretMap.delete(componentEl);
    }
    if (scrollAssist) {
      const fn = scrollAssistMap.get(componentEl);
      if (fn) {
        fn();
      }
      scrollAssistMap.delete(componentEl);
    }
  };
  if (inputBlurring && INPUT_BLURRING) {
    enableInputBlurring();
  }
  if (scrollPadding && SCROLL_PADDING) {
    enableScrollPadding(keyboardHeight);
  }
  for (const input of inputs) {
    registerInput(input);
  }
  doc.addEventListener("ionInputDidLoad", (ev) => {
    registerInput(ev.detail);
  });
  doc.addEventListener("ionInputDidUnload", (ev) => {
    unregisterInput(ev.detail);
  });
};
export {
  startInputShims
};
//# sourceMappingURL=input-shims.44a57a07.js.map
