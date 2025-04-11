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

  // ../../../../../project/dlw/uniapp-dileiwo/unpackage/dist/dev/.nvue/uni-app.es.js
  var import_vue = __toESM(require_vue());
  function getCurrentSubNVue() {
    return uni.getSubNVueById(plus.webview.currentWebview().id);
  }

  // ../../../../../project/dlw/uniapp-dileiwo/unpackage/dist/dev/.nvue/pages/API/subnvue/subnvue/drawer.js
  var import_vue2 = __toESM(require_vue());

  // ../../../../../project/dlw/uniapp-dileiwo/unpackage/dist/dev/.nvue/_plugin-vue_export-helper.js
  var _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };

  // ../../../../../project/dlw/uniapp-dileiwo/unpackage/dist/dev/.nvue/pages/API/subnvue/subnvue/drawer.js
  var _style_0 = { "wrapper": { "": { "flexDirection": "column", "flex": 1, "textAlign": "center", "paddingTop": "60rpx", "paddingRight": "0rpx", "paddingBottom": "0rpx", "paddingLeft": "20rpx", "backgroundColor": "#F4F5F6" } }, "nav-text": { "": { "color": "#8f8f94", "marginBottom": "40rpx" } }, "list-wrapper": { "": { "height": "450rpx" } }, "text-wrapper": { "": { "justifyContent": "center", "borderBottomStyle": "solid", "borderBottomWidth": "1rpx", "borderBottomColor": "rgba(0,0,0,0.2)", "marginBottom": "35rpx", "paddingBottom": "15rpx" } }, "close-drawer": { "": { "backgroundColor": "#f8f8f8", "width": "300rpx", "paddingTop": "15rpx", "paddingRight": "15rpx", "paddingBottom": "15rpx", "paddingLeft": "15rpx", "borderRadius": "20rpx", "borderStyle": "solid", "borderWidth": "1rpx", "borderColor": "rgba(0,0,0,0.2)" } }, "icon": { "": { "position": "absolute", "right": "10rpx", "color": "#000000", "fontFamily": "unibtn", "fontSize": "30rpx", "fontWeight": "400" } } };
  var _sfc_main = {
    data() {
      return {
        lists: []
      };
    },
    beforeCreate() {
      const domModule = weex.requireModule("dom");
      domModule.addRule("fontFace", {
        fontFamily: "unibtn",
        "src": "url('../../../../static/uni.ttf')"
      });
    },
    created() {
      for (let i = 0; i < 5; i++) {
        this.lists.push({
          id: i,
          name: "Item" + i
        });
      }
    },
    methods: {
      hideDrawer() {
        getCurrentSubNVue().hide("auto");
      },
      clickitem(e) {
        uni.$emit("drawer-page", e);
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return (0, import_vue2.openBlock)(), (0, import_vue2.createElementBlock)("scroll-view", {
      scrollY: true,
      showScrollbar: true,
      enableBackToTop: true,
      bubble: "true",
      style: { flexDirection: "column" }
    }, [
      (0, import_vue2.createElementVNode)("div", { class: "wrapper" }, [
        (0, import_vue2.createElementVNode)("u-text", { class: "nav-text" }, "\u5DE6\u4FA7\u5217\u8868"),
        (0, import_vue2.createElementVNode)("list", { class: "list-wrapper" }, [
          ((0, import_vue2.openBlock)(true), (0, import_vue2.createElementBlock)(
            import_vue2.Fragment,
            null,
            (0, import_vue2.renderList)($data.lists, (item) => {
              return (0, import_vue2.openBlock)(), (0, import_vue2.createElementBlock)("cell", {
                key: item.id
              }, [
                (0, import_vue2.createElementVNode)("div", {
                  class: "text-wrapper",
                  onClick: ($event) => $options.clickitem(item.id)
                }, [
                  (0, import_vue2.createElementVNode)(
                    "u-text",
                    { style: { "font-size": "30rpx" } },
                    (0, import_vue2.toDisplayString)(item.name),
                    1
                    /* TEXT */
                  ),
                  (0, import_vue2.createElementVNode)("u-text", { class: "icon" }, "\uE583")
                ], 8, ["onClick"])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        (0, import_vue2.createElementVNode)("div", { style: { "flex": "1", "text-align": "center" } }, [
          (0, import_vue2.createElementVNode)("div", {
            class: "close-drawer",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.hideDrawer && $options.hideDrawer(...args))
          }, [
            (0, import_vue2.createElementVNode)("u-text", { style: { "font-size": "34rpx", "text-align": "center" } }, "\u5173\u95ED\u62BD\u5C49")
          ])
        ])
      ])
    ]);
  }
  var drawer = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["styles", [_style_0]], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/API/subnvue/subnvue/drawer.nvue"]]);

  // <stdin>
  var webview = plus.webview.currentWebview();
  if (webview) {
    const __pageId = parseInt(webview.id);
    const __pagePath = "pages/API/subnvue/subnvue/drawer";
    let __pageQuery = {};
    try {
      __pageQuery = JSON.parse(webview.__query__);
    } catch (e) {
    }
    drawer.mpType = "page";
    const app = Vue.createPageApp(drawer, { $store: getApp({ allowDefault: true }).$store, __pageId, __pagePath, __pageQuery });
    app.provide("__globalStyles", Vue.useCssStyles([...__uniConfig.styles, ...drawer.styles || []]));
    app.mount("#root");
  }
})();
