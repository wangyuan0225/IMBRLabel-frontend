import { createRouter, createWebHistory } from "vue-router";
import Images from "@/views/Images.vue";
import Annotation from "@/views/Annotation.vue";
import Login from "@/views/Login.vue";
import Layout from "@/views/Layout.vue";
import UserProfile from "@/views/user/UserProfile.vue";
import UserPassword from "@/views/user/UserPassword.vue";

// 定义路由关系
const routes = [
    { path: "/", redirect: "/login" },
    {
        path: "/login",
        name: "Login",
        component: Login
    },
    {
        path: "/layout",
        name: "Layout",
        component: Layout,
        children: [
            { path: "user/profile", component: UserProfile },
            { path: "user/password", component: UserPassword },
        ]
    },
    { path: "/images", component: Images },
    {
        path: "/annotation",
        name: "Annotation",
        component: Annotation,
        props: route => ({
            imageId: route.query.imageId
        })
    }
];

// 创建路由器
const router = createRouter({
    history: createWebHistory(),
    routes: routes
});

export default router;
