import http from '@/utils/request.js';

/** 出库列表
 *  
 */
export const getOutboundList = ({page,per_page}) =>{
	return http.get('/bound/outbound/mobile', { page,per_page })
}

/** 出库明细
 *  
 */
export const getOutboundDetail = (id) =>{
	return http.get(`/bound/outbound/${id}`)
}

/** 扫码
 *  detail_no 明细编号
 */
export const scanOutbound = ({outbound,detail_no}) =>{
	return http.post(`/bound/outbound/${outbound}/scan/mobile`, { detail_no })
}

/** 继续使用包装
 *  detail 出库详情id
 */
export const usePacakge = ({outbound,detail_no,force}) =>{
	return http.post(`/bound/outbound/${outbound}/scan`,{detail_no,force})
}
