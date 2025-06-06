import http from '@/utils/request.js';

/** 
 *  客户列表
 */
export const getClientList = () => {
	return http.get('/clientList')
}

