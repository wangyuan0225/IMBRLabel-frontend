import request from '@/utils/request.js'
import { useUserStore } from '@/stores'

// 获取用户基本信息
export const userGetInfoService = () => request.get('/user/info')

// 更新用户基本信息
export const userUpdateInfoService = ({ nickname, email }) =>
  request.put('/user/info', { nickname, email })

// 更新用户密码
export const userUpdatePasswordService = ({ old_pwd, new_pwd, re_pwd }) => {
  const userStore = useUserStore();
  const token = userStore.token;

  return request.patch('/user/updatePwd', 
    { old_pwd, new_pwd, re_pwd },
    {
      headers: {
        token: `Bearer ${token}` // 确保 token 格式正确
      }
    }
  );
}
