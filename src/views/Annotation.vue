<script setup>
import { onMounted, ref, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router"; // 引入 useRouter
import CanvasSelect from "canvas-select";
import { addAnnotation, addAnnotationToImage, exportAnnotations, getTemplates } from "@/api/annotation.js";
import { ElMessage } from "element-plus";
import { FullScreen, Hide, Pointer, Upload } from "@element-plus/icons-vue";

let instance;
const route = useRoute();
const router = useRouter(); // 使用 useRouter
const imagePath = ref(decodeURIComponent(route.query.imagePath));
const imageId = ref(route.query.imageId);
const imageName = ref(route.query.imageName);

// 初始化已有的标注信息
let outputRef = ref(null);
const selectedShape = ref(null);
const history = ref([]);
const redoStack = ref([]);
const annotations = ref([]); // 用来保存所有标注的数据
const templates = ref([]); // 用来保存模板列表
const templateName = ref(""); // 模板名
const isHidden = ref(false);
// 定义createType，用于追踪当前绘制类型
const createType = ref(0);

let saveHistoryTimeout = null; // 保存历史记录的防抖定时器

onMounted(() => {
  instance = new CanvasSelect(".container", imagePath.value);
  instance.labelMaxLen = 10;

  // 初始化 annotations，确保它是一个数组
  if (route.query.annotations) {
    instance.setData(JSON.parse(decodeURIComponent(route.query.annotations))); // 传递标注数据给 CanvasSelect
  } else {
    instance.setData([]);
  }

  // 初始化 createType
  createType.value = instance.createType;

  // 获取模板列表
  fetchTemplates();
  // 更新 output 内容
  updateOutput();

  // 监听 createType 变化
  instance.on("typeChange", (type) => {
    createType.value = type;
  });

  instance.on("load", (src) => {
    console.log("image loaded", src);
  });
  instance.on("add", (info) => {
    console.log("add", info);
    triggerSaveHistory();
  });
  instance.on("delete", (info) => {
    console.log("delete", info);
    triggerSaveHistory();
  });
  instance.on("select", (shape) => {
    selectedShape.value = shape;
  });
  instance.on("updated", (result) => {
    annotations.value = result;
    triggerSaveHistory();
    updateOutput(); // 更新 output 内容
  });

  window.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
  clearTimeout(saveHistoryTimeout); // 清除定时器
});

function handleKeyDown(event) {
  if (event.ctrlKey && event.key === "z") {
    undo();
  } else if (event.ctrlKey && event.key === "y") {
    redo();
  } else if (event.ctrlKey && event.shiftKey && event.key === "S") {
    update();
  }
}

// 更新 output 的内容
function updateOutput() {
  if (outputRef.value) {
    outputRef.value.value = JSON.stringify(annotations.value, null, 2);
  }
}

// 防抖机制，只有在停止输入 0.1 秒后才保存历史记录
function triggerSaveHistory() {
  clearTimeout(saveHistoryTimeout);
  saveHistoryTimeout = setTimeout(() => {
    saveHistory();
  }, 100); // 0.1 秒后保存
}

// 保存当前的状态
function saveHistory() {
  const currentState = {
    data: JSON.parse(JSON.stringify(annotations.value)), // 深拷贝保存标注数据
    output: outputRef.value ? outputRef.value : ""
  };
  if (
      history.value.length === 0 ||
      JSON.stringify(history.value[history.value.length - 1]) !==
      JSON.stringify(currentState)
  ) {
    history.value.push(currentState);
    redoStack.value = [];
  }
}

function undo() {
  if (history.value.length > 1) {
    redoStack.value.push(history.value.pop());
    const previousState = history.value[history.value.length - 1];
    annotations.value = JSON.parse(JSON.stringify(previousState.data)); // 恢复标注数据
    instance.setData(annotations.value);
    if (outputRef.value) {
      outputRef.value.value = previousState.output;
    }
  }
}

function redo() {
  annotations.value = []; // 清空标注数据
  instance.setData(annotations.value);
  if (outputRef.value) {
    outputRef.value.value = JSON.stringify(annotations.value, null, 2);
  }
}

function change(type) {
  instance.createType = type;
  createType.value = type;
}

function fitting() {
  instance.fitZoom();
}

function onFocus() {
  isHidden.value = !isHidden.value;
  instance.setFocusMode(!instance.focusMode);
}

function update() {
  addAnnotationToImage(imageId.value, encodeURIComponent(JSON.stringify(annotations.value)));
  ElMessage.success("标注数据已保存");
  // 更新 route.query.imagePath
  const newAnnotations = encodeURIComponent(JSON.stringify(annotations.value));
  router.replace({ query: { ...route.query, annotations: newAnnotations } });
}

function exportJson() {
  handleExport("json");
}

function exportXml() {
  handleExport("xml");
}

function exportCsv() {
  handleExport("csv");
}

function handleExport(type) {
  exportAnnotations(imageId.value, type).then(result => {
    console.log(result);
    const blob = new Blob([result.data], {type: "text/plain;charset=utf-8"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    console.log(imageName.value);
    link.download = `${imageName.value}.${type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

function saveAsTemplate() {
  if (selectedShape.value) {
    const templateData = {
      name: templateName.value,
      label: selectedShape.value.label,
      strokeStyle: selectedShape.value.strokeStyle,
      fillStyle: selectedShape.value.fillStyle,
      lineWidth: selectedShape.value.lineWidth
    };
    addAnnotation(templateData).then(response => {
      console.log("Template saved:", response);
      fetchTemplates(); // Refresh the template list
    }).catch(error => {
      console.error("Error saving template:", error);
    });
  } else {
    console.error("No shape selected to save as template.");
  }
}

// 获取模板列表
function fetchTemplates() {
  getTemplates().then(response => {
    templates.value = response.data;
  }).catch(error => {
    console.error("Error fetching templates:", error);
  });
}

// 应用模板
function applyTemplate(template) {
  if (selectedShape.value) {
    selectedShape.value.label = template.label;
    selectedShape.value.strokeStyle = template.strokeStyle;
    selectedShape.value.fillStyle = template.fillStyle;
    selectedShape.value.lineWidth = template.lineWidth;
    instance.update();
    triggerSaveHistory();
  } else {
    console.error("No shape selected to apply template.");
  }
}

// Watch for changes in label
watch(() => selectedShape.value?.label, (newVal) => {
  if (selectedShape.value) {
    selectedShape.value.label = newVal;
    instance.update();
  }
});

watch(() => selectedShape.value?.strokeStyle, (newVal) => {
  if (selectedShape.value) {
    selectedShape.value.strokeStyle = newVal;
    instance.update();
  }
});

watch(() => selectedShape.value?.fillStyle, (newVal) => {
  if (selectedShape.value) {
    selectedShape.value.fillStyle = newVal;
    instance.update();
  }
});

watch(() => selectedShape.value?.lineWidth, (newVal) => {
  if (selectedShape.value) {
    selectedShape.value.lineWidth = newVal;
    instance.update();
  }
});

</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header style="margin-left: 200px;">
        <div style="margin-top: 30px;">
          <el-button @click="change(1)" :type="createType === 1 ? 'primary' : 'default'">矩形</el-button>
          <el-button @click="change(2)" :type="createType === 2 ? 'primary' : 'default'">自定义多边形</el-button>
          <el-button @click="change(3)" :type="createType === 3 ? 'primary' : 'default'">点</el-button>
          <el-button @click="change(4)" :type="createType === 4 ? 'primary' : 'default'">线</el-button>
          <el-button @click="change(5)" :type="createType === 5 ? 'primary' : 'default'">圆</el-button>
          <el-button @click="change(0)" :type="createType === 0 ? 'primary' : 'default'" :icon="Pointer" ></el-button>
          <el-button :icon="FullScreen" @click="fitting()"></el-button>
          <el-button
              @click="onFocus()"
              :icon="Hide"
              :type="isHidden ? 'primary' : 'default'"
          >
          </el-button>
          <el-button :icon="Upload" type="success" @click="update()"></el-button>
          <el-button @click="exportJson()">导出为json</el-button>
          <el-button @click="exportXml()">导出为xml</el-button>
          <el-button @click="exportCsv()">导出为csv</el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="50px">
        </el-aside>
        <el-main>
          <div class="box">
            <div class="left">
              <canvas class="container"></canvas>
            </div>
            <div class="right">
              <div v-if="selectedShape">
                <h3>编辑标注属性值</h3>
                <div style="margin-bottom: 10px">
                  <label style="margin-right: 25px;">标签:</label>
                  <el-input v-model="selectedShape.label" clearable style="width: 150px;"/>
                </div>
                <div style="margin-bottom: 10px">
                  <label style="margin-right: 10px;">边线颜色:</label>
                  <el-color-picker v-model="selectedShape.strokeStyle" show-alpha style="margin-right: 30px;"/>

                  <label style="margin-right: 10px;">填充颜色:</label>
                  <el-color-picker v-model="selectedShape.fillStyle" show-alpha/>
                </div>
                <div style="margin-bottom: 10px">
                  <label style="margin-right: 10px;">边线宽度:</label>
                  <el-input-number v-model="selectedShape.lineWidth"/>
                </div>
                <div style="margin-bottom: 10px">
                  <label style="margin-right: 10px;">模板名:</label>
                  <el-input v-model="templateName" clearable style="width: 200px">
                    <!-- 后置按钮 -->
                    <template #append>
                      <el-button @click="saveAsTemplate()" :icon="Upload"/>
                    </template>
                  </el-input>
                </div>
                <div>
                  <h3>模板列表</h3>
                  <ul>
                    <li v-for="template in templates" :key="template.id" @click="applyTemplate(template)">
                      {{ template.name }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.common-layout {
  background-color: white;
  min-height: 100vh; /* 保证背景色铺满整个页面 */
  padding: 0;
  margin: 0;
}

.box {
  display: flex;
}

.container {
  background-color: #ccc;
  width: 1200px;
  height: 800px;
}

.right {
  margin-left: 20px;
}

</style>
