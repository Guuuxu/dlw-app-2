<template>
  <view class="container h_100">
    <view class="login-content" v-if="step === 1">
      <view class="login-title">登录迪雷沃</view>
      <view class="login-subtitle">请输入您的手机号码</view>
      <v-tabs
        style="font-size: 36rpx"
        v-model="role"
        :tabs="tabs"
        @change="changeRole"
        bgColor="transport"
        lineColor="#99BBA0"
        activeColor="#99BBA0"
      ></v-tabs>

      <view class="input-container uni-common-mt">
        <uni-data-select
          class="code-select"
          v-model="countryCode"
          :localdata="countryCodeOptions"
        >
        </uni-data-select>
        <input
          class="custom-input pl-20"
          type="tel"
          v-model="phone"
          placeholder="请输入手机号"
          placeholderStyle="color: #C8C9CC; font-size: 32rpx;padding-left:20rpx"
        />
      </view>

      <button
        class="verify-btn"
        :disabled="!isValidPhone"
        @click="getVerifyCode"
      >
        获取验证码
      </button>

      <view class="agreement">
        <checkbox-group style="width: auto" @change="checkboxChange">
          <checkbox
            style="border-radius: 50%"
            color="#99BBA0"
            activeBorderColor="#99BBA0"
            value="true"
            iconColor="#99BBA0"
            borderColor="99BBA0"
            :checked="agreed"
          />
        </checkbox-group>
        <text class="agreement-text">
          我已阅读并同意
          <text class="link" @click="openAgreement">《用户协议》</text>
        </text>
      </view>
    </view>
    <template v-else>
      <view class="header">
        <text class="title">输入验证码</text>
        <text class="subtitle"
          >验证码已发送{{
            phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : ''
          }}</text
        >
      </view>

      <view class="code-input-container">
        <input
          v-for="(item, index) in 6"
          :key="index"
          type="number"
          maxlength="1"
          :value="codeValue[index] || ''"
          @input="(e) => handleInput(e, index)"
          @focus="handleFocus(index)"
          class="code-input"
          :class="{ 'code-input-focus': currentFocus === index }"
          :focus="currentFocus === index"
          :ref="(el) => (inputRefs[index] = el)"
        />
      </view>

      <view class="countdown-container">
        <text v-if="countdown > 0" class="countdown-text"
          >{{ countdown }} 秒后重新获取验证码</text
        >
        <button v-else @tap="resendCode" class="resend-button ta-r">
          {{ countdown > 0 ? countdown : '' }}重新获取验证码
        </button>
      </view>
    </template>
	<!-- <view class="copyright">版权所有© 2025迪雷沃包装设计(上海)有限公司</view> -->
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { loginApi, getUserInfo, sendSMS } from '@/api/common.js'
import { countryCodeOptions } from '@/utils/dict.js'
const countryCode = ref('')
const step = ref(1)
const phone = ref('')
const agreed = ref(false)
const tabs = ['客户端', '管理端']
const role = ref('0')
console.log('show', role.value)
uni.setStorageSync('ROLE_KEY', 'web')
const changeRole = (e) => {
  console.log(e)
  role.value = e // 更新选中状态
  const key = e == '0' ? 'web' : 'admin'
  uni.setStorageSync('ROLE_KEY', key)
}
const isValidPhone = computed(() => {
  const currentCountryCode = countryCodeOptions.find(
    (item) => item.value === countryCode.value
  )
  console.log('currentCountryCode', currentCountryCode)
  if (currentCountryCode) {
    return currentCountryCode.regex.test(phone.value)
  }
  return false
})
const checkboxChange = (e) => {
  agreed.value = e.detail.value[0] === 'true' // 更新选中状态
}
const getVerifyCode = async () => {
  if (!agreed.value) {
    uni.showToast({
      title: '请先同意用户协议',
      icon: 'none',
    })
    return
  }

  if (!isValidPhone.value) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none',
    })
    return
  }
  try {
    await sendSMS(phone.value, countryCode.value)
    countdown.value = 60
    // 发送验证码逻辑
    uni.showToast({
      title: '验证码已发送',
      icon: 'success',
    })
    startCountdown()
    step.value = 2
  } catch (error) {
    //TODO handle the exception
  }
}

const openAgreement = () => {
  uni.navigateTo({
    url: '/pages/login/agreement',
  })
}

const codeValue = ref<string[]>([])
const currentFocus = ref(0)
const countdown = ref(0)
let timer: number | null = null
const inputRefs = ref<any[]>([])

const handleInput = async (event: any, index: number) => {
  const value = event.detail.value
  console.log('value', value)
  if (value.length > 1) {
    const values = value.split('')
    values.forEach((v: string, i: number) => {
      if (index + i < 6) {
        codeValue.value[index + i] = v
        currentFocus.value = index + i
      }
    })
    const nextEmptyIndex = codeValue.value.findIndex((v, i) => !v && i >= index)
    console.log(nextEmptyIndex)
    if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
      currentFocus.value = nextEmptyIndex
    }
  } else {
    codeValue.value[index] = value

    if (value && index < 5) {
      currentFocus.value = index + 1
    } else if (!value && index > 0) {
      currentFocus.value = index - 1
    } else {
      console.log(codeValue.value)
      if (codeValue.value.length && index) {
        const res = await loginApi({
          phone: phone.value,
          code: codeValue.value.join(''),
        })
        console.log('res', res)
        console.log('index', index)
        uni.setStorageSync('token', res.data.accessToken)
        uni.setStorageSync('userInfo', JSON.stringify(res.data.user))
        uni.showToast({
          title: '登录成功',
          success() {
            uni.reLaunch({
              url: '/pages/index/index',
            })
          },
        })
      }
    }
  }
}

const handleFocus = (index: number) => {
  currentFocus.value = index
}

const startCountdown = () => {
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, 1000)
}

const resendCode = () => {
  if (countdown.value === 0) {
    startCountdown()
    uni.showToast({
      title: '验证码已重新发送',
      icon: 'none',
    })
  }
}

onMounted(() => {
  // startCountdown();
})

onUnmounted(() => {
  if (timer) {
    countdown.value = 60
    clearInterval(timer)
  }
})
</script>

<style lang="scss">
page {
  height: 100vh !important;
}

.custom-input {
  height: 96rpx;
  border-radius: 48rpx;
  border: #8bae9d 2rpx solid;
  ::v-deep .is-input-border {
    border-radius: 48rpx !important;
  }

  ::v-deep .uni-easyinput__content-input {
    font-size: 32rpx;
    height: 96rpx !important;

    .uni-input-wrapper {
      padding-left: 20rpx;
    }
  }
}
.code-select {
  margin-bottom: 10rpx;
  ::v-deep {
    .uni-stat-box {
      background-color: transparent;
    }
    .uni-select {
      height: 96rpx !important;
      padding-left: 40rpx;
      padding-right: 20rpx;
      border-radius: 48rpx !important;
      border: #8bae9d 2rpx solid;
      .uni-select__input-placeholder {
        font-size: 32rpx;
        color: rgb(200, 201, 204);
      }
    }
  }
}
.container {
  padding: 40rpx;
  min-height: 100%;
  background: url('/static/image/bg-login@2x.png') center no-repeat;
  background-size: cover;

  .login-content {
    width: 100%;
    margin-top: 160rpx;

    .login-title {
      font-size: 32px;
      font-weight: 600;
      color: #333333;
      margin-bottom: 20rpx;
    }

    .login-subtitle {
      font-size: 32rpx;
      color: #999999;
      margin-bottom: 60rpx;
    }

    .input-container {
      margin-bottom: 40rpx;
    }

    .verify-btn {
      width: 100% !important;
      height: 96rpx;
      line-height: 96rpx;
      background-color: #8bae9d;
      color: #ffffff;
      font-size: 32rpx;
      border-radius: 44rpx;
      border: none;
      margin-bottom: 40rpx;
    }

    .verify-btn[disabled] {
      background-color: #cccccc !important;
      color: #ffffff !important;
      border: none;

      &::after {
        border: none;
      }
    }

    .agreement {
      display: flex;
      align-items: center;
      ::v-deep {
        .uni-checkbox-input {
          border-radius: 50%;
        }
      }
    }

    .agreement-text {
      font-size: 28rpx;
      color: #999999;
    }

    .link {
      color: #8bae9d;
    }
  }
}

.header {
  width: 100%;
  margin-bottom: 80rpx;
  padding-top: 168rpx;
}

.title {
  display: block;
  font-size: 64rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20rpx;
}

.subtitle {
  display: block;
  font-size: 32rpx;
  color: #a7b0bf;
}

.code-input-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 80rpx;
}

.code-input {
  width: 80rpx;
  height: 80rpx;
  text-align: center;
  font-size: 20px;
  color: #333333;
  border: 1px solid #e5e5e5;
  border-radius: 16rpx;
}

.code-input-focus {
  border: 2px solid #99bba0;
  caret-color: #99bba0;
}

.countdown-container {
}

.countdown-text {
  font-size: 14px;
  color: #999999;
}

.resend-button {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
  background: none;
  border: none;
  padding: 0;
}

.resend-button::after {
  border: none;
}
::v-deep {
  .uni-checkbox-input {
    width: 15px;
    height: 15px;
    &:hover {
      border-color: #99bba0;
    }
  }
  uni-checkbox:not([disabled]) .uni-checkbox-input:hover {
    border-color: #99bba0;
  }
}
.copyright{
	position: fixed;
	bottom: 0;
	text-align: center;
	left: 0;
	right: 0;
}
</style>
