<template>
	<view class="auth-error-container ">
		<view class="content">
			<image class="error-image" src="/static/image/report-success@2x.png" mode=""></image>
				<text class="error-title fs-36">提交完成</text>
				<text class="error-desc fs-28 color-subTitlle">感谢您的提交，迪雷沃会尽快审核处理</text>
			<button class="custom-btn verify-btn" @click="handleBack">继续损坏申报</button>
		</view>
	</view>
</template>
	
<script setup>
	import {
		ref
	} from 'vue';

	const handleBack = ()=>{
		 uni.navigateBack({
			 delta: 1
		 })
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