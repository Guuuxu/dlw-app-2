import { openBlock, createElementBlock, createElementVNode, Fragment, renderList, toDisplayString } from "vue";
import { _ as _export_sfc } from "../../../../_plugin-vue_export-helper.js";
const _style_0 = { "wrapper": { "": { "position": "relative", "flex": 1, "backgroundColor": "rgba(0,0,0,0)" } }, "list": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0, "backgroundColor": "rgba(0,0,0,0.7)" } }, "cell": { "": { "paddingTop": "10rpx", "paddingRight": 0, "paddingBottom": "10rpx", "paddingLeft": 0, "flexDirection": "row", "flexWrap": "nowrap" } }, "name": { "": { "flex": 0, "fontSize": "20rpx", "marginRight": "20rpx", "color": "#FF5A5F" } }, "content": { "": { "flex": 1, "fontSize": "20rpx", "color": "#F4F5F6" } } };
const _sfc_main = {
  data() {
    return {
      lists: [],
      interval: null,
      yourTexts: [
        {
          name: "学员A",
          content: "老师讲的真好"
        },
        {
          name: "学员B",
          content: "uni-app值得学习"
        },
        {
          name: "学员C",
          content: "老师，还有实战例子吗？"
        },
        {
          name: "学员D",
          content: "老师，请问是不是要先学会vue才能学uni-app？"
        },
        {
          name: "学员E",
          content: "受教了，uni-app太牛了"
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
        name: "学员E",
        content: "受教了，uni-app太牛了"
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
  return openBlock(), createElementBlock("scroll-view", {
    scrollY: true,
    showScrollbar: true,
    enableBackToTop: true,
    bubble: "true",
    style: { flexDirection: "column" }
  }, [
    createElementVNode("div", { class: "wrapper" }, [
      createElementVNode("list", { class: "list" }, [
        (openBlock(true), createElementBlock(Fragment, null, renderList($data.lists, (item, index) => {
          return openBlock(), createElementBlock("cell", {
            key: index,
            ref_for: true,
            ref: "item" + index,
            class: "cell"
          }, [
            createElementVNode("u-text", { class: "name" }, toDisplayString(item.name) + ":", 1),
            createElementVNode("u-text", { class: "content" }, toDisplayString(item.content), 1)
          ]);
        }), 128))
      ])
    ])
  ]);
}
const videoMask = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["styles", [_style_0]]]);
export {
  videoMask as default
};
