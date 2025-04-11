import { g as getCurrentSubNVue } from "../../../../uni-app.es.js";
import { openBlock, createElementBlock, createElementVNode, Fragment, renderList, toDisplayString } from "vue";
import { _ as _export_sfc } from "../../../../_plugin-vue_export-helper.js";
const _style_0 = { "wrapper": { "": { "flexDirection": "column", "flex": 1, "textAlign": "center", "paddingTop": "60rpx", "paddingRight": "0rpx", "paddingBottom": "0rpx", "paddingLeft": "20rpx", "backgroundColor": "#F4F5F6" } }, "nav-text": { "": { "color": "#8f8f94", "marginBottom": "40rpx" } }, "list-wrapper": { "": { "height": "450rpx" } }, "text-wrapper": { "": { "justifyContent": "center", "borderBottomStyle": "solid", "borderBottomWidth": "1rpx", "borderBottomColor": "rgba(0,0,0,0.2)", "marginBottom": "35rpx", "paddingBottom": "15rpx" } }, "close-drawer": { "": { "backgroundColor": "#f8f8f8", "width": "300rpx", "paddingTop": "15rpx", "paddingRight": "15rpx", "paddingBottom": "15rpx", "paddingLeft": "15rpx", "borderRadius": "20rpx", "borderStyle": "solid", "borderWidth": "1rpx", "borderColor": "rgba(0,0,0,0.2)" } }, "icon": { "": { "position": "absolute", "right": "10rpx", "color": "#000000", "fontFamily": "unibtn", "fontSize": "30rpx", "fontWeight": "400" } } };
const _sfc_main = {
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
  return openBlock(), createElementBlock("scroll-view", {
    scrollY: true,
    showScrollbar: true,
    enableBackToTop: true,
    bubble: "true",
    style: { flexDirection: "column" }
  }, [
    createElementVNode("div", { class: "wrapper" }, [
      createElementVNode("u-text", { class: "nav-text" }, "左侧列表"),
      createElementVNode("list", { class: "list-wrapper" }, [
        (openBlock(true), createElementBlock(Fragment, null, renderList($data.lists, (item) => {
          return openBlock(), createElementBlock("cell", {
            key: item.id
          }, [
            createElementVNode("div", {
              class: "text-wrapper",
              onClick: ($event) => $options.clickitem(item.id)
            }, [
              createElementVNode("u-text", { style: { "font-size": "30rpx" } }, toDisplayString(item.name), 1),
              createElementVNode("u-text", { class: "icon" }, "")
            ], 8, ["onClick"])
          ]);
        }), 128))
      ]),
      createElementVNode("div", { style: { "flex": "1", "text-align": "center" } }, [
        createElementVNode("div", {
          class: "close-drawer",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.hideDrawer && $options.hideDrawer(...args))
        }, [
          createElementVNode("u-text", { style: { "font-size": "34rpx", "text-align": "center" } }, "关闭抽屉")
        ])
      ])
    ])
  ]);
}
const drawer = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["styles", [_style_0]]]);
export {
  drawer as default
};
