<template>
	<view class="check-container pt-16">

		<view class="detail-list bg_white " v-if="list.length">
			
				<view class="detail-item  d-f w_100  jc-sb ai-c pl-32 pr-28" v-for="(item,index) in list" :key="index"
					@click="pageTo()">
					<view class="title">
						{{item.detail_no}}
					</view>
					<view class="sub uni-success">
						{{item.msg}}
				
					</view>
				</view>
			
		</view>
			<view class="no-data ta-c uni-list-cell-pd">暂无数据</view>
		<view class="footer w_100 mt-48 fixed pb-20 safe-area-bottom" style="">
			<button class="custom-btn" type="" @click="handleScan">扫一扫</button>
			<button class="custom-btn mt-10" @click="handleFinish">结束回收复查</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import { onReady,onLoad } from '@dcloudio/uni-app'
	import permision from "@/common/permission.js"
	import { scanRecycle,scanAdmin } from "@/api/auth.js"
	const list = ref([])
	
	const pageTo =()=>{
		uni.navigateTo({
			url: '/pages/recycle/recycleSuccess'
		})
	}
	// 扫一扫
	const handleScan = async () => {
		
		// #ifdef APP-PLUS
		let status = await checkPermission();
		if (status !== 1) {
			return;
		}
		// #endif
		uni.scanCode({
			success: async (res) => {
				if(role.value === 'admin'){
					try {
						const resScan = await scanAdmin({
							id: row.value.id,
							type: 3,
							detail_no: res.result,
						})
						uni.showToast({
							title: '已回收',
							icon: 'none'
						})
					} catch (error) {
						list.value.unshift({
							status: 7,
							detail_no: res.result
						})
					}
				}else{
					try {
						await scanRecycle({
							detail_no: res.result
						})
						list.value.unshift({
							msg: '回收成功',
							detail_no: res.result
						})
					} catch ({data}) {
						list.value.unshift({
							msg: data.msg,
							detail_no: res.result
						})
					}
					// try {
					// 	await scanRecycle({
					// 		detail_no: res.result
					// 	})
					// } catch (error) {
					// 	list.value.unshift({
					// 		status: 7,
					// 		detail_no: res.result
					// 	})
					// }
					
				}
			},
			fail: (err) => {
				// 需要注意的是小程序扫码不需要申请相机权限
			}
		});
	}
	// #ifdef APP-PLUS

	const checkPermission = async (code) => {
		let status = permision.isIOS ? await permision.requestIOS('camera') :
			await permision.requestAndroid('android.permission.CAMERA');

		if (status === null || status === 1) {
			status = 1;
		} else {
			uni.showModal({
				content: "需要相机权限",
				confirmText: "设置",
				success: function(res) {
					if (res.confirm) {
						permision.gotoAppSetting();
					}
				}
			})
		}
		return status;
	}
	// #endif
	const handleFinish = () => {
		uni.switchTab({
			url: '/pages/index/index'
		})
	}
</script>

<style lang="scss" scoped>
	page {}

	.check-container {}

	.detail-list {
		font-size: 32rpx;
		color: #0F182C;

		.detail-item {
			border-bottom: 2rpx solid #F6F7F8;
			height: 108rpx;
		}

	}
</style>