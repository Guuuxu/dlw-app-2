if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const ON_SHOW = "onShow";
  const ON_HIDE = "onHide";
  const ON_LOAD = "onLoad";
  const ON_READY = "onReady";
  const ON_UNLOAD = "onUnload";
  const ON_REACH_BOTTOM = "onReachBottom";
  const ON_PULL_DOWN_REFRESH = "onPullDownRefresh";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const createHook = (lifecycle) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createHook(ON_SHOW);
  const onHide = /* @__PURE__ */ createHook(ON_HIDE);
  const onLoad = /* @__PURE__ */ createHook(ON_LOAD);
  const onReady = /* @__PURE__ */ createHook(ON_READY);
  const onUnload = /* @__PURE__ */ createHook(ON_UNLOAD);
  const onReachBottom = /* @__PURE__ */ createHook(ON_REACH_BOTTOM);
  const onPullDownRefresh = /* @__PURE__ */ createHook(ON_PULL_DOWN_REFRESH);
  const API_BASE_URL = "http://dileiwo-api.test.muke.design";
  const defaults = {
    baseURL: API_BASE_URL,
    // 基础路径
    timeout: 6e4,
    // 超时时间（单位：ms）
    header: {
      "Content-Type": "application/json"
      // 默认请求头
    }
  };
  function getApiUrl() {
    const userRole = uni.getStorageSync("ROLE_KEY");
    formatAppLog("log", "at utils/request.js:16", "userRole", userRole);
    switch (userRole) {
      case "admin":
        return API_BASE_URL + "/admin";
      case "web":
        return API_BASE_URL + "/web";
      default:
        return API_BASE_URL + "/admin";
    }
  }
  const requestInterceptor = (config) => {
    const token = uni.getStorageSync("token");
    formatAppLog("log", "at utils/request.js:32", "token", token);
    if (token) {
      config.header.Authorization = `Bearer ${token}`;
    }
    return config;
  };
  const responseInterceptor = (response) => {
    formatAppLog("log", "at utils/request.js:42", response);
    if (response.data.code === 200) {
      return response.data;
    } else {
      errorHandler(response);
      return Promise.reject(response);
    }
  };
  const errorHandler = (error) => {
    var _a;
    let errMsg = "请求失败，请稍后重试";
    formatAppLog("log", "at utils/request.js:54", "error", error);
    if (error.errMsg && error.errMsg.includes("timeout")) {
      errMsg = "请求超时，请检查网络连接";
    } else if ((_a = error.data) == null ? void 0 : _a.code) {
      switch (error.data.code) {
        case 401:
          errMsg = "未授权，请重新登录";
          uni.navigateTo({ url: "/pages/login/login" });
          break;
        case 403:
          errMsg = "拒绝访问";
          break;
        case 404:
          errMsg = "请求资源不存在";
          break;
        case 500:
          errMsg = "服务器错误";
          break;
        default:
          errMsg = error.data.msg;
      }
    }
    uni.showToast({
      title: errMsg,
      icon: "none",
      duration: 3e3
    });
    return Promise.reject(error);
  };
  const createRequest = (config) => {
    const mergedConfig = { ...defaults, ...config, url: getApiUrl() + config.url };
    formatAppLog("log", "at utils/request.js:90", "mergedConfig", mergedConfig);
    const finalOptions = requestInterceptor(mergedConfig);
    return new Promise((resolve, reject) => {
      const task = uni.request({
        ...finalOptions,
        success: (res2) => {
          const processedResponse = responseInterceptor(res2);
          resolve(processedResponse);
        },
        fail: (err) => {
          const processedError = errorHandler(err);
          reject(processedError);
        }
      });
      if (mergedConfig.cancelToken) {
        mergedConfig.cancelToken.task = task;
      }
    });
  };
  const http = {
    get: (url, data, config = {}) => {
      return createRequest({
        url,
        data,
        method: "GET",
        ...config
      });
    },
    post: (url, data, config = {}) => {
      return createRequest({
        url,
        data,
        method: "POST",
        ...config
      });
    },
    // 上传文件
    upload(url, filePath, name = "file", formData = {}, options = {}) {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: getApiUrl() + url,
          filePath,
          name,
          formData,
          header: {
            "Authorization": `Bearer ${uni.getStorageSync("token")}`
          },
          success: (res2) => {
            formatAppLog("log", "at utils/request.js:143", "143", res2);
            if (res2.statusCode === 200) {
              try {
                const data = JSON.parse(res2.data);
                resolve(data);
              } catch (e2) {
                resolve(res2.data);
              }
            } else {
              reject(res2);
            }
          },
          fail: (error) => {
            formatAppLog("log", "at utils/request.js:156", "156", error);
            reject(error);
          },
          ...options
        });
      });
    }
    // 其他方法（PUT, DELETE等）类似
  };
  const loginApi = ({ phone, code }) => {
    return http.post("/login", { phone, code });
  };
  const uploadApi = (filePath) => {
    return http.upload("/upload", filePath, "file");
  };
  const logOutApi = () => {
    return http.post("/logout");
  };
  const _imports_0$7 = "/static/image/welcom.png";
  const _imports_1$3 = "/static/image/icon-logout@2x.png";
  const _imports_2$1 = "/static/image/home-auth@2x.png";
  const _imports_0$6 = "/static/image/home-arrow@2x.png";
  const _imports_4 = "/static/image/home-delivery@2x.png";
  const _imports_5 = "/static/image/home-search@2x.png";
  const _imports_6 = "/static/image/home-damage@2x.png";
  const _export_sfc = (sfc, props2) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props2) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$A = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      var _a;
      __expose();
      const userInfo = vue.ref({});
      userInfo.value = uni.getStorageSync("userInfo") ? JSON.parse(uni.getStorageSync("userInfo")) : {};
      formatAppLog("log", "at pages/index/index.vue:69", userInfo);
      const roleName = uni.getStorageSync("ROLE_KEY") || "";
      if (!((_a = userInfo.value) == null ? void 0 : _a.name)) {
        uni.reLaunch({
          url: "/pages/login/login"
        });
      }
      const webTypeOption = ["管理员", "操作员", "法人"];
      const adminTypeOption = ["管理员", "操作员", "代工厂"];
      const handleLogout = () => {
        uni.showModal({
          title: "提示",
          content: "确定退出登录？",
          async success({ confirm }) {
            if (confirm) {
              await logOutApi();
              uni.setStorageSync("token", "");
              uni.setStorageSync("userInfo", "");
              uni.reLaunch({
                url: "/pages/login/login"
              });
            }
          }
        });
      };
      const pageTo = (url) => {
        uni.switchTab({
          url
        });
      };
      const __returned__ = { userInfo, roleName, webTypeOption, adminTypeOption, handleLogout, pageTo, ref: vue.ref, get logOutApi() {
        return logOutApi;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$z(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "home-container" }, [
      vue.createElementVNode("view", { class: "header pl-32 pr-32" }, [
        vue.createElementVNode(
          "view",
          { class: "fs-28 pt-4" },
          vue.toDisplayString($setup.roleName === "admin" ? "迪雷沃包装设计(上海)有限公司" : $setup.userInfo.company_name),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "view",
          { class: "oprater color-subTitlle fs-24 mt-4" },
          vue.toDisplayString($setup.roleName === "admin" ? $setup.adminTypeOption[+$setup.userInfo.type - 1] : $setup.webTypeOption[+$setup.userInfo.type - 1]) + "：" + vue.toDisplayString($setup.userInfo.name),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "welcom ta-c fs-64 mt-38" }, [
          vue.createElementVNode("image", { src: _imports_0$7 })
        ]),
        vue.createElementVNode("image", {
          class: "icon-logout pl-10",
          src: _imports_1$3,
          onClick: $setup.handleLogout
        }),
        vue.createCommentVNode(' <view class="tip2 ta-c mt-26 fs-28">\r\n				统一包装编码 | 规格标准化 | 循坏包装\r\n			</view> ')
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", {
          class: "content-item d-f bg_white ai-c pl-48 pr-32 mb-32",
          onClick: _cache[0] || (_cache[0] = ($event) => $setup.pageTo("/pages/auth/index"))
        }, [
          vue.createElementVNode("image", {
            class: "home-icon",
            src: _imports_2$1,
            mode: "aspectFit"
          }),
          vue.createElementVNode("view", { class: "flex-1 ml-48" }, [
            vue.createElementVNode("view", { class: "fs-36" }, " 初始认证 "),
            vue.createElementVNode("view", { class: "fs-28 color-subTitlle mt-8" }, "新包装编码、外观等验收入库")
          ]),
          vue.createElementVNode("image", {
            class: "arrow",
            src: _imports_0$6,
            mode: ""
          })
        ]),
        vue.createElementVNode("view", {
          class: "content-item d-f bg_white ai-c pl-48 pr-32 mb-32",
          onClick: _cache[1] || (_cache[1] = ($event) => $setup.pageTo("/pages/delivery/index"))
        }, [
          vue.createElementVNode("image", {
            class: "home-icon",
            src: _imports_4,
            mode: "aspectFit"
          }),
          vue.createElementVNode("view", { class: "flex-1 ml-48" }, [
            vue.createElementVNode("view", { class: "fs-36" }, " 包装出库 "),
            vue.createElementVNode("view", { class: "fs-28 color-subTitlle mt-8" }, "出库导入包装编码")
          ]),
          vue.createElementVNode("image", {
            class: "arrow",
            src: _imports_0$6,
            mode: ""
          })
        ]),
        vue.createElementVNode("view", {
          class: "content-item d-f bg_white ai-c pl-48 pr-32 mb-32",
          onClick: _cache[2] || (_cache[2] = ($event) => $setup.pageTo("/pages/recycle/detailList"))
        }, [
          vue.createElementVNode("image", {
            class: "home-icon",
            src: _imports_5,
            mode: "aspectFit"
          }),
          vue.createElementVNode("view", { class: "flex-1 ml-48" }, [
            vue.createElementVNode("view", { class: "fs-36" }, " 回收复查 "),
            vue.createElementVNode("view", { class: "fs-28 color-subTitlle mt-8" }, "收到返还包装验收入库")
          ]),
          vue.createElementVNode("image", {
            class: "arrow",
            src: _imports_0$6,
            mode: ""
          })
        ]),
        vue.createElementVNode("view", {
          class: "content-item d-f bg_white ai-c pl-48 pr-32",
          onClick: _cache[3] || (_cache[3] = ($event) => $setup.pageTo("/pages/report/index"))
        }, [
          vue.createElementVNode("image", {
            class: "home-icon",
            src: _imports_6,
            mode: "aspectFit"
          }),
          vue.createElementVNode("view", { class: "flex-1 ml-48" }, [
            vue.createElementVNode("view", { class: "fs-36" }, " 损坏申报 "),
            vue.createElementVNode("view", { class: "fs-28 color-subTitlle mt-8" }, "包装有严重损坏，请及时申报")
          ]),
          vue.createElementVNode("image", {
            class: "arrow",
            src: _imports_0$6,
            mode: ""
          })
        ])
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$A, [["render", _sfc_render$z], ["__scopeId", "data-v-1cf27b2a"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/index/index.vue"]]);
  function startMicroTask(callback) {
    if (typeof queueMicrotask === "function") {
      queueMicrotask(callback);
    } else if (typeof MutationObserver === "function") {
      const node = document.createElement("div");
      const observer = new MutationObserver(callback);
      observer.observe(node, { childList: true });
      node.textContent = "xfjpeter";
    } else {
      setTimeout(callback, 0);
    }
  }
  function throttle(fn, delay) {
    let timeoutId;
    let lastExecuted = 0;
    return function() {
      const context = this;
      const args = arguments;
      const now2 = Date.now();
      const remaining = delay - (now2 - lastExecuted);
      function execute() {
        lastExecuted = now2;
        fn.apply(context, args);
      }
      if (remaining <= 0) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        execute();
      } else {
        if (!timeoutId) {
          timeoutId = setTimeout(() => {
            timeoutId = null;
            execute();
          }, remaining);
        }
      }
    };
  }
  const props = {
    value: {
      type: Number,
      default: 0
    },
    modelValue: {
      type: Number,
      default: 0
    },
    tabs: {
      type: Array,
      default() {
        return [];
      }
    },
    bgColor: {
      type: String,
      default: "#fff"
    },
    padding: {
      type: String,
      default: "0"
    },
    color: {
      type: String,
      default: "#333"
    },
    activeColor: {
      type: String,
      default: "#2979ff"
    },
    fontSize: {
      type: String,
      default: "28rpx"
    },
    activeFontSize: {
      type: String,
      default: "32rpx"
    },
    bold: {
      type: Boolean,
      default: false
    },
    scroll: {
      type: Boolean,
      default: true
    },
    height: {
      type: String,
      default: "70rpx"
    },
    lineColor: {
      type: String,
      default: "#2979ff"
    },
    lineHeight: {
      type: [String, Number],
      default: "10rpx"
    },
    lineScale: {
      type: Number,
      default: 0.5
    },
    lineRadius: {
      type: String,
      default: "10rpx"
    },
    pills: {
      type: Boolean,
      default: false
    },
    pillsColor: {
      type: String,
      default: "#2979ff"
    },
    pillsBorderRadius: {
      type: String,
      default: "10rpx"
    },
    field: {
      type: String,
      default: ""
    },
    fixed: {
      type: Boolean,
      default: false
    },
    paddingItem: {
      type: String,
      default: "0 22rpx"
    },
    lineAnimation: {
      type: Boolean,
      default: true
    },
    zIndex: {
      type: Number,
      default: 1993
    }
  };
  const _sfc_main$z = {
    name: "VTabs",
    props,
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
        for (let i2 = 0; i2 < len; i2++) {
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
      change: throttle(function(index2) {
        const isDisabled = !!this.tabs[index2].disabled;
        if (this.current !== index2 && !isDisabled) {
          this.current = index2;
          this.$emit("update:modelValue", index2);
          this.$emit("change", index2);
        }
      }, 300),
      createQueryHandler() {
        let query;
        query = uni.createSelectorQuery().in(this);
        return query;
      },
      update() {
        const _this = this;
        startMicroTask(() => {
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
        view.scrollOffset((res2) => {
          if (typeof callback === "function") {
            callback(res2);
          } else {
            this.scrollWidth = res2.scrollWidth;
          }
        }).exec();
      },
      // 设置滚动条滚动的进度
      setScrollLeft() {
        this.calcScrollWidth((res2) => {
          let scrollLeft = res2.scrollLeft;
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
        this.calcScrollWidth((res2) => {
          const scrollLeft = res2.scrollLeft;
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
  function _sfc_render$y(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "v-tabs" }, [
      vue.createElementVNode("scroll-view", {
        id: $options.getDomId,
        "scroll-x": _ctx.scroll,
        "scroll-left": _ctx.scroll ? $data.scrollLeft : 0,
        "scroll-with-animation": _ctx.scroll,
        style: vue.normalizeStyle({ position: _ctx.fixed ? "fixed" : "relative", zIndex: _ctx.zIndex, width: "100%" })
      }, [
        vue.createElementVNode(
          "view",
          {
            class: "v-tabs__container",
            style: vue.normalizeStyle({
              display: _ctx.scroll ? "inline-flex" : "flex",
              whiteSpace: _ctx.scroll ? "nowrap" : "normal",
              background: _ctx.bgColor,
              height: _ctx.height,
              padding: _ctx.padding
            })
          },
          [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(_ctx.tabs, (v2, i2) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: vue.normalizeClass(["v-tabs__container-item", { disabled: !!v2.disabled }, { active: $data.current == i2 }]),
                  key: i2,
                  style: vue.normalizeStyle({
                    color: $data.current == i2 ? _ctx.activeColor : _ctx.color,
                    fontSize: $data.current == i2 ? _ctx.fontSize : _ctx.fontSize,
                    fontWeight: _ctx.bold && $data.current == i2 ? "bold" : "",
                    justifyContent: !_ctx.scroll ? "center" : "",
                    flex: _ctx.scroll ? "" : 1,
                    padding: _ctx.paddingItem
                  }),
                  onClick: ($event) => $options.change(i2)
                }, [
                  vue.renderSlot(_ctx.$slots, "default", {
                    row: v2,
                    index: i2
                  }, () => [
                    vue.createTextVNode(
                      vue.toDisplayString(_ctx.field ? v2[_ctx.field] : v2),
                      1
                      /* TEXT */
                    )
                  ], true)
                ], 14, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            !!_ctx.tabs.length ? (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 0 },
              [
                !_ctx.pills ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    class: vue.normalizeClass(["v-tabs__container-line", { animation: _ctx.lineAnimation }]),
                    style: vue.normalizeStyle({
                      background: _ctx.lineColor,
                      width: $data.lineWidth + "px",
                      height: _ctx.lineHeight,
                      borderRadius: _ctx.lineRadius,
                      transform: `translate3d(${$data.lineLeft}px, 0, 0)`
                    })
                  },
                  null,
                  6
                  /* CLASS, STYLE */
                )) : (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 1,
                    class: vue.normalizeClass(["v-tabs__container-pills", { animation: _ctx.lineAnimation }]),
                    style: vue.normalizeStyle({
                      background: _ctx.pillsColor,
                      borderRadius: _ctx.pillsBorderRadius,
                      width: $data.currentWidth + "px",
                      transform: `translate3d(${$data.pillsLeft}px, 0, 0)`,
                      height: _ctx.height
                    })
                  },
                  null,
                  6
                  /* CLASS, STYLE */
                ))
              ],
              64
              /* STABLE_FRAGMENT */
            )) : vue.createCommentVNode("v-if", true)
          ],
          4
          /* STYLE */
        )
      ], 12, ["id", "scroll-x", "scroll-left", "scroll-with-animation"]),
      vue.createCommentVNode(" fixed 的站位高度 "),
      vue.createElementVNode(
        "view",
        {
          class: "v-tabs__placeholder",
          style: vue.normalizeStyle({ height: _ctx.fixed ? _ctx.height : "0", padding: _ctx.padding })
        },
        null,
        4
        /* STYLE */
      )
    ]);
  }
  const __easycom_0$4 = /* @__PURE__ */ _export_sfc(_sfc_main$z, [["render", _sfc_render$y], ["__scopeId", "data-v-4a111109"], ["__file", "D:/project/dlw/uniapp-dileiwo/uni_modules/v-tabs/components/v-tabs/v-tabs.vue"]]);
  const _sfc_main$y = /* @__PURE__ */ vue.defineComponent({
    __name: "login",
    setup(__props, { expose: __expose }) {
      __expose();
      const step = vue.ref(1);
      const phone = vue.ref("");
      const agreed = vue.ref(false);
      const tabs = ["客户端", "管理端"];
      const role2 = vue.ref("0");
      formatAppLog("log", "at pages/login/login.vue:67", "show", role2.value);
      uni.setStorageSync("ROLE_KEY", "web");
      const changeRole = (e2) => {
        formatAppLog("log", "at pages/login/login.vue:70", e2);
        role2.value = e2;
        const key = e2 == "0" ? "web" : "admin";
        uni.setStorageSync("ROLE_KEY", key);
      };
      const isValidPhone = vue.computed(() => {
        const phoneReg = /^1[3-9]\d{9}$/;
        return phoneReg.test(phone.value);
      });
      const checkboxChange = (e2) => {
        agreed.value = e2.detail.value[0] === "true";
      };
      const getVerifyCode = () => {
        if (!agreed.value) {
          uni.showToast({
            title: "请先同意用户协议",
            icon: "none"
          });
          return;
        }
        if (!isValidPhone.value) {
          uni.showToast({
            title: "请输入正确的手机号",
            icon: "none"
          });
          return;
        }
        uni.showToast({
          title: "验证码已发送",
          icon: "success"
        });
        step.value = 2;
      };
      const openAgreement = () => {
        uni.navigateTo({
          url: "/pages/login/agreement"
        });
      };
      const codeValue = vue.ref([]);
      const currentFocus = vue.ref(0);
      const countdown = vue.ref(60);
      let timer = null;
      const inputRefs = vue.ref([]);
      const handleInput = async (event, index2) => {
        const value = event.detail.value;
        formatAppLog("log", "at pages/login/login.vue:123", "value", value);
        if (value.length > 1) {
          const values = value.split("");
          values.forEach((v2, i2) => {
            if (index2 + i2 < 6) {
              codeValue.value[index2 + i2] = v2;
              currentFocus.value = index2 + i2;
            }
          });
          const nextEmptyIndex = codeValue.value.findIndex((v2, i2) => !v2 && i2 >= index2);
          formatAppLog("log", "at pages/login/login.vue:133", nextEmptyIndex);
          if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
            currentFocus.value = nextEmptyIndex;
          }
        } else {
          codeValue.value[index2] = value;
          if (value && index2 < 5) {
            currentFocus.value = index2 + 1;
          } else if (!value && index2 > 0) {
            currentFocus.value = index2 - 1;
          } else {
            formatAppLog("log", "at pages/login/login.vue:145", codeValue.value);
            if (codeValue.value.length && index2) {
              const res2 = await loginApi({
                phone: phone.value,
                code: codeValue.value.join("")
              });
              formatAppLog("log", "at pages/login/login.vue:151", "res", res2);
              formatAppLog("log", "at pages/login/login.vue:152", "index", index2);
              uni.setStorageSync("token", res2.data.accessToken);
              uni.setStorageSync("userInfo", JSON.stringify(res2.data.user));
              uni.showToast({
                title: "登录成功",
                success() {
                  uni.switchTab({
                    url: "/pages/index/index"
                  });
                }
              });
            }
          }
        }
      };
      const handleFocus = (index2) => {
        currentFocus.value = index2;
      };
      const startCountdown = () => {
        timer = setInterval(() => {
          if (countdown.value > 0) {
            countdown.value--;
          } else {
            if (timer) {
              clearInterval(timer);
            }
          }
        }, 1e3);
      };
      const resendCode = () => {
        if (countdown.value === 0) {
          countdown.value = 60;
          startCountdown();
          uni.showToast({
            title: "验证码已重新发送",
            icon: "none"
          });
        }
      };
      vue.onMounted(() => {
        startCountdown();
      });
      vue.onUnmounted(() => {
        if (timer) {
          clearInterval(timer);
        }
      });
      const __returned__ = { step, phone, agreed, tabs, role: role2, changeRole, isValidPhone, checkboxChange, getVerifyCode, openAgreement, codeValue, currentFocus, countdown, get timer() {
        return timer;
      }, set timer(v2) {
        timer = v2;
      }, inputRefs, handleInput, handleFocus, startCountdown, resendCode };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$x(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_v_tabs = resolveEasycom(vue.resolveDynamicComponent("v-tabs"), __easycom_0$4);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container h_100" }, [
      $setup.step === 1 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "login-content"
      }, [
        vue.createElementVNode("view", { class: "login-title" }, "登录迪雷沃"),
        vue.createElementVNode("view", { class: "login-subtitle" }, "请输入您的手机号码"),
        vue.createVNode(_component_v_tabs, {
          style: { "font-size": "36rpx" },
          modelValue: $setup.role,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.role = $event),
          tabs: $setup.tabs,
          onChange: $setup.changeRole,
          bgColor: "transport",
          lineColor: "#99BBA0",
          activeColor: "#99BBA0"
        }, null, 8, ["modelValue"]),
        vue.createCommentVNode(' <radio-group @change="changeRole">\r\n				<label class="uni-list-cell uni-list-cell-pd jc-fs">\r\n					<radio  value="web" style="transform:scale(0.7)" />客户端(仅限客户端用户登录)\r\n				</label>\r\n				<label class="uni-list-cell uni-list-cell-pd jc-fs">\r\n					<radio value="admin"   style="transform:scale(0.7)"/>\r\n					<view>管理端 (仅限后台管理用户登录)</view>\r\n				</label>\r\n			</radio-group> '),
        vue.createElementVNode("view", { class: "input-container uni-common-mt" }, [
          vue.createCommentVNode(` <uni-easyinput v-model="phone" type="number" maxlength="11" placeholder="请输入手机号"\r
					placeholderStyle="color: #C8C9CC; font-size: 32rpx;padding-left:20rpx" class="custom-input" :styles="{'borderColor':'#99BBA0'}" /> `),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "custom-input pl-20",
              type: "tel",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.phone = $event),
              placeholder: "请输入手机号",
              placeholderStyle: "color: #C8C9CC; font-size: 32rpx;padding-left:20rpx"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.phone]
          ])
        ]),
        vue.createElementVNode("button", {
          class: "verify-btn",
          disabled: !$setup.isValidPhone,
          onClick: $setup.getVerifyCode
        }, " 获取验证码 ", 8, ["disabled"]),
        vue.createElementVNode("view", { class: "agreement" }, [
          vue.createElementVNode(
            "checkbox-group",
            {
              style: { "width": "auto" },
              onChange: $setup.checkboxChange
            },
            [
              vue.createElementVNode("checkbox", {
                style: { "border-radius": "50%" },
                color: "#99BBA0",
                activeBorderColor: "#99BBA0",
                value: "true",
                iconColor: "#99BBA0",
                borderColor: "99BBA0",
                checked: $setup.agreed
              }, null, 8, ["checked"])
            ],
            32
            /* NEED_HYDRATION */
          ),
          vue.createElementVNode("text", { class: "agreement-text" }, [
            vue.createTextVNode(" 我已阅读并同意 "),
            vue.createElementVNode("text", {
              class: "link",
              onClick: $setup.openAgreement
            }, "《用户协议》")
          ])
        ])
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createElementVNode("view", { class: "header" }, [
            vue.createElementVNode("text", { class: "title" }, "输入验证码"),
            vue.createElementVNode(
              "text",
              { class: "subtitle" },
              "验证码已发送" + vue.toDisplayString($setup.phone ? $setup.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") : ""),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "code-input-container" }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(6, (item, index2) => {
                return vue.createElementVNode("input", {
                  key: index2,
                  type: "number",
                  maxlength: "1",
                  value: $setup.codeValue[index2] || "",
                  onInput: (e2) => $setup.handleInput(e2, index2),
                  onFocus: ($event) => $setup.handleFocus(index2),
                  class: vue.normalizeClass(["code-input", { "code-input-focus": $setup.currentFocus === index2 }]),
                  focus: $setup.currentFocus === index2,
                  ref_for: true,
                  ref: (el) => $setup.inputRefs[index2] = el
                }, null, 42, ["value", "onInput", "onFocus", "focus"]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", { class: "countdown-container" }, [
            $setup.countdown > 0 ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "countdown-text"
              },
              vue.toDisplayString($setup.countdown) + " 秒后重新获取验证码",
              1
              /* TEXT */
            )) : (vue.openBlock(), vue.createElementBlock(
              "button",
              {
                key: 1,
                onClick: $setup.resendCode,
                class: "resend-button ta-r"
              },
              vue.toDisplayString($setup.countdown > 0 ? $setup.countdown : "") + "重新获取验证码 ",
              1
              /* TEXT */
            ))
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      ))
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$y, [["render", _sfc_render$x], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/login/login.vue"]]);
  const _sfc_main$x = {};
  function _sfc_render$w(_ctx, _cache) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "agreement bg-white" }, [
      vue.createElementVNode("view", { class: "main-title" }, "迪雷沃商用户服务条款"),
      vue.createElementVNode("view", { class: "section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "一、服务条款的确认及接受"),
        vue.createElementVNode("view", { class: "section-content" }, [
          vue.createElementVNode("view", { class: "item" }, '1、迪雷沃系统软件（指www.deravel-tw.com及其移动客户端软件、应用程序，以下称"本系统"）各项电子服务的所有权和运作权归属于"迪雷沃包装设计（上海）有限公司"所有，本网站提供的服务将完全按照其发布的服务条款和操作规则严格执行。您确认所有服务条款并完成注册程序时，本协议在您与本网站间成立并发生法律效力，同时您成为本网站正式用户。'),
          vue.createElementVNode("view", { class: "item" }, "2、根据国家法律法规变化及本网站运营需要，迪雷沃有权对本协议条款及相关规则不时地进行修改，修改后的内容一旦以任何形式公布在本网站上即生效，并取代此前相关内容。您应不时关注本网站公告、提示信息及协议、规则等相关内容的变动。您如继续使用本网站，即视为知悉变更内容并同意接受。")
        ])
      ]),
      vue.createElementVNode("view", { class: "section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "二、服务需知"),
        vue.createElementVNode("view", { class: "section-content" }, [
          vue.createElementVNode("view", { class: "item" }, "1、本网站运用自身开发的操作系统通过国际互联网络为用户提供服务。使用本网站，您必须："),
          vue.createElementVNode("view", { class: "sub-item" }, "(1) 自行配备上网的所需设备，包括手机、平板电脑、调制解调器、路由器等；"),
          vue.createElementVNode("view", { class: "sub-item" }, "(2) 自行负担上网所支付的与此服务有关的电话费用、网络费用等；")
        ])
      ])
    ]);
  }
  const PagesLoginAgreement = /* @__PURE__ */ _export_sfc(_sfc_main$x, [["render", _sfc_render$w], ["__scopeId", "data-v-b4896b2f"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/login/agreement.vue"]]);
  const fontData = [
    {
      "font_class": "arrow-down",
      "unicode": ""
    },
    {
      "font_class": "arrow-left",
      "unicode": ""
    },
    {
      "font_class": "arrow-right",
      "unicode": ""
    },
    {
      "font_class": "arrow-up",
      "unicode": ""
    },
    {
      "font_class": "auth",
      "unicode": ""
    },
    {
      "font_class": "auth-filled",
      "unicode": ""
    },
    {
      "font_class": "back",
      "unicode": ""
    },
    {
      "font_class": "bars",
      "unicode": ""
    },
    {
      "font_class": "calendar",
      "unicode": ""
    },
    {
      "font_class": "calendar-filled",
      "unicode": ""
    },
    {
      "font_class": "camera",
      "unicode": ""
    },
    {
      "font_class": "camera-filled",
      "unicode": ""
    },
    {
      "font_class": "cart",
      "unicode": ""
    },
    {
      "font_class": "cart-filled",
      "unicode": ""
    },
    {
      "font_class": "chat",
      "unicode": ""
    },
    {
      "font_class": "chat-filled",
      "unicode": ""
    },
    {
      "font_class": "chatboxes",
      "unicode": ""
    },
    {
      "font_class": "chatboxes-filled",
      "unicode": ""
    },
    {
      "font_class": "chatbubble",
      "unicode": ""
    },
    {
      "font_class": "chatbubble-filled",
      "unicode": ""
    },
    {
      "font_class": "checkbox",
      "unicode": ""
    },
    {
      "font_class": "checkbox-filled",
      "unicode": ""
    },
    {
      "font_class": "checkmarkempty",
      "unicode": ""
    },
    {
      "font_class": "circle",
      "unicode": ""
    },
    {
      "font_class": "circle-filled",
      "unicode": ""
    },
    {
      "font_class": "clear",
      "unicode": ""
    },
    {
      "font_class": "close",
      "unicode": ""
    },
    {
      "font_class": "closeempty",
      "unicode": ""
    },
    {
      "font_class": "cloud-download",
      "unicode": ""
    },
    {
      "font_class": "cloud-download-filled",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload-filled",
      "unicode": ""
    },
    {
      "font_class": "color",
      "unicode": ""
    },
    {
      "font_class": "color-filled",
      "unicode": ""
    },
    {
      "font_class": "compose",
      "unicode": ""
    },
    {
      "font_class": "contact",
      "unicode": ""
    },
    {
      "font_class": "contact-filled",
      "unicode": ""
    },
    {
      "font_class": "down",
      "unicode": ""
    },
    {
      "font_class": "bottom",
      "unicode": ""
    },
    {
      "font_class": "download",
      "unicode": ""
    },
    {
      "font_class": "download-filled",
      "unicode": ""
    },
    {
      "font_class": "email",
      "unicode": ""
    },
    {
      "font_class": "email-filled",
      "unicode": ""
    },
    {
      "font_class": "eye",
      "unicode": ""
    },
    {
      "font_class": "eye-filled",
      "unicode": ""
    },
    {
      "font_class": "eye-slash",
      "unicode": ""
    },
    {
      "font_class": "eye-slash-filled",
      "unicode": ""
    },
    {
      "font_class": "fire",
      "unicode": ""
    },
    {
      "font_class": "fire-filled",
      "unicode": ""
    },
    {
      "font_class": "flag",
      "unicode": ""
    },
    {
      "font_class": "flag-filled",
      "unicode": ""
    },
    {
      "font_class": "folder-add",
      "unicode": ""
    },
    {
      "font_class": "folder-add-filled",
      "unicode": ""
    },
    {
      "font_class": "font",
      "unicode": ""
    },
    {
      "font_class": "forward",
      "unicode": ""
    },
    {
      "font_class": "gear",
      "unicode": ""
    },
    {
      "font_class": "gear-filled",
      "unicode": ""
    },
    {
      "font_class": "gift",
      "unicode": ""
    },
    {
      "font_class": "gift-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-down",
      "unicode": ""
    },
    {
      "font_class": "hand-down-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-up",
      "unicode": ""
    },
    {
      "font_class": "hand-up-filled",
      "unicode": ""
    },
    {
      "font_class": "headphones",
      "unicode": ""
    },
    {
      "font_class": "heart",
      "unicode": ""
    },
    {
      "font_class": "heart-filled",
      "unicode": ""
    },
    {
      "font_class": "help",
      "unicode": ""
    },
    {
      "font_class": "help-filled",
      "unicode": ""
    },
    {
      "font_class": "home",
      "unicode": ""
    },
    {
      "font_class": "home-filled",
      "unicode": ""
    },
    {
      "font_class": "image",
      "unicode": ""
    },
    {
      "font_class": "image-filled",
      "unicode": ""
    },
    {
      "font_class": "images",
      "unicode": ""
    },
    {
      "font_class": "images-filled",
      "unicode": ""
    },
    {
      "font_class": "info",
      "unicode": ""
    },
    {
      "font_class": "info-filled",
      "unicode": ""
    },
    {
      "font_class": "left",
      "unicode": ""
    },
    {
      "font_class": "link",
      "unicode": ""
    },
    {
      "font_class": "list",
      "unicode": ""
    },
    {
      "font_class": "location",
      "unicode": ""
    },
    {
      "font_class": "location-filled",
      "unicode": ""
    },
    {
      "font_class": "locked",
      "unicode": ""
    },
    {
      "font_class": "locked-filled",
      "unicode": ""
    },
    {
      "font_class": "loop",
      "unicode": ""
    },
    {
      "font_class": "mail-open",
      "unicode": ""
    },
    {
      "font_class": "mail-open-filled",
      "unicode": ""
    },
    {
      "font_class": "map",
      "unicode": ""
    },
    {
      "font_class": "map-filled",
      "unicode": ""
    },
    {
      "font_class": "map-pin",
      "unicode": ""
    },
    {
      "font_class": "map-pin-ellipse",
      "unicode": ""
    },
    {
      "font_class": "medal",
      "unicode": ""
    },
    {
      "font_class": "medal-filled",
      "unicode": ""
    },
    {
      "font_class": "mic",
      "unicode": ""
    },
    {
      "font_class": "mic-filled",
      "unicode": ""
    },
    {
      "font_class": "micoff",
      "unicode": ""
    },
    {
      "font_class": "micoff-filled",
      "unicode": ""
    },
    {
      "font_class": "minus",
      "unicode": ""
    },
    {
      "font_class": "minus-filled",
      "unicode": ""
    },
    {
      "font_class": "more",
      "unicode": ""
    },
    {
      "font_class": "more-filled",
      "unicode": ""
    },
    {
      "font_class": "navigate",
      "unicode": ""
    },
    {
      "font_class": "navigate-filled",
      "unicode": ""
    },
    {
      "font_class": "notification",
      "unicode": ""
    },
    {
      "font_class": "notification-filled",
      "unicode": ""
    },
    {
      "font_class": "paperclip",
      "unicode": ""
    },
    {
      "font_class": "paperplane",
      "unicode": ""
    },
    {
      "font_class": "paperplane-filled",
      "unicode": ""
    },
    {
      "font_class": "person",
      "unicode": ""
    },
    {
      "font_class": "person-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled-copy",
      "unicode": ""
    },
    {
      "font_class": "phone",
      "unicode": ""
    },
    {
      "font_class": "phone-filled",
      "unicode": ""
    },
    {
      "font_class": "plus",
      "unicode": ""
    },
    {
      "font_class": "plus-filled",
      "unicode": ""
    },
    {
      "font_class": "plusempty",
      "unicode": ""
    },
    {
      "font_class": "pulldown",
      "unicode": ""
    },
    {
      "font_class": "pyq",
      "unicode": ""
    },
    {
      "font_class": "qq",
      "unicode": ""
    },
    {
      "font_class": "redo",
      "unicode": ""
    },
    {
      "font_class": "redo-filled",
      "unicode": ""
    },
    {
      "font_class": "refresh",
      "unicode": ""
    },
    {
      "font_class": "refresh-filled",
      "unicode": ""
    },
    {
      "font_class": "refreshempty",
      "unicode": ""
    },
    {
      "font_class": "reload",
      "unicode": ""
    },
    {
      "font_class": "right",
      "unicode": ""
    },
    {
      "font_class": "scan",
      "unicode": ""
    },
    {
      "font_class": "search",
      "unicode": ""
    },
    {
      "font_class": "settings",
      "unicode": ""
    },
    {
      "font_class": "settings-filled",
      "unicode": ""
    },
    {
      "font_class": "shop",
      "unicode": ""
    },
    {
      "font_class": "shop-filled",
      "unicode": ""
    },
    {
      "font_class": "smallcircle",
      "unicode": ""
    },
    {
      "font_class": "smallcircle-filled",
      "unicode": ""
    },
    {
      "font_class": "sound",
      "unicode": ""
    },
    {
      "font_class": "sound-filled",
      "unicode": ""
    },
    {
      "font_class": "spinner-cycle",
      "unicode": ""
    },
    {
      "font_class": "staff",
      "unicode": ""
    },
    {
      "font_class": "staff-filled",
      "unicode": ""
    },
    {
      "font_class": "star",
      "unicode": ""
    },
    {
      "font_class": "star-filled",
      "unicode": ""
    },
    {
      "font_class": "starhalf",
      "unicode": ""
    },
    {
      "font_class": "trash",
      "unicode": ""
    },
    {
      "font_class": "trash-filled",
      "unicode": ""
    },
    {
      "font_class": "tune",
      "unicode": ""
    },
    {
      "font_class": "tune-filled",
      "unicode": ""
    },
    {
      "font_class": "undo",
      "unicode": ""
    },
    {
      "font_class": "undo-filled",
      "unicode": ""
    },
    {
      "font_class": "up",
      "unicode": ""
    },
    {
      "font_class": "top",
      "unicode": ""
    },
    {
      "font_class": "upload",
      "unicode": ""
    },
    {
      "font_class": "upload-filled",
      "unicode": ""
    },
    {
      "font_class": "videocam",
      "unicode": ""
    },
    {
      "font_class": "videocam-filled",
      "unicode": ""
    },
    {
      "font_class": "vip",
      "unicode": ""
    },
    {
      "font_class": "vip-filled",
      "unicode": ""
    },
    {
      "font_class": "wallet",
      "unicode": ""
    },
    {
      "font_class": "wallet-filled",
      "unicode": ""
    },
    {
      "font_class": "weibo",
      "unicode": ""
    },
    {
      "font_class": "weixin",
      "unicode": ""
    }
  ];
  const getVal = (val) => {
    const reg = /^[0-9]*$/g;
    return typeof val === "number" || reg.test(val) ? val + "px" : val;
  };
  const _sfc_main$w = {
    name: "UniIcons",
    emits: ["click"],
    props: {
      type: {
        type: String,
        default: ""
      },
      color: {
        type: String,
        default: "#333333"
      },
      size: {
        type: [Number, String],
        default: 16
      },
      customPrefix: {
        type: String,
        default: ""
      },
      fontFamily: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        icons: fontData
      };
    },
    computed: {
      unicode() {
        let code = this.icons.find((v2) => v2.font_class === this.type);
        if (code) {
          return code.unicode;
        }
        return "";
      },
      iconSize() {
        return getVal(this.size);
      },
      styleObj() {
        if (this.fontFamily !== "") {
          return `color: ${this.color}; font-size: ${this.iconSize}; font-family: ${this.fontFamily};`;
        }
        return `color: ${this.color}; font-size: ${this.iconSize};`;
      }
    },
    methods: {
      _onClick() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$v(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "text",
      {
        style: vue.normalizeStyle($options.styleObj),
        class: vue.normalizeClass(["uni-icons", ["uniui-" + $props.type, $props.customPrefix, $props.customPrefix ? $props.type : ""]]),
        onClick: _cache[0] || (_cache[0] = (...args) => $options._onClick && $options._onClick(...args))
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0$3 = /* @__PURE__ */ _export_sfc(_sfc_main$w, [["render", _sfc_render$v], ["__scopeId", "data-v-d31e1c47"], ["__file", "D:/project/dlw/uniapp-dileiwo/uni_modules/uni-icons/components/uni-icons/uni-icons.vue"]]);
  const _sfc_main$v = {
    name: "UniCard",
    emits: ["click"],
    props: {
      title: {
        type: String,
        default: ""
      },
      subTitle: {
        type: String,
        default: ""
      },
      padding: {
        type: String,
        default: "10px"
      },
      margin: {
        type: String,
        default: "15px"
      },
      spacing: {
        type: String,
        default: "0 10px"
      },
      extra: {
        type: String,
        default: ""
      },
      cover: {
        type: String,
        default: ""
      },
      thumbnail: {
        type: String,
        default: ""
      },
      isFull: {
        // 内容区域是否通栏
        type: Boolean,
        default: false
      },
      isShadow: {
        // 是否开启阴影
        type: Boolean,
        default: true
      },
      shadow: {
        type: String,
        default: "0px 0px 3px 1px rgba(0, 0, 0, 0.08)"
      },
      border: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      onClick(type) {
        this.$emit("click", type);
      }
    }
  };
  function _sfc_render$u(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["uni-card", { "uni-card--full": $props.isFull, "uni-card--shadow": $props.isShadow, "uni-card--border": $props.border }]),
        style: vue.normalizeStyle({ "margin": $props.isFull ? 0 : $props.margin, "padding": $props.spacing, "box-shadow": $props.isShadow ? $props.shadow : "" })
      },
      [
        vue.createCommentVNode(" 封面 "),
        vue.renderSlot(_ctx.$slots, "cover", {}, () => [
          $props.cover ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "uni-card__cover"
          }, [
            vue.createElementVNode("image", {
              class: "uni-card__cover-image",
              mode: "widthFix",
              onClick: _cache[0] || (_cache[0] = ($event) => $options.onClick("cover")),
              src: $props.cover
            }, null, 8, ["src"])
          ])) : vue.createCommentVNode("v-if", true)
        ], true),
        vue.renderSlot(_ctx.$slots, "title", {}, () => [
          $props.title || $props.extra ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "uni-card__header"
          }, [
            vue.createCommentVNode(" 卡片标题 "),
            vue.createElementVNode("view", {
              class: "uni-card__header-box",
              onClick: _cache[1] || (_cache[1] = ($event) => $options.onClick("title"))
            }, [
              $props.thumbnail ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "uni-card__header-avatar"
              }, [
                vue.createElementVNode("image", {
                  class: "uni-card__header-avatar-image",
                  src: $props.thumbnail,
                  mode: "aspectFit"
                }, null, 8, ["src"])
              ])) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("view", { class: "uni-card__header-content" }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-card__header-content-title uni-ellipsis" },
                  vue.toDisplayString($props.title),
                  1
                  /* TEXT */
                ),
                $props.title && $props.subTitle ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "uni-card__header-content-subtitle uni-ellipsis"
                  },
                  vue.toDisplayString($props.subTitle),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ])
            ]),
            vue.createElementVNode("view", {
              class: "uni-card__header-extra",
              onClick: _cache[2] || (_cache[2] = ($event) => $options.onClick("extra"))
            }, [
              vue.createElementVNode(
                "text",
                { class: "uni-card__header-extra-text" },
                vue.toDisplayString($props.extra),
                1
                /* TEXT */
              )
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ], true),
        vue.createCommentVNode(" 卡片内容 "),
        vue.createElementVNode(
          "view",
          {
            class: "uni-card__content",
            style: vue.normalizeStyle({ padding: $props.padding }),
            onClick: _cache[3] || (_cache[3] = ($event) => $options.onClick("content"))
          },
          [
            vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
          ],
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", {
          class: "uni-card__actions",
          onClick: _cache[4] || (_cache[4] = ($event) => $options.onClick("actions"))
        }, [
          vue.renderSlot(_ctx.$slots, "actions", {}, void 0, true)
        ])
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$v, [["render", _sfc_render$u], ["__scopeId", "data-v-ae4bee67"], ["__file", "D:/project/dlw/uniapp-dileiwo/uni_modules/uni-card/components/uni-card/uni-card.vue"]]);
  const leftWindow = {
    path: "windows/left-window.vue",
    style: {
      width: "350px"
    }
  };
  const topWindow = {
    path: "windows/top-window.vue",
    style: {
      height: "60px"
    }
  };
  const pages = [
    {
      path: "pages/index/index",
      style: {
        "app-plus": {
          animationDuration: 200,
          animationType: "fade-in",
          background: "transparent",
          backgroundColorTop: "transparent",
          popGesture: "none",
          scrollIndicator: false,
          titleNView: false
        },
        disableScroll: true
      }
    },
    {
      path: "pages/login/login",
      style: {
        "app-plus": {
          animationDuration: 200,
          animationType: "fade-in",
          background: "transparent",
          backgroundColorTop: "transparent",
          popGesture: "none",
          scrollIndicator: false,
          titleNView: false
        },
        disableScroll: true
      }
    },
    {
      path: "pages/login/agreement",
      style: {
        navigationBarTitleText: "用户协议",
        navigationBarBackgroundColor: "#FFFFFF"
      }
    },
    {
      path: "pages/report/index",
      style: {
        navigationBarTitleText: "损坏申报",
        navigationBarBackgroundColor: "#FFFFFF"
      }
    },
    {
      path: "pages/delivery/index",
      style: {
        navigationBarTitleText: "选择出货单号",
        navigationBarBackgroundColor: "#FFFFFF",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/delivery/detailList",
      style: {
        navigationBarTitleText: "明细列表",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/delivery/deliveryError",
      style: {
        navigationBarTitleText: "",
        navigationBarBackgroundColor: "#FFFFFF"
      }
    },
    {
      path: "pages/recycle/detailList",
      style: {
        navigationBarTitleText: "回收复查"
      }
    },
    {
      path: "pages/recycle/recycleSuccess",
      style: {
        navigationBarTitleText: "",
        navigationBarBackgroundColor: "#FFFFFF"
      }
    },
    {
      path: "pages/auth/index",
      style: {
        navigationBarTitleText: "请选择认证单号",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/auth/check",
      style: {
        navigationBarTitleText: "包装核对讯息"
      }
    },
    {
      path: "pages/auth/detailList",
      style: {
        navigationBarTitleText: "明细列表",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/auth/authError",
      style: {
        navigationBarTitleText: "",
        navigationBarBackgroundColor: "#FFFFFF"
      }
    },
    {
      path: "pages/report/reportSuccess",
      style: {
        navigationBarTitleText: "",
        navigationBarBackgroundColor: "#FFFFFF"
      }
    },
    {
      path: "pages/web/report/index",
      style: {
        navigationBarTitleText: "损坏申报",
        navigationBarBackgroundColor: "#FFFFFF"
      }
    },
    {
      path: "pages/web/delivery/index",
      style: {
        navigationBarTitleText: "选择出货单号",
        navigationBarBackgroundColor: "#FFFFFF",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/web/delivery/detailList",
      style: {
        navigationBarTitleText: "明细列表",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/web/delivery/deliveryError",
      style: {
        navigationBarTitleText: "",
        navigationBarBackgroundColor: "#FFFFFF"
      }
    },
    {
      path: "pages/web/recycle/detailList",
      style: {
        navigationBarTitleText: "回收复查"
      }
    },
    {
      path: "pages/web/recycle/recycleSuccess",
      style: {
        navigationBarTitleText: "",
        navigationBarBackgroundColor: "#FFFFFF"
      }
    },
    {
      path: "pages/web/auth/index",
      style: {
        navigationBarTitleText: "请选择认证单号",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/web/auth/check",
      style: {
        navigationBarTitleText: "包装核对讯息"
      }
    },
    {
      path: "pages/web/auth/detailList",
      style: {
        navigationBarTitleText: "明细列表",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/web/auth/authError",
      style: {
        navigationBarTitleText: "",
        navigationBarBackgroundColor: "#FFFFFF"
      }
    },
    {
      path: "pages/web/report/reportSuccess",
      style: {
        navigationBarTitleText: "",
        navigationBarBackgroundColor: "#FFFFFF"
      }
    }
  ];
  const subPackages = [];
  const globalStyle = {
    pageOrientation: "portrait",
    navigationBarTitleText: "Hello uniapp",
    navigationBarTextStyle: "#0F182C",
    navigationBarBackgroundColor: "#FFFFFF",
    backgroundColor: "#F8F8F8",
    backgroundColorTop: "#F4F5F6",
    backgroundColorBottom: "#F4F5F6",
    "mp-360": {
      navigationStyle: "custom"
    },
    h5: {
      maxWidth: 1190,
      navigationBarTextStyle: "black",
      navigationBarBackgroundColor: "#F1F1F1"
    }
  };
  const tabBar = {
    color: "#7A7E83",
    selectedColor: "#99BBA0",
    borderStyle: "white",
    backgroundColor: "#F8F8F8",
    list: [
      {
        pagePath: "pages/auth/index",
        iconPath: "static/image/tabbar-auth@2x.png",
        selectedIconPath: "static/image/tabbar-auth-active@2x.png",
        text: "初始认证"
      },
      {
        pagePath: "pages/delivery/index",
        iconPath: "static/image/tabbar-delivery@2x.png",
        selectedIconPath: "static/image/tabbar-delivery-active@2x.png",
        text: "包装出库"
      },
      {
        pagePath: "pages/index/index",
        iconPath: "static/image/tabbar-home-active@2x.png",
        selectedIconPath: "static/image/tabbar-home-active@2x.png",
        text: "主页"
      },
      {
        pagePath: "pages/recycle/detailList",
        iconPath: "static/image/tabbar-recycle@2x.png",
        selectedIconPath: "static/image/tabbar-recycle-active@2x.png",
        text: "回收复查"
      },
      {
        pagePath: "pages/report/index",
        iconPath: "static/image/tabbar-report@2x.png",
        selectedIconPath: "static/image/tabbar-report-active@2x.png",
        text: "损坏申报"
      }
    ]
  };
  const e = {
    leftWindow,
    topWindow,
    pages,
    subPackages,
    globalStyle,
    tabBar
  };
  var define_process_env_UNI_SECURE_NETWORK_CONFIG_default = [];
  function t$1(e2) {
    return e2 && e2.__esModule && Object.prototype.hasOwnProperty.call(e2, "default") ? e2.default : e2;
  }
  function n(e2, t2, n2) {
    return e2(n2 = { path: t2, exports: {}, require: function(e3, t3) {
      return function() {
        throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
      }(null == t3 && n2.path);
    } }, n2.exports), n2.exports;
  }
  var s = n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = n2 || function(e3, t3) {
      var n3 = Object.create || /* @__PURE__ */ function() {
        function e4() {
        }
        return function(t4) {
          var n4;
          return e4.prototype = t4, n4 = new e4(), e4.prototype = null, n4;
        };
      }(), s2 = {}, r2 = s2.lib = {}, i2 = r2.Base = { extend: function(e4) {
        var t4 = n3(this);
        return e4 && t4.mixIn(e4), t4.hasOwnProperty("init") && this.init !== t4.init || (t4.init = function() {
          t4.$super.init.apply(this, arguments);
        }), t4.init.prototype = t4, t4.$super = this, t4;
      }, create: function() {
        var e4 = this.extend();
        return e4.init.apply(e4, arguments), e4;
      }, init: function() {
      }, mixIn: function(e4) {
        for (var t4 in e4)
          e4.hasOwnProperty(t4) && (this[t4] = e4[t4]);
        e4.hasOwnProperty("toString") && (this.toString = e4.toString);
      }, clone: function() {
        return this.init.prototype.extend(this);
      } }, o2 = r2.WordArray = i2.extend({ init: function(e4, n4) {
        e4 = this.words = e4 || [], this.sigBytes = n4 != t3 ? n4 : 4 * e4.length;
      }, toString: function(e4) {
        return (e4 || c2).stringify(this);
      }, concat: function(e4) {
        var t4 = this.words, n4 = e4.words, s3 = this.sigBytes, r3 = e4.sigBytes;
        if (this.clamp(), s3 % 4)
          for (var i3 = 0; i3 < r3; i3++) {
            var o3 = n4[i3 >>> 2] >>> 24 - i3 % 4 * 8 & 255;
            t4[s3 + i3 >>> 2] |= o3 << 24 - (s3 + i3) % 4 * 8;
          }
        else
          for (i3 = 0; i3 < r3; i3 += 4)
            t4[s3 + i3 >>> 2] = n4[i3 >>> 2];
        return this.sigBytes += r3, this;
      }, clamp: function() {
        var t4 = this.words, n4 = this.sigBytes;
        t4[n4 >>> 2] &= 4294967295 << 32 - n4 % 4 * 8, t4.length = e3.ceil(n4 / 4);
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4.words = this.words.slice(0), e4;
      }, random: function(t4) {
        for (var n4, s3 = [], r3 = function(t5) {
          t5 = t5;
          var n5 = 987654321, s4 = 4294967295;
          return function() {
            var r4 = ((n5 = 36969 * (65535 & n5) + (n5 >> 16) & s4) << 16) + (t5 = 18e3 * (65535 & t5) + (t5 >> 16) & s4) & s4;
            return r4 /= 4294967296, (r4 += 0.5) * (e3.random() > 0.5 ? 1 : -1);
          };
        }, i3 = 0; i3 < t4; i3 += 4) {
          var a3 = r3(4294967296 * (n4 || e3.random()));
          n4 = 987654071 * a3(), s3.push(4294967296 * a3() | 0);
        }
        return new o2.init(s3, t4);
      } }), a2 = s2.enc = {}, c2 = a2.Hex = { stringify: function(e4) {
        for (var t4 = e4.words, n4 = e4.sigBytes, s3 = [], r3 = 0; r3 < n4; r3++) {
          var i3 = t4[r3 >>> 2] >>> 24 - r3 % 4 * 8 & 255;
          s3.push((i3 >>> 4).toString(16)), s3.push((15 & i3).toString(16));
        }
        return s3.join("");
      }, parse: function(e4) {
        for (var t4 = e4.length, n4 = [], s3 = 0; s3 < t4; s3 += 2)
          n4[s3 >>> 3] |= parseInt(e4.substr(s3, 2), 16) << 24 - s3 % 8 * 4;
        return new o2.init(n4, t4 / 2);
      } }, u2 = a2.Latin1 = { stringify: function(e4) {
        for (var t4 = e4.words, n4 = e4.sigBytes, s3 = [], r3 = 0; r3 < n4; r3++) {
          var i3 = t4[r3 >>> 2] >>> 24 - r3 % 4 * 8 & 255;
          s3.push(String.fromCharCode(i3));
        }
        return s3.join("");
      }, parse: function(e4) {
        for (var t4 = e4.length, n4 = [], s3 = 0; s3 < t4; s3++)
          n4[s3 >>> 2] |= (255 & e4.charCodeAt(s3)) << 24 - s3 % 4 * 8;
        return new o2.init(n4, t4);
      } }, h2 = a2.Utf8 = { stringify: function(e4) {
        try {
          return decodeURIComponent(escape(u2.stringify(e4)));
        } catch (e5) {
          throw new Error("Malformed UTF-8 data");
        }
      }, parse: function(e4) {
        return u2.parse(unescape(encodeURIComponent(e4)));
      } }, l2 = r2.BufferedBlockAlgorithm = i2.extend({ reset: function() {
        this._data = new o2.init(), this._nDataBytes = 0;
      }, _append: function(e4) {
        "string" == typeof e4 && (e4 = h2.parse(e4)), this._data.concat(e4), this._nDataBytes += e4.sigBytes;
      }, _process: function(t4) {
        var n4 = this._data, s3 = n4.words, r3 = n4.sigBytes, i3 = this.blockSize, a3 = r3 / (4 * i3), c3 = (a3 = t4 ? e3.ceil(a3) : e3.max((0 | a3) - this._minBufferSize, 0)) * i3, u3 = e3.min(4 * c3, r3);
        if (c3) {
          for (var h3 = 0; h3 < c3; h3 += i3)
            this._doProcessBlock(s3, h3);
          var l3 = s3.splice(0, c3);
          n4.sigBytes -= u3;
        }
        return new o2.init(l3, u3);
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4._data = this._data.clone(), e4;
      }, _minBufferSize: 0 });
      r2.Hasher = l2.extend({ cfg: i2.extend(), init: function(e4) {
        this.cfg = this.cfg.extend(e4), this.reset();
      }, reset: function() {
        l2.reset.call(this), this._doReset();
      }, update: function(e4) {
        return this._append(e4), this._process(), this;
      }, finalize: function(e4) {
        return e4 && this._append(e4), this._doFinalize();
      }, blockSize: 16, _createHelper: function(e4) {
        return function(t4, n4) {
          return new e4.init(n4).finalize(t4);
        };
      }, _createHmacHelper: function(e4) {
        return function(t4, n4) {
          return new d2.HMAC.init(e4, n4).finalize(t4);
        };
      } });
      var d2 = s2.algo = {};
      return s2;
    }(Math), n2);
  }), r = s, i = (n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, function(e3) {
      var t3 = n2, s2 = t3.lib, r2 = s2.WordArray, i2 = s2.Hasher, o2 = t3.algo, a2 = [];
      !function() {
        for (var t4 = 0; t4 < 64; t4++)
          a2[t4] = 4294967296 * e3.abs(e3.sin(t4 + 1)) | 0;
      }();
      var c2 = o2.MD5 = i2.extend({ _doReset: function() {
        this._hash = new r2.init([1732584193, 4023233417, 2562383102, 271733878]);
      }, _doProcessBlock: function(e4, t4) {
        for (var n3 = 0; n3 < 16; n3++) {
          var s3 = t4 + n3, r3 = e4[s3];
          e4[s3] = 16711935 & (r3 << 8 | r3 >>> 24) | 4278255360 & (r3 << 24 | r3 >>> 8);
        }
        var i3 = this._hash.words, o3 = e4[t4 + 0], c3 = e4[t4 + 1], p2 = e4[t4 + 2], f2 = e4[t4 + 3], g2 = e4[t4 + 4], m2 = e4[t4 + 5], y2 = e4[t4 + 6], _2 = e4[t4 + 7], w2 = e4[t4 + 8], v2 = e4[t4 + 9], I2 = e4[t4 + 10], S2 = e4[t4 + 11], b2 = e4[t4 + 12], k2 = e4[t4 + 13], T2 = e4[t4 + 14], A2 = e4[t4 + 15], P2 = i3[0], C2 = i3[1], x2 = i3[2], O2 = i3[3];
        P2 = u2(P2, C2, x2, O2, o3, 7, a2[0]), O2 = u2(O2, P2, C2, x2, c3, 12, a2[1]), x2 = u2(x2, O2, P2, C2, p2, 17, a2[2]), C2 = u2(C2, x2, O2, P2, f2, 22, a2[3]), P2 = u2(P2, C2, x2, O2, g2, 7, a2[4]), O2 = u2(O2, P2, C2, x2, m2, 12, a2[5]), x2 = u2(x2, O2, P2, C2, y2, 17, a2[6]), C2 = u2(C2, x2, O2, P2, _2, 22, a2[7]), P2 = u2(P2, C2, x2, O2, w2, 7, a2[8]), O2 = u2(O2, P2, C2, x2, v2, 12, a2[9]), x2 = u2(x2, O2, P2, C2, I2, 17, a2[10]), C2 = u2(C2, x2, O2, P2, S2, 22, a2[11]), P2 = u2(P2, C2, x2, O2, b2, 7, a2[12]), O2 = u2(O2, P2, C2, x2, k2, 12, a2[13]), x2 = u2(x2, O2, P2, C2, T2, 17, a2[14]), P2 = h2(P2, C2 = u2(C2, x2, O2, P2, A2, 22, a2[15]), x2, O2, c3, 5, a2[16]), O2 = h2(O2, P2, C2, x2, y2, 9, a2[17]), x2 = h2(x2, O2, P2, C2, S2, 14, a2[18]), C2 = h2(C2, x2, O2, P2, o3, 20, a2[19]), P2 = h2(P2, C2, x2, O2, m2, 5, a2[20]), O2 = h2(O2, P2, C2, x2, I2, 9, a2[21]), x2 = h2(x2, O2, P2, C2, A2, 14, a2[22]), C2 = h2(C2, x2, O2, P2, g2, 20, a2[23]), P2 = h2(P2, C2, x2, O2, v2, 5, a2[24]), O2 = h2(O2, P2, C2, x2, T2, 9, a2[25]), x2 = h2(x2, O2, P2, C2, f2, 14, a2[26]), C2 = h2(C2, x2, O2, P2, w2, 20, a2[27]), P2 = h2(P2, C2, x2, O2, k2, 5, a2[28]), O2 = h2(O2, P2, C2, x2, p2, 9, a2[29]), x2 = h2(x2, O2, P2, C2, _2, 14, a2[30]), P2 = l2(P2, C2 = h2(C2, x2, O2, P2, b2, 20, a2[31]), x2, O2, m2, 4, a2[32]), O2 = l2(O2, P2, C2, x2, w2, 11, a2[33]), x2 = l2(x2, O2, P2, C2, S2, 16, a2[34]), C2 = l2(C2, x2, O2, P2, T2, 23, a2[35]), P2 = l2(P2, C2, x2, O2, c3, 4, a2[36]), O2 = l2(O2, P2, C2, x2, g2, 11, a2[37]), x2 = l2(x2, O2, P2, C2, _2, 16, a2[38]), C2 = l2(C2, x2, O2, P2, I2, 23, a2[39]), P2 = l2(P2, C2, x2, O2, k2, 4, a2[40]), O2 = l2(O2, P2, C2, x2, o3, 11, a2[41]), x2 = l2(x2, O2, P2, C2, f2, 16, a2[42]), C2 = l2(C2, x2, O2, P2, y2, 23, a2[43]), P2 = l2(P2, C2, x2, O2, v2, 4, a2[44]), O2 = l2(O2, P2, C2, x2, b2, 11, a2[45]), x2 = l2(x2, O2, P2, C2, A2, 16, a2[46]), P2 = d2(P2, C2 = l2(C2, x2, O2, P2, p2, 23, a2[47]), x2, O2, o3, 6, a2[48]), O2 = d2(O2, P2, C2, x2, _2, 10, a2[49]), x2 = d2(x2, O2, P2, C2, T2, 15, a2[50]), C2 = d2(C2, x2, O2, P2, m2, 21, a2[51]), P2 = d2(P2, C2, x2, O2, b2, 6, a2[52]), O2 = d2(O2, P2, C2, x2, f2, 10, a2[53]), x2 = d2(x2, O2, P2, C2, I2, 15, a2[54]), C2 = d2(C2, x2, O2, P2, c3, 21, a2[55]), P2 = d2(P2, C2, x2, O2, w2, 6, a2[56]), O2 = d2(O2, P2, C2, x2, A2, 10, a2[57]), x2 = d2(x2, O2, P2, C2, y2, 15, a2[58]), C2 = d2(C2, x2, O2, P2, k2, 21, a2[59]), P2 = d2(P2, C2, x2, O2, g2, 6, a2[60]), O2 = d2(O2, P2, C2, x2, S2, 10, a2[61]), x2 = d2(x2, O2, P2, C2, p2, 15, a2[62]), C2 = d2(C2, x2, O2, P2, v2, 21, a2[63]), i3[0] = i3[0] + P2 | 0, i3[1] = i3[1] + C2 | 0, i3[2] = i3[2] + x2 | 0, i3[3] = i3[3] + O2 | 0;
      }, _doFinalize: function() {
        var t4 = this._data, n3 = t4.words, s3 = 8 * this._nDataBytes, r3 = 8 * t4.sigBytes;
        n3[r3 >>> 5] |= 128 << 24 - r3 % 32;
        var i3 = e3.floor(s3 / 4294967296), o3 = s3;
        n3[15 + (r3 + 64 >>> 9 << 4)] = 16711935 & (i3 << 8 | i3 >>> 24) | 4278255360 & (i3 << 24 | i3 >>> 8), n3[14 + (r3 + 64 >>> 9 << 4)] = 16711935 & (o3 << 8 | o3 >>> 24) | 4278255360 & (o3 << 24 | o3 >>> 8), t4.sigBytes = 4 * (n3.length + 1), this._process();
        for (var a3 = this._hash, c3 = a3.words, u3 = 0; u3 < 4; u3++) {
          var h3 = c3[u3];
          c3[u3] = 16711935 & (h3 << 8 | h3 >>> 24) | 4278255360 & (h3 << 24 | h3 >>> 8);
        }
        return a3;
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4._hash = this._hash.clone(), e4;
      } });
      function u2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (t4 & n3 | ~t4 & s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function h2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (t4 & s3 | n3 & ~s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function l2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (t4 ^ n3 ^ s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function d2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (n3 ^ (t4 | ~s3)) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      t3.MD5 = i2._createHelper(c2), t3.HmacMD5 = i2._createHmacHelper(c2);
    }(Math), n2.MD5);
  }), n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, void function() {
      var e3 = n2, t3 = e3.lib.Base, s2 = e3.enc.Utf8;
      e3.algo.HMAC = t3.extend({ init: function(e4, t4) {
        e4 = this._hasher = new e4.init(), "string" == typeof t4 && (t4 = s2.parse(t4));
        var n3 = e4.blockSize, r2 = 4 * n3;
        t4.sigBytes > r2 && (t4 = e4.finalize(t4)), t4.clamp();
        for (var i2 = this._oKey = t4.clone(), o2 = this._iKey = t4.clone(), a2 = i2.words, c2 = o2.words, u2 = 0; u2 < n3; u2++)
          a2[u2] ^= 1549556828, c2[u2] ^= 909522486;
        i2.sigBytes = o2.sigBytes = r2, this.reset();
      }, reset: function() {
        var e4 = this._hasher;
        e4.reset(), e4.update(this._iKey);
      }, update: function(e4) {
        return this._hasher.update(e4), this;
      }, finalize: function(e4) {
        var t4 = this._hasher, n3 = t4.finalize(e4);
        return t4.reset(), t4.finalize(this._oKey.clone().concat(n3));
      } });
    }());
  }), n(function(e2, t2) {
    e2.exports = r.HmacMD5;
  })), o = n(function(e2, t2) {
    e2.exports = r.enc.Utf8;
  }), a = n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, function() {
      var e3 = n2, t3 = e3.lib.WordArray;
      function s2(e4, n3, s3) {
        for (var r2 = [], i2 = 0, o2 = 0; o2 < n3; o2++)
          if (o2 % 4) {
            var a2 = s3[e4.charCodeAt(o2 - 1)] << o2 % 4 * 2, c2 = s3[e4.charCodeAt(o2)] >>> 6 - o2 % 4 * 2;
            r2[i2 >>> 2] |= (a2 | c2) << 24 - i2 % 4 * 8, i2++;
          }
        return t3.create(r2, i2);
      }
      e3.enc.Base64 = { stringify: function(e4) {
        var t4 = e4.words, n3 = e4.sigBytes, s3 = this._map;
        e4.clamp();
        for (var r2 = [], i2 = 0; i2 < n3; i2 += 3)
          for (var o2 = (t4[i2 >>> 2] >>> 24 - i2 % 4 * 8 & 255) << 16 | (t4[i2 + 1 >>> 2] >>> 24 - (i2 + 1) % 4 * 8 & 255) << 8 | t4[i2 + 2 >>> 2] >>> 24 - (i2 + 2) % 4 * 8 & 255, a2 = 0; a2 < 4 && i2 + 0.75 * a2 < n3; a2++)
            r2.push(s3.charAt(o2 >>> 6 * (3 - a2) & 63));
        var c2 = s3.charAt(64);
        if (c2)
          for (; r2.length % 4; )
            r2.push(c2);
        return r2.join("");
      }, parse: function(e4) {
        var t4 = e4.length, n3 = this._map, r2 = this._reverseMap;
        if (!r2) {
          r2 = this._reverseMap = [];
          for (var i2 = 0; i2 < n3.length; i2++)
            r2[n3.charCodeAt(i2)] = i2;
        }
        var o2 = n3.charAt(64);
        if (o2) {
          var a2 = e4.indexOf(o2);
          -1 !== a2 && (t4 = a2);
        }
        return s2(e4, t4, r2);
      }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" };
    }(), n2.enc.Base64);
  });
  const c = "FUNCTION", u = "OBJECT", h = "CLIENT_DB", l = "pending", d = "fulfilled", p = "rejected";
  function f(e2) {
    return Object.prototype.toString.call(e2).slice(8, -1).toLowerCase();
  }
  function g(e2) {
    return "object" === f(e2);
  }
  function m(e2) {
    return "function" == typeof e2;
  }
  function y(e2) {
    return function() {
      try {
        return e2.apply(e2, arguments);
      } catch (e3) {
        console.error(e3);
      }
    };
  }
  const _ = "REJECTED", w = "NOT_PENDING";
  class v {
    constructor({ createPromise: e2, retryRule: t2 = _ } = {}) {
      this.createPromise = e2, this.status = null, this.promise = null, this.retryRule = t2;
    }
    get needRetry() {
      if (!this.status)
        return true;
      switch (this.retryRule) {
        case _:
          return this.status === p;
        case w:
          return this.status !== l;
      }
    }
    exec() {
      return this.needRetry ? (this.status = l, this.promise = this.createPromise().then((e2) => (this.status = d, Promise.resolve(e2)), (e2) => (this.status = p, Promise.reject(e2))), this.promise) : this.promise;
    }
  }
  function I(e2) {
    return e2 && "string" == typeof e2 ? JSON.parse(e2) : e2;
  }
  const S = true, b = "app", T = I(define_process_env_UNI_SECURE_NETWORK_CONFIG_default), A = b, P = I(""), C = I("[]") || [];
  let O = "";
  try {
    O = "__UNI__74CDCF2";
  } catch (e2) {
  }
  let E, L = {};
  function R(e2, t2 = {}) {
    var n2, s2;
    return n2 = L, s2 = e2, Object.prototype.hasOwnProperty.call(n2, s2) || (L[e2] = t2), L[e2];
  }
  function U() {
    return E || (E = function() {
      if ("undefined" != typeof globalThis)
        return globalThis;
      if ("undefined" != typeof self)
        return self;
      if ("undefined" != typeof window)
        return window;
      function e2() {
        return this;
      }
      return void 0 !== e2() ? e2() : new Function("return this")();
    }(), E);
  }
  L = uni._globalUniCloudObj ? uni._globalUniCloudObj : uni._globalUniCloudObj = {};
  const N = ["invoke", "success", "fail", "complete"], D = R("_globalUniCloudInterceptor");
  function M(e2, t2) {
    D[e2] || (D[e2] = {}), g(t2) && Object.keys(t2).forEach((n2) => {
      N.indexOf(n2) > -1 && function(e3, t3, n3) {
        let s2 = D[e3][t3];
        s2 || (s2 = D[e3][t3] = []), -1 === s2.indexOf(n3) && m(n3) && s2.push(n3);
      }(e2, n2, t2[n2]);
    });
  }
  function q(e2, t2) {
    D[e2] || (D[e2] = {}), g(t2) ? Object.keys(t2).forEach((n2) => {
      N.indexOf(n2) > -1 && function(e3, t3, n3) {
        const s2 = D[e3][t3];
        if (!s2)
          return;
        const r2 = s2.indexOf(n3);
        r2 > -1 && s2.splice(r2, 1);
      }(e2, n2, t2[n2]);
    }) : delete D[e2];
  }
  function K(e2, t2) {
    return e2 && 0 !== e2.length ? e2.reduce((e3, n2) => e3.then(() => n2(t2)), Promise.resolve()) : Promise.resolve();
  }
  function F(e2, t2) {
    return D[e2] && D[e2][t2] || [];
  }
  function j(e2) {
    M("callObject", e2);
  }
  const $ = R("_globalUniCloudListener"), B = "response", W = "needLogin", H = "refreshToken", J = "clientdb", z = "cloudfunction", V = "cloudobject";
  function G(e2) {
    return $[e2] || ($[e2] = []), $[e2];
  }
  function Y(e2, t2) {
    const n2 = G(e2);
    n2.includes(t2) || n2.push(t2);
  }
  function Q(e2, t2) {
    const n2 = G(e2), s2 = n2.indexOf(t2);
    -1 !== s2 && n2.splice(s2, 1);
  }
  function X(e2, t2) {
    const n2 = G(e2);
    for (let e3 = 0; e3 < n2.length; e3++) {
      (0, n2[e3])(t2);
    }
  }
  let Z, ee = false;
  function te() {
    return Z || (Z = new Promise((e2) => {
      ee && e2(), function t2() {
        if ("function" == typeof getCurrentPages) {
          const t3 = getCurrentPages();
          t3 && t3[0] && (ee = true, e2());
        }
        ee || setTimeout(() => {
          t2();
        }, 30);
      }();
    }), Z);
  }
  function ne(e2) {
    const t2 = {};
    for (const n2 in e2) {
      const s2 = e2[n2];
      m(s2) && (t2[n2] = y(s2));
    }
    return t2;
  }
  class se extends Error {
    constructor(e2) {
      super(e2.message), this.errMsg = e2.message || e2.errMsg || "unknown system error", this.code = this.errCode = e2.code || e2.errCode || "SYSTEM_ERROR", this.errSubject = this.subject = e2.subject || e2.errSubject, this.cause = e2.cause, this.requestId = e2.requestId;
    }
    toJson(e2 = 0) {
      if (!(e2 >= 10))
        return e2++, { errCode: this.errCode, errMsg: this.errMsg, errSubject: this.errSubject, cause: this.cause && this.cause.toJson ? this.cause.toJson(e2) : this.cause };
    }
  }
  var re = { request: (e2) => uni.request(e2), uploadFile: (e2) => uni.uploadFile(e2), setStorageSync: (e2, t2) => uni.setStorageSync(e2, t2), getStorageSync: (e2) => uni.getStorageSync(e2), removeStorageSync: (e2) => uni.removeStorageSync(e2), clearStorageSync: () => uni.clearStorageSync(), connectSocket: (e2) => uni.connectSocket(e2) };
  function ie(e2) {
    return e2 && ie(e2.__v_raw) || e2;
  }
  function oe() {
    return { token: re.getStorageSync("uni_id_token") || re.getStorageSync("uniIdToken"), tokenExpired: re.getStorageSync("uni_id_token_expired") };
  }
  function ae({ token: e2, tokenExpired: t2 } = {}) {
    e2 && re.setStorageSync("uni_id_token", e2), t2 && re.setStorageSync("uni_id_token_expired", t2);
  }
  let ce, ue;
  function he() {
    return ce || (ce = uni.getSystemInfoSync()), ce;
  }
  function le() {
    let e2, t2;
    try {
      if (uni.getLaunchOptionsSync) {
        if (uni.getLaunchOptionsSync.toString().indexOf("not yet implemented") > -1)
          return;
        const { scene: n2, channel: s2 } = uni.getLaunchOptionsSync();
        e2 = s2, t2 = n2;
      }
    } catch (e3) {
    }
    return { channel: e2, scene: t2 };
  }
  let de = {};
  function pe() {
    const e2 = uni.getLocale && uni.getLocale() || "en";
    if (ue)
      return { ...de, ...ue, locale: e2, LOCALE: e2 };
    const t2 = he(), { deviceId: n2, osName: s2, uniPlatform: r2, appId: i2 } = t2, o2 = ["appId", "appLanguage", "appName", "appVersion", "appVersionCode", "appWgtVersion", "browserName", "browserVersion", "deviceBrand", "deviceId", "deviceModel", "deviceType", "osName", "osVersion", "romName", "romVersion", "ua", "hostName", "hostVersion", "uniPlatform", "uniRuntimeVersion", "uniRuntimeVersionCode", "uniCompilerVersion", "uniCompilerVersionCode"];
    for (const e3 in t2)
      Object.hasOwnProperty.call(t2, e3) && -1 === o2.indexOf(e3) && delete t2[e3];
    return ue = { PLATFORM: r2, OS: s2, APPID: i2, DEVICEID: n2, ...le(), ...t2 }, { ...de, ...ue, locale: e2, LOCALE: e2 };
  }
  var fe = { sign: function(e2, t2) {
    let n2 = "";
    return Object.keys(e2).sort().forEach(function(t3) {
      e2[t3] && (n2 = n2 + "&" + t3 + "=" + e2[t3]);
    }), n2 = n2.slice(1), i(n2, t2).toString();
  }, wrappedRequest: function(e2, t2) {
    return new Promise((n2, s2) => {
      t2(Object.assign(e2, { complete(e3) {
        e3 || (e3 = {});
        const t3 = e3.data && e3.data.header && e3.data.header["x-serverless-request-id"] || e3.header && e3.header["request-id"];
        if (!e3.statusCode || e3.statusCode >= 400) {
          const n3 = e3.data && e3.data.error && e3.data.error.code || "SYS_ERR", r3 = e3.data && e3.data.error && e3.data.error.message || e3.errMsg || "request:fail";
          return s2(new se({ code: n3, message: r3, requestId: t3 }));
        }
        const r2 = e3.data;
        if (r2.error)
          return s2(new se({ code: r2.error.code, message: r2.error.message, requestId: t3 }));
        r2.result = r2.data, r2.requestId = t3, delete r2.data, n2(r2);
      } }));
    });
  }, toBase64: function(e2) {
    return a.stringify(o.parse(e2));
  } };
  var ge = class {
    constructor(e2) {
      ["spaceId", "clientSecret"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e2, t2))
          throw new Error(`${t2} required`);
      }), this.config = Object.assign({}, { endpoint: 0 === e2.spaceId.indexOf("mp-") ? "https://api.next.bspapp.com" : "https://api.bspapp.com" }, e2), this.config.provider = "aliyun", this.config.requestUrl = this.config.endpoint + "/client", this.config.envType = this.config.envType || "public", this.config.accessTokenKey = "access_token_" + this.config.spaceId, this.adapter = re, this._getAccessTokenPromiseHub = new v({ createPromise: () => this.requestAuth(this.setupRequest({ method: "serverless.auth.user.anonymousAuthorize", params: "{}" }, "auth")).then((e3) => {
        if (!e3.result || !e3.result.accessToken)
          throw new se({ code: "AUTH_FAILED", message: "获取accessToken失败" });
        this.setAccessToken(e3.result.accessToken);
      }), retryRule: w });
    }
    get hasAccessToken() {
      return !!this.accessToken;
    }
    setAccessToken(e2) {
      this.accessToken = e2;
    }
    requestWrapped(e2) {
      return fe.wrappedRequest(e2, this.adapter.request);
    }
    requestAuth(e2) {
      return this.requestWrapped(e2);
    }
    request(e2, t2) {
      return Promise.resolve().then(() => this.hasAccessToken ? t2 ? this.requestWrapped(e2) : this.requestWrapped(e2).catch((t3) => new Promise((e3, n2) => {
        !t3 || "GATEWAY_INVALID_TOKEN" !== t3.code && "InvalidParameter.InvalidToken" !== t3.code ? n2(t3) : e3();
      }).then(() => this.getAccessToken()).then(() => {
        const t4 = this.rebuildRequest(e2);
        return this.request(t4, true);
      })) : this.getAccessToken().then(() => {
        const t3 = this.rebuildRequest(e2);
        return this.request(t3, true);
      }));
    }
    rebuildRequest(e2) {
      const t2 = Object.assign({}, e2);
      return t2.data.token = this.accessToken, t2.header["x-basement-token"] = this.accessToken, t2.header["x-serverless-sign"] = fe.sign(t2.data, this.config.clientSecret), t2;
    }
    setupRequest(e2, t2) {
      const n2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now() }), s2 = { "Content-Type": "application/json" };
      return "auth" !== t2 && (n2.token = this.accessToken, s2["x-basement-token"] = this.accessToken), s2["x-serverless-sign"] = fe.sign(n2, this.config.clientSecret), { url: this.config.requestUrl, method: "POST", data: n2, dataType: "json", header: s2 };
    }
    getAccessToken() {
      return this._getAccessTokenPromiseHub.exec();
    }
    async authorize() {
      await this.getAccessToken();
    }
    callFunction(e2) {
      const t2 = { method: "serverless.function.runtime.invoke", params: JSON.stringify({ functionTarget: e2.name, functionArgs: e2.data || {} }) };
      return this.request({ ...this.setupRequest(t2), timeout: e2.timeout });
    }
    getOSSUploadOptionsFromPath(e2) {
      const t2 = { method: "serverless.file.resource.generateProximalSign", params: JSON.stringify(e2) };
      return this.request(this.setupRequest(t2));
    }
    uploadFileToOSS({ url: e2, formData: t2, name: n2, filePath: s2, fileType: r2, onUploadProgress: i2 }) {
      return new Promise((o2, a2) => {
        const c2 = this.adapter.uploadFile({ url: e2, formData: t2, name: n2, filePath: s2, fileType: r2, header: { "X-OSS-server-side-encrpytion": "AES256" }, success(e3) {
          e3 && e3.statusCode < 400 ? o2(e3) : a2(new se({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
        }, fail(e3) {
          a2(new se({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
        } });
        "function" == typeof i2 && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((e3) => {
          i2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
        });
      });
    }
    reportOSSUpload(e2) {
      const t2 = { method: "serverless.file.resource.report", params: JSON.stringify(e2) };
      return this.request(this.setupRequest(t2));
    }
    async uploadFile({ filePath: e2, cloudPath: t2, fileType: n2 = "image", cloudPathAsRealPath: s2 = false, onUploadProgress: r2, config: i2 }) {
      if ("string" !== f(t2))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath必须为字符串类型" });
      if (!(t2 = t2.trim()))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath不可为空" });
      if (/:\/\//.test(t2))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath不合法" });
      const o2 = i2 && i2.envType || this.config.envType;
      if (s2 && ("/" !== t2[0] && (t2 = "/" + t2), t2.indexOf("\\") > -1))
        throw new se({ code: "INVALID_PARAM", message: "使用cloudPath作为路径时，cloudPath不可包含“\\”" });
      const a2 = (await this.getOSSUploadOptionsFromPath({ env: o2, filename: s2 ? t2.split("/").pop() : t2, fileId: s2 ? t2 : void 0 })).result, c2 = "https://" + a2.cdnDomain + "/" + a2.ossPath, { securityToken: u2, accessKeyId: h2, signature: l2, host: d2, ossPath: p2, id: g2, policy: m2, ossCallbackUrl: y2 } = a2, _2 = { "Cache-Control": "max-age=2592000", "Content-Disposition": "attachment", OSSAccessKeyId: h2, Signature: l2, host: d2, id: g2, key: p2, policy: m2, success_action_status: 200 };
      if (u2 && (_2["x-oss-security-token"] = u2), y2) {
        const e3 = JSON.stringify({ callbackUrl: y2, callbackBody: JSON.stringify({ fileId: g2, spaceId: this.config.spaceId }), callbackBodyType: "application/json" });
        _2.callback = fe.toBase64(e3);
      }
      const w2 = { url: "https://" + a2.host, formData: _2, fileName: "file", name: "file", filePath: e2, fileType: n2 };
      if (await this.uploadFileToOSS(Object.assign({}, w2, { onUploadProgress: r2 })), y2)
        return { success: true, filePath: e2, fileID: c2 };
      if ((await this.reportOSSUpload({ id: g2 })).success)
        return { success: true, filePath: e2, fileID: c2 };
      throw new se({ code: "UPLOAD_FAILED", message: "文件上传失败" });
    }
    getTempFileURL({ fileList: e2 } = {}) {
      return new Promise((t2, n2) => {
        Array.isArray(e2) && 0 !== e2.length || n2(new se({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" })), t2({ fileList: e2.map((e3) => ({ fileID: e3, tempFileURL: e3 })) });
      });
    }
    async getFileInfo({ fileList: e2 } = {}) {
      if (!Array.isArray(e2) || 0 === e2.length)
        throw new se({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
      const t2 = { method: "serverless.file.resource.info", params: JSON.stringify({ id: e2.map((e3) => e3.split("?")[0]).join(",") }) };
      return { fileList: (await this.request(this.setupRequest(t2))).result };
    }
  };
  var me = { init(e2) {
    const t2 = new ge(e2), n2 = { signInAnonymously: function() {
      return t2.authorize();
    }, getLoginState: function() {
      return Promise.resolve(false);
    } };
    return t2.auth = function() {
      return n2;
    }, t2.customAuth = t2.auth, t2;
  } };
  const ye = "undefined" != typeof location && "http:" === location.protocol ? "http:" : "https:";
  var _e;
  !function(e2) {
    e2.local = "local", e2.none = "none", e2.session = "session";
  }(_e || (_e = {}));
  var we = function() {
  }, ve = n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, function(e3) {
      var t3 = n2, s2 = t3.lib, r2 = s2.WordArray, i2 = s2.Hasher, o2 = t3.algo, a2 = [], c2 = [];
      !function() {
        function t4(t5) {
          for (var n4 = e3.sqrt(t5), s4 = 2; s4 <= n4; s4++)
            if (!(t5 % s4))
              return false;
          return true;
        }
        function n3(e4) {
          return 4294967296 * (e4 - (0 | e4)) | 0;
        }
        for (var s3 = 2, r3 = 0; r3 < 64; )
          t4(s3) && (r3 < 8 && (a2[r3] = n3(e3.pow(s3, 0.5))), c2[r3] = n3(e3.pow(s3, 1 / 3)), r3++), s3++;
      }();
      var u2 = [], h2 = o2.SHA256 = i2.extend({ _doReset: function() {
        this._hash = new r2.init(a2.slice(0));
      }, _doProcessBlock: function(e4, t4) {
        for (var n3 = this._hash.words, s3 = n3[0], r3 = n3[1], i3 = n3[2], o3 = n3[3], a3 = n3[4], h3 = n3[5], l2 = n3[6], d2 = n3[7], p2 = 0; p2 < 64; p2++) {
          if (p2 < 16)
            u2[p2] = 0 | e4[t4 + p2];
          else {
            var f2 = u2[p2 - 15], g2 = (f2 << 25 | f2 >>> 7) ^ (f2 << 14 | f2 >>> 18) ^ f2 >>> 3, m2 = u2[p2 - 2], y2 = (m2 << 15 | m2 >>> 17) ^ (m2 << 13 | m2 >>> 19) ^ m2 >>> 10;
            u2[p2] = g2 + u2[p2 - 7] + y2 + u2[p2 - 16];
          }
          var _2 = s3 & r3 ^ s3 & i3 ^ r3 & i3, w2 = (s3 << 30 | s3 >>> 2) ^ (s3 << 19 | s3 >>> 13) ^ (s3 << 10 | s3 >>> 22), v2 = d2 + ((a3 << 26 | a3 >>> 6) ^ (a3 << 21 | a3 >>> 11) ^ (a3 << 7 | a3 >>> 25)) + (a3 & h3 ^ ~a3 & l2) + c2[p2] + u2[p2];
          d2 = l2, l2 = h3, h3 = a3, a3 = o3 + v2 | 0, o3 = i3, i3 = r3, r3 = s3, s3 = v2 + (w2 + _2) | 0;
        }
        n3[0] = n3[0] + s3 | 0, n3[1] = n3[1] + r3 | 0, n3[2] = n3[2] + i3 | 0, n3[3] = n3[3] + o3 | 0, n3[4] = n3[4] + a3 | 0, n3[5] = n3[5] + h3 | 0, n3[6] = n3[6] + l2 | 0, n3[7] = n3[7] + d2 | 0;
      }, _doFinalize: function() {
        var t4 = this._data, n3 = t4.words, s3 = 8 * this._nDataBytes, r3 = 8 * t4.sigBytes;
        return n3[r3 >>> 5] |= 128 << 24 - r3 % 32, n3[14 + (r3 + 64 >>> 9 << 4)] = e3.floor(s3 / 4294967296), n3[15 + (r3 + 64 >>> 9 << 4)] = s3, t4.sigBytes = 4 * n3.length, this._process(), this._hash;
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4._hash = this._hash.clone(), e4;
      } });
      t3.SHA256 = i2._createHelper(h2), t3.HmacSHA256 = i2._createHmacHelper(h2);
    }(Math), n2.SHA256);
  }), Ie = ve, Se = n(function(e2, t2) {
    e2.exports = r.HmacSHA256;
  });
  const be = () => {
    let e2;
    if (!Promise) {
      e2 = () => {
      }, e2.promise = {};
      const t3 = () => {
        throw new se({ message: 'Your Node runtime does support ES6 Promises. Set "global.Promise" to your preferred implementation of promises.' });
      };
      return Object.defineProperty(e2.promise, "then", { get: t3 }), Object.defineProperty(e2.promise, "catch", { get: t3 }), e2;
    }
    const t2 = new Promise((t3, n2) => {
      e2 = (e3, s2) => e3 ? n2(e3) : t3(s2);
    });
    return e2.promise = t2, e2;
  };
  function ke(e2) {
    return void 0 === e2;
  }
  function Te(e2) {
    return "[object Null]" === Object.prototype.toString.call(e2);
  }
  function Ae(e2 = "") {
    return e2.replace(/([\s\S]+)\s+(请前往云开发AI小助手查看问题：.*)/, "$1");
  }
  function Pe(e2 = 32) {
    const t2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", n2 = t2.length;
    let s2 = "";
    for (let r2 = 0; r2 < e2; r2++)
      s2 += t2.charAt(Math.floor(Math.random() * n2));
    return s2;
  }
  var Ce;
  function xe(e2) {
    const t2 = (n2 = e2, "[object Array]" === Object.prototype.toString.call(n2) ? e2 : [e2]);
    var n2;
    for (const e3 of t2) {
      const { isMatch: t3, genAdapter: n3, runtime: s2 } = e3;
      if (t3())
        return { adapter: n3(), runtime: s2 };
    }
  }
  !function(e2) {
    e2.WEB = "web", e2.WX_MP = "wx_mp";
  }(Ce || (Ce = {}));
  const Oe = { adapter: null, runtime: void 0 }, Ee = ["anonymousUuidKey"];
  class Le extends we {
    constructor() {
      super(), Oe.adapter.root.tcbObject || (Oe.adapter.root.tcbObject = {});
    }
    setItem(e2, t2) {
      Oe.adapter.root.tcbObject[e2] = t2;
    }
    getItem(e2) {
      return Oe.adapter.root.tcbObject[e2];
    }
    removeItem(e2) {
      delete Oe.adapter.root.tcbObject[e2];
    }
    clear() {
      delete Oe.adapter.root.tcbObject;
    }
  }
  function Re(e2, t2) {
    switch (e2) {
      case "local":
        return t2.localStorage || new Le();
      case "none":
        return new Le();
      default:
        return t2.sessionStorage || new Le();
    }
  }
  class Ue {
    constructor(e2) {
      if (!this._storage) {
        this._persistence = Oe.adapter.primaryStorage || e2.persistence, this._storage = Re(this._persistence, Oe.adapter);
        const t2 = `access_token_${e2.env}`, n2 = `access_token_expire_${e2.env}`, s2 = `refresh_token_${e2.env}`, r2 = `anonymous_uuid_${e2.env}`, i2 = `login_type_${e2.env}`, o2 = "device_id", a2 = `token_type_${e2.env}`, c2 = `user_info_${e2.env}`;
        this.keys = { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2, anonymousUuidKey: r2, loginTypeKey: i2, userInfoKey: c2, deviceIdKey: o2, tokenTypeKey: a2 };
      }
    }
    updatePersistence(e2) {
      if (e2 === this._persistence)
        return;
      const t2 = "local" === this._persistence;
      this._persistence = e2;
      const n2 = Re(e2, Oe.adapter);
      for (const e3 in this.keys) {
        const s2 = this.keys[e3];
        if (t2 && Ee.includes(e3))
          continue;
        const r2 = this._storage.getItem(s2);
        ke(r2) || Te(r2) || (n2.setItem(s2, r2), this._storage.removeItem(s2));
      }
      this._storage = n2;
    }
    setStore(e2, t2, n2) {
      if (!this._storage)
        return;
      const s2 = { version: n2 || "localCachev1", content: t2 }, r2 = JSON.stringify(s2);
      try {
        this._storage.setItem(e2, r2);
      } catch (e3) {
        throw e3;
      }
    }
    getStore(e2, t2) {
      try {
        if (!this._storage)
          return;
      } catch (e3) {
        return "";
      }
      t2 = t2 || "localCachev1";
      const n2 = this._storage.getItem(e2);
      if (!n2)
        return "";
      if (n2.indexOf(t2) >= 0) {
        return JSON.parse(n2).content;
      }
      return "";
    }
    removeStore(e2) {
      this._storage.removeItem(e2);
    }
  }
  const Ne = {}, De = {};
  function Me(e2) {
    return Ne[e2];
  }
  class qe {
    constructor(e2, t2) {
      this.data = t2 || null, this.name = e2;
    }
  }
  class Ke extends qe {
    constructor(e2, t2) {
      super("error", { error: e2, data: t2 }), this.error = e2;
    }
  }
  const Fe = new class {
    constructor() {
      this._listeners = {};
    }
    on(e2, t2) {
      return function(e3, t3, n2) {
        n2[e3] = n2[e3] || [], n2[e3].push(t3);
      }(e2, t2, this._listeners), this;
    }
    off(e2, t2) {
      return function(e3, t3, n2) {
        if (n2 && n2[e3]) {
          const s2 = n2[e3].indexOf(t3);
          -1 !== s2 && n2[e3].splice(s2, 1);
        }
      }(e2, t2, this._listeners), this;
    }
    fire(e2, t2) {
      if (e2 instanceof Ke)
        return console.error(e2.error), this;
      const n2 = "string" == typeof e2 ? new qe(e2, t2 || {}) : e2;
      const s2 = n2.name;
      if (this._listens(s2)) {
        n2.target = this;
        const e3 = this._listeners[s2] ? [...this._listeners[s2]] : [];
        for (const t3 of e3)
          t3.call(this, n2);
      }
      return this;
    }
    _listens(e2) {
      return this._listeners[e2] && this._listeners[e2].length > 0;
    }
  }();
  function je(e2, t2) {
    Fe.on(e2, t2);
  }
  function $e(e2, t2 = {}) {
    Fe.fire(e2, t2);
  }
  function Be(e2, t2) {
    Fe.off(e2, t2);
  }
  const We = "loginStateChanged", He = "loginStateExpire", Je = "loginTypeChanged", ze = "anonymousConverted", Ve = "refreshAccessToken";
  var Ge;
  !function(e2) {
    e2.ANONYMOUS = "ANONYMOUS", e2.WECHAT = "WECHAT", e2.WECHAT_PUBLIC = "WECHAT-PUBLIC", e2.WECHAT_OPEN = "WECHAT-OPEN", e2.CUSTOM = "CUSTOM", e2.EMAIL = "EMAIL", e2.USERNAME = "USERNAME", e2.NULL = "NULL";
  }(Ge || (Ge = {}));
  class Ye {
    constructor() {
      this._fnPromiseMap = /* @__PURE__ */ new Map();
    }
    async run(e2, t2) {
      let n2 = this._fnPromiseMap.get(e2);
      return n2 || (n2 = new Promise(async (n3, s2) => {
        try {
          await this._runIdlePromise();
          const s3 = t2();
          n3(await s3);
        } catch (e3) {
          s2(e3);
        } finally {
          this._fnPromiseMap.delete(e2);
        }
      }), this._fnPromiseMap.set(e2, n2)), n2;
    }
    _runIdlePromise() {
      return Promise.resolve();
    }
  }
  class Qe {
    constructor(e2) {
      this._singlePromise = new Ye(), this._cache = Me(e2.env), this._baseURL = `https://${e2.env}.ap-shanghai.tcb-api.tencentcloudapi.com`, this._reqClass = new Oe.adapter.reqClass({ timeout: e2.timeout, timeoutMsg: `请求在${e2.timeout / 1e3}s内未完成，已中断`, restrictedMethods: ["post"] });
    }
    _getDeviceId() {
      if (this._deviceID)
        return this._deviceID;
      const { deviceIdKey: e2 } = this._cache.keys;
      let t2 = this._cache.getStore(e2);
      return "string" == typeof t2 && t2.length >= 16 && t2.length <= 48 || (t2 = Pe(), this._cache.setStore(e2, t2)), this._deviceID = t2, t2;
    }
    async _request(e2, t2, n2 = {}) {
      const s2 = { "x-request-id": Pe(), "x-device-id": this._getDeviceId() };
      if (n2.withAccessToken) {
        const { tokenTypeKey: e3 } = this._cache.keys, t3 = await this.getAccessToken(), n3 = this._cache.getStore(e3);
        s2.authorization = `${n3} ${t3}`;
      }
      return this._reqClass["get" === n2.method ? "get" : "post"]({ url: `${this._baseURL}${e2}`, data: t2, headers: s2 });
    }
    async _fetchAccessToken() {
      const { loginTypeKey: e2, accessTokenKey: t2, accessTokenExpireKey: n2, tokenTypeKey: s2 } = this._cache.keys, r2 = this._cache.getStore(e2);
      if (r2 && r2 !== Ge.ANONYMOUS)
        throw new se({ code: "INVALID_OPERATION", message: "非匿名登录不支持刷新 access token" });
      const i2 = await this._singlePromise.run("fetchAccessToken", async () => (await this._request("/auth/v1/signin/anonymously", {}, { method: "post" })).data), { access_token: o2, expires_in: a2, token_type: c2 } = i2;
      return this._cache.setStore(s2, c2), this._cache.setStore(t2, o2), this._cache.setStore(n2, Date.now() + 1e3 * a2), o2;
    }
    isAccessTokenExpired(e2, t2) {
      let n2 = true;
      return e2 && t2 && (n2 = t2 < Date.now()), n2;
    }
    async getAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2), s2 = this._cache.getStore(t2);
      return this.isAccessTokenExpired(n2, s2) ? this._fetchAccessToken() : n2;
    }
    async refreshAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2, loginTypeKey: n2 } = this._cache.keys;
      return this._cache.removeStore(e2), this._cache.removeStore(t2), this._cache.setStore(n2, Ge.ANONYMOUS), this.getAccessToken();
    }
    async getUserInfo() {
      return this._singlePromise.run("getUserInfo", async () => (await this._request("/auth/v1/user/me", {}, { withAccessToken: true, method: "get" })).data);
    }
  }
  const Xe = ["auth.getJwt", "auth.logout", "auth.signInWithTicket", "auth.signInAnonymously", "auth.signIn", "auth.fetchAccessTokenWithRefreshToken", "auth.signUpWithEmailAndPassword", "auth.activateEndUserMail", "auth.sendPasswordResetEmail", "auth.resetPasswordWithToken", "auth.isUsernameRegistered"], Ze = { "X-SDK-Version": "1.3.5" };
  function et(e2, t2, n2) {
    const s2 = e2[t2];
    e2[t2] = function(t3) {
      const r2 = {}, i2 = {};
      n2.forEach((n3) => {
        const { data: s3, headers: o3 } = n3.call(e2, t3);
        Object.assign(r2, s3), Object.assign(i2, o3);
      });
      const o2 = t3.data;
      return o2 && (() => {
        var e3;
        if (e3 = o2, "[object FormData]" !== Object.prototype.toString.call(e3))
          t3.data = { ...o2, ...r2 };
        else
          for (const e4 in r2)
            o2.append(e4, r2[e4]);
      })(), t3.headers = { ...t3.headers || {}, ...i2 }, s2.call(e2, t3);
    };
  }
  function tt() {
    const e2 = Math.random().toString(16).slice(2);
    return { data: { seqId: e2 }, headers: { ...Ze, "x-seqid": e2 } };
  }
  class nt {
    constructor(e2 = {}) {
      var t2;
      this.config = e2, this._reqClass = new Oe.adapter.reqClass({ timeout: this.config.timeout, timeoutMsg: `请求在${this.config.timeout / 1e3}s内未完成，已中断`, restrictedMethods: ["post"] }), this._cache = Me(this.config.env), this._localCache = (t2 = this.config.env, De[t2]), this.oauth = new Qe(this.config), et(this._reqClass, "post", [tt]), et(this._reqClass, "upload", [tt]), et(this._reqClass, "download", [tt]);
    }
    async post(e2) {
      return await this._reqClass.post(e2);
    }
    async upload(e2) {
      return await this._reqClass.upload(e2);
    }
    async download(e2) {
      return await this._reqClass.download(e2);
    }
    async refreshAccessToken() {
      let e2, t2;
      this._refreshAccessTokenPromise || (this._refreshAccessTokenPromise = this._refreshAccessToken());
      try {
        e2 = await this._refreshAccessTokenPromise;
      } catch (e3) {
        t2 = e3;
      }
      if (this._refreshAccessTokenPromise = null, this._shouldRefreshAccessTokenHook = null, t2)
        throw t2;
      return e2;
    }
    async _refreshAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2, refreshTokenKey: n2, loginTypeKey: s2, anonymousUuidKey: r2 } = this._cache.keys;
      this._cache.removeStore(e2), this._cache.removeStore(t2);
      let i2 = this._cache.getStore(n2);
      if (!i2)
        throw new se({ message: "未登录CloudBase" });
      const o2 = { refresh_token: i2 }, a2 = await this.request("auth.fetchAccessTokenWithRefreshToken", o2);
      if (a2.data.code) {
        const { code: e3 } = a2.data;
        if ("SIGN_PARAM_INVALID" === e3 || "REFRESH_TOKEN_EXPIRED" === e3 || "INVALID_REFRESH_TOKEN" === e3) {
          if (this._cache.getStore(s2) === Ge.ANONYMOUS && "INVALID_REFRESH_TOKEN" === e3) {
            const e4 = this._cache.getStore(r2), t3 = this._cache.getStore(n2), s3 = await this.send("auth.signInAnonymously", { anonymous_uuid: e4, refresh_token: t3 });
            return this.setRefreshToken(s3.refresh_token), this._refreshAccessToken();
          }
          $e(He), this._cache.removeStore(n2);
        }
        throw new se({ code: a2.data.code, message: `刷新access token失败：${a2.data.code}` });
      }
      if (a2.data.access_token)
        return $e(Ve), this._cache.setStore(e2, a2.data.access_token), this._cache.setStore(t2, a2.data.access_token_expire + Date.now()), { accessToken: a2.data.access_token, accessTokenExpire: a2.data.access_token_expire };
      a2.data.refresh_token && (this._cache.removeStore(n2), this._cache.setStore(n2, a2.data.refresh_token), this._refreshAccessToken());
    }
    async getAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2, refreshTokenKey: n2 } = this._cache.keys;
      if (!this._cache.getStore(n2))
        throw new se({ message: "refresh token不存在，登录状态异常" });
      let s2 = this._cache.getStore(e2), r2 = this._cache.getStore(t2), i2 = true;
      return this._shouldRefreshAccessTokenHook && !await this._shouldRefreshAccessTokenHook(s2, r2) && (i2 = false), (!s2 || !r2 || r2 < Date.now()) && i2 ? this.refreshAccessToken() : { accessToken: s2, accessTokenExpire: r2 };
    }
    async request(e2, t2, n2) {
      const s2 = `x-tcb-trace_${this.config.env}`;
      let r2 = "application/x-www-form-urlencoded";
      const i2 = { action: e2, env: this.config.env, dataVersion: "2019-08-16", ...t2 };
      let o2;
      if (-1 === Xe.indexOf(e2) && (this._cache.keys, i2.access_token = await this.oauth.getAccessToken()), "storage.uploadFile" === e2) {
        o2 = new FormData();
        for (let e3 in o2)
          o2.hasOwnProperty(e3) && void 0 !== o2[e3] && o2.append(e3, i2[e3]);
        r2 = "multipart/form-data";
      } else {
        r2 = "application/json", o2 = {};
        for (let e3 in i2)
          void 0 !== i2[e3] && (o2[e3] = i2[e3]);
      }
      let a2 = { headers: { "content-type": r2 } };
      n2 && n2.timeout && (a2.timeout = n2.timeout), n2 && n2.onUploadProgress && (a2.onUploadProgress = n2.onUploadProgress);
      const c2 = this._localCache.getStore(s2);
      c2 && (a2.headers["X-TCB-Trace"] = c2);
      const { parse: u2, inQuery: h2, search: l2 } = t2;
      let d2 = { env: this.config.env };
      u2 && (d2.parse = true), h2 && (d2 = { ...h2, ...d2 });
      let p2 = function(e3, t3, n3 = {}) {
        const s3 = /\?/.test(t3);
        let r3 = "";
        for (let e4 in n3)
          "" === r3 ? !s3 && (t3 += "?") : r3 += "&", r3 += `${e4}=${encodeURIComponent(n3[e4])}`;
        return /^http(s)?\:\/\//.test(t3 += r3) ? t3 : `${e3}${t3}`;
      }(ye, "//tcb-api.tencentcloudapi.com/web", d2);
      l2 && (p2 += l2);
      const f2 = await this.post({ url: p2, data: o2, ...a2 }), g2 = f2.header && f2.header["x-tcb-trace"];
      if (g2 && this._localCache.setStore(s2, g2), 200 !== Number(f2.status) && 200 !== Number(f2.statusCode) || !f2.data)
        throw new se({ code: "NETWORK_ERROR", message: "network request error" });
      return f2;
    }
    async send(e2, t2 = {}, n2 = {}) {
      const s2 = await this.request(e2, t2, { ...n2, onUploadProgress: t2.onUploadProgress });
      if (("ACCESS_TOKEN_DISABLED" === s2.data.code || "ACCESS_TOKEN_EXPIRED" === s2.data.code) && -1 === Xe.indexOf(e2)) {
        await this.oauth.refreshAccessToken();
        const s3 = await this.request(e2, t2, { ...n2, onUploadProgress: t2.onUploadProgress });
        if (s3.data.code)
          throw new se({ code: s3.data.code, message: Ae(s3.data.message) });
        return s3.data;
      }
      if (s2.data.code)
        throw new se({ code: s2.data.code, message: Ae(s2.data.message) });
      return s2.data;
    }
    setRefreshToken(e2) {
      const { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.removeStore(n2), this._cache.setStore(s2, e2);
    }
  }
  const st = {};
  function rt(e2) {
    return st[e2];
  }
  class it {
    constructor(e2) {
      this.config = e2, this._cache = Me(e2.env), this._request = rt(e2.env);
    }
    setRefreshToken(e2) {
      const { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.removeStore(n2), this._cache.setStore(s2, e2);
    }
    setAccessToken(e2, t2) {
      const { accessTokenKey: n2, accessTokenExpireKey: s2 } = this._cache.keys;
      this._cache.setStore(n2, e2), this._cache.setStore(s2, t2);
    }
    async refreshUserInfo() {
      const { data: e2 } = await this._request.send("auth.getUserInfo", {});
      return this.setLocalUserInfo(e2), e2;
    }
    setLocalUserInfo(e2) {
      const { userInfoKey: t2 } = this._cache.keys;
      this._cache.setStore(t2, e2);
    }
  }
  class ot {
    constructor(e2) {
      if (!e2)
        throw new se({ code: "PARAM_ERROR", message: "envId is not defined" });
      this._envId = e2, this._cache = Me(this._envId), this._request = rt(this._envId), this.setUserInfo();
    }
    linkWithTicket(e2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "ticket must be string" });
      return this._request.send("auth.linkWithTicket", { ticket: e2 });
    }
    linkWithRedirect(e2) {
      e2.signInWithRedirect();
    }
    updatePassword(e2, t2) {
      return this._request.send("auth.updatePassword", { oldPassword: t2, newPassword: e2 });
    }
    updateEmail(e2) {
      return this._request.send("auth.updateEmail", { newEmail: e2 });
    }
    updateUsername(e2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "username must be a string" });
      return this._request.send("auth.updateUsername", { username: e2 });
    }
    async getLinkedUidList() {
      const { data: e2 } = await this._request.send("auth.getLinkedUidList", {});
      let t2 = false;
      const { users: n2 } = e2;
      return n2.forEach((e3) => {
        e3.wxOpenId && e3.wxPublicId && (t2 = true);
      }), { users: n2, hasPrimaryUid: t2 };
    }
    setPrimaryUid(e2) {
      return this._request.send("auth.setPrimaryUid", { uid: e2 });
    }
    unlink(e2) {
      return this._request.send("auth.unlink", { platform: e2 });
    }
    async update(e2) {
      const { nickName: t2, gender: n2, avatarUrl: s2, province: r2, country: i2, city: o2 } = e2, { data: a2 } = await this._request.send("auth.updateUserInfo", { nickName: t2, gender: n2, avatarUrl: s2, province: r2, country: i2, city: o2 });
      this.setLocalUserInfo(a2);
    }
    async refresh() {
      const e2 = await this._request.oauth.getUserInfo();
      return this.setLocalUserInfo(e2), e2;
    }
    setUserInfo() {
      const { userInfoKey: e2 } = this._cache.keys, t2 = this._cache.getStore(e2);
      ["uid", "loginType", "openid", "wxOpenId", "wxPublicId", "unionId", "qqMiniOpenId", "email", "hasPassword", "customUserId", "nickName", "gender", "avatarUrl"].forEach((e3) => {
        this[e3] = t2[e3];
      }), this.location = { country: t2.country, province: t2.province, city: t2.city };
    }
    setLocalUserInfo(e2) {
      const { userInfoKey: t2 } = this._cache.keys;
      this._cache.setStore(t2, e2), this.setUserInfo();
    }
  }
  class at {
    constructor(e2) {
      if (!e2)
        throw new se({ code: "PARAM_ERROR", message: "envId is not defined" });
      this._cache = Me(e2);
      const { refreshTokenKey: t2, accessTokenKey: n2, accessTokenExpireKey: s2 } = this._cache.keys, r2 = this._cache.getStore(t2), i2 = this._cache.getStore(n2), o2 = this._cache.getStore(s2);
      this.credential = { refreshToken: r2, accessToken: i2, accessTokenExpire: o2 }, this.user = new ot(e2);
    }
    get isAnonymousAuth() {
      return this.loginType === Ge.ANONYMOUS;
    }
    get isCustomAuth() {
      return this.loginType === Ge.CUSTOM;
    }
    get isWeixinAuth() {
      return this.loginType === Ge.WECHAT || this.loginType === Ge.WECHAT_OPEN || this.loginType === Ge.WECHAT_PUBLIC;
    }
    get loginType() {
      return this._cache.getStore(this._cache.keys.loginTypeKey);
    }
  }
  class ct extends it {
    async signIn() {
      this._cache.updatePersistence("local"), await this._request.oauth.getAccessToken(), $e(We), $e(Je, { env: this.config.env, loginType: Ge.ANONYMOUS, persistence: "local" });
      const e2 = new at(this.config.env);
      return await e2.user.refresh(), e2;
    }
    async linkAndRetrieveDataWithTicket(e2) {
      const { anonymousUuidKey: t2, refreshTokenKey: n2 } = this._cache.keys, s2 = this._cache.getStore(t2), r2 = this._cache.getStore(n2), i2 = await this._request.send("auth.linkAndRetrieveDataWithTicket", { anonymous_uuid: s2, refresh_token: r2, ticket: e2 });
      if (i2.refresh_token)
        return this._clearAnonymousUUID(), this.setRefreshToken(i2.refresh_token), await this._request.refreshAccessToken(), $e(ze, { env: this.config.env }), $e(Je, { loginType: Ge.CUSTOM, persistence: "local" }), { credential: { refreshToken: i2.refresh_token } };
      throw new se({ message: "匿名转化失败" });
    }
    _setAnonymousUUID(e2) {
      const { anonymousUuidKey: t2, loginTypeKey: n2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.setStore(t2, e2), this._cache.setStore(n2, Ge.ANONYMOUS);
    }
    _clearAnonymousUUID() {
      this._cache.removeStore(this._cache.keys.anonymousUuidKey);
    }
  }
  class ut extends it {
    async signIn(e2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "ticket must be a string" });
      const { refreshTokenKey: t2 } = this._cache.keys, n2 = await this._request.send("auth.signInWithTicket", { ticket: e2, refresh_token: this._cache.getStore(t2) || "" });
      if (n2.refresh_token)
        return this.setRefreshToken(n2.refresh_token), await this._request.refreshAccessToken(), $e(We), $e(Je, { env: this.config.env, loginType: Ge.CUSTOM, persistence: this.config.persistence }), await this.refreshUserInfo(), new at(this.config.env);
      throw new se({ message: "自定义登录失败" });
    }
  }
  class ht extends it {
    async signIn(e2, t2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "email must be a string" });
      const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: "EMAIL", email: e2, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token: i2, access_token_expire: o2 } = s2;
      if (r2)
        return this.setRefreshToken(r2), i2 && o2 ? this.setAccessToken(i2, o2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), $e(We), $e(Je, { env: this.config.env, loginType: Ge.EMAIL, persistence: this.config.persistence }), new at(this.config.env);
      throw s2.code ? new se({ code: s2.code, message: `邮箱登录失败: ${s2.message}` }) : new se({ message: "邮箱登录失败" });
    }
    async activate(e2) {
      return this._request.send("auth.activateEndUserMail", { token: e2 });
    }
    async resetPasswordWithToken(e2, t2) {
      return this._request.send("auth.resetPasswordWithToken", { token: e2, newPassword: t2 });
    }
  }
  class lt extends it {
    async signIn(e2, t2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "username must be a string" });
      "string" != typeof t2 && (t2 = "", console.warn("password is empty"));
      const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: Ge.USERNAME, username: e2, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token_expire: i2, access_token: o2 } = s2;
      if (r2)
        return this.setRefreshToken(r2), o2 && i2 ? this.setAccessToken(o2, i2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), $e(We), $e(Je, { env: this.config.env, loginType: Ge.USERNAME, persistence: this.config.persistence }), new at(this.config.env);
      throw s2.code ? new se({ code: s2.code, message: `用户名密码登录失败: ${s2.message}` }) : new se({ message: "用户名密码登录失败" });
    }
  }
  class dt {
    constructor(e2) {
      this.config = e2, this._cache = Me(e2.env), this._request = rt(e2.env), this._onAnonymousConverted = this._onAnonymousConverted.bind(this), this._onLoginTypeChanged = this._onLoginTypeChanged.bind(this), je(Je, this._onLoginTypeChanged);
    }
    get currentUser() {
      const e2 = this.hasLoginState();
      return e2 && e2.user || null;
    }
    get loginType() {
      return this._cache.getStore(this._cache.keys.loginTypeKey);
    }
    anonymousAuthProvider() {
      return new ct(this.config);
    }
    customAuthProvider() {
      return new ut(this.config);
    }
    emailAuthProvider() {
      return new ht(this.config);
    }
    usernameAuthProvider() {
      return new lt(this.config);
    }
    async signInAnonymously() {
      return new ct(this.config).signIn();
    }
    async signInWithEmailAndPassword(e2, t2) {
      return new ht(this.config).signIn(e2, t2);
    }
    signInWithUsernameAndPassword(e2, t2) {
      return new lt(this.config).signIn(e2, t2);
    }
    async linkAndRetrieveDataWithTicket(e2) {
      this._anonymousAuthProvider || (this._anonymousAuthProvider = new ct(this.config)), je(ze, this._onAnonymousConverted);
      return await this._anonymousAuthProvider.linkAndRetrieveDataWithTicket(e2);
    }
    async signOut() {
      if (this.loginType === Ge.ANONYMOUS)
        throw new se({ message: "匿名用户不支持登出操作" });
      const { refreshTokenKey: e2, accessTokenKey: t2, accessTokenExpireKey: n2 } = this._cache.keys, s2 = this._cache.getStore(e2);
      if (!s2)
        return;
      const r2 = await this._request.send("auth.logout", { refresh_token: s2 });
      return this._cache.removeStore(e2), this._cache.removeStore(t2), this._cache.removeStore(n2), $e(We), $e(Je, { env: this.config.env, loginType: Ge.NULL, persistence: this.config.persistence }), r2;
    }
    async signUpWithEmailAndPassword(e2, t2) {
      return this._request.send("auth.signUpWithEmailAndPassword", { email: e2, password: t2 });
    }
    async sendPasswordResetEmail(e2) {
      return this._request.send("auth.sendPasswordResetEmail", { email: e2 });
    }
    onLoginStateChanged(e2) {
      je(We, () => {
        const t3 = this.hasLoginState();
        e2.call(this, t3);
      });
      const t2 = this.hasLoginState();
      e2.call(this, t2);
    }
    onLoginStateExpired(e2) {
      je(He, e2.bind(this));
    }
    onAccessTokenRefreshed(e2) {
      je(Ve, e2.bind(this));
    }
    onAnonymousConverted(e2) {
      je(ze, e2.bind(this));
    }
    onLoginTypeChanged(e2) {
      je(Je, () => {
        const t2 = this.hasLoginState();
        e2.call(this, t2);
      });
    }
    async getAccessToken() {
      return { accessToken: (await this._request.getAccessToken()).accessToken, env: this.config.env };
    }
    hasLoginState() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2), s2 = this._cache.getStore(t2);
      return this._request.oauth.isAccessTokenExpired(n2, s2) ? null : new at(this.config.env);
    }
    async isUsernameRegistered(e2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "username must be a string" });
      const { data: t2 } = await this._request.send("auth.isUsernameRegistered", { username: e2 });
      return t2 && t2.isRegistered;
    }
    getLoginState() {
      return Promise.resolve(this.hasLoginState());
    }
    async signInWithTicket(e2) {
      return new ut(this.config).signIn(e2);
    }
    shouldRefreshAccessToken(e2) {
      this._request._shouldRefreshAccessTokenHook = e2.bind(this);
    }
    getUserInfo() {
      return this._request.send("auth.getUserInfo", {}).then((e2) => e2.code ? e2 : { ...e2.data, requestId: e2.seqId });
    }
    getAuthHeader() {
      const { refreshTokenKey: e2, accessTokenKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2);
      return { "x-cloudbase-credentials": this._cache.getStore(t2) + "/@@/" + n2 };
    }
    _onAnonymousConverted(e2) {
      const { env: t2 } = e2.data;
      t2 === this.config.env && this._cache.updatePersistence(this.config.persistence);
    }
    _onLoginTypeChanged(e2) {
      const { loginType: t2, persistence: n2, env: s2 } = e2.data;
      s2 === this.config.env && (this._cache.updatePersistence(n2), this._cache.setStore(this._cache.keys.loginTypeKey, t2));
    }
  }
  const pt = function(e2, t2) {
    t2 = t2 || be();
    const n2 = rt(this.config.env), { cloudPath: s2, filePath: r2, onUploadProgress: i2, fileType: o2 = "image" } = e2;
    return n2.send("storage.getUploadMetadata", { path: s2 }).then((e3) => {
      const { data: { url: a2, authorization: c2, token: u2, fileId: h2, cosFileId: l2 }, requestId: d2 } = e3, p2 = { key: s2, signature: c2, "x-cos-meta-fileid": l2, success_action_status: "201", "x-cos-security-token": u2 };
      n2.upload({ url: a2, data: p2, file: r2, name: s2, fileType: o2, onUploadProgress: i2 }).then((e4) => {
        201 === e4.statusCode ? t2(null, { fileID: h2, requestId: d2 }) : t2(new se({ code: "STORAGE_REQUEST_FAIL", message: `STORAGE_REQUEST_FAIL: ${e4.data}` }));
      }).catch((e4) => {
        t2(e4);
      });
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, ft = function(e2, t2) {
    t2 = t2 || be();
    const n2 = rt(this.config.env), { cloudPath: s2 } = e2;
    return n2.send("storage.getUploadMetadata", { path: s2 }).then((e3) => {
      t2(null, e3);
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, gt = function({ fileList: e2 }, t2) {
    if (t2 = t2 || be(), !e2 || !Array.isArray(e2))
      return { code: "INVALID_PARAM", message: "fileList必须是非空的数组" };
    for (let t3 of e2)
      if (!t3 || "string" != typeof t3)
        return { code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" };
    const n2 = { fileid_list: e2 };
    return rt(this.config.env).send("storage.batchDeleteFile", n2).then((e3) => {
      e3.code ? t2(null, e3) : t2(null, { fileList: e3.data.delete_list, requestId: e3.requestId });
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, mt = function({ fileList: e2 }, t2) {
    t2 = t2 || be(), e2 && Array.isArray(e2) || t2(null, { code: "INVALID_PARAM", message: "fileList必须是非空的数组" });
    let n2 = [];
    for (let s3 of e2)
      "object" == typeof s3 ? (s3.hasOwnProperty("fileID") && s3.hasOwnProperty("maxAge") || t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是包含fileID和maxAge的对象" }), n2.push({ fileid: s3.fileID, max_age: s3.maxAge })) : "string" == typeof s3 ? n2.push({ fileid: s3 }) : t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是字符串" });
    const s2 = { file_list: n2 };
    return rt(this.config.env).send("storage.batchGetDownloadUrl", s2).then((e3) => {
      e3.code ? t2(null, e3) : t2(null, { fileList: e3.data.download_list, requestId: e3.requestId });
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, yt = async function({ fileID: e2 }, t2) {
    const n2 = (await mt.call(this, { fileList: [{ fileID: e2, maxAge: 600 }] })).fileList[0];
    if ("SUCCESS" !== n2.code)
      return t2 ? t2(n2) : new Promise((e3) => {
        e3(n2);
      });
    const s2 = rt(this.config.env);
    let r2 = n2.download_url;
    if (r2 = encodeURI(r2), !t2)
      return s2.download({ url: r2 });
    t2(await s2.download({ url: r2 }));
  }, _t = function({ name: e2, data: t2, query: n2, parse: s2, search: r2, timeout: i2 }, o2) {
    const a2 = o2 || be();
    let c2;
    try {
      c2 = t2 ? JSON.stringify(t2) : "";
    } catch (e3) {
      return Promise.reject(e3);
    }
    if (!e2)
      return Promise.reject(new se({ code: "PARAM_ERROR", message: "函数名不能为空" }));
    const u2 = { inQuery: n2, parse: s2, search: r2, function_name: e2, request_data: c2 };
    return rt(this.config.env).send("functions.invokeFunction", u2, { timeout: i2 }).then((e3) => {
      if (e3.code)
        a2(null, e3);
      else {
        let t3 = e3.data.response_data;
        if (s2)
          a2(null, { result: t3, requestId: e3.requestId });
        else
          try {
            t3 = JSON.parse(e3.data.response_data), a2(null, { result: t3, requestId: e3.requestId });
          } catch (e4) {
            a2(new se({ message: "response data must be json" }));
          }
      }
      return a2.promise;
    }).catch((e3) => {
      a2(e3);
    }), a2.promise;
  }, wt = { timeout: 15e3, persistence: "session" }, vt = {};
  class It {
    constructor(e2) {
      this.config = e2 || this.config, this.authObj = void 0;
    }
    init(e2) {
      switch (Oe.adapter || (this.requestClient = new Oe.adapter.reqClass({ timeout: e2.timeout || 5e3, timeoutMsg: `请求在${(e2.timeout || 5e3) / 1e3}s内未完成，已中断` })), this.config = { ...wt, ...e2 }, true) {
        case this.config.timeout > 6e5:
          console.warn("timeout大于可配置上限[10分钟]，已重置为上限数值"), this.config.timeout = 6e5;
          break;
        case this.config.timeout < 100:
          console.warn("timeout小于可配置下限[100ms]，已重置为下限数值"), this.config.timeout = 100;
      }
      return new It(this.config);
    }
    auth({ persistence: e2 } = {}) {
      if (this.authObj)
        return this.authObj;
      const t2 = e2 || Oe.adapter.primaryStorage || wt.persistence;
      var n2;
      return t2 !== this.config.persistence && (this.config.persistence = t2), function(e3) {
        const { env: t3 } = e3;
        Ne[t3] = new Ue(e3), De[t3] = new Ue({ ...e3, persistence: "local" });
      }(this.config), n2 = this.config, st[n2.env] = new nt(n2), this.authObj = new dt(this.config), this.authObj;
    }
    on(e2, t2) {
      return je.apply(this, [e2, t2]);
    }
    off(e2, t2) {
      return Be.apply(this, [e2, t2]);
    }
    callFunction(e2, t2) {
      return _t.apply(this, [e2, t2]);
    }
    deleteFile(e2, t2) {
      return gt.apply(this, [e2, t2]);
    }
    getTempFileURL(e2, t2) {
      return mt.apply(this, [e2, t2]);
    }
    downloadFile(e2, t2) {
      return yt.apply(this, [e2, t2]);
    }
    uploadFile(e2, t2) {
      return pt.apply(this, [e2, t2]);
    }
    getUploadMetadata(e2, t2) {
      return ft.apply(this, [e2, t2]);
    }
    registerExtension(e2) {
      vt[e2.name] = e2;
    }
    async invokeExtension(e2, t2) {
      const n2 = vt[e2];
      if (!n2)
        throw new se({ message: `扩展${e2} 必须先注册` });
      return await n2.invoke(t2, this);
    }
    useAdapters(e2) {
      const { adapter: t2, runtime: n2 } = xe(e2) || {};
      t2 && (Oe.adapter = t2), n2 && (Oe.runtime = n2);
    }
  }
  var St = new It();
  function bt(e2, t2, n2) {
    void 0 === n2 && (n2 = {});
    var s2 = /\?/.test(t2), r2 = "";
    for (var i2 in n2)
      "" === r2 ? !s2 && (t2 += "?") : r2 += "&", r2 += i2 + "=" + encodeURIComponent(n2[i2]);
    return /^http(s)?:\/\//.test(t2 += r2) ? t2 : "" + e2 + t2;
  }
  class kt {
    get(e2) {
      const { url: t2, data: n2, headers: s2, timeout: r2 } = e2;
      return new Promise((e3, i2) => {
        re.request({ url: bt("https:", t2), data: n2, method: "GET", header: s2, timeout: r2, success(t3) {
          e3(t3);
        }, fail(e4) {
          i2(e4);
        } });
      });
    }
    post(e2) {
      const { url: t2, data: n2, headers: s2, timeout: r2 } = e2;
      return new Promise((e3, i2) => {
        re.request({ url: bt("https:", t2), data: n2, method: "POST", header: s2, timeout: r2, success(t3) {
          e3(t3);
        }, fail(e4) {
          i2(e4);
        } });
      });
    }
    upload(e2) {
      return new Promise((t2, n2) => {
        const { url: s2, file: r2, data: i2, headers: o2, fileType: a2 } = e2, c2 = re.uploadFile({ url: bt("https:", s2), name: "file", formData: Object.assign({}, i2), filePath: r2, fileType: a2, header: o2, success(e3) {
          const n3 = { statusCode: e3.statusCode, data: e3.data || {} };
          200 === e3.statusCode && i2.success_action_status && (n3.statusCode = parseInt(i2.success_action_status, 10)), t2(n3);
        }, fail(e3) {
          n2(new Error(e3.errMsg || "uploadFile:fail"));
        } });
        "function" == typeof e2.onUploadProgress && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((t3) => {
          e2.onUploadProgress({ loaded: t3.totalBytesSent, total: t3.totalBytesExpectedToSend });
        });
      });
    }
  }
  const Tt = { setItem(e2, t2) {
    re.setStorageSync(e2, t2);
  }, getItem: (e2) => re.getStorageSync(e2), removeItem(e2) {
    re.removeStorageSync(e2);
  }, clear() {
    re.clearStorageSync();
  } };
  var At = { genAdapter: function() {
    return { root: {}, reqClass: kt, localStorage: Tt, primaryStorage: "local" };
  }, isMatch: function() {
    return true;
  }, runtime: "uni_app" };
  St.useAdapters(At);
  const Pt = St, Ct = Pt.init;
  Pt.init = function(e2) {
    e2.env = e2.spaceId;
    const t2 = Ct.call(this, e2);
    t2.config.provider = "tencent", t2.config.spaceId = e2.spaceId;
    const n2 = t2.auth;
    return t2.auth = function(e3) {
      const t3 = n2.call(this, e3);
      return ["linkAndRetrieveDataWithTicket", "signInAnonymously", "signOut", "getAccessToken", "getLoginState", "signInWithTicket", "getUserInfo"].forEach((e4) => {
        var n3;
        t3[e4] = (n3 = t3[e4], function(e5) {
          e5 = e5 || {};
          const { success: t4, fail: s2, complete: r2 } = ne(e5);
          if (!(t4 || s2 || r2))
            return n3.call(this, e5);
          n3.call(this, e5).then((e6) => {
            t4 && t4(e6), r2 && r2(e6);
          }, (e6) => {
            s2 && s2(e6), r2 && r2(e6);
          });
        }).bind(t3);
      }), t3;
    }, t2.customAuth = t2.auth, t2;
  };
  var xt = Pt;
  async function Ot(e2, t2) {
    const n2 = `http://${e2}:${t2}/system/ping`;
    try {
      const e3 = await (s2 = { url: n2, timeout: 500 }, new Promise((e4, t3) => {
        re.request({ ...s2, success(t4) {
          e4(t4);
        }, fail(e5) {
          t3(e5);
        } });
      }));
      return !(!e3.data || 0 !== e3.data.code);
    } catch (e3) {
      return false;
    }
    var s2;
  }
  async function Et(e2, t2) {
    let n2;
    for (let s2 = 0; s2 < e2.length; s2++) {
      const r2 = e2[s2];
      if (await Ot(r2, t2)) {
        n2 = r2;
        break;
      }
    }
    return { address: n2, port: t2 };
  }
  const Lt = { "serverless.file.resource.generateProximalSign": "storage/generate-proximal-sign", "serverless.file.resource.report": "storage/report", "serverless.file.resource.delete": "storage/delete", "serverless.file.resource.getTempFileURL": "storage/get-temp-file-url" };
  var Rt = class {
    constructor(e2) {
      if (["spaceId", "clientSecret"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e2, t2))
          throw new Error(`${t2} required`);
      }), !e2.endpoint)
        throw new Error("集群空间未配置ApiEndpoint，配置后需要重新关联服务空间后生效");
      this.config = Object.assign({}, e2), this.config.provider = "dcloud", this.config.requestUrl = this.config.endpoint + "/client", this.config.envType = this.config.envType || "public", this.adapter = re;
    }
    async request(e2, t2 = true) {
      const n2 = t2;
      return e2 = n2 ? await this.setupLocalRequest(e2) : this.setupRequest(e2), Promise.resolve().then(() => n2 ? this.requestLocal(e2) : fe.wrappedRequest(e2, this.adapter.request));
    }
    requestLocal(e2) {
      return new Promise((t2, n2) => {
        this.adapter.request(Object.assign(e2, { complete(e3) {
          if (e3 || (e3 = {}), !e3.statusCode || e3.statusCode >= 400) {
            const t3 = e3.data && e3.data.code || "SYS_ERR", s2 = e3.data && e3.data.message || "request:fail";
            return n2(new se({ code: t3, message: s2 }));
          }
          t2({ success: true, result: e3.data });
        } }));
      });
    }
    setupRequest(e2) {
      const t2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now() }), n2 = { "Content-Type": "application/json" };
      n2["x-serverless-sign"] = fe.sign(t2, this.config.clientSecret);
      const s2 = pe();
      n2["x-client-info"] = encodeURIComponent(JSON.stringify(s2));
      const { token: r2 } = oe();
      return n2["x-client-token"] = r2, { url: this.config.requestUrl, method: "POST", data: t2, dataType: "json", header: JSON.parse(JSON.stringify(n2)) };
    }
    async setupLocalRequest(e2) {
      const t2 = pe(), { token: n2 } = oe(), s2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now(), clientInfo: t2, token: n2 }), { address: r2, servePort: i2 } = this.__dev__ && this.__dev__.debugInfo || {}, { address: o2 } = await Et(r2, i2);
      return { url: `http://${o2}:${i2}/${Lt[e2.method]}`, method: "POST", data: s2, dataType: "json", header: JSON.parse(JSON.stringify({ "Content-Type": "application/json" })) };
    }
    callFunction(e2) {
      const t2 = { method: "serverless.function.runtime.invoke", params: JSON.stringify({ functionTarget: e2.name, functionArgs: e2.data || {} }) };
      return this.request(t2, false);
    }
    getUploadFileOptions(e2) {
      const t2 = { method: "serverless.file.resource.generateProximalSign", params: JSON.stringify(e2) };
      return this.request(t2);
    }
    reportUploadFile(e2) {
      const t2 = { method: "serverless.file.resource.report", params: JSON.stringify(e2) };
      return this.request(t2);
    }
    uploadFile({ filePath: e2, cloudPath: t2, fileType: n2 = "image", onUploadProgress: s2 }) {
      if (!t2)
        throw new se({ code: "CLOUDPATH_REQUIRED", message: "cloudPath不可为空" });
      let r2;
      return this.getUploadFileOptions({ cloudPath: t2 }).then((t3) => {
        const { url: i2, formData: o2, name: a2 } = t3.result;
        return r2 = t3.result.fileUrl, new Promise((t4, r3) => {
          const c2 = this.adapter.uploadFile({ url: i2, formData: o2, name: a2, filePath: e2, fileType: n2, success(e3) {
            e3 && e3.statusCode < 400 ? t4(e3) : r3(new se({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
          }, fail(e3) {
            r3(new se({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
          } });
          "function" == typeof s2 && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((e3) => {
            s2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
          });
        });
      }).then(() => this.reportUploadFile({ cloudPath: t2 })).then((t3) => new Promise((n3, s3) => {
        t3.success ? n3({ success: true, filePath: e2, fileID: r2 }) : s3(new se({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
      }));
    }
    deleteFile({ fileList: e2 }) {
      const t2 = { method: "serverless.file.resource.delete", params: JSON.stringify({ fileList: e2 }) };
      return this.request(t2).then((e3) => {
        if (e3.success)
          return e3.result;
        throw new se({ code: "DELETE_FILE_FAILED", message: "删除文件失败" });
      });
    }
    getTempFileURL({ fileList: e2, maxAge: t2 } = {}) {
      if (!Array.isArray(e2) || 0 === e2.length)
        throw new se({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
      const n2 = { method: "serverless.file.resource.getTempFileURL", params: JSON.stringify({ fileList: e2, maxAge: t2 }) };
      return this.request(n2).then((e3) => {
        if (e3.success)
          return { fileList: e3.result.fileList.map((e4) => ({ fileID: e4.fileID, tempFileURL: e4.tempFileURL })) };
        throw new se({ code: "GET_TEMP_FILE_URL_FAILED", message: "获取临时文件链接失败" });
      });
    }
  };
  var Ut = { init(e2) {
    const t2 = new Rt(e2), n2 = { signInAnonymously: function() {
      return Promise.resolve();
    }, getLoginState: function() {
      return Promise.resolve(false);
    } };
    return t2.auth = function() {
      return n2;
    }, t2.customAuth = t2.auth, t2;
  } }, Nt = n(function(e2, t2) {
    e2.exports = r.enc.Hex;
  });
  function Dt() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e2) {
      var t2 = 16 * Math.random() | 0;
      return ("x" === e2 ? t2 : 3 & t2 | 8).toString(16);
    });
  }
  function Mt(e2 = "", t2 = {}) {
    const { data: n2, functionName: s2, method: r2, headers: i2, signHeaderKeys: o2 = [], config: a2 } = t2, c2 = String(Date.now()), u2 = Dt(), h2 = Object.assign({}, i2, { "x-from-app-id": a2.spaceAppId, "x-from-env-id": a2.spaceId, "x-to-env-id": a2.spaceId, "x-from-instance-id": c2, "x-from-function-name": s2, "x-client-timestamp": c2, "x-alipay-source": "client", "x-request-id": u2, "x-alipay-callid": u2, "x-trace-id": u2 }), l2 = ["x-from-app-id", "x-from-env-id", "x-to-env-id", "x-from-instance-id", "x-from-function-name", "x-client-timestamp"].concat(o2), [d2 = "", p2 = ""] = e2.split("?") || [], f2 = function(e3) {
      const t3 = e3.signedHeaders.join(";"), n3 = e3.signedHeaders.map((t4) => `${t4.toLowerCase()}:${e3.headers[t4]}
`).join(""), s3 = Ie(e3.body).toString(Nt), r3 = `${e3.method.toUpperCase()}
${e3.path}
${e3.query}
${n3}
${t3}
${s3}
`, i3 = Ie(r3).toString(Nt), o3 = `HMAC-SHA256
${e3.timestamp}
${i3}
`, a3 = Se(o3, e3.secretKey).toString(Nt);
      return `HMAC-SHA256 Credential=${e3.secretId}, SignedHeaders=${t3}, Signature=${a3}`;
    }({ path: d2, query: p2, method: r2, headers: h2, timestamp: c2, body: JSON.stringify(n2), secretId: a2.accessKey, secretKey: a2.secretKey, signedHeaders: l2.sort() });
    return { url: `${a2.endpoint}${e2}`, headers: Object.assign({}, h2, { Authorization: f2 }) };
  }
  function qt({ url: e2, data: t2, method: n2 = "POST", headers: s2 = {}, timeout: r2 }) {
    return new Promise((i2, o2) => {
      re.request({ url: e2, method: n2, data: "object" == typeof t2 ? JSON.stringify(t2) : t2, header: s2, dataType: "json", timeout: r2, complete: (e3 = {}) => {
        const t3 = s2["x-trace-id"] || "";
        if (!e3.statusCode || e3.statusCode >= 400) {
          const { message: n3, errMsg: s3, trace_id: r3 } = e3.data || {};
          return o2(new se({ code: "SYS_ERR", message: n3 || s3 || "request:fail", requestId: r3 || t3 }));
        }
        i2({ status: e3.statusCode, data: e3.data, headers: e3.header, requestId: t3 });
      } });
    });
  }
  function Kt(e2, t2) {
    const { path: n2, data: s2, method: r2 = "GET" } = e2, { url: i2, headers: o2 } = Mt(n2, { functionName: "", data: s2, method: r2, headers: { "x-alipay-cloud-mode": "oss", "x-data-api-type": "oss", "x-expire-timestamp": Date.now() + 6e4 }, signHeaderKeys: ["x-data-api-type", "x-expire-timestamp"], config: t2 });
    return qt({ url: i2, data: s2, method: r2, headers: o2 }).then((e3) => {
      const t3 = e3.data || {};
      if (!t3.success)
        throw new se({ code: e3.errCode, message: e3.errMsg, requestId: e3.requestId });
      return t3.data || {};
    }).catch((e3) => {
      throw new se({ code: e3.errCode, message: e3.errMsg, requestId: e3.requestId });
    });
  }
  function Ft(e2 = "") {
    const t2 = e2.trim().replace(/^cloud:\/\//, ""), n2 = t2.indexOf("/");
    if (n2 <= 0)
      throw new se({ code: "INVALID_PARAM", message: "fileID不合法" });
    const s2 = t2.substring(0, n2), r2 = t2.substring(n2 + 1);
    return s2 !== this.config.spaceId && console.warn("file ".concat(e2, " does not belong to env ").concat(this.config.spaceId)), r2;
  }
  function jt(e2 = "") {
    return "cloud://".concat(this.config.spaceId, "/").concat(e2.replace(/^\/+/, ""));
  }
  class $t {
    constructor(e2) {
      this.config = e2;
    }
    signedURL(e2, t2 = {}) {
      const n2 = `/ws/function/${e2}`, s2 = this.config.wsEndpoint.replace(/^ws(s)?:\/\//, ""), r2 = Object.assign({}, t2, { accessKeyId: this.config.accessKey, signatureNonce: Dt(), timestamp: "" + Date.now() }), i2 = [n2, ["accessKeyId", "authorization", "signatureNonce", "timestamp"].sort().map(function(e3) {
        return r2[e3] ? "".concat(e3, "=").concat(r2[e3]) : null;
      }).filter(Boolean).join("&"), `host:${s2}`].join("\n"), o2 = ["HMAC-SHA256", Ie(i2).toString(Nt)].join("\n"), a2 = Se(o2, this.config.secretKey).toString(Nt), c2 = Object.keys(r2).map((e3) => `${e3}=${encodeURIComponent(r2[e3])}`).join("&");
      return `${this.config.wsEndpoint}${n2}?${c2}&signature=${a2}`;
    }
  }
  var Bt = class {
    constructor(e2) {
      if (["spaceId", "spaceAppId", "accessKey", "secretKey"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e2, t2))
          throw new Error(`${t2} required`);
      }), e2.endpoint) {
        if ("string" != typeof e2.endpoint)
          throw new Error("endpoint must be string");
        if (!/^https:\/\//.test(e2.endpoint))
          throw new Error("endpoint must start with https://");
        e2.endpoint = e2.endpoint.replace(/\/$/, "");
      }
      this.config = Object.assign({}, e2, { endpoint: e2.endpoint || `https://${e2.spaceId}.api-hz.cloudbasefunction.cn`, wsEndpoint: e2.wsEndpoint || `wss://${e2.spaceId}.api-hz.cloudbasefunction.cn` }), this._websocket = new $t(this.config);
    }
    callFunction(e2) {
      return function(e3, t2) {
        const { name: n2, data: s2, async: r2 = false, timeout: i2 } = e3, o2 = "POST", a2 = { "x-to-function-name": n2 };
        r2 && (a2["x-function-invoke-type"] = "async");
        const { url: c2, headers: u2 } = Mt("/functions/invokeFunction", { functionName: n2, data: s2, method: o2, headers: a2, signHeaderKeys: ["x-to-function-name"], config: t2 });
        return qt({ url: c2, data: s2, method: o2, headers: u2, timeout: i2 }).then((e4) => {
          let t3 = 0;
          if (r2) {
            const n3 = e4.data || {};
            t3 = "200" === n3.errCode ? 0 : n3.errCode, e4.data = n3.data || {}, e4.errMsg = n3.errMsg;
          }
          if (0 !== t3)
            throw new se({ code: t3, message: e4.errMsg, requestId: e4.requestId });
          return { errCode: t3, success: 0 === t3, requestId: e4.requestId, result: e4.data };
        }).catch((e4) => {
          throw new se({ code: e4.errCode, message: e4.errMsg, requestId: e4.requestId });
        });
      }(e2, this.config);
    }
    uploadFileToOSS({ url: e2, filePath: t2, fileType: n2, formData: s2, onUploadProgress: r2 }) {
      return new Promise((i2, o2) => {
        const a2 = re.uploadFile({ url: e2, filePath: t2, fileType: n2, formData: s2, name: "file", success(e3) {
          e3 && e3.statusCode < 400 ? i2(e3) : o2(new se({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
        }, fail(e3) {
          o2(new se({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
        } });
        "function" == typeof r2 && a2 && "function" == typeof a2.onProgressUpdate && a2.onProgressUpdate((e3) => {
          r2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
        });
      });
    }
    async uploadFile({ filePath: e2, cloudPath: t2 = "", fileType: n2 = "image", onUploadProgress: s2 }) {
      if ("string" !== f(t2))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath必须为字符串类型" });
      if (!(t2 = t2.trim()))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath不可为空" });
      if (/:\/\//.test(t2))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath不合法" });
      const r2 = await Kt({ path: "/".concat(t2.replace(/^\//, ""), "?post_url") }, this.config), { file_id: i2, upload_url: o2, form_data: a2 } = r2, c2 = a2 && a2.reduce((e3, t3) => (e3[t3.key] = t3.value, e3), {});
      return this.uploadFileToOSS({ url: o2, filePath: e2, fileType: n2, formData: c2, onUploadProgress: s2 }).then(() => ({ fileID: i2 }));
    }
    async getTempFileURL({ fileList: e2 }) {
      return new Promise((t2, n2) => {
        (!e2 || e2.length < 0) && t2({ code: "INVALID_PARAM", message: "fileList不能为空数组" }), e2.length > 50 && t2({ code: "INVALID_PARAM", message: "fileList数组长度不能超过50" });
        const s2 = [];
        for (const n3 of e2) {
          let e3;
          "string" !== f(n3) && t2({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
          try {
            e3 = Ft.call(this, n3);
          } catch (t3) {
            console.warn(t3.errCode, t3.errMsg), e3 = n3;
          }
          s2.push({ file_id: e3, expire: 600 });
        }
        Kt({ path: "/?download_url", data: { file_list: s2 }, method: "POST" }, this.config).then((e3) => {
          const { file_list: n3 = [] } = e3;
          t2({ fileList: n3.map((e4) => ({ fileID: jt.call(this, e4.file_id), tempFileURL: e4.download_url })) });
        }).catch((e3) => n2(e3));
      });
    }
    async connectWebSocket(e2) {
      const { name: t2, query: n2 } = e2;
      return re.connectSocket({ url: this._websocket.signedURL(t2, n2), complete: () => {
      } });
    }
  };
  var Wt = { init: (e2) => {
    e2.provider = "alipay";
    const t2 = new Bt(e2);
    return t2.auth = function() {
      return { signInAnonymously: function() {
        return Promise.resolve();
      }, getLoginState: function() {
        return Promise.resolve(true);
      } };
    }, t2;
  } };
  function Ht({ data: e2 }) {
    let t2;
    t2 = pe();
    const n2 = JSON.parse(JSON.stringify(e2 || {}));
    if (Object.assign(n2, { clientInfo: t2 }), !n2.uniIdToken) {
      const { token: e3 } = oe();
      e3 && (n2.uniIdToken = e3);
    }
    return n2;
  }
  async function Jt(e2 = {}) {
    await this.__dev__.initLocalNetwork();
    const { localAddress: t2, localPort: n2 } = this.__dev__, s2 = { aliyun: "aliyun", tencent: "tcb", alipay: "alipay", dcloud: "dcloud" }[this.config.provider], r2 = this.config.spaceId, i2 = `http://${t2}:${n2}/system/check-function`, o2 = `http://${t2}:${n2}/cloudfunctions/${e2.name}`;
    return new Promise((t3, n3) => {
      re.request({ method: "POST", url: i2, data: { name: e2.name, platform: A, provider: s2, spaceId: r2 }, timeout: 3e3, success(e3) {
        t3(e3);
      }, fail() {
        t3({ data: { code: "NETWORK_ERROR", message: "连接本地调试服务失败，请检查客户端是否和主机在同一局域网下，自动切换为已部署的云函数。" } });
      } });
    }).then(({ data: e3 } = {}) => {
      const { code: t3, message: n3 } = e3 || {};
      return { code: 0 === t3 ? 0 : t3 || "SYS_ERR", message: n3 || "SYS_ERR" };
    }).then(({ code: t3, message: n3 }) => {
      if (0 !== t3) {
        switch (t3) {
          case "MODULE_ENCRYPTED":
            console.error(`此云函数（${e2.name}）依赖加密公共模块不可本地调试，自动切换为云端已部署的云函数`);
            break;
          case "FUNCTION_ENCRYPTED":
            console.error(`此云函数（${e2.name}）已加密不可本地调试，自动切换为云端已部署的云函数`);
            break;
          case "ACTION_ENCRYPTED":
            console.error(n3 || "需要访问加密的uni-clientDB-action，自动切换为云端环境");
            break;
          case "NETWORK_ERROR":
            console.error(n3 || "连接本地调试服务失败，请检查客户端是否和主机在同一局域网下");
            break;
          case "SWITCH_TO_CLOUD":
            break;
          default: {
            const e3 = `检测本地调试服务出现错误：${n3}，请检查网络环境或重启客户端再试`;
            throw console.error(e3), new Error(e3);
          }
        }
        return this._callCloudFunction(e2);
      }
      return new Promise((t4, n4) => {
        const r3 = Ht.call(this, { data: e2.data });
        re.request({ method: "POST", url: o2, data: { provider: s2, platform: A, param: r3 }, timeout: e2.timeout, success: ({ statusCode: e3, data: s3 } = {}) => !e3 || e3 >= 400 ? n4(new se({ code: s3.code || "SYS_ERR", message: s3.message || "request:fail" })) : t4({ result: s3 }), fail(e3) {
          n4(new se({ code: e3.code || e3.errCode || "SYS_ERR", message: e3.message || e3.errMsg || "request:fail" }));
        } });
      });
    });
  }
  const zt = [{ rule: /fc_function_not_found|FUNCTION_NOT_FOUND/, content: "，云函数[{functionName}]在云端不存在，请检查此云函数名称是否正确以及该云函数是否已上传到服务空间", mode: "append" }];
  var Vt = /[\\^$.*+?()[\]{}|]/g, Gt = RegExp(Vt.source);
  function Yt(e2, t2, n2) {
    return e2.replace(new RegExp((s2 = t2) && Gt.test(s2) ? s2.replace(Vt, "\\$&") : s2, "g"), n2);
    var s2;
  }
  const Xt = "request", Zt = "response", en$1 = "both";
  const Mn = { code: 2e4, message: "System error" }, qn = { code: 20101, message: "Invalid client" };
  function jn(e2) {
    const { errSubject: t2, subject: n2, errCode: s2, errMsg: r2, code: i2, message: o2, cause: a2 } = e2 || {};
    return new se({ subject: t2 || n2 || "uni-secure-network", code: s2 || i2 || Mn.code, message: r2 || o2, cause: a2 });
  }
  let Bn;
  function Vn({ secretType: e2 } = {}) {
    return e2 === Xt || e2 === Zt || e2 === en$1;
  }
  function Gn({ name: e2, data: t2 = {} } = {}) {
    return "DCloud-clientDB" === e2 && "encryption" === t2.redirectTo && "getAppClientKey" === t2.action;
  }
  function Yn({ provider: e2, spaceId: t2, functionName: n2 } = {}) {
    const { appId: s2, uniPlatform: r2, osName: i2 } = he();
    let o2 = r2;
    "app" === r2 && (o2 = i2);
    const a2 = function({ provider: e3, spaceId: t3 } = {}) {
      const n3 = T;
      if (!n3)
        return {};
      e3 = /* @__PURE__ */ function(e4) {
        return "tencent" === e4 ? "tcb" : e4;
      }(e3);
      const s3 = n3.find((n4) => n4.provider === e3 && n4.spaceId === t3);
      return s3 && s3.config;
    }({ provider: e2, spaceId: t2 });
    if (!a2 || !a2.accessControl || !a2.accessControl.enable)
      return false;
    const c2 = a2.accessControl.function || {}, u2 = Object.keys(c2);
    if (0 === u2.length)
      return true;
    const h2 = function(e3, t3) {
      let n3, s3, r3;
      for (let i3 = 0; i3 < e3.length; i3++) {
        const o3 = e3[i3];
        o3 !== t3 ? "*" !== o3 ? o3.split(",").map((e4) => e4.trim()).indexOf(t3) > -1 && (s3 = o3) : r3 = o3 : n3 = o3;
      }
      return n3 || s3 || r3;
    }(u2, n2);
    if (!h2)
      return false;
    if ((c2[h2] || []).find((e3 = {}) => e3.appId === s2 && (e3.platform || "").toLowerCase() === o2.toLowerCase()))
      return true;
    throw console.error(`此应用[appId: ${s2}, platform: ${o2}]不在云端配置的允许访问的应用列表内，参考：https://uniapp.dcloud.net.cn/uniCloud/secure-network.html#verify-client`), jn(qn);
  }
  function Qn({ functionName: e2, result: t2, logPvd: n2 }) {
    if (this.__dev__.debugLog && t2 && t2.requestId) {
      const s2 = JSON.stringify({ spaceId: this.config.spaceId, functionName: e2, requestId: t2.requestId });
      console.log(`[${n2}-request]${s2}[/${n2}-request]`);
    }
  }
  function Xn(e2) {
    const t2 = e2.callFunction, n2 = function(n3) {
      const s2 = n3.name;
      n3.data = Ht.call(e2, { data: n3.data });
      const r2 = { aliyun: "aliyun", tencent: "tcb", tcb: "tcb", alipay: "alipay", dcloud: "dcloud" }[this.config.provider], i2 = Vn(n3), o2 = Gn(n3), a2 = i2 || o2;
      return t2.call(this, n3).then((e3) => (e3.errCode = 0, !a2 && Qn.call(this, { functionName: s2, result: e3, logPvd: r2 }), Promise.resolve(e3)), (e3) => (!a2 && Qn.call(this, { functionName: s2, result: e3, logPvd: r2 }), e3 && e3.message && (e3.message = function({ message: e4 = "", extraInfo: t3 = {}, formatter: n4 = [] } = {}) {
        for (let s3 = 0; s3 < n4.length; s3++) {
          const { rule: r3, content: i3, mode: o3 } = n4[s3], a3 = e4.match(r3);
          if (!a3)
            continue;
          let c2 = i3;
          for (let e5 = 1; e5 < a3.length; e5++)
            c2 = Yt(c2, `{$${e5}}`, a3[e5]);
          for (const e5 in t3)
            c2 = Yt(c2, `{${e5}}`, t3[e5]);
          return "replace" === o3 ? c2 : e4 + c2;
        }
        return e4;
      }({ message: `[${n3.name}]: ${e3.message}`, formatter: zt, extraInfo: { functionName: s2 } })), Promise.reject(e3)));
    };
    e2.callFunction = function(t3) {
      const { provider: s2, spaceId: r2 } = e2.config, i2 = t3.name;
      let o2, a2;
      if (t3.data = t3.data || {}, e2.__dev__.debugInfo && !e2.__dev__.debugInfo.forceRemote && C ? (e2._callCloudFunction || (e2._callCloudFunction = n2, e2._callLocalFunction = Jt), o2 = Jt) : o2 = n2, o2 = o2.bind(e2), Gn(t3))
        a2 = n2.call(e2, t3);
      else if (Vn(t3)) {
        a2 = new Bn({ secretType: t3.secretType, uniCloudIns: e2 }).wrapEncryptDataCallFunction(n2.bind(e2))(t3);
      } else if (Yn({ provider: s2, spaceId: r2, functionName: i2 })) {
        a2 = new Bn({ secretType: t3.secretType, uniCloudIns: e2 }).wrapVerifyClientCallFunction(n2.bind(e2))(t3);
      } else
        a2 = o2(t3);
      return Object.defineProperty(a2, "result", { get: () => (console.warn("当前返回结果为Promise类型，不可直接访问其result属性，详情请参考：https://uniapp.dcloud.net.cn/uniCloud/faq?id=promise"), {}) }), a2.then((e3) => ("undefined" != typeof UTSJSONObject && "undefined" != typeof UTS && (e3.result = UTS.JSON.parse(JSON.stringify(e3.result))), e3));
    };
  }
  Bn = class {
    constructor() {
      throw jn({ message: `Platform ${A} is not enabled, please check whether secure network module is enabled in your manifest.json` });
    }
  };
  const Zn = Symbol("CLIENT_DB_INTERNAL");
  function es(e2, t2) {
    return e2.then = "DoNotReturnProxyWithAFunctionNamedThen", e2._internalType = Zn, e2.inspect = null, e2.__v_raw = void 0, new Proxy(e2, { get(e3, n2, s2) {
      if ("_uniClient" === n2)
        return null;
      if ("symbol" == typeof n2)
        return e3[n2];
      if (n2 in e3 || "string" != typeof n2) {
        const t3 = e3[n2];
        return "function" == typeof t3 ? t3.bind(e3) : t3;
      }
      return t2.get(e3, n2, s2);
    } });
  }
  function ts(e2) {
    return { on: (t2, n2) => {
      e2[t2] = e2[t2] || [], e2[t2].indexOf(n2) > -1 || e2[t2].push(n2);
    }, off: (t2, n2) => {
      e2[t2] = e2[t2] || [];
      const s2 = e2[t2].indexOf(n2);
      -1 !== s2 && e2[t2].splice(s2, 1);
    } };
  }
  const ns = ["db.Geo", "db.command", "command.aggregate"];
  function ss(e2, t2) {
    return ns.indexOf(`${e2}.${t2}`) > -1;
  }
  function rs(e2) {
    switch (f(e2 = ie(e2))) {
      case "array":
        return e2.map((e3) => rs(e3));
      case "object":
        return e2._internalType === Zn || Object.keys(e2).forEach((t2) => {
          e2[t2] = rs(e2[t2]);
        }), e2;
      case "regexp":
        return { $regexp: { source: e2.source, flags: e2.flags } };
      case "date":
        return { $date: e2.toISOString() };
      default:
        return e2;
    }
  }
  function is(e2) {
    return e2 && e2.content && e2.content.$method;
  }
  class os {
    constructor(e2, t2, n2) {
      this.content = e2, this.prevStage = t2 || null, this.udb = null, this._database = n2;
    }
    toJSON() {
      let e2 = this;
      const t2 = [e2.content];
      for (; e2.prevStage; )
        e2 = e2.prevStage, t2.push(e2.content);
      return { $db: t2.reverse().map((e3) => ({ $method: e3.$method, $param: rs(e3.$param) })) };
    }
    toString() {
      return JSON.stringify(this.toJSON());
    }
    getAction() {
      const e2 = this.toJSON().$db.find((e3) => "action" === e3.$method);
      return e2 && e2.$param && e2.$param[0];
    }
    getCommand() {
      return { $db: this.toJSON().$db.filter((e2) => "action" !== e2.$method) };
    }
    get isAggregate() {
      let e2 = this;
      for (; e2; ) {
        const t2 = is(e2), n2 = is(e2.prevStage);
        if ("aggregate" === t2 && "collection" === n2 || "pipeline" === t2)
          return true;
        e2 = e2.prevStage;
      }
      return false;
    }
    get isCommand() {
      let e2 = this;
      for (; e2; ) {
        if ("command" === is(e2))
          return true;
        e2 = e2.prevStage;
      }
      return false;
    }
    get isAggregateCommand() {
      let e2 = this;
      for (; e2; ) {
        const t2 = is(e2), n2 = is(e2.prevStage);
        if ("aggregate" === t2 && "command" === n2)
          return true;
        e2 = e2.prevStage;
      }
      return false;
    }
    getNextStageFn(e2) {
      const t2 = this;
      return function() {
        return as({ $method: e2, $param: rs(Array.from(arguments)) }, t2, t2._database);
      };
    }
    get count() {
      return this.isAggregate ? this.getNextStageFn("count") : function() {
        return this._send("count", Array.from(arguments));
      };
    }
    get remove() {
      return this.isCommand ? this.getNextStageFn("remove") : function() {
        return this._send("remove", Array.from(arguments));
      };
    }
    get() {
      return this._send("get", Array.from(arguments));
    }
    get add() {
      return this.isCommand ? this.getNextStageFn("add") : function() {
        return this._send("add", Array.from(arguments));
      };
    }
    update() {
      return this._send("update", Array.from(arguments));
    }
    end() {
      return this._send("end", Array.from(arguments));
    }
    get set() {
      return this.isCommand ? this.getNextStageFn("set") : function() {
        throw new Error("JQL禁止使用set方法");
      };
    }
    _send(e2, t2) {
      const n2 = this.getAction(), s2 = this.getCommand();
      if (s2.$db.push({ $method: e2, $param: rs(t2) }), S) {
        const e3 = s2.$db.find((e4) => "collection" === e4.$method), t3 = e3 && e3.$param;
        t3 && 1 === t3.length && "string" == typeof e3.$param[0] && e3.$param[0].indexOf(",") > -1 && console.warn("检测到使用JQL语法联表查询时，未使用getTemp先过滤主表数据，在主表数据量大的情况下可能会查询缓慢。\n- 如何优化请参考此文档：https://uniapp.dcloud.net.cn/uniCloud/jql?id=lookup-with-temp \n- 如果主表数据量很小请忽略此信息，项目发行时不会出现此提示。");
      }
      return this._database._callCloudFunction({ action: n2, command: s2 });
    }
  }
  function as(e2, t2, n2) {
    return es(new os(e2, t2, n2), { get(e3, t3) {
      let s2 = "db";
      return e3 && e3.content && (s2 = e3.content.$method), ss(s2, t3) ? as({ $method: t3 }, e3, n2) : function() {
        return as({ $method: t3, $param: rs(Array.from(arguments)) }, e3, n2);
      };
    } });
  }
  function cs({ path: e2, method: t2 }) {
    return class {
      constructor() {
        this.param = Array.from(arguments);
      }
      toJSON() {
        return { $newDb: [...e2.map((e3) => ({ $method: e3 })), { $method: t2, $param: this.param }] };
      }
      toString() {
        return JSON.stringify(this.toJSON());
      }
    };
  }
  function us(e2, t2 = {}) {
    return es(new e2(t2), { get: (e3, t3) => ss("db", t3) ? as({ $method: t3 }, null, e3) : function() {
      return as({ $method: t3, $param: rs(Array.from(arguments)) }, null, e3);
    } });
  }
  class hs extends class {
    constructor({ uniClient: e2 = {}, isJQL: t2 = false } = {}) {
      this._uniClient = e2, this._authCallBacks = {}, this._dbCallBacks = {}, e2._isDefault && (this._dbCallBacks = R("_globalUniCloudDatabaseCallback")), t2 || (this.auth = ts(this._authCallBacks)), this._isJQL = t2, Object.assign(this, ts(this._dbCallBacks)), this.env = es({}, { get: (e3, t3) => ({ $env: t3 }) }), this.Geo = es({}, { get: (e3, t3) => cs({ path: ["Geo"], method: t3 }) }), this.serverDate = cs({ path: [], method: "serverDate" }), this.RegExp = cs({ path: [], method: "RegExp" });
    }
    getCloudEnv(e2) {
      if ("string" != typeof e2 || !e2.trim())
        throw new Error("getCloudEnv参数错误");
      return { $env: e2.replace("$cloudEnv_", "") };
    }
    _callback(e2, t2) {
      const n2 = this._dbCallBacks;
      n2[e2] && n2[e2].forEach((e3) => {
        e3(...t2);
      });
    }
    _callbackAuth(e2, t2) {
      const n2 = this._authCallBacks;
      n2[e2] && n2[e2].forEach((e3) => {
        e3(...t2);
      });
    }
    multiSend() {
      const e2 = Array.from(arguments), t2 = e2.map((e3) => {
        const t3 = e3.getAction(), n2 = e3.getCommand();
        if ("getTemp" !== n2.$db[n2.$db.length - 1].$method)
          throw new Error("multiSend只支持子命令内使用getTemp");
        return { action: t3, command: n2 };
      });
      return this._callCloudFunction({ multiCommand: t2, queryList: e2 });
    }
  } {
    _parseResult(e2) {
      return this._isJQL ? e2.result : e2;
    }
    _callCloudFunction({ action: e2, command: t2, multiCommand: n2, queryList: s2 }) {
      function r2(e3, t3) {
        if (n2 && s2)
          for (let n3 = 0; n3 < s2.length; n3++) {
            const r3 = s2[n3];
            r3.udb && "function" == typeof r3.udb.setResult && (t3 ? r3.udb.setResult(t3) : r3.udb.setResult(e3.result.dataList[n3]));
          }
      }
      const i2 = this, o2 = this._isJQL ? "databaseForJQL" : "database";
      function a2(e3) {
        return i2._callback("error", [e3]), K(F(o2, "fail"), e3).then(() => K(F(o2, "complete"), e3)).then(() => (r2(null, e3), X(B, { type: J, content: e3 }), Promise.reject(e3)));
      }
      const c2 = K(F(o2, "invoke")), u2 = this._uniClient;
      return c2.then(() => u2.callFunction({ name: "DCloud-clientDB", type: h, data: { action: e2, command: t2, multiCommand: n2 } })).then((e3) => {
        const { code: t3, message: n3, token: s3, tokenExpired: c3, systemInfo: u3 = [] } = e3.result;
        if (u3)
          for (let e4 = 0; e4 < u3.length; e4++) {
            const { level: t4, message: n4, detail: s4 } = u3[e4], r3 = console["warn" === t4 ? "error" : t4] || console.log;
            let i3 = "[System Info]" + n4;
            s4 && (i3 = `${i3}
详细信息：${s4}`), r3(i3);
          }
        if (t3) {
          return a2(new se({ code: t3, message: n3, requestId: e3.requestId }));
        }
        e3.result.errCode = e3.result.errCode || e3.result.code, e3.result.errMsg = e3.result.errMsg || e3.result.message, s3 && c3 && (ae({ token: s3, tokenExpired: c3 }), this._callbackAuth("refreshToken", [{ token: s3, tokenExpired: c3 }]), this._callback("refreshToken", [{ token: s3, tokenExpired: c3 }]), X(H, { token: s3, tokenExpired: c3 }));
        const h2 = [{ prop: "affectedDocs", tips: "affectedDocs不再推荐使用，请使用inserted/deleted/updated/data.length替代" }, { prop: "code", tips: "code不再推荐使用，请使用errCode替代" }, { prop: "message", tips: "message不再推荐使用，请使用errMsg替代" }];
        for (let t4 = 0; t4 < h2.length; t4++) {
          const { prop: n4, tips: s4 } = h2[t4];
          if (n4 in e3.result) {
            const t5 = e3.result[n4];
            Object.defineProperty(e3.result, n4, { get: () => (console.warn(s4), t5) });
          }
        }
        return function(e4) {
          return K(F(o2, "success"), e4).then(() => K(F(o2, "complete"), e4)).then(() => {
            r2(e4, null);
            const t4 = i2._parseResult(e4);
            return X(B, { type: J, content: t4 }), Promise.resolve(t4);
          });
        }(e3);
      }, (e3) => {
        /fc_function_not_found|FUNCTION_NOT_FOUND/g.test(e3.message) && console.warn("clientDB未初始化，请在web控制台保存一次schema以开启clientDB");
        return a2(new se({ code: e3.code || "SYSTEM_ERROR", message: e3.message, requestId: e3.requestId }));
      });
    }
  }
  const ls = "token无效，跳转登录页面", ds = "token过期，跳转登录页面", ps = { TOKEN_INVALID_TOKEN_EXPIRED: ds, TOKEN_INVALID_INVALID_CLIENTID: ls, TOKEN_INVALID: ls, TOKEN_INVALID_WRONG_TOKEN: ls, TOKEN_INVALID_ANONYMOUS_USER: ls }, fs = { "uni-id-token-expired": ds, "uni-id-check-token-failed": ls, "uni-id-token-not-exist": ls, "uni-id-check-device-feature-failed": ls };
  function gs(e2, t2) {
    let n2 = "";
    return n2 = e2 ? `${e2}/${t2}` : t2, n2.replace(/^\//, "");
  }
  function ms(e2 = [], t2 = "") {
    const n2 = [], s2 = [];
    return e2.forEach((e3) => {
      true === e3.needLogin ? n2.push(gs(t2, e3.path)) : false === e3.needLogin && s2.push(gs(t2, e3.path));
    }), { needLoginPage: n2, notNeedLoginPage: s2 };
  }
  function ys(e2) {
    return e2.split("?")[0].replace(/^\//, "");
  }
  function _s() {
    return function(e2) {
      let t2 = e2 && e2.$page && e2.$page.fullPath || "";
      return t2 ? ("/" !== t2.charAt(0) && (t2 = "/" + t2), t2) : t2;
    }(function() {
      const e2 = getCurrentPages();
      return e2[e2.length - 1];
    }());
  }
  function ws() {
    return ys(_s());
  }
  function vs(e2 = "", t2 = {}) {
    if (!e2)
      return false;
    if (!(t2 && t2.list && t2.list.length))
      return false;
    const n2 = t2.list, s2 = ys(e2);
    return n2.some((e3) => e3.pagePath === s2);
  }
  const Is = !!e.uniIdRouter;
  const { loginPage: Ss, routerNeedLogin: bs, resToLogin: ks, needLoginPage: Ts, notNeedLoginPage: As, loginPageInTabBar: Ps } = function({ pages: t2 = [], subPackages: n2 = [], uniIdRouter: s2 = {}, tabBar: r2 = {} } = e) {
    const { loginPage: i2, needLogin: o2 = [], resToLogin: a2 = true } = s2, { needLoginPage: c2, notNeedLoginPage: u2 } = ms(t2), { needLoginPage: h2, notNeedLoginPage: l2 } = function(e2 = []) {
      const t3 = [], n3 = [];
      return e2.forEach((e3) => {
        const { root: s3, pages: r3 = [] } = e3, { needLoginPage: i3, notNeedLoginPage: o3 } = ms(r3, s3);
        t3.push(...i3), n3.push(...o3);
      }), { needLoginPage: t3, notNeedLoginPage: n3 };
    }(n2);
    return { loginPage: i2, routerNeedLogin: o2, resToLogin: a2, needLoginPage: [...c2, ...h2], notNeedLoginPage: [...u2, ...l2], loginPageInTabBar: vs(i2, r2) };
  }();
  if (Ts.indexOf(Ss) > -1)
    throw new Error(`Login page [${Ss}] should not be "needLogin", please check your pages.json`);
  function Cs(e2) {
    const t2 = ws();
    if ("/" === e2.charAt(0))
      return e2;
    const [n2, s2] = e2.split("?"), r2 = n2.replace(/^\//, "").split("/"), i2 = t2.split("/");
    i2.pop();
    for (let e3 = 0; e3 < r2.length; e3++) {
      const t3 = r2[e3];
      ".." === t3 ? i2.pop() : "." !== t3 && i2.push(t3);
    }
    return "" === i2[0] && i2.shift(), "/" + i2.join("/") + (s2 ? "?" + s2 : "");
  }
  function xs(e2) {
    const t2 = ys(Cs(e2));
    return !(As.indexOf(t2) > -1) && (Ts.indexOf(t2) > -1 || bs.some((t3) => function(e3, t4) {
      return new RegExp(t4).test(e3);
    }(e2, t3)));
  }
  function Os({ redirect: e2 }) {
    const t2 = ys(e2), n2 = ys(Ss);
    return ws() !== n2 && t2 !== n2;
  }
  function Es({ api: e2, redirect: t2 } = {}) {
    if (!t2 || !Os({ redirect: t2 }))
      return;
    const n2 = function(e3, t3) {
      return "/" !== e3.charAt(0) && (e3 = "/" + e3), t3 ? e3.indexOf("?") > -1 ? e3 + `&uniIdRedirectUrl=${encodeURIComponent(t3)}` : e3 + `?uniIdRedirectUrl=${encodeURIComponent(t3)}` : e3;
    }(Ss, t2);
    Ps ? "navigateTo" !== e2 && "redirectTo" !== e2 || (e2 = "switchTab") : "switchTab" === e2 && (e2 = "navigateTo");
    const s2 = { navigateTo: uni.navigateTo, redirectTo: uni.redirectTo, switchTab: uni.switchTab, reLaunch: uni.reLaunch };
    setTimeout(() => {
      s2[e2]({ url: n2 });
    }, 0);
  }
  function Ls({ url: e2 } = {}) {
    const t2 = { abortLoginPageJump: false, autoToLoginPage: false }, n2 = function() {
      const { token: e3, tokenExpired: t3 } = oe();
      let n3;
      if (e3) {
        if (t3 < Date.now()) {
          const e4 = "uni-id-token-expired";
          n3 = { errCode: e4, errMsg: fs[e4] };
        }
      } else {
        const e4 = "uni-id-check-token-failed";
        n3 = { errCode: e4, errMsg: fs[e4] };
      }
      return n3;
    }();
    if (xs(e2) && n2) {
      n2.uniIdRedirectUrl = e2;
      if (G(W).length > 0)
        return setTimeout(() => {
          X(W, n2);
        }, 0), t2.abortLoginPageJump = true, t2;
      t2.autoToLoginPage = true;
    }
    return t2;
  }
  function Rs() {
    !function() {
      const e3 = _s(), { abortLoginPageJump: t2, autoToLoginPage: n2 } = Ls({ url: e3 });
      t2 || n2 && Es({ api: "redirectTo", redirect: e3 });
    }();
    const e2 = ["navigateTo", "redirectTo", "reLaunch", "switchTab"];
    for (let t2 = 0; t2 < e2.length; t2++) {
      const n2 = e2[t2];
      uni.addInterceptor(n2, { invoke(e3) {
        const { abortLoginPageJump: t3, autoToLoginPage: s2 } = Ls({ url: e3.url });
        return t3 ? e3 : s2 ? (Es({ api: n2, redirect: Cs(e3.url) }), false) : e3;
      } });
    }
  }
  function Us() {
    this.onResponse((e2) => {
      const { type: t2, content: n2 } = e2;
      let s2 = false;
      switch (t2) {
        case "cloudobject":
          s2 = function(e3) {
            if ("object" != typeof e3)
              return false;
            const { errCode: t3 } = e3 || {};
            return t3 in fs;
          }(n2);
          break;
        case "clientdb":
          s2 = function(e3) {
            if ("object" != typeof e3)
              return false;
            const { errCode: t3 } = e3 || {};
            return t3 in ps;
          }(n2);
      }
      s2 && function(e3 = {}) {
        const t3 = G(W);
        te().then(() => {
          const n3 = _s();
          if (n3 && Os({ redirect: n3 }))
            return t3.length > 0 ? X(W, Object.assign({ uniIdRedirectUrl: n3 }, e3)) : void (Ss && Es({ api: "navigateTo", redirect: n3 }));
        });
      }(n2);
    });
  }
  function Ns(e2) {
    !function(e3) {
      e3.onResponse = function(e4) {
        Y(B, e4);
      }, e3.offResponse = function(e4) {
        Q(B, e4);
      };
    }(e2), function(e3) {
      e3.onNeedLogin = function(e4) {
        Y(W, e4);
      }, e3.offNeedLogin = function(e4) {
        Q(W, e4);
      }, Is && (R("_globalUniCloudStatus").needLoginInit || (R("_globalUniCloudStatus").needLoginInit = true, te().then(() => {
        Rs.call(e3);
      }), ks && Us.call(e3)));
    }(e2), function(e3) {
      e3.onRefreshToken = function(e4) {
        Y(H, e4);
      }, e3.offRefreshToken = function(e4) {
        Q(H, e4);
      };
    }(e2);
  }
  let Ds;
  const Ms = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", qs = /^(?:[A-Za-z\d+/]{4})*?(?:[A-Za-z\d+/]{2}(?:==)?|[A-Za-z\d+/]{3}=?)?$/;
  function Ks() {
    const e2 = oe().token || "", t2 = e2.split(".");
    if (!e2 || 3 !== t2.length)
      return { uid: null, role: [], permission: [], tokenExpired: 0 };
    let n2;
    try {
      n2 = JSON.parse((s2 = t2[1], decodeURIComponent(Ds(s2).split("").map(function(e3) {
        return "%" + ("00" + e3.charCodeAt(0).toString(16)).slice(-2);
      }).join(""))));
    } catch (e3) {
      throw new Error("获取当前用户信息出错，详细错误信息为：" + e3.message);
    }
    var s2;
    return n2.tokenExpired = 1e3 * n2.exp, delete n2.exp, delete n2.iat, n2;
  }
  Ds = "function" != typeof atob ? function(e2) {
    if (e2 = String(e2).replace(/[\t\n\f\r ]+/g, ""), !qs.test(e2))
      throw new Error("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");
    var t2;
    e2 += "==".slice(2 - (3 & e2.length));
    for (var n2, s2, r2 = "", i2 = 0; i2 < e2.length; )
      t2 = Ms.indexOf(e2.charAt(i2++)) << 18 | Ms.indexOf(e2.charAt(i2++)) << 12 | (n2 = Ms.indexOf(e2.charAt(i2++))) << 6 | (s2 = Ms.indexOf(e2.charAt(i2++))), r2 += 64 === n2 ? String.fromCharCode(t2 >> 16 & 255) : 64 === s2 ? String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255) : String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255, 255 & t2);
    return r2;
  } : atob;
  var Fs = n(function(e2, t2) {
    Object.defineProperty(t2, "__esModule", { value: true });
    const n2 = "chooseAndUploadFile:ok", s2 = "chooseAndUploadFile:fail";
    function r2(e3, t3) {
      return e3.tempFiles.forEach((e4, n3) => {
        e4.name || (e4.name = e4.path.substring(e4.path.lastIndexOf("/") + 1)), t3 && (e4.fileType = t3), e4.cloudPath = Date.now() + "_" + n3 + e4.name.substring(e4.name.lastIndexOf("."));
      }), e3.tempFilePaths || (e3.tempFilePaths = e3.tempFiles.map((e4) => e4.path)), e3;
    }
    function i2(e3, t3, { onChooseFile: s3, onUploadProgress: r3 }) {
      return t3.then((e4) => {
        if (s3) {
          const t4 = s3(e4);
          if (void 0 !== t4)
            return Promise.resolve(t4).then((t5) => void 0 === t5 ? e4 : t5);
        }
        return e4;
      }).then((t4) => false === t4 ? { errMsg: n2, tempFilePaths: [], tempFiles: [] } : function(e4, t5, s4 = 5, r4) {
        (t5 = Object.assign({}, t5)).errMsg = n2;
        const i3 = t5.tempFiles, o2 = i3.length;
        let a2 = 0;
        return new Promise((n3) => {
          for (; a2 < s4; )
            c2();
          function c2() {
            const s5 = a2++;
            if (s5 >= o2)
              return void (!i3.find((e5) => !e5.url && !e5.errMsg) && n3(t5));
            const u2 = i3[s5];
            e4.uploadFile({ provider: u2.provider, filePath: u2.path, cloudPath: u2.cloudPath, fileType: u2.fileType, cloudPathAsRealPath: u2.cloudPathAsRealPath, onUploadProgress(e5) {
              e5.index = s5, e5.tempFile = u2, e5.tempFilePath = u2.path, r4 && r4(e5);
            } }).then((e5) => {
              u2.url = e5.fileID, s5 < o2 && c2();
            }).catch((e5) => {
              u2.errMsg = e5.errMsg || e5.message, s5 < o2 && c2();
            });
          }
        });
      }(e3, t4, 5, r3));
    }
    t2.initChooseAndUploadFile = function(e3) {
      return function(t3 = { type: "all" }) {
        return "image" === t3.type ? i2(e3, function(e4) {
          const { count: t4, sizeType: n3, sourceType: i3 = ["album", "camera"], extension: o2 } = e4;
          return new Promise((e5, a2) => {
            uni.chooseImage({ count: t4, sizeType: n3, sourceType: i3, extension: o2, success(t5) {
              e5(r2(t5, "image"));
            }, fail(e6) {
              a2({ errMsg: e6.errMsg.replace("chooseImage:fail", s2) });
            } });
          });
        }(t3), t3) : "video" === t3.type ? i2(e3, function(e4) {
          const { camera: t4, compressed: n3, maxDuration: i3, sourceType: o2 = ["album", "camera"], extension: a2 } = e4;
          return new Promise((e5, c2) => {
            uni.chooseVideo({ camera: t4, compressed: n3, maxDuration: i3, sourceType: o2, extension: a2, success(t5) {
              const { tempFilePath: n4, duration: s3, size: i4, height: o3, width: a3 } = t5;
              e5(r2({ errMsg: "chooseVideo:ok", tempFilePaths: [n4], tempFiles: [{ name: t5.tempFile && t5.tempFile.name || "", path: n4, size: i4, type: t5.tempFile && t5.tempFile.type || "", width: a3, height: o3, duration: s3, fileType: "video", cloudPath: "" }] }, "video"));
            }, fail(e6) {
              c2({ errMsg: e6.errMsg.replace("chooseVideo:fail", s2) });
            } });
          });
        }(t3), t3) : i2(e3, function(e4) {
          const { count: t4, extension: n3 } = e4;
          return new Promise((e5, i3) => {
            let o2 = uni.chooseFile;
            if ("undefined" != typeof wx && "function" == typeof wx.chooseMessageFile && (o2 = wx.chooseMessageFile), "function" != typeof o2)
              return i3({ errMsg: s2 + " 请指定 type 类型，该平台仅支持选择 image 或 video。" });
            o2({ type: "all", count: t4, extension: n3, success(t5) {
              e5(r2(t5));
            }, fail(e6) {
              i3({ errMsg: e6.errMsg.replace("chooseFile:fail", s2) });
            } });
          });
        }(t3), t3);
      };
    };
  }), js = t$1(Fs);
  const $s = "manual";
  function Bs(e2) {
    return { props: { localdata: { type: Array, default: () => [] }, options: { type: [Object, Array], default: () => ({}) }, spaceInfo: { type: Object, default: () => ({}) }, collection: { type: [String, Array], default: "" }, action: { type: String, default: "" }, field: { type: String, default: "" }, orderby: { type: String, default: "" }, where: { type: [String, Object], default: "" }, pageData: { type: String, default: "add" }, pageCurrent: { type: Number, default: 1 }, pageSize: { type: Number, default: 20 }, getcount: { type: [Boolean, String], default: false }, gettree: { type: [Boolean, String], default: false }, gettreepath: { type: [Boolean, String], default: false }, startwith: { type: String, default: "" }, limitlevel: { type: Number, default: 10 }, groupby: { type: String, default: "" }, groupField: { type: String, default: "" }, distinct: { type: [Boolean, String], default: false }, foreignKey: { type: String, default: "" }, loadtime: { type: String, default: "auto" }, manual: { type: Boolean, default: false } }, data: () => ({ mixinDatacomLoading: false, mixinDatacomHasMore: false, mixinDatacomResData: [], mixinDatacomErrorMessage: "", mixinDatacomPage: {}, mixinDatacomError: null }), created() {
      this.mixinDatacomPage = { current: this.pageCurrent, size: this.pageSize, count: 0 }, this.$watch(() => {
        var e3 = [];
        return ["pageCurrent", "pageSize", "localdata", "collection", "action", "field", "orderby", "where", "getont", "getcount", "gettree", "groupby", "groupField", "distinct"].forEach((t2) => {
          e3.push(this[t2]);
        }), e3;
      }, (e3, t2) => {
        if (this.loadtime === $s)
          return;
        let n2 = false;
        const s2 = [];
        for (let r2 = 2; r2 < e3.length; r2++)
          e3[r2] !== t2[r2] && (s2.push(e3[r2]), n2 = true);
        e3[0] !== t2[0] && (this.mixinDatacomPage.current = this.pageCurrent), this.mixinDatacomPage.size = this.pageSize, this.onMixinDatacomPropsChange(n2, s2);
      });
    }, methods: { onMixinDatacomPropsChange(e3, t2) {
    }, mixinDatacomEasyGet({ getone: e3 = false, success: t2, fail: n2 } = {}) {
      this.mixinDatacomLoading || (this.mixinDatacomLoading = true, this.mixinDatacomErrorMessage = "", this.mixinDatacomError = null, this.mixinDatacomGet().then((n3) => {
        this.mixinDatacomLoading = false;
        const { data: s2, count: r2 } = n3.result;
        this.getcount && (this.mixinDatacomPage.count = r2), this.mixinDatacomHasMore = s2.length < this.pageSize;
        const i2 = e3 ? s2.length ? s2[0] : void 0 : s2;
        this.mixinDatacomResData = i2, t2 && t2(i2);
      }).catch((e4) => {
        this.mixinDatacomLoading = false, this.mixinDatacomErrorMessage = e4, this.mixinDatacomError = e4, n2 && n2(e4);
      }));
    }, mixinDatacomGet(t2 = {}) {
      let n2;
      t2 = t2 || {}, n2 = "undefined" != typeof __uniX && __uniX ? e2.databaseForJQL(this.spaceInfo) : e2.database(this.spaceInfo);
      const s2 = t2.action || this.action;
      s2 && (n2 = n2.action(s2));
      const r2 = t2.collection || this.collection;
      n2 = Array.isArray(r2) ? n2.collection(...r2) : n2.collection(r2);
      const i2 = t2.where || this.where;
      i2 && Object.keys(i2).length && (n2 = n2.where(i2));
      const o2 = t2.field || this.field;
      o2 && (n2 = n2.field(o2));
      const a2 = t2.foreignKey || this.foreignKey;
      a2 && (n2 = n2.foreignKey(a2));
      const c2 = t2.groupby || this.groupby;
      c2 && (n2 = n2.groupBy(c2));
      const u2 = t2.groupField || this.groupField;
      u2 && (n2 = n2.groupField(u2));
      true === (void 0 !== t2.distinct ? t2.distinct : this.distinct) && (n2 = n2.distinct());
      const h2 = t2.orderby || this.orderby;
      h2 && (n2 = n2.orderBy(h2));
      const l2 = void 0 !== t2.pageCurrent ? t2.pageCurrent : this.mixinDatacomPage.current, d2 = void 0 !== t2.pageSize ? t2.pageSize : this.mixinDatacomPage.size, p2 = void 0 !== t2.getcount ? t2.getcount : this.getcount, f2 = void 0 !== t2.gettree ? t2.gettree : this.gettree, g2 = void 0 !== t2.gettreepath ? t2.gettreepath : this.gettreepath, m2 = { getCount: p2 }, y2 = { limitLevel: void 0 !== t2.limitlevel ? t2.limitlevel : this.limitlevel, startWith: void 0 !== t2.startwith ? t2.startwith : this.startwith };
      return f2 && (m2.getTree = y2), g2 && (m2.getTreePath = y2), n2 = n2.skip(d2 * (l2 - 1)).limit(d2).get(m2), n2;
    } } };
  }
  function Ws(e2) {
    return function(t2, n2 = {}) {
      n2 = function(e3, t3 = {}) {
        return e3.customUI = t3.customUI || e3.customUI, e3.parseSystemError = t3.parseSystemError || e3.parseSystemError, Object.assign(e3.loadingOptions, t3.loadingOptions), Object.assign(e3.errorOptions, t3.errorOptions), "object" == typeof t3.secretMethods && (e3.secretMethods = t3.secretMethods), e3;
      }({ customUI: false, loadingOptions: { title: "加载中...", mask: true }, errorOptions: { type: "modal", retry: false } }, n2);
      const { customUI: s2, loadingOptions: r2, errorOptions: i2, parseSystemError: o2 } = n2, a2 = !s2;
      return new Proxy({}, { get(s3, c2) {
        switch (c2) {
          case "toString":
            return "[object UniCloudObject]";
          case "toJSON":
            return {};
        }
        return function({ fn: e3, interceptorName: t3, getCallbackArgs: n3 } = {}) {
          return async function(...s4) {
            const r3 = n3 ? n3({ params: s4 }) : {};
            let i3, o3;
            try {
              return await K(F(t3, "invoke"), { ...r3 }), i3 = await e3(...s4), await K(F(t3, "success"), { ...r3, result: i3 }), i3;
            } catch (e4) {
              throw o3 = e4, await K(F(t3, "fail"), { ...r3, error: o3 }), o3;
            } finally {
              await K(F(t3, "complete"), o3 ? { ...r3, error: o3 } : { ...r3, result: i3 });
            }
          };
        }({ fn: async function s4(...h2) {
          let l2;
          a2 && uni.showLoading({ title: r2.title, mask: r2.mask });
          const d2 = { name: t2, type: u, data: { method: c2, params: h2 } };
          "object" == typeof n2.secretMethods && function(e3, t3) {
            const n3 = t3.data.method, s5 = e3.secretMethods || {}, r3 = s5[n3] || s5["*"];
            r3 && (t3.secretType = r3);
          }(n2, d2);
          let p2 = false;
          try {
            l2 = await e2.callFunction(d2);
          } catch (e3) {
            p2 = true, l2 = { result: new se(e3) };
          }
          const { errSubject: f2, errCode: g2, errMsg: m2, newToken: y2 } = l2.result || {};
          if (a2 && uni.hideLoading(), y2 && y2.token && y2.tokenExpired && (ae(y2), X(H, { ...y2 })), g2) {
            let e3 = m2;
            if (p2 && o2) {
              e3 = (await o2({ objectName: t2, methodName: c2, params: h2, errSubject: f2, errCode: g2, errMsg: m2 })).errMsg || m2;
            }
            if (a2)
              if ("toast" === i2.type)
                uni.showToast({ title: e3, icon: "none" });
              else {
                if ("modal" !== i2.type)
                  throw new Error(`Invalid errorOptions.type: ${i2.type}`);
                {
                  const { confirm: t3 } = await async function({ title: e4, content: t4, showCancel: n4, cancelText: s5, confirmText: r3 } = {}) {
                    return new Promise((i3, o3) => {
                      uni.showModal({ title: e4, content: t4, showCancel: n4, cancelText: s5, confirmText: r3, success(e5) {
                        i3(e5);
                      }, fail() {
                        i3({ confirm: false, cancel: true });
                      } });
                    });
                  }({ title: "提示", content: e3, showCancel: i2.retry, cancelText: "取消", confirmText: i2.retry ? "重试" : "确定" });
                  if (i2.retry && t3)
                    return s4(...h2);
                }
              }
            const n3 = new se({ subject: f2, code: g2, message: m2, requestId: l2.requestId });
            throw n3.detail = l2.result, X(B, { type: V, content: n3 }), n3;
          }
          return X(B, { type: V, content: l2.result }), l2.result;
        }, interceptorName: "callObject", getCallbackArgs: function({ params: e3 } = {}) {
          return { objectName: t2, methodName: c2, params: e3 };
        } });
      } });
    };
  }
  function Hs(e2) {
    return R("_globalUniCloudSecureNetworkCache__{spaceId}".replace("{spaceId}", e2.config.spaceId));
  }
  async function Js({ openid: e2, callLoginByWeixin: t2 = false } = {}) {
    Hs(this);
    throw new Error(`[SecureNetwork] API \`initSecureNetworkByWeixin\` is not supported on platform \`${A}\``);
  }
  async function zs(e2) {
    const t2 = Hs(this);
    return t2.initPromise || (t2.initPromise = Js.call(this, e2).then((e3) => e3).catch((e3) => {
      throw delete t2.initPromise, e3;
    })), t2.initPromise;
  }
  function Vs(e2) {
    return function({ openid: t2, callLoginByWeixin: n2 = false } = {}) {
      return zs.call(e2, { openid: t2, callLoginByWeixin: n2 });
    };
  }
  function Gs(e2) {
    !function(e3) {
      de = e3;
    }(e2);
  }
  function Ys(e2) {
    const t2 = { getSystemInfo: uni.getSystemInfo, getPushClientId: uni.getPushClientId };
    return function(n2) {
      return new Promise((s2, r2) => {
        t2[e2]({ ...n2, success(e3) {
          s2(e3);
        }, fail(e3) {
          r2(e3);
        } });
      });
    };
  }
  class Qs extends class {
    constructor() {
      this._callback = {};
    }
    addListener(e2, t2) {
      this._callback[e2] || (this._callback[e2] = []), this._callback[e2].push(t2);
    }
    on(e2, t2) {
      return this.addListener(e2, t2);
    }
    removeListener(e2, t2) {
      if (!t2)
        throw new Error('The "listener" argument must be of type function. Received undefined');
      const n2 = this._callback[e2];
      if (!n2)
        return;
      const s2 = function(e3, t3) {
        for (let n3 = e3.length - 1; n3 >= 0; n3--)
          if (e3[n3] === t3)
            return n3;
        return -1;
      }(n2, t2);
      n2.splice(s2, 1);
    }
    off(e2, t2) {
      return this.removeListener(e2, t2);
    }
    removeAllListener(e2) {
      delete this._callback[e2];
    }
    emit(e2, ...t2) {
      const n2 = this._callback[e2];
      if (n2)
        for (let e3 = 0; e3 < n2.length; e3++)
          n2[e3](...t2);
    }
  } {
    constructor() {
      super(), this._uniPushMessageCallback = this._receivePushMessage.bind(this), this._currentMessageId = -1, this._payloadQueue = [];
    }
    init() {
      return Promise.all([Ys("getSystemInfo")(), Ys("getPushClientId")()]).then(([{ appId: e2 } = {}, { cid: t2 } = {}] = []) => {
        if (!e2)
          throw new Error("Invalid appId, please check the manifest.json file");
        if (!t2)
          throw new Error("Invalid push client id");
        this._appId = e2, this._pushClientId = t2, this._seqId = Date.now() + "-" + Math.floor(9e5 * Math.random() + 1e5), this.emit("open"), this._initMessageListener();
      }, (e2) => {
        throw this.emit("error", e2), this.close(), e2;
      });
    }
    async open() {
      return this.init();
    }
    _isUniCloudSSE(e2) {
      if ("receive" !== e2.type)
        return false;
      const t2 = e2 && e2.data && e2.data.payload;
      return !(!t2 || "UNI_CLOUD_SSE" !== t2.channel || t2.seqId !== this._seqId);
    }
    _receivePushMessage(e2) {
      if (!this._isUniCloudSSE(e2))
        return;
      const t2 = e2 && e2.data && e2.data.payload, { action: n2, messageId: s2, message: r2 } = t2;
      this._payloadQueue.push({ action: n2, messageId: s2, message: r2 }), this._consumMessage();
    }
    _consumMessage() {
      for (; ; ) {
        const e2 = this._payloadQueue.find((e3) => e3.messageId === this._currentMessageId + 1);
        if (!e2)
          break;
        this._currentMessageId++, this._parseMessagePayload(e2);
      }
    }
    _parseMessagePayload(e2) {
      const { action: t2, messageId: n2, message: s2 } = e2;
      "end" === t2 ? this._end({ messageId: n2, message: s2 }) : "message" === t2 && this._appendMessage({ messageId: n2, message: s2 });
    }
    _appendMessage({ messageId: e2, message: t2 } = {}) {
      this.emit("message", t2);
    }
    _end({ messageId: e2, message: t2 } = {}) {
      this.emit("end", t2), this.close();
    }
    _initMessageListener() {
      uni.onPushMessage(this._uniPushMessageCallback);
    }
    _destroy() {
      uni.offPushMessage(this._uniPushMessageCallback);
    }
    toJSON() {
      return { appId: this._appId, pushClientId: this._pushClientId, seqId: this._seqId };
    }
    close() {
      this._destroy(), this.emit("close");
    }
  }
  async function Xs(e2) {
    {
      const { osName: e3, osVersion: t3 } = he();
      "ios" === e3 && function(e4) {
        if (!e4 || "string" != typeof e4)
          return 0;
        const t4 = e4.match(/^(\d+)./);
        return t4 && t4[1] ? parseInt(t4[1]) : 0;
      }(t3) >= 14 && console.warn("iOS 14及以上版本连接uniCloud本地调试服务需要允许客户端查找并连接到本地网络上的设备（仅开发期间需要，发行后不需要）");
    }
    const t2 = e2.__dev__;
    if (!t2.debugInfo)
      return;
    const { address: n2, servePort: s2 } = t2.debugInfo, { address: r2 } = await Et(n2, s2);
    if (r2)
      return t2.localAddress = r2, void (t2.localPort = s2);
    const i2 = console["error"];
    let o2 = "";
    if ("remote" === t2.debugInfo.initialLaunchType ? (t2.debugInfo.forceRemote = true, o2 = "当前客户端和HBuilderX不在同一局域网下（或其他网络原因无法连接HBuilderX），uniCloud本地调试服务不对当前客户端生效。\n- 如果不使用uniCloud本地调试服务，请直接忽略此信息。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。") : o2 = "无法连接uniCloud本地调试服务，请检查当前客户端是否与主机在同一局域网下。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。", o2 += "\n- 如果在HBuilderX开启的状态下切换过网络环境，请重启HBuilderX后再试\n- 检查系统防火墙是否拦截了HBuilderX自带的nodejs\n- 检查是否错误的使用拦截器修改uni.request方法的参数", 0 === A.indexOf("mp-") && (o2 += "\n- 小程序中如何使用uniCloud，请参考：https://uniapp.dcloud.net.cn/uniCloud/publish.html#useinmp"), !t2.debugInfo.forceRemote)
      throw new Error(o2);
    i2(o2);
  }
  function Zs(e2) {
    e2._initPromiseHub || (e2._initPromiseHub = new v({ createPromise: function() {
      let t2 = Promise.resolve();
      var n2;
      n2 = 1, t2 = new Promise((e3) => {
        setTimeout(() => {
          e3();
        }, n2);
      });
      const s2 = e2.auth();
      return t2.then(() => s2.getLoginState()).then((e3) => e3 ? Promise.resolve() : s2.signInAnonymously());
    } }));
  }
  const er = { tcb: xt, tencent: xt, aliyun: me, private: Ut, dcloud: Ut, alipay: Wt };
  let tr = new class {
    init(e2) {
      let t2 = {};
      const n2 = er[e2.provider];
      if (!n2)
        throw new Error("未提供正确的provider参数");
      t2 = n2.init(e2), function(e3) {
        const t3 = {};
        e3.__dev__ = t3, t3.debugLog = "app" === A;
        const n3 = P;
        n3 && !n3.code && (t3.debugInfo = n3);
        const s2 = new v({ createPromise: function() {
          return Xs(e3);
        } });
        t3.initLocalNetwork = function() {
          return s2.exec();
        };
      }(t2), Zs(t2), Xn(t2), function(e3) {
        const t3 = e3.uploadFile;
        e3.uploadFile = function(e4) {
          return t3.call(this, e4);
        };
      }(t2), function(e3) {
        e3.database = function(t3) {
          if (t3 && Object.keys(t3).length > 0)
            return e3.init(t3).database();
          if (this._database)
            return this._database;
          const n3 = us(hs, { uniClient: e3 });
          return this._database = n3, n3;
        }, e3.databaseForJQL = function(t3) {
          if (t3 && Object.keys(t3).length > 0)
            return e3.init(t3).databaseForJQL();
          if (this._databaseForJQL)
            return this._databaseForJQL;
          const n3 = us(hs, { uniClient: e3, isJQL: true });
          return this._databaseForJQL = n3, n3;
        };
      }(t2), function(e3) {
        e3.getCurrentUserInfo = Ks, e3.chooseAndUploadFile = js.initChooseAndUploadFile(e3), Object.assign(e3, { get mixinDatacom() {
          return Bs(e3);
        } }), e3.SSEChannel = Qs, e3.initSecureNetworkByWeixin = Vs(e3), e3.setCustomClientInfo = Gs, e3.importObject = Ws(e3);
      }(t2);
      return ["callFunction", "uploadFile", "deleteFile", "getTempFileURL", "downloadFile", "chooseAndUploadFile"].forEach((e3) => {
        if (!t2[e3])
          return;
        const n3 = t2[e3];
        t2[e3] = function() {
          return n3.apply(t2, Array.from(arguments));
        }, t2[e3] = (/* @__PURE__ */ function(e4, t3) {
          return function(n4) {
            let s2 = false;
            if ("callFunction" === t3) {
              const e5 = n4 && n4.type || c;
              s2 = e5 !== c;
            }
            const r2 = "callFunction" === t3 && !s2, i2 = this._initPromiseHub.exec();
            n4 = n4 || {};
            const { success: o2, fail: a2, complete: u2 } = ne(n4), h2 = i2.then(() => s2 ? Promise.resolve() : K(F(t3, "invoke"), n4)).then(() => e4.call(this, n4)).then((e5) => s2 ? Promise.resolve(e5) : K(F(t3, "success"), e5).then(() => K(F(t3, "complete"), e5)).then(() => (r2 && X(B, { type: z, content: e5 }), Promise.resolve(e5))), (e5) => s2 ? Promise.reject(e5) : K(F(t3, "fail"), e5).then(() => K(F(t3, "complete"), e5)).then(() => (X(B, { type: z, content: e5 }), Promise.reject(e5))));
            if (!(o2 || a2 || u2))
              return h2;
            h2.then((e5) => {
              o2 && o2(e5), u2 && u2(e5), r2 && X(B, { type: z, content: e5 });
            }, (e5) => {
              a2 && a2(e5), u2 && u2(e5), r2 && X(B, { type: z, content: e5 });
            });
          };
        }(t2[e3], e3)).bind(t2);
      }), t2.init = this.init, t2;
    }
  }();
  (() => {
    const e2 = C;
    let t2 = {};
    if (e2 && 1 === e2.length)
      t2 = e2[0], tr = tr.init(t2), tr._isDefault = true;
    else {
      const t3 = ["auth", "callFunction", "uploadFile", "deleteFile", "getTempFileURL", "downloadFile", "database", "getCurrentUSerInfo", "importObject"];
      let n2;
      n2 = e2 && e2.length > 0 ? "应用有多个服务空间，请通过uniCloud.init方法指定要使用的服务空间" : "应用未关联服务空间，请在uniCloud目录右键关联服务空间", t3.forEach((e3) => {
        tr[e3] = function() {
          return console.error(n2), Promise.reject(new se({ code: "SYS_ERR", message: n2 }));
        };
      });
    }
    if (Object.assign(tr, { get mixinDatacom() {
      return Bs(tr);
    } }), Ns(tr), tr.addInterceptor = M, tr.removeInterceptor = q, tr.interceptObject = j, uni.__uniCloud = tr, "app" === A) {
      const e3 = U();
      e3.uniCloud = tr, e3.UniCloudError = se;
    }
  })();
  var nr = tr;
  const isObject$1 = (val) => val !== null && typeof val === "object";
  const defaultDelimiters = ["{", "}"];
  class BaseFormatter {
    constructor() {
      this._caches = /* @__PURE__ */ Object.create(null);
    }
    interpolate(message, values, delimiters = defaultDelimiters) {
      if (!values) {
        return [message];
      }
      let tokens = this._caches[message];
      if (!tokens) {
        tokens = parse(message, delimiters);
        this._caches[message] = tokens;
      }
      return compile(tokens, values);
    }
  }
  const RE_TOKEN_LIST_VALUE = /^(?:\d)+/;
  const RE_TOKEN_NAMED_VALUE = /^(?:\w)+/;
  function parse(format, [startDelimiter, endDelimiter]) {
    const tokens = [];
    let position = 0;
    let text = "";
    while (position < format.length) {
      let char = format[position++];
      if (char === startDelimiter) {
        if (text) {
          tokens.push({ type: "text", value: text });
        }
        text = "";
        let sub = "";
        char = format[position++];
        while (char !== void 0 && char !== endDelimiter) {
          sub += char;
          char = format[position++];
        }
        const isClosed = char === endDelimiter;
        const type = RE_TOKEN_LIST_VALUE.test(sub) ? "list" : isClosed && RE_TOKEN_NAMED_VALUE.test(sub) ? "named" : "unknown";
        tokens.push({ value: sub, type });
      } else {
        text += char;
      }
    }
    text && tokens.push({ type: "text", value: text });
    return tokens;
  }
  function compile(tokens, values) {
    const compiled = [];
    let index2 = 0;
    const mode = Array.isArray(values) ? "list" : isObject$1(values) ? "named" : "unknown";
    if (mode === "unknown") {
      return compiled;
    }
    while (index2 < tokens.length) {
      const token = tokens[index2];
      switch (token.type) {
        case "text":
          compiled.push(token.value);
          break;
        case "list":
          compiled.push(values[parseInt(token.value, 10)]);
          break;
        case "named":
          if (mode === "named") {
            compiled.push(values[token.value]);
          } else {
            {
              console.warn(`Type of token '${token.type}' and format of value '${mode}' don't match!`);
            }
          }
          break;
        case "unknown":
          {
            console.warn(`Detect 'unknown' type of token!`);
          }
          break;
      }
      index2++;
    }
    return compiled;
  }
  const LOCALE_ZH_HANS = "zh-Hans";
  const LOCALE_ZH_HANT = "zh-Hant";
  const LOCALE_EN = "en";
  const LOCALE_FR = "fr";
  const LOCALE_ES = "es";
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const hasOwn = (val, key) => hasOwnProperty.call(val, key);
  const defaultFormatter = new BaseFormatter();
  function include(str, parts) {
    return !!parts.find((part) => str.indexOf(part) !== -1);
  }
  function startsWith(str, parts) {
    return parts.find((part) => str.indexOf(part) === 0);
  }
  function normalizeLocale(locale, messages2) {
    if (!locale) {
      return;
    }
    locale = locale.trim().replace(/_/g, "-");
    if (messages2 && messages2[locale]) {
      return locale;
    }
    locale = locale.toLowerCase();
    if (locale === "chinese") {
      return LOCALE_ZH_HANS;
    }
    if (locale.indexOf("zh") === 0) {
      if (locale.indexOf("-hans") > -1) {
        return LOCALE_ZH_HANS;
      }
      if (locale.indexOf("-hant") > -1) {
        return LOCALE_ZH_HANT;
      }
      if (include(locale, ["-tw", "-hk", "-mo", "-cht"])) {
        return LOCALE_ZH_HANT;
      }
      return LOCALE_ZH_HANS;
    }
    let locales = [LOCALE_EN, LOCALE_FR, LOCALE_ES];
    if (messages2 && Object.keys(messages2).length > 0) {
      locales = Object.keys(messages2);
    }
    const lang = startsWith(locale, locales);
    if (lang) {
      return lang;
    }
  }
  class I18n {
    constructor({ locale, fallbackLocale, messages: messages2, watcher, formater: formater2 }) {
      this.locale = LOCALE_EN;
      this.fallbackLocale = LOCALE_EN;
      this.message = {};
      this.messages = {};
      this.watchers = [];
      if (fallbackLocale) {
        this.fallbackLocale = fallbackLocale;
      }
      this.formater = formater2 || defaultFormatter;
      this.messages = messages2 || {};
      this.setLocale(locale || LOCALE_EN);
      if (watcher) {
        this.watchLocale(watcher);
      }
    }
    setLocale(locale) {
      const oldLocale = this.locale;
      this.locale = normalizeLocale(locale, this.messages) || this.fallbackLocale;
      if (!this.messages[this.locale]) {
        this.messages[this.locale] = {};
      }
      this.message = this.messages[this.locale];
      if (oldLocale !== this.locale) {
        this.watchers.forEach((watcher) => {
          watcher(this.locale, oldLocale);
        });
      }
    }
    getLocale() {
      return this.locale;
    }
    watchLocale(fn) {
      const index2 = this.watchers.push(fn) - 1;
      return () => {
        this.watchers.splice(index2, 1);
      };
    }
    add(locale, message, override = true) {
      const curMessages = this.messages[locale];
      if (curMessages) {
        if (override) {
          Object.assign(curMessages, message);
        } else {
          Object.keys(message).forEach((key) => {
            if (!hasOwn(curMessages, key)) {
              curMessages[key] = message[key];
            }
          });
        }
      } else {
        this.messages[locale] = message;
      }
    }
    f(message, values, delimiters) {
      return this.formater.interpolate(message, values, delimiters).join("");
    }
    t(key, locale, values) {
      let message = this.message;
      if (typeof locale === "string") {
        locale = normalizeLocale(locale, this.messages);
        locale && (message = this.messages[locale]);
      } else {
        values = locale;
      }
      if (!hasOwn(message, key)) {
        console.warn(`Cannot translate the value of keypath ${key}. Use the value of keypath as default.`);
        return key;
      }
      return this.formater.interpolate(message[key], values).join("");
    }
  }
  function watchAppLocale(appVm, i18n) {
    if (appVm.$watchLocale) {
      appVm.$watchLocale((newLocale) => {
        i18n.setLocale(newLocale);
      });
    } else {
      appVm.$watch(() => appVm.$locale, (newLocale) => {
        i18n.setLocale(newLocale);
      });
    }
  }
  function getDefaultLocale() {
    if (typeof uni !== "undefined" && uni.getLocale) {
      return uni.getLocale();
    }
    if (typeof global !== "undefined" && global.getLocale) {
      return global.getLocale();
    }
    return LOCALE_EN;
  }
  function initVueI18n(locale, messages2 = {}, fallbackLocale, watcher) {
    if (typeof locale !== "string") {
      const options = [
        messages2,
        locale
      ];
      locale = options[0];
      messages2 = options[1];
    }
    if (typeof locale !== "string") {
      locale = getDefaultLocale();
    }
    if (typeof fallbackLocale !== "string") {
      fallbackLocale = typeof __uniConfig !== "undefined" && __uniConfig.fallbackLocale || LOCALE_EN;
    }
    const i18n = new I18n({
      locale,
      fallbackLocale,
      messages: messages2,
      watcher
    });
    let t2 = (key, values) => {
      if (typeof getApp !== "function") {
        t2 = function(key2, values2) {
          return i18n.t(key2, values2);
        };
      } else {
        let isWatchedAppLocale = false;
        t2 = function(key2, values2) {
          const appVm = getApp().$vm;
          if (appVm) {
            appVm.$locale;
            if (!isWatchedAppLocale) {
              isWatchedAppLocale = true;
              watchAppLocale(appVm, i18n);
            }
          }
          return i18n.t(key2, values2);
        };
      }
      return t2(key, values);
    };
    return {
      i18n,
      f(message, values, delimiters) {
        return i18n.f(message, values, delimiters);
      },
      t(key, values) {
        return t2(key, values);
      },
      add(locale2, message, override = true) {
        return i18n.add(locale2, message, override);
      },
      watch(fn) {
        return i18n.watchLocale(fn);
      },
      getLocale() {
        return i18n.getLocale();
      },
      setLocale(newLocale) {
        return i18n.setLocale(newLocale);
      }
    };
  }
  const en = {
    "uni-load-more.contentdown": "Pull up to show more",
    "uni-load-more.contentrefresh": "loading...",
    "uni-load-more.contentnomore": "No more data"
  };
  const zhHans = {
    "uni-load-more.contentdown": "上拉显示更多",
    "uni-load-more.contentrefresh": "正在加载...",
    "uni-load-more.contentnomore": "没有更多数据了"
  };
  const zhHant = {
    "uni-load-more.contentdown": "上拉顯示更多",
    "uni-load-more.contentrefresh": "正在加載...",
    "uni-load-more.contentnomore": "沒有更多數據了"
  };
  const messages = {
    en,
    "zh-Hans": zhHans,
    "zh-Hant": zhHant
  };
  let platform;
  setTimeout(() => {
    platform = uni.getSystemInfoSync().platform;
  }, 16);
  const {
    t
  } = initVueI18n(messages);
  const _sfc_main$u = {
    name: "UniLoadMore",
    emits: ["clickLoadMore"],
    props: {
      status: {
        // 上拉的状态：more-loading前；loading-loading中；noMore-没有更多了
        type: String,
        default: "more"
      },
      showIcon: {
        type: Boolean,
        default: true
      },
      iconType: {
        type: String,
        default: "auto"
      },
      iconSize: {
        type: Number,
        default: 24
      },
      color: {
        type: String,
        default: "#777777"
      },
      contentText: {
        type: Object,
        default() {
          return {
            contentdown: "",
            contentrefresh: "",
            contentnomore: ""
          };
        }
      },
      showText: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        webviewHide: false,
        platform,
        imgBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzlBMzU3OTlEOUM0MTFFOUI0NTZDNERBQURBQzI4RkUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzlBMzU3OUFEOUM0MTFFOUI0NTZDNERBQURBQzI4RkUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDOUEzNTc5N0Q5QzQxMUU5QjQ1NkM0REFBREFDMjhGRSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDOUEzNTc5OEQ5QzQxMUU5QjQ1NkM0REFBREFDMjhGRSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pt+ALSwAAA6CSURBVHja1FsLkFZVHb98LM+F5bHL8khA1iSeiyQBCRM+YGqKUnnJTDLGI0BGZlKDIU2MMglUiDApEZvSsZnQtBRJtKwQNKQMFYeRDR10WOLd8ljYXdh+v8v5fR3Od+797t1dnOnO/Ofce77z+J//+b/P+ZqtXbs2sJ9MJhNUV1cHJ06cCJo3bx7EPc2aNcvpy7pWrVoF+/fvDyoqKoI2bdoE9fX1F7TjN8a+EXBn/fkfvw942Tf+wYMHg9mzZwfjxo0LDhw4EPa1x2MbFw/fOGfPng1qa2tzcCkILsLDydq2bRsunpOTMM7TD/W/tZDZhPdeKD+yGxHhdu3aBV27dg3OnDlzMVANMheLAO3btw8KCwuDmpoaX5OxbgUIMEq7K8IcPnw4KCsrC/r37x8cP378/4cAXAB3vqSkJMuiDhTkw+XcuXNhOWbMmKBly5YhUT8xArhyFvP0BfwRsAuwxJZJsm/nzp2DTp06he/OU+cZ64K6o0ePBkOHDg2GDx8e6gEbJ5Q/NHNuAJQ1hgBeHUDlR7nVTkY8rQAvAi4z34vR/mPs1FoRsaCgIJThI0eOBC1atEiFGGV+5MiRoS45efJkqFjJFXV1dQuA012m2WcwTw98fy6CqBdsaiIO4CScrGPHjvk4odhavPquRtFWXEC25VgkREKOCh/qDSq+vn37htzD/mZTOmOc5U7zKzBPEedygWshcDyWvs30igAbU+6oyMgJBCFhwQE0fccxN60Ay9iebbjoDh06hMowjQxT4fXq1SskArmHZpkArvixp/kWzHdMeArExSJEaiXIjjRjRJ4DaAGWpibLzXN3Fm1vA5teBgh3j1Rv3bp1YgKwPdmf2p9zcyNYYgPKMfY0T5f5nNYdw158nJ8QawW4CLKwiOBSEgO/hok2eBydR+3dYH+PLxA5J8Vv0KBBwenTp0P2JWAx6+yFEBfs8lMY+y0SWMBNI9E4ThKi58VKTg3FQZS1RQF1cz27eC0QHMu+3E0SkUowjhVt5VdaWhp07949ZHv2Qd1EjDXM2cla1M0nl3GxAs3J9yREzyTdFVKVFOaE9qRA8GM0WebRuo9JGZKA7Mv2SeS/Z8+eoQ9BArMfFrLGo6jvxbhHbJZnKX2Rzz1O7QhJJ9Cs2ZMaWIyq/zhdeqPNfIoHd58clIQD+JSXl4dKlyIAuBdVXZwFVWKspSSoxE++h8x4k3uCnEhE4I5KwRiFWGOU0QWKiCYLbdoRMRKAu2kQ9vkfLU6dOhX06NEjlH+yMRZSinnuyWnYosVcji8CEA/6Cg2JF+IIUBqnGKUTCNwtwBN4f89RiK1R96DEgO2o0NDmtEdvVFdVVYV+P3UAPUEs6GFwV3PHmXkD4vh74iDFJysVI/MlaQhwKeBNTLYX5VuA8T4/gZxA4MRGFxDB6R7OmYPfyykGRJbyie+XnGYnQIC/coH9+vULiYrxrkL9ZA9+0ykaHIfEpM7ge8TiJ2CsHYwyMfafAF1yCGBHYIbCVDjDjKt7BeB51D+LgQa6OkG7IDYEEtvQ7lnXLKLtLdLuJBpE4gPUXcW2+PkZwOex+4cGDhwYDBkyRL7/HFcEwUGPo/8uWRUpYnfxGHco8HkewLHLyYmAawAPuIFZxhOpDfJQ8gbUv41yORAptMWBNr6oqMhWird5+u+iHmBb2nhjDV7HWBNQTgK8y11l5NetWzc5ULscAtSj7nbNI0skhWeUZCc0W4nyH/jO4Vz0u1IeYhbk4AiwM6tjxIWByHsoZ9qcIBPJd/y+DwPfBESOmCa/QF3WiZHucLlEDpNxcNhmheEOPgdQNx6/VZFQzFZ5TN08AHXQt2Ii3EdyFuUsPtTcGPhW5iMiCNELvz+Gdn9huG4HUJaW/w3g0wxV0XaG7arG2WeKiUWYM4Y7GO5ezshTARbbWGw/DvXkpp/ivVvE0JVoMxN4rpGzJMhE5Pl+xlATsDIqikP9F9D2z3h9nOksEUFhK+qO4rcPkoalMQ/HqJLIyb3F3JdjrCcw1yZ8joyJLR5gCo54etlag7qIoeNh1N1BRYj3DTFJ0elotxPlVzkGuYAmL0VSJVGAJA41c4Z6A3BzTLfn0HYwYKEI6CUAMzZEWvLsIcQOo1AmmyyM72nHJCfYsogflGV6jEk9vyQZXSuq6w4c16NsGcGZbwOPr+H1RkOk2LEzjNepxQkihHSCQ4ynAYNRx2zMKV92CQMWqj8J0BRE8EShxRFN6YrfCRhC0x3r/Zm4IbQCcmJoV0kMamllccR6FjHqUC5F2R/wS2dcymOlfAKOS4KmzQb5cpNC2MC7JhVn5wjXoJ44rYhLh8n0eXOCorJxa7POjbSlCGVczr34/RsAmrcvo9s+wGp3tzVhntxiXiJ4nvEYb4FJkf0O8HocAePmLvCxnL0AORraVekJk6TYjDabRVXfRE2lCN1h6ZQRN1+InUbsCpKwoBZHh0dODN9JBCUffItXxEavTQkUtnfTVAplCWL3JISz29h4NjotnuSsQKJCk8dF+kJR6RARjrqFVmfPnj3ZbK8cIJ0msd6jgHPGtfVTQ8VLmlvh4mct9sobRmPic0DyDQQnx/NlfYUgyz59+oScsH379pAwXABD32nTpoUHIToESeI5mnbE/UqDdyLcafEBf2MCqgC7NwxIbMREJQ0g4D4sfJwnD+AmRrII05cfMWJE+L1169bQr+fip06dGp4oJ83lmYd5wj/EmMa4TaHivo4EeCguYZBnkB5g2aWA69OIEnUHOaGysjIYMGBAMGnSpODYsWPZwCpFmm4lNq+4gSLQA7jcX8DwtjEyRC8wjabnXEx9kfWnTJkSJkAo90xpJVV+FmcVNeYAF5zWngS4C4O91MBxmAv8blLEpbjI5sz9MTdAhcgkCT1RO8mZkAjfiYpTEvStAS53Uw1vAiUGgZ3GpuQEYvoiBqlIan7kSDHnTwJQFNiPu0+5VxCVYhcZIjNrdXUDdp+Eq5AZ3Gkg8QAyVZRZIk4Tl4QAbF9cXJxNYZMAtAokgs4BrNxEpCtteXg7DDTMDKYNSuQdKsnJBek7HxewvxaosWxLYXtw+cJp18217wql4aKCfBNoEu0O5VU+PhctJ0YeXD4C6JQpyrlpSLTojpGGGN5YwNziChdIZLk4lvLcFJ9jMX3QdiImY9bmGQU+TRUL5CHITTRlgF8D9ouD1MfmLoEPl5xokIumZ2cfgMpHt47IW9N64Hsh7wQYYjyIugWuF5fCqYncXRd5vPMWyizzvhi/32+nvG0dZc9vR6fZOu0md5e+uC408FvKSIOZwXlGvxPv95izA2Vtvg1xKFWARI+vMX66HUhpQQb643uW1bSjuTWyw2SBvDrBvjFic1eGGlz5esq3ko9uSIlBRqPuFcCv8F4WIcN12nVaBd0SaYwI6PDDImR11JkqgHcPmQssjxIn6bUshygDFJUTxPMpHk+jfjPgupgdnYV2R/g7xSjtpah8RJBewhwf0gGK6XI92u4wXFEU40afJ4DN4h5LcAd+40HI3JgJecuT0c062W0i2hQJUTcxan3/CMW1PF2K6bbA+Daz4xRs1D3Br1Cm0OihKCqizW78/nXAF/G5TXrEcVzaNMH6CyMswqsAHqDyDLEyou8lwOXnKF8DjI6KjV3KzMBiXkDH8ij/H214J5A596ekrZ3F0zXlWeL7+P5eUrNo3/QwC15uxthuzidy7DzKRwEDaAViiDgKbTbz7CJnzo0bN7pIfIiid8SuPwn25o3QCmpnyjlZkyxPP8EomCJzrGb7GJMx7tNsq4MT2xMUYaiErZOluTzKsnz3gwCeCZyVRZJfYplNEokEjwrPtxlxjeYAk+F1F74VAzPxQRNYYdtpOUvWs8J1sGhBJMNsb7igN8plJs1eSmLIhLKE4rvaCX27gOhLpLOsIzJ7qn/i+wZzcvSOZ23/du8TZjwV8zHIXoP4R3ifBxiFz1dcVpa3aPntPE+c6TmIWE9EtcMmAcPdWAhYhAXxcLOQi9L1WhD1Sc8p1d2oL7XGiRKp8F4A2i8K/nfI+y/gsTDJ/YC/8+AD5Uh04KHiGl+cIFPnBDDrPMjwRGkLXyxO4VGbfQWnDH2v0bVWE3C9QOXlepbgjEfIJQI6XDG3z5ahD9cw2pS78ipB85wyScNTvsVzlzzhL8/jRrnmVjfFJK/m3m4nj9vbgQTguT8XZTjsm672R5uJKEaQmBI/c58gyus8ZDagLpEVSJBIyHp4jn++xqPV71OgQgJYEWOtZ/haxRtKmWOBu8xdBLftWltsY84zE6WIEy/eIOWL+BaayMx+KHtL7EAkqdNDLiEXmEMUHniedtJqg9HmZtfvt26vNi0BdG3Ft3g8ZOf7PAu59TxtzivLNIekyi+wD1i8CuUiD9FXAa8C+/xS3JPmZnomyc7H+fb4/Se0bk41Fel621r4cgVxbq91V4jVqwB7HTe2M7jgB+QWHavZkDRPmZcASoZEmBx6i75bGjPcMdL4/VKGFAGWZkGzPG0XAbdL9A81G5LOmUnC9hHKJeO7dcUMjblSl12867ElFTtaGl20xvvLGPdVz/8TVuU7y0x1PG7vtNg24oz9Uo/Z412++VFWI7Fcog9tu9Lm6gvRmIPv9x1xmQAu6RDkXtbOtlGEmpgD5Nvnyc0dcv0EE6cfdi1HmhMf9wDF3k3gtRvEedhxjpgfqPb9PU9iEJHnyOUA7bQUXh6kq/D7l2iTjWv7XOD530BDr8jIrus+srXjt4MzumJMHuTsBa63YKE1+RR5lBjEikCCnWKWiHdzOgKO+nRIBAF88za/IFmJ3eMZov4CYxGBabcpGL8EYx+SeMXJeRwHNsV/h+vdxeuhEpN3ZyNY78Gm2fknJxVGhyjixPiQvVkNzT1elD9Py/aTAL64Hb9vcYmC9zfdXdT/C1LeGbg4rnBaAihDFJH12W5ulfNCNe/xTsP3bp8ikzJs5BF+5PNfAQYAPaseTdsEcaYAAAAASUVORK5CYII="
      };
    },
    computed: {
      iconSnowWidth() {
        return (Math.floor(this.iconSize / 24) || 1) * 2;
      },
      contentdownText() {
        return this.contentText.contentdown || t("uni-load-more.contentdown");
      },
      contentrefreshText() {
        return this.contentText.contentrefresh || t("uni-load-more.contentrefresh");
      },
      contentnomoreText() {
        return this.contentText.contentnomore || t("uni-load-more.contentnomore");
      }
    },
    mounted() {
      var pages2 = getCurrentPages();
      var page2 = pages2[pages2.length - 1];
      var currentWebview = page2.$getAppWebview();
      currentWebview.addEventListener("hide", () => {
        this.webviewHide = true;
      });
      currentWebview.addEventListener("show", () => {
        this.webviewHide = false;
      });
    },
    methods: {
      onClick() {
        this.$emit("clickLoadMore", {
          detail: {
            status: this.status
          }
        });
      }
    }
  };
  function _sfc_render$t(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "uni-load-more",
      onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
    }, [
      !$data.webviewHide && ($props.iconType === "circle" || $props.iconType === "auto" && $data.platform === "android") && $props.status === "loading" && $props.showIcon ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          style: vue.normalizeStyle({ width: $props.iconSize + "px", height: $props.iconSize + "px" }),
          class: "uni-load-more__img uni-load-more__img--android-MP"
        },
        [
          vue.createElementVNode(
            "view",
            {
              class: "uni-load-more__img-icon",
              style: vue.normalizeStyle({ borderTopColor: $props.color, borderTopWidth: $props.iconSize / 12 })
            },
            null,
            4
            /* STYLE */
          ),
          vue.createElementVNode(
            "view",
            {
              class: "uni-load-more__img-icon",
              style: vue.normalizeStyle({ borderTopColor: $props.color, borderTopWidth: $props.iconSize / 12 })
            },
            null,
            4
            /* STYLE */
          ),
          vue.createElementVNode(
            "view",
            {
              class: "uni-load-more__img-icon",
              style: vue.normalizeStyle({ borderTopColor: $props.color, borderTopWidth: $props.iconSize / 12 })
            },
            null,
            4
            /* STYLE */
          )
        ],
        4
        /* STYLE */
      )) : !$data.webviewHide && $props.status === "loading" && $props.showIcon ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 1,
          style: vue.normalizeStyle({ width: $props.iconSize + "px", height: $props.iconSize + "px" }),
          class: "uni-load-more__img uni-load-more__img--ios-H5"
        },
        [
          vue.createElementVNode("image", {
            src: $data.imgBase64,
            mode: "widthFix"
          }, null, 8, ["src"])
        ],
        4
        /* STYLE */
      )) : vue.createCommentVNode("v-if", true),
      $props.showText ? (vue.openBlock(), vue.createElementBlock(
        "text",
        {
          key: 2,
          class: "uni-load-more__text",
          style: vue.normalizeStyle({ color: $props.color })
        },
        vue.toDisplayString($props.status === "more" ? $options.contentdownText : $props.status === "loading" ? $options.contentrefreshText : $options.contentnomoreText),
        5
        /* TEXT, STYLE */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$u, [["render", _sfc_render$t], ["__scopeId", "data-v-9245e42c"], ["__file", "D:/project/dlw/uniapp-dileiwo/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue"]]);
  const _sfc_main$t = {
    name: "uniDataChecklist",
    mixins: [nr.mixinDatacom || {}],
    emits: ["input", "update:modelValue", "change"],
    props: {
      mode: {
        type: String,
        default: "default"
      },
      multiple: {
        type: Boolean,
        default: false
      },
      value: {
        type: [Array, String, Number],
        default() {
          return "";
        }
      },
      // TODO vue3
      modelValue: {
        type: [Array, String, Number],
        default() {
          return "";
        }
      },
      localdata: {
        type: Array,
        default() {
          return [];
        }
      },
      min: {
        type: [Number, String],
        default: ""
      },
      max: {
        type: [Number, String],
        default: ""
      },
      wrap: {
        type: Boolean,
        default: false
      },
      icon: {
        type: String,
        default: "left"
      },
      selectedColor: {
        type: String,
        default: ""
      },
      selectedTextColor: {
        type: String,
        default: ""
      },
      emptyText: {
        type: String,
        default: "暂无数据"
      },
      disabled: {
        type: Boolean,
        default: false
      },
      map: {
        type: Object,
        default() {
          return {
            text: "text",
            value: "value"
          };
        }
      }
    },
    watch: {
      localdata: {
        handler(newVal) {
          this.range = newVal;
          this.dataList = this.getDataList(this.getSelectedValue(newVal));
        },
        deep: true
      },
      mixinDatacomResData(newVal) {
        this.range = newVal;
        this.dataList = this.getDataList(this.getSelectedValue(newVal));
      },
      value(newVal) {
        this.dataList = this.getDataList(newVal);
      },
      modelValue(newVal) {
        this.dataList = this.getDataList(newVal);
      }
    },
    data() {
      return {
        dataList: [],
        range: [],
        contentText: {
          contentdown: "查看更多",
          contentrefresh: "加载中",
          contentnomore: "没有更多"
        },
        isLocal: true,
        styles: {
          selectedColor: "#2979ff",
          selectedTextColor: "#666"
        },
        isTop: 0
      };
    },
    computed: {
      dataValue() {
        if (this.value === "")
          return this.modelValue;
        if (this.modelValue === "")
          return this.value;
        return this.value;
      }
    },
    created() {
      if (this.localdata && this.localdata.length !== 0) {
        this.isLocal = true;
        this.range = this.localdata;
        this.dataList = this.getDataList(this.getSelectedValue(this.range));
      } else {
        if (this.collection) {
          this.isLocal = false;
          this.loadData();
        }
      }
    },
    methods: {
      loadData() {
        this.mixinDatacomGet().then((res2) => {
          this.mixinDatacomResData = res2.result.data;
          if (this.mixinDatacomResData.length === 0) {
            this.isLocal = false;
            this.mixinDatacomErrorMessage = this.emptyText;
          } else {
            this.isLocal = true;
          }
        }).catch((err) => {
          this.mixinDatacomErrorMessage = err.message;
        });
      },
      /**
       * 获取父元素实例
       */
      getForm(name = "uniForms") {
        let parent = this.$parent;
        let parentName = parent.$options.name;
        while (parentName !== name) {
          parent = parent.$parent;
          if (!parent)
            return false;
          parentName = parent.$options.name;
        }
        return parent;
      },
      change(e2) {
        const values = e2.detail.value;
        let detail = {
          value: [],
          data: []
        };
        if (this.multiple) {
          this.range.forEach((item) => {
            if (values.includes(item[this.map.value] + "")) {
              detail.value.push(item[this.map.value]);
              detail.data.push(item);
            }
          });
        } else {
          const range = this.range.find((item) => item[this.map.value] + "" === values);
          if (range) {
            detail = {
              value: range[this.map.value],
              data: range
            };
          }
        }
        this.$emit("input", detail.value);
        this.$emit("update:modelValue", detail.value);
        this.$emit("change", {
          detail
        });
        if (this.multiple) {
          this.dataList = this.getDataList(detail.value, true);
        } else {
          this.dataList = this.getDataList(detail.value);
        }
      },
      /**
       * 获取渲染的新数组
       * @param {Object} value 选中内容
       */
      getDataList(value) {
        let dataList = JSON.parse(JSON.stringify(this.range));
        let list = [];
        if (this.multiple) {
          if (!Array.isArray(value)) {
            value = [];
          }
        } else {
          if (Array.isArray(value) && value.length) {
            value = value[0];
          }
        }
        dataList.forEach((item, index2) => {
          item.disabled = item.disable || item.disabled || false;
          if (this.multiple) {
            if (value.length > 0) {
              let have = value.find((val) => val === item[this.map.value]);
              item.selected = have !== void 0;
            } else {
              item.selected = false;
            }
          } else {
            item.selected = value === item[this.map.value];
          }
          list.push(item);
        });
        return this.setRange(list);
      },
      /**
       * 处理最大最小值
       * @param {Object} list
       */
      setRange(list) {
        let selectList = list.filter((item) => item.selected);
        let min = Number(this.min) || 0;
        let max = Number(this.max) || "";
        list.forEach((item, index2) => {
          if (this.multiple) {
            if (selectList.length <= min) {
              let have = selectList.find((val) => val[this.map.value] === item[this.map.value]);
              if (have !== void 0) {
                item.disabled = true;
              }
            }
            if (selectList.length >= max && max !== "") {
              let have = selectList.find((val) => val[this.map.value] === item[this.map.value]);
              if (have === void 0) {
                item.disabled = true;
              }
            }
          }
          this.setStyles(item, index2);
          list[index2] = item;
        });
        return list;
      },
      /**
       * 设置 class
       * @param {Object} item
       * @param {Object} index
       */
      setStyles(item, index2) {
        item.styleBackgroud = this.setStyleBackgroud(item);
        item.styleIcon = this.setStyleIcon(item);
        item.styleIconText = this.setStyleIconText(item);
        item.styleRightIcon = this.setStyleRightIcon(item);
      },
      /**
       * 获取选中值
       * @param {Object} range
       */
      getSelectedValue(range) {
        if (!this.multiple)
          return this.dataValue;
        let selectedArr = [];
        range.forEach((item) => {
          if (item.selected) {
            selectedArr.push(item[this.map.value]);
          }
        });
        return this.dataValue.length > 0 ? this.dataValue : selectedArr;
      },
      /**
       * 设置背景样式
       */
      setStyleBackgroud(item) {
        let styles = {};
        let selectedColor = this.selectedColor ? this.selectedColor : "#2979ff";
        if (this.selectedColor) {
          if (this.mode !== "list") {
            styles["border-color"] = item.selected ? selectedColor : "#DCDFE6";
          }
          if (this.mode === "tag") {
            styles["background-color"] = item.selected ? selectedColor : "#f5f5f5";
          }
        }
        let classles = "";
        for (let i2 in styles) {
          classles += `${i2}:${styles[i2]};`;
        }
        return classles;
      },
      setStyleIcon(item) {
        let styles = {};
        let classles = "";
        if (this.selectedColor) {
          let selectedColor = this.selectedColor ? this.selectedColor : "#2979ff";
          styles["background-color"] = item.selected ? selectedColor : "#fff";
          styles["border-color"] = item.selected ? selectedColor : "#DCDFE6";
          if (!item.selected && item.disabled) {
            styles["background-color"] = "#F2F6FC";
            styles["border-color"] = item.selected ? selectedColor : "#DCDFE6";
          }
        }
        for (let i2 in styles) {
          classles += `${i2}:${styles[i2]};`;
        }
        return classles;
      },
      setStyleIconText(item) {
        let styles = {};
        let classles = "";
        if (this.selectedColor) {
          let selectedColor = this.selectedColor ? this.selectedColor : "#2979ff";
          if (this.mode === "tag") {
            styles.color = item.selected ? this.selectedTextColor ? this.selectedTextColor : "#fff" : "#666";
          } else {
            styles.color = item.selected ? this.selectedTextColor ? this.selectedTextColor : selectedColor : "#666";
          }
          if (!item.selected && item.disabled) {
            styles.color = "#999";
          }
        }
        for (let i2 in styles) {
          classles += `${i2}:${styles[i2]};`;
        }
        return classles;
      },
      setStyleRightIcon(item) {
        let styles = {};
        let classles = "";
        if (this.mode === "list") {
          styles["border-color"] = item.selected ? this.styles.selectedColor : "#DCDFE6";
        }
        for (let i2 in styles) {
          classles += `${i2}:${styles[i2]};`;
        }
        return classles;
      }
    }
  };
  function _sfc_render$s(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_load_more = resolveEasycom(vue.resolveDynamicComponent("uni-load-more"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "uni-data-checklist",
        style: vue.normalizeStyle({ "margin-top": $data.isTop + "px" })
      },
      [
        !$data.isLocal ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "uni-data-loading"
        }, [
          !_ctx.mixinDatacomErrorMessage ? (vue.openBlock(), vue.createBlock(_component_uni_load_more, {
            key: 0,
            status: "loading",
            iconType: "snow",
            iconSize: 18,
            "content-text": $data.contentText
          }, null, 8, ["content-text"])) : (vue.openBlock(), vue.createElementBlock(
            "text",
            { key: 1 },
            vue.toDisplayString(_ctx.mixinDatacomErrorMessage),
            1
            /* TEXT */
          ))
        ])) : (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 1 },
          [
            $props.multiple ? (vue.openBlock(), vue.createElementBlock(
              "checkbox-group",
              {
                key: 0,
                class: vue.normalizeClass(["checklist-group", { "is-list": $props.mode === "list" || $props.wrap }]),
                onChange: _cache[0] || (_cache[0] = (...args) => $options.change && $options.change(...args))
              },
              [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.dataList, (item, index2) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "label",
                      {
                        class: vue.normalizeClass(["checklist-box", ["is--" + $props.mode, item.selected ? "is-checked" : "", $props.disabled || !!item.disabled ? "is-disable" : "", index2 !== 0 && $props.mode === "list" ? "is-list-border" : ""]]),
                        style: vue.normalizeStyle(item.styleBackgroud),
                        key: index2
                      },
                      [
                        vue.createElementVNode("checkbox", {
                          class: "hidden",
                          hidden: "",
                          disabled: $props.disabled || !!item.disabled,
                          value: item[$props.map.value] + "",
                          checked: item.selected
                        }, null, 8, ["disabled", "value", "checked"]),
                        $props.mode !== "tag" && $props.mode !== "list" || $props.mode === "list" && $props.icon === "left" ? (vue.openBlock(), vue.createElementBlock(
                          "view",
                          {
                            key: 0,
                            class: "checkbox__inner",
                            style: vue.normalizeStyle(item.styleIcon)
                          },
                          [
                            vue.createElementVNode("view", { class: "checkbox__inner-icon" })
                          ],
                          4
                          /* STYLE */
                        )) : vue.createCommentVNode("v-if", true),
                        vue.createElementVNode(
                          "view",
                          {
                            class: vue.normalizeClass(["checklist-content", { "list-content": $props.mode === "list" && $props.icon === "left" }])
                          },
                          [
                            vue.createElementVNode(
                              "text",
                              {
                                class: "checklist-text",
                                style: vue.normalizeStyle(item.styleIconText)
                              },
                              vue.toDisplayString(item[$props.map.text]),
                              5
                              /* TEXT, STYLE */
                            ),
                            $props.mode === "list" && $props.icon === "right" ? (vue.openBlock(), vue.createElementBlock(
                              "view",
                              {
                                key: 0,
                                class: "checkobx__list",
                                style: vue.normalizeStyle(item.styleBackgroud)
                              },
                              null,
                              4
                              /* STYLE */
                            )) : vue.createCommentVNode("v-if", true)
                          ],
                          2
                          /* CLASS */
                        )
                      ],
                      6
                      /* CLASS, STYLE */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              34
              /* CLASS, NEED_HYDRATION */
            )) : (vue.openBlock(), vue.createElementBlock(
              "radio-group",
              {
                key: 1,
                class: vue.normalizeClass(["checklist-group", { "is-list": $props.mode === "list", "is-wrap": $props.wrap }]),
                onChange: _cache[1] || (_cache[1] = (...args) => $options.change && $options.change(...args))
              },
              [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.dataList, (item, index2) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "label",
                      {
                        class: vue.normalizeClass(["checklist-box", ["is--" + $props.mode, item.selected ? "is-checked" : "", $props.disabled || !!item.disabled ? "is-disable" : "", index2 !== 0 && $props.mode === "list" ? "is-list-border" : ""]]),
                        style: vue.normalizeStyle(item.styleBackgroud),
                        key: index2
                      },
                      [
                        vue.createElementVNode("radio", {
                          class: "hidden",
                          hidden: "",
                          disabled: $props.disabled || item.disabled,
                          value: item[$props.map.value] + "",
                          checked: item.selected
                        }, null, 8, ["disabled", "value", "checked"]),
                        $props.mode !== "tag" && $props.mode !== "list" || $props.mode === "list" && $props.icon === "left" ? (vue.openBlock(), vue.createElementBlock(
                          "view",
                          {
                            key: 0,
                            class: "radio__inner",
                            style: vue.normalizeStyle(item.styleBackgroud)
                          },
                          [
                            vue.createElementVNode(
                              "view",
                              {
                                class: "radio__inner-icon",
                                style: vue.normalizeStyle(item.styleIcon)
                              },
                              null,
                              4
                              /* STYLE */
                            )
                          ],
                          4
                          /* STYLE */
                        )) : vue.createCommentVNode("v-if", true),
                        vue.createElementVNode(
                          "view",
                          {
                            class: vue.normalizeClass(["checklist-content", { "list-content": $props.mode === "list" && $props.icon === "left" }])
                          },
                          [
                            vue.createElementVNode(
                              "text",
                              {
                                class: "checklist-text",
                                style: vue.normalizeStyle(item.styleIconText)
                              },
                              vue.toDisplayString(item[$props.map.text]),
                              5
                              /* TEXT, STYLE */
                            ),
                            $props.mode === "list" && $props.icon === "right" ? (vue.openBlock(), vue.createElementBlock(
                              "view",
                              {
                                key: 0,
                                style: vue.normalizeStyle(item.styleRightIcon),
                                class: "checkobx__list"
                              },
                              null,
                              4
                              /* STYLE */
                            )) : vue.createCommentVNode("v-if", true)
                          ],
                          2
                          /* CLASS */
                        )
                      ],
                      6
                      /* CLASS, STYLE */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              34
              /* CLASS, NEED_HYDRATION */
            ))
          ],
          64
          /* STABLE_FRAGMENT */
        ))
      ],
      4
      /* STYLE */
    );
  }
  const __easycom_2 = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["render", _sfc_render$s], ["__scopeId", "data-v-2f788efd"], ["__file", "D:/project/dlw/uniapp-dileiwo/uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.vue"]]);
  class MPAnimation {
    constructor(options, _this) {
      this.options = options;
      this.animation = uni.createAnimation({
        ...options
      });
      this.currentStepAnimates = {};
      this.next = 0;
      this.$ = _this;
    }
    _nvuePushAnimates(type, args) {
      let aniObj = this.currentStepAnimates[this.next];
      let styles = {};
      if (!aniObj) {
        styles = {
          styles: {},
          config: {}
        };
      } else {
        styles = aniObj;
      }
      if (animateTypes1.includes(type)) {
        if (!styles.styles.transform) {
          styles.styles.transform = "";
        }
        let unit = "";
        if (type === "rotate") {
          unit = "deg";
        }
        styles.styles.transform += `${type}(${args + unit}) `;
      } else {
        styles.styles[type] = `${args}`;
      }
      this.currentStepAnimates[this.next] = styles;
    }
    _animateRun(styles = {}, config = {}) {
      let ref = this.$.$refs["ani"].ref;
      if (!ref)
        return;
      return new Promise((resolve, reject) => {
        nvueAnimation.transition(ref, {
          styles,
          ...config
        }, (res2) => {
          resolve();
        });
      });
    }
    _nvueNextAnimate(animates, step = 0, fn) {
      let obj = animates[step];
      if (obj) {
        let {
          styles,
          config
        } = obj;
        this._animateRun(styles, config).then(() => {
          step += 1;
          this._nvueNextAnimate(animates, step, fn);
        });
      } else {
        this.currentStepAnimates = {};
        typeof fn === "function" && fn();
        this.isEnd = true;
      }
    }
    step(config = {}) {
      this.animation.step(config);
      return this;
    }
    run(fn) {
      this.$.animationData = this.animation.export();
      this.$.timer = setTimeout(() => {
        typeof fn === "function" && fn();
      }, this.$.durationTime);
    }
  }
  const animateTypes1 = [
    "matrix",
    "matrix3d",
    "rotate",
    "rotate3d",
    "rotateX",
    "rotateY",
    "rotateZ",
    "scale",
    "scale3d",
    "scaleX",
    "scaleY",
    "scaleZ",
    "skew",
    "skewX",
    "skewY",
    "translate",
    "translate3d",
    "translateX",
    "translateY",
    "translateZ"
  ];
  const animateTypes2 = ["opacity", "backgroundColor"];
  const animateTypes3 = ["width", "height", "left", "right", "top", "bottom"];
  animateTypes1.concat(animateTypes2, animateTypes3).forEach((type) => {
    MPAnimation.prototype[type] = function(...args) {
      this.animation[type](...args);
      return this;
    };
  });
  function createAnimation(option, _this) {
    if (!_this)
      return;
    clearTimeout(_this.timer);
    return new MPAnimation(option, _this);
  }
  const _sfc_main$s = {
    name: "uniTransition",
    emits: ["click", "change"],
    props: {
      show: {
        type: Boolean,
        default: false
      },
      modeClass: {
        type: [Array, String],
        default() {
          return "fade";
        }
      },
      duration: {
        type: Number,
        default: 300
      },
      styles: {
        type: Object,
        default() {
          return {};
        }
      },
      customClass: {
        type: String,
        default: ""
      },
      onceRender: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isShow: false,
        transform: "",
        opacity: 1,
        animationData: {},
        durationTime: 300,
        config: {}
      };
    },
    watch: {
      show: {
        handler(newVal) {
          if (newVal) {
            this.open();
          } else {
            if (this.isShow) {
              this.close();
            }
          }
        },
        immediate: true
      }
    },
    computed: {
      // 生成样式数据
      stylesObject() {
        let styles = {
          ...this.styles,
          "transition-duration": this.duration / 1e3 + "s"
        };
        let transform = "";
        for (let i2 in styles) {
          let line = this.toLine(i2);
          transform += line + ":" + styles[i2] + ";";
        }
        return transform;
      },
      // 初始化动画条件
      transformStyles() {
        return "transform:" + this.transform + ";opacity:" + this.opacity + ";" + this.stylesObject;
      }
    },
    created() {
      this.config = {
        duration: this.duration,
        timingFunction: "ease",
        transformOrigin: "50% 50%",
        delay: 0
      };
      this.durationTime = this.duration;
    },
    methods: {
      /**
       *  ref 触发 初始化动画
       */
      init(obj = {}) {
        if (obj.duration) {
          this.durationTime = obj.duration;
        }
        this.animation = createAnimation(Object.assign(this.config, obj), this);
      },
      /**
       * 点击组件触发回调
       */
      onClick() {
        this.$emit("click", {
          detail: this.isShow
        });
      },
      /**
       * ref 触发 动画分组
       * @param {Object} obj
       */
      step(obj, config = {}) {
        if (!this.animation)
          return;
        for (let i2 in obj) {
          try {
            if (typeof obj[i2] === "object") {
              this.animation[i2](...obj[i2]);
            } else {
              this.animation[i2](obj[i2]);
            }
          } catch (e2) {
            formatAppLog("error", "at uni_modules/uni-transition/components/uni-transition/uni-transition.vue:148", `方法 ${i2} 不存在`);
          }
        }
        this.animation.step(config);
        return this;
      },
      /**
       *  ref 触发 执行动画
       */
      run(fn) {
        if (!this.animation)
          return;
        this.animation.run(fn);
      },
      // 开始过度动画
      open() {
        clearTimeout(this.timer);
        this.transform = "";
        this.isShow = true;
        let { opacity, transform } = this.styleInit(false);
        if (typeof opacity !== "undefined") {
          this.opacity = opacity;
        }
        this.transform = transform;
        this.$nextTick(() => {
          this.timer = setTimeout(() => {
            this.animation = createAnimation(this.config, this);
            this.tranfromInit(false).step();
            this.animation.run();
            this.$emit("change", {
              detail: this.isShow
            });
          }, 20);
        });
      },
      // 关闭过度动画
      close(type) {
        if (!this.animation)
          return;
        this.tranfromInit(true).step().run(() => {
          this.isShow = false;
          this.animationData = null;
          this.animation = null;
          let { opacity, transform } = this.styleInit(false);
          this.opacity = opacity || 1;
          this.transform = transform;
          this.$emit("change", {
            detail: this.isShow
          });
        });
      },
      // 处理动画开始前的默认样式
      styleInit(type) {
        let styles = {
          transform: ""
        };
        let buildStyle = (type2, mode) => {
          if (mode === "fade") {
            styles.opacity = this.animationType(type2)[mode];
          } else {
            styles.transform += this.animationType(type2)[mode] + " ";
          }
        };
        if (typeof this.modeClass === "string") {
          buildStyle(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildStyle(type, mode);
          });
        }
        return styles;
      },
      // 处理内置组合动画
      tranfromInit(type) {
        let buildTranfrom = (type2, mode) => {
          let aniNum = null;
          if (mode === "fade") {
            aniNum = type2 ? 0 : 1;
          } else {
            aniNum = type2 ? "-100%" : "0";
            if (mode === "zoom-in") {
              aniNum = type2 ? 0.8 : 1;
            }
            if (mode === "zoom-out") {
              aniNum = type2 ? 1.2 : 1;
            }
            if (mode === "slide-right") {
              aniNum = type2 ? "100%" : "0";
            }
            if (mode === "slide-bottom") {
              aniNum = type2 ? "100%" : "0";
            }
          }
          this.animation[this.animationMode()[mode]](aniNum);
        };
        if (typeof this.modeClass === "string") {
          buildTranfrom(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildTranfrom(type, mode);
          });
        }
        return this.animation;
      },
      animationType(type) {
        return {
          fade: type ? 0 : 1,
          "slide-top": `translateY(${type ? "0" : "-100%"})`,
          "slide-right": `translateX(${type ? "0" : "100%"})`,
          "slide-bottom": `translateY(${type ? "0" : "100%"})`,
          "slide-left": `translateX(${type ? "0" : "-100%"})`,
          "zoom-in": `scaleX(${type ? 1 : 0.8}) scaleY(${type ? 1 : 0.8})`,
          "zoom-out": `scaleX(${type ? 1 : 1.2}) scaleY(${type ? 1 : 1.2})`
        };
      },
      // 内置动画类型与实际动画对应字典
      animationMode() {
        return {
          fade: "opacity",
          "slide-top": "translateY",
          "slide-right": "translateX",
          "slide-bottom": "translateY",
          "slide-left": "translateX",
          "zoom-in": "scale",
          "zoom-out": "scale"
        };
      },
      // 驼峰转中横线
      toLine(name) {
        return name.replace(/([A-Z])/g, "-$1").toLowerCase();
      }
    }
  };
  function _sfc_render$r(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.withDirectives((vue.openBlock(), vue.createElementBlock("view", {
      ref: "ani",
      animation: $data.animationData,
      class: vue.normalizeClass($props.customClass),
      style: vue.normalizeStyle($options.transformStyles),
      onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
    }, [
      vue.renderSlot(_ctx.$slots, "default")
    ], 14, ["animation"])), [
      [vue.vShow, $data.isShow]
    ]);
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["render", _sfc_render$r], ["__file", "D:/project/dlw/uniapp-dileiwo/uni_modules/uni-transition/components/uni-transition/uni-transition.vue"]]);
  const _sfc_main$r = {
    name: "uniPopup",
    components: {},
    emits: ["change", "maskClick"],
    props: {
      // 开启动画
      animation: {
        type: Boolean,
        default: true
      },
      // 弹出层类型，可选值，top: 顶部弹出层；bottom：底部弹出层；center：全屏弹出层
      // message: 消息提示 ; dialog : 对话框
      type: {
        type: String,
        default: "center"
      },
      // maskClick
      isMaskClick: {
        type: Boolean,
        default: null
      },
      // TODO 2 个版本后废弃属性 ，使用 isMaskClick
      maskClick: {
        type: Boolean,
        default: null
      },
      backgroundColor: {
        type: String,
        default: "none"
      },
      safeArea: {
        type: Boolean,
        default: true
      },
      maskBackgroundColor: {
        type: String,
        default: "rgba(0, 0, 0, 0.4)"
      },
      borderRadius: {
        type: String
      }
    },
    watch: {
      /**
       * 监听type类型
       */
      type: {
        handler: function(type) {
          if (!this.config[type])
            return;
          this[this.config[type]](true);
        },
        immediate: true
      },
      isDesktop: {
        handler: function(newVal) {
          if (!this.config[newVal])
            return;
          this[this.config[this.type]](true);
        },
        immediate: true
      },
      /**
       * 监听遮罩是否可点击
       * @param {Object} val
       */
      maskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      isMaskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      // H5 下禁止底部滚动
      showPopup(show) {
      }
    },
    data() {
      return {
        duration: 300,
        ani: [],
        showPopup: false,
        showTrans: false,
        popupWidth: 0,
        popupHeight: 0,
        config: {
          top: "top",
          bottom: "bottom",
          center: "center",
          left: "left",
          right: "right",
          message: "top",
          dialog: "center",
          share: "bottom"
        },
        maskClass: {
          position: "fixed",
          bottom: 0,
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)"
        },
        transClass: {
          backgroundColor: "transparent",
          borderRadius: this.borderRadius || "0",
          position: "fixed",
          left: 0,
          right: 0
        },
        maskShow: true,
        mkclick: true,
        popupstyle: "top"
      };
    },
    computed: {
      getStyles() {
        let res2 = { backgroundColor: this.bg };
        if (this.borderRadius || "0") {
          res2 = Object.assign(res2, { borderRadius: this.borderRadius });
        }
        return res2;
      },
      isDesktop() {
        return this.popupWidth >= 500 && this.popupHeight >= 500;
      },
      bg() {
        if (this.backgroundColor === "" || this.backgroundColor === "none") {
          return "transparent";
        }
        return this.backgroundColor;
      }
    },
    mounted() {
      const fixSize = () => {
        const {
          windowWidth,
          windowHeight,
          windowTop,
          safeArea,
          screenHeight,
          safeAreaInsets
        } = uni.getSystemInfoSync();
        this.popupWidth = windowWidth;
        this.popupHeight = windowHeight + (windowTop || 0);
        if (safeArea && this.safeArea) {
          this.safeAreaInsets = safeAreaInsets.bottom;
        } else {
          this.safeAreaInsets = 0;
        }
      };
      fixSize();
    },
    // TODO vue3
    unmounted() {
      this.setH5Visible();
    },
    activated() {
      this.setH5Visible(!this.showPopup);
    },
    deactivated() {
      this.setH5Visible(true);
    },
    created() {
      if (this.isMaskClick === null && this.maskClick === null) {
        this.mkclick = true;
      } else {
        this.mkclick = this.isMaskClick !== null ? this.isMaskClick : this.maskClick;
      }
      if (this.animation) {
        this.duration = 300;
      } else {
        this.duration = 0;
      }
      this.messageChild = null;
      this.clearPropagation = false;
      this.maskClass.backgroundColor = this.maskBackgroundColor;
    },
    methods: {
      setH5Visible(visible = true) {
      },
      /**
       * 公用方法，不显示遮罩层
       */
      closeMask() {
        this.maskShow = false;
      },
      /**
       * 公用方法，遮罩层禁止点击
       */
      disableMask() {
        this.mkclick = false;
      },
      // TODO nvue 取消冒泡
      clear(e2) {
        e2.stopPropagation();
        this.clearPropagation = true;
      },
      open(direction) {
        if (this.showPopup) {
          return;
        }
        let innerType = ["top", "center", "bottom", "left", "right", "message", "dialog", "share"];
        if (!(direction && innerType.indexOf(direction) !== -1)) {
          direction = this.type;
        }
        if (!this.config[direction]) {
          formatAppLog("error", "at uni_modules/uni-popup/components/uni-popup/uni-popup.vue:310", "缺少类型：", direction);
          return;
        }
        this[this.config[direction]]();
        this.$emit("change", {
          show: true,
          type: direction
        });
      },
      close(type) {
        this.showTrans = false;
        this.$emit("change", {
          show: false,
          type: this.type
        });
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.showPopup = false;
        }, 300);
      },
      // TODO 处理冒泡事件，头条的冒泡事件有问题 ，先这样兼容
      touchstart() {
        this.clearPropagation = false;
      },
      onTap() {
        if (this.clearPropagation) {
          this.clearPropagation = false;
          return;
        }
        this.$emit("maskClick");
        if (!this.mkclick)
          return;
        this.close();
      },
      /**
       * 顶部弹出样式处理
       */
      top(type) {
        this.popupstyle = this.isDesktop ? "fixforpc-top" : "top";
        this.ani = ["slide-top"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
        this.$nextTick(() => {
          this.showPoptrans();
          if (this.messageChild && this.type === "message") {
            this.messageChild.timerClose();
          }
        });
      },
      /**
       * 底部弹出样式处理
       */
      bottom(type) {
        this.popupstyle = "bottom";
        this.ani = ["slide-bottom"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: this.safeAreaInsets + "px",
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      /**
       * 中间弹出样式处理
       */
      center(type) {
        this.popupstyle = "center";
        this.ani = ["zoom-out", "fade"];
        this.transClass = {
          position: "fixed",
          display: "flex",
          flexDirection: "column",
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      left(type) {
        this.popupstyle = "left";
        this.ani = ["slide-left"];
        this.transClass = {
          position: "fixed",
          left: 0,
          bottom: 0,
          top: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0",
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      right(type) {
        this.popupstyle = "right";
        this.ani = ["slide-right"];
        this.transClass = {
          position: "fixed",
          bottom: 0,
          right: 0,
          top: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0",
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      showPoptrans() {
        this.$nextTick(() => {
          this.showPopup = true;
          this.showTrans = true;
        });
      }
    }
  };
  function _sfc_render$q(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_transition = resolveEasycom(vue.resolveDynamicComponent("uni-transition"), __easycom_0$1);
    return $data.showPopup ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: vue.normalizeClass(["uni-popup", [$data.popupstyle, $options.isDesktop ? "fixforpc-z-index" : ""]])
      },
      [
        vue.createElementVNode(
          "view",
          {
            onTouchstart: _cache[1] || (_cache[1] = (...args) => $options.touchstart && $options.touchstart(...args))
          },
          [
            $data.maskShow ? (vue.openBlock(), vue.createBlock(_component_uni_transition, {
              key: "1",
              name: "mask",
              "mode-class": "fade",
              styles: $data.maskClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, null, 8, ["styles", "duration", "show", "onClick"])) : vue.createCommentVNode("v-if", true),
            vue.createVNode(_component_uni_transition, {
              key: "2",
              "mode-class": $data.ani,
              name: "content",
              styles: $data.transClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["uni-popup__wrapper", [$data.popupstyle]]),
                    style: vue.normalizeStyle($options.getStyles),
                    onClick: _cache[0] || (_cache[0] = (...args) => $options.clear && $options.clear(...args))
                  },
                  [
                    vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
                  ],
                  6
                  /* CLASS, STYLE */
                )
              ]),
              _: 3
              /* FORWARDED */
            }, 8, ["mode-class", "styles", "duration", "show", "onClick"])
          ],
          32
          /* NEED_HYDRATION */
        )
      ],
      2
      /* CLASS */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_3 = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["render", _sfc_render$q], ["__scopeId", "data-v-4dd3c44b"], ["__file", "D:/project/dlw/uniapp-dileiwo/uni_modules/uni-popup/components/uni-popup/uni-popup.vue"]]);
  var isIOS;
  function album() {
    var result = 0;
    var PHPhotoLibrary = plus.ios.import("PHPhotoLibrary");
    var authStatus = PHPhotoLibrary.authorizationStatus();
    if (authStatus === 0) {
      result = null;
    } else if (authStatus == 3) {
      result = 1;
    } else {
      result = 0;
    }
    plus.ios.deleteObject(PHPhotoLibrary);
    return result;
  }
  function camera() {
    var result = 0;
    var AVCaptureDevice = plus.ios.import("AVCaptureDevice");
    var authStatus = AVCaptureDevice.authorizationStatusForMediaType("vide");
    if (authStatus === 0) {
      result = null;
    } else if (authStatus == 3) {
      result = 1;
    } else {
      result = 0;
    }
    plus.ios.deleteObject(AVCaptureDevice);
    return result;
  }
  function location$1() {
    var result = 0;
    var cllocationManger = plus.ios.import("CLLocationManager");
    var enable = cllocationManger.locationServicesEnabled();
    var status = cllocationManger.authorizationStatus();
    if (!enable) {
      result = 2;
    } else if (status === 0) {
      result = null;
    } else if (status === 3 || status === 4) {
      result = 1;
    } else {
      result = 0;
    }
    plus.ios.deleteObject(cllocationManger);
    return result;
  }
  function push() {
    var result = 0;
    var UIApplication = plus.ios.import("UIApplication");
    var app = UIApplication.sharedApplication();
    var enabledTypes = 0;
    if (app.currentUserNotificationSettings) {
      var settings = app.currentUserNotificationSettings();
      enabledTypes = settings.plusGetAttribute("types");
      if (enabledTypes == 0) {
        result = 0;
        formatAppLog("log", "at common/permission.js:63", "推送权限没有开启");
      } else {
        result = 1;
        formatAppLog("log", "at common/permission.js:66", "已经开启推送功能!");
      }
      plus.ios.deleteObject(settings);
    } else {
      enabledTypes = app.enabledRemoteNotificationTypes();
      if (enabledTypes == 0) {
        result = 3;
        formatAppLog("log", "at common/permission.js:73", "推送权限没有开启!");
      } else {
        result = 4;
        formatAppLog("log", "at common/permission.js:76", "已经开启推送功能!");
      }
    }
    plus.ios.deleteObject(app);
    plus.ios.deleteObject(UIApplication);
    return result;
  }
  function contact() {
    var result = 0;
    var CNContactStore = plus.ios.import("CNContactStore");
    var cnAuthStatus = CNContactStore.authorizationStatusForEntityType(0);
    if (cnAuthStatus === 0) {
      result = null;
    } else if (cnAuthStatus == 3) {
      result = 1;
    } else {
      result = 0;
    }
    plus.ios.deleteObject(CNContactStore);
    return result;
  }
  function record() {
    var result = null;
    var avaudiosession = plus.ios.import("AVAudioSession");
    var avaudio = avaudiosession.sharedInstance();
    var status = avaudio.recordPermission();
    formatAppLog("log", "at common/permission.js:104", "permissionStatus:" + status);
    if (status === 1970168948) {
      result = null;
    } else if (status === 1735552628) {
      result = 1;
    } else {
      result = 0;
    }
    plus.ios.deleteObject(avaudiosession);
    return result;
  }
  function calendar() {
    var result = null;
    var EKEventStore = plus.ios.import("EKEventStore");
    var ekAuthStatus = EKEventStore.authorizationStatusForEntityType(0);
    if (ekAuthStatus == 3) {
      result = 1;
      formatAppLog("log", "at common/permission.js:122", "日历权限已经开启");
    } else {
      formatAppLog("log", "at common/permission.js:124", "日历权限没有开启");
    }
    plus.ios.deleteObject(EKEventStore);
    return result;
  }
  function memo() {
    var result = null;
    var EKEventStore = plus.ios.import("EKEventStore");
    var ekAuthStatus = EKEventStore.authorizationStatusForEntityType(1);
    if (ekAuthStatus == 3) {
      result = 1;
      formatAppLog("log", "at common/permission.js:136", "备忘录权限已经开启");
    } else {
      formatAppLog("log", "at common/permission.js:138", "备忘录权限没有开启");
    }
    plus.ios.deleteObject(EKEventStore);
    return result;
  }
  function requestIOS(permissionID) {
    return new Promise((resolve, reject) => {
      switch (permissionID) {
        case "push":
          resolve(push());
          break;
        case "location":
          resolve(location$1());
          break;
        case "record":
          resolve(record());
          break;
        case "camera":
          resolve(camera());
          break;
        case "album":
          resolve(album());
          break;
        case "contact":
          resolve(contact());
          break;
        case "calendar":
          resolve(calendar());
          break;
        case "memo":
          resolve(memo());
          break;
        default:
          resolve(0);
          break;
      }
    });
  }
  function requestAndroid(permissionID) {
    return new Promise((resolve, reject) => {
      plus.android.requestPermissions(
        [permissionID],
        function(resultObj) {
          var result = 0;
          for (var i2 = 0; i2 < resultObj.granted.length; i2++) {
            var grantedPermission = resultObj.granted[i2];
            formatAppLog("log", "at common/permission.js:187", "已获取的权限：" + grantedPermission);
            result = 1;
          }
          for (var i2 = 0; i2 < resultObj.deniedPresent.length; i2++) {
            var deniedPresentPermission = resultObj.deniedPresent[i2];
            formatAppLog("log", "at common/permission.js:192", "拒绝本次申请的权限：" + deniedPresentPermission);
            result = 0;
          }
          for (var i2 = 0; i2 < resultObj.deniedAlways.length; i2++) {
            var deniedAlwaysPermission = resultObj.deniedAlways[i2];
            formatAppLog("log", "at common/permission.js:197", "永久拒绝申请的权限：" + deniedAlwaysPermission);
            result = -1;
          }
          resolve(result);
        },
        function(error) {
          formatAppLog("log", "at common/permission.js:203", "result error: " + error.message);
          resolve({
            code: error.code,
            message: error.message
          });
        }
      );
    });
  }
  function gotoAppPermissionSetting() {
    if (permission.isIOS) {
      var UIApplication = plus.ios.import("UIApplication");
      var application2 = UIApplication.sharedApplication();
      var NSURL2 = plus.ios.import("NSURL");
      var setting2 = NSURL2.URLWithString("app-settings:");
      application2.openURL(setting2);
      plus.ios.deleteObject(setting2);
      plus.ios.deleteObject(NSURL2);
      plus.ios.deleteObject(application2);
    } else {
      var Intent = plus.android.importClass("android.content.Intent");
      var Settings = plus.android.importClass("android.provider.Settings");
      var Uri = plus.android.importClass("android.net.Uri");
      var mainActivity = plus.android.runtimeMainActivity();
      var intent = new Intent();
      intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
      var uri = Uri.fromParts("package", mainActivity.getPackageName(), null);
      intent.setData(uri);
      mainActivity.startActivity(intent);
    }
  }
  const permission = {
    get isIOS() {
      return typeof isIOS === "boolean" ? isIOS : isIOS = uni.getSystemInfoSync().platform === "ios";
    },
    requestIOS,
    requestAndroid,
    gotoAppSetting: gotoAppPermissionSetting
  };
  const scanRepair = (detail_no) => {
    return http.post("/repair/scan", { detail_no });
  };
  const updateRepair = ({
    model_detail_id,
    broken_reason,
    reason,
    main_img,
    first_img,
    second_img
  }) => {
    return http.post(`/repair/store`, {
      model_detail_id,
      broken_reason,
      reason,
      main_img,
      first_img,
      second_img
    });
  };
  const _imports_0$5 = "/static/image/scan-code@2x.png";
  const _imports_1$2 = "/static/image/icon-close@2x.png";
  const sourceTypeIndex$1 = 2;
  const _sfc_main$q = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const code = vue.ref("请扫描编码");
      const model_detail_id = vue.ref("");
      const handleScan = async () => {
        let status = await checkPermission();
        if (status !== 1) {
          return;
        }
        uni.scanCode({
          success: async (res2) => {
            code.value = res2.result;
            const resScan = await scanRepair(code.value);
            model_detail_id.value = resScan.data.id;
          },
          fail: (err) => {
          }
        });
      };
      const checkPermission = async (code2) => {
        let status = permission.isIOS ? await permission.requestIOS("camera") : await permission.requestAndroid("android.permission.CAMERA");
        if (status === null || status === 1) {
          status = 1;
        } else {
          uni.showModal({
            content: "需要相机权限",
            confirmText: "设置",
            success: function(res2) {
              if (res2.confirm) {
                permission.gotoAppSetting();
              }
            }
          });
        }
        return status;
      };
      const reasonOption = vue.ref([
        {
          text: "外观破损",
          value: 1
        },
        {
          text: "内层破损",
          value: 2
        },
        {
          text: "表面割裂",
          value: 3
        },
        {
          text: "拉链损坏",
          value: 4
        },
        {
          text: "恶意涂鸦",
          value: 5
        },
        {
          text: "拼接块脱落",
          value: 6
        },
        {
          text: "其他",
          value: 7
        }
      ]);
      const popup = vue.ref(null);
      const broken_reason = vue.ref([]);
      const reason = vue.ref("");
      const reasonName = vue.ref("请选择");
      const handleShowPop = () => {
        popup.value.open();
      };
      const tempReason = vue.ref("");
      const change = (e2) => {
        var _a, _b;
        formatAppLog("log", "at pages/report/index.vue:173", "e:", e2);
        broken_reason.value = (_a = e2.detail) == null ? void 0 : _a.value;
        tempReason.value = ((_b = e2.detail) == null ? void 0 : _b.data.map((item) => item.text).toString()) || "";
      };
      const imageList = vue.ref([]);
      const imageDetailList = vue.ref([]);
      const secondImgList = vue.ref([]);
      const sourceType = ["拍照", "相册", "拍照或相册"];
      const handleUpload = async (index2) => {
        uni.chooseImage({
          // sourceType: sourceType[sourceTypeIndex],
          // sizeType: sizeType[this.sizeTypeIndex],
          count: 1,
          success: async (res2) => {
            formatAppLog("log", "at pages/report/index.vue:198", "chooseImage", res2.tempFilePaths);
            const urlRes = await uploadApi(res2.tempFilePaths[0]);
            const url = urlRes.data.url;
            formatAppLog("log", "at pages/report/index.vue:201", "urlRes", urlRes);
            if (index2 === 1) {
              imageList.value = [url];
            } else if (index2 === 2) {
              imageDetailList.value = [url];
            } else {
              secondImgList.value = [url];
            }
          },
          fail: (err) => {
            formatAppLog("log", "at pages/report/index.vue:212", "err: ", err);
            if (err["code"] && err.code !== 0 && sourceTypeIndex$1 === 2) {
              formatAppLog("log", "at pages/report/index.vue:215", "checkPermission", err.code);
              checkPermission(err.code);
            }
          }
        });
      };
      const previewImage = (e2) => {
        var current = e2.target.dataset.src;
        uni.previewImage({
          current,
          urls: imageList.value
        });
      };
      const deleteMainImage = () => {
        imageList.value = [];
      };
      const deleteDetailImage = () => {
        imageDetailList.value = [];
      };
      const deleteSecondImage = () => {
        secondImgList.value = [];
      };
      const handleConfirm = () => {
        formatAppLog("log", "at pages/report/index.vue:274", broken_reason);
        reasonName.value = tempReason.value;
        popup.value.close();
      };
      const handleSubmit = async () => {
        formatAppLog("log", "at pages/report/index.vue:280", imageList.value);
        if (!broken_reason.value.length) {
          uni.showToast({
            icon: "none",
            title: "请选择损坏原因"
          });
          return;
        }
        if (!model_detail_id.value) {
          uni.showToast({
            icon: "none",
            title: "请扫描损坏编码"
          });
          return;
        }
        const params = {
          model_detail_id: model_detail_id.value,
          broken_reason: broken_reason.value,
          reason: reason.value
        };
        if (imageList.value.length)
          params.main_img = imageList.value.join("");
        if (imageDetailList.value.length)
          params.first_img = imageDetailList.value.join("");
        if (secondImgList.value.length)
          params.second_img = secondImgList.value.join("");
        await updateRepair(params);
        formatAppLog("log", "at pages/report/index.vue:304", code.value, broken_reason.value, imageList.value);
        uni.navigateTo({
          url: "/pages/report/reportSuccess"
        });
        broken_reason.value = [];
        reasonName.value = "请选择";
        tempReason.value = "";
        reason.value = "";
        imageList.value = [];
        imageDetailList.value = [];
        secondImgList.value = [];
        code.value = "扫一扫";
      };
      const __returned__ = { code, model_detail_id, handleScan, checkPermission, reasonOption, popup, broken_reason, reason, reasonName, handleShowPop, tempReason, change, imageList, imageDetailList, secondImgList, sourceTypeIndex: sourceTypeIndex$1, sourceType, handleUpload, previewImage, deleteMainImage, deleteDetailImage, deleteSecondImage, handleConfirm, handleSubmit, ref: vue.ref, get permision() {
        return permission;
      }, get updateRepair() {
        return updateRepair;
      }, get scanRepair() {
        return scanRepair;
      }, get uploadApi() {
        return uploadApi;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$p(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$3);
    const _component_uni_card = resolveEasycom(vue.resolveDynamicComponent("uni-card"), __easycom_1$1);
    const _component_uni_data_checkbox = resolveEasycom(vue.resolveDynamicComponent("uni-data-checkbox"), __easycom_2);
    const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_3);
    return vue.openBlock(), vue.createElementBlock("view", { class: "report-wrap pt-16" }, [
      vue.createVNode(_component_uni_card, {
        "is-shadow": false,
        "is-full": ""
      }, {
        default: vue.withCtx(() => [
          vue.createElementVNode("view", { class: "form-item w_100 jc-sb" }, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", { class: "uni-error" }, "*"),
              vue.createTextVNode("损坏申报编码")
            ]),
            vue.createElementVNode("view", {
              class: "form-value pl-20 d-f ai-c",
              onClick: $setup.handleScan
            }, [
              vue.createElementVNode(
                "text",
                { class: "select-text" },
                vue.toDisplayString($setup.code),
                1
                /* TEXT */
              ),
              vue.createElementVNode("image", {
                class: "w-32 h-32 ml-5",
                src: _imports_0$5
              })
            ])
          ]),
          vue.createCommentVNode(" 损坏原因 "),
          vue.createElementVNode("view", { class: "form-item w_100 jc-sb" }, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", { class: "uni-error" }, "*"),
              vue.createTextVNode("损坏原因")
            ]),
            vue.createElementVNode("view", {
              class: "form-select pl-80 d-f ai-c",
              onClick: $setup.handleShowPop
            }, [
              vue.createElementVNode(
                "text",
                { class: "select-text" },
                vue.toDisplayString($setup.reasonName),
                1
                /* TEXT */
              ),
              vue.createVNode(_component_uni_icons, {
                class: "select-icon ml-5",
                type: "right",
                size: "14",
                color: "#999999"
              })
            ])
          ])
        ]),
        _: 1
        /* STABLE */
      }),
      vue.createVNode(_component_uni_card, {
        "is-shadow": false,
        "is-full": "",
        class: "mt-15"
      }, {
        default: vue.withCtx(() => [
          vue.createCommentVNode(" 图片上传区 "),
          vue.createElementVNode("view", { class: "upload-section" }, [
            vue.createElementVNode("text", { class: "upload-title" }, "包装正面 (含编码)"),
            vue.createElementVNode("view", { class: "upload-grid mt-15 d-f ai-c fxw-w" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.imageList, (image, index2) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "uni-uploader__file",
                    key: index2
                  }, [
                    vue.createElementVNode("image", {
                      class: "uni-uploader__img",
                      src: image,
                      "data-src": image,
                      onClick: $setup.previewImage
                    }, null, 8, ["src", "data-src"]),
                    vue.createElementVNode("image", {
                      class: "icon-close w-32 h-32",
                      src: _imports_1$2,
                      onClick: vue.withModifiers($setup.deleteMainImage, ["stop"])
                    })
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              vue.createElementVNode("view", {
                class: "upload-box",
                onClick: _cache[0] || (_cache[0] = ($event) => $setup.handleUpload(1))
              }, [
                vue.createVNode(_component_uni_icons, {
                  class: "upload-icon",
                  type: "plusempty",
                  size: "20",
                  color: "#999999"
                })
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "upload-section mt-15" }, [
            vue.createElementVNode("text", { class: "upload-title" }, "损坏细节1"),
            vue.createElementVNode("view", { class: "upload-grid mt-15 d-f ai-c fxw-w" }, [
              vue.createCommentVNode(" <uni-file-picker></uni-file-picker> "),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.imageDetailList, (image, index2) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "uni-uploader__file",
                    key: index2
                  }, [
                    vue.createElementVNode("image", {
                      class: "uni-uploader__img",
                      src: image,
                      "data-src": image,
                      onClick: $setup.previewImage
                    }, null, 8, ["src", "data-src"]),
                    vue.createElementVNode("image", {
                      class: "icon-close w-32 h-32",
                      src: _imports_1$2,
                      onClick: vue.withModifiers($setup.deleteDetailImage, ["stop"])
                    })
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              vue.createElementVNode("view", {
                class: "upload-box",
                onClick: _cache[1] || (_cache[1] = ($event) => $setup.handleUpload(2))
              }, [
                vue.createVNode(_component_uni_icons, {
                  class: "upload-icon",
                  type: "plusempty",
                  size: "20",
                  color: "#999999"
                })
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "upload-section mt-15" }, [
            vue.createElementVNode("text", { class: "upload-title" }, "损坏细节2"),
            vue.createElementVNode("view", { class: "upload-grid mt-15 d-f ai-c fxw-w" }, [
              vue.createCommentVNode(" <uni-file-picker></uni-file-picker> "),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.secondImgList, (image, index2) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "uni-uploader__file",
                    key: index2
                  }, [
                    vue.createElementVNode("image", {
                      class: "uni-uploader__img",
                      src: image,
                      "data-src": image,
                      onClick: $setup.previewImage
                    }, null, 8, ["src", "data-src"]),
                    vue.createElementVNode("image", {
                      class: "icon-close w-32 h-32",
                      src: _imports_1$2,
                      onClick: vue.withModifiers($setup.deleteSecondImage, ["stop"])
                    })
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              vue.createElementVNode("view", {
                class: "upload-box",
                onClick: _cache[2] || (_cache[2] = ($event) => $setup.handleUpload(3))
              }, [
                vue.createVNode(_component_uni_icons, {
                  class: "upload-icon",
                  type: "plusempty",
                  size: "20",
                  color: "#999999"
                })
              ])
            ])
          ])
        ]),
        _: 1
        /* STABLE */
      }),
      vue.createElementVNode("view", { class: "submit-btn" }, [
        vue.createElementVNode("button", {
          class: "custom-btn",
          onClick: $setup.handleSubmit
        }, "提交申报")
      ]),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "popup",
          type: "bottom",
          title: "请选择损坏原因",
          "border-radius": "10px 10px 0 0"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "reason-popup bg_white" }, [
              vue.createElementVNode("view", { class: "title ta-c" }, " 请选择损坏原因 "),
              vue.createVNode(_component_uni_data_checkbox, {
                selectedColor: "#99BBA0",
                type: "primary",
                class: "reason-checkbox",
                multiple: "",
                modelValue: $setup.broken_reason,
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.broken_reason = $event),
                mode: "list",
                localdata: $setup.reasonOption,
                onChange: $setup.change
              }, null, 8, ["modelValue", "localdata"]),
              vue.withDirectives(vue.createElementVNode(
                "view",
                { class: "uni-textarea" },
                [
                  vue.withDirectives(vue.createElementVNode(
                    "textarea",
                    {
                      "placeholder-style": "color:#A7B0BF",
                      placeholder: "请输入其他原因",
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.reason = $event)
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.reason]
                  ])
                ],
                512
                /* NEED_PATCH */
              ), [
                [vue.vShow, $setup.broken_reason.includes(7)]
              ]),
              vue.createElementVNode("button", {
                class: "custom-btn mt-48",
                onClick: _cache[5] || (_cache[5] = ($event) => $setup.handleConfirm())
              }, "确 定")
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const PagesReportIndex = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["render", _sfc_render$p], ["__scopeId", "data-v-14542b8b"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/report/index.vue"]]);
  function getElCountsAndLayout(clas) {
    let elements = {
      // flex左右布局中，给本身没有宽度属性的元素父级添加flex:1
      clas: clas.indexOf("circle") > -1 || clas.indexOf("square") > -1 ? "" : "ls_flex-sub",
      eles: []
    };
    if (clas.indexOf("*") > -1) {
      let group = clas.split("*");
      for (let i2 = 0, len = Number.parseInt(group[1]); i2 < len; i2++) {
        elements.eles.push({
          clas: "ls_" + group[0],
          type: "skeleton"
          // flex左右布局中，为了保持元素垂直居中，每一列的最后一行去掉margin-bottom
          // styl: i == len - 1 ? {marginBottom: '0'} : ''
        });
      }
    } else {
      elements.eles.push({
        clas: "ls_" + clas,
        type: "skeleton"
      });
    }
    return elements;
  }
  function getElCounts(clas) {
    let elements = [];
    if (clas.indexOf("*") > -1) {
      let group = clas.split("*");
      for (let i2 = 0, len = Number.parseInt(group[1]); i2 < len; i2++) {
        elements.push({
          clas: "ls_" + group[0],
          type: "skeleton"
        });
      }
    } else if (clas == "line" || clas == "line-sm" || clas == "line-lg" || clas == "card" || clas == "card-sm" || clas == "card-lg" || clas == "circle" || clas == "circle-sm" || clas == "circle-lg" || clas == "square" || clas == "square-sm" || clas == "square-lg") {
      elements.push({
        clas: "ls_" + clas,
        type: "skeleton"
      });
    } else {
      elements.push({
        clas: "",
        type: clas
      });
    }
    return elements;
  }
  const _sfc_main$p = {
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
                children.push(getElCountsAndLayout(els));
              });
              elements.push({
                type: "flex",
                children
              });
            } else {
              elClass = getElCounts(el);
              elements = elements.concat(elClass);
            }
          } else if (typeof el === "number") {
            elements.push({
              type: "space",
              height: el
            });
          } else {
            formatAppLog("warn", "at components/ls-skeleton/ls-skeleton.nvue:140", "[ls-skeleton]: 参数格式包含了不符合规范的内容");
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
  function _sfc_render$o(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      $props.loading ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.elements, (item, index2) => {
            return vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: index2 },
              [
                vue.createCommentVNode(" 横向并列布局 "),
                item.type == "flex" ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "ls_skeleton-group"
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(item.children, (inner, index22) => {
                      return vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          class: vue.normalizeClass([inner.clas, index22 > 0 ? "ls_ml" : ""]),
                          key: index22
                        },
                        [
                          (vue.openBlock(true), vue.createElementBlock(
                            vue.Fragment,
                            null,
                            vue.renderList(inner.eles, (el, index3) => {
                              return vue.openBlock(), vue.createElementBlock(
                                "view",
                                {
                                  class: vue.normalizeClass([el.clas, el.clas == "ls_circle" ? "" : $options.style, $options.animateClass]),
                                  key: index3,
                                  ref_for: true,
                                  ref: "skeleton"
                                },
                                null,
                                2
                                /* CLASS */
                              );
                            }),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ],
                        2
                        /* CLASS */
                      );
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : item.type == "news" ? (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  { key: 1 },
                  [
                    vue.createCommentVNode(" 扩展模板：新闻资讯模板 "),
                    vue.createCommentVNode(" ps 自定义扩展说明： "),
                    vue.createCommentVNode(" 如果你需要自定义模板，可以参照这个news的写法，增加一个skeleton配置类型，编写布局和样式就可以了 "),
                    vue.createCommentVNode(' 注意事项：为了保证骨架效果和动态效果的一致，扩展时，在你希望实际展示在页面中的元素上加上 :class="[style, animateClass]" 和 ref="skeleton" '),
                    vue.createElementVNode("view", { class: "ls_skeleton-group" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: vue.normalizeClass(["ls_news_img", [$options.style, $options.animateClass]]),
                          ref_for: true,
                          ref: "skeleton"
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      vue.createElementVNode("view", { class: "ls_news" }, [
                        vue.createElementVNode(
                          "view",
                          {
                            class: vue.normalizeClass(["ls_line", [$options.style, $options.animateClass]]),
                            ref_for: true,
                            ref: "skeleton"
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        vue.createElementVNode(
                          "view",
                          {
                            class: vue.normalizeClass(["ls_news_user", [$options.style, $options.animateClass]]),
                            ref_for: true,
                            ref: "skeleton"
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        vue.createElementVNode(
                          "view",
                          {
                            class: vue.normalizeClass(["ls_news_time", [$options.style, $options.animateClass]]),
                            ref_for: true,
                            ref: "skeleton"
                          },
                          null,
                          2
                          /* CLASS */
                        )
                      ])
                    ])
                  ],
                  2112
                  /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                )) : item.type == "space" ? (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  { key: 2 },
                  [
                    vue.createCommentVNode(" 垂直高度站位 "),
                    vue.createElementVNode(
                      "view",
                      {
                        style: vue.normalizeStyle({ height: item.height + "rpx" })
                      },
                      null,
                      4
                      /* STYLE */
                    )
                  ],
                  2112
                  /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                )) : (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  { key: 3 },
                  [
                    vue.createCommentVNode(" 其他基本单位  line  card circle 等 "),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass([item.clas, item.clas == "ls_circle" ? "" : $options.style, $options.animateClass]),
                        ref_for: true,
                        ref: "skeleton"
                      },
                      null,
                      2
                      /* CLASS */
                    )
                  ],
                  2112
                  /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                ))
              ],
              64
              /* STABLE_FRAGMENT */
            );
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ]))
    ]);
  }
  const lsSkeleton = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["render", _sfc_render$o], ["__scopeId", "data-v-b5b48376"], ["__file", "D:/project/dlw/uniapp-dileiwo/components/ls-skeleton/ls-skeleton.nvue"]]);
  const getOutboundList = ({ page: page2, per_page }) => {
    return http.get("/bound/outbound/mobile", { page: page2, per_page });
  };
  const getOutboundDetail = (id) => {
    return http.get(`/bound/outbound/${id}`);
  };
  const scanOutbound = ({ outbound, detail_no }) => {
    return http.post(`/bound/outbound/${outbound}/scan/mobile`, { detail_no });
  };
  const usePacakge = ({ outbound, detail_no, force }) => {
    return http.post(`/bound/outbound/${outbound}/scan`, { detail_no, force });
  };
  const _imports_0$4 = "/static/image/icon-empty.png";
  const _sfc_main$o = {
    name: "empty",
    data() {
      return {};
    }
  };
  function _sfc_render$n(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "empty-wrap d-f" }, [
      vue.createElementVNode("image", {
        class: "empty-image",
        src: _imports_0$4
      }),
      vue.createElementVNode("text", { class: "mt-48" }, "暂无数据")
    ]);
  }
  const Empty = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["render", _sfc_render$n], ["__scopeId", "data-v-e2280098"], ["__file", "D:/project/dlw/uniapp-dileiwo/components/empty/empty.vue"]]);
  const _sfc_main$n = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const role2 = vue.ref("");
      const list = vue.ref([]);
      const page2 = vue.ref({
        page: 1,
        per_page: 10
      });
      const skeleton = [
        40,
        "card-sm*4",
        40
      ];
      const isLoad = vue.ref(false);
      const loadMoreText2 = vue.ref("加载中...");
      const showLoadMore = vue.ref(false);
      const total_count = vue.ref(0);
      formatAppLog("log", "at pages/delivery/index.vue:49", role2.value);
      onLoad(() => {
        formatAppLog("log", "at pages/delivery/index.vue:51", "onLoadonLoadonLoad");
      });
      onShow(() => {
        isLoad.value = false;
        page2.value.page = 1;
        role2.value = uni.getStorageSync("ROLE_KEY");
        formatAppLog("log", "at pages/delivery/index.vue:57", "onShowonShowonShowonShow");
        getList();
      });
      onHide(() => {
        list.value = [];
      });
      const getList = async (isFresh) => {
        try {
          const res2 = await getOutboundList({
            ...page2.value
          });
          uni.stopPullDownRefresh();
          total_count.value = res2.data.total_count;
          if (isFresh) {
            list.value = res2.data.list;
          } else {
            list.value = list.value.concat(res2.data.list);
          }
          isLoad.value = true;
        } catch (e2) {
          isLoad.value = true;
        }
      };
      const goDetail = (item) => {
        uni.navigateTo({
          url: "/pages/delivery/detailList?item=" + JSON.stringify(item)
        });
      };
      onPullDownRefresh(() => {
        page2.value.page = 1;
        getList(true);
      });
      onReachBottom(() => {
        formatAppLog("log", "at pages/delivery/index.vue:91", "onReachBottom", list.value.length, total_count.value);
        if (list.value.length == total_count.value) {
          loadMoreText2.value = "没有更多数据了!";
          return;
        }
        page2.value.page++;
        showLoadMore.value = true;
        setTimeout(() => {
          getList();
        }, 300);
      });
      const __returned__ = { role: role2, list, page: page2, skeleton, isLoad, loadMoreText: loadMoreText2, showLoadMore, total_count, getList, goDetail, ref: vue.ref, get lsSkeleton() {
        return lsSkeleton;
      }, get onReady() {
        return onReady;
      }, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      }, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      }, get getOutboundList() {
        return getOutboundList;
      }, Empty };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "auth-container pt-16" }, [
      vue.createVNode($setup["lsSkeleton"], {
        skeleton: $setup.skeleton,
        loading: !$setup.isLoad
      }, {
        default: vue.withCtx(() => [
          $setup.list.length ? (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            { key: 0 },
            vue.renderList($setup.list, (item, index2) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "auth-item d-f ai-c",
                onClick: ($event) => $setup.goDetail(item),
                key: item.id
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "left w-80 h-80 uni-white d-f ai-c jc-c uni-bold fs-40" },
                  vue.toDisplayString(index2 + 1),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "middle flex-1 ml-24" }, [
                  vue.createElementVNode(
                    "view",
                    { class: "title" },
                    vue.toDisplayString($setup.role == "admin" ? item.name : item.order_no),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "view",
                    { class: "sub color-subTitlle mt-8" },
                    vue.toDisplayString(item.created_at),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("image", {
                  class: "arrow",
                  src: _imports_0$6,
                  mode: ""
                })
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )) : (vue.openBlock(), vue.createBlock($setup["Empty"], {
            key: 1,
            class: "no-data ta-c uni-list-cell-pd"
          })),
          $setup.showLoadMore ? (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 2,
              class: "uni-loadmore"
            },
            vue.toDisplayString($setup.loadMoreText),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        _: 1
        /* STABLE */
      }, 8, ["loading"])
    ]);
  }
  const PagesDeliveryIndex = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["render", _sfc_render$m], ["__scopeId", "data-v-87751f05"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/delivery/index.vue"]]);
  const _sfc_main$m = {
    __name: "detailList",
    setup(__props, { expose: __expose }) {
      __expose();
      const list = vue.ref([]);
      const page2 = vue.ref({
        page: 1,
        per_page: 10
      });
      const isLoad = vue.ref(false);
      const loadMoreText2 = vue.ref("加载中...");
      const showLoadMore = vue.ref(false);
      const total_count = vue.ref(0);
      const row2 = vue.ref({});
      onLoad((option) => {
        const item = JSON.parse(option.item);
        row2.value = item;
        loadDetail();
      });
      const loadDetail = async (isfresh) => {
        try {
          const res2 = await getOutboundDetail(row2.value.id);
          formatAppLog("log", "at pages/delivery/detailList.vue:56", res2);
          if (isfresh) {
            list.value = res2.data.list;
          } else {
            list.value = list.value.concat(res2.data.list);
          }
          total_count.value = res2.data.total_count;
          uni.stopPullDownRefresh();
          isLoad.value = true;
        } catch (e2) {
          uni.stopPullDownRefresh();
          isLoad.value = true;
        }
      };
      const handleScan = async () => {
        let status = await checkPermission();
        if (status !== 1) {
          return;
        }
        uni.scanCode({
          success: async (res2) => {
            try {
              const resScan = await scanOutbound({
                outbound: row2.value.id,
                detail_no: res2.result
              });
              uni.showToast({
                title: "出库成功",
                icon: "none"
              });
              uni.startPullDownRefresh();
            } catch ({ data }) {
              if (data.msg && data.msg.includes("单月循环用量达上限")) {
                uni.navigateTo({
                  url: `/pages/delivery/deliveryError?item=${JSON.stringify(row2.value)}&msg=${data.msg}`
                });
              }
            }
          },
          fail: (err) => {
          }
        });
      };
      const checkPermission = async (code) => {
        let status = permission.isIOS ? await permission.requestIOS("camera") : await permission.requestAndroid("android.permission.CAMERA");
        if (status === null || status === 1) {
          status = 1;
        } else {
          uni.showModal({
            content: "需要相机权限",
            confirmText: "设置",
            success: function(res2) {
              if (res2.confirm) {
                permission.gotoAppSetting();
              }
            }
          });
        }
        return status;
      };
      const handleFinish = () => {
        uni.navigateBack();
      };
      onPullDownRefresh(() => {
        page2.value.page = 1;
        loadDetail(true);
      });
      onReachBottom(() => {
        formatAppLog("log", "at pages/delivery/detailList.vue:153", "onReachBottom");
        if (list.value.length == total_count.value) {
          loadMoreText2.value = "没有更多数据了!";
          return;
        }
        showLoadMore.value = true;
        setTimeout(() => {
          loadDetail();
        }, 300);
      });
      const __returned__ = { list, page: page2, isLoad, loadMoreText: loadMoreText2, showLoadMore, total_count, row: row2, loadDetail, handleScan, checkPermission, handleFinish, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      }, get permision() {
        return permission;
      }, get scanOutbound() {
        return scanOutbound;
      }, get getOutboundDetail() {
        return getOutboundDetail;
      }, Empty };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
    return $setup.isLoad ? (vue.openBlock(), vue.createElementBlock("view", {
      key: 0,
      class: "check-container pt-16"
    }, [
      vue.createElementVNode("view", { class: "detail-list" }, [
        $setup.list.length ? (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          { key: 0 },
          vue.renderList($setup.list, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", { class: "detail-item bg_white d-f w_100 jc-sb ai-c pl-32 pr-28" }, [
              vue.createElementVNode(
                "view",
                { class: "title" },
                vue.toDisplayString(item.detail_no),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "sub" }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-error" },
                  vue.toDisplayString(item.limit_count) + "/" + vue.toDisplayString(item.month_limit),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "color-subTitlle" }, "(单月循环次数)")
              ])
            ]);
          }),
          256
          /* UNKEYED_FRAGMENT */
        )) : (vue.openBlock(), vue.createBlock($setup["Empty"], {
          key: 1,
          class: "no-data ta-c uni-list-cell-pd"
        })),
        $setup.showLoadMore ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 2,
            class: "uni-loadmore"
          },
          vue.toDisplayString($setup.loadMoreText),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode("view", { class: "w_100 mt-48 fixed pb-20 safe-area-bottom" }, [
        vue.createElementVNode("button", {
          class: "custom-btn",
          type: "",
          onClick: $setup.handleScan
        }, "扫一扫"),
        vue.createElementVNode("button", {
          class: "custom-btn mt-10",
          onClick: $setup.handleFinish
        }, "结束包装出库")
      ])
    ])) : vue.createCommentVNode("v-if", true);
  }
  const PagesDeliveryDetailList = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$l], ["__scopeId", "data-v-576bb335"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/delivery/detailList.vue"]]);
  const _imports_0$3 = "/static/image/delivery-succes-1@2x.png";
  const _imports_1$1 = "/static/image/delivery-error-1@2x.png";
  const _sfc_main$l = {
    __name: "deliveryError",
    setup(__props, { expose: __expose }) {
      __expose();
      const errorType = vue.ref(2);
      const row2 = vue.ref({});
      const msg = vue.ref("");
      onLoad((option) => {
        formatAppLog("log", "at pages/delivery/deliveryError.vue:53", JSON.parse(option.item));
        let data = option;
        row2.value = option.item ? JSON.parse(option.item) : {}, formatAppLog("log", "at pages/delivery/deliveryError.vue:56", "row.value", row2.value);
        msg.value = data.msg;
      });
      const active = vue.ref(1);
      const handleChange = (type) => {
        active.value = type;
      };
      const handleConfirm = async () => {
        if (active.value == 1) {
          await usePacakge({
            outbound: row2.value.id,
            detail_no: row2.value.detail_no,
            force: true
          });
          uni.navigateBack(2);
        } else {
          uni.navigateBack(1);
        }
      };
      const back = () => {
        uni.navigateBack({
          delta: 1
        });
      };
      const handleBack = () => {
        uni.navigateBack({
          delta: 2
        });
      };
      const __returned__ = { errorType, row: row2, msg, active, handleChange, handleConfirm, back, handleBack, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get usePacakge() {
        return usePacakge;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "auth-error-container" }, [
      $setup.errorType == 1 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "content"
      }, [
        vue.createElementVNode("image", {
          class: "error-image",
          src: _imports_0$3,
          mode: ""
        }),
        vue.createElementVNode("text", { class: "error-title fs-36 mt-36" }, "出库完成！"),
        vue.createElementVNode("button", {
          class: "custom-btn verify-btn",
          onClick: $setup.handleBack
        }, "继续包装出库")
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          $setup.msg && $setup.msg.includes("单月循环用量达上限") ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "pt-34 pl-32 pr-32"
          }, [
            vue.createElementVNode("view", { class: "fs-36" }, " 超出单月使用量，请选择 "),
            vue.createElementVNode(
              "view",
              { class: "mt-16 color-subTitlle fs-28" },
              vue.toDisplayString($setup.row.detail_no) + "，此包装超出单月使用次数, 请更换包装使用 ",
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["option-card mb-32 mt-48", { "active": $setup.active == 1 }]),
                onClick: _cache[0] || (_cache[0] = ($event) => $setup.handleChange(1))
              },
              [
                vue.createElementVNode("text", { class: "card-text" }, "继续使用此包装")
              ],
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["option-card mb-32", { "active": $setup.active == 2 }]),
                onClick: _cache[1] || (_cache[1] = ($event) => $setup.handleChange(2))
              },
              [
                vue.createElementVNode("text", { class: "card-text" }, "更换其他包装")
              ],
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["option-card", { "active": $setup.active == 3 }]),
                onClick: _cache[2] || (_cache[2] = ($event) => $setup.handleChange(3))
              },
              [
                vue.createElementVNode("text", { class: "card-text" }, "取消使用次包装")
              ],
              2
              /* CLASS */
            ),
            vue.createElementVNode("button", {
              class: "custom-btn mt-80",
              onClick: $setup.handleConfirm
            }, "确认")
          ])) : (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "content"
          }, [
            vue.createElementVNode("image", {
              class: "error-image",
              src: _imports_1$1,
              mode: ""
            }),
            vue.createElementVNode(
              "text",
              { class: "error-title fs-36 mt-36" },
              vue.toDisplayString($setup.msg),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "error-desc fs-28 color-subTitlle" },
              vue.toDisplayString($setup.row.detail_no) + "，请进行确认",
              1
              /* TEXT */
            ),
            vue.createElementVNode("button", {
              class: "custom-btn verify-btn",
              onClick: $setup.back
            }, "确认")
          ]))
        ],
        64
        /* STABLE_FRAGMENT */
      ))
    ]);
  }
  const PagesDeliveryDeliveryError = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$k], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/delivery/deliveryError.vue"]]);
  const getBoundList = ({
    page: page2,
    per_page,
    type_name
  }) => {
    return http.get("/bound/inbound", {
      page: page2,
      per_page,
      type_name
    });
  };
  const getScanResult = (inbound) => {
    return http.get(`/bound/inbound/${inbound}/result`);
  };
  const scanAdmin = ({
    id,
    type,
    detail_no
  }) => {
    return http.post("/bound/inbound/scan", {
      id,
      type,
      detail_no
    });
  };
  const authConfirm = (outbound) => {
    return http.post(`/bound/inbound/${outbound}/confirm`, {});
  };
  const scanCustomer = ({
    outbound,
    detail_no
  }) => {
    return http.post(`/bound/inbound/${outbound}/scan`, {
      detail_no
    });
  };
  const scanRecycle = ({
    detail_no
  }) => {
    return http.post(`/bound/inbound/recycle`, {
      detail_no
    });
  };
  const _sfc_main$k = {
    __name: "detailList",
    setup(__props, { expose: __expose }) {
      __expose();
      const list = vue.ref([]);
      const role2 = vue.ref("");
      onShow(() => {
        role2.value = uni.getStorageSync("ROLE_KEY");
      });
      const pageTo = () => {
        uni.navigateTo({
          url: "/pages/recycle/recycleSuccess"
        });
      };
      const handleScan = async () => {
        let status = await checkPermission();
        formatAppLog("log", "at pages/recycle/detailList.vue:49", "checkPermission", status);
        if (status !== 1) {
          return;
        }
        uni.scanCode({
          success: async (res2) => {
            formatAppLog("log", "at pages/recycle/detailList.vue:56", "=====scanCode-success", JSON.stringify(res2));
            formatAppLog("log", "at pages/recycle/detailList.vue:57", "role.value", role2.value);
            if (role2.value === "admin") {
              try {
                const resScan = await scanAdmin({
                  type: 3,
                  detail_no: res2.result
                });
                uni.showToast({
                  title: "回收成功",
                  icon: "none"
                });
              } catch (error) {
                list.value.unshift({
                  status: 7,
                  detail_no: res2.result
                });
              }
            } else {
              try {
                const response = await scanRecycle({
                  detail_no: res2.result
                });
                uni.showToast({
                  title: "回收成功 ",
                  icon: "none"
                });
                list.value.unshift({
                  msg: "回收成功",
                  detail_no: res2.result
                });
              } catch ({ data }) {
                list.value.unshift({
                  msg: data.msg,
                  detail_no: res2.result
                });
              }
            }
          },
          fail: (err) => {
            formatAppLog("log", "at pages/recycle/detailList.vue:107", "fail");
          }
        });
      };
      const checkPermission = async (code) => {
        let status = permission.isIOS ? await permission.requestIOS("camera") : await permission.requestAndroid("android.permission.CAMERA");
        if (status === null || status === 1) {
          status = 1;
        } else {
          uni.showModal({
            content: "需要相机权限",
            confirmText: "设置",
            success: function(res2) {
              if (res2.confirm) {
                permission.gotoAppSetting();
              }
            }
          });
        }
        return status;
      };
      const handleFinish = () => {
        uni.switchTab({
          url: "/pages/index/index"
        });
      };
      const __returned__ = { list, role: role2, pageTo, handleScan, checkPermission, handleFinish, ref: vue.ref, get onReady() {
        return onReady;
      }, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get permision() {
        return permission;
      }, get scanRecycle() {
        return scanRecycle;
      }, get scanAdmin() {
        return scanAdmin;
      }, Empty };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "check-container pt-16" }, [
      $setup.list.length ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "detail-list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.list, (item, index2) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "detail-item bg_white d-f w_100 jc-sb ai-c pl-32 pr-28",
              key: index2,
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.pageTo())
            }, [
              vue.createElementVNode(
                "view",
                { class: "title" },
                vue.toDisplayString(item.detail_no),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                { class: "sub uni-success" },
                vue.toDisplayString(item.msg),
                1
                /* TEXT */
              )
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : (vue.openBlock(), vue.createBlock($setup["Empty"], {
        key: 1,
        class: "no-data ta-c uni-list-cell-pd"
      })),
      vue.createElementVNode("view", {
        class: "footer w_100 mt-48 fixed pb-20 safe-area-bottom",
        style: {}
      }, [
        vue.createElementVNode("button", {
          class: "custom-btn",
          type: "",
          onClick: $setup.handleScan
        }, "扫一扫"),
        vue.createElementVNode("button", {
          class: "custom-btn mt-10",
          onClick: $setup.handleFinish
        }, "结束回收复查")
      ])
    ]);
  }
  const PagesRecycleDetailList = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$j], ["__scopeId", "data-v-0a052cc1"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/recycle/detailList.vue"]]);
  const _imports_0$2 = "/static/image/recycle-success@2x.png";
  const _sfc_main$j = {
    __name: "recycleSuccess",
    setup(__props, { expose: __expose }) {
      __expose();
      const errorType = vue.ref(1);
      const handleBack = () => {
        uni.navigateBack({
          delta: 1
        });
      };
      const __returned__ = { errorType, handleBack, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "auth-error-container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("image", {
          class: "error-image",
          src: _imports_0$2,
          mode: ""
        }),
        vue.createElementVNode("text", { class: "error-title fs-36" }, "回收复查完成"),
        vue.createElementVNode("text", { class: "error-desc fs-28 color-subTitlle" }, "请注意若有损坏包装，请再进行损坏申报"),
        vue.createElementVNode("button", {
          class: "custom-btn verify-btn",
          onClick: $setup.handleBack
        }, "继续回收复查")
      ])
    ]);
  }
  const PagesRecycleRecycleSuccess = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$i], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/recycle/recycleSuccess.vue"]]);
  const _sfc_main$i = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const page2 = vue.ref({
        page: 1,
        per_page: 10
      });
      const isLoad = vue.ref(false);
      const list = vue.ref([]);
      const role2 = vue.ref("");
      role2.value = uni.getStorageSync("ROLE_KEY");
      const verified_count = vue.ref(0);
      const total_count = vue.ref(0);
      const loadMoreText2 = vue.ref("加载中...");
      const showLoadMore = vue.ref(false);
      const skeleton = [
        40,
        "card-sm*4",
        40
      ];
      onShow(() => {
        isLoad.value = false;
        page2.value.page = 1;
        role2.value = uni.getStorageSync("ROLE_KEY");
        formatAppLog("log", "at pages/auth/index.vue:59", "onLoadonLoadonLoad");
        init();
      });
      onHide(() => {
        list.value = [];
      });
      const goCheck = (item) => {
        formatAppLog("log", "at pages/auth/index.vue:69", item);
        const url = role2.value === "admin" ? "/pages/auth/detailList?" : "/pages/auth/check?";
        uni.navigateTo({
          url: `${url}?item=${JSON.stringify(item)}`
        });
      };
      const init = async (isFresh) => {
        try {
          const res2 = await getBoundList({
            ...page2.value,
            type_name: ""
          });
          uni.stopPullDownRefresh();
          if (isFresh) {
            list.value = res2.data.list;
          } else {
            list.value = list.value.concat(res2.data.list);
          }
          total_count.value = res2.data.total_count;
          isLoad.value = true;
        } catch (e2) {
          isLoad.value = true;
        }
      };
      onPullDownRefresh(() => {
        page2.value.page = 1;
        init(true);
      });
      onReachBottom(() => {
        formatAppLog("log", "at pages/auth/index.vue:99", list.value.length, total_count.value);
        if (list.value.length === total_count.value) {
          formatAppLog("log", "at pages/auth/index.vue:101", "没有更多数据了");
          loadMoreText2.value = "没有更多数据了!";
          showLoadMore.value = true;
          return;
        }
        showLoadMore.value = true;
        formatAppLog("log", "at pages/auth/index.vue:107", "onReachBottom");
        ++page2.value.page;
        init();
      });
      const __returned__ = { page: page2, isLoad, list, role: role2, verified_count, total_count, loadMoreText: loadMoreText2, showLoadMore, skeleton, goCheck, init, ref: vue.ref, get getBoundList() {
        return getBoundList;
      }, Empty, get lsSkeleton() {
        return lsSkeleton;
      }, get onReady() {
        return onReady;
      }, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      }, get onReachBottom() {
        return onReachBottom;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "auth-container pt-16" }, [
      vue.createVNode($setup["lsSkeleton"], {
        skeleton: $setup.skeleton,
        loading: !$setup.isLoad
      }, {
        default: vue.withCtx(() => [
          $setup.list.length ? (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            { key: 0 },
            vue.renderList($setup.list, (item, index2) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "auth-item d-f ai-c",
                key: item.id,
                onClick: ($event) => $setup.goCheck(item)
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "left w-80 h-80 uni-white d-f ai-c jc-c uni-bold fs-40" },
                  vue.toDisplayString(index2 + 1),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "middle flex-1 ml-24" }, [
                  vue.createElementVNode("view", {
                    class: "title ellipsis_1 fs-32",
                    style: { "width": "500rpx" }
                  }, [
                    $setup.role == "web" ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      { key: 0 },
                      vue.toDisplayString(item.order_no),
                      1
                      /* TEXT */
                    )) : (vue.openBlock(), vue.createElementBlock(
                      "text",
                      { key: 1 },
                      vue.toDisplayString(item.type_name) + "#" + vue.toDisplayString(item.start_no) + " - " + vue.toDisplayString(item.end_no),
                      1
                      /* TEXT */
                    ))
                  ]),
                  vue.createElementVNode("view", { class: "sub fs-24" }, [
                    vue.createElementVNode("text", { class: "color-subTitlle" }, "数量："),
                    vue.createElementVNode(
                      "text",
                      { class: "num" },
                      vue.toDisplayString(item.total_count),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("image", {
                  class: "arrow",
                  src: _imports_0$6,
                  mode: ""
                })
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )) : (vue.openBlock(), vue.createBlock($setup["Empty"], {
            key: 1,
            class: "no-data ta-c uni-list-cell-pd"
          })),
          $setup.showLoadMore ? (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 2,
              class: "uni-loadmore"
            },
            vue.toDisplayString($setup.loadMoreText),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        _: 1
        /* STABLE */
      }, 8, ["loading"])
    ]);
  }
  const PagesAuthIndex = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$h], ["__scopeId", "data-v-3f748249"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/auth/index.vue"]]);
  const _sfc_main$h = {
    name: "uniFormsItem",
    options: {
      virtualHost: true
    },
    provide() {
      return {
        uniFormItem: this
      };
    },
    inject: {
      form: {
        from: "uniForm",
        default: null
      }
    },
    props: {
      // 表单校验规则
      rules: {
        type: Array,
        default() {
          return null;
        }
      },
      // 表单域的属性名，在使用校验规则时必填
      name: {
        type: [String, Array],
        default: ""
      },
      required: {
        type: Boolean,
        default: false
      },
      label: {
        type: String,
        default: ""
      },
      // label的宽度
      labelWidth: {
        type: [String, Number],
        default: ""
      },
      // label 居中方式，默认 left 取值 left/center/right
      labelAlign: {
        type: String,
        default: ""
      },
      // 强制显示错误信息
      errorMessage: {
        type: [String, Boolean],
        default: ""
      },
      // 1.4.0 弃用，统一使用 form 的校验时机
      // validateTrigger: {
      // 	type: String,
      // 	default: ''
      // },
      // 1.4.0 弃用，统一使用 form 的label 位置
      // labelPosition: {
      // 	type: String,
      // 	default: ''
      // },
      // 1.4.0 以下属性已经废弃，请使用  #label 插槽代替
      leftIcon: String,
      iconColor: {
        type: String,
        default: "#606266"
      }
    },
    data() {
      return {
        errMsg: "",
        userRules: null,
        localLabelAlign: "left",
        localLabelWidth: "70px",
        localLabelPos: "left",
        border: false,
        isFirstBorder: false
      };
    },
    computed: {
      // 处理错误信息
      msg() {
        return this.errorMessage || this.errMsg;
      }
    },
    watch: {
      // 规则发生变化通知子组件更新
      "form.formRules"(val) {
        this.init();
      },
      "form.labelWidth"(val) {
        this.localLabelWidth = this._labelWidthUnit(val);
      },
      "form.labelPosition"(val) {
        this.localLabelPos = this._labelPosition();
      },
      "form.labelAlign"(val) {
      }
    },
    created() {
      this.init(true);
      if (this.name && this.form) {
        this.$watch(
          () => {
            const val = this.form._getDataValue(this.name, this.form.localData);
            return val;
          },
          (value, oldVal) => {
            const isEqual2 = this.form._isEqual(value, oldVal);
            if (!isEqual2) {
              const val = this.itemSetValue(value);
              this.onFieldChange(val, false);
            }
          },
          {
            immediate: false
          }
        );
      }
    },
    unmounted() {
      this.__isUnmounted = true;
      this.unInit();
    },
    methods: {
      /**
       * 外部调用方法
       * 设置规则 ，主要用于小程序自定义检验规则
       * @param {Array} rules 规则源数据
       */
      setRules(rules = null) {
        this.userRules = rules;
        this.init(false);
      },
      // 兼容老版本表单组件
      setValue() {
      },
      /**
       * 外部调用方法
       * 校验数据
       * @param {any} value 需要校验的数据
       * @param {boolean} 是否立即校验
       * @return {Array|null} 校验内容
       */
      async onFieldChange(value, formtrigger = true) {
        const {
          formData,
          localData,
          errShowType,
          validateCheck,
          validateTrigger,
          _isRequiredField,
          _realName
        } = this.form;
        const name = _realName(this.name);
        if (!value) {
          value = this.form.formData[name];
        }
        const ruleLen = this.itemRules.rules && this.itemRules.rules.length;
        if (!this.validator || !ruleLen || ruleLen === 0)
          return;
        const isRequiredField2 = _isRequiredField(this.itemRules.rules || []);
        let result = null;
        if (validateTrigger === "bind" || formtrigger) {
          result = await this.validator.validateUpdate(
            {
              [name]: value
            },
            formData
          );
          if (!isRequiredField2 && (value === void 0 || value === "")) {
            result = null;
          }
          if (result && result.errorMessage) {
            if (errShowType === "undertext") {
              this.errMsg = !result ? "" : result.errorMessage;
            }
            if (errShowType === "toast") {
              uni.showToast({
                title: result.errorMessage || "校验错误",
                icon: "none"
              });
            }
            if (errShowType === "modal") {
              uni.showModal({
                title: "提示",
                content: result.errorMessage || "校验错误"
              });
            }
          } else {
            this.errMsg = "";
          }
          validateCheck(result ? result : null);
        } else {
          this.errMsg = "";
        }
        return result ? result : null;
      },
      /**
       * 初始组件数据
       */
      init(type = false) {
        const {
          validator,
          formRules,
          childrens,
          formData,
          localData,
          _realName,
          labelWidth,
          _getDataValue,
          _setDataValue
        } = this.form || {};
        this.localLabelAlign = this._justifyContent();
        this.localLabelWidth = this._labelWidthUnit(labelWidth);
        this.localLabelPos = this._labelPosition();
        this.form && type && childrens.push(this);
        if (!validator || !formRules)
          return;
        if (!this.form.isFirstBorder) {
          this.form.isFirstBorder = true;
          this.isFirstBorder = true;
        }
        if (this.group) {
          if (!this.group.isFirstBorder) {
            this.group.isFirstBorder = true;
            this.isFirstBorder = true;
          }
        }
        this.border = this.form.border;
        const name = _realName(this.name);
        const itemRule = this.userRules || this.rules;
        if (typeof formRules === "object" && itemRule) {
          formRules[name] = {
            rules: itemRule
          };
          validator.updateSchema(formRules);
        }
        const itemRules = formRules[name] || {};
        this.itemRules = itemRules;
        this.validator = validator;
        this.itemSetValue(_getDataValue(this.name, localData));
      },
      unInit() {
        if (this.form) {
          const {
            childrens,
            formData,
            _realName
          } = this.form;
          childrens.forEach((item, index2) => {
            if (item === this) {
              this.form.childrens.splice(index2, 1);
              delete formData[_realName(item.name)];
            }
          });
        }
      },
      // 设置item 的值
      itemSetValue(value) {
        const name = this.form._realName(this.name);
        const rules = this.itemRules.rules || [];
        const val = this.form._getValue(name, value, rules);
        this.form._setDataValue(name, this.form.formData, val);
        return val;
      },
      /**
       * 移除该表单项的校验结果
       */
      clearValidate() {
        this.errMsg = "";
      },
      // 是否显示星号
      _isRequired() {
        return this.required;
      },
      // 处理对齐方式
      _justifyContent() {
        if (this.form) {
          const {
            labelAlign
          } = this.form;
          let labelAli = this.labelAlign ? this.labelAlign : labelAlign;
          if (labelAli === "left")
            return "flex-start";
          if (labelAli === "center")
            return "center";
          if (labelAli === "right")
            return "flex-end";
        }
        return "flex-start";
      },
      // 处理 label宽度单位 ,继承父元素的值
      _labelWidthUnit(labelWidth) {
        return this.num2px(this.labelWidth ? this.labelWidth : labelWidth || (this.label ? 70 : "auto"));
      },
      // 处理 label 位置
      _labelPosition() {
        if (this.form)
          return this.form.labelPosition || "left";
        return "left";
      },
      /**
       * 触发时机
       * @param {Object} rule 当前规则内时机
       * @param {Object} itemRlue 当前组件时机
       * @param {Object} parentRule 父组件时机
       */
      isTrigger(rule, itemRlue, parentRule) {
        if (rule === "submit" || !rule) {
          if (rule === void 0) {
            if (itemRlue !== "bind") {
              if (!itemRlue) {
                return parentRule === "" ? "bind" : "submit";
              }
              return "submit";
            }
            return "bind";
          }
          return "submit";
        }
        return "bind";
      },
      num2px(num) {
        if (typeof num === "number") {
          return `${num}px`;
        }
        return num;
      }
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["uni-forms-item", ["is-direction-" + $data.localLabelPos, $data.border ? "uni-forms-item--border" : "", $data.border && $data.isFirstBorder ? "is-first-border" : ""]])
      },
      [
        vue.renderSlot(_ctx.$slots, "label", {}, () => [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["uni-forms-item__label", { "no-label": !$props.label && !$props.required }]),
              style: vue.normalizeStyle({ width: $data.localLabelWidth, justifyContent: $data.localLabelAlign })
            },
            [
              $props.required ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 0,
                class: "is-required"
              }, "*")) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($props.label),
                1
                /* TEXT */
              )
            ],
            6
            /* CLASS, STYLE */
          )
        ], true),
        vue.createElementVNode("view", { class: "uni-forms-item__content" }, [
          vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["uni-forms-item__error", { "msg--active": $options.msg }])
            },
            [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($options.msg),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          )
        ])
      ],
      2
      /* CLASS */
    );
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$g], ["__scopeId", "data-v-462874dd"], ["__file", "D:/project/dlw/uniapp-dileiwo/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue"]]);
  var pattern = {
    email: /^\S+?@\S+?\.\S+?$/,
    idcard: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
    url: new RegExp(
      "^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$",
      "i"
    )
  };
  const FORMAT_MAPPING = {
    "int": "integer",
    "bool": "boolean",
    "double": "number",
    "long": "number",
    "password": "string"
    // "fileurls": 'array'
  };
  function formatMessage(args, resources = "") {
    var defaultMessage = ["label"];
    defaultMessage.forEach((item) => {
      if (args[item] === void 0) {
        args[item] = "";
      }
    });
    let str = resources;
    for (let key in args) {
      let reg = new RegExp("{" + key + "}");
      str = str.replace(reg, args[key]);
    }
    return str;
  }
  function isEmptyValue(value, type) {
    if (value === void 0 || value === null) {
      return true;
    }
    if (typeof value === "string" && !value) {
      return true;
    }
    if (Array.isArray(value) && !value.length) {
      return true;
    }
    if (type === "object" && !Object.keys(value).length) {
      return true;
    }
    return false;
  }
  const types = {
    integer(value) {
      return types.number(value) && parseInt(value, 10) === value;
    },
    string(value) {
      return typeof value === "string";
    },
    number(value) {
      if (isNaN(value)) {
        return false;
      }
      return typeof value === "number";
    },
    "boolean": function(value) {
      return typeof value === "boolean";
    },
    "float": function(value) {
      return types.number(value) && !types.integer(value);
    },
    array(value) {
      return Array.isArray(value);
    },
    object(value) {
      return typeof value === "object" && !types.array(value);
    },
    date(value) {
      return value instanceof Date;
    },
    timestamp(value) {
      if (!this.integer(value) || Math.abs(value).toString().length > 16) {
        return false;
      }
      return true;
    },
    file(value) {
      return typeof value.url === "string";
    },
    email(value) {
      return typeof value === "string" && !!value.match(pattern.email) && value.length < 255;
    },
    url(value) {
      return typeof value === "string" && !!value.match(pattern.url);
    },
    pattern(reg, value) {
      try {
        return new RegExp(reg).test(value);
      } catch (e2) {
        return false;
      }
    },
    method(value) {
      return typeof value === "function";
    },
    idcard(value) {
      return typeof value === "string" && !!value.match(pattern.idcard);
    },
    "url-https"(value) {
      return this.url(value) && value.startsWith("https://");
    },
    "url-scheme"(value) {
      return value.startsWith("://");
    },
    "url-web"(value) {
      return false;
    }
  };
  class RuleValidator {
    constructor(message) {
      this._message = message;
    }
    async validateRule(fieldKey, fieldValue, value, data, allData) {
      var result = null;
      let rules = fieldValue.rules;
      let hasRequired = rules.findIndex((item) => {
        return item.required;
      });
      if (hasRequired < 0) {
        if (value === null || value === void 0) {
          return result;
        }
        if (typeof value === "string" && !value.length) {
          return result;
        }
      }
      var message = this._message;
      if (rules === void 0) {
        return message["default"];
      }
      for (var i2 = 0; i2 < rules.length; i2++) {
        let rule = rules[i2];
        let vt2 = this._getValidateType(rule);
        Object.assign(rule, {
          label: fieldValue.label || `["${fieldKey}"]`
        });
        if (RuleValidatorHelper[vt2]) {
          result = RuleValidatorHelper[vt2](rule, value, message);
          if (result != null) {
            break;
          }
        }
        if (rule.validateExpr) {
          let now2 = Date.now();
          let resultExpr = rule.validateExpr(value, allData, now2);
          if (resultExpr === false) {
            result = this._getMessage(rule, rule.errorMessage || this._message["default"]);
            break;
          }
        }
        if (rule.validateFunction) {
          result = await this.validateFunction(rule, value, data, allData, vt2);
          if (result !== null) {
            break;
          }
        }
      }
      if (result !== null) {
        result = message.TAG + result;
      }
      return result;
    }
    async validateFunction(rule, value, data, allData, vt2) {
      let result = null;
      try {
        let callbackMessage = null;
        const res2 = await rule.validateFunction(rule, value, allData || data, (message) => {
          callbackMessage = message;
        });
        if (callbackMessage || typeof res2 === "string" && res2 || res2 === false) {
          result = this._getMessage(rule, callbackMessage || res2, vt2);
        }
      } catch (e2) {
        result = this._getMessage(rule, e2.message, vt2);
      }
      return result;
    }
    _getMessage(rule, message, vt2) {
      return formatMessage(rule, message || rule.errorMessage || this._message[vt2] || message["default"]);
    }
    _getValidateType(rule) {
      var result = "";
      if (rule.required) {
        result = "required";
      } else if (rule.format) {
        result = "format";
      } else if (rule.arrayType) {
        result = "arrayTypeFormat";
      } else if (rule.range) {
        result = "range";
      } else if (rule.maximum !== void 0 || rule.minimum !== void 0) {
        result = "rangeNumber";
      } else if (rule.maxLength !== void 0 || rule.minLength !== void 0) {
        result = "rangeLength";
      } else if (rule.pattern) {
        result = "pattern";
      } else if (rule.validateFunction) {
        result = "validateFunction";
      }
      return result;
    }
  }
  const RuleValidatorHelper = {
    required(rule, value, message) {
      if (rule.required && isEmptyValue(value, rule.format || typeof value)) {
        return formatMessage(rule, rule.errorMessage || message.required);
      }
      return null;
    },
    range(rule, value, message) {
      const {
        range,
        errorMessage
      } = rule;
      let list = new Array(range.length);
      for (let i2 = 0; i2 < range.length; i2++) {
        const item = range[i2];
        if (types.object(item) && item.value !== void 0) {
          list[i2] = item.value;
        } else {
          list[i2] = item;
        }
      }
      let result = false;
      if (Array.isArray(value)) {
        result = new Set(value.concat(list)).size === list.length;
      } else {
        if (list.indexOf(value) > -1) {
          result = true;
        }
      }
      if (!result) {
        return formatMessage(rule, errorMessage || message["enum"]);
      }
      return null;
    },
    rangeNumber(rule, value, message) {
      if (!types.number(value)) {
        return formatMessage(rule, rule.errorMessage || message.pattern.mismatch);
      }
      let {
        minimum,
        maximum,
        exclusiveMinimum,
        exclusiveMaximum
      } = rule;
      let min = exclusiveMinimum ? value <= minimum : value < minimum;
      let max = exclusiveMaximum ? value >= maximum : value > maximum;
      if (minimum !== void 0 && min) {
        return formatMessage(rule, rule.errorMessage || message["number"][exclusiveMinimum ? "exclusiveMinimum" : "minimum"]);
      } else if (maximum !== void 0 && max) {
        return formatMessage(rule, rule.errorMessage || message["number"][exclusiveMaximum ? "exclusiveMaximum" : "maximum"]);
      } else if (minimum !== void 0 && maximum !== void 0 && (min || max)) {
        return formatMessage(rule, rule.errorMessage || message["number"].range);
      }
      return null;
    },
    rangeLength(rule, value, message) {
      if (!types.string(value) && !types.array(value)) {
        return formatMessage(rule, rule.errorMessage || message.pattern.mismatch);
      }
      let min = rule.minLength;
      let max = rule.maxLength;
      let val = value.length;
      if (min !== void 0 && val < min) {
        return formatMessage(rule, rule.errorMessage || message["length"].minLength);
      } else if (max !== void 0 && val > max) {
        return formatMessage(rule, rule.errorMessage || message["length"].maxLength);
      } else if (min !== void 0 && max !== void 0 && (val < min || val > max)) {
        return formatMessage(rule, rule.errorMessage || message["length"].range);
      }
      return null;
    },
    pattern(rule, value, message) {
      if (!types["pattern"](rule.pattern, value)) {
        return formatMessage(rule, rule.errorMessage || message.pattern.mismatch);
      }
      return null;
    },
    format(rule, value, message) {
      var customTypes = Object.keys(types);
      var format = FORMAT_MAPPING[rule.format] ? FORMAT_MAPPING[rule.format] : rule.format || rule.arrayType;
      if (customTypes.indexOf(format) > -1) {
        if (!types[format](value)) {
          return formatMessage(rule, rule.errorMessage || message.typeError);
        }
      }
      return null;
    },
    arrayTypeFormat(rule, value, message) {
      if (!Array.isArray(value)) {
        return formatMessage(rule, rule.errorMessage || message.typeError);
      }
      for (let i2 = 0; i2 < value.length; i2++) {
        const element = value[i2];
        let formatResult = this.format(rule, element, message);
        if (formatResult !== null) {
          return formatResult;
        }
      }
      return null;
    }
  };
  class SchemaValidator extends RuleValidator {
    constructor(schema, options) {
      super(SchemaValidator.message);
      this._schema = schema;
      this._options = options || null;
    }
    updateSchema(schema) {
      this._schema = schema;
    }
    async validate(data, allData) {
      let result = this._checkFieldInSchema(data);
      if (!result) {
        result = await this.invokeValidate(data, false, allData);
      }
      return result.length ? result[0] : null;
    }
    async validateAll(data, allData) {
      let result = this._checkFieldInSchema(data);
      if (!result) {
        result = await this.invokeValidate(data, true, allData);
      }
      return result;
    }
    async validateUpdate(data, allData) {
      let result = this._checkFieldInSchema(data);
      if (!result) {
        result = await this.invokeValidateUpdate(data, false, allData);
      }
      return result.length ? result[0] : null;
    }
    async invokeValidate(data, all, allData) {
      let result = [];
      let schema = this._schema;
      for (let key in schema) {
        let value = schema[key];
        let errorMessage = await this.validateRule(key, value, data[key], data, allData);
        if (errorMessage != null) {
          result.push({
            key,
            errorMessage
          });
          if (!all)
            break;
        }
      }
      return result;
    }
    async invokeValidateUpdate(data, all, allData) {
      let result = [];
      for (let key in data) {
        let errorMessage = await this.validateRule(key, this._schema[key], data[key], data, allData);
        if (errorMessage != null) {
          result.push({
            key,
            errorMessage
          });
          if (!all)
            break;
        }
      }
      return result;
    }
    _checkFieldInSchema(data) {
      var keys = Object.keys(data);
      var keys2 = Object.keys(this._schema);
      if (new Set(keys.concat(keys2)).size === keys2.length) {
        return "";
      }
      var noExistFields = keys.filter((key) => {
        return keys2.indexOf(key) < 0;
      });
      var errorMessage = formatMessage({
        field: JSON.stringify(noExistFields)
      }, SchemaValidator.message.TAG + SchemaValidator.message["defaultInvalid"]);
      return [{
        key: "invalid",
        errorMessage
      }];
    }
  }
  function Message() {
    return {
      TAG: "",
      default: "验证错误",
      defaultInvalid: "提交的字段{field}在数据库中并不存在",
      validateFunction: "验证无效",
      required: "{label}必填",
      "enum": "{label}超出范围",
      timestamp: "{label}格式无效",
      whitespace: "{label}不能为空",
      typeError: "{label}类型无效",
      date: {
        format: "{label}日期{value}格式无效",
        parse: "{label}日期无法解析,{value}无效",
        invalid: "{label}日期{value}无效"
      },
      length: {
        minLength: "{label}长度不能少于{minLength}",
        maxLength: "{label}长度不能超过{maxLength}",
        range: "{label}必须介于{minLength}和{maxLength}之间"
      },
      number: {
        minimum: "{label}不能小于{minimum}",
        maximum: "{label}不能大于{maximum}",
        exclusiveMinimum: "{label}不能小于等于{minimum}",
        exclusiveMaximum: "{label}不能大于等于{maximum}",
        range: "{label}必须介于{minimum}and{maximum}之间"
      },
      pattern: {
        mismatch: "{label}格式不匹配"
      }
    };
  }
  SchemaValidator.message = new Message();
  const deepCopy$1 = (val) => {
    return JSON.parse(JSON.stringify(val));
  };
  const typeFilter = (format) => {
    return format === "int" || format === "double" || format === "number" || format === "timestamp";
  };
  const getValue = (key, value, rules) => {
    const isRuleNumType = rules.find((val) => val.format && typeFilter(val.format));
    const isRuleBoolType = rules.find((val) => val.format && val.format === "boolean" || val.format === "bool");
    if (!!isRuleNumType) {
      if (!value && value !== 0) {
        value = null;
      } else {
        value = isNumber(Number(value)) ? Number(value) : value;
      }
    }
    if (!!isRuleBoolType) {
      value = isBoolean(value) ? value : false;
    }
    return value;
  };
  const setDataValue = (field, formdata, value) => {
    formdata[field] = value;
    return value || "";
  };
  const getDataValue = (field, data) => {
    return objGet(data, field);
  };
  const realName = (name, data = {}) => {
    const base_name = _basePath(name);
    if (typeof base_name === "object" && Array.isArray(base_name) && base_name.length > 1) {
      const realname = base_name.reduce((a2, b2) => a2 += `#${b2}`, "_formdata_");
      return realname;
    }
    return base_name[0] || name;
  };
  const isRealName = (name) => {
    const reg = /^_formdata_#*/;
    return reg.test(name);
  };
  const rawData = (object = {}, name) => {
    let newData = JSON.parse(JSON.stringify(object));
    let formData = {};
    for (let i2 in newData) {
      let path = name2arr(i2);
      objSet(formData, path, newData[i2]);
    }
    return formData;
  };
  const name2arr = (name) => {
    let field = name.replace("_formdata_#", "");
    field = field.split("#").map((v2) => isNumber(v2) ? Number(v2) : v2);
    return field;
  };
  const objSet = (object, path, value) => {
    if (typeof object !== "object")
      return object;
    _basePath(path).reduce((o2, k, i2, _2) => {
      if (i2 === _2.length - 1) {
        o2[k] = value;
        return null;
      } else if (k in o2) {
        return o2[k];
      } else {
        o2[k] = /^[0-9]{1,}$/.test(_2[i2 + 1]) ? [] : {};
        return o2[k];
      }
    }, object);
    return object;
  };
  function _basePath(path) {
    if (Array.isArray(path))
      return path;
    return path.replace(/\[/g, ".").replace(/\]/g, "").split(".");
  }
  const objGet = (object, path, defaultVal = "undefined") => {
    let newPath = _basePath(path);
    let val = newPath.reduce((o2, k) => {
      return (o2 || {})[k];
    }, object);
    return !val || val !== void 0 ? val : defaultVal;
  };
  const isNumber = (num) => {
    return !isNaN(Number(num));
  };
  const isBoolean = (bool) => {
    return typeof bool === "boolean";
  };
  const isRequiredField = (rules) => {
    let isNoField = false;
    for (let i2 = 0; i2 < rules.length; i2++) {
      const ruleData = rules[i2];
      if (ruleData.required) {
        isNoField = true;
        break;
      }
    }
    return isNoField;
  };
  const isEqual = (a2, b2) => {
    if (a2 === b2) {
      return a2 !== 0 || 1 / a2 === 1 / b2;
    }
    if (a2 == null || b2 == null) {
      return a2 === b2;
    }
    var classNameA = toString.call(a2), classNameB = toString.call(b2);
    if (classNameA !== classNameB) {
      return false;
    }
    switch (classNameA) {
      case "[object RegExp]":
      case "[object String]":
        return "" + a2 === "" + b2;
      case "[object Number]":
        if (+a2 !== +a2) {
          return +b2 !== +b2;
        }
        return +a2 === 0 ? 1 / +a2 === 1 / b2 : +a2 === +b2;
      case "[object Date]":
      case "[object Boolean]":
        return +a2 === +b2;
    }
    if (classNameA == "[object Object]") {
      var propsA = Object.getOwnPropertyNames(a2), propsB = Object.getOwnPropertyNames(b2);
      if (propsA.length != propsB.length) {
        return false;
      }
      for (var i2 = 0; i2 < propsA.length; i2++) {
        var propName = propsA[i2];
        if (a2[propName] !== b2[propName]) {
          return false;
        }
      }
      return true;
    }
    if (classNameA == "[object Array]") {
      if (a2.toString() == b2.toString()) {
        return true;
      }
      return false;
    }
  };
  const _sfc_main$g = {
    name: "uniForms",
    emits: ["validate", "submit"],
    options: {
      virtualHost: true
    },
    props: {
      // 即将弃用
      value: {
        type: Object,
        default() {
          return null;
        }
      },
      // vue3 替换 value 属性
      modelValue: {
        type: Object,
        default() {
          return null;
        }
      },
      // 1.4.0 开始将不支持 v-model ，且废弃 value 和 modelValue
      model: {
        type: Object,
        default() {
          return null;
        }
      },
      // 表单校验规则
      rules: {
        type: Object,
        default() {
          return {};
        }
      },
      //校验错误信息提示方式 默认 undertext 取值 [undertext|toast|modal]
      errShowType: {
        type: String,
        default: "undertext"
      },
      // 校验触发器方式 默认 bind 取值 [bind|submit]
      validateTrigger: {
        type: String,
        default: "submit"
      },
      // label 位置，默认 left 取值  top/left
      labelPosition: {
        type: String,
        default: "left"
      },
      // label 宽度
      labelWidth: {
        type: [String, Number],
        default: ""
      },
      // label 居中方式，默认 left 取值 left/center/right
      labelAlign: {
        type: String,
        default: "left"
      },
      border: {
        type: Boolean,
        default: false
      }
    },
    provide() {
      return {
        uniForm: this
      };
    },
    data() {
      return {
        // 表单本地值的记录，不应该与传如的值进行关联
        formData: {},
        formRules: {}
      };
    },
    computed: {
      // 计算数据源变化的
      localData() {
        const localVal = this.model || this.modelValue || this.value;
        if (localVal) {
          return deepCopy$1(localVal);
        }
        return {};
      }
    },
    watch: {
      // 监听数据变化 ,暂时不使用，需要单独赋值
      // localData: {},
      // 监听规则变化
      rules: {
        handler: function(val, oldVal) {
          this.setRules(val);
        },
        deep: true,
        immediate: true
      }
    },
    created() {
      let getbinddata = getApp().$vm.$.appContext.config.globalProperties.binddata;
      if (!getbinddata) {
        getApp().$vm.$.appContext.config.globalProperties.binddata = function(name, value, formName) {
          if (formName) {
            this.$refs[formName].setValue(name, value);
          } else {
            let formVm;
            for (let i2 in this.$refs) {
              const vm = this.$refs[i2];
              if (vm && vm.$options && vm.$options.name === "uniForms") {
                formVm = vm;
                break;
              }
            }
            if (!formVm)
              return formatAppLog("error", "at uni_modules/uni-forms/components/uni-forms/uni-forms.vue:187", "当前 uni-froms 组件缺少 ref 属性");
            if (formVm.model)
              formVm.model[name] = value;
            if (formVm.modelValue)
              formVm.modelValue[name] = value;
            if (formVm.value)
              formVm.value[name] = value;
          }
        };
      }
      this.childrens = [];
      this.inputChildrens = [];
      this.setRules(this.rules);
    },
    methods: {
      /**
       * 外部调用方法
       * 设置规则 ，主要用于小程序自定义检验规则
       * @param {Array} rules 规则源数据
       */
      setRules(rules) {
        this.formRules = Object.assign({}, this.formRules, rules);
        this.validator = new SchemaValidator(rules);
      },
      /**
       * 外部调用方法
       * 设置数据，用于设置表单数据，公开给用户使用 ， 不支持在动态表单中使用
       * @param {Object} key
       * @param {Object} value
       */
      setValue(key, value) {
        let example = this.childrens.find((child) => child.name === key);
        if (!example)
          return null;
        this.formData[key] = getValue(key, value, this.formRules[key] && this.formRules[key].rules || []);
        return example.onFieldChange(this.formData[key]);
      },
      /**
       * 外部调用方法
       * 手动提交校验表单
       * 对整个表单进行校验的方法，参数为一个回调函数。
       * @param {Array} keepitem 保留不参与校验的字段
       * @param {type} callback 方法回调
       */
      validate(keepitem, callback) {
        return this.checkAll(this.formData, keepitem, callback);
      },
      /**
       * 外部调用方法
       * 部分表单校验
       * @param {Array|String} props 需要校验的字段
       * @param {Function} 回调函数
       */
      validateField(props2 = [], callback) {
        props2 = [].concat(props2);
        let invalidFields = {};
        this.childrens.forEach((item) => {
          const name = realName(item.name);
          if (props2.indexOf(name) !== -1) {
            invalidFields = Object.assign({}, invalidFields, {
              [name]: this.formData[name]
            });
          }
        });
        return this.checkAll(invalidFields, [], callback);
      },
      /**
       * 外部调用方法
       * 移除表单项的校验结果。传入待移除的表单项的 prop 属性或者 prop 组成的数组，如不传则移除整个表单的校验结果
       * @param {Array|String} props 需要移除校验的字段 ，不填为所有
       */
      clearValidate(props2 = []) {
        props2 = [].concat(props2);
        this.childrens.forEach((item) => {
          if (props2.length === 0) {
            item.errMsg = "";
          } else {
            const name = realName(item.name);
            if (props2.indexOf(name) !== -1) {
              item.errMsg = "";
            }
          }
        });
      },
      /**
       * 外部调用方法 ，即将废弃
       * 手动提交校验表单
       * 对整个表单进行校验的方法，参数为一个回调函数。
       * @param {Array} keepitem 保留不参与校验的字段
       * @param {type} callback 方法回调
       */
      submit(keepitem, callback, type) {
        for (let i2 in this.dataValue) {
          const itemData = this.childrens.find((v2) => v2.name === i2);
          if (itemData) {
            if (this.formData[i2] === void 0) {
              this.formData[i2] = this._getValue(i2, this.dataValue[i2]);
            }
          }
        }
        if (!type) {
          formatAppLog("warn", "at uni_modules/uni-forms/components/uni-forms/uni-forms.vue:296", "submit 方法即将废弃，请使用validate方法代替！");
        }
        return this.checkAll(this.formData, keepitem, callback, "submit");
      },
      // 校验所有
      async checkAll(invalidFields, keepitem, callback, type) {
        if (!this.validator)
          return;
        let childrens = [];
        for (let i2 in invalidFields) {
          const item = this.childrens.find((v2) => realName(v2.name) === i2);
          if (item) {
            childrens.push(item);
          }
        }
        if (!callback && typeof keepitem === "function") {
          callback = keepitem;
        }
        let promise;
        if (!callback && typeof callback !== "function" && Promise) {
          promise = new Promise((resolve, reject) => {
            callback = function(valid, invalidFields2) {
              !valid ? resolve(invalidFields2) : reject(valid);
            };
          });
        }
        let results = [];
        let tempFormData = JSON.parse(JSON.stringify(invalidFields));
        for (let i2 in childrens) {
          const child = childrens[i2];
          let name = realName(child.name);
          const result = await child.onFieldChange(tempFormData[name]);
          if (result) {
            results.push(result);
            if (this.errShowType === "toast" || this.errShowType === "modal")
              break;
          }
        }
        if (Array.isArray(results)) {
          if (results.length === 0)
            results = null;
        }
        if (Array.isArray(keepitem)) {
          keepitem.forEach((v2) => {
            let vName = realName(v2);
            let value = getDataValue(v2, this.localData);
            if (value !== void 0) {
              tempFormData[vName] = value;
            }
          });
        }
        if (type === "submit") {
          this.$emit("submit", {
            detail: {
              value: tempFormData,
              errors: results
            }
          });
        } else {
          this.$emit("validate", results);
        }
        let resetFormData = {};
        resetFormData = rawData(tempFormData, this.name);
        callback && typeof callback === "function" && callback(results, resetFormData);
        if (promise && callback) {
          return promise;
        } else {
          return null;
        }
      },
      /**
       * 返回validate事件
       * @param {Object} result
       */
      validateCheck(result) {
        this.$emit("validate", result);
      },
      _getValue: getValue,
      _isRequiredField: isRequiredField,
      _setDataValue: setDataValue,
      _getDataValue: getDataValue,
      _realName: realName,
      _isRealName: isRealName,
      _isEqual: isEqual
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-forms" }, [
      vue.createElementVNode("form", null, [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ])
    ]);
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__scopeId", "data-v-9a1e3c32"], ["__file", "D:/project/dlw/uniapp-dileiwo/uni_modules/uni-forms/components/uni-forms/uni-forms.vue"]]);
  const _sfc_main$f = {
    __name: "check",
    setup(__props, { expose: __expose }) {
      __expose();
      const { ctx } = vue.getCurrentInstance();
      const formData = vue.ref({});
      const rules = {
        isCateCorrect: {
          rules: [{
            required: true,
            errorMessage: "请选择"
          }]
        },
        quantity: {
          rules: [{
            required: true,
            errorMessage: "请选择"
          }]
        },
        ambiguity: {
          rules: [{
            required: true,
            errorMessage: "请选择"
          }]
        }
      };
      const row2 = vue.ref({});
      onLoad((option) => {
        formatAppLog("log", "at pages/auth/check.vue:137", "option", option);
        row2.value = option.item ? JSON.parse(option.item) : {};
      });
      const changeCategory = (e2) => {
        formatAppLog("log", "at pages/auth/check.vue:143", e2);
        formData.value.isCateCorrect = e2.detail.value;
      };
      const changeQuantity = (e2) => {
        formatAppLog("log", "at pages/auth/check.vue:147", e2);
        formData.value.quantity = e2.detail.value;
      };
      const changeAmbiguity = (e2) => {
        formatAppLog("log", "at pages/auth/check.vue:151", e2);
        formData.value.ambiguity = e2.detail.value;
      };
      const submit = (ref) => {
      };
      const handleNext = async (ref) => {
        var _a, _b, _c;
        formatAppLog("log", "at pages/auth/check.vue:160", "formData", formData);
        if (!((_a = formData.value) == null ? void 0 : _a.isCateCorrect)) {
          uni.showToast({
            title: "请确认包装型号",
            icon: "none"
          });
          return;
        }
        if (!((_b = formData.value) == null ? void 0 : _b.isCateCorrect)) {
          uni.showToast({
            title: "请确认包装数量",
            icon: "none"
          });
          return;
        }
        if (!((_c = formData.value) == null ? void 0 : _c.ambiguity)) {
          uni.showToast({
            title: "请确认是否有疑品",
            icon: "none"
          });
          return;
        }
        if (formData.value.isCateCorrect === "1" && formData.value.quantity === "1") {
          if (formData.value.ambiguity === "1") {
            uni.navigateTo({
              url: "/pages/auth/authError?errorType=3"
            });
          } else {
            await authConfirm(row2.value.id);
            uni.navigateTo({
              url: "/pages/auth/authError?errorType=0"
            });
          }
        } else {
          uni.navigateTo({
            url: "/pages/auth/detailList?item=" + JSON.stringify(row2.value)
          });
        }
      };
      const __returned__ = { ctx, formData, rules, row: row2, changeCategory, changeQuantity, changeAmbiguity, submit, handleNext, ref: vue.ref, getCurrentInstance: vue.getCurrentInstance, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get authConfirm() {
        return authConfirm;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_forms_item = resolveEasycom(vue.resolveDynamicComponent("uni-forms-item"), __easycom_0);
    const _component_uni_forms = resolveEasycom(vue.resolveDynamicComponent("uni-forms"), __easycom_1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "check-container" }, [
      vue.createElementVNode("view", { class: "check-content bg_white" }, [
        vue.createElementVNode("view", { class: "check-info w_100 ta-c pb-48" }, [
          vue.createElementVNode(
            "view",
            { class: "title" },
            vue.toDisplayString($setup.row.order_no),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "sub mt-16" }, [
            vue.createElementVNode("text", { class: "color-subTitlle" }, "数量："),
            vue.createElementVNode(
              "text",
              { class: "num" },
              vue.toDisplayString($setup.row.total_count),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "mt-48 fs-32" }, [
          vue.createVNode(_component_uni_forms, {
            class: "check-form",
            ref: "valiForm",
            model: $setup.formData,
            rules: $setup.rules,
            "label-position": "top",
            "label-width": "250px"
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(_component_uni_forms_item, {
                class: "fs-32",
                label: "1、请确认包装型号是否正确？",
                name: "isCateCorrect",
                required: ""
              }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode(
                    "radio-group",
                    { onChange: $setup.changeCategory },
                    [
                      vue.createElementVNode("label", { class: "radio" }, [
                        vue.createElementVNode("radio", {
                          value: "1",
                          checked: $setup.formData.isCateCorrect === "1",
                          color: "#99BBA0",
                          "checked-color": "#99BBA0"
                        }, null, 8, ["checked"]),
                        vue.createTextVNode("是 ")
                      ]),
                      vue.createElementVNode("label", { class: "radio" }, [
                        vue.createElementVNode("radio", {
                          value: "2",
                          checked: $setup.formData.isCateCorrect === "2",
                          color: "#99BBA0",
                          "checked-color": "#99BBA0"
                        }, null, 8, ["checked"]),
                        vue.createTextVNode("否 ")
                      ])
                    ],
                    32
                    /* NEED_HYDRATION */
                  )
                ]),
                _: 1
                /* STABLE */
              }),
              vue.createVNode(_component_uni_forms_item, {
                label: "2、请确认包装数量是否正确？",
                name: "quantity",
                required: ""
              }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode(
                    "radio-group",
                    { onChange: $setup.changeQuantity },
                    [
                      vue.createElementVNode("label", { class: "radio" }, [
                        vue.createElementVNode("radio", {
                          value: "1",
                          checked: $setup.formData.quantity === "1",
                          color: "#99BBA0",
                          "checked-color": "#99BBA0"
                        }, null, 8, ["checked"]),
                        vue.createTextVNode("是 ")
                      ]),
                      vue.createElementVNode("label", { class: "radio" }, [
                        vue.createElementVNode("radio", {
                          value: "2",
                          checked: $setup.formData.quantity === "2",
                          color: "#99BBA0",
                          "checked-color": "#99BBA0"
                        }, null, 8, ["checked"]),
                        vue.createTextVNode("否 ")
                      ])
                    ],
                    32
                    /* NEED_HYDRATION */
                  )
                ]),
                _: 1
                /* STABLE */
              }),
              vue.createVNode(_component_uni_forms_item, {
                required: "",
                name: "ambiguity",
                label: "3、请确认是否有疑品包装？"
              }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode(
                    "radio-group",
                    { onChange: $setup.changeAmbiguity },
                    [
                      vue.createElementVNode("label", { class: "radio" }, [
                        vue.createElementVNode("radio", {
                          value: "1",
                          checked: $setup.formData.ambiguity === "1",
                          color: "#99BBA0",
                          "checked-color": "#99BBA0"
                        }, null, 8, ["checked"]),
                        vue.createTextVNode("是 ")
                      ]),
                      vue.createElementVNode("label", { class: "radio" }, [
                        vue.createElementVNode("radio", {
                          value: "2",
                          checked: $setup.formData.ambiguity === "2",
                          color: "#99BBA0",
                          "checked-color": "#99BBA0"
                        }, null, 8, ["checked"]),
                        vue.createTextVNode("否 ")
                      ])
                    ],
                    32
                    /* NEED_HYDRATION */
                  ),
                  vue.createCommentVNode(' <radio-group @change="changeAmbiguity"\r\n							@blur="(e)=>$refs.input.onFieldChange($event.detail.value)">\r\n							<label class="radio">\r\n								<radio value="1" color="#99BBA0" backgroundColor="#99BBA0" borderColor="#99BBA0" activeBackgroundColor="#99BBA0" activeBorderColor="#99BBA0" iconColor="#99BBA0" />是\r\n							</label>\r\n							<label class="radio">\r\n								<radio value="2" color="#99BBA0" backgroundColor="#99BBA0" borderColor="#99BBA0" activeBackgroundColor="#99BBA0" activeBorderColor="#99BBA0" iconColor="#99BBA0" />否\r\n							</label>\r\n						</radio-group> ')
                ]),
                _: 1
                /* STABLE */
              })
            ]),
            _: 1
            /* STABLE */
          }, 8, ["model"])
        ])
      ]),
      vue.createElementVNode("view", { class: "w_100 mt-48" }, [
        vue.createElementVNode("button", {
          class: "custom-btn",
          onClick: _cache[0] || (_cache[0] = ($event) => $setup.handleNext("valiForm"))
        }, "下一步")
      ])
    ]);
  }
  const PagesAuthCheck = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__scopeId", "data-v-f0ba12bd"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/auth/check.vue"]]);
  const packageStatusOption = [
    {
      label: "未认证",
      value: 0
    },
    {
      label: "已认证",
      value: 1
    },
    {
      label: "已损坏",
      value: 2
    },
    {
      label: "出库-租赁",
      value: 3
    },
    {
      label: "出库-购买",
      value: 4
    },
    {
      label: "客户已认证",
      value: 5
    },
    {
      label: "客户出库",
      value: 6
    },
    {
      label: "型号错误",
      value: 7
    }
  ];
  const adminPkgStatusOption = [
    {
      label: "未认证",
      value: 0
    },
    {
      label: "已认证",
      value: 1
    },
    {
      label: "已损坏",
      value: 2
    },
    {
      label: "已出库",
      value: 3
    },
    {
      label: "已出库",
      value: 4
    },
    {
      label: "已出库",
      value: 5
    },
    {
      label: "已出库",
      value: 6
    },
    {
      label: "型号错误",
      value: 7
    }
  ];
  const webPkgStatusOption = [
    {
      label: "已损坏",
      value: 2
    },
    {
      label: "未认证",
      value: 3
    },
    {
      label: "未认证",
      value: 4
    },
    {
      label: "已认证",
      value: 5
    },
    {
      label: "已出库",
      value: 6
    },
    {
      label: "型号错误",
      value: 7
    }
  ];
  const _sfc_main$e = {
    __name: "detailList",
    setup(__props, { expose: __expose }) {
      __expose();
      const verified_count = vue.ref(0);
      const total_count = vue.ref(0);
      const isLoad = vue.ref(false);
      const row2 = vue.ref({});
      const role2 = vue.ref("");
      onLoad((option) => {
        role2.value = uni.getStorageSync("ROLE_KEY");
        formatAppLog("log", "at pages/auth/detailList.vue:59", role2.value);
        formatAppLog("log", "at pages/auth/detailList.vue:60", "option", option);
        const item = option.item ? JSON.parse(option.item) : {};
        row2.value = item;
        const id = item.id;
        loadDetail(id);
      });
      const list = vue.ref([]);
      const loadMoreText2 = vue.ref("加载中...");
      const showLoadMore = vue.ref(false);
      const total = vue.ref(0);
      const formData = vue.ref({
        isCateCorrect: ""
      });
      const success_count = vue.ref(0);
      const loadDetail = async (id, isfresh) => {
        try {
          const res2 = await getScanResult(id);
          total.value = res2.data.total_count;
          if (role2.value === "admin") {
            if (isfresh) {
              list.value = res2.data.list;
            } else {
              list.value = list.value.concat(res2.data.list);
            }
            formatAppLog("log", "at pages/auth/detailList.vue:87", list.value);
            uni.stopPullDownRefresh();
            uni.setNavigationBarTitle({
              title: `明细列表(${res2.data.success_count}/${total.value})`
            });
          } else {
            if (isfresh) {
              list.value = res2.data.list;
            } else {
              list.value = list.value.concat(res2.data.list);
            }
            success_count.value = res2.data.success_count;
            uni.setNavigationBarTitle({
              title: `明细列表(${res2.data.success_count}/${res2.data.total_count})`
            });
            uni.stopPullDownRefresh();
          }
          isLoad.value = true;
        } catch (e2) {
          uni.stopPullDownRefresh();
          isLoad.value = true;
        }
      };
      onPullDownRefresh(() => {
        formatAppLog("log", "at pages/auth/detailList.vue:112", row2.value.id);
        loadDetail(row2.value.id, true);
      });
      onReachBottom(() => {
        formatAppLog("log", "at pages/auth/detailList.vue:116", "onReachBottom");
        if (list.value.length == total.value) {
          loadMoreText2.value = "没有更多数据了!";
          return;
        }
        page.value.page++;
        showLoadMore.value = true;
        setTimeout(() => {
          loadDetail(row2.value.id);
        }, 300);
      });
      const pageTo = () => {
      };
      const handleScan = async () => {
        let status = await checkPermission();
        if (status !== 1) {
          return;
        }
        uni.scanCode({
          success: async (res2) => {
            if (role2.value === "admin") {
              try {
                const resScan = await scanAdmin({
                  id: row2.value.id,
                  type: 1,
                  detail_no: res2.result
                });
                uni.showToast({
                  title: "认证成功",
                  icon: "none"
                });
                uni.startPullDownRefresh();
              } catch (error) {
              }
            } else {
              try {
                await scanCustomer({
                  outbound: row2.value.id,
                  detail_no: res2.result
                });
                uni.showToast({
                  title: "认证成功",
                  icon: "none"
                });
                uni.startPullDownRefresh();
              } catch (error) {
              }
            }
          },
          fail: (err) => {
          }
        });
      };
      const checkPermission = async (code) => {
        let status = permission.isIOS ? await permission.requestIOS("camera") : await permission.requestAndroid("android.permission.CAMERA");
        if (status === null || status === 1) {
          status = 1;
        } else {
          uni.showModal({
            content: "需要相机权限",
            confirmText: "设置",
            success: function(res2) {
              if (res2.confirm) {
                permission.gotoAppSetting();
              }
            }
          });
        }
        return status;
      };
      const handleFinish = () => {
        if (role2.value == "web") {
          if (success_count.value != total.value) {
            uni.navigateTo({
              url: "/pages/auth/authError?errorType=2"
            });
          }
        } else {
          uni.navigateBack({
            delta: 2
          });
        }
      };
      const __returned__ = { verified_count, total_count, isLoad, row: row2, role: role2, list, loadMoreText: loadMoreText2, showLoadMore, total, formData, success_count, loadDetail, pageTo, handleScan, checkPermission, handleFinish, get permision() {
        return permission;
      }, Empty, ref: vue.ref, onMounted: vue.onMounted, getCurrentInstance: vue.getCurrentInstance, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      }, get getScanResult() {
        return getScanResult;
      }, get scanAdmin() {
        return scanAdmin;
      }, get scanCustomer() {
        return scanCustomer;
      }, get packageStatusOption() {
        return packageStatusOption;
      }, get adminPkgStatusOption() {
        return adminPkgStatusOption;
      }, get webPkgStatusOption() {
        return webPkgStatusOption;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return $setup.isLoad ? (vue.openBlock(), vue.createElementBlock("view", {
      key: 0,
      class: "check-container pt-16"
    }, [
      vue.createElementVNode("view", { class: "detail-list" }, [
        $setup.list.length ? (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          { key: 0 },
          vue.renderList($setup.list, (item, index2) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "detail-item bg_white d-f w_100 jc-sb ai-c pl-32 pr-28",
              key: index2,
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.pageTo())
            }, [
              vue.createElementVNode(
                "view",
                { class: "title ellipsis_1 flex-1" },
                vue.toDisplayString(item.detail_no),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["sub uni-success w-110", { "uni-error": item.status === 7 || item.status === 0 }])
                },
                [
                  $setup.role === "admin" ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    { key: 0 },
                    vue.toDisplayString($setup.adminPkgStatusOption.find((op) => op.value === item.status).label),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true),
                  $setup.role === "web" ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    { key: 1 },
                    vue.toDisplayString($setup.webPkgStatusOption.find((op) => op.value === item.status).label),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true)
                ],
                2
                /* CLASS */
              )
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )) : (vue.openBlock(), vue.createBlock($setup["Empty"], {
          key: 1,
          class: "no-data ta-c uni-list-cell-pd"
        }))
      ]),
      vue.createElementVNode("view", {
        class: "footer w_100 mt-48 pt-20 fixed pb-20 safe-area-bottom bg-white",
        style: {}
      }, [
        vue.createElementVNode("button", {
          class: "custom-btn",
          type: "",
          onClick: $setup.handleScan
        }, "扫一扫"),
        vue.createElementVNode("button", {
          class: "custom-btn mt-10",
          onClick: $setup.handleFinish
        }, "结束初始认证")
      ])
    ])) : vue.createCommentVNode("v-if", true);
  }
  const PagesAuthDetailList = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__scopeId", "data-v-9ed9ae8a"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/auth/detailList.vue"]]);
  const _imports_0$1 = "/static/image/auth-success@2x.png";
  const _imports_1 = "/static/image/auth-error-1@2x.png";
  const _imports_2 = "/static/image/auth-error-2@2x.png";
  const _imports_3 = "/static/image/auth-error-3@2x.png";
  const _sfc_main$d = {
    __name: "authError",
    setup(__props, { expose: __expose }) {
      __expose();
      const errorType = vue.ref(1);
      onLoad((option) => {
        formatAppLog("log", "at pages/auth/authError.vue:37", option);
        let data = option;
        errorType.value = data.errorType;
      });
      const navigatorBack = () => {
        if (errorType.value == 3) {
          uni.navigateBack({
            delta: 3
          });
          return;
        }
        if (errorType.value == 0) {
          uni.navigateBack({
            delta: 2
          });
          return;
        }
        uni.navigateBack();
      };
      const __returned__ = { errorType, navigatorBack, ref: vue.ref, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "auth-error-container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        $setup.errorType == 0 ? (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 0 },
          [
            vue.createElementVNode("image", {
              class: "error-image",
              src: _imports_0$1,
              mode: ""
            }),
            vue.createElementVNode("text", { class: "error-title fs-36" }, "初始认证完成！")
          ],
          64
          /* STABLE_FRAGMENT */
        )) : $setup.errorType == 1 ? (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 1 },
          [
            vue.createElementVNode("image", {
              class: "error-image",
              src: _imports_1,
              mode: ""
            }),
            vue.createElementVNode("text", { class: "error-title fs-36" }, "型号核实有误"),
            vue.createElementVNode("text", { class: "error-desc fs-28 color-subTitlle" }, [
              vue.createTextVNode("请尽快联系迪雷沃，错误型号"),
              vue.createElementVNode("br"),
              vue.createTextVNode("包装换货退运")
            ])
          ],
          64
          /* STABLE_FRAGMENT */
        )) : vue.createCommentVNode("v-if", true),
        $setup.errorType == 2 ? (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 2 },
          [
            vue.createElementVNode("image", {
              class: "error-image",
              src: _imports_2,
              mode: ""
            }),
            vue.createElementVNode("text", { class: "error-title fs-36" }, "数量核实有误"),
            vue.createElementVNode("text", { class: "error-desc fs-28 color-subTitlle" }, [
              vue.createTextVNode("请尽快联系迪雷沃，包装数量"),
              vue.createElementVNode("br"),
              vue.createTextVNode("短少事宜")
            ])
          ],
          64
          /* STABLE_FRAGMENT */
        )) : vue.createCommentVNode("v-if", true),
        $setup.errorType == 3 ? (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 3 },
          [
            vue.createElementVNode("image", {
              class: "error-image",
              src: _imports_3,
              mode: ""
            }),
            vue.createElementVNode("text", { class: "error-title fs-36" }, "疑品包装"),
            vue.createElementVNode("text", { class: "error-desc fs-28 color-subTitlle" }, "请将疑品包装取出，进行损坏申报")
          ],
          64
          /* STABLE_FRAGMENT */
        )) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("button", {
          class: "custom-btn verify-btn",
          onClick: _cache[0] || (_cache[0] = ($event) => $setup.navigatorBack())
        }, "继续初始认证")
      ])
    ]);
  }
  const PagesAuthAuthError = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/auth/authError.vue"]]);
  const _imports_0 = "/static/image/report-success@2x.png";
  const _sfc_main$c = {
    __name: "reportSuccess",
    setup(__props, { expose: __expose }) {
      __expose();
      const handleBack = () => {
        uni.navigateBack({
          delta: 1
        });
      };
      const __returned__ = { handleBack, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "auth-error-container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("image", {
          class: "error-image",
          src: _imports_0,
          mode: ""
        }),
        vue.createElementVNode("text", { class: "error-title fs-36" }, "提交完成"),
        vue.createElementVNode("text", { class: "error-desc fs-28 color-subTitlle" }, "感谢您的提交，迪雷沃会尽快审核处理"),
        vue.createElementVNode("button", {
          class: "custom-btn verify-btn",
          onClick: $setup.handleBack
        }, "继续损坏申报")
      ])
    ]);
  }
  const PagesReportReportSuccess = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/report/reportSuccess.vue"]]);
  const sourceTypeIndex = 2;
  const _sfc_main$b = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const code = vue.ref("扫一扫");
      const model_detail_id = vue.ref("");
      const handleScan = async () => {
        let status = await checkPermission();
        if (status !== 1) {
          return;
        }
        uni.scanCode({
          success: async (res2) => {
            code.value = res2.result;
            const resScan = await scanRepair(code.value);
            model_detail_id.value = resScan.data.id;
          },
          fail: (err) => {
          }
        });
      };
      const checkPermission = async (code2) => {
        let status = permission.isIOS ? await permission.requestIOS("camera") : await permission.requestAndroid("android.permission.CAMERA");
        if (status === null || status === 1) {
          status = 1;
        } else {
          uni.showModal({
            content: "需要相机权限",
            confirmText: "设置",
            success: function(res2) {
              if (res2.confirm) {
                permission.gotoAppSetting();
              }
            }
          });
        }
        return status;
      };
      const reasonOption = vue.ref([
        {
          text: "外观破损",
          value: 1
        },
        {
          text: "内层破损",
          value: 2
        },
        {
          text: "表面割裂",
          value: 3
        },
        {
          text: "拉链损坏",
          value: 4
        },
        {
          text: "恶意涂鸦",
          value: 5
        },
        {
          text: "拼接块脱落",
          value: 6
        },
        {
          text: "其他",
          value: 7
        }
      ]);
      const popup = vue.ref(null);
      const broken_reason = vue.ref([]);
      const reason = vue.ref("");
      const reasonName = vue.ref("请选择");
      const handleShowPop = () => {
        popup.value.open();
      };
      const tempReason = vue.ref("");
      const change = (e2) => {
        var _a, _b;
        formatAppLog("log", "at pages/web/report/index.vue:166", "e:", e2);
        broken_reason.value = (_a = e2.detail) == null ? void 0 : _a.value;
        tempReason.value = ((_b = e2.detail) == null ? void 0 : _b.data.map((item) => item.text).toString()) || "";
      };
      const imageList = vue.ref([]);
      const imageDetailList = vue.ref([]);
      const secondImgList = vue.ref([]);
      const sourceType = ["拍照", "相册", "拍照或相册"];
      const handleUpload = async (index2) => {
        uni.chooseImage({
          // sourceType: sourceType[sourceTypeIndex],
          // sizeType: sizeType[this.sizeTypeIndex],
          count: 1,
          success: (res2) => {
            formatAppLog("log", "at pages/web/report/index.vue:191", "chooseImage", res2.tempFilePaths);
            if (index2 === 1) {
              imageList.value = res2.tempFilePaths;
            } else if (index2 === 2) {
              imageDetailList.value = res2.tempFilePaths;
            } else {
              secondImgList.value = res2.tempFilePaths;
            }
          },
          fail: (err) => {
            formatAppLog("log", "at pages/web/report/index.vue:202", "err: ", err);
            if (err["code"] && err.code !== 0 && sourceTypeIndex === 2) {
              formatAppLog("log", "at pages/web/report/index.vue:205", "checkPermission", err.code);
              checkPermission(err.code);
            }
          }
        });
      };
      const previewImage = (e2) => {
        var current = e2.target.dataset.src;
        uni.previewImage({
          current,
          urls: imageList.value
        });
      };
      const handleConfirm = () => {
        formatAppLog("log", "at pages/web/report/index.vue:255", broken_reason);
        reasonName.value = tempReason.value;
        popup.value.close();
      };
      const handleSubmit = async () => {
        if (!broken_reason.value.length) {
          uni.showToast({
            icon: "none",
            title: "请选择损坏原因"
          });
          return;
        }
        if (!model_detail_id.value) {
          uni.showToast({
            icon: "none",
            title: "请扫描损坏编码"
          });
          return;
        }
        const params = {
          model_detail_id: model_detail_id.value,
          broken_reason: broken_reason.value,
          reason: reason.value
        };
        if (imageList.value.length)
          params.main_img = imageList.value.join("");
        if (imageDetailList.value.length)
          params.first_img = imageDetailList.value.join("");
        if (secondImgList.value.length)
          params.second_img = secondImgList.value.join("");
        await updateRepair(params);
        formatAppLog("log", "at pages/web/report/index.vue:284", code.value, broken_reason.value, imageList.value);
        uni.navigateTo({
          url: "/pages/report/reportSuccess"
        });
        broken_reason.value = [];
        reasonName.value = "请选择";
        tempReason.value = "";
        reason.value = "";
        imageList.value = [];
        imageDetailList.value = [];
        code.value = "扫一扫";
      };
      const __returned__ = { code, model_detail_id, handleScan, checkPermission, reasonOption, popup, broken_reason, reason, reasonName, handleShowPop, tempReason, change, imageList, imageDetailList, secondImgList, sourceTypeIndex, sourceType, handleUpload, previewImage, handleConfirm, handleSubmit, ref: vue.ref, get permision() {
        return permission;
      }, get updateRepair() {
        return updateRepair;
      }, get scanRepair() {
        return scanRepair;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$3);
    const _component_uni_card = resolveEasycom(vue.resolveDynamicComponent("uni-card"), __easycom_1$1);
    const _component_uni_data_checkbox = resolveEasycom(vue.resolveDynamicComponent("uni-data-checkbox"), __easycom_2);
    const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_3);
    return vue.openBlock(), vue.createElementBlock("view", { class: "report-wrap pt-16" }, [
      vue.createVNode(_component_uni_card, {
        "is-shadow": false,
        "is-full": ""
      }, {
        default: vue.withCtx(() => [
          vue.createElementVNode("view", { class: "form-item w_100 jc-sb" }, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", { class: "uni-error" }, "*"),
              vue.createTextVNode("损坏申报编码")
            ]),
            vue.createElementVNode(
              "view",
              {
                class: "form-value pl-20",
                onClick: $setup.handleScan
              },
              vue.toDisplayString($setup.code),
              1
              /* TEXT */
            )
          ]),
          vue.createCommentVNode(" 损坏原因 "),
          vue.createElementVNode("view", { class: "form-item w_100 jc-sb" }, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", { class: "uni-error" }, "*"),
              vue.createTextVNode("损坏原因")
            ]),
            vue.createElementVNode("view", {
              class: "form-select pl-80 d-f ai-c",
              onClick: $setup.handleShowPop
            }, [
              vue.createElementVNode(
                "text",
                { class: "select-text" },
                vue.toDisplayString($setup.reasonName),
                1
                /* TEXT */
              ),
              vue.createVNode(_component_uni_icons, {
                class: "select-icon",
                type: "right",
                size: "14",
                color: "#999999"
              })
            ])
          ])
        ]),
        _: 1
        /* STABLE */
      }),
      vue.createVNode(_component_uni_card, {
        "is-shadow": false,
        "is-full": "",
        class: "mt-15"
      }, {
        default: vue.withCtx(() => [
          vue.createCommentVNode(" 图片上传区 "),
          vue.createElementVNode("view", { class: "upload-section" }, [
            vue.createElementVNode("text", { class: "upload-title" }, "包装正面 (含编码)"),
            vue.createElementVNode("view", { class: "upload-grid mt-15 d-f ai-c fxw-w" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.imageList, (image, index2) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "uni-uploader__file",
                    key: index2
                  }, [
                    vue.createElementVNode("image", {
                      class: "uni-uploader__img",
                      src: image,
                      "data-src": image,
                      onClick: $setup.previewImage
                    }, null, 8, ["src", "data-src"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              vue.createElementVNode("view", {
                class: "upload-box",
                onClick: _cache[0] || (_cache[0] = ($event) => $setup.handleUpload(1))
              }, [
                vue.createVNode(_component_uni_icons, {
                  class: "upload-icon",
                  type: "plusempty",
                  size: "20",
                  color: "#999999"
                })
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "upload-section mt-15" }, [
            vue.createElementVNode("text", { class: "upload-title" }, "包装细节1"),
            vue.createElementVNode("view", { class: "upload-grid mt-15 d-f ai-c fxw-w" }, [
              vue.createCommentVNode(" <uni-file-picker></uni-file-picker> "),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.imageDetailList, (image, index2) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "uni-uploader__file",
                    key: index2
                  }, [
                    vue.createElementVNode("image", {
                      class: "uni-uploader__img",
                      src: image,
                      "data-src": image,
                      onClick: $setup.previewImage
                    }, null, 8, ["src", "data-src"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              vue.createElementVNode("view", {
                class: "upload-box",
                onClick: _cache[1] || (_cache[1] = ($event) => $setup.handleUpload(2))
              }, [
                vue.createVNode(_component_uni_icons, {
                  class: "upload-icon",
                  type: "plusempty",
                  size: "20",
                  color: "#999999"
                })
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "upload-section mt-15" }, [
            vue.createElementVNode("text", { class: "upload-title" }, "包装细节2"),
            vue.createElementVNode("view", { class: "upload-grid mt-15 d-f ai-c fxw-w" }, [
              vue.createCommentVNode(" <uni-file-picker></uni-file-picker> "),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.secondImgList, (image, index2) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "uni-uploader__file",
                    key: index2
                  }, [
                    vue.createElementVNode("image", {
                      class: "uni-uploader__img",
                      src: image,
                      "data-src": image,
                      onClick: $setup.previewImage
                    }, null, 8, ["src", "data-src"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              vue.createElementVNode("view", {
                class: "upload-box",
                onClick: _cache[2] || (_cache[2] = ($event) => $setup.handleUpload(3))
              }, [
                vue.createVNode(_component_uni_icons, {
                  class: "upload-icon",
                  type: "plusempty",
                  size: "20",
                  color: "#999999"
                })
              ])
            ])
          ])
        ]),
        _: 1
        /* STABLE */
      }),
      vue.createElementVNode("view", { class: "submit-btn" }, [
        vue.createElementVNode("button", {
          class: "custom-btn",
          onClick: $setup.handleSubmit
        }, "提交申报")
      ]),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "popup",
          type: "bottom",
          title: "请选择损坏原因",
          "border-radius": "10px 10px 0 0"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "reason-popup bg_white" }, [
              vue.createElementVNode("view", { class: "title ta-c" }, " 请选择损坏原因 "),
              vue.createVNode(_component_uni_data_checkbox, {
                selectedColor: "#99BBA0",
                type: "primary",
                class: "reason-checkbox",
                multiple: "",
                modelValue: $setup.broken_reason,
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.broken_reason = $event),
                mode: "list",
                localdata: $setup.reasonOption,
                onChange: $setup.change
              }, null, 8, ["modelValue", "localdata"]),
              vue.createElementVNode("view", { class: "uni-textarea" }, [
                vue.withDirectives(vue.createElementVNode(
                  "textarea",
                  {
                    "placeholder-style": "color:#A7B0BF",
                    placeholder: "请输入其他原因",
                    "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.reason = $event)
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.reason]
                ])
              ]),
              vue.createElementVNode("button", {
                class: "custom-btn mt-48",
                onClick: _cache[5] || (_cache[5] = ($event) => $setup.handleConfirm())
              }, "确 定")
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const PagesWebReportIndex = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-8bfa610c"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/web/report/index.vue"]]);
  const _sfc_main$a = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const role2 = vue.ref("");
      const list = vue.ref([]);
      const page2 = vue.ref({
        page: 1,
        per_page: 10
      });
      const total_count = vue.ref(0);
      role2.value = uni.getStorageSync("ROLE_KEY");
      formatAppLog("log", "at pages/web/delivery/index.vue:37", role2.value);
      onLoad(() => {
        formatAppLog("log", "at pages/web/delivery/index.vue:39", "onLoadonLoadonLoad");
        getList();
      });
      onShow(() => {
        formatAppLog("log", "at pages/web/delivery/index.vue:44", "onShowonShowonShowonShow");
      });
      const getList = async (isFresh) => {
        const res2 = await getOutboundList({
          ...page2.value
        });
        uni.stopPullDownRefresh();
        total_count.value = res2.data.total_count;
        if (isFresh) {
          list.value = res2.data.list;
        } else {
          list.value = list.value.concat(res2.data.list);
        }
      };
      const goDetail = (item) => {
        uni.navigateTo({
          url: "/pages/delivery/detailList?item=" + JSON.stringify(item)
        });
      };
      onPullDownRefresh(() => {
        page2.value.page = 1;
        getList(true);
      });
      onReachBottom(() => {
        formatAppLog("log", "at pages/web/delivery/index.vue:70", "onReachBottom");
        if (list.value.length = total_count.value) {
          loadMoreText.value = "没有更多数据了!";
          return;
        }
        this.showLoadMore = true;
        setTimeout(() => {
          getList();
        }, 300);
      });
      const __returned__ = { role: role2, list, page: page2, total_count, getList, goDetail, ref: vue.ref, get onReady() {
        return onReady;
      }, get onShow() {
        return onShow;
      }, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      }, get getOutboundList() {
        return getOutboundList;
      }, Empty };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "auth-container pt-16" }, [
      $setup.list.length ? (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        { key: 0 },
        vue.renderList($setup.list, (item, index2) => {
          return vue.openBlock(), vue.createElementBlock("view", {
            class: "auth-item d-f ai-c",
            onClick: ($event) => $setup.goDetail(item),
            key: item.id
          }, [
            vue.createElementVNode(
              "view",
              { class: "left w-80 h-80 uni-white d-f ai-c jc-c uni-bold fs-40" },
              vue.toDisplayString(index2 + 1),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "middle flex-1 ml-24" }, [
              vue.createElementVNode(
                "view",
                { class: "title" },
                vue.toDisplayString($setup.role === "admin" ? item.name : item.order_no),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                { class: "sub color-subTitlle mt-8" },
                vue.toDisplayString(item.created_at),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("image", {
              class: "arrow",
              src: _imports_0$6,
              mode: ""
            })
          ], 8, ["onClick"]);
        }),
        128
        /* KEYED_FRAGMENT */
      )) : (vue.openBlock(), vue.createBlock($setup["Empty"], {
        key: 1,
        class: "no-data ta-c uni-list-cell-pd"
      }))
    ]);
  }
  const PagesWebDeliveryIndex = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-5b102759"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/web/delivery/index.vue"]]);
  const _sfc_main$9 = {
    __name: "detailList",
    setup(__props, { expose: __expose }) {
      __expose();
      const list = vue.ref([]);
      const page2 = vue.ref({
        page: 1,
        per_page: 10
      });
      const total_count = vue.ref(0);
      const row2 = vue.ref({});
      onLoad((option) => {
        const item = JSON.parse(option.item);
        row2.value = item;
        loadDetail();
      });
      const loadDetail = async (isfresh) => {
        try {
          const res2 = await getOutboundDetail(row2.value.id);
          formatAppLog("log", "at pages/web/delivery/detailList.vue:52", res2);
          if (isfresh) {
            list.value = res2.data.list;
          } else {
            list.value = list.value.concat(res2.data.list);
          }
          total_count.value = res2.data.total_count;
          uni.stopPullDownRefresh();
        } catch (e2) {
          uni.stopPullDownRefresh();
        }
      };
      const handleScan = async () => {
        let status = await checkPermission();
        if (status !== 1) {
          return;
        }
        uni.scanCode({
          success: async (res2) => {
            try {
              const resScan = await scanOutbound({
                outbound: row2.value.id,
                detail_no: res2.result
              });
              uni.showToast({
                title: "出库成功",
                icon: "none"
              });
              uni.startPullDownRefresh();
            } catch ({ data }) {
              row2.value.detail_no = res2.result;
              formatAppLog("log", "at pages/web/delivery/detailList.vue:104", "81", row2.value);
              uni.navigateTo({
                url: `/pages/delivery/deliveryError?item=${JSON.stringify(row2.value)}&msg=${data.msg}`
              });
            }
          },
          fail: (err) => {
          }
        });
      };
      const checkPermission = async (code) => {
        let status = permission.isIOS ? await permission.requestIOS("camera") : await permission.requestAndroid("android.permission.CAMERA");
        if (status === null || status === 1) {
          status = 1;
        } else {
          uni.showModal({
            content: "需要相机权限",
            confirmText: "设置",
            success: function(res2) {
              if (res2.confirm) {
                permission.gotoAppSetting();
              }
            }
          });
        }
        return status;
      };
      const handleFinish = () => {
        uni.navigateBack();
      };
      onPullDownRefresh(() => {
        page2.value.page = 1;
        loadDetail(true);
      });
      onReachBottom(() => {
        formatAppLog("log", "at pages/web/delivery/detailList.vue:146", "onReachBottom");
        if (list.value.length = total_count.value) {
          loadMoreText.value = "没有更多数据了!";
          return;
        }
        this.showLoadMore = true;
        setTimeout(() => {
          loadDetail();
        }, 300);
      });
      const __returned__ = { list, page: page2, total_count, row: row2, loadDetail, handleScan, checkPermission, handleFinish, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      }, get permision() {
        return permission;
      }, get scanOutbound() {
        return scanOutbound;
      }, get getOutboundDetail() {
        return getOutboundDetail;
      }, Empty };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "check-container pt-16" }, [
      vue.createElementVNode("view", { class: "detail-list" }, [
        $setup.list.length ? (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          { key: 0 },
          vue.renderList($setup.list, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", { class: "detail-item bg_white d-f w_100 jc-sb ai-c pl-32 pr-28" }, [
              vue.createElementVNode(
                "view",
                { class: "title" },
                vue.toDisplayString(item.detail_no),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "sub" }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-error" },
                  vue.toDisplayString(item.limit_count) + "/" + vue.toDisplayString(item.month_limit),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "color-subTitlle" }, "(单月循环次数)")
              ])
            ]);
          }),
          256
          /* UNKEYED_FRAGMENT */
        )) : (vue.openBlock(), vue.createBlock($setup["Empty"], {
          key: 1,
          class: "no-data ta-c uni-list-cell-pd"
        }))
      ]),
      vue.createElementVNode("view", { class: "w_100 mt-48 fixed pb-20 safe-area-bottom" }, [
        vue.createElementVNode("button", {
          class: "custom-btn",
          type: "",
          onClick: $setup.handleScan
        }, "扫一扫"),
        vue.createElementVNode("button", {
          class: "custom-btn mt-10",
          onClick: $setup.handleFinish
        }, "结束包装出库")
      ])
    ]);
  }
  const PagesWebDeliveryDetailList = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-4100b393"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/web/delivery/detailList.vue"]]);
  const _sfc_main$8 = {
    __name: "deliveryError",
    setup(__props, { expose: __expose }) {
      __expose();
      const errorType = vue.ref(2);
      const row2 = vue.ref({});
      const msg = vue.ref("");
      onLoad((option) => {
        formatAppLog("log", "at pages/web/delivery/deliveryError.vue:53", JSON.parse(option.item));
        let data = option;
        row2.value = option.item ? JSON.parse(option.item) : {}, formatAppLog("log", "at pages/web/delivery/deliveryError.vue:56", "row.value", row2.value);
        msg.value = data.msg;
      });
      const active = vue.ref(1);
      const handleChange = (type) => {
        active.value = type;
      };
      const handleConfirm = async () => {
        if (active.value == 1) {
          await usePacakge({
            outbound: row2.value.id,
            detail_no: row2.value.detail_no,
            force: true
          });
          uni.navigateBack(2);
        } else {
          uni.navigateBack(1);
        }
      };
      const back = () => {
        uni.navigateBack({
          delta: 1
        });
      };
      const handleBack = () => {
        uni.navigateBack({
          delta: 2
        });
      };
      const __returned__ = { errorType, row: row2, msg, active, handleChange, handleConfirm, back, handleBack, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get usePacakge() {
        return usePacakge;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "auth-error-container" }, [
      $setup.errorType == 1 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "content"
      }, [
        vue.createElementVNode("image", {
          class: "error-image",
          src: _imports_0$3,
          mode: ""
        }),
        vue.createElementVNode("text", { class: "error-title fs-36 mt-36" }, "出库完成！"),
        vue.createElementVNode("button", {
          class: "custom-btn verify-btn",
          onClick: $setup.handleBack
        }, "继续包装出库")
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          $setup.msg == "单月循环用量达上限!" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "pt-34 pl-32 pr-32"
          }, [
            vue.createElementVNode("view", { class: "fs-36" }, " 超出单月使用量，请选择 "),
            vue.createElementVNode(
              "view",
              { class: "mt-16 color-subTitlle fs-28" },
              vue.toDisplayString($setup.row.detail_no) + "，此包装超出单月使用次数, 请更换包装使用 ",
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["option-card mb-32 mt-48", { "active": $setup.active == 1 }]),
                onClick: _cache[0] || (_cache[0] = ($event) => $setup.handleChange(1))
              },
              [
                vue.createElementVNode("text", { class: "card-text" }, "继续使用此包装")
              ],
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["option-card mb-32", { "active": $setup.active == 2 }]),
                onClick: _cache[1] || (_cache[1] = ($event) => $setup.handleChange(2))
              },
              [
                vue.createElementVNode("text", { class: "card-text" }, "更换其他包装")
              ],
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["option-card", { "active": $setup.active == 3 }]),
                onClick: _cache[2] || (_cache[2] = ($event) => $setup.handleChange(3))
              },
              [
                vue.createElementVNode("text", { class: "card-text" }, "取消使用次包装")
              ],
              2
              /* CLASS */
            ),
            vue.createElementVNode("button", {
              class: "custom-btn mt-80",
              onClick: $setup.handleConfirm
            }, "确认")
          ])) : (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "content"
          }, [
            vue.createElementVNode("image", {
              class: "error-image",
              src: _imports_1$1,
              mode: ""
            }),
            vue.createElementVNode(
              "text",
              { class: "error-title fs-36 mt-36" },
              vue.toDisplayString($setup.msg),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "error-desc fs-28 color-subTitlle" },
              vue.toDisplayString($setup.row.detail_no) + "，请进行确认",
              1
              /* TEXT */
            ),
            vue.createElementVNode("button", {
              class: "custom-btn verify-btn",
              onClick: $setup.back
            }, "确认")
          ]))
        ],
        64
        /* STABLE_FRAGMENT */
      ))
    ]);
  }
  const PagesWebDeliveryDeliveryError = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/web/delivery/deliveryError.vue"]]);
  const _sfc_main$7 = {
    __name: "detailList",
    setup(__props, { expose: __expose }) {
      __expose();
      const list = vue.ref([]);
      const pageTo = () => {
        uni.navigateTo({
          url: "/pages/recycle/recycleSuccess"
        });
      };
      const handleScan = async () => {
        let status = await checkPermission();
        if (status !== 1) {
          return;
        }
        uni.scanCode({
          success: async (res2) => {
            if (role.value === "admin") {
              try {
                const resScan = await scanAdmin({
                  id: row.value.id,
                  type: 3,
                  detail_no: res2.result
                });
                uni.showToast({
                  title: "已回收",
                  icon: "none"
                });
              } catch (error) {
                list.value.unshift({
                  status: 7,
                  detail_no: res2.result
                });
              }
            } else {
              try {
                await scanRecycle({
                  detail_no: res2.result
                });
                list.value.unshift({
                  msg: "回收成功",
                  detail_no: res2.result
                });
              } catch ({ data }) {
                list.value.unshift({
                  msg: data.msg,
                  detail_no: res2.result
                });
              }
            }
          },
          fail: (err) => {
          }
        });
      };
      const checkPermission = async (code) => {
        let status = permission.isIOS ? await permission.requestIOS("camera") : await permission.requestAndroid("android.permission.CAMERA");
        if (status === null || status === 1) {
          status = 1;
        } else {
          uni.showModal({
            content: "需要相机权限",
            confirmText: "设置",
            success: function(res2) {
              if (res2.confirm) {
                permission.gotoAppSetting();
              }
            }
          });
        }
        return status;
      };
      const handleFinish = () => {
        uni.switchTab({
          url: "/pages/index/index"
        });
      };
      const __returned__ = { list, pageTo, handleScan, checkPermission, handleFinish, ref: vue.ref, get onReady() {
        return onReady;
      }, get onLoad() {
        return onLoad;
      }, get permision() {
        return permission;
      }, get scanRecycle() {
        return scanRecycle;
      }, get scanAdmin() {
        return scanAdmin;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "check-container pt-16" }, [
      $setup.list.length ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "detail-list bg_white"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.list, (item, index2) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "detail-item d-f w_100 jc-sb ai-c pl-32 pr-28",
              key: index2,
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.pageTo())
            }, [
              vue.createElementVNode(
                "view",
                { class: "title" },
                vue.toDisplayString(item.detail_no),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                { class: "sub uni-success" },
                vue.toDisplayString(item.msg),
                1
                /* TEXT */
              )
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "no-data ta-c uni-list-cell-pd" }, "暂无数据"),
      vue.createElementVNode("view", {
        class: "footer w_100 mt-48 fixed pb-20 safe-area-bottom",
        style: {}
      }, [
        vue.createElementVNode("button", {
          class: "custom-btn",
          type: "",
          onClick: $setup.handleScan
        }, "扫一扫"),
        vue.createElementVNode("button", {
          class: "custom-btn mt-10",
          onClick: $setup.handleFinish
        }, "结束回收复查")
      ])
    ]);
  }
  const PagesWebRecycleDetailList = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-7f707b02"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/web/recycle/detailList.vue"]]);
  const _sfc_main$6 = {
    __name: "recycleSuccess",
    setup(__props, { expose: __expose }) {
      __expose();
      const errorType = vue.ref(1);
      const handleBack = () => {
        uni.navigateBack({
          delta: 1
        });
      };
      const __returned__ = { errorType, handleBack, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "auth-error-container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("image", {
          class: "error-image",
          src: _imports_0$2,
          mode: ""
        }),
        vue.createElementVNode("text", { class: "error-title fs-36" }, "回收复查完成"),
        vue.createElementVNode("text", { class: "error-desc fs-28 color-subTitlle" }, "请注意若有损坏包装，请再进行损坏申报"),
        vue.createElementVNode("button", {
          class: "custom-btn verify-btn",
          onClick: $setup.handleBack
        }, "继续回收复查")
      ])
    ]);
  }
  const PagesWebRecycleRecycleSuccess = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/web/recycle/recycleSuccess.vue"]]);
  const _sfc_main$5 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const page2 = vue.ref({
        page: 1,
        per_page: 10
      });
      const list = vue.ref([]);
      const role2 = vue.ref("");
      const verified_count = vue.ref(0);
      const total_count = vue.ref(0);
      const loadMoreText2 = vue.ref("加载中...");
      const showLoadMore = vue.ref(false);
      onShow(() => {
        list.value = [];
        role2.value = uni.getStorageSync("ROLE_KEY");
        formatAppLog("log", "at pages/web/auth/index.vue:47", "onShowonShowonShow", role2.value);
        init();
      });
      onUnload(() => {
        list.value = [];
      });
      const goCheck = (item) => {
        formatAppLog("log", "at pages/web/auth/index.vue:56", item);
        const url = role2.value === "admin" ? "/pages/auth/detailList?" : "/pages/auth/check?";
        uni.navigateTo({
          url: `${url}?item=${JSON.stringify(item)}`
        });
      };
      const init = async (isFresh) => {
        const res2 = await getBoundList({
          ...page2.value,
          type_name: ""
        });
        uni.stopPullDownRefresh();
        if (isFresh) {
          list.value = res2.data.list;
        } else {
          list.value = list.value.concat(res2.data.list);
        }
        formatAppLog("log", "at pages/web/auth/index.vue:74", list.value);
        total_count.value = res2.data.total_count;
      };
      onPullDownRefresh(() => {
        page2.value.page = 1;
        init(true);
      });
      onReachBottom(() => {
        formatAppLog("log", "at pages/web/auth/index.vue:82", list.value.length, total_count.value);
        if (list.value.length === total_count.value) {
          formatAppLog("log", "at pages/web/auth/index.vue:84", "没有更多数据了");
          loadMoreText2.value = "没有更多数据了!";
          showLoadMore.value = true;
          return;
        }
        showLoadMore.value = true;
        formatAppLog("log", "at pages/web/auth/index.vue:90", "onReachBottom");
        ++page2.value.page;
        init();
      });
      const __returned__ = { page: page2, list, role: role2, verified_count, total_count, loadMoreText: loadMoreText2, showLoadMore, goCheck, init, ref: vue.ref, get getBoundList() {
        return getBoundList;
      }, Empty, get onReady() {
        return onReady;
      }, get onShow() {
        return onShow;
      }, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      }, get onUnload() {
        return onUnload;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "auth-container pt-16" }, [
      $setup.list.length ? (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        { key: 0 },
        vue.renderList($setup.list, (item, index2) => {
          return vue.openBlock(), vue.createElementBlock("view", {
            class: "auth-item d-f ai-c",
            key: item.id,
            onClick: ($event) => $setup.goCheck(item)
          }, [
            vue.createElementVNode(
              "view",
              { class: "left w-80 h-80 uni-white d-f ai-c jc-c uni-bold fs-40" },
              vue.toDisplayString(index2 + 1),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "middle flex-1 ml-24" }, [
              vue.createElementVNode("view", {
                class: "title ellipsis_1 fs-32",
                style: { "width": "500rpx" }
              }, [
                $setup.role == "web" ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  { key: 0 },
                  vue.toDisplayString(item.order_no),
                  1
                  /* TEXT */
                )) : (vue.openBlock(), vue.createElementBlock(
                  "text",
                  { key: 1 },
                  vue.toDisplayString(item.type_name) + "#" + vue.toDisplayString(item.start_no) + " - " + vue.toDisplayString(item.end_no),
                  1
                  /* TEXT */
                ))
              ]),
              vue.createElementVNode("view", { class: "sub fs-24" }, [
                vue.createElementVNode("text", { class: "color-subTitlle" }, "数量："),
                vue.createElementVNode(
                  "text",
                  { class: "num" },
                  vue.toDisplayString(item.total_count),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("image", {
              class: "arrow",
              src: _imports_0$6,
              mode: ""
            })
          ], 8, ["onClick"]);
        }),
        128
        /* KEYED_FRAGMENT */
      )) : (vue.openBlock(), vue.createBlock($setup["Empty"], {
        key: 1,
        class: "no-data ta-c uni-list-cell-pd"
      })),
      $setup.showLoadMore ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 2,
          class: "uni-loadmore"
        },
        vue.toDisplayString($setup.loadMoreText),
        1
        /* TEXT */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesWebAuthIndex = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-4c7725c0"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/web/auth/index.vue"]]);
  const _sfc_main$4 = {
    __name: "check",
    setup(__props, { expose: __expose }) {
      __expose();
      const formData = vue.ref({});
      const row2 = vue.ref({});
      onLoad((option) => {
        formatAppLog("log", "at pages/web/auth/check.vue:73", "option", option);
        row2.value = option.item ? JSON.parse(option.item) : {};
      });
      const changeCategory = (e2) => {
        formatAppLog("log", "at pages/web/auth/check.vue:79", e2);
        formData.value.isCateCorrect = e2.detail.value;
      };
      const changeQuantity = (e2) => {
        formatAppLog("log", "at pages/web/auth/check.vue:83", e2);
        formData.value.quantity = e2.detail.value;
      };
      const changeAmbiguity = (e2) => {
        formatAppLog("log", "at pages/web/auth/check.vue:87", e2);
        formData.value.ambiguity = e2.detail.value;
      };
      const handleNext = async () => {
        formatAppLog("log", "at pages/web/auth/check.vue:94", "formData", formData);
        if (formData.value.isCateCorrect === "1" && formData.value.quantity === "1") {
          if (formData.value.ambiguity === "1") {
            uni.navigateTo({
              url: "/pages/auth/authError?errorType=3"
            });
          } else {
            await authConfirm(row2.value.id);
            uni.navigateTo({
              url: "/pages/auth/authError?errorType=0"
            });
          }
        } else {
          uni.navigateTo({
            url: "/pages/auth/detailList?item=" + JSON.stringify(row2.value)
          });
        }
      };
      const __returned__ = { formData, row: row2, changeCategory, changeQuantity, changeAmbiguity, handleNext, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get authConfirm() {
        return authConfirm;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_forms_item = resolveEasycom(vue.resolveDynamicComponent("uni-forms-item"), __easycom_0);
    const _component_uni_forms = resolveEasycom(vue.resolveDynamicComponent("uni-forms"), __easycom_1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "check-container" }, [
      vue.createElementVNode("view", { class: "check-content bg_white" }, [
        vue.createElementVNode("view", { class: "check-info w_100 ta-c pb-48" }, [
          vue.createElementVNode(
            "view",
            { class: "title" },
            vue.toDisplayString($setup.row.order_no),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "sub mt-16" }, [
            vue.createElementVNode("text", { class: "color-subTitlle" }, "数量："),
            vue.createElementVNode(
              "text",
              { class: "num" },
              vue.toDisplayString($setup.row.total_count),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "mt-48 fs-32" }, [
          vue.createVNode(_component_uni_forms, {
            class: "check-form",
            model: $setup.formData,
            "label-position": "top",
            "label-width": "250px"
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(_component_uni_forms_item, {
                class: "fs-32",
                label: "1、请确认包装型号是否正确？",
                name: "isCateCorrect",
                required: ""
              }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode(
                    "radio-group",
                    {
                      class: "",
                      onChange: $setup.changeCategory,
                      onBlur: _cache[0] || (_cache[0] = (e2) => _ctx.$refs.input.onFieldChange(_ctx.$event.detail.value))
                    },
                    [
                      vue.createElementVNode("label", { class: "radio" }, [
                        vue.createElementVNode("radio", { value: "1" }),
                        vue.createTextVNode("是 ")
                      ]),
                      vue.createElementVNode("label", { class: "radio" }, [
                        vue.createElementVNode("radio", { value: "0" }),
                        vue.createTextVNode("否 ")
                      ])
                    ],
                    32
                    /* NEED_HYDRATION */
                  )
                ]),
                _: 1
                /* STABLE */
              }),
              vue.createVNode(_component_uni_forms_item, {
                label: "2、请确认包装数量是否正确？",
                name: "quantity",
                required: ""
              }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode(
                    "radio-group",
                    {
                      onChange: $setup.changeQuantity,
                      onBlur: _cache[1] || (_cache[1] = (e2) => _ctx.$refs.input.onFieldChange(_ctx.$event.detail.value))
                    },
                    [
                      vue.createElementVNode("label", { class: "radio" }, [
                        vue.createElementVNode("radio", { value: "1" }),
                        vue.createTextVNode("是 ")
                      ]),
                      vue.createElementVNode("label", { class: "radio" }, [
                        vue.createElementVNode("radio", { value: "0" }),
                        vue.createTextVNode("否 ")
                      ])
                    ],
                    32
                    /* NEED_HYDRATION */
                  )
                ]),
                _: 1
                /* STABLE */
              }),
              vue.createVNode(_component_uni_forms_item, {
                required: "",
                name: "ambiguity",
                label: "3、请确认是否有疑品包装？"
              }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode(
                    "radio-group",
                    {
                      onChange: $setup.changeAmbiguity,
                      onBlur: _cache[2] || (_cache[2] = (e2) => _ctx.$refs.input.onFieldChange(_ctx.$event.detail.value))
                    },
                    [
                      vue.createElementVNode("label", { class: "radio" }, [
                        vue.createElementVNode("radio", { value: "1" }),
                        vue.createTextVNode("是 ")
                      ]),
                      vue.createElementVNode("label", { class: "radio" }, [
                        vue.createElementVNode("radio", { value: "0" }),
                        vue.createTextVNode("否 ")
                      ])
                    ],
                    32
                    /* NEED_HYDRATION */
                  )
                ]),
                _: 1
                /* STABLE */
              })
            ]),
            _: 1
            /* STABLE */
          }, 8, ["model"])
        ])
      ]),
      vue.createElementVNode("view", { class: "w_100 mt-48" }, [
        vue.createElementVNode("button", {
          class: "custom-btn",
          onClick: $setup.handleNext
        }, "下一步")
      ])
    ]);
  }
  const PagesWebAuthCheck = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-e48a5751"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/web/auth/check.vue"]]);
  const _sfc_main$3 = {
    __name: "detailList",
    setup(__props, { expose: __expose }) {
      __expose();
      const verified_count = vue.ref(0);
      const total_count = vue.ref(0);
      const row2 = vue.ref({});
      const role2 = vue.ref("");
      onLoad((option) => {
        role2.value = uni.getStorageSync("ROLE_KEY");
        formatAppLog("log", "at pages/web/auth/detailList.vue:53", role2.value);
        formatAppLog("log", "at pages/web/auth/detailList.vue:54", "option", option);
        const item = JSON.parse(option.item);
        row2.value = item;
        const id = item.id;
        total_count.value = item.total_count;
        verified_count.value = item.verified_count;
        if (role2.value === "admin") {
          uni.setNavigationBarTitle({
            title: `明细列表(${verified_count.value}/${total_count.value})`
          });
        }
        loadDetail(id);
      });
      const list = vue.ref([]);
      const loadMoreText2 = vue.ref("加载中...");
      const showLoadMore = vue.ref(false);
      const total = vue.ref(0);
      const formData = vue.ref({
        isCateCorrect: ""
      });
      const loadDetail = async (id, isfresh) => {
        const res2 = await getScanResult(id);
        if (role2.value === "admin") {
          if (isfresh) {
            list.value = res2.data.list;
          } else {
            list.value = list.value.concat(res2.data.list);
          }
          formatAppLog("log", "at pages/web/auth/detailList.vue:84", list.value);
          total.value = res2.data.total_count;
          uni.stopPullDownRefresh();
        } else {
          for (let i2 = 0; i2 < res2.data.length; i2++) {
            const element = res2.data[i2];
            list.value.push({
              detail_no: element,
              status: 0
            });
          }
        }
      };
      onPullDownRefresh(() => {
        formatAppLog("log", "at pages/web/auth/detailList.vue:99", row2.value.id);
        loadDetail(row2.value.id, true);
      });
      onReachBottom(() => {
        formatAppLog("log", "at pages/web/auth/detailList.vue:103", "onReachBottom");
        if (list.value.length = total) {
          loadMoreText2.value = "没有更多数据了!";
          return;
        }
        this.showLoadMore = true;
        setTimeout(() => {
          loadDetail(row2.value.id);
        }, 300);
      });
      const pageTo = () => {
      };
      const handleScan = async () => {
        let status = await checkPermission();
        if (status !== 1) {
          return;
        }
        uni.scanCode({
          success: async (res2) => {
            if (role2.value === "admin") {
              try {
                const resScan = await scanAdmin({
                  id: row2.value.id,
                  type: 1,
                  detail_no: res2.result
                });
                uni.showToast({
                  title: "认证成功",
                  icon: "none"
                });
                const index2 = list.value.findIndex((item) => item.detail_no == res2.result);
                list.value[index2].status = 1;
              } catch (error) {
                if (error.data.msg.includes("型号错误")) {
                  list.value.unshift({
                    status: 7,
                    detail_no: res2.result
                  });
                }
              }
            } else {
              try {
                scanCustomer({
                  outbound: row2.value.id,
                  detail_no: res2.result
                });
                uni.showToast({
                  title: "认证成功",
                  icon: "none"
                });
              } catch (error) {
                if (error.data.msg.includes("型号错误")) {
                  list.value.unshift({
                    status: 7,
                    detail_no: res2.result
                  });
                }
              }
            }
          },
          fail: (err) => {
          }
        });
      };
      const checkPermission = async (code) => {
        let status = permission.isIOS ? await permission.requestIOS("camera") : await permission.requestAndroid("android.permission.CAMERA");
        if (status === null || status === 1) {
          status = 1;
        } else {
          uni.showModal({
            content: "需要相机权限",
            confirmText: "设置",
            success: function(res2) {
              if (res2.confirm) {
                permission.gotoAppSetting();
              }
            }
          });
        }
        return status;
      };
      const handleFinish = () => {
        uni.navigateBack({
          delta: 2
        });
      };
      const __returned__ = { verified_count, total_count, row: row2, role: role2, list, loadMoreText: loadMoreText2, showLoadMore, total, formData, loadDetail, pageTo, handleScan, checkPermission, handleFinish, get permision() {
        return permission;
      }, ref: vue.ref, onMounted: vue.onMounted, getCurrentInstance: vue.getCurrentInstance, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      }, get getScanResult() {
        return getScanResult;
      }, get scanAdmin() {
        return scanAdmin;
      }, get scanCustomer() {
        return scanCustomer;
      }, get packageStatusOption() {
        return packageStatusOption;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "check-container pt-16" }, [
      vue.createElementVNode("view", { class: "detail-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.list, (item, index2) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "detail-item bg_white d-f w_100 jc-sb ai-c pl-32 pr-28",
              key: index2,
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.pageTo())
            }, [
              vue.createElementVNode(
                "view",
                { class: "title ellipsis_1 flex-1" },
                vue.toDisplayString(item.detail_no),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["sub uni-success w-110", { "uni-error": item.status === 7 || item.status === 0 }])
                },
                vue.toDisplayString($setup.packageStatusOption.find((op) => op.value === item.status).label),
                3
                /* TEXT, CLASS */
              )
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createElementVNode("view", {
        class: "footer w_100 mt-48 pt-20 fixed pb-20 safe-area-bottom bg-white",
        style: {}
      }, [
        vue.createElementVNode("button", {
          class: "custom-btn",
          type: "",
          onClick: $setup.handleScan
        }, "扫一扫"),
        vue.createElementVNode("button", {
          class: "custom-btn mt-10",
          onClick: $setup.handleFinish
        }, "结束初始认证")
      ])
    ]);
  }
  const PagesWebAuthDetailList = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-ca580501"], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/web/auth/detailList.vue"]]);
  const _sfc_main$2 = {
    __name: "authError",
    setup(__props, { expose: __expose }) {
      __expose();
      const errorType = vue.ref(1);
      onLoad((option) => {
        formatAppLog("log", "at pages/web/auth/authError.vue:37", option);
        let data = option;
        errorType.value = data.errorType;
      });
      const navigatorBack = () => {
        if (errorType.value == 3) {
          uni.navigateBack({
            delta: 3
          });
          return;
        }
        if (errorType.value == 0) {
          uni.navigateBack({
            delta: 2
          });
          return;
        }
        uni.navigateBack();
      };
      const __returned__ = { errorType, navigatorBack, ref: vue.ref, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "auth-error-container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        $setup.errorType == 0 ? (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 0 },
          [
            vue.createElementVNode("image", {
              class: "error-image",
              src: _imports_0$1,
              mode: ""
            }),
            vue.createElementVNode("text", { class: "error-title fs-36" }, "初始认证完成！")
          ],
          64
          /* STABLE_FRAGMENT */
        )) : $setup.errorType == 1 ? (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 1 },
          [
            vue.createElementVNode("image", {
              class: "error-image",
              src: _imports_1,
              mode: ""
            }),
            vue.createElementVNode("text", { class: "error-title fs-36" }, "型号核实有误"),
            vue.createElementVNode("text", { class: "error-desc fs-28 color-subTitlle" }, [
              vue.createTextVNode("请尽快联系迪雷沃，错误型号"),
              vue.createElementVNode("br"),
              vue.createTextVNode("包装换货退运")
            ])
          ],
          64
          /* STABLE_FRAGMENT */
        )) : vue.createCommentVNode("v-if", true),
        $setup.errorType == 2 ? (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 2 },
          [
            vue.createElementVNode("image", {
              class: "error-image",
              src: _imports_2,
              mode: ""
            }),
            vue.createElementVNode("text", { class: "error-title fs-36" }, "数量核实有误"),
            vue.createElementVNode("text", { class: "error-desc fs-28 color-subTitlle" }, [
              vue.createTextVNode("请尽快联系迪雷沃，包装数量"),
              vue.createElementVNode("br"),
              vue.createTextVNode("短少事宜")
            ])
          ],
          64
          /* STABLE_FRAGMENT */
        )) : vue.createCommentVNode("v-if", true),
        $setup.errorType == 3 ? (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 3 },
          [
            vue.createElementVNode("image", {
              class: "error-image",
              src: _imports_3,
              mode: ""
            }),
            vue.createElementVNode("text", { class: "error-title fs-36" }, "疑品包装"),
            vue.createElementVNode("text", { class: "error-desc fs-28 color-subTitlle" }, "请将疑品包装取出，进行损坏申报")
          ],
          64
          /* STABLE_FRAGMENT */
        )) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("button", {
          class: "custom-btn verify-btn",
          onClick: _cache[0] || (_cache[0] = ($event) => $setup.navigatorBack())
        }, "继续初始认证")
      ])
    ]);
  }
  const PagesWebAuthAuthError = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/web/auth/authError.vue"]]);
  const _sfc_main$1 = {
    __name: "reportSuccess",
    setup(__props, { expose: __expose }) {
      __expose();
      const handleBack = () => {
        uni.navigateBack({
          delta: 1
        });
      };
      const __returned__ = { handleBack, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "auth-error-container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("image", {
          class: "error-image",
          src: _imports_0,
          mode: ""
        }),
        vue.createElementVNode("text", { class: "error-title fs-36" }, "提交完成"),
        vue.createElementVNode("text", { class: "error-desc fs-28 color-subTitlle" }, "感谢您的提交，迪雷沃会尽快审核处理"),
        vue.createElementVNode("button", {
          class: "custom-btn verify-btn",
          onClick: $setup.handleBack
        }, "继续损坏申报")
      ])
    ]);
  }
  const PagesWebReportReportSuccess = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "D:/project/dlw/uniapp-dileiwo/pages/web/report/reportSuccess.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/login/agreement", PagesLoginAgreement);
  __definePage("pages/report/index", PagesReportIndex);
  __definePage("pages/delivery/index", PagesDeliveryIndex);
  __definePage("pages/delivery/detailList", PagesDeliveryDetailList);
  __definePage("pages/delivery/deliveryError", PagesDeliveryDeliveryError);
  __definePage("pages/recycle/detailList", PagesRecycleDetailList);
  __definePage("pages/recycle/recycleSuccess", PagesRecycleRecycleSuccess);
  __definePage("pages/auth/index", PagesAuthIndex);
  __definePage("pages/auth/check", PagesAuthCheck);
  __definePage("pages/auth/detailList", PagesAuthDetailList);
  __definePage("pages/auth/authError", PagesAuthAuthError);
  __definePage("pages/report/reportSuccess", PagesReportReportSuccess);
  __definePage("pages/web/report/index", PagesWebReportIndex);
  __definePage("pages/web/delivery/index", PagesWebDeliveryIndex);
  __definePage("pages/web/delivery/detailList", PagesWebDeliveryDetailList);
  __definePage("pages/web/delivery/deliveryError", PagesWebDeliveryDeliveryError);
  __definePage("pages/web/recycle/detailList", PagesWebRecycleDetailList);
  __definePage("pages/web/recycle/recycleSuccess", PagesWebRecycleRecycleSuccess);
  __definePage("pages/web/auth/index", PagesWebAuthIndex);
  __definePage("pages/web/auth/check", PagesWebAuthCheck);
  __definePage("pages/web/auth/detailList", PagesWebAuthDetailList);
  __definePage("pages/web/auth/authError", PagesWebAuthAuthError);
  __definePage("pages/web/report/reportSuccess", PagesWebReportReportSuccess);
  function getDevtoolsGlobalHook$1() {
    return getTarget$1().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget$1() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  const isProxyAvailable$1 = typeof Proxy === "function";
  const HOOK_SETUP$1 = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET$1 = "plugin:settings:set";
  let ApiProxy$1 = class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = { ...defaultSettings };
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e2) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e2) {
          }
          currentSettings = value;
        }
      };
      hook.on(HOOK_PLUGIN_SETTINGS_SET$1, (pluginId, value) => {
        if (pluginId === this.plugin.id) {
          this.fallbacks.setSettings(value);
        }
      });
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  };
  function setupDevtoolsPlugin$1(pluginDescriptor, setupFn) {
    const target = getTarget$1();
    const hook = getDevtoolsGlobalHook$1();
    const enableProxy = isProxyAvailable$1 && pluginDescriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP$1, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy$1(pluginDescriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
   * vuex v4.1.0
   * (c) 2022 Evan You
   * @license MIT
   */
  var storeKey = "store";
  function useStore(key) {
    if (key === void 0)
      key = null;
    return vue.inject(key !== null ? key : storeKey);
  }
  function find(list, f2) {
    return list.filter(f2)[0];
  }
  function deepCopy(obj, cache) {
    if (cache === void 0)
      cache = [];
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    var hit = find(cache, function(c2) {
      return c2.original === obj;
    });
    if (hit) {
      return hit.copy;
    }
    var copy = Array.isArray(obj) ? [] : {};
    cache.push({
      original: obj,
      copy
    });
    Object.keys(obj).forEach(function(key) {
      copy[key] = deepCopy(obj[key], cache);
    });
    return copy;
  }
  function forEachValue(obj, fn) {
    Object.keys(obj).forEach(function(key) {
      return fn(obj[key], key);
    });
  }
  function isObject(obj) {
    return obj !== null && typeof obj === "object";
  }
  function isPromise(val) {
    return val && typeof val.then === "function";
  }
  function assert(condition, msg) {
    if (!condition) {
      throw new Error("[vuex] " + msg);
    }
  }
  function partial(fn, arg) {
    return function() {
      return fn(arg);
    };
  }
  function genericSubscribe(fn, subs, options) {
    if (subs.indexOf(fn) < 0) {
      options && options.prepend ? subs.unshift(fn) : subs.push(fn);
    }
    return function() {
      var i2 = subs.indexOf(fn);
      if (i2 > -1) {
        subs.splice(i2, 1);
      }
    };
  }
  function resetStore(store2, hot) {
    store2._actions = /* @__PURE__ */ Object.create(null);
    store2._mutations = /* @__PURE__ */ Object.create(null);
    store2._wrappedGetters = /* @__PURE__ */ Object.create(null);
    store2._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
    var state = store2.state;
    installModule(store2, state, [], store2._modules.root, true);
    resetStoreState(store2, state, hot);
  }
  function resetStoreState(store2, state, hot) {
    var oldState = store2._state;
    var oldScope = store2._scope;
    store2.getters = {};
    store2._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
    var wrappedGetters = store2._wrappedGetters;
    var computedObj = {};
    var computedCache = {};
    var scope = vue.effectScope(true);
    scope.run(function() {
      forEachValue(wrappedGetters, function(fn, key) {
        computedObj[key] = partial(fn, store2);
        computedCache[key] = vue.computed(function() {
          return computedObj[key]();
        });
        Object.defineProperty(store2.getters, key, {
          get: function() {
            return computedCache[key].value;
          },
          enumerable: true
          // for local getters
        });
      });
    });
    store2._state = vue.reactive({
      data: state
    });
    store2._scope = scope;
    if (store2.strict) {
      enableStrictMode(store2);
    }
    if (oldState) {
      if (hot) {
        store2._withCommit(function() {
          oldState.data = null;
        });
      }
    }
    if (oldScope) {
      oldScope.stop();
    }
  }
  function installModule(store2, rootState, path, module, hot) {
    var isRoot = !path.length;
    var namespace = store2._modules.getNamespace(path);
    if (module.namespaced) {
      if (store2._modulesNamespaceMap[namespace] && true) {
        console.error("[vuex] duplicate namespace " + namespace + " for the namespaced module " + path.join("/"));
      }
      store2._modulesNamespaceMap[namespace] = module;
    }
    if (!isRoot && !hot) {
      var parentState = getNestedState(rootState, path.slice(0, -1));
      var moduleName = path[path.length - 1];
      store2._withCommit(function() {
        {
          if (moduleName in parentState) {
            console.warn(
              '[vuex] state field "' + moduleName + '" was overridden by a module with the same name at "' + path.join(".") + '"'
            );
          }
        }
        parentState[moduleName] = module.state;
      });
    }
    var local = module.context = makeLocalContext(store2, namespace, path);
    module.forEachMutation(function(mutation, key) {
      var namespacedType = namespace + key;
      registerMutation(store2, namespacedType, mutation, local);
    });
    module.forEachAction(function(action, key) {
      var type = action.root ? key : namespace + key;
      var handler = action.handler || action;
      registerAction(store2, type, handler, local);
    });
    module.forEachGetter(function(getter, key) {
      var namespacedType = namespace + key;
      registerGetter(store2, namespacedType, getter, local);
    });
    module.forEachChild(function(child, key) {
      installModule(store2, rootState, path.concat(key), child, hot);
    });
  }
  function makeLocalContext(store2, namespace, path) {
    var noNamespace = namespace === "";
    var local = {
      dispatch: noNamespace ? store2.dispatch : function(_type, _payload, _options) {
        var args = unifyObjectStyle(_type, _payload, _options);
        var payload = args.payload;
        var options = args.options;
        var type = args.type;
        if (!options || !options.root) {
          type = namespace + type;
          if (!store2._actions[type]) {
            console.error("[vuex] unknown local action type: " + args.type + ", global type: " + type);
            return;
          }
        }
        return store2.dispatch(type, payload);
      },
      commit: noNamespace ? store2.commit : function(_type, _payload, _options) {
        var args = unifyObjectStyle(_type, _payload, _options);
        var payload = args.payload;
        var options = args.options;
        var type = args.type;
        if (!options || !options.root) {
          type = namespace + type;
          if (!store2._mutations[type]) {
            console.error("[vuex] unknown local mutation type: " + args.type + ", global type: " + type);
            return;
          }
        }
        store2.commit(type, payload, options);
      }
    };
    Object.defineProperties(local, {
      getters: {
        get: noNamespace ? function() {
          return store2.getters;
        } : function() {
          return makeLocalGetters(store2, namespace);
        }
      },
      state: {
        get: function() {
          return getNestedState(store2.state, path);
        }
      }
    });
    return local;
  }
  function makeLocalGetters(store2, namespace) {
    if (!store2._makeLocalGettersCache[namespace]) {
      var gettersProxy = {};
      var splitPos = namespace.length;
      Object.keys(store2.getters).forEach(function(type) {
        if (type.slice(0, splitPos) !== namespace) {
          return;
        }
        var localType = type.slice(splitPos);
        Object.defineProperty(gettersProxy, localType, {
          get: function() {
            return store2.getters[type];
          },
          enumerable: true
        });
      });
      store2._makeLocalGettersCache[namespace] = gettersProxy;
    }
    return store2._makeLocalGettersCache[namespace];
  }
  function registerMutation(store2, type, handler, local) {
    var entry = store2._mutations[type] || (store2._mutations[type] = []);
    entry.push(function wrappedMutationHandler(payload) {
      handler.call(store2, local.state, payload);
    });
  }
  function registerAction(store2, type, handler, local) {
    var entry = store2._actions[type] || (store2._actions[type] = []);
    entry.push(function wrappedActionHandler(payload) {
      var res2 = handler.call(store2, {
        dispatch: local.dispatch,
        commit: local.commit,
        getters: local.getters,
        state: local.state,
        rootGetters: store2.getters,
        rootState: store2.state
      }, payload);
      if (!isPromise(res2)) {
        res2 = Promise.resolve(res2);
      }
      if (store2._devtoolHook) {
        return res2.catch(function(err) {
          store2._devtoolHook.emit("vuex:error", err);
          throw err;
        });
      } else {
        return res2;
      }
    });
  }
  function registerGetter(store2, type, rawGetter, local) {
    if (store2._wrappedGetters[type]) {
      {
        console.error("[vuex] duplicate getter key: " + type);
      }
      return;
    }
    store2._wrappedGetters[type] = function wrappedGetter(store22) {
      return rawGetter(
        local.state,
        // local state
        local.getters,
        // local getters
        store22.state,
        // root state
        store22.getters
        // root getters
      );
    };
  }
  function enableStrictMode(store2) {
    vue.watch(function() {
      return store2._state.data;
    }, function() {
      {
        assert(store2._committing, "do not mutate vuex store state outside mutation handlers.");
      }
    }, { deep: true, flush: "sync" });
  }
  function getNestedState(state, path) {
    return path.reduce(function(state2, key) {
      return state2[key];
    }, state);
  }
  function unifyObjectStyle(type, payload, options) {
    if (isObject(type) && type.type) {
      options = payload;
      payload = type;
      type = type.type;
    }
    {
      assert(typeof type === "string", "expects string as the type, but found " + typeof type + ".");
    }
    return { type, payload, options };
  }
  var LABEL_VUEX_BINDINGS = "vuex bindings";
  var MUTATIONS_LAYER_ID$1 = "vuex:mutations";
  var ACTIONS_LAYER_ID = "vuex:actions";
  var INSPECTOR_ID$1 = "vuex";
  var actionId = 0;
  function addDevtools(app, store2) {
    setupDevtoolsPlugin$1(
      {
        id: "org.vuejs.vuex",
        app,
        label: "Vuex",
        homepage: "https://next.vuex.vuejs.org/",
        logo: "https://vuejs.org/images/icons/favicon-96x96.png",
        packageName: "vuex",
        componentStateTypes: [LABEL_VUEX_BINDINGS]
      },
      function(api) {
        api.addTimelineLayer({
          id: MUTATIONS_LAYER_ID$1,
          label: "Vuex Mutations",
          color: COLOR_LIME_500
        });
        api.addTimelineLayer({
          id: ACTIONS_LAYER_ID,
          label: "Vuex Actions",
          color: COLOR_LIME_500
        });
        api.addInspector({
          id: INSPECTOR_ID$1,
          label: "Vuex",
          icon: "storage",
          treeFilterPlaceholder: "Filter stores..."
        });
        api.on.getInspectorTree(function(payload) {
          if (payload.app === app && payload.inspectorId === INSPECTOR_ID$1) {
            if (payload.filter) {
              var nodes = [];
              flattenStoreForInspectorTree(nodes, store2._modules.root, payload.filter, "");
              payload.rootNodes = nodes;
            } else {
              payload.rootNodes = [
                formatStoreForInspectorTree$1(store2._modules.root, "")
              ];
            }
          }
        });
        api.on.getInspectorState(function(payload) {
          if (payload.app === app && payload.inspectorId === INSPECTOR_ID$1) {
            var modulePath = payload.nodeId;
            makeLocalGetters(store2, modulePath);
            payload.state = formatStoreForInspectorState$1(
              getStoreModule(store2._modules, modulePath),
              modulePath === "root" ? store2.getters : store2._makeLocalGettersCache,
              modulePath
            );
          }
        });
        api.on.editInspectorState(function(payload) {
          if (payload.app === app && payload.inspectorId === INSPECTOR_ID$1) {
            var modulePath = payload.nodeId;
            var path = payload.path;
            if (modulePath !== "root") {
              path = modulePath.split("/").filter(Boolean).concat(path);
            }
            store2._withCommit(function() {
              payload.set(store2._state.data, path, payload.state.value);
            });
          }
        });
        store2.subscribe(function(mutation, state) {
          var data = {};
          if (mutation.payload) {
            data.payload = mutation.payload;
          }
          data.state = state;
          api.notifyComponentUpdate();
          api.sendInspectorTree(INSPECTOR_ID$1);
          api.sendInspectorState(INSPECTOR_ID$1);
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID$1,
            event: {
              time: Date.now(),
              title: mutation.type,
              data
            }
          });
        });
        store2.subscribeAction({
          before: function(action, state) {
            var data = {};
            if (action.payload) {
              data.payload = action.payload;
            }
            action._id = actionId++;
            action._time = Date.now();
            data.state = state;
            api.addTimelineEvent({
              layerId: ACTIONS_LAYER_ID,
              event: {
                time: action._time,
                title: action.type,
                groupId: action._id,
                subtitle: "start",
                data
              }
            });
          },
          after: function(action, state) {
            var data = {};
            var duration = Date.now() - action._time;
            data.duration = {
              _custom: {
                type: "duration",
                display: duration + "ms",
                tooltip: "Action duration",
                value: duration
              }
            };
            if (action.payload) {
              data.payload = action.payload;
            }
            data.state = state;
            api.addTimelineEvent({
              layerId: ACTIONS_LAYER_ID,
              event: {
                time: Date.now(),
                title: action.type,
                groupId: action._id,
                subtitle: "end",
                data
              }
            });
          }
        });
      }
    );
  }
  var COLOR_LIME_500 = 8702998;
  var COLOR_DARK = 6710886;
  var COLOR_WHITE = 16777215;
  var TAG_NAMESPACED = {
    label: "namespaced",
    textColor: COLOR_WHITE,
    backgroundColor: COLOR_DARK
  };
  function extractNameFromPath(path) {
    return path && path !== "root" ? path.split("/").slice(-2, -1)[0] : "Root";
  }
  function formatStoreForInspectorTree$1(module, path) {
    return {
      id: path || "root",
      // all modules end with a `/`, we want the last segment only
      // cart/ -> cart
      // nested/cart/ -> cart
      label: extractNameFromPath(path),
      tags: module.namespaced ? [TAG_NAMESPACED] : [],
      children: Object.keys(module._children).map(
        function(moduleName) {
          return formatStoreForInspectorTree$1(
            module._children[moduleName],
            path + moduleName + "/"
          );
        }
      )
    };
  }
  function flattenStoreForInspectorTree(result, module, filter, path) {
    if (path.includes(filter)) {
      result.push({
        id: path || "root",
        label: path.endsWith("/") ? path.slice(0, path.length - 1) : path || "Root",
        tags: module.namespaced ? [TAG_NAMESPACED] : []
      });
    }
    Object.keys(module._children).forEach(function(moduleName) {
      flattenStoreForInspectorTree(result, module._children[moduleName], filter, path + moduleName + "/");
    });
  }
  function formatStoreForInspectorState$1(module, getters, path) {
    getters = path === "root" ? getters : getters[path];
    var gettersKeys = Object.keys(getters);
    var storeState = {
      state: Object.keys(module.state).map(function(key) {
        return {
          key,
          editable: true,
          value: module.state[key]
        };
      })
    };
    if (gettersKeys.length) {
      var tree = transformPathsToObjectTree(getters);
      storeState.getters = Object.keys(tree).map(function(key) {
        return {
          key: key.endsWith("/") ? extractNameFromPath(key) : key,
          editable: false,
          value: canThrow(function() {
            return tree[key];
          })
        };
      });
    }
    return storeState;
  }
  function transformPathsToObjectTree(getters) {
    var result = {};
    Object.keys(getters).forEach(function(key) {
      var path = key.split("/");
      if (path.length > 1) {
        var target = result;
        var leafKey = path.pop();
        path.forEach(function(p2) {
          if (!target[p2]) {
            target[p2] = {
              _custom: {
                value: {},
                display: p2,
                tooltip: "Module",
                abstract: true
              }
            };
          }
          target = target[p2]._custom.value;
        });
        target[leafKey] = canThrow(function() {
          return getters[key];
        });
      } else {
        result[key] = canThrow(function() {
          return getters[key];
        });
      }
    });
    return result;
  }
  function getStoreModule(moduleMap, path) {
    var names = path.split("/").filter(function(n2) {
      return n2;
    });
    return names.reduce(
      function(module, moduleName, i2) {
        var child = module[moduleName];
        if (!child) {
          throw new Error('Missing module "' + moduleName + '" for path "' + path + '".');
        }
        return i2 === names.length - 1 ? child : child._children;
      },
      path === "root" ? moduleMap : moduleMap.root._children
    );
  }
  function canThrow(cb) {
    try {
      return cb();
    } catch (e2) {
      return e2;
    }
  }
  var Module = function Module2(rawModule, runtime) {
    this.runtime = runtime;
    this._children = /* @__PURE__ */ Object.create(null);
    this._rawModule = rawModule;
    var rawState = rawModule.state;
    this.state = (typeof rawState === "function" ? rawState() : rawState) || {};
  };
  var prototypeAccessors$1 = { namespaced: { configurable: true } };
  prototypeAccessors$1.namespaced.get = function() {
    return !!this._rawModule.namespaced;
  };
  Module.prototype.addChild = function addChild(key, module) {
    this._children[key] = module;
  };
  Module.prototype.removeChild = function removeChild(key) {
    delete this._children[key];
  };
  Module.prototype.getChild = function getChild(key) {
    return this._children[key];
  };
  Module.prototype.hasChild = function hasChild(key) {
    return key in this._children;
  };
  Module.prototype.update = function update(rawModule) {
    this._rawModule.namespaced = rawModule.namespaced;
    if (rawModule.actions) {
      this._rawModule.actions = rawModule.actions;
    }
    if (rawModule.mutations) {
      this._rawModule.mutations = rawModule.mutations;
    }
    if (rawModule.getters) {
      this._rawModule.getters = rawModule.getters;
    }
  };
  Module.prototype.forEachChild = function forEachChild(fn) {
    forEachValue(this._children, fn);
  };
  Module.prototype.forEachGetter = function forEachGetter(fn) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn);
    }
  };
  Module.prototype.forEachAction = function forEachAction(fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn);
    }
  };
  Module.prototype.forEachMutation = function forEachMutation(fn) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn);
    }
  };
  Object.defineProperties(Module.prototype, prototypeAccessors$1);
  var ModuleCollection = function ModuleCollection2(rawRootModule) {
    this.register([], rawRootModule, false);
  };
  ModuleCollection.prototype.get = function get(path) {
    return path.reduce(function(module, key) {
      return module.getChild(key);
    }, this.root);
  };
  ModuleCollection.prototype.getNamespace = function getNamespace(path) {
    var module = this.root;
    return path.reduce(function(namespace, key) {
      module = module.getChild(key);
      return namespace + (module.namespaced ? key + "/" : "");
    }, "");
  };
  ModuleCollection.prototype.update = function update$1(rawRootModule) {
    update2([], this.root, rawRootModule);
  };
  ModuleCollection.prototype.register = function register(path, rawModule, runtime) {
    var this$1$1 = this;
    if (runtime === void 0)
      runtime = true;
    {
      assertRawModule(path, rawModule);
    }
    var newModule = new Module(rawModule, runtime);
    if (path.length === 0) {
      this.root = newModule;
    } else {
      var parent = this.get(path.slice(0, -1));
      parent.addChild(path[path.length - 1], newModule);
    }
    if (rawModule.modules) {
      forEachValue(rawModule.modules, function(rawChildModule, key) {
        this$1$1.register(path.concat(key), rawChildModule, runtime);
      });
    }
  };
  ModuleCollection.prototype.unregister = function unregister(path) {
    var parent = this.get(path.slice(0, -1));
    var key = path[path.length - 1];
    var child = parent.getChild(key);
    if (!child) {
      {
        console.warn(
          "[vuex] trying to unregister module '" + key + "', which is not registered"
        );
      }
      return;
    }
    if (!child.runtime) {
      return;
    }
    parent.removeChild(key);
  };
  ModuleCollection.prototype.isRegistered = function isRegistered(path) {
    var parent = this.get(path.slice(0, -1));
    var key = path[path.length - 1];
    if (parent) {
      return parent.hasChild(key);
    }
    return false;
  };
  function update2(path, targetModule, newModule) {
    {
      assertRawModule(path, newModule);
    }
    targetModule.update(newModule);
    if (newModule.modules) {
      for (var key in newModule.modules) {
        if (!targetModule.getChild(key)) {
          {
            console.warn(
              "[vuex] trying to add a new module '" + key + "' on hot reloading, manual reload is needed"
            );
          }
          return;
        }
        update2(
          path.concat(key),
          targetModule.getChild(key),
          newModule.modules[key]
        );
      }
    }
  }
  var functionAssert = {
    assert: function(value) {
      return typeof value === "function";
    },
    expected: "function"
  };
  var objectAssert = {
    assert: function(value) {
      return typeof value === "function" || typeof value === "object" && typeof value.handler === "function";
    },
    expected: 'function or object with "handler" function'
  };
  var assertTypes = {
    getters: functionAssert,
    mutations: functionAssert,
    actions: objectAssert
  };
  function assertRawModule(path, rawModule) {
    Object.keys(assertTypes).forEach(function(key) {
      if (!rawModule[key]) {
        return;
      }
      var assertOptions = assertTypes[key];
      forEachValue(rawModule[key], function(value, type) {
        assert(
          assertOptions.assert(value),
          makeAssertionMessage(path, key, type, value, assertOptions.expected)
        );
      });
    });
  }
  function makeAssertionMessage(path, key, type, value, expected) {
    var buf = key + " should be " + expected + ' but "' + key + "." + type + '"';
    if (path.length > 0) {
      buf += ' in module "' + path.join(".") + '"';
    }
    buf += " is " + JSON.stringify(value) + ".";
    return buf;
  }
  function createStore(options) {
    return new Store(options);
  }
  var Store = function Store2(options) {
    var this$1$1 = this;
    if (options === void 0)
      options = {};
    {
      assert(typeof Promise !== "undefined", "vuex requires a Promise polyfill in this browser.");
      assert(this instanceof Store2, "store must be called with the new operator.");
    }
    var plugins = options.plugins;
    if (plugins === void 0)
      plugins = [];
    var strict = options.strict;
    if (strict === void 0)
      strict = false;
    var devtools = options.devtools;
    this._committing = false;
    this._actions = /* @__PURE__ */ Object.create(null);
    this._actionSubscribers = [];
    this._mutations = /* @__PURE__ */ Object.create(null);
    this._wrappedGetters = /* @__PURE__ */ Object.create(null);
    this._modules = new ModuleCollection(options);
    this._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
    this._subscribers = [];
    this._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
    this._scope = null;
    this._devtools = devtools;
    var store2 = this;
    var ref = this;
    var dispatch2 = ref.dispatch;
    var commit2 = ref.commit;
    this.dispatch = function boundDispatch(type, payload) {
      return dispatch2.call(store2, type, payload);
    };
    this.commit = function boundCommit(type, payload, options2) {
      return commit2.call(store2, type, payload, options2);
    };
    this.strict = strict;
    var state = this._modules.root.state;
    installModule(this, state, [], this._modules.root);
    resetStoreState(this, state);
    plugins.forEach(function(plugin) {
      return plugin(this$1$1);
    });
  };
  var prototypeAccessors = { state: { configurable: true } };
  Store.prototype.install = function install(app, injectKey) {
    app.provide(injectKey || storeKey, this);
    app.config.globalProperties.$store = this;
    var useDevtools = this._devtools !== void 0 ? this._devtools : true;
    if (useDevtools) {
      addDevtools(app, this);
    }
  };
  prototypeAccessors.state.get = function() {
    return this._state.data;
  };
  prototypeAccessors.state.set = function(v2) {
    {
      assert(false, "use store.replaceState() to explicit replace store state.");
    }
  };
  Store.prototype.commit = function commit(_type, _payload, _options) {
    var this$1$1 = this;
    var ref = unifyObjectStyle(_type, _payload, _options);
    var type = ref.type;
    var payload = ref.payload;
    var options = ref.options;
    var mutation = { type, payload };
    var entry = this._mutations[type];
    if (!entry) {
      {
        console.error("[vuex] unknown mutation type: " + type);
      }
      return;
    }
    this._withCommit(function() {
      entry.forEach(function commitIterator(handler) {
        handler(payload);
      });
    });
    this._subscribers.slice().forEach(function(sub) {
      return sub(mutation, this$1$1.state);
    });
    if (options && options.silent) {
      console.warn(
        "[vuex] mutation type: " + type + ". Silent option has been removed. Use the filter functionality in the vue-devtools"
      );
    }
  };
  Store.prototype.dispatch = function dispatch(_type, _payload) {
    var this$1$1 = this;
    var ref = unifyObjectStyle(_type, _payload);
    var type = ref.type;
    var payload = ref.payload;
    var action = { type, payload };
    var entry = this._actions[type];
    if (!entry) {
      {
        console.error("[vuex] unknown action type: " + type);
      }
      return;
    }
    try {
      this._actionSubscribers.slice().filter(function(sub) {
        return sub.before;
      }).forEach(function(sub) {
        return sub.before(action, this$1$1.state);
      });
    } catch (e2) {
      {
        console.warn("[vuex] error in before action subscribers: ");
        console.error(e2);
      }
    }
    var result = entry.length > 1 ? Promise.all(entry.map(function(handler) {
      return handler(payload);
    })) : entry[0](payload);
    return new Promise(function(resolve, reject) {
      result.then(function(res2) {
        try {
          this$1$1._actionSubscribers.filter(function(sub) {
            return sub.after;
          }).forEach(function(sub) {
            return sub.after(action, this$1$1.state);
          });
        } catch (e2) {
          {
            console.warn("[vuex] error in after action subscribers: ");
            console.error(e2);
          }
        }
        resolve(res2);
      }, function(error) {
        try {
          this$1$1._actionSubscribers.filter(function(sub) {
            return sub.error;
          }).forEach(function(sub) {
            return sub.error(action, this$1$1.state, error);
          });
        } catch (e2) {
          {
            console.warn("[vuex] error in error action subscribers: ");
            console.error(e2);
          }
        }
        reject(error);
      });
    });
  };
  Store.prototype.subscribe = function subscribe(fn, options) {
    return genericSubscribe(fn, this._subscribers, options);
  };
  Store.prototype.subscribeAction = function subscribeAction(fn, options) {
    var subs = typeof fn === "function" ? { before: fn } : fn;
    return genericSubscribe(subs, this._actionSubscribers, options);
  };
  Store.prototype.watch = function watch$1(getter, cb, options) {
    var this$1$1 = this;
    {
      assert(typeof getter === "function", "store.watch only accepts a function.");
    }
    return vue.watch(function() {
      return getter(this$1$1.state, this$1$1.getters);
    }, cb, Object.assign({}, options));
  };
  Store.prototype.replaceState = function replaceState(state) {
    var this$1$1 = this;
    this._withCommit(function() {
      this$1$1._state.data = state;
    });
  };
  Store.prototype.registerModule = function registerModule(path, rawModule, options) {
    if (options === void 0)
      options = {};
    if (typeof path === "string") {
      path = [path];
    }
    {
      assert(Array.isArray(path), "module path must be a string or an Array.");
      assert(path.length > 0, "cannot register the root module by using registerModule.");
    }
    this._modules.register(path, rawModule);
    installModule(this, this.state, path, this._modules.get(path), options.preserveState);
    resetStoreState(this, this.state);
  };
  Store.prototype.unregisterModule = function unregisterModule(path) {
    var this$1$1 = this;
    if (typeof path === "string") {
      path = [path];
    }
    {
      assert(Array.isArray(path), "module path must be a string or an Array.");
    }
    this._modules.unregister(path);
    this._withCommit(function() {
      var parentState = getNestedState(this$1$1.state, path.slice(0, -1));
      delete parentState[path[path.length - 1]];
    });
    resetStore(this);
  };
  Store.prototype.hasModule = function hasModule(path) {
    if (typeof path === "string") {
      path = [path];
    }
    {
      assert(Array.isArray(path), "module path must be a string or an Array.");
    }
    return this._modules.isRegistered(path);
  };
  Store.prototype.hotUpdate = function hotUpdate(newOptions) {
    this._modules.update(newOptions);
    resetStore(this, true);
  };
  Store.prototype._withCommit = function _withCommit(fn) {
    var committing = this._committing;
    this._committing = true;
    fn();
    this._committing = committing;
  };
  Object.defineProperties(Store.prototype, prototypeAccessors);
  var mapState$1 = normalizeNamespace(function(namespace, states) {
    var res2 = {};
    if (!isValidMap(states)) {
      console.error("[vuex] mapState: mapper parameter must be either an Array or an Object");
    }
    normalizeMap(states).forEach(function(ref) {
      var key = ref.key;
      var val = ref.val;
      res2[key] = function mappedState() {
        var state = this.$store.state;
        var getters = this.$store.getters;
        if (namespace) {
          var module = getModuleByNamespace(this.$store, "mapState", namespace);
          if (!module) {
            return;
          }
          state = module.context.state;
          getters = module.context.getters;
        }
        return typeof val === "function" ? val.call(this, state, getters) : state[val];
      };
      res2[key].vuex = true;
    });
    return res2;
  });
  var mapMutations = normalizeNamespace(function(namespace, mutations) {
    var res2 = {};
    if (!isValidMap(mutations)) {
      console.error("[vuex] mapMutations: mapper parameter must be either an Array or an Object");
    }
    normalizeMap(mutations).forEach(function(ref) {
      var key = ref.key;
      var val = ref.val;
      res2[key] = function mappedMutation() {
        var args = [], len = arguments.length;
        while (len--)
          args[len] = arguments[len];
        var commit2 = this.$store.commit;
        if (namespace) {
          var module = getModuleByNamespace(this.$store, "mapMutations", namespace);
          if (!module) {
            return;
          }
          commit2 = module.context.commit;
        }
        return typeof val === "function" ? val.apply(this, [commit2].concat(args)) : commit2.apply(this.$store, [val].concat(args));
      };
    });
    return res2;
  });
  var mapGetters$1 = normalizeNamespace(function(namespace, getters) {
    var res2 = {};
    if (!isValidMap(getters)) {
      console.error("[vuex] mapGetters: mapper parameter must be either an Array or an Object");
    }
    normalizeMap(getters).forEach(function(ref) {
      var key = ref.key;
      var val = ref.val;
      val = namespace + val;
      res2[key] = function mappedGetter() {
        if (namespace && !getModuleByNamespace(this.$store, "mapGetters", namespace)) {
          return;
        }
        if (!(val in this.$store.getters)) {
          console.error("[vuex] unknown getter: " + val);
          return;
        }
        return this.$store.getters[val];
      };
      res2[key].vuex = true;
    });
    return res2;
  });
  var mapActions$1 = normalizeNamespace(function(namespace, actions) {
    var res2 = {};
    if (!isValidMap(actions)) {
      console.error("[vuex] mapActions: mapper parameter must be either an Array or an Object");
    }
    normalizeMap(actions).forEach(function(ref) {
      var key = ref.key;
      var val = ref.val;
      res2[key] = function mappedAction() {
        var args = [], len = arguments.length;
        while (len--)
          args[len] = arguments[len];
        var dispatch2 = this.$store.dispatch;
        if (namespace) {
          var module = getModuleByNamespace(this.$store, "mapActions", namespace);
          if (!module) {
            return;
          }
          dispatch2 = module.context.dispatch;
        }
        return typeof val === "function" ? val.apply(this, [dispatch2].concat(args)) : dispatch2.apply(this.$store, [val].concat(args));
      };
    });
    return res2;
  });
  var createNamespacedHelpers = function(namespace) {
    return {
      mapState: mapState$1.bind(null, namespace),
      mapGetters: mapGetters$1.bind(null, namespace),
      mapMutations: mapMutations.bind(null, namespace),
      mapActions: mapActions$1.bind(null, namespace)
    };
  };
  function normalizeMap(map) {
    if (!isValidMap(map)) {
      return [];
    }
    return Array.isArray(map) ? map.map(function(key) {
      return { key, val: key };
    }) : Object.keys(map).map(function(key) {
      return { key, val: map[key] };
    });
  }
  function isValidMap(map) {
    return Array.isArray(map) || isObject(map);
  }
  function normalizeNamespace(fn) {
    return function(namespace, map) {
      if (typeof namespace !== "string") {
        map = namespace;
        namespace = "";
      } else if (namespace.charAt(namespace.length - 1) !== "/") {
        namespace += "/";
      }
      return fn(namespace, map);
    };
  }
  function getModuleByNamespace(store2, helper, namespace) {
    var module = store2._modulesNamespaceMap[namespace];
    if (!module) {
      console.error("[vuex] module namespace not found in " + helper + "(): " + namespace);
    }
    return module;
  }
  function createLogger(ref) {
    if (ref === void 0)
      ref = {};
    var collapsed = ref.collapsed;
    if (collapsed === void 0)
      collapsed = true;
    var filter = ref.filter;
    if (filter === void 0)
      filter = function(mutation, stateBefore, stateAfter) {
        return true;
      };
    var transformer = ref.transformer;
    if (transformer === void 0)
      transformer = function(state) {
        return state;
      };
    var mutationTransformer = ref.mutationTransformer;
    if (mutationTransformer === void 0)
      mutationTransformer = function(mut) {
        return mut;
      };
    var actionFilter = ref.actionFilter;
    if (actionFilter === void 0)
      actionFilter = function(action, state) {
        return true;
      };
    var actionTransformer = ref.actionTransformer;
    if (actionTransformer === void 0)
      actionTransformer = function(act) {
        return act;
      };
    var logMutations = ref.logMutations;
    if (logMutations === void 0)
      logMutations = true;
    var logActions = ref.logActions;
    if (logActions === void 0)
      logActions = true;
    var logger = ref.logger;
    if (logger === void 0)
      logger = console;
    return function(store2) {
      var prevState = deepCopy(store2.state);
      if (typeof logger === "undefined") {
        return;
      }
      if (logMutations) {
        store2.subscribe(function(mutation, state) {
          var nextState = deepCopy(state);
          if (filter(mutation, prevState, nextState)) {
            var formattedTime = getFormattedTime();
            var formattedMutation = mutationTransformer(mutation);
            var message = "mutation " + mutation.type + formattedTime;
            startMessage(logger, message, collapsed);
            logger.log("%c prev state", "color: #9E9E9E; font-weight: bold", transformer(prevState));
            logger.log("%c mutation", "color: #03A9F4; font-weight: bold", formattedMutation);
            logger.log("%c next state", "color: #4CAF50; font-weight: bold", transformer(nextState));
            endMessage(logger);
          }
          prevState = nextState;
        });
      }
      if (logActions) {
        store2.subscribeAction(function(action, state) {
          if (actionFilter(action, state)) {
            var formattedTime = getFormattedTime();
            var formattedAction = actionTransformer(action);
            var message = "action " + action.type + formattedTime;
            startMessage(logger, message, collapsed);
            logger.log("%c action", "color: #03A9F4; font-weight: bold", formattedAction);
            endMessage(logger);
          }
        });
      }
    };
  }
  function startMessage(logger, message, collapsed) {
    var startMessage2 = collapsed ? logger.groupCollapsed : logger.group;
    try {
      startMessage2.call(logger, message);
    } catch (e2) {
      logger.log(message);
    }
  }
  function endMessage(logger) {
    try {
      logger.groupEnd();
    } catch (e2) {
      logger.log("—— log end ——");
    }
  }
  function getFormattedTime() {
    var time = /* @__PURE__ */ new Date();
    return " @ " + pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + "." + pad(time.getMilliseconds(), 3);
  }
  function repeat(str, times) {
    return new Array(times + 1).join(str);
  }
  function pad(num, maxLength) {
    return repeat("0", maxLength - num.toString().length) + num;
  }
  var index = {
    version: "4.1.0",
    Store,
    storeKey,
    createStore,
    useStore,
    mapState: mapState$1,
    mapMutations,
    mapGetters: mapGetters$1,
    mapActions: mapActions$1,
    createNamespacedHelpers,
    createLogger
  };
  function callCheckVersion() {
    return new Promise((resolve, reject) => {
      plus.runtime.getProperty(plus.runtime.appid, function(widgetInfo) {
        const data = {
          action: "checkVersion",
          appid: plus.runtime.appid,
          appVersion: plus.runtime.version,
          wgtVersion: widgetInfo.version
        };
        formatAppLog("log", "at uni_modules/uni-upgrade-center-app/utils/call-check-version.js:11", "data: ", data);
        nr.callFunction({
          name: "uni-upgrade-center",
          data,
          success: (e2) => {
            formatAppLog("log", "at uni_modules/uni-upgrade-center-app/utils/call-check-version.js:16", "e: ", e2);
            resolve(e2);
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    });
  }
  const PACKAGE_INFO_KEY = "__package_info__";
  function checkUpdate() {
    return new Promise((resolve, reject) => {
      callCheckVersion().then(async (e2) => {
        if (!e2.result)
          return;
        const {
          code,
          message,
          is_silently,
          // 是否静默更新
          url,
          // 安装包下载地址
          platform: platform2,
          // 安装包平台
          type
          // 安装包类型
        } = e2.result;
        if (code > 0) {
          const {
            fileList
          } = await nr.getTempFileURL({
            fileList: [url]
          });
          if (fileList[0].tempFileURL)
            e2.result.url = fileList[0].tempFileURL;
          resolve(e2);
          if (is_silently) {
            uni.downloadFile({
              url: e2.result.url,
              success: (res2) => {
                if (res2.statusCode == 200) {
                  plus.runtime.install(res2.tempFilePath, {
                    force: false
                  });
                }
              }
            });
            return;
          }
          uni.setStorageSync(PACKAGE_INFO_KEY, e2.result);
          uni.navigateTo({
            url: `/uni_modules/uni-upgrade-center-app/pages/upgrade-popup?local_storage_key=${PACKAGE_INFO_KEY}`,
            fail: (err) => {
              formatAppLog("error", "at uni_modules/uni-upgrade-center-app/utils/check-update.js:63", "更新弹框跳转失败", err);
              uni.removeStorageSync(PACKAGE_INFO_KEY);
            }
          });
          return;
        } else if (code < 0) {
          formatAppLog("error", "at uni_modules/uni-upgrade-center-app/utils/check-update.js:71", message);
          return reject(e2);
        }
        return resolve(e2);
      }).catch((err) => {
        formatAppLog("error", "at uni_modules/uni-upgrade-center-app/utils/check-update.js:77", err.message);
        reject(err);
      });
    });
  }
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:23", "App Launch");
      if (plus.runtime.appid !== "HBuilder") {
        checkUpdate();
      }
      uni.preLogin({
        provider: "univerify",
        success: (res2) => {
          this.setUniverifyErrorMsg();
          formatAppLog("log", "at App.vue:36", "preLogin success: ", res2);
        },
        fail: (res2) => {
          this.setUniverifyLogin(false);
          this.setUniverifyErrorMsg(res2.errMsg);
          formatAppLog("log", "at App.vue:42", "preLogin fail res: ", res2);
        }
      });
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:48", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:51", "App Hide");
    },
    globalData: {
      test: ""
    },
    methods: {
      ...mapMutations(["setUniverifyErrorMsg", "setUniverifyLogin"])
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/project/dlw/uniapp-dileiwo/App.vue"]]);
  const store = createStore({
    state: {
      hasLogin: false,
      isUniverifyLogin: false,
      loginProvider: "",
      openid: null,
      testvuex: false,
      colorIndex: 0,
      colorList: ["#FF0000", "#00FF00", "#0000FF"],
      noMatchLeftWindow: true,
      active: "componentPage",
      leftWinActive: "/pages/component/view/view",
      activeOpen: "",
      menu: [],
      univerifyErrorMsg: "",
      // vuex测试例使用
      username: "foo",
      sex: "男",
      age: 10
    },
    mutations: {
      login(state, provider) {
        state.hasLogin = true;
        state.loginProvider = provider;
      },
      logout(state) {
        state.hasLogin = false;
        state.openid = null;
      },
      setOpenid(state, openid) {
        state.openid = openid;
      },
      setTestTrue(state) {
        state.testvuex = true;
      },
      setTestFalse(state) {
        state.testvuex = false;
      },
      setColorIndex(state, index2) {
        state.colorIndex = index2;
      },
      setMatchLeftWindow(state, matchLeftWindow) {
        state.noMatchLeftWindow = !matchLeftWindow;
      },
      setActive(state, tabPage) {
        state.active = tabPage;
      },
      setLeftWinActive(state, leftWinActive) {
        state.leftWinActive = leftWinActive;
      },
      setActiveOpen(state, activeOpen) {
        state.activeOpen = activeOpen;
      },
      setMenu(state, menu) {
        state.menu = menu;
      },
      setUniverifyLogin(state, payload) {
        typeof payload !== "boolean" ? payload = !!payload : "";
        state.isUniverifyLogin = payload;
      },
      setUniverifyErrorMsg(state, payload = "") {
        state.univerifyErrorMsg = payload;
      },
      // vuex测试例使用
      increment(state) {
        state.age++;
      },
      incrementTen(state, payload) {
        state.age += payload.amount;
      },
      resetAge(state) {
        state.age = 10;
      }
    },
    getters: {
      currentColor(state) {
        return state.colorList[state.colorIndex];
      },
      // vuex测试例使用
      doubleAge(state) {
        return state.age * 2;
      }
    },
    actions: {
      // vuex测试例使用
      incrementAsync(context, payload) {
        context.commit("incrementTen", payload);
      },
      // lazy loading openid
      getUserOpenId: async function({
        commit,
        state
      }) {
        return await new Promise((resolve, reject) => {
          if (state.openid) {
            resolve(state.openid);
          } else {
            uni.login({
              success: (data) => {
                commit("login");
                setTimeout(function() {
                  const openid = "123456789";
                  formatAppLog("log", "at store/index.js:113", "uni.request mock openid[" + openid + "]");
                  commit("setOpenid", openid);
                  resolve(openid);
                }, 1e3);
              },
              fail: (err) => {
                formatAppLog("log", "at store/index.js:119", "uni.login 接口调用失败，将无法正常使用开放接口等服务", err);
                reject(err);
              }
            });
          }
        });
      },
      getPhoneNumber: function({
        commit
      }, univerifyInfo) {
        return new Promise((resolve, reject) => {
          uni.request({
            url: "https://97fca9f2-41f6-449f-a35e-3f135d4c3875.bspapp.com/http/univerify-login",
            method: "POST",
            data: univerifyInfo,
            success: (res2) => {
              const data = res2.data;
              if (data.success) {
                resolve(data.phoneNumber);
              } else {
                reject(res2);
              }
            },
            fail: (err) => {
              reject(res);
            }
          });
        });
      }
    }
  });
  var isVue2 = false;
  function set(target, key, val) {
    if (Array.isArray(target)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val;
    }
    target[key] = val;
    return val;
  }
  function del(target, key) {
    if (Array.isArray(target)) {
      target.splice(key, 1);
      return;
    }
    delete target[key];
  }
  function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  const isProxyAvailable = typeof Proxy === "function";
  const HOOK_SETUP = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
  let supported;
  let perf;
  function isPerformanceSupported() {
    var _a;
    if (supported !== void 0) {
      return supported;
    }
    if (typeof window !== "undefined" && window.performance) {
      supported = true;
      perf = window.performance;
    } else if (typeof global !== "undefined" && ((_a = global.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
      supported = true;
      perf = global.perf_hooks.performance;
    } else {
      supported = false;
    }
    return supported;
  }
  function now() {
    return isPerformanceSupported() ? perf.now() : Date.now();
  }
  class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = Object.assign({}, defaultSettings);
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e2) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e2) {
          }
          currentSettings = value;
        },
        now() {
          return now();
        }
      };
      if (hook) {
        hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
          if (pluginId === this.plugin.id) {
            this.fallbacks.setSettings(value);
          }
        });
      }
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  }
  function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const descriptor = pluginDescriptor;
    const target = getTarget();
    const hook = getDevtoolsGlobalHook();
    const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor: descriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
   * pinia v2.1.7
   * (c) 2023 Eduardo San Martin Morote
   * @license MIT
   */
  let activePinia;
  const setActivePinia = (pinia) => activePinia = pinia;
  const getActivePinia = () => vue.hasInjectionContext() && vue.inject(piniaSymbol) || activePinia;
  const piniaSymbol = Symbol("pinia");
  function isPlainObject(o2) {
    return o2 && typeof o2 === "object" && Object.prototype.toString.call(o2) === "[object Object]" && typeof o2.toJSON !== "function";
  }
  var MutationType;
  (function(MutationType2) {
    MutationType2["direct"] = "direct";
    MutationType2["patchObject"] = "patch object";
    MutationType2["patchFunction"] = "patch function";
  })(MutationType || (MutationType = {}));
  const IS_CLIENT = typeof window !== "undefined";
  const USE_DEVTOOLS = IS_CLIENT;
  const _global = /* @__PURE__ */ (() => typeof window === "object" && window.window === window ? window : typeof self === "object" && self.self === self ? self : typeof global === "object" && global.global === global ? global : typeof globalThis === "object" ? globalThis : { HTMLElement: null })();
  function bom(blob, { autoBom = false } = {}) {
    if (autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob([String.fromCharCode(65279), blob], { type: blob.type });
    }
    return blob;
  }
  function download(url, name, opts) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.onload = function() {
      saveAs(xhr.response, name, opts);
    };
    xhr.onerror = function() {
      console.error("could not download file");
    };
    xhr.send();
  }
  function corsEnabled(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, false);
    try {
      xhr.send();
    } catch (e2) {
    }
    return xhr.status >= 200 && xhr.status <= 299;
  }
  function click(node) {
    try {
      node.dispatchEvent(new MouseEvent("click"));
    } catch (e2) {
      const evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
      node.dispatchEvent(evt);
    }
  }
  const _navigator = typeof navigator === "object" ? navigator : { userAgent: "" };
  const isMacOSWebView = /* @__PURE__ */ (() => /Macintosh/.test(_navigator.userAgent) && /AppleWebKit/.test(_navigator.userAgent) && !/Safari/.test(_navigator.userAgent))();
  const saveAs = !IS_CLIENT ? () => {
  } : (
    // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView or mini program
    typeof HTMLAnchorElement !== "undefined" && "download" in HTMLAnchorElement.prototype && !isMacOSWebView ? downloadSaveAs : (
      // Use msSaveOrOpenBlob as a second approach
      "msSaveOrOpenBlob" in _navigator ? msSaveAs : (
        // Fallback to using FileReader and a popup
        fileSaverSaveAs
      )
    )
  );
  function downloadSaveAs(blob, name = "download", opts) {
    const a2 = document.createElement("a");
    a2.download = name;
    a2.rel = "noopener";
    if (typeof blob === "string") {
      a2.href = blob;
      if (a2.origin !== location.origin) {
        if (corsEnabled(a2.href)) {
          download(blob, name, opts);
        } else {
          a2.target = "_blank";
          click(a2);
        }
      } else {
        click(a2);
      }
    } else {
      a2.href = URL.createObjectURL(blob);
      setTimeout(function() {
        URL.revokeObjectURL(a2.href);
      }, 4e4);
      setTimeout(function() {
        click(a2);
      }, 0);
    }
  }
  function msSaveAs(blob, name = "download", opts) {
    if (typeof blob === "string") {
      if (corsEnabled(blob)) {
        download(blob, name, opts);
      } else {
        const a2 = document.createElement("a");
        a2.href = blob;
        a2.target = "_blank";
        setTimeout(function() {
          click(a2);
        });
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
  }
  function fileSaverSaveAs(blob, name, opts, popup) {
    popup = popup || open("", "_blank");
    if (popup) {
      popup.document.title = popup.document.body.innerText = "downloading...";
    }
    if (typeof blob === "string")
      return download(blob, name, opts);
    const force = blob.type === "application/octet-stream";
    const isSafari = /constructor/i.test(String(_global.HTMLElement)) || "safari" in _global;
    const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
    if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onloadend = function() {
        let url = reader.result;
        if (typeof url !== "string") {
          popup = null;
          throw new Error("Wrong reader.result type");
        }
        url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, "data:attachment/file;");
        if (popup) {
          popup.location.href = url;
        } else {
          location.assign(url);
        }
        popup = null;
      };
      reader.readAsDataURL(blob);
    } else {
      const url = URL.createObjectURL(blob);
      if (popup)
        popup.location.assign(url);
      else
        location.href = url;
      popup = null;
      setTimeout(function() {
        URL.revokeObjectURL(url);
      }, 4e4);
    }
  }
  function toastMessage(message, type) {
    const piniaMessage = "🍍 " + message;
    if (typeof __VUE_DEVTOOLS_TOAST__ === "function") {
      __VUE_DEVTOOLS_TOAST__(piniaMessage, type);
    } else if (type === "error") {
      console.error(piniaMessage);
    } else if (type === "warn") {
      console.warn(piniaMessage);
    } else {
      console.log(piniaMessage);
    }
  }
  function isPinia(o2) {
    return "_a" in o2 && "install" in o2;
  }
  function checkClipboardAccess() {
    if (!("clipboard" in navigator)) {
      toastMessage(`Your browser doesn't support the Clipboard API`, "error");
      return true;
    }
  }
  function checkNotFocusedError(error) {
    if (error instanceof Error && error.message.toLowerCase().includes("document is not focused")) {
      toastMessage('You need to activate the "Emulate a focused page" setting in the "Rendering" panel of devtools.', "warn");
      return true;
    }
    return false;
  }
  async function actionGlobalCopyState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(pinia.state.value));
      toastMessage("Global state copied to clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to serialize the state. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalPasteState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      loadStoresState(pinia, JSON.parse(await navigator.clipboard.readText()));
      toastMessage("Global state pasted from clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to deserialize the state from clipboard. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalSaveState(pinia) {
    try {
      saveAs(new Blob([JSON.stringify(pinia.state.value)], {
        type: "text/plain;charset=utf-8"
      }), "pinia-state.json");
    } catch (error) {
      toastMessage(`Failed to export the state as JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  let fileInput;
  function getFileOpener() {
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
    }
    function openFile() {
      return new Promise((resolve, reject) => {
        fileInput.onchange = async () => {
          const files = fileInput.files;
          if (!files)
            return resolve(null);
          const file = files.item(0);
          if (!file)
            return resolve(null);
          return resolve({ text: await file.text(), file });
        };
        fileInput.oncancel = () => resolve(null);
        fileInput.onerror = reject;
        fileInput.click();
      });
    }
    return openFile;
  }
  async function actionGlobalOpenStateFile(pinia) {
    try {
      const open2 = getFileOpener();
      const result = await open2();
      if (!result)
        return;
      const { text, file } = result;
      loadStoresState(pinia, JSON.parse(text));
      toastMessage(`Global state imported from "${file.name}".`);
    } catch (error) {
      toastMessage(`Failed to import the state from JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  function loadStoresState(pinia, state) {
    for (const key in state) {
      const storeState = pinia.state.value[key];
      if (storeState) {
        Object.assign(storeState, state[key]);
      } else {
        pinia.state.value[key] = state[key];
      }
    }
  }
  function formatDisplay(display) {
    return {
      _custom: {
        display
      }
    };
  }
  const PINIA_ROOT_LABEL = "🍍 Pinia (root)";
  const PINIA_ROOT_ID = "_root";
  function formatStoreForInspectorTree(store2) {
    return isPinia(store2) ? {
      id: PINIA_ROOT_ID,
      label: PINIA_ROOT_LABEL
    } : {
      id: store2.$id,
      label: store2.$id
    };
  }
  function formatStoreForInspectorState(store2) {
    if (isPinia(store2)) {
      const storeNames = Array.from(store2._s.keys());
      const storeMap = store2._s;
      const state2 = {
        state: storeNames.map((storeId) => ({
          editable: true,
          key: storeId,
          value: store2.state.value[storeId]
        })),
        getters: storeNames.filter((id) => storeMap.get(id)._getters).map((id) => {
          const store22 = storeMap.get(id);
          return {
            editable: false,
            key: id,
            value: store22._getters.reduce((getters, key) => {
              getters[key] = store22[key];
              return getters;
            }, {})
          };
        })
      };
      return state2;
    }
    const state = {
      state: Object.keys(store2.$state).map((key) => ({
        editable: true,
        key,
        value: store2.$state[key]
      }))
    };
    if (store2._getters && store2._getters.length) {
      state.getters = store2._getters.map((getterName) => ({
        editable: false,
        key: getterName,
        value: store2[getterName]
      }));
    }
    if (store2._customProperties.size) {
      state.customProperties = Array.from(store2._customProperties).map((key) => ({
        editable: true,
        key,
        value: store2[key]
      }));
    }
    return state;
  }
  function formatEventData(events) {
    if (!events)
      return {};
    if (Array.isArray(events)) {
      return events.reduce((data, event) => {
        data.keys.push(event.key);
        data.operations.push(event.type);
        data.oldValue[event.key] = event.oldValue;
        data.newValue[event.key] = event.newValue;
        return data;
      }, {
        oldValue: {},
        keys: [],
        operations: [],
        newValue: {}
      });
    } else {
      return {
        operation: formatDisplay(events.type),
        key: formatDisplay(events.key),
        oldValue: events.oldValue,
        newValue: events.newValue
      };
    }
  }
  function formatMutationType(type) {
    switch (type) {
      case MutationType.direct:
        return "mutation";
      case MutationType.patchFunction:
        return "$patch";
      case MutationType.patchObject:
        return "$patch";
      default:
        return "unknown";
    }
  }
  let isTimelineActive = true;
  const componentStateTypes = [];
  const MUTATIONS_LAYER_ID = "pinia:mutations";
  const INSPECTOR_ID = "pinia";
  const { assign: assign$1 } = Object;
  const getStoreType = (id) => "🍍 " + id;
  function registerPiniaDevtools(app, pinia) {
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app
    }, (api) => {
      if (typeof api.now !== "function") {
        toastMessage("You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html.");
      }
      api.addTimelineLayer({
        id: MUTATIONS_LAYER_ID,
        label: `Pinia 🍍`,
        color: 15064968
      });
      api.addInspector({
        id: INSPECTOR_ID,
        label: "Pinia 🍍",
        icon: "storage",
        treeFilterPlaceholder: "Search stores",
        actions: [
          {
            icon: "content_copy",
            action: () => {
              actionGlobalCopyState(pinia);
            },
            tooltip: "Serialize and copy the state"
          },
          {
            icon: "content_paste",
            action: async () => {
              await actionGlobalPasteState(pinia);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Replace the state with the content of your clipboard"
          },
          {
            icon: "save",
            action: () => {
              actionGlobalSaveState(pinia);
            },
            tooltip: "Save the state as a JSON file"
          },
          {
            icon: "folder_open",
            action: async () => {
              await actionGlobalOpenStateFile(pinia);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Import the state from a JSON file"
          }
        ],
        nodeActions: [
          {
            icon: "restore",
            tooltip: 'Reset the state (with "$reset")',
            action: (nodeId) => {
              const store2 = pinia._s.get(nodeId);
              if (!store2) {
                toastMessage(`Cannot reset "${nodeId}" store because it wasn't found.`, "warn");
              } else if (typeof store2.$reset !== "function") {
                toastMessage(`Cannot reset "${nodeId}" store because it doesn't have a "$reset" method implemented.`, "warn");
              } else {
                store2.$reset();
                toastMessage(`Store "${nodeId}" reset.`);
              }
            }
          }
        ]
      });
      api.on.inspectComponent((payload, ctx) => {
        const proxy = payload.componentInstance && payload.componentInstance.proxy;
        if (proxy && proxy._pStores) {
          const piniaStores = payload.componentInstance.proxy._pStores;
          Object.values(piniaStores).forEach((store2) => {
            payload.instanceData.state.push({
              type: getStoreType(store2.$id),
              key: "state",
              editable: true,
              value: store2._isOptionsAPI ? {
                _custom: {
                  value: vue.toRaw(store2.$state),
                  actions: [
                    {
                      icon: "restore",
                      tooltip: "Reset the state of this store",
                      action: () => store2.$reset()
                    }
                  ]
                }
              } : (
                // NOTE: workaround to unwrap transferred refs
                Object.keys(store2.$state).reduce((state, key) => {
                  state[key] = store2.$state[key];
                  return state;
                }, {})
              )
            });
            if (store2._getters && store2._getters.length) {
              payload.instanceData.state.push({
                type: getStoreType(store2.$id),
                key: "getters",
                editable: false,
                value: store2._getters.reduce((getters, key) => {
                  try {
                    getters[key] = store2[key];
                  } catch (error) {
                    getters[key] = error;
                  }
                  return getters;
                }, {})
              });
            }
          });
        }
      });
      api.on.getInspectorTree((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          let stores = [pinia];
          stores = stores.concat(Array.from(pinia._s.values()));
          payload.rootNodes = (payload.filter ? stores.filter((store2) => "$id" in store2 ? store2.$id.toLowerCase().includes(payload.filter.toLowerCase()) : PINIA_ROOT_LABEL.toLowerCase().includes(payload.filter.toLowerCase())) : stores).map(formatStoreForInspectorTree);
        }
      });
      api.on.getInspectorState((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return;
          }
          if (inspectedStore) {
            payload.state = formatStoreForInspectorState(inspectedStore);
          }
        }
      });
      api.on.editInspectorState((payload, ctx) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return toastMessage(`store "${payload.nodeId}" not found`, "error");
          }
          const { path } = payload;
          if (!isPinia(inspectedStore)) {
            if (path.length !== 1 || !inspectedStore._customProperties.has(path[0]) || path[0] in inspectedStore.$state) {
              path.unshift("$state");
            }
          } else {
            path.unshift("state");
          }
          isTimelineActive = false;
          payload.set(inspectedStore, path, payload.state.value);
          isTimelineActive = true;
        }
      });
      api.on.editComponentState((payload) => {
        if (payload.type.startsWith("🍍")) {
          const storeId = payload.type.replace(/^🍍\s*/, "");
          const store2 = pinia._s.get(storeId);
          if (!store2) {
            return toastMessage(`store "${storeId}" not found`, "error");
          }
          const { path } = payload;
          if (path[0] !== "state") {
            return toastMessage(`Invalid path for store "${storeId}":
${path}
Only state can be modified.`);
          }
          path[0] = "$state";
          isTimelineActive = false;
          payload.set(store2, path, payload.state.value);
          isTimelineActive = true;
        }
      });
    });
  }
  function addStoreToDevtools(app, store2) {
    if (!componentStateTypes.includes(getStoreType(store2.$id))) {
      componentStateTypes.push(getStoreType(store2.$id));
    }
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app,
      settings: {
        logStoreChanges: {
          label: "Notify about new/deleted stores",
          type: "boolean",
          defaultValue: true
        }
        // useEmojis: {
        //   label: 'Use emojis in messages ⚡️',
        //   type: 'boolean',
        //   defaultValue: true,
        // },
      }
    }, (api) => {
      const now2 = typeof api.now === "function" ? api.now.bind(api) : Date.now;
      store2.$onAction(({ after, onError, name, args }) => {
        const groupId = runningActionId++;
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🛫 " + name,
            subtitle: "start",
            data: {
              store: formatDisplay(store2.$id),
              action: formatDisplay(name),
              args
            },
            groupId
          }
        });
        after((result) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              title: "🛬 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store2.$id),
                action: formatDisplay(name),
                args,
                result
              },
              groupId
            }
          });
        });
        onError((error) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              logType: "error",
              title: "💥 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store2.$id),
                action: formatDisplay(name),
                args,
                error
              },
              groupId
            }
          });
        });
      }, true);
      store2._customProperties.forEach((name) => {
        vue.watch(() => vue.unref(store2[name]), (newValue, oldValue) => {
          api.notifyComponentUpdate();
          api.sendInspectorState(INSPECTOR_ID);
          if (isTimelineActive) {
            api.addTimelineEvent({
              layerId: MUTATIONS_LAYER_ID,
              event: {
                time: now2(),
                title: "Change",
                subtitle: name,
                data: {
                  newValue,
                  oldValue
                },
                groupId: activeAction
              }
            });
          }
        }, { deep: true });
      });
      store2.$subscribe(({ events, type }, state) => {
        api.notifyComponentUpdate();
        api.sendInspectorState(INSPECTOR_ID);
        if (!isTimelineActive)
          return;
        const eventData = {
          time: now2(),
          title: formatMutationType(type),
          data: assign$1({ store: formatDisplay(store2.$id) }, formatEventData(events)),
          groupId: activeAction
        };
        if (type === MutationType.patchFunction) {
          eventData.subtitle = "⤵️";
        } else if (type === MutationType.patchObject) {
          eventData.subtitle = "🧩";
        } else if (events && !Array.isArray(events)) {
          eventData.subtitle = events.type;
        }
        if (events) {
          eventData.data["rawEvent(s)"] = {
            _custom: {
              display: "DebuggerEvent",
              type: "object",
              tooltip: "raw DebuggerEvent[]",
              value: events
            }
          };
        }
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: eventData
        });
      }, { detached: true, flush: "sync" });
      const hotUpdate = store2._hotUpdate;
      store2._hotUpdate = vue.markRaw((newStore) => {
        hotUpdate(newStore);
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🔥 " + store2.$id,
            subtitle: "HMR update",
            data: {
              store: formatDisplay(store2.$id),
              info: formatDisplay(`HMR update`)
            }
          }
        });
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
      });
      const { $dispose } = store2;
      store2.$dispose = () => {
        $dispose();
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
        api.getSettings().logStoreChanges && toastMessage(`Disposed "${store2.$id}" store 🗑`);
      };
      api.notifyComponentUpdate();
      api.sendInspectorTree(INSPECTOR_ID);
      api.sendInspectorState(INSPECTOR_ID);
      api.getSettings().logStoreChanges && toastMessage(`"${store2.$id}" store installed 🆕`);
    });
  }
  let runningActionId = 0;
  let activeAction;
  function patchActionForGrouping(store2, actionNames, wrapWithProxy) {
    const actions = actionNames.reduce((storeActions, actionName) => {
      storeActions[actionName] = vue.toRaw(store2)[actionName];
      return storeActions;
    }, {});
    for (const actionName in actions) {
      store2[actionName] = function() {
        const _actionId = runningActionId;
        const trackedStore = wrapWithProxy ? new Proxy(store2, {
          get(...args) {
            activeAction = _actionId;
            return Reflect.get(...args);
          },
          set(...args) {
            activeAction = _actionId;
            return Reflect.set(...args);
          }
        }) : store2;
        activeAction = _actionId;
        const retValue = actions[actionName].apply(trackedStore, arguments);
        activeAction = void 0;
        return retValue;
      };
    }
  }
  function devtoolsPlugin({ app, store: store2, options }) {
    if (store2.$id.startsWith("__hot:")) {
      return;
    }
    store2._isOptionsAPI = !!options.state;
    patchActionForGrouping(store2, Object.keys(options.actions), store2._isOptionsAPI);
    const originalHotUpdate = store2._hotUpdate;
    vue.toRaw(store2)._hotUpdate = function(newStore) {
      originalHotUpdate.apply(this, arguments);
      patchActionForGrouping(store2, Object.keys(newStore._hmrPayload.actions), !!store2._isOptionsAPI);
    };
    addStoreToDevtools(
      app,
      // FIXME: is there a way to allow the assignment from Store<Id, S, G, A> to StoreGeneric?
      store2
    );
  }
  function createPinia() {
    const scope = vue.effectScope(true);
    const state = scope.run(() => vue.ref({}));
    let _p = [];
    let toBeInstalled = [];
    const pinia = vue.markRaw({
      install(app) {
        setActivePinia(pinia);
        {
          pinia._a = app;
          app.provide(piniaSymbol, pinia);
          app.config.globalProperties.$pinia = pinia;
          if (USE_DEVTOOLS) {
            registerPiniaDevtools(app, pinia);
          }
          toBeInstalled.forEach((plugin) => _p.push(plugin));
          toBeInstalled = [];
        }
      },
      use(plugin) {
        if (!this._a && !isVue2) {
          toBeInstalled.push(plugin);
        } else {
          _p.push(plugin);
        }
        return this;
      },
      _p,
      // it's actually undefined here
      // @ts-expect-error
      _a: null,
      _e: scope,
      _s: /* @__PURE__ */ new Map(),
      state
    });
    if (USE_DEVTOOLS && typeof Proxy !== "undefined") {
      pinia.use(devtoolsPlugin);
    }
    return pinia;
  }
  const isUseStore = (fn) => {
    return typeof fn === "function" && typeof fn.$id === "string";
  };
  function patchObject(newState, oldState) {
    for (const key in oldState) {
      const subPatch = oldState[key];
      if (!(key in newState)) {
        continue;
      }
      const targetValue = newState[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        newState[key] = patchObject(targetValue, subPatch);
      } else {
        {
          newState[key] = subPatch;
        }
      }
    }
    return newState;
  }
  function acceptHMRUpdate(initialUseStore, hot) {
    return (newModule) => {
      const pinia = hot.data.pinia || initialUseStore._pinia;
      if (!pinia) {
        return;
      }
      hot.data.pinia = pinia;
      for (const exportName in newModule) {
        const useStore2 = newModule[exportName];
        if (isUseStore(useStore2) && pinia._s.has(useStore2.$id)) {
          const id = useStore2.$id;
          if (id !== initialUseStore.$id) {
            console.warn(`The id of the store changed from "${initialUseStore.$id}" to "${id}". Reloading.`);
            return hot.invalidate();
          }
          const existingStore = pinia._s.get(id);
          if (!existingStore) {
            console.log(`[Pinia]: skipping hmr because store doesn't exist yet`);
            return;
          }
          useStore2(pinia, existingStore);
        }
      }
    };
  }
  const noop = () => {
  };
  function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
    subscriptions.push(callback);
    const removeSubscription = () => {
      const idx = subscriptions.indexOf(callback);
      if (idx > -1) {
        subscriptions.splice(idx, 1);
        onCleanup();
      }
    };
    if (!detached && vue.getCurrentScope()) {
      vue.onScopeDispose(removeSubscription);
    }
    return removeSubscription;
  }
  function triggerSubscriptions(subscriptions, ...args) {
    subscriptions.slice().forEach((callback) => {
      callback(...args);
    });
  }
  const fallbackRunWithContext = (fn) => fn();
  function mergeReactiveObjects(target, patchToApply) {
    if (target instanceof Map && patchToApply instanceof Map) {
      patchToApply.forEach((value, key) => target.set(key, value));
    }
    if (target instanceof Set && patchToApply instanceof Set) {
      patchToApply.forEach(target.add, target);
    }
    for (const key in patchToApply) {
      if (!patchToApply.hasOwnProperty(key))
        continue;
      const subPatch = patchToApply[key];
      const targetValue = target[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        target[key] = mergeReactiveObjects(targetValue, subPatch);
      } else {
        target[key] = subPatch;
      }
    }
    return target;
  }
  const skipHydrateSymbol = Symbol("pinia:skipHydration");
  function skipHydrate(obj) {
    return Object.defineProperty(obj, skipHydrateSymbol, {});
  }
  function shouldHydrate(obj) {
    return !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
  }
  const { assign } = Object;
  function isComputed(o2) {
    return !!(vue.isRef(o2) && o2.effect);
  }
  function createOptionsStore(id, options, pinia, hot) {
    const { state, actions, getters } = options;
    const initialState = pinia.state.value[id];
    let store2;
    function setup() {
      if (!initialState && !hot) {
        {
          pinia.state.value[id] = state ? state() : {};
        }
      }
      const localState = hot ? (
        // use ref() to unwrap refs inside state TODO: check if this is still necessary
        vue.toRefs(vue.ref(state ? state() : {}).value)
      ) : vue.toRefs(pinia.state.value[id]);
      return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
        if (name in localState) {
          console.warn(`[🍍]: A getter cannot have the same name as another state property. Rename one of them. Found with "${name}" in store "${id}".`);
        }
        computedGetters[name] = vue.markRaw(vue.computed(() => {
          setActivePinia(pinia);
          const store22 = pinia._s.get(id);
          return getters[name].call(store22, store22);
        }));
        return computedGetters;
      }, {}));
    }
    store2 = createSetupStore(id, setup, options, pinia, hot, true);
    return store2;
  }
  function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
    let scope;
    const optionsForPlugin = assign({ actions: {} }, options);
    if (!pinia._e.active) {
      throw new Error("Pinia destroyed");
    }
    const $subscribeOptions = {
      deep: true
      // flush: 'post',
    };
    {
      $subscribeOptions.onTrigger = (event) => {
        if (isListening) {
          debuggerEvents = event;
        } else if (isListening == false && !store2._hotUpdating) {
          if (Array.isArray(debuggerEvents)) {
            debuggerEvents.push(event);
          } else {
            console.error("🍍 debuggerEvents should be an array. This is most likely an internal Pinia bug.");
          }
        }
      };
    }
    let isListening;
    let isSyncListening;
    let subscriptions = [];
    let actionSubscriptions = [];
    let debuggerEvents;
    const initialState = pinia.state.value[$id];
    if (!isOptionsStore && !initialState && !hot) {
      {
        pinia.state.value[$id] = {};
      }
    }
    const hotState = vue.ref({});
    let activeListener;
    function $patch(partialStateOrMutator) {
      let subscriptionMutation;
      isListening = isSyncListening = false;
      {
        debuggerEvents = [];
      }
      if (typeof partialStateOrMutator === "function") {
        partialStateOrMutator(pinia.state.value[$id]);
        subscriptionMutation = {
          type: MutationType.patchFunction,
          storeId: $id,
          events: debuggerEvents
        };
      } else {
        mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
        subscriptionMutation = {
          type: MutationType.patchObject,
          payload: partialStateOrMutator,
          storeId: $id,
          events: debuggerEvents
        };
      }
      const myListenerId = activeListener = Symbol();
      vue.nextTick().then(() => {
        if (activeListener === myListenerId) {
          isListening = true;
        }
      });
      isSyncListening = true;
      triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
    }
    const $reset = isOptionsStore ? function $reset2() {
      const { state } = options;
      const newState = state ? state() : {};
      this.$patch(($state) => {
        assign($state, newState);
      });
    } : (
      /* istanbul ignore next */
      () => {
        throw new Error(`🍍: Store "${$id}" is built using the setup syntax and does not implement $reset().`);
      }
    );
    function $dispose() {
      scope.stop();
      subscriptions = [];
      actionSubscriptions = [];
      pinia._s.delete($id);
    }
    function wrapAction(name, action) {
      return function() {
        setActivePinia(pinia);
        const args = Array.from(arguments);
        const afterCallbackList = [];
        const onErrorCallbackList = [];
        function after(callback) {
          afterCallbackList.push(callback);
        }
        function onError(callback) {
          onErrorCallbackList.push(callback);
        }
        triggerSubscriptions(actionSubscriptions, {
          args,
          name,
          store: store2,
          after,
          onError
        });
        let ret;
        try {
          ret = action.apply(this && this.$id === $id ? this : store2, args);
        } catch (error) {
          triggerSubscriptions(onErrorCallbackList, error);
          throw error;
        }
        if (ret instanceof Promise) {
          return ret.then((value) => {
            triggerSubscriptions(afterCallbackList, value);
            return value;
          }).catch((error) => {
            triggerSubscriptions(onErrorCallbackList, error);
            return Promise.reject(error);
          });
        }
        triggerSubscriptions(afterCallbackList, ret);
        return ret;
      };
    }
    const _hmrPayload = /* @__PURE__ */ vue.markRaw({
      actions: {},
      getters: {},
      state: [],
      hotState
    });
    const partialStore = {
      _p: pinia,
      // _s: scope,
      $id,
      $onAction: addSubscription.bind(null, actionSubscriptions),
      $patch,
      $reset,
      $subscribe(callback, options2 = {}) {
        const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
        const stopWatcher = scope.run(() => vue.watch(() => pinia.state.value[$id], (state) => {
          if (options2.flush === "sync" ? isSyncListening : isListening) {
            callback({
              storeId: $id,
              type: MutationType.direct,
              events: debuggerEvents
            }, state);
          }
        }, assign({}, $subscribeOptions, options2)));
        return removeSubscription;
      },
      $dispose
    };
    const store2 = vue.reactive(assign(
      {
        _hmrPayload,
        _customProperties: vue.markRaw(/* @__PURE__ */ new Set())
        // devtools custom properties
      },
      partialStore
      // must be added later
      // setupStore
    ));
    pinia._s.set($id, store2);
    const runWithContext = pinia._a && pinia._a.runWithContext || fallbackRunWithContext;
    const setupStore = runWithContext(() => pinia._e.run(() => (scope = vue.effectScope()).run(setup)));
    for (const key in setupStore) {
      const prop = setupStore[key];
      if (vue.isRef(prop) && !isComputed(prop) || vue.isReactive(prop)) {
        if (hot) {
          set(hotState.value, key, vue.toRef(setupStore, key));
        } else if (!isOptionsStore) {
          if (initialState && shouldHydrate(prop)) {
            if (vue.isRef(prop)) {
              prop.value = initialState[key];
            } else {
              mergeReactiveObjects(prop, initialState[key]);
            }
          }
          {
            pinia.state.value[$id][key] = prop;
          }
        }
        {
          _hmrPayload.state.push(key);
        }
      } else if (typeof prop === "function") {
        const actionValue = hot ? prop : wrapAction(key, prop);
        {
          setupStore[key] = actionValue;
        }
        {
          _hmrPayload.actions[key] = prop;
        }
        optionsForPlugin.actions[key] = prop;
      } else {
        if (isComputed(prop)) {
          _hmrPayload.getters[key] = isOptionsStore ? (
            // @ts-expect-error
            options.getters[key]
          ) : prop;
          if (IS_CLIENT) {
            const getters = setupStore._getters || // @ts-expect-error: same
            (setupStore._getters = vue.markRaw([]));
            getters.push(key);
          }
        }
      }
    }
    {
      assign(store2, setupStore);
      assign(vue.toRaw(store2), setupStore);
    }
    Object.defineProperty(store2, "$state", {
      get: () => hot ? hotState.value : pinia.state.value[$id],
      set: (state) => {
        if (hot) {
          throw new Error("cannot set hotState");
        }
        $patch(($state) => {
          assign($state, state);
        });
      }
    });
    {
      store2._hotUpdate = vue.markRaw((newStore) => {
        store2._hotUpdating = true;
        newStore._hmrPayload.state.forEach((stateKey) => {
          if (stateKey in store2.$state) {
            const newStateTarget = newStore.$state[stateKey];
            const oldStateSource = store2.$state[stateKey];
            if (typeof newStateTarget === "object" && isPlainObject(newStateTarget) && isPlainObject(oldStateSource)) {
              patchObject(newStateTarget, oldStateSource);
            } else {
              newStore.$state[stateKey] = oldStateSource;
            }
          }
          set(store2, stateKey, vue.toRef(newStore.$state, stateKey));
        });
        Object.keys(store2.$state).forEach((stateKey) => {
          if (!(stateKey in newStore.$state)) {
            del(store2, stateKey);
          }
        });
        isListening = false;
        isSyncListening = false;
        pinia.state.value[$id] = vue.toRef(newStore._hmrPayload, "hotState");
        isSyncListening = true;
        vue.nextTick().then(() => {
          isListening = true;
        });
        for (const actionName in newStore._hmrPayload.actions) {
          const action = newStore[actionName];
          set(store2, actionName, wrapAction(actionName, action));
        }
        for (const getterName in newStore._hmrPayload.getters) {
          const getter = newStore._hmrPayload.getters[getterName];
          const getterValue = isOptionsStore ? (
            // special handling of options api
            vue.computed(() => {
              setActivePinia(pinia);
              return getter.call(store2, store2);
            })
          ) : getter;
          set(store2, getterName, getterValue);
        }
        Object.keys(store2._hmrPayload.getters).forEach((key) => {
          if (!(key in newStore._hmrPayload.getters)) {
            del(store2, key);
          }
        });
        Object.keys(store2._hmrPayload.actions).forEach((key) => {
          if (!(key in newStore._hmrPayload.actions)) {
            del(store2, key);
          }
        });
        store2._hmrPayload = newStore._hmrPayload;
        store2._getters = newStore._getters;
        store2._hotUpdating = false;
      });
    }
    if (USE_DEVTOOLS) {
      const nonEnumerable = {
        writable: true,
        configurable: true,
        // avoid warning on devtools trying to display this property
        enumerable: false
      };
      ["_p", "_hmrPayload", "_getters", "_customProperties"].forEach((p2) => {
        Object.defineProperty(store2, p2, assign({ value: store2[p2] }, nonEnumerable));
      });
    }
    pinia._p.forEach((extender) => {
      if (USE_DEVTOOLS) {
        const extensions = scope.run(() => extender({
          store: store2,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        }));
        Object.keys(extensions || {}).forEach((key) => store2._customProperties.add(key));
        assign(store2, extensions);
      } else {
        assign(store2, scope.run(() => extender({
          store: store2,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        })));
      }
    });
    if (store2.$state && typeof store2.$state === "object" && typeof store2.$state.constructor === "function" && !store2.$state.constructor.toString().includes("[native code]")) {
      console.warn(`[🍍]: The "state" must be a plain object. It cannot be
	state: () => new MyClass()
Found in store "${store2.$id}".`);
    }
    if (initialState && isOptionsStore && options.hydrate) {
      options.hydrate(store2.$state, initialState);
    }
    isListening = true;
    isSyncListening = true;
    return store2;
  }
  function defineStore(idOrOptions, setup, setupOptions) {
    let id;
    let options;
    const isSetupStore = typeof setup === "function";
    if (typeof idOrOptions === "string") {
      id = idOrOptions;
      options = isSetupStore ? setupOptions : setup;
    } else {
      options = idOrOptions;
      id = idOrOptions.id;
      if (typeof id !== "string") {
        throw new Error(`[🍍]: "defineStore()" must be passed a store id as its first argument.`);
      }
    }
    function useStore2(pinia, hot) {
      const hasContext = vue.hasInjectionContext();
      pinia = // in test mode, ignore the argument provided as we can always retrieve a
      // pinia instance with getActivePinia()
      pinia || (hasContext ? vue.inject(piniaSymbol, null) : null);
      if (pinia)
        setActivePinia(pinia);
      if (!activePinia) {
        throw new Error(`[🍍]: "getActivePinia()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?
See https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.
This will fail in production.`);
      }
      pinia = activePinia;
      if (!pinia._s.has(id)) {
        if (isSetupStore) {
          createSetupStore(id, setup, options, pinia);
        } else {
          createOptionsStore(id, options, pinia);
        }
        {
          useStore2._pinia = pinia;
        }
      }
      const store2 = pinia._s.get(id);
      if (hot) {
        const hotId = "__hot:" + id;
        const newStore = isSetupStore ? createSetupStore(hotId, setup, options, pinia, true) : createOptionsStore(hotId, assign({}, options), pinia, true);
        hot._hotUpdate(newStore);
        delete pinia.state.value[hotId];
        pinia._s.delete(hotId);
      }
      if (IS_CLIENT) {
        const currentInstance = vue.getCurrentInstance();
        if (currentInstance && currentInstance.proxy && // avoid adding stores that are just built for hot module replacement
        !hot) {
          const vm = currentInstance.proxy;
          const cache = "_pStores" in vm ? vm._pStores : vm._pStores = {};
          cache[id] = store2;
        }
      }
      return store2;
    }
    useStore2.$id = id;
    return useStore2;
  }
  let mapStoreSuffix = "Store";
  function setMapStoreSuffix(suffix) {
    mapStoreSuffix = suffix;
  }
  function mapStores(...stores) {
    if (Array.isArray(stores[0])) {
      console.warn(`[🍍]: Directly pass all stores to "mapStores()" without putting them in an array:
Replace
	mapStores([useAuthStore, useCartStore])
with
	mapStores(useAuthStore, useCartStore)
This will fail in production if not fixed.`);
      stores = stores[0];
    }
    return stores.reduce((reduced, useStore2) => {
      reduced[useStore2.$id + mapStoreSuffix] = function() {
        return useStore2(this.$pinia);
      };
      return reduced;
    }, {});
  }
  function mapState(useStore2, keysOrMapper) {
    return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
      reduced[key] = function() {
        return useStore2(this.$pinia)[key];
      };
      return reduced;
    }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
      reduced[key] = function() {
        const store2 = useStore2(this.$pinia);
        const storeKey2 = keysOrMapper[key];
        return typeof storeKey2 === "function" ? storeKey2.call(this, store2) : store2[storeKey2];
      };
      return reduced;
    }, {});
  }
  const mapGetters = mapState;
  function mapActions(useStore2, keysOrMapper) {
    return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
      reduced[key] = function(...args) {
        return useStore2(this.$pinia)[key](...args);
      };
      return reduced;
    }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
      reduced[key] = function(...args) {
        return useStore2(this.$pinia)[keysOrMapper[key]](...args);
      };
      return reduced;
    }, {});
  }
  function mapWritableState(useStore2, keysOrMapper) {
    return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
      reduced[key] = {
        get() {
          return useStore2(this.$pinia)[key];
        },
        set(value) {
          return useStore2(this.$pinia)[key] = value;
        }
      };
      return reduced;
    }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
      reduced[key] = {
        get() {
          return useStore2(this.$pinia)[keysOrMapper[key]];
        },
        set(value) {
          return useStore2(this.$pinia)[keysOrMapper[key]] = value;
        }
      };
      return reduced;
    }, {});
  }
  function storeToRefs(store2) {
    {
      store2 = vue.toRaw(store2);
      const refs = {};
      for (const key in store2) {
        const value = store2[key];
        if (vue.isRef(value) || vue.isReactive(value)) {
          refs[key] = // ---
          vue.toRef(store2, key);
        }
      }
      return refs;
    }
  }
  const PiniaVuePlugin = function(_Vue) {
    _Vue.mixin({
      beforeCreate() {
        const options = this.$options;
        if (options.pinia) {
          const pinia = options.pinia;
          if (!this._provided) {
            const provideCache = {};
            Object.defineProperty(this, "_provided", {
              get: () => provideCache,
              set: (v2) => Object.assign(provideCache, v2)
            });
          }
          this._provided[piniaSymbol] = pinia;
          if (!this.$pinia) {
            this.$pinia = pinia;
          }
          pinia._a = this;
          if (IS_CLIENT) {
            setActivePinia(pinia);
          }
          if (USE_DEVTOOLS) {
            registerPiniaDevtools(pinia._a, pinia);
          }
        } else if (!this.$pinia && options.parent && options.parent.$pinia) {
          this.$pinia = options.parent.$pinia;
        }
      },
      destroyed() {
        delete this._pStores;
      }
    });
  };
  const Pinia = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    get MutationType() {
      return MutationType;
    },
    PiniaVuePlugin,
    acceptHMRUpdate,
    createPinia,
    defineStore,
    getActivePinia,
    mapActions,
    mapGetters,
    mapState,
    mapStores,
    mapWritableState,
    setActivePinia,
    setMapStoreSuffix,
    skipHydrate,
    storeToRefs
  }, Symbol.toStringTag, { value: "Module" }));
  var define_process_env_UNI_STATISTICS_CONFIG_default = { version: "2", enable: true };
  var define_process_env_UNI_STAT_TITLE_JSON_default = { "pages/login/agreement": "用户协议", "pages/report/index": "损坏申报", "pages/delivery/index": "选择出货单号", "pages/delivery/detailList": "明细列表", "pages/recycle/detailList": "回收复查", "pages/auth/index": "请选择认证单号", "pages/auth/check": "包装核对讯息", "pages/auth/detailList": "明细列表", "pages/web/report/index": "损坏申报", "pages/web/delivery/index": "选择出货单号", "pages/web/delivery/detailList": "明细列表", "pages/web/recycle/detailList": "回收复查", "pages/web/auth/index": "请选择认证单号", "pages/web/auth/check": "包装核对讯息", "pages/web/auth/detailList": "明细列表" };
  var define_process_env_UNI_STAT_UNI_CLOUD_default = {};
  const sys = uni.getSystemInfoSync();
  const STAT_VERSION = "4.57";
  const STAT_URL = "https://tongji.dcloud.io/uni/stat";
  const STAT_H5_URL = "https://tongji.dcloud.io/uni/stat.gif";
  const PAGE_PVER_TIME = 1800;
  const APP_PVER_TIME = 300;
  const OPERATING_TIME = 10;
  const DIFF_TIME = 60 * 1e3 * 60 * 24;
  const appid = "__UNI__74CDCF2";
  const dbSet = (name, value) => {
    let data = uni.getStorageSync("$$STAT__DBDATA:" + appid) || {};
    if (!data) {
      data = {};
    }
    data[name] = value;
    uni.setStorageSync("$$STAT__DBDATA:" + appid, data);
  };
  const dbGet = (name) => {
    let data = uni.getStorageSync("$$STAT__DBDATA:" + appid) || {};
    if (!data[name]) {
      let dbdata = uni.getStorageSync("$$STAT__DBDATA:" + appid);
      if (!dbdata) {
        dbdata = {};
      }
      if (!dbdata[name]) {
        return void 0;
      }
      data[name] = dbdata[name];
    }
    return data[name];
  };
  const dbRemove = (name) => {
    let data = uni.getStorageSync("$$STAT__DBDATA:" + appid) || {};
    if (data[name]) {
      delete data[name];
      uni.setStorageSync("$$STAT__DBDATA:" + appid, data);
    } else {
      data = uni.getStorageSync("$$STAT__DBDATA:" + appid);
      if (data[name]) {
        delete data[name];
        uni.setStorageSync("$$STAT__DBDATA:" + appid, data);
      }
    }
  };
  const uniStatisticsConfig = define_process_env_UNI_STATISTICS_CONFIG_default;
  let statConfig = {
    appid: "__UNI__74CDCF2"
  };
  let titleJsons = {};
  titleJsons = define_process_env_UNI_STAT_TITLE_JSON_default;
  const UUID_KEY = "__DC_STAT_UUID";
  const UUID_VALUE = "__DC_UUID_VALUE";
  function getUuid() {
    let uuid = "";
    if (get_platform_name() === "n") {
      try {
        uuid = plus.runtime.getDCloudId();
      } catch (e2) {
        uuid = "";
      }
      return uuid;
    }
    try {
      uuid = uni.getStorageSync(UUID_KEY);
    } catch (e2) {
      uuid = UUID_VALUE;
    }
    if (!uuid) {
      uuid = Date.now() + "" + Math.floor(Math.random() * 1e7);
      try {
        uni.setStorageSync(UUID_KEY, uuid);
      } catch (e2) {
        uni.setStorageSync(UUID_KEY, UUID_VALUE);
      }
    }
    return uuid;
  }
  const get_uuid = (statData2) => {
    return sys.deviceId || getUuid();
  };
  const get_odid = (statData2) => {
    let odid = "";
    if (get_platform_name() === "n") {
      try {
        odid = plus.device.uuid;
      } catch (e2) {
        odid = "";
      }
      return odid;
    }
    return sys.deviceId || getUuid();
  };
  const stat_config = statConfig;
  const get_sgin = (statData2) => {
    let arr = Object.keys(statData2);
    let sortArr = arr.sort();
    let sgin = {};
    let sginStr = "";
    for (var i2 in sortArr) {
      sgin[sortArr[i2]] = statData2[sortArr[i2]];
      sginStr += sortArr[i2] + "=" + statData2[sortArr[i2]] + "&";
    }
    return {
      sign: "",
      options: sginStr.substr(0, sginStr.length - 1)
    };
  };
  const get_encodeURIComponent_options = (statData2) => {
    let data = {};
    for (let prop in statData2) {
      data[prop] = encodeURIComponent(statData2[prop]);
    }
    return data;
  };
  const get_platform_name = () => {
    const aliArr = ["y", "a", "p", "mp-ali"];
    const platformList = {
      app: "n",
      "app-plus": "n",
      "app-harmony": "n",
      "mp-harmony": "mhm",
      h5: "h5",
      "mp-weixin": "wx",
      [aliArr.reverse().join("")]: "ali",
      "mp-baidu": "bd",
      "mp-toutiao": "tt",
      "mp-qq": "qq",
      "quickapp-native": "qn",
      "mp-kuaishou": "ks",
      "mp-lark": "lark",
      "quickapp-webview": "qw",
      "mp-xhs": "xhs"
    };
    if (platformList["app"] === "ali") {
      if (my && my.env) {
        const clientName = my.env.clientName;
        if (clientName === "ap")
          return "ali";
        if (clientName === "dingtalk")
          return "dt";
      }
    }
    return platformList["app"] || "app";
  };
  const get_pack_name = () => {
    let packName = "";
    if (get_platform_name() === "wx" || get_platform_name() === "qq") {
      if (uni.canIUse("getAccountInfoSync")) {
        packName = uni.getAccountInfoSync().miniProgram.appId || "";
      }
    }
    if (get_platform_name() === "n")
      ;
    return packName;
  };
  const get_version = () => {
    return get_platform_name() === "n" ? plus.runtime.version : "";
  };
  const get_channel = () => {
    const platformName = get_platform_name();
    let channel = "";
    if (platformName === "n") {
      channel = plus.runtime.channel;
    }
    return channel;
  };
  const get_scene = (options) => {
    const platformName = get_platform_name();
    let scene = "";
    if (options) {
      return options;
    }
    if (platformName === "wx") {
      scene = uni.getLaunchOptionsSync().scene;
    }
    return scene;
  };
  const get_route = (pageVm) => {
    let _self = pageVm || get_page_vm();
    if (get_platform_name() === "bd") {
      let mp_route = _self.$mp && _self.$mp.page && _self.$mp.page.is;
      let scope_route = _self.$scope && _self.$scope.is;
      return mp_route || scope_route || "";
    } else {
      return _self.route || _self.$scope && _self.$scope.route || _self.$mp && _self.$mp.page.route;
    }
  };
  const get_page_route = (pageVm) => {
    let page2 = pageVm && (pageVm.$page || pageVm.$scope && pageVm.$scope.$page);
    let lastPageRoute = uni.getStorageSync("_STAT_LAST_PAGE_ROUTE");
    if (!page2)
      return lastPageRoute || "";
    return page2.fullPath === "/" ? page2.route : page2.fullPath || page2.route;
  };
  const get_page_vm = () => {
    let pages2 = getCurrentPages();
    let $page = pages2[pages2.length - 1];
    if (!$page)
      return null;
    return $page.$vm;
  };
  const get_page_types = (self2) => {
    if (self2.mpType === "page" || self2.$mpType === "page" || self2.$mp && self2.$mp.mpType === "page" || self2.$options.mpType === "page") {
      return "page";
    }
    if (self2.mpType === "app" || self2.$mpType === "app" || self2.$mp && self2.$mp.mpType === "app" || self2.$options.mpType === "app") {
      return "app";
    }
    return null;
  };
  const handle_data = (statData2) => {
    let firstArr = [];
    let contentArr = [];
    let lastArr = [];
    for (let i2 in statData2) {
      const rd = statData2[i2];
      rd.forEach((elm) => {
        let newData = "";
        {
          newData = elm;
        }
        if (i2 === 0) {
          firstArr.push(newData);
        } else if (i2 === 3) {
          lastArr.push(newData);
        } else {
          contentArr.push(newData);
        }
      });
    }
    firstArr.push(...contentArr, ...lastArr);
    return JSON.stringify(firstArr);
  };
  const calibration = (eventName, options) => {
    if (!eventName) {
      console.error(`uni.report Missing [eventName] parameter`);
      return true;
    }
    if (typeof eventName !== "string") {
      console.error(
        `uni.report [eventName] Parameter type error, it can only be of type String`
      );
      return true;
    }
    if (eventName.length > 255) {
      console.error(
        `uni.report [eventName] Parameter length cannot be greater than 255`
      );
      return true;
    }
    if (typeof options !== "string" && typeof options !== "object") {
      console.error(
        "uni.report [options] Parameter type error, Only supports String or Object type"
      );
      return true;
    }
    if (typeof options === "string" && options.length > 255) {
      console.error(
        `uni.report [options] Parameter length cannot be greater than 255`
      );
      return true;
    }
    if (eventName === "title" && typeof options !== "string") {
      console.error(
        `uni.report [eventName] When the parameter is title, the [options] parameter can only be of type String`
      );
      return true;
    }
  };
  const get_page_name = (routepath) => {
    return titleJsons && titleJsons[routepath] || "";
  };
  const Report_Data_Time = "Report_Data_Time";
  const Report_Status = "Report_Status";
  const is_report_data = () => {
    return new Promise((resolve, reject) => {
      let start_time = "";
      let end_time = (/* @__PURE__ */ new Date()).getTime();
      let diff_time = DIFF_TIME;
      let report_status = 1;
      try {
        start_time = uni.getStorageSync(Report_Data_Time);
        report_status = uni.getStorageSync(Report_Status);
      } catch (e2) {
        start_time = "";
        report_status = 1;
      }
      if (report_status === "") {
        requestData(({ enable }) => {
          uni.setStorageSync(Report_Data_Time, end_time);
          uni.setStorageSync(Report_Status, enable);
          if (enable === 1) {
            resolve();
          }
        });
        return;
      }
      if (report_status === 1) {
        resolve();
      }
      if (!start_time) {
        uni.setStorageSync(Report_Data_Time, end_time);
        start_time = end_time;
      }
      if (end_time - start_time > diff_time) {
        requestData(({ enable }) => {
          uni.setStorageSync(Report_Data_Time, end_time);
          uni.setStorageSync(Report_Status, enable);
        });
      }
    });
  };
  const requestData = (done) => {
    const appid2 = "__UNI__74CDCF2";
    let formData = {
      usv: STAT_VERSION,
      conf: JSON.stringify({
        ak: appid2
      })
    };
    uni.request({
      url: STAT_URL,
      method: "GET",
      data: formData,
      success: (res2) => {
        const { data } = res2;
        if (data.ret === 0) {
          typeof done === "function" && done({
            enable: data.enable
          });
        }
      },
      fail: (e2) => {
        let report_status_code = 1;
        try {
          report_status_code = uni.getStorageSync(Report_Status);
        } catch (e22) {
          report_status_code = 1;
        }
        if (report_status_code === "") {
          report_status_code = 1;
        }
        typeof done === "function" && done({
          enable: report_status_code
        });
      }
    });
  };
  const uni_cloud_config = () => {
    return define_process_env_UNI_STAT_UNI_CLOUD_default || {};
  };
  const get_space = (config) => {
    const uniCloudConfig = uni_cloud_config();
    const { spaceId, provider, clientSecret, secretKey, secretId } = uniCloudConfig;
    const space_type = ["tcb", "tencent", "aliyun", "alipay", "private", "dcloud"];
    const is_provider = space_type.indexOf(provider) !== -1;
    const is_aliyun = provider === "aliyun" && spaceId && clientSecret;
    const is_tcb = (provider === "tcb" || provider === "tencent") && spaceId;
    const is_alipay = provider === "alipay" && spaceId && secretKey && secretId;
    const is_private = provider === "private" && spaceId && clientSecret;
    const is_dcloud = provider === "dcloud" && spaceId && clientSecret;
    if (is_provider && (is_aliyun || is_tcb || is_alipay || is_private || is_dcloud)) {
      return uniCloudConfig;
    } else {
      if (config && config.spaceId) {
        return config;
      }
    }
    return null;
  };
  const get_report_Interval = (defaultTime) => {
    let time = uniStatisticsConfig.reportInterval;
    if (Number(time) === 0)
      return 0;
    time = time || defaultTime;
    let reg = /(^[1-9]\d*$)/;
    if (!reg.test(time))
      return defaultTime;
    return Number(time);
  };
  const is_push_clientid = () => {
    if (uniStatisticsConfig.collectItems) {
      const ClientID = uniStatisticsConfig.collectItems.uniPushClientID;
      return typeof ClientID === "boolean" ? ClientID : false;
    }
    return false;
  };
  const is_page_report = () => {
    if (uniStatisticsConfig.collectItems) {
      const statPageLog = uniStatisticsConfig.collectItems.uniStatPageLog;
      if (statPageLog === void 0)
        return true;
      return typeof statPageLog === "boolean" ? statPageLog : true;
    }
    return true;
  };
  const IS_HANDLE_DEVECE_ID = "is_handle_device_id";
  const is_handle_device = () => {
    let isHandleDevice = dbGet(IS_HANDLE_DEVECE_ID) || "";
    dbSet(IS_HANDLE_DEVECE_ID, "1");
    return isHandleDevice === "1";
  };
  const FIRST_VISIT_TIME_KEY = "__first__visit__time";
  const LAST_VISIT_TIME_KEY = "__last__visit__time";
  const get_time = () => {
    return parseInt((/* @__PURE__ */ new Date()).getTime() / 1e3);
  };
  const get_first_visit_time = () => {
    const timeStorge = dbGet(FIRST_VISIT_TIME_KEY);
    let time = 0;
    if (timeStorge) {
      time = timeStorge;
    } else {
      time = get_time();
      dbSet(FIRST_VISIT_TIME_KEY, time);
      dbRemove(LAST_VISIT_TIME_KEY);
    }
    return time;
  };
  const get_last_visit_time = () => {
    const timeStorge = dbGet(LAST_VISIT_TIME_KEY);
    let time = 0;
    if (timeStorge) {
      time = timeStorge;
    }
    dbSet(LAST_VISIT_TIME_KEY, get_time());
    return time;
  };
  const PAGE_RESIDENCE_TIME = "__page__residence__time";
  let First_Page_Residence_Time = 0;
  let Last_Page_Residence_Time = 0;
  const set_page_residence_time = () => {
    First_Page_Residence_Time = get_time();
    dbSet(PAGE_RESIDENCE_TIME, First_Page_Residence_Time);
    return First_Page_Residence_Time;
  };
  const get_page_residence_time = () => {
    Last_Page_Residence_Time = get_time();
    First_Page_Residence_Time = dbGet(PAGE_RESIDENCE_TIME);
    return Last_Page_Residence_Time - First_Page_Residence_Time;
  };
  const TOTAL_VISIT_COUNT = "__total__visit__count";
  const get_total_visit_count = () => {
    const timeStorge = dbGet(TOTAL_VISIT_COUNT);
    let count = 1;
    if (timeStorge) {
      count = timeStorge;
      count++;
    }
    dbSet(TOTAL_VISIT_COUNT, count);
    return count;
  };
  const FIRST_TIME = "__first_time";
  const set_first_time = () => {
    let time = get_time();
    const timeStorge = dbSet(FIRST_TIME, time);
    return timeStorge;
  };
  const get_residence_time = (type) => {
    let residenceTime = 0;
    const first_time = dbGet(FIRST_TIME);
    const last_time = get_time();
    if (first_time !== 0) {
      residenceTime = last_time - first_time;
    }
    residenceTime = residenceTime < 1 ? 1 : residenceTime;
    if (type === "app") {
      let overtime = residenceTime > APP_PVER_TIME ? true : false;
      return {
        residenceTime,
        overtime
      };
    }
    if (type === "page") {
      let overtime = residenceTime > PAGE_PVER_TIME ? true : false;
      return {
        residenceTime,
        overtime
      };
    }
    return {
      residenceTime
    };
  };
  const eport_Interval = get_report_Interval(OPERATING_TIME);
  let statData = {
    uuid: get_uuid(),
    // 设备标识
    ak: stat_config.appid,
    // uni-app 应用 Appid
    p: "",
    // 手机系统，客户端平台
    ut: get_platform_name(),
    // 平台类型
    mpn: get_pack_name(),
    // 原生平台包名、小程序 appid
    usv: STAT_VERSION,
    // 统计 sdk 版本
    v: get_version(),
    // 应用版本，仅app
    ch: get_channel(),
    // 渠道信息
    cn: "",
    // 国家
    pn: "",
    // 省份
    ct: "",
    // 城市
    t: get_time(),
    // 上报数据时的时间戳
    tt: "",
    brand: sys.brand || "",
    // 手机品牌
    md: sys.model,
    // 手机型号
    sv: "",
    // 手机系统版本
    mpsdk: sys.SDKVersion || "",
    // x程序 sdk version
    mpv: sys.version || "",
    // 小程序平台版本 ，如微信、支付宝
    lang: sys.language,
    // 语言
    pr: sys.pixelRatio,
    // pixelRatio 设备像素比
    ww: sys.windowWidth,
    // windowWidth 可使用窗口宽度
    wh: sys.windowHeight,
    // windowHeight 可使用窗口高度
    sw: sys.screenWidth,
    // screenWidth 屏幕宽度
    sh: sys.screenHeight
    // screenHeight 屏幕高度
  };
  if (sys.platform) {
    switch (sys.platform) {
      case "android":
        statData.p = "a";
        break;
      case "ios":
        statData.p = "i";
        break;
      case "harmonyos":
        statData.p = "h";
        break;
    }
  }
  if (sys.system) {
    statData.sv = sys.system.replace(/(Android|iOS)\s/, "");
  }
  class Report {
    constructor() {
      this.self = "";
      this.__licationShow = false;
      this.__licationHide = false;
      this.statData = statData;
      this._navigationBarTitle = {
        config: "",
        page: "",
        report: "",
        lt: ""
      };
      this._query = {};
      let registerInterceptor = typeof uni.addInterceptor === "function";
      if (registerInterceptor) {
        this.addInterceptorInit();
        this.interceptLogin();
        this.interceptShare(true);
        this.interceptRequestPayment();
      }
    }
    addInterceptorInit() {
      let self2 = this;
      uni.addInterceptor("setNavigationBarTitle", {
        invoke(args) {
          self2._navigationBarTitle.page = args.title;
        }
      });
    }
    interceptLogin() {
      let self2 = this;
      uni.addInterceptor("login", {
        complete() {
          self2._login();
        }
      });
    }
    interceptShare(type) {
      let self2 = this;
      if (!type) {
        self2._share();
        return;
      }
      uni.addInterceptor("share", {
        success() {
          self2._share();
        },
        fail() {
          self2._share();
        }
      });
    }
    interceptRequestPayment() {
      let self2 = this;
      uni.addInterceptor("requestPayment", {
        success() {
          self2._payment("pay_success");
        },
        fail() {
          self2._payment("pay_fail");
        }
      });
    }
    _login() {
      this.sendEventRequest(
        {
          key: "login"
        },
        0
      );
    }
    _share() {
      this.sendEventRequest(
        {
          key: "share"
        },
        0
      );
    }
    _payment(key) {
      this.sendEventRequest(
        {
          key
        },
        0
      );
    }
    /**
     * 进入应用触发
     */
    applicationShow() {
      if (this.__licationHide) {
        const time = get_residence_time("app");
        if (time.overtime) {
          let lastPageRoute = uni.getStorageSync("_STAT_LAST_PAGE_ROUTE");
          let options = {
            path: lastPageRoute,
            scene: this.statData.sc,
            cst: 2
          };
          this.sendReportRequest(options);
        } else {
          const scene = get_scene();
          if (scene !== this.statData.sc) {
            let lastPageRoute = uni.getStorageSync("_STAT_LAST_PAGE_ROUTE");
            let options = {
              path: lastPageRoute,
              scene,
              cst: 2
            };
            this.sendReportRequest(options);
          }
        }
        this.__licationHide = false;
      }
    }
    /**
     * 离开应用触发
     * @param {Object} self
     * @param {Object} type
     */
    applicationHide(self2, type) {
      if (!self2) {
        self2 = get_page_vm();
      }
      this.__licationHide = true;
      const time = get_residence_time();
      const route = get_page_route(self2);
      uni.setStorageSync("_STAT_LAST_PAGE_ROUTE", route);
      this.sendHideRequest(
        {
          urlref: route,
          urlref_ts: time.residenceTime
        },
        type
      );
      set_first_time();
    }
    /**
     * 进入页面触发
     */
    pageShow(self2) {
      this._navigationBarTitle = {
        config: "",
        page: "",
        report: "",
        lt: ""
      };
      const route = get_page_route(self2);
      const routepath = get_route(self2);
      this._navigationBarTitle.config = get_page_name(routepath);
      if (this.__licationShow) {
        set_first_time();
        uni.setStorageSync("_STAT_LAST_PAGE_ROUTE", route);
        this.__licationShow = false;
        return;
      }
      const time = get_residence_time("page");
      if (time.overtime) {
        let options = {
          path: route,
          scene: this.statData.sc,
          cst: 3
        };
        this.sendReportRequest(options);
      }
      set_first_time();
    }
    /**
     * 离开页面触发
     */
    pageHide(self2) {
      if (!this.__licationHide) {
        const time = get_residence_time("page");
        let route = get_page_route(self2);
        let lastPageRoute = uni.getStorageSync("_STAT_LAST_PAGE_ROUTE");
        if (!lastPageRoute) {
          lastPageRoute = route;
        }
        uni.setStorageSync("_STAT_LAST_PAGE_ROUTE", route);
        this.sendPageRequest({
          url: route,
          urlref: lastPageRoute,
          urlref_ts: time.residenceTime
        });
        return;
      }
    }
    /**
     * 发送请求,应用维度上报
     * @param {Object} options 页面信息
     * @param {Boolean} type 是否立即上报
     */
    sendReportRequest(options, type) {
      this._navigationBarTitle.lt = "1";
      this._navigationBarTitle.config = get_page_name(options.path);
      let is_opt = options.query && JSON.stringify(options.query) !== "{}";
      let query = is_opt ? "?" + JSON.stringify(options.query) : "";
      const last_time = get_last_visit_time();
      if (last_time !== 0 || !last_time) {
        const odid = get_odid();
        {
          const have_device = is_handle_device();
          if (!have_device) {
            this.statData.odid = odid;
          }
        }
      }
      Object.assign(this.statData, {
        lt: "1",
        url: options.path + query || "",
        t: get_time(),
        sc: get_scene(options.scene),
        fvts: get_first_visit_time(),
        lvts: last_time,
        tvc: get_total_visit_count(),
        // create session type  上报类型 ，1 应用进入 2.后台30min进入 3.页面30min进入
        cst: options.cst || 1
      });
      if (get_platform_name() === "n") {
        this.getProperty(type);
      } else {
        this.getNetworkInfo(type);
      }
    }
    /**
     * 发送请求,页面维度上报
     * @param {Object} opt
     */
    sendPageRequest(opt) {
      let { url, urlref, urlref_ts } = opt;
      this._navigationBarTitle.lt = "11";
      let options = {
        ak: this.statData.ak,
        uuid: this.statData.uuid,
        p: this.statData.p,
        lt: "11",
        ut: this.statData.ut,
        url,
        tt: this.statData.tt,
        urlref,
        urlref_ts,
        ch: this.statData.ch,
        usv: this.statData.usv,
        t: get_time()
      };
      this.request(options);
    }
    /**
     * 进入后台上报数据
     * @param {Object} opt
     * @param {Object} type
     */
    sendHideRequest(opt, type) {
      let { urlref, urlref_ts } = opt;
      let options = {
        ak: this.statData.ak,
        uuid: this.statData.uuid,
        p: this.statData.p,
        lt: "3",
        ut: this.statData.ut,
        urlref,
        urlref_ts,
        ch: this.statData.ch,
        usv: this.statData.usv,
        t: get_time()
      };
      this.request(options, type);
    }
    /**
     * 自定义事件上报
     */
    sendEventRequest({ key = "", value = "" } = {}) {
      let routepath = "";
      try {
        routepath = get_route();
      } catch (error) {
        const launch_options = dbGet("__launch_options");
        routepath = launch_options.path;
      }
      this._navigationBarTitle.config = get_page_name(routepath);
      this._navigationBarTitle.lt = "21";
      let options = {
        ak: this.statData.ak,
        uuid: this.statData.uuid,
        p: this.statData.p,
        lt: "21",
        ut: this.statData.ut,
        url: routepath,
        ch: this.statData.ch,
        e_n: key,
        e_v: typeof value === "object" ? JSON.stringify(value) : value.toString(),
        usv: this.statData.usv,
        t: get_time()
      };
      this.request(options);
    }
    sendPushRequest(options, cid) {
      let time = get_time();
      const statData2 = {
        lt: "101",
        cid,
        t: time,
        ut: this.statData.ut
      };
      const stat_data = handle_data({
        101: [statData2]
      });
      let optionsData = {
        usv: STAT_VERSION,
        //统计 SDK 版本号
        t: time,
        //发送请求时的时间戮
        requests: stat_data
      };
      if (get_platform_name() === "n" && this.statData.p === "a") {
        setTimeout(() => {
          this.sendRequest(optionsData);
        }, 200);
        return;
      }
      this.sendRequest(optionsData);
    }
    /**
     * 获取wgt资源版本
     */
    getProperty(type) {
      plus.runtime.getProperty(plus.runtime.appid, (wgtinfo) => {
        this.statData.v = wgtinfo.version || "";
        this.getNetworkInfo(type);
      });
    }
    /**
     * 获取网络信息
     */
    getNetworkInfo(type) {
      uni.getNetworkType({
        success: (result) => {
          this.statData.net = result.networkType;
          this.getLocation(type);
        }
      });
    }
    /**
     * 获取位置信息
     */
    getLocation(type) {
      if (stat_config.getLocation) {
        uni.getLocation({
          type: "wgs84",
          geocode: true,
          success: (result) => {
            if (result.address) {
              this.statData.cn = result.address.country;
              this.statData.pn = result.address.province;
              this.statData.ct = result.address.city;
            }
            this.statData.lat = result.latitude;
            this.statData.lng = result.longitude;
            this.request(this.statData, type);
          }
        });
      } else {
        this.statData.lat = 0;
        this.statData.lng = 0;
        this.request(this.statData, type);
      }
    }
    /**
     * 发送请求
     * @param {Object} data 上报数据
     * @param {Object} type 类型
     */
    request(data, type) {
      let time = get_time();
      const title = this._navigationBarTitle;
      Object.assign(data, {
        ttn: title.page,
        ttpj: title.config,
        ttc: title.report
      });
      let uniStatData = dbGet("__UNI__STAT__DATA") || {};
      if (!uniStatData[data.lt]) {
        uniStatData[data.lt] = [];
      }
      uniStatData[data.lt].push(data);
      dbSet("__UNI__STAT__DATA", uniStatData);
      let page_residence_time = get_page_residence_time();
      if (page_residence_time < eport_Interval && !type)
        return;
      set_page_residence_time();
      const stat_data = handle_data(uniStatData);
      let optionsData = {
        usv: STAT_VERSION,
        //统计 SDK 版本号
        t: time,
        //发送请求时的时间戮
        requests: stat_data
      };
      dbRemove("__UNI__STAT__DATA");
      if (get_platform_name() === "n" && this.statData.p === "a") {
        setTimeout(() => {
          this.sendRequest(optionsData);
        }, 200);
        return;
      }
      this.sendRequest(optionsData);
    }
    getIsReportData() {
      return is_report_data();
    }
    /**
     * 数据上报
     * @param {Object} optionsData 需要上报的数据
     */
    sendRequest(optionsData) {
      {
        if (!uni.__stat_uniCloud_space) {
          console.error(
            "应用未关联服务空间，统计上报失败，请在uniCloud目录右键关联服务空间."
          );
          return;
        }
        const uniCloudObj = uni.__stat_uniCloud_space.importObject(
          "uni-stat-receiver",
          {
            customUI: true
          }
        );
        uniCloudObj.report(optionsData).then(() => {
        }).catch((err) => {
        });
      }
    }
    /**
     * h5 请求
     */
    imageRequest(data) {
      this.getIsReportData().then(() => {
        let image = new Image();
        let options = get_sgin(get_encodeURIComponent_options(data)).options;
        image.src = STAT_H5_URL + "?" + options;
      });
    }
    sendEvent(key, value) {
      if (calibration(key, value))
        return;
      if (key === "title") {
        this._navigationBarTitle.report = value;
        return;
      }
      this.sendEventRequest(
        {
          key,
          value: typeof value === "object" ? JSON.stringify(value) : value
        },
        1
      );
    }
  }
  class Stat extends Report {
    static getInstance() {
      if (!uni.__stat_instance) {
        uni.__stat_instance = new Stat();
      }
      {
        let space = get_space(nr.config);
        if (!uni.__stat_uniCloud_space) {
          if (space && Object.keys(space).length !== 0) {
            let spaceData = {
              provider: space.provider,
              spaceId: space.spaceId,
              clientSecret: space.clientSecret
            };
            if (space.endpoint) {
              spaceData.endpoint = space.endpoint;
            }
            if (space.provider === "alipay") {
              spaceData.secretKey = space.secretKey;
              spaceData.accessKey = space.accessKey || space.secretId;
              spaceData.spaceAppId = space.spaceAppId || space.appId;
            }
            uni.__stat_uniCloud_space = nr.init(spaceData);
          } else {
            console.error("应用未关联服务空间，请在uniCloud目录右键关联服务空间");
          }
        }
      }
      return uni.__stat_instance;
    }
    constructor() {
      super();
    }
    /**
     * 获取推送id
     */
    pushEvent(options) {
      const ClientID = is_push_clientid();
      if (uni.getPushClientId && ClientID) {
        uni.getPushClientId({
          success: (res2) => {
            const cid = res2.cid || false;
            if (cid) {
              this.sendPushRequest(options, cid);
            }
          }
        });
      }
    }
    /**
     * 进入应用
     * @param {Object} options 页面参数
     * @param {Object} self	当前页面实例
     */
    launch(options, self2) {
      set_page_residence_time();
      this.__licationShow = true;
      dbSet("__launch_options", options);
      options.cst = 1;
      this.sendReportRequest(options, true);
    }
    load(options, self2) {
      this.self = self2;
      this._query = options;
    }
    appHide(self2) {
      this.applicationHide(self2, true);
    }
    appShow(self2) {
      this.applicationShow(self2);
    }
    show(self2) {
      this.self = self2;
      if (get_page_types(self2) === "page") {
        const isPageReport = is_page_report();
        if (isPageReport) {
          this.pageShow(self2);
        }
      }
      if (get_platform_name() === "h5" || get_platform_name() === "n") {
        if (get_page_types(self2) === "app") {
          this.appShow();
        }
      }
    }
    hide(self2) {
      this.self = self2;
      if (get_page_types(self2) === "page") {
        const isPageReport = is_page_report();
        if (isPageReport) {
          this.pageHide(self2);
        }
      }
      if (get_platform_name() === "h5" || get_platform_name() === "n") {
        if (get_page_types(self2) === "app") {
          this.appHide();
        }
      }
    }
    error(em) {
      let emVal = "";
      if (!em.message) {
        emVal = JSON.stringify(em);
      } else {
        emVal = em.stack;
      }
      let route = "";
      try {
        route = get_route();
      } catch (e2) {
        route = "";
      }
      let options = {
        ak: this.statData.ak,
        uuid: this.statData.uuid,
        p: this.statData.p,
        lt: "31",
        url: route,
        ut: this.statData.ut,
        ch: this.statData.ch,
        mpsdk: this.statData.mpsdk,
        mpv: this.statData.mpv,
        v: this.statData.v,
        em: emVal,
        usv: this.statData.usv,
        t: parseInt((/* @__PURE__ */ new Date()).getTime() / 1e3)
      };
      this.request(options);
    }
  }
  Stat.getInstance();
  function main() {
    {
      {
        uni.report = function(type, options) {
        };
      }
    }
  }
  main();
  function createApp() {
    const app = vue.createVueApp(App);
    app.use(store);
    app.use(createPinia());
    app.config.globalProperties.$adpid = "1111111111";
    app.config.globalProperties.$backgroundAudioData = {
      playing: false,
      playTime: 0,
      formatedPlayTime: "00:00:00"
    };
    return {
      app,
      Vuex: index,
      // 如果 nvue 使用 vuex 的各种map工具方法时，必须 return Vuex
      Pinia
      // 此处必须将 Pinia 返回
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
