import "./assets/main.scss";

import router from "@/router";
import {createApp} from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import locale from "element-plus/dist/locale/zh-cn.js";
import pinia from "@/stores/index";

const app = createApp(App);
app.use(router);
app.mount("#app");
app.use(ElementPlus, {locale});
app.use(pinia);
