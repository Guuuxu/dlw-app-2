import { g as getCurrentSubNVue } from "../../../../uni-app.es.js";
import { openBlock, createElementBlock, createElementVNode, toDisplayString, Fragment, renderList } from "vue";
import { _ as _export_sfc } from "../../../../_plugin-vue_export-helper.js";
const _style_0 = { "wrapper": { "": { "flexDirection": "column", "justifyContent": "space-between", "paddingTop": "10rpx", "paddingRight": "15rpx", "paddingBottom": "10rpx", "paddingLeft": "15rpx", "backgroundColor": "#F4F5F6", "borderRadius": "4rpx" } }, "title": { "": { "height": "100rpx", "lineHeight": "100rpx", "borderBottomStyle": "solid", "borderBottomWidth": "1rpx", "borderBottomColor": "#CBCBCB", "flex": 0, "fontSize": "30rpx" } }, "scroller": { "": { "height": "400rpx", "paddingTop": "8rpx", "paddingRight": "15rpx", "paddingBottom": "8rpx", "paddingLeft": "15rpx" } }, "content": { "": { "color": "#555555", "fontSize": "32rpx" } }, "message-wrapper": { "": { "flex": 0, "borderTopStyle": "solid", "borderTopWidth": "1rpx", "borderTopColor": "#CBCBCB", "height": "80rpx", "alignItems": "flex-end" } }, "send-message": { "": { "fontSize": "30rpx", "lineHeight": "80rpx", "color": "#00CE47", "marginLeft": "20rpx" } }, "cell": { "": { "marginTop": "10rpx", "marginRight": "10rpx", "marginBottom": "10rpx", "marginLeft": "10rpx", "paddingTop": "20rpx", "paddingRight": 0, "paddingBottom": "20rpx", "paddingLeft": 0, "top": "10rpx", "alignItems": "center", "justifyContent": "center", "borderRadius": "10rpx", "backgroundColor": "#5989B9" } }, "text": { "": { "fontSize": "30rpx", "textAlign": "center", "color": "#FFFFFF" } } };
const _sfc_main = {
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
        title: "已读完!"
      });
    },
    handle(item, index) {
      getCurrentSubNVue();
      uni.$emit("popup-page", {
        type: "interactive",
        info: item + " 该元素被点击了!"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("scroll-view", {
    scrollY: true,
    showScrollbar: true,
    enableBackToTop: true,
    bubble: "true",
    style: { flexDirection: "column" }
  }, [
    createElementVNode("div", { class: "wrapper" }, [
      createElementVNode("u-text", { class: "title" }, toDisplayString($data.title), 1),
      createElementVNode("scroller", { class: "scroller" }, [
        createElementVNode("div", null, [
          createElementVNode("u-text", { class: "content" }, toDisplayString($data.content), 1)
        ]),
        createElementVNode("div", null, [
          createElementVNode("u-text", { style: { "color": "red", "font-size": "30rpx" } }, "以下为 Popup 内部滚动示例：")
        ]),
        (openBlock(true), createElementBlock(Fragment, null, renderList($data.lists, (item, index) => {
          return openBlock(), createElementBlock("div", {
            class: "cell",
            onClick: ($event) => $options.handle(item),
            key: index
          }, [
            createElementVNode("u-text", { class: "text" }, toDisplayString(item), 1)
          ], 8, ["onClick"]);
        }), 128))
      ]),
      createElementVNode("div", { class: "message-wrapper" }, [
        createElementVNode("u-text", {
          class: "send-message",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.sendMessage && $options.sendMessage(...args))
        }, "向页面发送消息")
      ])
    ])
  ]);
}
const popup = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["styles", [_style_0]]]);
export {
  popup as default
};
