import request from '@/utils/request.js'

// 注册接口
export const userRegisterService = ({ username, password, repassword }) =>
    request.post('/user/register', { username, password, repassword })

// 登录接口
export const userLoginService = ({ username, password }) =>
    request.post('/user/login', { username, password })