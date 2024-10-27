// stores/user.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { userGetInfoService } from '@/api/user';

export const useUserStore = defineStore('big-user', () => {
  const token = ref('');
  const userid = ref('');
  const user = ref({});

  const setToken = (newToken) => {
    token.value = newToken;
  };

  const removeToken = () => {
    token.value = '';
  };

  const setUserid = (newUserid) => {
    userid.value = newUserid;
  };

  const getUser = async () => {
    try {
      const res = await userGetInfoService();
      user.value = res.data.data;
      setUserid(user.value.user_id);
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  const setUser = (obj) => {
    user.value = obj;
    setUserid(obj.userid);
  };

  return {
    token,
    userid,
    setToken,
    removeToken,
    setUserid,
    user,
    getUser,
    setUser,
  };
}, {
  persist: {
    paths: ['token'] // 持久化 token
  }
});
