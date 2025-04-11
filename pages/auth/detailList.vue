<template>
	<view class="check-container pt-16" v-if="isLoad">

		<view class="detail-list">

	
			<template v-if="list.length">
				<view class="detail-item  bg_white  d-f w_100  jc-sb ai-c pl-32 pr-28" v-for="(item,index) in list" :key="index"
					@click="pageTo()">
					<view class="title ellipsis_1 flex-1">
						{{item.detail_no}}
					</view>
					<view class="sub uni-success w-110" :class="{ 'uni-error': item.status === 7 || item.status === 0}">
						<text v-if="role === 'admin'">{{adminPkgStatusOption.find(op => op.value === item.status ).label}}</text>
						<text v-if="role === 'web'">{{webPkgStatusOption.find(op => op.value === item.status ).label}}</text>
					</view>
				</view>
			</template>
			<Empty v-else class="no-data ta-c uni-list-cell-pd"></Empty>
		</view>
		<view class="footer w_100 mt-48 pt-20 fixed pb-20 safe-area-bottom bg-white" style="">
			<button class="custom-btn" type="" @click="handleScan">扫一扫</button>
			<button class="custom-btn mt-10" @click="handleFinish">结束初始认证</button>
		</view>
	</view>
</template>

<script setup>
	import permision from "@/common/permission.js"
import Empty from "@/components/empty/empty.vue"
	import {
		ref,
		onMounted,
		getCurrentInstance
	} from 'vue';
	import {
		onLoad,
		onReachBottom,
		onPullDownRefresh
	} from "@dcloudio/uni-app";
	import {
		getScanResult,
		scanAdmin,
		scanCustomer
	} from '@/api/auth.js'
	import {
		packageStatusOption,
		adminPkgStatusOption,
		webPkgStatusOption
	} from "@/utils/dict";

	const verified_count = ref(0)
	const total_count = ref(0)
	const isLoad = ref(false)
	const row = ref({})
	const role = ref('') // 角色
	onLoad((option) => {
		role.value = uni.getStorageSync('ROLE_KEY')
		console.log(role.value)
		console.log('option', option)
		const item = option.item? JSON.parse(option.item) : {}
		row.value = item
		const id = item.id
		
		loadDetail(id)
	})

	const list = ref([])
	const loadMoreText = ref("加载中...")
	const showLoadMore = ref(false)
	const total = ref(0)
	const formData = ref({
		isCateCorrect: ''
	})
	const success_count = ref(0)
	const loadDetail = async (id,isfresh) => {
		try{
			const res = await getScanResult(id)
			total.value = res.data.total_count
			if (role.value === 'admin') {
				if(isfresh){
					list.value = res.data.list
				}else{
					list.value = list.value.concat(res.data.list)
				}
				// list.value = list.value.concat(res.data.list)
				console.log(list.value)
				uni.stopPullDownRefresh();
				uni.setNavigationBarTitle({
					title: `明细列表(${res.data.success_count}/${total.value})`
				})
			} else {
				if(isfresh){
					list.value = res.data.list
				}else{
					list.value = list.value.concat(res.data.list)
				}
				success_count.value = res.data.success_count
				uni.setNavigationBarTitle({
					title: `明细列表(${res.data.success_count}/${res.data.total_count})`
				})
				uni.stopPullDownRefresh();
			}
			isLoad.value = true
		}catch(e){
			uni.stopPullDownRefresh();
			isLoad.value = true
		}

	}
	onPullDownRefresh(()=>{
		console.log(row.value.id)
		loadDetail(row.value.id,true);
	})
	onReachBottom(() => {
		console.log("onReachBottom");
		if (list.value.length == total.value) {
			loadMoreText.value = "没有更多数据了!"
			return;
		}
		page.value.page++
		showLoadMore.value = true;
		setTimeout(() => {
			loadDetail(row.value.id);
		}, 300);
	})
	const pageTo = () => {
		// uni.navigateTo({
		// 	url: '/pages/auth/authError'
		// })
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
							type: 1,
							detail_no: res.result,
						})
						uni.showToast({
							title: '认证成功',
							icon: 'none'
						})
						uni.startPullDownRefresh()
					} catch (error) {
						// if(error.data.msg.includes('型号错误')){
						// 	list.value.unshift({
						// 		status: 7,
						// 		detail_no: res.result
						// 	})
						// }
						
					}
				}else{
					try {
						await scanCustomer({
							outbound: row.value.id,
							detail_no: res.result
						})
						uni.showToast({
							title: '认证成功',
							icon: 'none'
						})
						uni.startPullDownRefresh()
						// const index = list.value.findIndex(item => item.detail_no == res.result)
						// list.value[index].status = 1
						// const successList =list.value.filter(item => item.status == 1)
						// uni.setNavigationBarTitle({
						// 	title: `明细列表(${successList.length}/${list.value.length})`
						// })
					} catch (error) {
						// if(error.data.msg.includes('型号错误')){
						// 	list.value.unshift({
						// 		status: 7,
						// 		detail_no: res.result
						// 	})
						// }
						
					}
					
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
			
		if(role.value == 'web'){
			if(success_count.value != total.value){
				uni.navigateTo({
					url: "/pages/auth/authError?errorType=" + 2
				})
			}
		}else{
			uni.navigateBack({
				delta: 2
			})
		}
		
	}
</script>

<style lang="scss" scoped>
	page {
		
	}

	.check-container {
		
		}

	.detail-list {
		font-size: 32rpx;
		color: #0F182C;
		padding-bottom: 220rpx;
		.detail-item {
			border-bottom: 2rpx solid #F6F7F8;
			height: 108rpx;
		}

	}

	.footer {

		padding-bottom: constant(safe-area-inset-bottom);
		/*兼容 IOS<11.2*/
		padding-bottom: env(safe-area-inset-bottom);
		/*兼容 IOS>11.2*/
	}
</style>