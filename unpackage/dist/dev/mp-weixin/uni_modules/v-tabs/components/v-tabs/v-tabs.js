"use strict";
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_vTabs_components_vTabs_utils = require("./utils.js");
const uni_modules_vTabs_components_vTabs_props = require("./props.js");
const _sfc_main = {
  name: "VTabs",
  props: uni_modules_vTabs_components_vTabs_props.props,
  emits: ["update:modelValue", "change"],
  data() {
    return {
      lineWidth: 30,
      currentWidth: 0,
      // 当前选项的宽度
      lineLeft: 0,
      // 滑块距离左侧的位置
      pillsLeft: 0,
      // 胶囊距离左侧的位置
      scrollLeft: 0,
      // 距离左边的位置
      container: { width: 0, height: 0, left: 0, right: 0 },
      // 容器的宽高，左右距离
      current: 0,
      // 当前选中项
      scrollWidth: 0
      // 可以滚动的宽度
    };
  },
  computed: {
    getDomId() {
      const len = 16;
      const $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
      const maxPos = $chars.length;
      let pwd = "";
      for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
      }
      return `xfjpeter_${pwd}`;
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.current = newVal > -1 && newVal < this.tabs.length ? newVal : 0;
        this.$nextTick(this.update);
      }
    }
  },
  methods: {
    // 切换事件
    change: uni_modules_vTabs_components_vTabs_utils.throttle(function(index) {
      const isDisabled = !!this.tabs[index].disabled;
      if (this.current !== index && !isDisabled) {
        this.current = index;
        this.$emit("update:modelValue", index);
        this.$emit("change", index);
      }
    }, 300),
    createQueryHandler() {
      let query;
      query = common_vendor.index.createSelectorQuery().in(this);
      return query;
    },
    update() {
      const _this = this;
      uni_modules_vTabs_components_vTabs_utils.startMicroTask(() => {
        if (!this.tabs.length)
          return;
        _this.createQueryHandler().select(`#${this.getDomId}`).boundingClientRect((data) => {
          const { width, height, left, right } = data || {};
          this.container = { width, height, left, right: right - width };
          _this.calcScrollWidth();
          _this.setScrollLeft();
          _this.setLine();
        }).exec();
      });
    },
    // 计算可以滚动的宽度
    calcScrollWidth(callback) {
      const view = this.createQueryHandler().select(`#${this.getDomId}`);
      view.fields({ scrollOffset: true });
      view.scrollOffset((res) => {
        if (typeof callback === "function") {
          callback(res);
        } else {
          this.scrollWidth = res.scrollWidth;
        }
      }).exec();
    },
    // 设置滚动条滚动的进度
    setScrollLeft() {
      this.calcScrollWidth((res) => {
        let scrollLeft = res.scrollLeft;
        this.createQueryHandler().select(`#${this.getDomId} .v-tabs__container-item.active`).boundingClientRect((data) => {
          if (!data)
            return;
          let curHalfWidth = (this.container.width - data.width) / 2;
          let scrollDiff = this.scrollWidth - this.container.width;
          scrollLeft += data.left - curHalfWidth - this.container.left;
          if (scrollLeft < 0)
            scrollLeft = 0;
          else if (scrollLeft > scrollDiff)
            scrollLeft = scrollDiff;
          this.scrollLeft = scrollLeft;
        }).exec();
      });
    },
    setLine() {
      this.calcScrollWidth((res) => {
        const scrollLeft = res.scrollLeft;
        this.createQueryHandler().select(`#${this.getDomId} .v-tabs__container-item.active`).boundingClientRect((data) => {
          if (!data)
            return;
          if (this.pills) {
            this.currentWidth = data.width;
            this.pillsLeft = scrollLeft + data.left - this.container.left;
          } else {
            this.lineWidth = data.width * this.lineScale;
            this.lineLeft = scrollLeft + data.left + (data.width - data.width * this.lineScale) / 2 - this.container.left;
          }
        }).exec();
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f(_ctx.tabs, (v, i, i0) => {
      return {
        a: common_vendor.t(_ctx.field ? v[_ctx.field] : v),
        b: "d-" + i0,
        c: common_vendor.r("d", {
          row: v,
          index: i
        }, i0),
        d: common_vendor.n({
          disabled: !!v.disabled
        }),
        e: common_vendor.n({
          active: $data.current == i
        }),
        f: i,
        g: $data.current == i ? _ctx.activeColor : _ctx.color,
        h: $data.current == i ? _ctx.fontSize : _ctx.fontSize,
        i: _ctx.bold && $data.current == i ? "bold" : "",
        j: common_vendor.o(($event) => $options.change(i), i)
      };
    }),
    b: !_ctx.scroll ? "center" : "",
    c: _ctx.scroll ? "" : 1,
    d: _ctx.paddingItem,
    e: !!_ctx.tabs.length
  }, !!_ctx.tabs.length ? common_vendor.e({
    f: !_ctx.pills
  }, !_ctx.pills ? {
    g: common_vendor.n({
      animation: _ctx.lineAnimation
    }),
    h: _ctx.lineColor,
    i: $data.lineWidth + "px",
    j: _ctx.lineHeight,
    k: _ctx.lineRadius,
    l: `translate3d(${$data.lineLeft}px, 0, 0)`
  } : {
    m: common_vendor.n({
      animation: _ctx.lineAnimation
    }),
    n: _ctx.pillsColor,
    o: _ctx.pillsBorderRadius,
    p: $data.currentWidth + "px",
    q: `translate3d(${$data.pillsLeft}px, 0, 0)`,
    r: _ctx.height
  }) : {}, {
    s: _ctx.scroll ? "inline-flex" : "flex",
    t: _ctx.scroll ? "nowrap" : "normal",
    v: _ctx.bgColor,
    w: _ctx.height,
    x: _ctx.padding,
    y: $options.getDomId,
    z: _ctx.scroll,
    A: _ctx.scroll ? $data.scrollLeft : 0,
    B: _ctx.scroll,
    C: _ctx.fixed ? "fixed" : "relative",
    D: _ctx.zIndex,
    E: _ctx.fixed ? _ctx.height : "0",
    F: _ctx.padding
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4a111109"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/v-tabs/components/v-tabs/v-tabs.js.map
