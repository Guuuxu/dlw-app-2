export const packageStatusOption = [
	{
		label: '未认证',
		value: 0,
	},
	{
		label: '已认证',
		value: 1,
	},
	{
		label: '已损坏',
		value: 2,
	},
	{
		label: '出库-租赁',
		value: 3,
	},
	{
		label: '出库-购买',
		value: 4,
	},
	{
		label: '客户已认证',
		value: 5,
	},
	{
		label: '客户出库',
		value: 6,
	},
	{
		label: '型号错误',
		value: 7,
	},
]

export const adminPkgStatusOption = [
	{
		label: '未认证',
		value: 0,
	},
	{
		label: '已认证',
		value: 1,
	},
	{
		label: '已损坏',
		value: 2,
	},
	{
		label: '已出库',
		value: 3,
	},
	{
		label: '已出库',
		value: 4,
	},
	{
		label: '已出库',
		value: 5,
	},
	{
		label: '已出库',
		value: 6,
	},
	{
		label: '型号错误',
		value: 7,
	},
]

export const webPkgStatusOption = [
	{
		label: '已损坏',
		value: 2,
	},
	{
		label: '未认证',
		value: 3,
	},
	{
		label: '未认证',
		value: 4,
	},
	{
		label: '已认证',
		value: 5,
	},
	{
		label: '已出库',
		value: 6,
	},
	{
		label: '型号错误',
		value: 7,
	},
]
export const outBoundStatusOption = [
	{
		label: '已创建',
		value: 0,
	},
	{
		label: '发送手机',
		value: 1,
	},
	{
		label: '客户收到',
		value: 2,
	},
]

export const countryCodeOptions = [
  {
    text: '+86 中国',
    value: '+86', // 中国大陆手机号码 11 位，以 1 开头
    regex: /^1[3-9]\d{9}$/,
  },
  {
    text: '+886 台湾地区(中国)',
    value: '+886', // 台湾手机号一般为 09 开头的 10 位数字，去掉 0 后是 9 位
    regex: /^9\d{8}$/,
  },
  {
    text: '+852 香港特别行政区(中国)',
    value: '+852', // 香港手机号为 8 位数字
    regex: /^\d{8}$/,
  },
  {
    text: '+853 澳门特别行政区(中国)',
    value: '+853', // 澳门手机号为 8 位数字
    regex: /^\d{8}$/,
  },
]

