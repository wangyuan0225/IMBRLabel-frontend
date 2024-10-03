import { createRouter, createWebHistory } from "vue-router";
import Images from "@/views/Images.vue";
import Annotation from "@/views/Annotation.vue";
import Login from "@/views/Login.vue";

// 定义路由关系
const routes = [
    { path: "/", redirect: "/login" },
    { path: "/images", component: Images },
    {
        path: "/login",
        name: "Login",
        component: Login
    },
    {
        path: "/annotation",
        name: "Annotation",
        component: Annotation,
        props: route => ({
            imagePath: route.query.imagePath,
            imageId: route.query.imageId,
            imageName: route.query.imageName,
            annotations: route.query.annotations
        })
    }
];

// 创建路由器
const router = createRouter({
    history: createWebHistory(),
    routes: routes
});

export default router;
