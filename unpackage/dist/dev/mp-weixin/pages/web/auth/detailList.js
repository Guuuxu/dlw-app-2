"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_auth = require("../../../api/auth.js");
const utils_dict = require("../../../utils/dict.js");
const _sfc_main = {
  __name: "detailList",
  setup(__props) {
    const verified_count = common_vendor.ref(0);
    const total_count = common_vendor.ref(0);
    const row = common_vendor.ref({});
    const role = common_vendor.ref("");
    common_vendor.onLoad((option) => {
      role.value = common_vendor.index.getStorageSync("ROLE_KEY");
      common_vendor.index.__f__("log", "at pages/web/auth/detailList.vue:53", role.value);
      common_vendor.index.__f__("log", "at pages/web/auth/detailList.vue:54", "option", option);
      const item = JSON.parse(option.item);
      row.value = item;
      const id = item.id;
      total_count.value = item.total_count;
      verified_count.value = item.verified_count;
      if (role.value === "admin") {
        common_vendor.index.setNavigationBarTitle({
          title: `明细列表(${verified_count.value}/${total_count.value})`
        });
      }
      loadDetail(id);
    });
    const list = common_vendor.ref([]);
    const loadMoreText = common_vendor.ref("加载中...");
    common_vendor.ref(false);
    const total = common_vendor.ref(0);
    common_vendor.ref({
      isCateCorrect: ""
    });
    const loadDetail = async (id, isfresh) => {
      const res = await api_auth.getScanResult(id);
      if (role.value === "admin") {
        if (isfresh) {
          list.value = res.data.list;
        } else {
          list.value = list.value.concat(res.data.list);
        }
        common_vendor.index.__f__("log", "at pages/web/auth/detailList.vue:84", list.value);
        total.value = res.data.total_count;
        common_vendor.index.stopPullDownRefresh();
      } else {
        for (let i = 0; i < res.data.length; i++) {
          const element = res.data[i];
          list.value.push({
            detail_no: element,
            status: 0
          });
        }
      }
    };
    common_vendor.onPullDownRefresh(() => {
      common_vendor.index.__f__("log", "at pages/web/auth/detailList.vue:99", row.value.id);
      loadDetail(row.value.id, true);
    });
    common_vendor.onReachBottom(() => {
      common_vendor.index.__f__("log", "at pages/web/auth/detailList.vue:103", "onReachBottom");
      if (list.value.length = total) {
        loadMoreText.value = "没有更多数据了!";
        return;
      }
      this.showLoadMore = true;
      setTimeout(() => {
        loadDetail(row.value.id);
      }, 300);
    });
    const pageTo = () => {
    };
    const handleScan = async () => {
      common_vendor.index.scanCode({
        success: async (res) => {
          if (role.value === "admin") {
            try {
              const resScan = await api_auth.scanAdmin({
                id: row.value.id,
                type: 1,
                detail_no: res.result
              });
              common_vendor.index.showToast({
                title: "认证成功",
                icon: "none"
              });
              const index = list.value.findIndex((item) => item.detail_no == res.result);
              list.value[index].status = 1;
            } catch (error) {
              if (error.data.msg.includes("型号错误")) {
                list.value.unshift({
                  status: 7,
                  detail_no: res.result
                });
              }
            }
          } else {
            try {
              api_auth.scanCustomer({
                outbound: row.value.id,
                detail_no: res.result
              });
              common_vendor.index.showToast({
                title: "认证成功",
                icon: "none"
              });
            } catch (error) {
              if (error.data.msg.includes("型号错误")) {
                list.value.unshift({
                  status: 7,
                  detail_no: res.result
                });
              }
            }
          }
        },
        fail: (err) => {
        }
      });
    };
    const handleFinish = () => {
      common_vendor.index.navigateBack({
        delta: 2
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(list.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.detail_no),
            b: common_vendor.t(common_vendor.unref(utils_dict.packageStatusOption).find((op) => op.value === item.status).label),
            c: item.status === 7 || item.status === 0 ? 1 : "",
            d: index,
            e: common_vendor.o(($event) => pageTo(), index)
          };
        }),
        b: common_vendor.o(handleScan),
        c: common_vendor.o(handleFinish)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ca580501"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/web/auth/detailList.js.map
