<template>
	<view class="home-container">
		<view class="header pl-32 pr-32 ">
			<view class="fs-28 pt-4">
				{{ roleName === 'admin' ? '迪雷沃包装设计(上海)有限公司': userInfo.company_name }}
			</view>
			<view class="oprater color-subTitlle fs-24 mt-4">
				{{roleName === 'admin' ? adminTypeOption[+userInfo.type - 1] : webTypeOption[+userInfo.type - 1]}}：{{userInfo.name}}
			</view>
			<view class="welcom ta-c fs-64 mt-38">
				<image src="/static/image/welcom.png"></image>
			</view>
			<image class="icon-logout pl-10" src="/static/image/icon-logout@2x.png" @click="handleLogout"></image>
			<!-- <view class="tip2 ta-c mt-26 fs-28">
				统一包装编码 | 规格标准化 | 循坏包装
			</view> -->
		</view>
		<view class="content">
			<view class="content-item d-f bg_white ai-c pl-48 pr-32 mb-32" @click="pageTo('/pages/auth/index')">
				<image class="home-icon" src="/static/image/home-auth@2x.png" mode="aspectFit"></image>
				<view class="flex-1 ml-48">
					<view class="fs-36">
						初始认证
					</view>
					<view class="fs-28 color-subTitlle mt-8">新包装编码、外观等验收入库</view>
				</view>
				<image class="arrow" src="/static/image/home-arrow@2x.png" mode=""></image>
			</view>
			<view class="content-item d-f bg_white ai-c pl-48 pr-32 mb-32" @click="pageTo('/pages/delivery/index')">
				<image class="home-icon" src="/static/image/home-delivery@2x.png" mode="aspectFit"></image>
				<view class="flex-1 ml-48">
					<view class="fs-36">
						包装出库
					</view>
					<view class="fs-28 color-subTitlle mt-8">出库导入包装编码</view>
				</view>
				<image class="arrow" src="/static/image/home-arrow@2x.png" mode=""></image>
			</view>
			<view class="content-item d-f bg_white ai-c pl-48 pr-32 mb-32" @click="pageTo('/pages/recycle/detailList')">
				<image class="home-icon" src="/static/image/home-search@2x.png" mode="aspectFit"></image>
				<view class="flex-1 ml-48">
					<view class="fs-36">
						回收复查
					</view>
					<view class="fs-28 color-subTitlle mt-8">收到返还包装验收入库</view>
				</view>
				<image class="arrow" src="/static/image/home-arrow@2x.png" mode=""></image>
			</view>
			<view class="content-item d-f bg_white ai-c pl-48 pr-32 " @click="pageTo('/pages/report/index')">
				<image class="home-icon" src="/static/image/home-damage@2x.png" mode="aspectFit"></image>
				<view class="flex-1 ml-48">
					<view class="fs-36">
						损坏申报
					</view>
					<view class="fs-28 color-subTitlle mt-8">包装有严重损坏，请及时申报</view>
				</view>
				<image class="arrow" src="/static/image/home-arrow@2x.png" mode=""></image>
			</view>
		</view>
	</view>
</template>


<script setup>
	import { ref } from "vue"
import {logOutApi} from "@/api/common.js"
	const userInfo = ref({})
	userInfo.value = uni.getStorageSync('userInfo') ? JSON.parse(uni.getStorageSync('userInfo')) : {}
	console.log(userInfo)
	const roleName = uni.getStorageSync('ROLE_KEY') || ''
	if(!userInfo.value?.name){
		uni.reLaunch({
			url:'/pages/login/login'
		})
	}
	const webTypeOption = ['管理员','操作员','法人']
	const adminTypeOption = ['管理员','操作员','代工厂']
	const handleLogout =  ()=>{
		uni.showModal({
			title: '提示',
			content: "确定退出登录？",
			async success({confirm}){
				if(confirm){
					await logOutApi()
					uni.setStorageSync('token','')
					uni.setStorageSync('userInfo','')
					uni.reLaunch({
						url: "/pages/login/login"
					})
				}
				
			}
		})
		
	}
	const pageTo = (url) =>{
		uni.switchTab({
			url:url
		})
	}
</script>

<style lang="scss" scoped>

	.home-container{
		height: 100% !important;
		padding-top: var(--status-bar-height) ;	
		background: url('/static/image/bg-home-head@2x.png') top no-repeat;

			background-size: 750rpx 480rpx;
		.header{
			height: 324rpx;
			.welcom{
				color: #0F182C;
				width: 100%;
				image{
					width: 506rpx;
					height: 140rpx;
					margin: auto;
				}
			}
			.icon-logout{
				width: 48rpx;
				height: 48rpx;
				position: absolute;
				right: 32rpx;
				top: 96rpx;
			}
		}
		.content{
			background: url('/static/image/bg-home-content@2x.png');
			background-size: cover;
			padding: 64rpx 32rpx 0;
			color: #0F182C;
			.content-item{
				height: 194rpx;
				border-radius: 16rpx;
				.home-icon{
					width: 80rpx;
					height: 80rpx;
				}
				.arrow{
					width: 48rpx;
					height: 48rpx;
				}
			}
		}
	}
</style>