import {createRouter, createWebHistory} from "vue-router";
import Images from "@/views/Images.vue";
import Annotation from "@/views/Annotation.vue";

// 定义路由关系
const routes = [
    {path: "/", redirect: "/images"},
    {path: "/images", component: Images},
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
