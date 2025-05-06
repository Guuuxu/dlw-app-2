"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_repair = require("../../api/repair.js");
const api_common = require("../../api/common.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_card2 + _easycom_uni_data_checkbox2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_card + _easycom_uni_data_checkbox + _easycom_uni_popup)();
}
const sourceTypeIndex = 2;
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const code = common_vendor.ref("请扫描编码");
    const model_detail_id = common_vendor.ref("");
    const handleScan = async () => {
      common_vendor.index.scanCode({
        success: async (res) => {
          code.value = res.result;
          const resScan = await api_repair.scanRepair(code.value);
          model_detail_id.value = resScan.data.id;
        },
        fail: (err) => {
        }
      });
    };
    const reasonOption = common_vendor.ref([
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
    const popup = common_vendor.ref(null);
    const broken_reason = common_vendor.ref([]);
    const reason = common_vendor.ref("");
    const reasonName = common_vendor.ref("请选择");
    const handleShowPop = () => {
      popup.value.open();
    };
    const tempReason = common_vendor.ref("");
    const change = (e) => {
      var _a, _b;
      common_vendor.index.__f__("log", "at pages/report/index.vue:173", "e:", e);
      broken_reason.value = (_a = e.detail) == null ? void 0 : _a.value;
      tempReason.value = ((_b = e.detail) == null ? void 0 : _b.data.map((item) => item.text).toString()) || "";
    };
    const imageList = common_vendor.ref([]);
    const imageDetailList = common_vendor.ref([]);
    const secondImgList = common_vendor.ref([]);
    const handleUpload = async (index) => {
      common_vendor.index.chooseImage({
        // sourceType: sourceType[sourceTypeIndex],
        // sizeType: sizeType[this.sizeTypeIndex],
        count: 1,
        success: async (res) => {
          common_vendor.index.__f__("log", "at pages/report/index.vue:198", "chooseImage", res.tempFilePaths);
          const urlRes = await api_common.uploadApi(res.tempFilePaths[0]);
          const url = urlRes.data.url;
          common_vendor.index.__f__("log", "at pages/report/index.vue:201", "urlRes", urlRes);
          if (index === 1) {
            imageList.value = [url];
          } else if (index === 2) {
            imageDetailList.value = [url];
          } else {
            secondImgList.value = [url];
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/report/index.vue:212", "err: ", err);
          if (err.errMsg.indexOf("cancel") !== "-1") {
            return;
          }
          common_vendor.index.getSetting({
            success: (res) => {
              let authStatus = false;
              switch (sourceTypeIndex) {
                case 0:
                  authStatus = res.authSetting["scope.camera"];
                  break;
                case 1:
                  authStatus = res.authSetting["scope.album"];
                  break;
                case 2:
                  authStatus = res.authSetting["scope.album"] && res.authSetting["scope.camera"];
                  break;
              }
              if (!authStatus) {
                common_vendor.index.showModal({
                  title: "授权失败",
                  content: "迪雷沃需要从您的相机或相册获取图片，请在设置界面打开相关权限",
                  success: (res2) => {
                    if (res2.confirm) {
                      common_vendor.index.openSetting();
                    }
                  }
                });
              }
            }
          });
        }
      });
    };
    const previewImage = (e) => {
      var current = e.target.dataset.src;
      common_vendor.index.previewImage({
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
      common_vendor.index.__f__("log", "at pages/report/index.vue:274", broken_reason);
      reasonName.value = tempReason.value;
      popup.value.close();
    };
    const handleSubmit = async () => {
      common_vendor.index.__f__("log", "at pages/report/index.vue:280", imageList.value);
      if (!broken_reason.value.length) {
        common_vendor.index.showToast({
          icon: "none",
          title: "请选择损坏原因"
        });
        return;
      }
      if (!model_detail_id.value) {
        common_vendor.index.showToast({
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
      common_vendor.index.__f__("log", "at pages/report/index.vue:303", "params", params);
      await api_repair.updateRepair(params);
      common_vendor.index.__f__("log", "at pages/report/index.vue:305", code.value, broken_reason.value, imageList.value);
      common_vendor.index.navigateTo({
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
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(code.value),
        b: common_assets._imports_0$2,
        c: common_vendor.o(handleScan),
        d: common_vendor.t(reasonName.value),
        e: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999999"
        }),
        f: common_vendor.o(handleShowPop),
        g: common_vendor.p({
          ["is-shadow"]: false,
          ["is-full"]: true
        }),
        h: common_vendor.f(imageList.value, (image, index, i0) => {
          return {
            a: image,
            b: image,
            c: common_vendor.o(previewImage, index),
            d: common_vendor.o(deleteMainImage, index),
            e: index
          };
        }),
        i: common_assets._imports_1$1,
        j: common_vendor.p({
          type: "plusempty",
          size: "20",
          color: "#999999"
        }),
        k: common_vendor.o(($event) => handleUpload(1)),
        l: common_vendor.f(imageDetailList.value, (image, index, i0) => {
          return {
            a: image,
            b: image,
            c: common_vendor.o(previewImage, index),
            d: common_vendor.o(deleteDetailImage, index),
            e: index
          };
        }),
        m: common_assets._imports_1$1,
        n: common_vendor.p({
          type: "plusempty",
          size: "20",
          color: "#999999"
        }),
        o: common_vendor.o(($event) => handleUpload(2)),
        p: common_vendor.f(secondImgList.value, (image, index, i0) => {
          return {
            a: image,
            b: image,
            c: common_vendor.o(previewImage, index),
            d: common_vendor.o(deleteSecondImage, index),
            e: index
          };
        }),
        q: common_assets._imports_1$1,
        r: common_vendor.p({
          type: "plusempty",
          size: "20",
          color: "#999999"
        }),
        s: common_vendor.o(($event) => handleUpload(3)),
        t: common_vendor.p({
          ["is-shadow"]: false,
          ["is-full"]: true
        }),
        v: common_vendor.o(handleSubmit),
        w: common_vendor.o(change),
        x: common_vendor.o(($event) => broken_reason.value = $event),
        y: common_vendor.p({
          selectedColor: "#99BBA0",
          type: "primary",
          multiple: true,
          mode: "list",
          localdata: reasonOption.value,
          modelValue: broken_reason.value
        }),
        z: reason.value,
        A: common_vendor.o(($event) => reason.value = $event.detail.value),
        B: broken_reason.value.includes(7),
        C: common_vendor.o(($event) => handleConfirm()),
        D: common_vendor.sr(popup, "14542b8b-6", {
          "k": "popup"
        }),
        E: common_vendor.p({
          type: "bottom",
          title: "请选择损坏原因",
          ["border-radius"]: "10px 10px 0 0"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-14542b8b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/report/index.js.map
