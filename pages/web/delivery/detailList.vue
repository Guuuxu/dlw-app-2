<template>
	<view class="check-container pt-16">

		<view class="detail-list ">
			<template v-if="list.length">
				<view class="detail-item  bg_white d-f w_100  jc-sb ai-c pl-32 pr-28" v-for="item in list">
					<view class="title">
						{{item.detail_no}}
					</view>
					<view class="sub ">
						<text class="uni-error">{{item.limit_count}}/{{item.month_limit}}</text>
						<text class="color-subTitlle">(单月循环次数)</text>
					</view>
				</view>
			</template>
			<Empty v-else class="no-data ta-c uni-list-cell-pd"></Empty>
		</view>
		<view class="w_100 mt-48 fixed pb-20 safe-area-bottom">
			<button class="custom-btn" type="" @click="handleScan">扫一扫</button>
			<button class="custom-btn mt-10" @click="handleFinish">结束包装出库</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad,onReachBottom,onPullDownRefresh
	} from "@dcloudio/uni-app";
	import permision from "@/common/permission.js"
	import { scanOutbound,getOutboundDetail } from "@/api/outbound.js"
	import Empty from "@/components/empty/empty.vue"
	
	const list = ref([])
	const page = ref({
		page: 1,
		per_page: 10
	})
	const total_count = ref(0)
	const row = ref({})
	onLoad((option) => {
		const item = JSON.parse((option.item))
		row.value = item
		loadDetail()
	})
	
	const loadDetail = async (isfresh)=>{
		try{
			const res = await getOutboundDetail(row.value.id)
			console.log(res)
			if(isfresh){
				list.value = res.data.list
			}else{
				list.value = list.value.concat(res.data.list)
			}
			total_count.value = res.data.total_count
		uni.stopPullDownRefresh();
		}catch(e){
		uni.stopPullDownRefresh();
			//TODO handle the exception
		}
	}
	// 扫一扫
	const handleScan = async () => {
		// try {
		// 	const resScan = await scanOutbound({
		// 		outbound: row.value.id,
		// 		detail_no: 'SXZ-00000020'//res.result,
		// 	})
		// } catch ({data}) {
		// 	console.log(data)
		// 	row.value.detail_no = 'SXZ-00000020'
		// 	uni.navigateTo({
		// 		url: `/pages/delivery/deliveryError?item=${JSON.stringify(row.value) }&msg=${data.msg}`
		// 	})
		// }
		// #ifdef APP-PLUS
		let status = await checkPermission();
		if (status !== 1) {
			return;
		}
		// #endif
		uni.scanCode({
			success: async (res) => {
				try {
					const resScan = await scanOutbound({
						outbound: row.value.id,
						detail_no: res.result,
					})
					uni.showToast({
						title: '出库成功',
						icon: 'none'
					})
					
					uni.startPullDownRefresh();
				} catch ({data}) {
					// list.value.unshift({
					// 	msg: data.msg,
					// 	detail_no: res.result
					// })
					row.value.detail_no = res.result
					console.log('81',row.value)
					uni.navigateTo({
						url: `/pages/delivery/deliveryError?item=${JSON.stringify(row.value)}&msg=${data.msg}`
					})
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
	
	const handleFinish = ()=>{
		uni.navigateBack()
	}
	onPullDownRefresh(()=>{
		page.value.page = 1
		loadDetail(true)
	})
	onReachBottom(() => {
		console.log("onReachBottom");
		if (list.value.length = total_count.value) {
			loadMoreText.value = "没有更多数据了!"
			return;
		}
		this.showLoadMore = true;
		setTimeout(() => {
			loadDetail();
		}, 300);
	})
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