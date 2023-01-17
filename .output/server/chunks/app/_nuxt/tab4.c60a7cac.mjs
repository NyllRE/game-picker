import { _ as _export_sfc, u as createAnimation, I as IonPage, a as IonHeader, b as IonToolbar, e as IonTitle, f as IonContent, v as IonInput, w as IonButton } from '../server.mjs';
import { ref, withCtx, createTextVNode, createVNode, unref, isRef, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import 'ofetch';
import 'hookable';
import 'unctx';
import 'ufo';
import 'h3';
import 'vue-router';
import '@unhead/vue';
import '@unhead/dom';
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

const _sfc_main = {
  __name: "tab4",
  __ssrInlineRender: true,
  setup(__props) {
    const squareRef = ref();
    createAnimation().addElement(squareRef.value).duration(3e3).keyframes([
      { offset: 0, background: "red" },
      { offset: 1, background: "green" }
    ]);
    const data = ref("fetchin");
    const url = ref("");
    const tryInternet = async () => {
      data.value = await $fetch(url.value).then((res) => res).catch((e) => "error: " + e);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_IonPage = IonPage;
      const _component_ion_header = IonHeader;
      const _component_ion_toolbar = IonToolbar;
      const _component_ion_title = IonTitle;
      const _component_IonContent = IonContent;
      const _component_IonInput = IonInput;
      const _component_IonButton = IonButton;
      _push(ssrRenderComponent(_component_IonPage, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_ion_header, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_ion_toolbar, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_ion_title, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Animation examples`);
                            } else {
                              return [
                                createTextVNode("Animation examples")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_ion_title, null, {
                            default: withCtx(() => [
                              createTextVNode("Animation examples")
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_ion_toolbar, null, {
                      default: withCtx(() => [
                        createVNode(_component_ion_title, null, {
                          default: withCtx(() => [
                            createTextVNode("Animation examples")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_IonContent, { fullscreen: true }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="ion-padding" data-v-389e6c4e${_scopeId2}><h1 data-v-389e6c4e${_scopeId2}>${ssrInterpolate(unref(data))}</h1>`);
                  _push3(ssrRenderComponent(_component_IonInput, {
                    modelValue: unref(url),
                    "onUpdate:modelValue": ($event) => isRef(url) ? url.value = $event : null,
                    placeholder: "try"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_IonButton, {
                    expand: "block",
                    onClick: tryInternet
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Get`);
                      } else {
                        return [
                          createTextVNode("Get")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "ion-padding" }, [
                      createVNode("h1", null, toDisplayString(unref(data)), 1),
                      createVNode(_component_IonInput, {
                        modelValue: unref(url),
                        "onUpdate:modelValue": ($event) => isRef(url) ? url.value = $event : null,
                        placeholder: "try"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(_component_IonButton, {
                        expand: "block",
                        onClick: tryInternet
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Get")
                        ]),
                        _: 1
                      })
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_ion_header, null, {
                default: withCtx(() => [
                  createVNode(_component_ion_toolbar, null, {
                    default: withCtx(() => [
                      createVNode(_component_ion_title, null, {
                        default: withCtx(() => [
                          createTextVNode("Animation examples")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(_component_IonContent, { fullscreen: true }, {
                default: withCtx(() => [
                  createVNode("div", { class: "ion-padding" }, [
                    createVNode("h1", null, toDisplayString(unref(data)), 1),
                    createVNode(_component_IonInput, {
                      modelValue: unref(url),
                      "onUpdate:modelValue": ($event) => isRef(url) ? url.value = $event : null,
                      placeholder: "try"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(_component_IonButton, {
                      expand: "block",
                      onClick: tryInternet
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Get")
                      ]),
                      _: 1
                    })
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/tabs/tab4.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const tab4 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-389e6c4e"]]);

export { tab4 as default };
//# sourceMappingURL=tab4.c60a7cac.mjs.map
