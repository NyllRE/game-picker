import { I as IonPage, a as IonHeader, b as IonToolbar, c as IonThumbnail, d as IonImg, e as IonTitle, f as IonContent, g as IonList, h as IonItem, i as IonCheckbox, j as IonLabel, k as IonNote, l as IonBadge } from "../server.mjs";
import { defineComponent, withCtx, createVNode, createTextVNode, useSSRContext } from "vue";
import { ssrRenderComponent } from "vue/server-renderer";
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
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "tab1",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ion_page = IonPage;
      const _component_ion_header = IonHeader;
      const _component_ion_toolbar = IonToolbar;
      const _component_ion_thumbnail = IonThumbnail;
      const _component_ion_img = IonImg;
      const _component_ion_title = IonTitle;
      const _component_ion_content = IonContent;
      const _component_ion_list = IonList;
      const _component_ion_item = IonItem;
      const _component_ion_checkbox = IonCheckbox;
      const _component_ion_label = IonLabel;
      const _component_ion_note = IonNote;
      const _component_ion_badge = IonBadge;
      _push(ssrRenderComponent(_component_ion_page, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_ion_header, { translucent: "" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_ion_toolbar, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_ion_thumbnail, { slot: "start" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_ion_img, { src: "/icon.png" }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_ion_img, { src: "/icon.png" })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_ion_title, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Nuxt Ionic`);
                            } else {
                              return [
                                createTextVNode("Nuxt Ionic")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_ion_thumbnail, { slot: "start" }, {
                            default: withCtx(() => [
                              createVNode(_component_ion_img, { src: "/icon.png" })
                            ]),
                            _: 1
                          }),
                          createVNode(_component_ion_title, null, {
                            default: withCtx(() => [
                              createTextVNode("Nuxt Ionic")
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
                        createVNode(_component_ion_thumbnail, { slot: "start" }, {
                          default: withCtx(() => [
                            createVNode(_component_ion_img, { src: "/icon.png" })
                          ]),
                          _: 1
                        }),
                        createVNode(_component_ion_title, null, {
                          default: withCtx(() => [
                            createTextVNode("Nuxt Ionic")
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
                                    _push6(`Tab 1`);
                                  } else {
                                    return [
                                      createTextVNode("Tab 1")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_ion_title, { size: "large" }, {
                                  default: withCtx(() => [
                                    createTextVNode("Tab 1")
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
                                  createTextVNode("Tab 1")
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
                  _push3(ssrRenderComponent(_component_ion_list, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_ion_item, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_ion_checkbox, { slot: "start" }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_ion_label, null, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`<h1${_scopeId5}>Create Idea</h1>`);
                                    _push6(ssrRenderComponent(_component_ion_note, null, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`Run Idea By Brandy`);
                                        } else {
                                          return [
                                            createTextVNode("Run Idea By Brandy")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode("h1", null, "Create Idea"),
                                      createVNode(_component_ion_note, null, {
                                        default: withCtx(() => [
                                          createTextVNode("Run Idea By Brandy")
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_ion_badge, {
                                slot: "end",
                                color: "success"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`5 Days`);
                                  } else {
                                    return [
                                      createTextVNode("5 Days")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_ion_checkbox, { slot: "start" }),
                                createVNode(_component_ion_label, null, {
                                  default: withCtx(() => [
                                    createVNode("h1", null, "Create Idea"),
                                    createVNode(_component_ion_note, null, {
                                      default: withCtx(() => [
                                        createTextVNode("Run Idea By Brandy")
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_ion_badge, {
                                  slot: "end",
                                  color: "success"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("5 Days")
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
                          createVNode(_component_ion_item, null, {
                            default: withCtx(() => [
                              createVNode(_component_ion_checkbox, { slot: "start" }),
                              createVNode(_component_ion_label, null, {
                                default: withCtx(() => [
                                  createVNode("h1", null, "Create Idea"),
                                  createVNode(_component_ion_note, null, {
                                    default: withCtx(() => [
                                      createTextVNode("Run Idea By Brandy")
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(_component_ion_badge, {
                                slot: "end",
                                color: "success"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("5 Days")
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
                    createVNode(_component_ion_header, { collapse: "condense" }, {
                      default: withCtx(() => [
                        createVNode(_component_ion_toolbar, null, {
                          default: withCtx(() => [
                            createVNode(_component_ion_title, { size: "large" }, {
                              default: withCtx(() => [
                                createTextVNode("Tab 1")
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(_component_ion_list, null, {
                      default: withCtx(() => [
                        createVNode(_component_ion_item, null, {
                          default: withCtx(() => [
                            createVNode(_component_ion_checkbox, { slot: "start" }),
                            createVNode(_component_ion_label, null, {
                              default: withCtx(() => [
                                createVNode("h1", null, "Create Idea"),
                                createVNode(_component_ion_note, null, {
                                  default: withCtx(() => [
                                    createTextVNode("Run Idea By Brandy")
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }),
                            createVNode(_component_ion_badge, {
                              slot: "end",
                              color: "success"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("5 Days")
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
              createVNode(_component_ion_header, { translucent: "" }, {
                default: withCtx(() => [
                  createVNode(_component_ion_toolbar, null, {
                    default: withCtx(() => [
                      createVNode(_component_ion_thumbnail, { slot: "start" }, {
                        default: withCtx(() => [
                          createVNode(_component_ion_img, { src: "/icon.png" })
                        ]),
                        _: 1
                      }),
                      createVNode(_component_ion_title, null, {
                        default: withCtx(() => [
                          createTextVNode("Nuxt Ionic")
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
                              createTextVNode("Tab 1")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode(_component_ion_list, null, {
                    default: withCtx(() => [
                      createVNode(_component_ion_item, null, {
                        default: withCtx(() => [
                          createVNode(_component_ion_checkbox, { slot: "start" }),
                          createVNode(_component_ion_label, null, {
                            default: withCtx(() => [
                              createVNode("h1", null, "Create Idea"),
                              createVNode(_component_ion_note, null, {
                                default: withCtx(() => [
                                  createTextVNode("Run Idea By Brandy")
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          createVNode(_component_ion_badge, {
                            slot: "end",
                            color: "success"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("5 Days")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/tabs/tab1.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=tab1.a5e649a3.js.map
