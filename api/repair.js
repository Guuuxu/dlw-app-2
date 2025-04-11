import http from '@/utils/request.js';

/** 扫码
 *  
 */
export const scanRepair = (detail_no) => {
	return http.post('/repair/scan', { detail_no })
}

/** 新增/编辑
 * model_detail_id, 明细id
	broken_reason, 原因类型
	reason, 原因说明
	main_img,
	first_img,
	second_img
 */
export const updateRepair = ({
	model_detail_id, 
	broken_reason,
	reason,
	main_img,
	first_img,
	second_img
}) => {
	return http.post(`/repair/store`, {
		model_detail_id,
		broken_reason,
		reason,
		main_img,
		first_img,
		second_img
	})
}