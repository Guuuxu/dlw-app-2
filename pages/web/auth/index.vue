<template>
	<view class="auth-container pt-16">
		<template v-if="list.length">
			<view class="auth-item d-f ai-c" v-for="(item,index) in list" :key="item.id"  @click="goCheck(item)" >
				<view class="left w-80 h-80 uni-white d-f ai-c jc-c uni-bold fs-40">
					{{index+1}}
				</view>
				<view class="middle flex-1 ml-24">
					<view class="title ellipsis_1  fs-32" style="width: 500rpx;">
						<text v-if="role == 'web'">{{item.order_no}}</text>
						<text v-else>{{item.type_name}}#{{ item.start_no }} - {{item.end_no}}</text>
					</view>
					<view class="sub  fs-24">
						<text class="color-subTitlle">数量：</text>
						<text class="num">{{item.total_count}}</text>
						
					</view>
				</view>
				<image class="arrow" src="/static/image/home-arrow@2x.png" mode=""></image>
			</view>
		</template>
		
		<Empty v-else class="no-data ta-c uni-list-cell-pd"></Empty>
		<view class="uni-loadmore" v-if="showLoadMore">{{loadMoreText}}</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
import { getBoundList } from '@/api/auth.js'
import Empty from "@/components/empty/empty.vue"
import { onReady,onShow,onLoad,onReachBottom,onPullDownRefresh,onUnload } from '@dcloudio/uni-app'
	const page = ref({
		page: 1,
		per_page: 10
	})
	const list = ref([])
	const role = ref('')
	const verified_count = ref(0)
	const total_count = ref(0)
	const loadMoreText =  ref("加载中...")
	const showLoadMore = ref(false)
	
	onShow(()=>{
		list.value = []
		role.value = uni.getStorageSync('ROLE_KEY')
		console.log('onShowonShowonShow',role.value)
		
		init()
	})
	onUnload(()=>{
		list.value = []
	})
	const goCheck = (item) => {
		
		console.log(item)
		const url = role.value === 'admin' ? '/pages/auth/detailList?' : '/pages/auth/check?'
		uni.navigateTo({
			url: `${url}?item=${JSON.stringify(item)}`,
		})
	}
	const init = async (isFresh) =>{
		const res = await getBoundList({
			...page.value,
			type_name: ''
		})
		
		uni.stopPullDownRefresh();
		if(isFresh){
			list.value = res.data.list
		}else{
			list.value = list.value.concat(res.data.list)
		}
		console.log(list.value)
		total_count.value = res.data.total_count
	}
	onPullDownRefresh(()=>{
		page.value.page = 1
		init(true)
	})
	onReachBottom(()=>{
		console.log(list.value.length,total_count.value);
		if (list.value.length === total_count.value) {
			console.log('没有更多数据了');
			loadMoreText.value = "没有更多数据了!"
			showLoadMore.value = true;
			return;
		}
		showLoadMore.value = true;
		console.log('onReachBottom')
		++page.value.page
		init()
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