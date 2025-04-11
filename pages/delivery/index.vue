<template>
	<view class="auth-container pt-16">
		<lsSkeleton :skeleton="skeleton" :loading="!isLoad">
		<template v-if="list.length">
			<view class="auth-item d-f ai-c" @click="goDetail(item)" v-for="(item,index) in list" :key="item.id">
				<view class="left w-80 h-80 uni-white d-f ai-c jc-c uni-bold fs-40" >
					{{index+1}}
				</view>
				<view class="middle flex-1 ml-24">
					<view class="title">
						{{ role == 'admin' ?item.name : item.order_no}}
						
					</view>
					<view class="sub color-subTitlle mt-8">
						{{ item.created_at }}
					</view>
				</view>
				<image class="arrow" src="/static/image/home-arrow@2x.png" mode=""></image>
			</view>
		</template>
		<Empty v-else class="no-data ta-c uni-list-cell-pd"></Empty>
		<view class="uni-loadmore" v-if="showLoadMore">{{loadMoreText}}</view>
		</lsSkeleton>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import lsSkeleton from '@/components/ls-skeleton/ls-skeleton.nvue';
import { onReady,onShow,onHide,onLoad,onReachBottom,onPullDownRefresh } from '@dcloudio/uni-app'
import { getOutboundList } from '@/api/outbound.js'
import Empty from "@/components/empty/empty.vue"
	const role = ref('')
	const list = ref([])
	const page = ref({
		page: 1,
		per_page: 10
	})
	const skeleton = [
	                    40,
	                    'card-sm*4',
	                    40,
	                ]
	const isLoad = ref(false)
	const loadMoreText = ref("加载中...")
	const showLoadMore = ref(false)
	const total_count = ref(0)
	
	console.log(role.value)
	onLoad(()=>{
		console.log('onLoadonLoadonLoad')
	})
	onShow(() => {
		isLoad.value= false
		page.value.page = 1
	      role.value = uni.getStorageSync('ROLE_KEY')
		  console.log('onShowonShowonShowonShow')
		getList()
	})
	onHide(()=>{
		list.value = []
	})
	const getList = async (isFresh)=>{
		try{
			const res = await getOutboundList({
				...page.value
			})
			uni.stopPullDownRefresh();
			total_count.value = res.data.total_count
			if(isFresh){
				list.value = res.data.list
			}else{
				list.value = list.value.concat(res.data.list)
			}
			isLoad.value = true
		}catch(e){
			isLoad.value = true
		}	
		
	}
	const goDetail = (item) => {
		uni.navigateTo({
			url: '/pages/delivery/detailList?item=' + JSON.stringify(item)
		})
	}
	onPullDownRefresh(()=>{
		page.value.page = 1
		getList(true)
	})
	onReachBottom(() => {
		console.log("onReachBottom",list.value.length,total_count.value);
		if (list.value.length == total_count.value) {
			loadMoreText.value = "没有更多数据了!"
			return;
		}
		page.value.page++
		showLoadMore.value = true;
		setTimeout(() => {
			getList();
		}, 300);
	})
</script>

<style lang="scss" scoped>
	.auth-item{
		height: 156rpx;
		padding: 0 32rpx;
		background: #FFFFFF;
		.left{
			border-radius: 8rpx;
			background-color: #99BBA0;
		}
		.num{
			color: #45464A;
		}
		.arrow{
			width: 48rpx;
			height: 48rpx;
		}
	}
</style>