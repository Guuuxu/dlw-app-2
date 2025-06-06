"use strict";
const common_vendor = require("../../common/vendor.js");
const api_auth = require("../../api/auth.js");
const utils_dict = require("../../utils/dict.js");
if (!Math) {
  Empty();
}
const Empty = () => "../../components/empty/empty.js";
const _sfc_main = {
  __name: "detailList",
  setup(__props) {
    common_vendor.ref(0);
    common_vendor.ref(0);
    const isLoad = common_vendor.ref(false);
    const row = common_vendor.ref({});
    const role = common_vendor.ref("");
    const formData = common_vendor.ref({});
    common_vendor.onLoad((option) => {
      role.value = common_vendor.index.getStorageSync("ROLE_KEY");
      common_vendor.index.__f__("log", "at pages/auth/detailList.vue:60", role.value);
      common_vendor.index.__f__("log", "at pages/auth/detailList.vue:61", "option", option);
      const item = option.item ? JSON.parse(option.item) : {};
      formData.value = option.formData ? JSON.parse(option.formData) : {};
      row.value = item;
      const id = item.id;
      loadDetail(id);
    });
    const list = common_vendor.ref([]);
    const loadMoreText = common_vendor.ref("加载中...");
    const showLoadMore = common_vendor.ref(false);
    const total = common_vendor.ref(0);
    const success_count = common_vendor.ref(0);
    const loadDetail = async (id, isfresh) => {
      try {
        const res = await api_auth.getScanResult(id);
        total.value = res.data.total_count;
        if (role.value === "admin") {
          if (isfresh) {
            list.value = res.data.list;
          } else {
            list.value = list.value.concat(res.data.list);
          }
          common_vendor.index.__f__("log", "at pages/auth/detailList.vue:87", list.value);
          common_vendor.index.stopPullDownRefresh();
          common_vendor.index.setNavigationBarTitle({
            title: `明细列表(${res.data.success_count}/${total.value})`
          });
        } else {
          if (isfresh) {
            list.value = res.data.list;
          } else {
            list.value = list.value.concat(res.data.list);
          }
          success_count.value = res.data.success_count;
          common_vendor.index.setNavigationBarTitle({
            title: `明细列表(${res.data.success_count}/${res.data.total_count})`
          });
          common_vendor.index.stopPullDownRefresh();
        }
        isLoad.value = true;
      } catch (e) {
        common_vendor.index.stopPullDownRefresh();
        isLoad.value = true;
      }
    };
    common_vendor.onPullDownRefresh(() => {
      common_vendor.index.__f__("log", "at pages/auth/detailList.vue:112", row.value.id);
      loadDetail(row.value.id, true);
    });
    common_vendor.onReachBottom(() => {
      common_vendor.index.__f__("log", "at pages/auth/detailList.vue:116", "onReachBottom");
      if (list.value.length == total.value) {
        loadMoreText.value = "没有更多数据了!";
        return;
      }
      page.value.page++;
      showLoadMore.value = true;
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
              common_vendor.index.startPullDownRefresh();
            } catch (error) {
            }
          } else {
            try {
              await api_auth.scanCustomer({
                outbound: row.value.id,
                detail_no: res.result
              });
              common_vendor.index.showToast({
                title: "认证成功",
                icon: "none"
              });
              common_vendor.index.startPullDownRefresh();
            } catch (error) {
            }
          }
        },
        fail: (err) => {
        }
      });
    };
    const handleFinish = () => {
      if (role.value == "web") {
        if (success_count.value != total.value) {
          common_vendor.index.navigateTo({
            url: "/pages/auth/authError?errorType=2"
          });
        } else {
          common_vendor.index.navigateBack({
            delta: 2
          });
        }
      } else {
        common_vendor.index.navigateBack({
          delta: 2
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isLoad.value
      }, isLoad.value ? common_vendor.e({
        b: list.value.length
      }, list.value.length ? {
        c: common_vendor.f(list.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.detail_no)
          }, role.value === "admin" ? {
            b: common_vendor.t(common_vendor.unref(utils_dict.adminPkgStatusOption).find((op) => op.value === item.status).label)
          } : {}, role.value === "web" ? {
            c: common_vendor.t(common_vendor.unref(utils_dict.webPkgStatusOption).find((op) => op.value === item.status).label)
          } : {}, {
            d: item.status === 7 || item.status === 0 ? 1 : "",
            e: index,
            f: common_vendor.o(($event) => pageTo(), index)
          });
        }),
        d: role.value === "admin",
        e: role.value === "web"
      } : {}, {
        f: common_vendor.o(handleScan),
        g: common_vendor.o(handleFinish)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9ed9ae8a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/auth/detailList.js.map
