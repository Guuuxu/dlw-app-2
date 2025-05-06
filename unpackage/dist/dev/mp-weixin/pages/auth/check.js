"use strict";
const common_vendor = require("../../common/vendor.js");
const api_auth = require("../../api/auth.js");
if (!Array) {
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_forms_item2 + _easycom_uni_forms2)();
}
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_forms_item + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "check",
  setup(__props) {
    const formData = common_vendor.ref({});
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
    const row = common_vendor.ref({});
    common_vendor.onLoad((option) => {
      common_vendor.index.__f__("log", "at pages/auth/check.vue:137", "option", option);
      row.value = option.item ? JSON.parse(option.item) : {};
    });
    const changeCategory = (e) => {
      common_vendor.index.__f__("log", "at pages/auth/check.vue:143", e);
      formData.value.isCateCorrect = e.detail.value;
    };
    const changeQuantity = (e) => {
      common_vendor.index.__f__("log", "at pages/auth/check.vue:147", e);
      formData.value.quantity = e.detail.value;
    };
    const changeAmbiguity = (e) => {
      common_vendor.index.__f__("log", "at pages/auth/check.vue:151", e);
      formData.value.ambiguity = e.detail.value;
    };
    const handleNext = async (ref) => {
      var _a, _b, _c;
      common_vendor.index.__f__("log", "at pages/auth/check.vue:160", "formData", formData);
      if (!((_a = formData.value) == null ? void 0 : _a.isCateCorrect)) {
        common_vendor.index.showToast({
          title: "请确认包装型号",
          icon: "none"
        });
        return;
      }
      if (!((_b = formData.value) == null ? void 0 : _b.isCateCorrect)) {
        common_vendor.index.showToast({
          title: "请确认包装数量",
          icon: "none"
        });
        return;
      }
      if (!((_c = formData.value) == null ? void 0 : _c.ambiguity)) {
        common_vendor.index.showToast({
          title: "请确认是否有疑品",
          icon: "none"
        });
        return;
      }
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
        c: formData.value.isCateCorrect === "1",
        d: formData.value.isCateCorrect === "2",
        e: common_vendor.o(changeCategory),
        f: common_vendor.p({
          label: "1、请确认包装型号是否正确？",
          name: "isCateCorrect",
          required: true
        }),
        g: formData.value.quantity === "1",
        h: formData.value.quantity === "2",
        i: common_vendor.o(changeQuantity),
        j: common_vendor.p({
          label: "2、请确认包装数量是否正确？",
          name: "quantity",
          required: true
        }),
        k: formData.value.ambiguity === "1",
        l: formData.value.ambiguity === "2",
        m: common_vendor.o(changeAmbiguity),
        n: common_vendor.p({
          required: true,
          name: "ambiguity",
          label: "3、请确认是否有疑品包装？"
        }),
        o: common_vendor.sr("valiForm", "f0ba12bd-0"),
        p: common_vendor.p({
          model: formData.value,
          rules,
          ["label-position"]: "top",
          ["label-width"]: "250px"
        }),
        q: common_vendor.o(($event) => handleNext())
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f0ba12bd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/auth/check.js.map
