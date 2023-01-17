import { I as IonPage, f as IonContent, x as IonTabs, y as IonRouterOutlet, z as IonTabBar, A as IonTabButton, s as IonIcon, j as IonLabel } from '../server.mjs';
import { u as useHead } from './composables.963ce5a4.mjs';
import { h as home, i as images, b as bulb, d as accessibility } from './index.d4e758c0.mjs';
import { defineComponent, withCtx, unref, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "tabs",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Nuxt Ionic"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ion_page = IonPage;
      const _component_ion_content = IonContent;
      const _component_ion_tabs = IonTabs;
      const _component_ion_router_outlet = IonRouterOutlet;
      const _component_ion_tab_bar = IonTabBar;
      const _component_ion_tab_button = IonTabButton;
      const _component_ion_icon = IonIcon;
      const _component_ion_label = IonLabel;
      _push(ssrRenderComponent(_component_ion_page, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_ion_content, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_ion_tabs, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_ion_router_outlet, null, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_ion_tab_bar, { slot: "bottom" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_ion_tab_button, {
                                tab: "tab1",
                                href: "/tabs/tab1"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_ion_icon, { icon: unref(home) }, null, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(_component_ion_label, null, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`Tab 1`);
                                        } else {
                                          return [
                                            createTextVNode("Tab 1")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_ion_icon, { icon: unref(home) }, null, 8, ["icon"]),
                                      createVNode(_component_ion_label, null, {
                                        default: withCtx(() => [
                                          createTextVNode("Tab 1")
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_ion_tab_button, {
                                tab: "tab2",
                                href: "/tabs/tab2"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_ion_icon, { icon: unref(images) }, null, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(_component_ion_label, null, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`Photos`);
                                        } else {
                                          return [
                                            createTextVNode("Photos")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_ion_icon, { icon: unref(images) }, null, 8, ["icon"]),
                                      createVNode(_component_ion_label, null, {
                                        default: withCtx(() => [
                                          createTextVNode("Photos")
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_ion_tab_button, {
                                tab: "tab3",
                                href: "/tabs/tab3"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_ion_icon, { icon: unref(bulb) }, null, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(_component_ion_label, null, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`Tab 3`);
                                        } else {
                                          return [
                                            createTextVNode("Tab 3")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_ion_icon, { icon: unref(bulb) }, null, 8, ["icon"]),
                                      createVNode(_component_ion_label, null, {
                                        default: withCtx(() => [
                                          createTextVNode("Tab 3")
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_ion_tab_button, {
                                tab: "tab4",
                                href: "/tabs/tab4"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_ion_icon, { icon: unref(accessibility) }, null, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(_component_ion_label, null, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`Animations`);
                                        } else {
                                          return [
                                            createTextVNode("Animations")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_ion_icon, { icon: unref(accessibility) }, null, 8, ["icon"]),
                                      createVNode(_component_ion_label, null, {
                                        default: withCtx(() => [
                                          createTextVNode("Animations")
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_ion_tab_button, {
                                  tab: "tab1",
                                  href: "/tabs/tab1"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_ion_icon, { icon: unref(home) }, null, 8, ["icon"]),
                                    createVNode(_component_ion_label, null, {
                                      default: withCtx(() => [
                                        createTextVNode("Tab 1")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_ion_tab_button, {
                                  tab: "tab2",
                                  href: "/tabs/tab2"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_ion_icon, { icon: unref(images) }, null, 8, ["icon"]),
                                    createVNode(_component_ion_label, null, {
                                      default: withCtx(() => [
                                        createTextVNode("Photos")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_ion_tab_button, {
                                  tab: "tab3",
                                  href: "/tabs/tab3"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_ion_icon, { icon: unref(bulb) }, null, 8, ["icon"]),
                                    createVNode(_component_ion_label, null, {
                                      default: withCtx(() => [
                                        createTextVNode("Tab 3")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_ion_tab_button, {
                                  tab: "tab4",
                                  href: "/tabs/tab4"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_ion_icon, { icon: unref(accessibility) }, null, 8, ["icon"]),
                                    createVNode(_component_ion_label, null, {
                                      default: withCtx(() => [
                                        createTextVNode("Animations")
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
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_ion_router_outlet),
                          createVNode(_component_ion_tab_bar, { slot: "bottom" }, {
                            default: withCtx(() => [
                              createVNode(_component_ion_tab_button, {
                                tab: "tab1",
                                href: "/tabs/tab1"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_ion_icon, { icon: unref(home) }, null, 8, ["icon"]),
                                  createVNode(_component_ion_label, null, {
                                    default: withCtx(() => [
                                      createTextVNode("Tab 1")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(_component_ion_tab_button, {
                                tab: "tab2",
                                href: "/tabs/tab2"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_ion_icon, { icon: unref(images) }, null, 8, ["icon"]),
                                  createVNode(_component_ion_label, null, {
                                    default: withCtx(() => [
                                      createTextVNode("Photos")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(_component_ion_tab_button, {
                                tab: "tab3",
                                href: "/tabs/tab3"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_ion_icon, { icon: unref(bulb) }, null, 8, ["icon"]),
                                  createVNode(_component_ion_label, null, {
                                    default: withCtx(() => [
                                      createTextVNode("Tab 3")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(_component_ion_tab_button, {
                                tab: "tab4",
                                href: "/tabs/tab4"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_ion_icon, { icon: unref(accessibility) }, null, 8, ["icon"]),
                                  createVNode(_component_ion_label, null, {
                                    default: withCtx(() => [
                                      createTextVNode("Animations")
                                    ]),
                                    _: 1
                                  })
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
                } else {
                  return [
                    createVNode(_component_ion_tabs, null, {
                      default: withCtx(() => [
                        createVNode(_component_ion_router_outlet),
                        createVNode(_component_ion_tab_bar, { slot: "bottom" }, {
                          default: withCtx(() => [
                            createVNode(_component_ion_tab_button, {
                              tab: "tab1",
                              href: "/tabs/tab1"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_ion_icon, { icon: unref(home) }, null, 8, ["icon"]),
                                createVNode(_component_ion_label, null, {
                                  default: withCtx(() => [
                                    createTextVNode("Tab 1")
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }),
                            createVNode(_component_ion_tab_button, {
                              tab: "tab2",
                              href: "/tabs/tab2"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_ion_icon, { icon: unref(images) }, null, 8, ["icon"]),
                                createVNode(_component_ion_label, null, {
                                  default: withCtx(() => [
                                    createTextVNode("Photos")
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }),
                            createVNode(_component_ion_tab_button, {
                              tab: "tab3",
                              href: "/tabs/tab3"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_ion_icon, { icon: unref(bulb) }, null, 8, ["icon"]),
                                createVNode(_component_ion_label, null, {
                                  default: withCtx(() => [
                                    createTextVNode("Tab 3")
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }),
                            createVNode(_component_ion_tab_button, {
                              tab: "tab4",
                              href: "/tabs/tab4"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_ion_icon, { icon: unref(accessibility) }, null, 8, ["icon"]),
                                createVNode(_component_ion_label, null, {
                                  default: withCtx(() => [
                                    createTextVNode("Animations")
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            })
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
          } else {
            return [
              createVNode(_component_ion_content, null, {
                default: withCtx(() => [
                  createVNode(_component_ion_tabs, null, {
                    default: withCtx(() => [
                      createVNode(_component_ion_router_outlet),
                      createVNode(_component_ion_tab_bar, { slot: "bottom" }, {
                        default: withCtx(() => [
                          createVNode(_component_ion_tab_button, {
                            tab: "tab1",
                            href: "/tabs/tab1"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_ion_icon, { icon: unref(home) }, null, 8, ["icon"]),
                              createVNode(_component_ion_label, null, {
                                default: withCtx(() => [
                                  createTextVNode("Tab 1")
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          createVNode(_component_ion_tab_button, {
                            tab: "tab2",
                            href: "/tabs/tab2"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_ion_icon, { icon: unref(images) }, null, 8, ["icon"]),
                              createVNode(_component_ion_label, null, {
                                default: withCtx(() => [
                                  createTextVNode("Photos")
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          createVNode(_component_ion_tab_button, {
                            tab: "tab3",
                            href: "/tabs/tab3"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_ion_icon, { icon: unref(bulb) }, null, 8, ["icon"]),
                              createVNode(_component_ion_label, null, {
                                default: withCtx(() => [
                                  createTextVNode("Tab 3")
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          createVNode(_component_ion_tab_button, {
                            tab: "tab4",
                            href: "/tabs/tab4"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_ion_icon, { icon: unref(accessibility) }, null, 8, ["icon"]),
                              createVNode(_component_ion_label, null, {
                                default: withCtx(() => [
                                  createTextVNode("Animations")
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
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
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/tabs.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=tabs.2921fc2a.mjs.map
