<script>
	import {
		mapMutations
	} from 'vuex'
	import {
		version
	} from './package.json'
	// #ifdef APP
	import checkUpdate from '@/uni_modules/uni-upgrade-center-app/utils/check-update';
	// #endif

	export default {
		onLaunch: function() {
			
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		globalData: {
			test: ''
		},
		methods: {
			
		}
	}
</script>

<style lang="scss">
	@import '@/uni_modules/uni-scss/index.scss';
	
	/* #ifndef APP-PLUS-NVUE */
	/* uni.css - 通用组件、模板样式库，可以当作一套ui库应用 */
	@import './common/uni.css';
	@import '@/static/customicons.css';
	@import '@/static/style/_flex.scss';
	@import './static/style/_common.scss';
	/* H5 兼容 pc 所需 */
	/* #ifdef H5 */
	@media screen and (min-width: 768px) {
		body {
			overflow-y: scroll;
		}
	}

	/* 顶栏通栏样式 */
	/* .uni-top-window {
	    left: 0;
	    right: 0;
	} */

	uni-page-body {
		background-color: #F5F5F5 !important;
		min-height: 100% !important;
		height: auto !important;
	}

	.uni-top-window uni-tabbar .uni-tabbar {
		background-color: #fff !important;
	}

	.uni-app--showleftwindow .hideOnPc {
		display: none !important;
	}

	/* #endif */

	/* 以下样式用于 hello uni-app 演示所需 */
	page {
		background-color: #efeff4;
		height: 100%;
		font-size: 28rpx;
		/* line-height: 1.8; */
	}

	.fix-pc-padding {
		padding: 0 50px;
	}

	.uni-header-logo {
		padding: 30rpx;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-top: 10rpx;
	}

	.uni-header-image {
		width: 100px;
		height: 100px;
	}

	.uni-hello-text {
		color: #7A7E83;
	}

	.uni-hello-addfile {
		text-align: center;
		line-height: 300rpx;
		background: #FFF;
		padding: 50rpx;
		margin-top: 10px;
		font-size: 38rpx;
		color: #808080;
	}

	/* #endif*/
	:root {
	  --primary-color: #99BBA0; /* 默认主题色 */
	  --secondary-color: #4CD964;
	  /* 其他颜色变量 */
	}
	/* uni.scss */
	$uni-primary: #99BBA0;
	$uni-success: #4cd964;
	$uni-warning: #f0ad4e;
	$uni-error: #dd524d;
	$uni-text-primary: #333;
	$uni-text-secondary: #666;
	
	/* 覆盖组件默认样式 */
	uni-button[type=primary] {
	  background-color: $uni-primary;
	  color: #fff;
	}
	
	uni-tabbar .uni-tabbar__item.uni-tabbar__item--active {
	  color: $uni-primary;
	}
</style>
<style lang="scss">
	/* App.vue */
	:root {
	  /* 基础颜色变量 */
	  --uni-primary: #99BBA0; /* 主色调 */
	  --uni-success: #4cd964; /* 成功色 */
	  --uni-warning: #f0ad4e; /* 警告色 */
	  --uni-error: #dd524d;   /* 错误色 */
	  --uni-text-primary: #333; /* 主要文字色 */
	  --uni-text-secondary: #666; /* 次要文字色 */
	  --uni-text-tertiary: #999; /* 辅助文字色 */
	  
	  /* 组件特定颜色 */
	  --uni-button-primary-bg: var(--uni-primary);
	  --uni-button-primary-text: #fff;
	  --uni-tabbar-active-color: var(--uni-primary);
	}
	/* 覆盖按钮默认样式 */
	uni-button {
	  &[type=primary] {
	    background-color: var(--uni-primary);
	    border-color: var(--uni-primary);
	    color: #fff;
	  }
	  
	  &[type=default] {
	    background-color: #fff;
	    border-color: var(--uni-border-color);
	    color: var(--uni-text-primary);
	  }
	}
</style>
