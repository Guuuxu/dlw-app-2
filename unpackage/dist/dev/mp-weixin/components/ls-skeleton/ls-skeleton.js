"use strict";
const common_vendor = require("../../common/vendor.js");
const components_lsSkeleton_util_index = require("./util/index.js");
const _sfc_main = {
  name: "ls-skeleton",
  props: {
    // 是否显示骨架
    loading: {
      type: Boolean,
      default: true
    },
    // 是否圆角骨架风格
    round: {
      type: Boolean,
      default: false
    },
    // 骨架内容 特殊符号说明 [*代表个数 例如：line*3 意思是3个行] [+代表横向并列排列连接  例如：circ+line 意思是左侧一个圆右侧一个行] [纯数字 代表垂直间隔 例如：40 代表40前后的两个元素之间有40rpx高度的间隔]
    skeleton: {
      type: Array,
      default: () => []
    },
    // 是否开启动画效果
    animate: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      elements: []
    };
  },
  computed: {
    animateClass() {
      return this.animate ? "ls_animation" : "ls_static";
    },
    style() {
      if (this.round) {
        return "ls_round";
      }
      return "ls_radius";
    }
  },
  watch: {
    // 开始loading时，加载动画
    loading(val) {
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      let elements = [];
      let elClass;
      this.skeleton.forEach((el) => {
        if (typeof el === "string") {
          if (el.indexOf("+") > -1) {
            let group = el.split("+");
            let children = [];
            group.forEach((els) => {
              children.push(components_lsSkeleton_util_index.getElCountsAndLayout(els));
            });
            elements.push({
              type: "flex",
              children
            });
          } else {
            elClass = components_lsSkeleton_util_index.getElCounts(el);
            elements = elements.concat(elClass);
          }
        } else if (typeof el === "number") {
          elements.push({
            type: "space",
            height: el
          });
        } else {
          common_vendor.index.__f__("warn", "at components/ls-skeleton/ls-skeleton.nvue:140", "[ls-skeleton]: 参数格式包含了不符合规范的内容");
        }
      });
      this.elements = [...elements];
    },
    createAnimation() {
      let background = "#e6e6e6";
      clearInterval(interval);
      interval = setInterval(() => {
        background = background === "#e6e6e6" ? "#d3d3d3" : "#e6e6e6";
        this.executeAnimation(background);
      }, 1e3);
    },
    executeAnimation(background) {
      if (!this.loading) {
        clearInterval(interval);
        return;
      }
      this.$refs.skeleton.forEach((item) => {
        animationActuator.transition(item, {
          styles: {
            "backgroundColor": background
          },
          duration: 800,
          //ms  
          timingFunction: "linear"
        });
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.loading
  }, $props.loading ? {
    b: common_vendor.f($data.elements, (item, index, i0) => {
      return common_vendor.e({
        a: item.type == "flex"
      }, item.type == "flex" ? {
        b: common_vendor.f(item.children, (inner, index2, i1) => {
          return {
            a: common_vendor.f(inner.eles, (el, index3, i2) => {
              return {
                a: common_vendor.n(el.clas),
                b: common_vendor.n(el.clas == "ls_circle" ? "" : $options.style),
                c: index3
              };
            }),
            b: common_vendor.n(inner.clas),
            c: common_vendor.n(index2 > 0 ? "ls_ml" : ""),
            d: index2
          };
        }),
        c: common_vendor.n($options.animateClass)
      } : item.type == "news" ? {
        e: common_vendor.n($options.style),
        f: common_vendor.n($options.animateClass),
        g: common_vendor.n($options.style),
        h: common_vendor.n($options.animateClass),
        i: common_vendor.n($options.style),
        j: common_vendor.n($options.animateClass),
        k: common_vendor.n($options.style),
        l: common_vendor.n($options.animateClass)
      } : item.type == "space" ? {
        n: item.height + "rpx"
      } : {
        o: common_vendor.n(item.clas),
        p: common_vendor.n(item.clas == "ls_circle" ? "" : $options.style),
        q: common_vendor.n($options.animateClass)
      }, {
        d: item.type == "news",
        m: item.type == "space",
        r: index
      });
    })
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b5b48376"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/ls-skeleton/ls-skeleton.js.map
