import { Q as getIonPageElement, u as createAnimation } from '../server.mjs';
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
const mdTransitionAnimation = (_, opts) => {
  var _a, _b, _c;
  const OFF_BOTTOM = "40px";
  const CENTER = "0px";
  const backDirection = opts.direction === "back";
  const enteringEl = opts.enteringEl;
  const leavingEl = opts.leavingEl;
  const ionPageElement = getIonPageElement(enteringEl);
  const enteringToolbarEle = ionPageElement.querySelector("ion-toolbar");
  const rootTransition = createAnimation();
  rootTransition.addElement(ionPageElement).fill("both").beforeRemoveClass("ion-page-invisible");
  if (backDirection) {
    rootTransition.duration(((_a = opts.duration) !== null && _a !== void 0 ? _a : 0) || 200).easing("cubic-bezier(0.47,0,0.745,0.715)");
  } else {
    rootTransition.duration(((_b = opts.duration) !== null && _b !== void 0 ? _b : 0) || 280).easing("cubic-bezier(0.36,0.66,0.04,1)").fromTo("transform", `translateY(${OFF_BOTTOM})`, `translateY(${CENTER})`).fromTo("opacity", 0.01, 1);
  }
  if (enteringToolbarEle) {
    const enteringToolBar = createAnimation();
    enteringToolBar.addElement(enteringToolbarEle);
    rootTransition.addAnimation(enteringToolBar);
  }
  if (leavingEl && backDirection) {
    rootTransition.duration(((_c = opts.duration) !== null && _c !== void 0 ? _c : 0) || 200).easing("cubic-bezier(0.47,0,0.745,0.715)");
    const leavingPage = createAnimation();
    leavingPage.addElement(getIonPageElement(leavingEl)).onFinish((currentStep) => {
      if (currentStep === 1 && leavingPage.elements.length > 0) {
        leavingPage.elements[0].style.setProperty("display", "none");
      }
    }).fromTo("transform", `translateY(${CENTER})`, `translateY(${OFF_BOTTOM})`).fromTo("opacity", 1, 0);
    rootTransition.addAnimation(leavingPage);
  }
  return rootTransition;
};

export { mdTransitionAnimation };
//# sourceMappingURL=md.transition.da3f83a9.mjs.map
