import { _ as _export_sfc, I as IonPage, a as IonHeader, b as IonToolbar, e as IonTitle, f as IonContent } from "../server.mjs";
import { defineComponent, mergeProps, useSSRContext, withCtx, createTextVNode, createVNode } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
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
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ExploreContainer",
  __ssrInlineRender: true,
  props: { name: String },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ id: "container" }, _attrs))} data-v-38915575><strong data-v-38915575>${ssrInterpolate(__props.name)}</strong><p data-v-38915575>Explore <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components" data-v-38915575>UI Components</a></p></div>`);
    };
  }
});
const ExploreContainer_vue_vue_type_style_index_0_scoped_38915575_lang = "";
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ExploreContainer.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_5 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-38915575"]]);
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_ion_page = IonPage;
  const _component_ion_header = IonHeader;
  const _component_ion_toolbar = IonToolbar;
  const _component_ion_title = IonTitle;
  const _component_ion_content = IonContent;
  const _component_ExploreContainer = __nuxt_component_5;
  _push(ssrRenderComponent(_component_ion_page, _attrs, {
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
                          _push5(`Tab 3`);
                        } else {
                          return [
                            createTextVNode("Tab 3")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                  } else {
                    return [
                      createVNode(_component_ion_title, null, {
                        default: withCtx(() => [
                          createTextVNode("Tab 3")
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
                        createTextVNode("Tab 3")
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
        _push2(ssrRenderComponent(_component_ion_content, { fullscreen: true }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(ssrRenderComponent(_component_ion_header, { collapse: "condense" }, {
                default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(ssrRenderComponent(_component_ion_toolbar, null, {
                      default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                        if (_push5) {
                          _push5(ssrRenderComponent(_component_ion_title, { size: "large" }, {
                            default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                              if (_push6) {
                                _push6(`Tab 3`);
                              } else {
                                return [
                                  createTextVNode("Tab 3")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent5, _scopeId4));
                        } else {
                          return [
                            createVNode(_component_ion_title, { size: "large" }, {
                              default: withCtx(() => [
                                createTextVNode("Tab 3")
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                  } else {
                    return [
                      createVNode(_component_ion_toolbar, null, {
                        default: withCtx(() => [
                          createVNode(_component_ion_title, { size: "large" }, {
                            default: withCtx(() => [
                              createTextVNode("Tab 3")
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
              }, _parent3, _scopeId2));
              _push3(ssrRenderComponent(_component_ExploreContainer, { name: "Tab 3 page" }, null, _parent3, _scopeId2));
            } else {
              return [
                createVNode(_component_ion_header, { collapse: "condense" }, {
                  default: withCtx(() => [
                    createVNode(_component_ion_toolbar, null, {
                      default: withCtx(() => [
                        createVNode(_component_ion_title, { size: "large" }, {
                          default: withCtx(() => [
                            createTextVNode("Tab 3")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createVNode(_component_ExploreContainer, { name: "Tab 3 page" })
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
                      createTextVNode("Tab 3")
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            _: 1
          }),
          createVNode(_component_ion_content, { fullscreen: true }, {
            default: withCtx(() => [
              createVNode(_component_ion_header, { collapse: "condense" }, {
                default: withCtx(() => [
                  createVNode(_component_ion_toolbar, null, {
                    default: withCtx(() => [
                      createVNode(_component_ion_title, { size: "large" }, {
                        default: withCtx(() => [
                          createTextVNode("Tab 3")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(_component_ExploreContainer, { name: "Tab 3 page" })
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/tabs/tab3.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const tab3 = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  tab3 as default
};
//# sourceMappingURL=tab3.03a9124a.js.map
