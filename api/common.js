import http from '@/utils/request.js';

export const loginApi = ({phone,code}) =>{
	return http.post('/login', { phone,code })
}

export const uploadApi = (filePath) =>{
	return http.upload('/upload', filePath, 'file')
}


export const sendSMS = (phone) =>{
	return http.post('/sendSMS', { phone })
}

// 用户信息
export const getUserInfo= () =>{
	return http.get('/user')
}

// 登出
export const logOutApi = () =>{
	return http.post('/logout', )
}

// POST 请求
// http.post('/api/login', { username: 'admin', password: '123456' })
//   .then(data => {
//     console.log('登录成功', data)
//   })
//   .catch(error => {
//     console.error('登录失败', error)
//   })

// // 上传文件
// http.upload('/api/upload', filePath, 'avatar', { userId: 123 })
//   .then(data => {
//     console.log('上传成功', data)
//   })
//   .catch(error => {
//     console.error('上传失败', error)
//   })