<template>
	<view class="empty-wrap d-f">
		<image class="empty-image" src="/static/image/icon-empty.png"></image>
		<text class="mt-48">暂无数据</text>
	</view>
</template>

<script>
	export default {
		name:"empty",
		data() {
			return {
				
			};
		}
	}
</script>

<style lang="scss" scoped>
	.empty-wrap{
		padding-top: 240rpx;
		text-align: center;
		align-items: center;
		flex-direction: column;
	}
.empty-image{
	width: 240rpx;
	height: 240rpx;
}
</style>