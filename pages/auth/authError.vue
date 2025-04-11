<template>
	<view class="auth-error-container ">
		<view class="content">
			<template v-if="errorType == 0">
				<image class="error-image" src="/static/image/auth-success@2x.png" mode=""></image>
				<text class="error-title fs-36">初始认证完成！</text>
			</template>
			<template v-else-if="errorType == 1">
				<image class="error-image" src="/static/image/auth-error-1@2x.png" mode=""></image>
				<text class="error-title fs-36">型号核实有误</text>
				<text class="error-desc fs-28 color-subTitlle">请尽快联系迪雷沃，错误型号<br />包装换货退运</text>
			</template>
			<template v-if="errorType == 2">
				<image class="error-image" src="/static/image/auth-error-2@2x.png" mode=""></image>
				<text class="error-title fs-36">数量核实有误</text>
				<text class="error-desc fs-28 color-subTitlle">请尽快联系迪雷沃，包装数量<br />短少事宜</text>
			</template>
			<template v-if="errorType == 3">
				<image class="error-image" src="/static/image/auth-error-3@2x.png" mode=""></image>
				<text class="error-title fs-36">疑品包装</text>
				<text class="error-desc fs-28 color-subTitlle">请将疑品包装取出，进行损坏申报</text>
			</template>
			<button class="custom-btn verify-btn" @click="navigatorBack()">继续初始认证</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad
	} from "@dcloudio/uni-app";
	const errorType = ref(1)
	onLoad((option) => {
		console.log(option)
		let data = option;
		errorType.value = data.errorType
	})
	const navigatorBack = () => {
		if (errorType.value == 3) {
			uni.navigateBack({
				delta: 3
			})
			return
		}
		if (errorType.value == 0) {
			uni.navigateBack({
				delta: 2
			})
			return
		}
		uni.navigateBack()
	}
</script>

<style lang="scss">
	page {
		height: 100% !important;
	}

	.auth-error-container {
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: #ffffff;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0 48rpx;
	}

	.error-image {
		width: 240rpx;
		height: 240rpx;
	}

	.error-title {
		margin-bottom: 16rpx;
		font-weight: 500;
	}

	.error-desc {
		text-align: center;
		line-height: 1.5;
	}

	.verify-btn {
		margin-top: 262rpx;
	}
</style>