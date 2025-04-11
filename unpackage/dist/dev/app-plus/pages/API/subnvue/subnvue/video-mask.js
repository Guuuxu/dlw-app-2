"use weex:vue";

if (typeof Promise !== 'undefined' && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor
    return this.then(
      value => promise.resolve(callback()).then(() => value),
      reason => promise.resolve(callback()).then(() => {
        throw reason
      })
    )
  }
};

if (typeof uni !== 'undefined' && uni && uni.requireGlobal) {
  const global = uni.requireGlobal()
  ArrayBuffer = global.ArrayBuffer
  Int8Array = global.Int8Array
  Uint8Array = global.Uint8Array
  Uint8ClampedArray = global.Uint8ClampedArray
  Int16Array = global.Int16Array
  Uint16Array = global.Uint16Array
  Int32Array = global.Int32Array
  Uint32Array = global.Uint32Array
  Float32Array = global.Float32Array
  Float64Array = global.Float64Array
  BigInt64Array = global.BigInt64Array
  BigUint64Array = global.BigUint64Array
};


(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // vue-ns:vue
  var require_vue = __commonJS({
    "vue-ns:vue"(exports, module) {
      module.exports = Vue;
    }
  });

  // ../../../../../project/dlw/uniapp-dileiwo/unpackage/dist/dev/.nvue/pages/API/subnvue/subnvue/video-mask.js
  var import_vue = __toESM(require_vue());

  // ../../../../../project/dlw/uniapp-dileiwo/unpackage/dist/dev/.nvue/_plugin-vue_export-helper.js
  var _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };

  // ../../../../../project/dlw/uniapp-dileiwo/unpackage/dist/dev/.nvue/pages/API/subnvue/subnvue/video-mask.js
  var _style_0 = { "wrapper": { "": { "position": "relative", "flex": 1, "backgroundColor": "rgba(0,0,0,0)" } }, "list": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0, "backgroundColor": "rgba(0,0,0,0.7)" } }, "cell": { "": { "paddingTop": "10rpx", "paddingRight": 0, "paddingBottom": "10rpx", "paddingLeft": 0, "flexDirection": "row", "flexWrap": "nowrap" } }, "name": { "": { "flex": 0, "fontSize": "20rpx", "marginRight": "20rpx", "color": "#FF5A5F" } }, "content": { "": { "flex": 1, "fontSize": "20rpx", "color": "#F4F5F6" } } };
  var _sfc_main = {
    data() {
      return {
        lists: [],
        interval: null,
        yourTexts: [
          {
            name: "\u5B66\u5458A",
            content: "\u8001\u5E08\u8BB2\u7684\u771F\u597D"
          },
          {
            name: "\u5B66\u5458B",
            content: "uni-app\u503C\u5F97\u5B66\u4E60"
          },
          {
            name: "\u5B66\u5458C",
            content: "\u8001\u5E08\uFF0C\u8FD8\u6709\u5B9E\u6218\u4F8B\u5B50\u5417\uFF1F"
          },
          {
            name: "\u5B66\u5458D",
            content: "\u8001\u5E08\uFF0C\u8BF7\u95EE\u662F\u4E0D\u662F\u8981\u5148\u5B66\u4F1Avue\u624D\u80FD\u5B66uni-app\uFF1F"
          },
          {
            name: "\u5B66\u5458E",
            content: "\u53D7\u6559\u4E86\uFF0Cuni-app\u592A\u725B\u4E86"
          }
        ]
      };
    },
    created() {
      uni.$on("play-video", (data) => {
        if (data.status === "open") {
          this.addItem();
        } else {
          this.closeItem();
        }
      });
    },
    beforeDestroy() {
      uni.$off("play-video");
      this.closeItem();
    },
    methods: {
      addItem() {
        const vm = this;
        vm.lists = [{
          name: "\u5B66\u5458E",
          content: "\u53D7\u6559\u4E86\uFF0Cuni-app\u592A\u725B\u4E86"
        }];
        const dom = weex.requireModule("dom");
        vm.interval = setInterval(() => {
          if (vm.lists.length > 15) {
            vm.lists.unshift();
          }
          vm.lists.push({
            name: vm.yourTexts[vm.lists.length % 4].name,
            content: vm.yourTexts[vm.lists.length % 4].content
          });
          if (vm.lists.length > 5) {
            vm.$nextTick(() => {
              if (vm.$refs["item" + (vm.lists.length - 1)]) {
                dom.scrollToElement(vm.$refs["item" + (vm.lists.length - 1)][0]);
              }
            });
          }
        }, 3500);
      },
      closeItem() {
        if (this.interval)
          clearInterval(this.interval);
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return (0, import_vue.openBlock)(), (0, import_vue.createElementBlock)("scroll-view", {
      scrollY: true,
      showScrollbar: true,
      enableBackToTop: true,
      bubble: "true",
      style: { flexDirection: "column" }
    }, [
      (0, import_vue.createElementVNode)("div", { class: "wrapper" }, [
        (0, import_vue.createElementVNode)("list", { class: "list" }, [
          ((0, import_vue.openBlock)(true), (0, import_vue.createElementBlock)(
            import_vue.Fragment,
            null,
            (0, import_vue.renderList)($data.lists, (item, index) => {
              return (0, import_vue.openBlock)(), (0, import_vue.createElementBlock)("cell", {
                key: index,
                ref_for: true,
                ref: "item" + index,
                class: "cell"
              }, [
                (0, import_vue.createElementVNode)(
                  "u-text",
                  { class: "name" },
                  (0, import_vue.toDisplayString)(item.name) + ":",
                  1
                  /* TEXT */
                ),
                (0, import_vue.createElementVNode)(
                  "u-text",
                  { class: "content" },
                  (0, import_vue.toDisplayString)(item.content),
                  1
                  /* TEXT */
                )
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])
    ]);
  }
  var videoMask = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["styles", [_style_0]], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/API/subnvue/subnvue/video-mask.nvue"]]);

  // <stdin>
  var webview = plus.webview.currentWebview();
  if (webview) {
    const __pageId = parseInt(webview.id);
    const __pagePath = "pages/API/subnvue/subnvue/video-mask";
    let __pageQuery = {};
    try {
      __pageQuery = JSON.parse(webview.__query__);
    } catch (e) {
    }
    videoMask.mpType = "page";
    const app = Vue.createPageApp(videoMask, { $store: getApp({ allowDefault: true }).$store, __pageId, __pagePath, __pageQuery });
    app.provide("__globalStyles", Vue.useCssStyles([...__uniConfig.styles, ...videoMask.styles || []]));
    app.mount("#root");
  }
})();
