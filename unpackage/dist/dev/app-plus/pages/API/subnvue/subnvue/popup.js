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

  // ../../../../../project/dlw/uniapp-dileiwo/unpackage/dist/dev/.nvue/pages/API/subnvue/subnvue/popup.js
  var import_vue2 = __toESM(require_vue());

  // ../../../../../project/dlw/uniapp-dileiwo/unpackage/dist/dev/.nvue/_plugin-vue_export-helper.js
  var _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };

  // ../../../../../project/dlw/uniapp-dileiwo/unpackage/dist/dev/.nvue/pages/API/subnvue/subnvue/popup.js
  var _style_0 = { "wrapper": { "": { "flexDirection": "column", "justifyContent": "space-between", "paddingTop": "10rpx", "paddingRight": "15rpx", "paddingBottom": "10rpx", "paddingLeft": "15rpx", "backgroundColor": "#F4F5F6", "borderRadius": "4rpx" } }, "title": { "": { "height": "100rpx", "lineHeight": "100rpx", "borderBottomStyle": "solid", "borderBottomWidth": "1rpx", "borderBottomColor": "#CBCBCB", "flex": 0, "fontSize": "30rpx" } }, "scroller": { "": { "height": "400rpx", "paddingTop": "8rpx", "paddingRight": "15rpx", "paddingBottom": "8rpx", "paddingLeft": "15rpx" } }, "content": { "": { "color": "#555555", "fontSize": "32rpx" } }, "message-wrapper": { "": { "flex": 0, "borderTopStyle": "solid", "borderTopWidth": "1rpx", "borderTopColor": "#CBCBCB", "height": "80rpx", "alignItems": "flex-end" } }, "send-message": { "": { "fontSize": "30rpx", "lineHeight": "80rpx", "color": "#00CE47", "marginLeft": "20rpx" } }, "cell": { "": { "marginTop": "10rpx", "marginRight": "10rpx", "marginBottom": "10rpx", "marginLeft": "10rpx", "paddingTop": "20rpx", "paddingRight": 0, "paddingBottom": "20rpx", "paddingLeft": 0, "top": "10rpx", "alignItems": "center", "justifyContent": "center", "borderRadius": "10rpx", "backgroundColor": "#5989B9" } }, "text": { "": { "fontSize": "30rpx", "textAlign": "center", "color": "#FFFFFF" } } };
  var _sfc_main = {
    data() {
      return {
        title: "",
        content: "",
        lists: []
      };
    },
    created() {
      const vm = this;
      for (let i = 1; i < 20; i++) {
        this.lists.push("item" + i);
      }
      uni.$on("page-popup", (data) => {
        vm.title = data.title;
        vm.content = data.content;
      });
    },
    beforeDestroy() {
      uni.$off("drawer-page");
    },
    methods: {
      sendMessage() {
        getCurrentSubNVue();
        uni.$emit("popup-page", {
          title: "\u5DF2\u8BFB\u5B8C!"
        });
      },
      handle(item, index) {
        getCurrentSubNVue();
        uni.$emit("popup-page", {
          type: "interactive",
          info: item + " \u8BE5\u5143\u7D20\u88AB\u70B9\u51FB\u4E86!"
        });
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
        (0, import_vue2.createElementVNode)(
          "u-text",
          { class: "title" },
          (0, import_vue2.toDisplayString)($data.title),
          1
          /* TEXT */
        ),
        (0, import_vue2.createElementVNode)("scroller", { class: "scroller" }, [
          (0, import_vue2.createElementVNode)("div", null, [
            (0, import_vue2.createElementVNode)(
              "u-text",
              { class: "content" },
              (0, import_vue2.toDisplayString)($data.content),
              1
              /* TEXT */
            )
          ]),
          (0, import_vue2.createElementVNode)("div", null, [
            (0, import_vue2.createElementVNode)("u-text", { style: { "color": "red", "font-size": "30rpx" } }, "\u4EE5\u4E0B\u4E3A Popup \u5185\u90E8\u6EDA\u52A8\u793A\u4F8B\uFF1A")
          ]),
          ((0, import_vue2.openBlock)(true), (0, import_vue2.createElementBlock)(
            import_vue2.Fragment,
            null,
            (0, import_vue2.renderList)($data.lists, (item, index) => {
              return (0, import_vue2.openBlock)(), (0, import_vue2.createElementBlock)("div", {
                class: "cell",
                onClick: ($event) => $options.handle(item),
                key: index
              }, [
                (0, import_vue2.createElementVNode)(
                  "u-text",
                  { class: "text" },
                  (0, import_vue2.toDisplayString)(item),
                  1
                  /* TEXT */
                )
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        (0, import_vue2.createElementVNode)("div", { class: "message-wrapper" }, [
          (0, import_vue2.createElementVNode)("u-text", {
            class: "send-message",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.sendMessage && $options.sendMessage(...args))
          }, "\u5411\u9875\u9762\u53D1\u9001\u6D88\u606F")
        ])
      ])
    ]);
  }
  var popup = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["styles", [_style_0]], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/API/subnvue/subnvue/popup.nvue"]]);

  // <stdin>
  var webview = plus.webview.currentWebview();
  if (webview) {
    const __pageId = parseInt(webview.id);
    const __pagePath = "pages/API/subnvue/subnvue/popup";
    let __pageQuery = {};
    try {
      __pageQuery = JSON.parse(webview.__query__);
    } catch (e) {
    }
    popup.mpType = "page";
    const app = Vue.createPageApp(popup, { $store: getApp({ allowDefault: true }).$store, __pageId, __pagePath, __pageQuery });
    app.provide("__globalStyles", Vue.useCssStyles([...__uniConfig.styles, ...popup.styles || []]));
    app.mount("#root");
  }
})();
