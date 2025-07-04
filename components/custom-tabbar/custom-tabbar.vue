<template>
  <view class="custom-tabbar d-f pb-15 pt-10 safe-area-bottom bg-white">
    <view
      v-for="(item, index) in filteredTabs"
      :key="index"
      @click="switchTab(item)"
      class="flex-1 d-f jc-c ai-c flex-col uni-secondary-color"
      :class="['tab-item', { active: currentPath === item.pagePath }]"
    >
      <image
        class="icon-tabbar"
        :src="
          currentPath === item.pagePath ? item.selectedIconPath : item.iconPath
        "
      />
      <text class="mt-6">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { onShow } from '@dcloudio/uni-app'

const store = useStore()
const currentPath = ref('')

// 从 Vuex 获取配置
const tabList = [
  {
    pagePath: 'pages/auth/index',
    iconPath: '/static/image/tabbar-auth@2x.png',
    selectedIconPath: '/static/image/tabbar-auth-active@2x.png',
    text: '初始认证',
  },
  {
    pagePath: 'pages/delivery/index',
    iconPath: '/static/image/tabbar-delivery@2x.png',
    selectedIconPath: '/static/image/tabbar-delivery-active@2x.png',
    text: '包装出库',
  },
  {
    pagePath: 'pages/index/index',
    iconPath: '/static/image/tabbar-home-active@2x.png',
    selectedIconPath: '/static/image/tabbar-home-active@2x.png',
    text: '主页',
  },
  {
    pagePath: 'pages/recycle/detailList',
    iconPath: '/static/image/tabbar-recycle@2x.png',
    selectedIconPath: '/static/image/tabbar-recycle-active@2x.png',
    text: '回收复查',
    roles: [0, 1, 2], // 超级管理员 管理员 操作员
  },
  {
    pagePath: 'pages/report/index',
    iconPath: '/static/image/tabbar-report@2x.png',
    selectedIconPath: '/static/image/tabbar-report-active@2x.png',
    text: '损坏申报',
    roles: [0, 1, 2], // 超级管理员 管理员 操作员
  },
]

const roleName = uni.getStorageSync('ROLE_KEY') || ''
// 权限过滤后的 tab 列表
const filteredTabs = computed(() => {
  const userInfo = uni.getStorageSync('userInfo')
    ? JSON.parse(uni.getStorageSync('userInfo'))
    : {}
	if(roleName === 'admin'){
		return tabList.filter(
		  (item) => !item?.roles || item?.roles?.includes(userInfo.type)
		)
	}else{
		return tabList
	}
  
})

// 显示控制
const showTabBar = computed(() => store.getters.shouldShowTabBar)

// 路由监听
const updatePath = () => {
  console.log(getCurrentPages().pop())
  currentPath.value = getCurrentPages().pop()?.route || ''
}

onShow(updatePath)
onMounted(() => {
  uni.$on('switchTab', updatePath)
})

// 切换逻辑
const switchTab = (item) => {
  uni.reLaunch({ url: '/' + item.pagePath })
}
</script>
<style lang="scss" scoped>
.custom-tabbar {
  position: fixed;
  width: 100%;
  bottom: 0;
  .tab-item{
	  &.active{
		color: $uni-text-color;
	  }
  }
}
.icon-tabbar {
  width: 48rpx;
  height: 48rpx;
}
</style>
