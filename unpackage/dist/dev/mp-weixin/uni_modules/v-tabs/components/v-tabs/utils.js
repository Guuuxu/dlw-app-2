"use strict";
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
    const now = Date.now();
    const remaining = delay - (now - lastExecuted);
    function execute() {
      lastExecuted = now;
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
exports.startMicroTask = startMicroTask;
exports.throttle = throttle;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/v-tabs/components/v-tabs/utils.js.map
