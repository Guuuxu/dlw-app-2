"use strict";
const common_vendor = require("../../common/vendor.js");
const api_common = require("../../api/common.js");
if (!Array) {
  const _easycom_v_tabs2 = common_vendor.resolveComponent("v-tabs");
  _easycom_v_tabs2();
}
const _easycom_v_tabs = () => "../../uni_modules/v-tabs/components/v-tabs/v-tabs.js";
if (!Math) {
  _easycom_v_tabs();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "login",
  setup(__props) {
    const step = common_vendor.ref(1);
    const phone = common_vendor.ref("");
    const agreed = common_vendor.ref(false);
    const tabs = ["客户端", "管理端"];
    const role = common_vendor.ref("0");
    common_vendor.index.__f__("log", "at pages/login/login.vue:67", "show", role.value);
    common_vendor.index.setStorageSync("ROLE_KEY", "web");
    const changeRole = (e) => {
      common_vendor.index.__f__("log", "at pages/login/login.vue:70", e);
      role.value = e;
      const key = e == "0" ? "web" : "admin";
      common_vendor.index.setStorageSync("ROLE_KEY", key);
    };
    const isValidPhone = common_vendor.computed(() => {
      const phoneReg = /^1[3-9]\d{9}$/;
      return phoneReg.test(phone.value);
    });
    const checkboxChange = (e) => {
      agreed.value = e.detail.value[0] === "true";
    };
    const getVerifyCode = () => {
      if (!agreed.value) {
        common_vendor.index.showToast({
          title: "请先同意用户协议",
          icon: "none"
        });
        return;
      }
      if (!isValidPhone.value) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showToast({
        title: "验证码已发送",
        icon: "success"
      });
      step.value = 2;
    };
    const openAgreement = () => {
      common_vendor.index.navigateTo({
        url: "/pages/login/agreement"
      });
    };
    const codeValue = common_vendor.ref([]);
    const currentFocus = common_vendor.ref(0);
    const countdown = common_vendor.ref(60);
    let timer = null;
    const inputRefs = common_vendor.ref([]);
    const handleInput = async (event, index) => {
      const value = event.detail.value;
      common_vendor.index.__f__("log", "at pages/login/login.vue:123", "value", value);
      if (value.length > 1) {
        const values = value.split("");
        values.forEach((v, i) => {
          if (index + i < 6) {
            codeValue.value[index + i] = v;
            currentFocus.value = index + i;
          }
        });
        const nextEmptyIndex = codeValue.value.findIndex((v, i) => !v && i >= index);
        common_vendor.index.__f__("log", "at pages/login/login.vue:133", nextEmptyIndex);
        if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
          currentFocus.value = nextEmptyIndex;
        }
      } else {
        codeValue.value[index] = value;
        if (value && index < 5) {
          currentFocus.value = index + 1;
        } else if (!value && index > 0) {
          currentFocus.value = index - 1;
        } else {
          common_vendor.index.__f__("log", "at pages/login/login.vue:145", codeValue.value);
          if (codeValue.value.length && index) {
            const res = await api_common.loginApi({
              phone: phone.value,
              code: codeValue.value.join("")
            });
            common_vendor.index.__f__("log", "at pages/login/login.vue:151", "res", res);
            common_vendor.index.__f__("log", "at pages/login/login.vue:152", "index", index);
            common_vendor.index.setStorageSync("token", res.data.accessToken);
            common_vendor.index.setStorageSync("userInfo", JSON.stringify(res.data.user));
            common_vendor.index.showToast({
              title: "登录成功",
              success() {
                common_vendor.index.switchTab({
                  url: "/pages/index/index"
                });
              }
            });
          }
        }
      }
    };
    const handleFocus = (index) => {
      currentFocus.value = index;
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
        common_vendor.index.showToast({
          title: "验证码已重新发送",
          icon: "none"
        });
      }
    };
    common_vendor.onMounted(() => {
      startCountdown();
    });
    common_vendor.onUnmounted(() => {
      if (timer) {
        clearInterval(timer);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: step.value === 1
      }, step.value === 1 ? {
        b: common_vendor.o(changeRole),
        c: common_vendor.o(($event) => role.value = $event),
        d: common_vendor.p({
          tabs,
          bgColor: "transport",
          lineColor: "#99BBA0",
          activeColor: "#99BBA0",
          modelValue: role.value
        }),
        e: phone.value,
        f: common_vendor.o(($event) => phone.value = $event.detail.value),
        g: !isValidPhone.value,
        h: common_vendor.o(getVerifyCode),
        i: agreed.value,
        j: common_vendor.o(checkboxChange),
        k: common_vendor.o(openAgreement)
      } : common_vendor.e({
        l: common_vendor.t(phone.value ? phone.value.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") : ""),
        m: common_vendor.f(6, (item, index, i0) => {
          return {
            a: index,
            b: codeValue.value[index] || "",
            c: common_vendor.o((e) => handleInput(e, index), index),
            d: common_vendor.o(($event) => handleFocus(index), index),
            e: currentFocus.value === index ? 1 : "",
            f: currentFocus.value === index,
            g: (el) => inputRefs.value[index] = el
          };
        }),
        n: countdown.value > 0
      }, countdown.value > 0 ? {
        o: common_vendor.t(countdown.value)
      } : {
        p: common_vendor.t(countdown.value > 0 ? countdown.value : ""),
        q: common_vendor.o(resendCode)
      }));
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
