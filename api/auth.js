import http from '@/utils/request.js';

const pageParams = {
	page: 1,
	per_page: 10
}
// 新品列表
export const getBoundList = ({
	page,
	per_page,
	type_name
}) => {
	return http.get('/bound/inbound', {
		page,
		per_page,
		type_name
	})
}

// 扫描结果
export const getScanResult = (inbound) => {
	return http.get(`/bound/inbound/${inbound}/result`, )
}

// admin扫码
/**
 * id 初始认证id 新品id/维修id/回收时不传
 * type 认证类型 1新品 2维修 3回收
 * detail_no 详情编码
 */
export const scanAdmin = ({
	id,
	type,
	detail_no
}) => {
	return http.post('/bound/inbound/scan', {
		id,
		type,
		detail_no
	})
}


/** customer 初始认证确认
 * outbound
 * detail_no 详情编码
 */
export const authConfirm = (outbound) => {
	return http.post(`/bound/inbound/${outbound}/confirm`, {})
}

// customer扫码
/**
 * outbound
 * detail_no 详情编码
 */
export const scanCustomer = ({
	outbound,
	detail_no
}) => {
	return http.post(`/bound/inbound/${outbound}/scan`, {
		detail_no
	})
}

/** web:回收扫码
 * detail_no 详情编码
 */
export const scanRecycle = ({
	detail_no
}) => {
	return http.post(`/bound/inbound/recycle`, {
		detail_no
	})
}