import "vue";
function getCurrentSubNVue() {
  return uni.getSubNVueById(plus.webview.currentWebview().id);
}
export {
  getCurrentSubNVue as g
};
