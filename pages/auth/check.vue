<template>
	<view class="check-container">

		<view class="check-content bg_white ">

			<view class="check-info w_100 ta-c pb-48">
				<view class="title">
					{{row.order_no}}
				</view>
				<view class="sub mt-16">
					<text class="color-subTitlle">数量：</text>
					<text class="num">{{row.total_count}}</text>

				</view>
			</view>
			<view class="mt-48 fs-32">
				<uni-forms class="check-form" ref="valiForm" :model="formData" :rules="rules" label-position="top" label-width="250px">
					<uni-forms-item class="fs-32" label="1、请确认包装型号是否正确？" name="isCateCorrect" required>
						<radio-group @change="changeCategory">
						  <label class="radio">
						    <radio 
						      value="1" 
						      :checked="formData.isCateCorrect === '1'" 
						      color="#99BBA0" 
						      checked-color="#99BBA0" 
						    />是
						  </label>
						  <label class="radio">
						    <radio 
						      value="2" 
						      :checked="formData.isCateCorrect === '2'" 
						      color="#99BBA0" 
						      checked-color="#99BBA0" 
						    />否
						  </label>
						</radio-group>
					</uni-forms-item>
					<uni-forms-item label="2、请确认包装数量是否正确？" name="quantity" required>
						<radio-group @change="changeQuantity">
						  <label class="radio">
						    <radio 
						      value="1" 
						      :checked="formData.quantity === '1'" 
						      color="#99BBA0" 
						      checked-color="#99BBA0" 
						    />是
						  </label>
						  <label class="radio">
						    <radio 
						      value="2" 
						      :checked="formData.quantity === '2'" 
						      color="#99BBA0" 
						      checked-color="#99BBA0" 
						    />否
						  </label>
						</radio-group>
						
					</uni-forms-item>
					<uni-forms-item required name="ambiguity" label="3、请确认是否有疑品包装？">
						<radio-group @change="changeAmbiguity">
						  <label class="radio">
						    <radio 
						      value="1" 
						      :checked="formData.ambiguity === '1'" 
						      color="#99BBA0" 
						      checked-color="#99BBA0" 
						    />是
						  </label>
						  <label class="radio">
						    <radio 
						      value="2" 
						      :checked="formData.ambiguity === '2'" 
						      color="#99BBA0" 
						      checked-color="#99BBA0" 
						    />否
						  </label>
						</radio-group>
						<!-- <radio-group @change="changeAmbiguity"
							@blur="(e)=>$refs.input.onFieldChange($event.detail.value)">
							<label class="radio">
								<radio value="1" color="#99BBA0" backgroundColor="#99BBA0" borderColor="#99BBA0" activeBackgroundColor="#99BBA0" activeBorderColor="#99BBA0" iconColor="#99BBA0" />是
							</label>
							<label class="radio">
								<radio value="2" color="#99BBA0" backgroundColor="#99BBA0" borderColor="#99BBA0" activeBackgroundColor="#99BBA0" activeBorderColor="#99BBA0" iconColor="#99BBA0" />否
							</label>
						</radio-group> -->
					</uni-forms-item>
				</uni-forms>
			</view>
		</view>
		<view class="w_100 mt-48">
			<button class="custom-btn" @click="handleNext('valiForm')">下一步</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		getCurrentInstance
	} from 'vue';
	// 获取当前组件实例
	    const { ctx } = getCurrentInstance();
	import {
		onLoad,
		onReachBottom
	} from "@dcloudio/uni-app";
	import {
		authConfirm
	} from '@/api/auth.js'

	const formData = ref({})
	// 校验规则
	const rules = {
		isCateCorrect: {
			rules: [{
				required: true,
				errorMessage: '请选择'
			}]
		},
		quantity: {
			rules: [{
				required: true,
				errorMessage: '请选择'
			}]
		},
		ambiguity: {
			rules: [{
				required: true,
				errorMessage: '请选择'
			}]
		}

	}
	const row = ref({})
	onLoad((option) => {
		console.log('option', option)
		row.value = option.item ? JSON.parse(option.item) : {}

	})

	const changeCategory = (e) => {
		console.log(e)
		formData.value.isCateCorrect = e.detail.value
	}
	const changeQuantity = (e) => {
		console.log(e)
		formData.value.quantity = e.detail.value
	}
	const changeAmbiguity = (e) => {
		console.log(e)
		formData.value.ambiguity = e.detail.value
	}
	const submit =(ref)=> {
					
				}
	// 下一步
	const handleNext =  async(ref) => {
		// 包装型号、数量正确
		console.log('formData', formData)
		if(!formData.value?.isCateCorrect){
			uni.showToast({
				title: '请确认包装型号',
				icon: 'none'
			})
			return
		}
		if(!formData.value?.isCateCorrect){
			uni.showToast({
				title: '请确认包装数量',
				icon: 'none'
			})
			return
		}
		if(!formData.value?.ambiguity){
			uni.showToast({
				title: '请确认是否有疑品',
				icon: 'none'
			})
			return
		}
		if (formData.value.isCateCorrect === '1' && formData.value.quantity === '1') {
			// 有疑品
			if (formData.value.ambiguity === '1') {
				uni.navigateTo({
					url: '/pages/auth/authError?errorType=' + 3
				})
			} else {
				// 无疑品
				await authConfirm(row.value.id);
				uni.navigateTo({
					url: '/pages/auth/authError?errorType=' + 0
				})
			}
		} else {
			// ElMessage.error('包装型号、数量任意⼀项不正确');
		
			uni.navigateTo({
				url: '/pages/auth/detailList?item=' + JSON.stringify(row.value)
			})
		}
		// ctx.$refs[ref].validate().then(async res => {
		// 	console.log('success', res);
			
		// }).catch(err => {
		// 	console.log('err', err);
		// })
		

	}
</script>

<style lang="scss" scoped>
	page {
		background: url('/static/image/bg-auth-check@2x.png') top no-repeat;
		background-size: contain;
	}

	.check-container {
		padding: 24rpx 32rpx;
	}

	.check-content {
		border-radius: 16rpx;
		padding: 48rpx 32rpx;
		font-size: 32rpx;
		color: #0F182C;

		.check-info {
			border-bottom: 2rpx solid #EAEAEA;

			.num {
				color: #99BBA0;
			}
		}

		.check-form {
			::v-deep {
				.uni-forms-item__label {
					font-size: 32rpx;
				}
				.uni-radio-input{
					width: 18px;
					height: 18px;
				}
				.uni-radio-input{
					&:hover{
						border-color:#99BBA0
					}
				}
			}
		}
	}
</style>