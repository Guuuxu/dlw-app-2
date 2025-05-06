"use strict";
const common_vendor = require("../common/vendor.js");
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
  const userRole = common_vendor.index.getStorageSync("ROLE_KEY");
  common_vendor.index.__f__("log", "at utils/request.js:16", "userRole", userRole);
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
  const token = common_vendor.index.getStorageSync("token");
  common_vendor.index.__f__("log", "at utils/request.js:32", "token", token);
  if (token) {
    config.header.Authorization = `Bearer ${token}`;
  }
  return config;
};
const responseInterceptor = (response) => {
  common_vendor.index.__f__("log", "at utils/request.js:42", response);
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
  common_vendor.index.__f__("log", "at utils/request.js:54", "error", error);
  if (error.errMsg && error.errMsg.includes("timeout")) {
    errMsg = "请求超时，请检查网络连接";
  } else if ((_a = error.data) == null ? void 0 : _a.code) {
    switch (error.data.code) {
      case 401:
        errMsg = "未授权，请重新登录";
        common_vendor.index.navigateTo({ url: "/pages/login/login" });
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
  common_vendor.index.showToast({
    title: errMsg,
    icon: "none",
    duration: 3e3
  });
  return Promise.reject(error);
};
const createRequest = (config) => {
  const mergedConfig = { ...defaults, ...config, url: getApiUrl() + config.url };
  common_vendor.index.__f__("log", "at utils/request.js:90", "mergedConfig", mergedConfig);
  const finalOptions = requestInterceptor(mergedConfig);
  return new Promise((resolve, reject) => {
    const task = common_vendor.index.request({
      ...finalOptions,
      success: (res) => {
        const processedResponse = responseInterceptor(res);
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
      common_vendor.index.uploadFile({
        url: getApiUrl() + url,
        filePath,
        name,
        formData,
        header: {
          "Authorization": `Bearer ${common_vendor.index.getStorageSync("token")}`
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at utils/request.js:143", "143", res);
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(res.data);
              resolve(data);
            } catch (e) {
              resolve(res.data);
            }
          } else {
            reject(res);
          }
        },
        fail: (error) => {
          common_vendor.index.__f__("log", "at utils/request.js:156", "156", error);
          reject(error);
        },
        ...options
      });
    });
  }
  // 其他方法（PUT, DELETE等）类似
};
exports.http = http;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
