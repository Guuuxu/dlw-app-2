"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_auth = require("../../../api/auth.js");
if (!Array) {
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_forms_item2 + _easycom_uni_forms2)();
}
const _easycom_uni_forms_item = () => "../../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_forms = () => "../../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_forms_item + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "check",
  setup(__props) {
    const formData = common_vendor.ref({});
    const row = common_vendor.ref({});
    common_vendor.onLoad((option) => {
      common_vendor.index.__f__("log", "at pages/web/auth/check.vue:73", "option", option);
      row.value = option.item ? JSON.parse(option.item) : {};
    });
    const changeCategory = (e) => {
      common_vendor.index.__f__("log", "at pages/web/auth/check.vue:79", e);
      formData.value.isCateCorrect = e.detail.value;
    };
    const changeQuantity = (e) => {
      common_vendor.index.__f__("log", "at pages/web/auth/check.vue:83", e);
      formData.value.quantity = e.detail.value;
    };
    const changeAmbiguity = (e) => {
      common_vendor.index.__f__("log", "at pages/web/auth/check.vue:87", e);
      formData.value.ambiguity = e.detail.value;
    };
    const handleNext = async () => {
      common_vendor.index.__f__("log", "at pages/web/auth/check.vue:94", "formData", formData);
      if (formData.value.isCateCorrect === "1" && formData.value.quantity === "1") {
        if (formData.value.ambiguity === "1") {
          common_vendor.index.navigateTo({
            url: "/pages/auth/authError?errorType=3"
          });
        } else {
          await api_auth.authConfirm(row.value.id);
          common_vendor.index.navigateTo({
            url: "/pages/auth/authError?errorType=0"
          });
        }
      } else {
        common_vendor.index.navigateTo({
          url: "/pages/auth/detailList?item=" + JSON.stringify(row.value)
        });
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(row.value.order_no),
        b: common_vendor.t(row.value.total_count),
        c: common_vendor.o(changeCategory),
        d: common_vendor.o((e) => _ctx.$refs.input.onFieldChange(_ctx.$event.detail.value)),
        e: common_vendor.p({
          label: "1、请确认包装型号是否正确？",
          name: "isCateCorrect",
          required: true
        }),
        f: common_vendor.o(changeQuantity),
        g: common_vendor.o((e) => _ctx.$refs.input.onFieldChange(_ctx.$event.detail.value)),
        h: common_vendor.p({
          label: "2、请确认包装数量是否正确？",
          name: "quantity",
          required: true
        }),
        i: common_vendor.o(changeAmbiguity),
        j: common_vendor.o((e) => _ctx.$refs.input.onFieldChange(_ctx.$event.detail.value)),
        k: common_vendor.p({
          required: true,
          name: "ambiguity",
          label: "3、请确认是否有疑品包装？"
        }),
        l: common_vendor.p({
          model: formData.value,
          ["label-position"]: "top",
          ["label-width"]: "250px"
        }),
        m: common_vendor.o(handleNext)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e48a5751"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/web/auth/check.js.map
