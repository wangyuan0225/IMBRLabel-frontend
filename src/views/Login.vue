<script setup>
import { userRegisterService, userLoginService } from "@/api/login";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import { User, Lock } from "@element-plus/icons-vue";
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
//控制注册与登录表单的显示， 默认显示注册
const isRegister = ref(false);
const form = ref();

// 整个的用于提交的form数据对象
const formModel = ref({
  username: "",
  password: "",
  repassword: ""
});

// 整个表单的校验规则
// 1. 非空校验 required: true      message消息提示，  trigger触发校验的时机 blur change
// 2. 长度校验 min:xx, max: xx
// 3. 正则校验 pattern: 正则规则    \S 非空字符
// 4. 自定义校验 => 自己写逻辑校验 (校验函数)
//    validator: (rule, value, callback)
//    (1) rule  当前校验规则相关的信息
//    (2) value 所校验的表单元素目前的表单值
//    (3) callback 无论成功还是失败，都需要 callback 回调
//        - callback() 校验成功
//        - callback(new Error(错误信息)) 校验失败
const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 5, max: 10, message: "用户名必须是 5-10位 的字符", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      pattern: /^\S{6,15}$/,
      message: "密码必须是 6-15位 的非空字符",
      trigger: "blur"
    }
  ],
  repassword: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      pattern: /^\S{6,15}$/,
      message: "密码必须是 6-15位 的非空字符",
      trigger: "blur"
    },
    {
      validator: (rule, value, callback) => {
        // 判断 value 和 当前 form 中收集的 password 是否一致
        if (value !== formModel.value.password) {
          callback(new Error("两次输入密码不一致"));
        } else {
          callback(); // 就算校验成功，也需要callback
        }
      },
      trigger: "blur"
    }
  ]
};

const register = async () => {
  // 注册成功之前，先进行校验，校验成功 → 请求，校验失败 → 自动提示
  await form.value.validate();
  await userRegisterService(formModel.value);
  ElMessage.success("注册成功");
  isRegister.value = false;
};

const userStore = useUserStore();
const router = useRouter();

const rememberMe = ref(false); // 用于跟踪“记住我”复选框的状态

const login = async () => {
  await form.value.validate();
  const res = await userLoginService(formModel.value);
  userStore.setToken(res.data.token);

  // 如果“记住我”被勾选，将用户名和 token 保存到 localStorage
  if (rememberMe.value) {
    localStorage.setItem("username", formModel.value.username);
    localStorage.setItem("token", res.data.token);
  } else {
    sessionStorage.setItem("username", formModel.value.username);
    sessionStorage.setItem("token", res.data.token);
  }

  ElMessage.success("登录成功");
  await router.push("/layout");
};

// 进入页面时检查是否有保存的用户名和 token，并自动填充表单
if (localStorage.getItem("username")) {
  formModel.value.username = localStorage.getItem("username");
  userStore.setToken(localStorage.getItem("token"));
  await router.push("/layout");
}


// 切换的时候，重置表单内容
watch(isRegister, () => {
  formModel.value = {
    username: "",
    password: "",
    repassword: ""
  };
});
</script>

<template>
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <!-- 注册表单 -->
      <el-form :model='formModel' :rules="rules" ref="form" size="large" autocomplete="off" v-if="isRegister">
        <el-form-item>
          <h1>注册</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input v-model="formModel.username" :prefix-icon="User" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="formModel.password" :prefix-icon="Lock" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item prop="repassword">
          <el-input v-model="formModel.repassword" :prefix-icon="Lock" type="password" placeholder="请输入再次密码"></el-input>
        </el-form-item>
        <!-- 注册按钮 -->
        <el-form-item>
          <el-button @click="register" class="button" type="primary" auto-insert-space>
            注册
          </el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" :underline="false" @click="isRegister = false">
            ← 返回
          </el-link>
        </el-form-item>
      </el-form>
      <!-- 登录表单 -->
      <el-form :model="formModel" :rules="rules" ref="form" size="large" autocomplete="off" v-else>
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input v-model="formModel.username" :prefix-icon="User" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="formModel.password" name="password" :prefix-icon="Lock" type="password"
            placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item class="flex">
          <div class="flex">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>
        <!-- 登录按钮 -->
        <el-form-item>
          <el-button @click="login" class="button" type="primary" auto-insert-space>登录
          </el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" :underline="false" @click="isRegister = true">
            注册 →
          </el-link>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
/* 样式 */
.login-page {
  height: 100vh;
  background-color: #fff;

  .bg {
    background: url('../assets/login_bg.png') no-repeat center / cover;
    border-radius: 0 20px 20px 0;
  }

  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;

    .title {
      margin: 0 auto;
    }

    .button {
      width: 100%;
    }

    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>