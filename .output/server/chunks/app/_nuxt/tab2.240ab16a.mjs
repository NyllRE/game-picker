import { t as actionSheetController, I as IonPage, a as IonHeader, b as IonToolbar, e as IonTitle, f as IonContent, n as IonGrid, o as IonRow, p as IonCol, d as IonImg, q as IonFab, r as IonFabButton, s as IonIcon, m as isPlatform } from '../server.mjs';
import { defineComponent, withCtx, createTextVNode, createVNode, unref, openBlock, createBlock, Fragment, renderList, useSSRContext, ref, watch } from 'vue';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Storage } from '@capacitor/storage';
import { c as camera, t as trash, a as close } from './index.d4e758c0.mjs';
import { ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
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

function usePhotoGallery() {
  const photos = ref([]);
  const PHOTO_STORAGE = "photos";
  const convertBlobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
  const savePicture = async (photo, fileName) => {
    let base64Data;
    if (isPlatform("hybrid")) {
      const file = await Filesystem.readFile({
        path: photo.path
      });
      base64Data = file.data;
    } else {
      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      base64Data = await convertBlobToBase64(blob);
    }
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });
    if (isPlatform("hybrid")) {
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri)
      };
    } else {
      return {
        filepath: fileName,
        webviewPath: photo.webPath
      };
    }
  };
  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });
    const fileName = new Date().getTime() + ".jpeg";
    const savedFileImage = await savePicture(photo, fileName);
    photos.value = [savedFileImage, ...photos.value];
  };
  const deletePhoto = async (photo) => {
    photos.value = photos.value.filter((p) => p.filepath !== photo.filepath);
    const filename = photo.filepath.substr(photo.filepath.lastIndexOf("/") + 1);
    await Filesystem.deleteFile({
      path: filename,
      directory: Directory.Data
    });
  };
  const cachePhotos = () => {
    Storage.set({
      key: PHOTO_STORAGE,
      value: JSON.stringify(photos.value)
    });
  };
  watch(photos, cachePhotos);
  return {
    photos,
    takePhoto,
    deletePhoto
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "tab2",
  __ssrInlineRender: true,
  setup(__props) {
    const { photos, takePhoto, deletePhoto } = usePhotoGallery();
    const showActionSheet = async (photo) => {
      const actionSheet = await actionSheetController.create({
        header: "Photos",
        buttons: [
          {
            text: "Delete",
            role: "destructive",
            icon: trash,
            handler: () => {
              deletePhoto(photo);
            }
          },
          {
            text: "Cancel",
            icon: close,
            role: "cancel",
            handler: () => {
            }
          }
        ]
      });
      await actionSheet.present();
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ion_page = IonPage;
      const _component_ion_header = IonHeader;
      const _component_ion_toolbar = IonToolbar;
      const _component_ion_title = IonTitle;
      const _component_ion_content = IonContent;
      const _component_ion_grid = IonGrid;
      const _component_ion_row = IonRow;
      const _component_ion_col = IonCol;
      const _component_ion_img = IonImg;
      const _component_ion_fab = IonFab;
      const _component_ion_fab_button = IonFabButton;
      const _component_ion_icon = IonIcon;
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
                              _push5(`Photo Gallery`);
                            } else {
                              return [
                                createTextVNode("Photo Gallery")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_ion_title, null, {
                            default: withCtx(() => [
                              createTextVNode("Photo Gallery")
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
                            createTextVNode("Photo Gallery")
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
                                    _push6(`Photo Gallery`);
                                  } else {
                                    return [
                                      createTextVNode("Photo Gallery")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_ion_title, { size: "large" }, {
                                  default: withCtx(() => [
                                    createTextVNode("Photo Gallery")
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
                                  createTextVNode("Photo Gallery")
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
                  _push3(ssrRenderComponent(_component_ion_grid, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_ion_row, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<!--[-->`);
                              ssrRenderList(unref(photos), (photo) => {
                                _push5(ssrRenderComponent(_component_ion_col, {
                                  size: "6",
                                  key: photo.filepath
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(_component_ion_img, {
                                        src: photo.webviewPath,
                                        onClick: ($event) => showActionSheet(photo)
                                      }, null, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(_component_ion_img, {
                                          src: photo.webviewPath,
                                          onClick: ($event) => showActionSheet(photo)
                                        }, null, 8, ["src", "onClick"])
                                      ];
                                    }
                                  }),
                                  _: 2
                                }, _parent5, _scopeId4));
                              });
                              _push5(`<!--]-->`);
                            } else {
                              return [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(photos), (photo) => {
                                  return openBlock(), createBlock(_component_ion_col, {
                                    size: "6",
                                    key: photo.filepath
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_ion_img, {
                                        src: photo.webviewPath,
                                        onClick: ($event) => showActionSheet(photo)
                                      }, null, 8, ["src", "onClick"])
                                    ]),
                                    _: 2
                                  }, 1024);
                                }), 128))
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_ion_row, null, {
                            default: withCtx(() => [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(photos), (photo) => {
                                return openBlock(), createBlock(_component_ion_col, {
                                  size: "6",
                                  key: photo.filepath
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_ion_img, {
                                      src: photo.webviewPath,
                                      onClick: ($event) => showActionSheet(photo)
                                    }, null, 8, ["src", "onClick"])
                                  ]),
                                  _: 2
                                }, 1024);
                              }), 128))
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_ion_fab, {
                    vertical: "bottom",
                    horizontal: "center",
                    slot: "fixed"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_ion_fab_button, {
                          onClick: ($event) => unref(takePhoto)()
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_ion_icon, { icon: unref(camera) }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_ion_icon, { icon: unref(camera) }, null, 8, ["icon"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_ion_fab_button, {
                            onClick: ($event) => unref(takePhoto)()
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_ion_icon, { icon: unref(camera) }, null, 8, ["icon"])
                            ]),
                            _: 1
                          }, 8, ["onClick"])
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
                                createTextVNode("Photo Gallery")
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(_component_ion_grid, null, {
                      default: withCtx(() => [
                        createVNode(_component_ion_row, null, {
                          default: withCtx(() => [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(photos), (photo) => {
                              return openBlock(), createBlock(_component_ion_col, {
                                size: "6",
                                key: photo.filepath
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_ion_img, {
                                    src: photo.webviewPath,
                                    onClick: ($event) => showActionSheet(photo)
                                  }, null, 8, ["src", "onClick"])
                                ]),
                                _: 2
                              }, 1024);
                            }), 128))
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(_component_ion_fab, {
                      vertical: "bottom",
                      horizontal: "center",
                      slot: "fixed"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_ion_fab_button, {
                          onClick: ($event) => unref(takePhoto)()
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_ion_icon, { icon: unref(camera) }, null, 8, ["icon"])
                          ]),
                          _: 1
                        }, 8, ["onClick"])
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
              createVNode(_component_ion_header, null, {
                default: withCtx(() => [
                  createVNode(_component_ion_toolbar, null, {
                    default: withCtx(() => [
                      createVNode(_component_ion_title, null, {
                        default: withCtx(() => [
                          createTextVNode("Photo Gallery")
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
                              createTextVNode("Photo Gallery")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode(_component_ion_grid, null, {
                    default: withCtx(() => [
                      createVNode(_component_ion_row, null, {
                        default: withCtx(() => [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(photos), (photo) => {
                            return openBlock(), createBlock(_component_ion_col, {
                              size: "6",
                              key: photo.filepath
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_ion_img, {
                                  src: photo.webviewPath,
                                  onClick: ($event) => showActionSheet(photo)
                                }, null, 8, ["src", "onClick"])
                              ]),
                              _: 2
                            }, 1024);
                          }), 128))
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode(_component_ion_fab, {
                    vertical: "bottom",
                    horizontal: "center",
                    slot: "fixed"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_ion_fab_button, {
                        onClick: ($event) => unref(takePhoto)()
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_ion_icon, { icon: unref(camera) }, null, 8, ["icon"])
                        ]),
                        _: 1
                      }, 8, ["onClick"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/tabs/tab2.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=tab2.240ab16a.mjs.map
