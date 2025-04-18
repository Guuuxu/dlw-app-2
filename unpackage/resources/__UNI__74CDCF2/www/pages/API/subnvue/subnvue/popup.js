"use weex:vue";

if (typeof Promise !== 'undefined' && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor
    return this.then(
      value => promise.resolve(callback()).then(() => value),
      reason => promise.resolve(callback()).then(() => {
        throw reason
      })
    )
  }
};

if (typeof uni !== 'undefined' && uni && uni.requireGlobal) {
  const global = uni.requireGlobal()
  ArrayBuffer = global.ArrayBuffer
  Int8Array = global.Int8Array
  Uint8Array = global.Uint8Array
  Uint8ClampedArray = global.Uint8ClampedArray
  Int16Array = global.Int16Array
  Uint16Array = global.Uint16Array
  Int32Array = global.Int32Array
  Uint32Array = global.Uint32Array
  Float32Array = global.Float32Array
  Float64Array = global.Float64Array
  BigInt64Array = global.BigInt64Array
  BigUint64Array = global.BigUint64Array
};


(()=>{var b=Object.create;var d=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var h=Object.getOwnPropertyNames;var y=Object.getPrototypeOf,C=Object.prototype.hasOwnProperty;var v=(r,e)=>()=>(e||r((e={exports:{}}).exports,e),e.exports);var B=(r,e,o,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let p of h(e))!C.call(r,p)&&p!==o&&d(r,p,{get:()=>e[p],enumerable:!(n=_(e,p))||n.enumerable});return r};var g=(r,e,o)=>(o=r!=null?b(y(r)):{},B(e||!r||!r.__esModule?d(o,"default",{value:r,enumerable:!0}):o,r));var a=v((V,x)=>{x.exports=Vue});var I=g(a());function u(){return uni.getSubNVueById(plus.webview.currentWebview().id)}var t=g(a());var m=(r,e)=>{let o=r.__vccOpts||r;for(let[n,p]of e)o[n]=p;return o};var w={wrapper:{"":{flexDirection:"column",justifyContent:"space-between",paddingTop:"10rpx",paddingRight:"15rpx",paddingBottom:"10rpx",paddingLeft:"15rpx",backgroundColor:"#F4F5F6",borderRadius:"4rpx"}},title:{"":{height:"100rpx",lineHeight:"100rpx",borderBottomStyle:"solid",borderBottomWidth:"1rpx",borderBottomColor:"#CBCBCB",flex:0,fontSize:"30rpx"}},scroller:{"":{height:"400rpx",paddingTop:"8rpx",paddingRight:"15rpx",paddingBottom:"8rpx",paddingLeft:"15rpx"}},content:{"":{color:"#555555",fontSize:"32rpx"}},"message-wrapper":{"":{flex:0,borderTopStyle:"solid",borderTopWidth:"1rpx",borderTopColor:"#CBCBCB",height:"80rpx",alignItems:"flex-end"}},"send-message":{"":{fontSize:"30rpx",lineHeight:"80rpx",color:"#00CE47",marginLeft:"20rpx"}},cell:{"":{marginTop:"10rpx",marginRight:"10rpx",marginBottom:"10rpx",marginLeft:"10rpx",paddingTop:"20rpx",paddingRight:0,paddingBottom:"20rpx",paddingLeft:0,top:"10rpx",alignItems:"center",justifyContent:"center",borderRadius:"10rpx",backgroundColor:"#5989B9"}},text:{"":{fontSize:"30rpx",textAlign:"center",color:"#FFFFFF"}}},S={data(){return{title:"",content:"",lists:[]}},created(){let r=this;for(let e=1;e<20;e++)this.lists.push("item"+e);uni.$on("page-popup",e=>{r.title=e.title,r.content=e.content})},beforeDestroy(){uni.$off("drawer-page")},methods:{sendMessage(){u(),uni.$emit("popup-page",{title:"\u5DF2\u8BFB\u5B8C!"})},handle(r,e){u(),uni.$emit("popup-page",{type:"interactive",info:r+" \u8BE5\u5143\u7D20\u88AB\u70B9\u51FB\u4E86!"})}}};function k(r,e,o,n,p,l){return(0,t.openBlock)(),(0,t.createElementBlock)("scroll-view",{scrollY:!0,showScrollbar:!0,enableBackToTop:!0,bubble:"true",style:{flexDirection:"column"}},[(0,t.createElementVNode)("div",{class:"wrapper"},[(0,t.createElementVNode)("u-text",{class:"title"},(0,t.toDisplayString)(p.title),1),(0,t.createElementVNode)("scroller",{class:"scroller"},[(0,t.createElementVNode)("div",null,[(0,t.createElementVNode)("u-text",{class:"content"},(0,t.toDisplayString)(p.content),1)]),(0,t.createElementVNode)("div",null,[(0,t.createElementVNode)("u-text",{style:{color:"red","font-size":"30rpx"}},"\u4EE5\u4E0B\u4E3A Popup \u5185\u90E8\u6EDA\u52A8\u793A\u4F8B\uFF1A")]),((0,t.openBlock)(!0),(0,t.createElementBlock)(t.Fragment,null,(0,t.renderList)(p.lists,(s,f)=>((0,t.openBlock)(),(0,t.createElementBlock)("div",{class:"cell",onClick:F=>l.handle(s),key:f},[(0,t.createElementVNode)("u-text",{class:"text"},(0,t.toDisplayString)(s),1)],8,["onClick"]))),128))]),(0,t.createElementVNode)("div",{class:"message-wrapper"},[(0,t.createElementVNode)("u-text",{class:"send-message",onClick:e[0]||(e[0]=(...s)=>l.sendMessage&&l.sendMessage(...s))},"\u5411\u9875\u9762\u53D1\u9001\u6D88\u606F")])])])}var i=m(S,[["render",k],["styles",[w]]]);var c=plus.webview.currentWebview();if(c){let r=parseInt(c.id),e="pages/API/subnvue/subnvue/popup",o={};try{o=JSON.parse(c.__query__)}catch(p){}i.mpType="page";let n=Vue.createPageApp(i,{$store:getApp({allowDefault:!0}).$store,__pageId:r,__pagePath:e,__pageQuery:o});n.provide("__globalStyles",Vue.useCssStyles([...__uniConfig.styles,...i.styles||[]])),n.mount("#root")}})();
