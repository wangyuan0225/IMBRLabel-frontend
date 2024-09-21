<script setup>
import {ref, onMounted} from "vue";
import {deleteImageById, getImageList, uploadImage} from "@/api/images.js";
import {ElMessage, ElMessageBox} from "element-plus";
import router from "@/router/index.js";
import {Delete} from "@element-plus/icons-vue";

const imageList = ref([]);

// 获取图片列表
const fetchImages = async () => {
  const result = await getImageList();
  if (result.code === 0) {
    imageList.value = result.data.map(image => ({
      ...image,
      path: `http://2bf96bc7.r1.cpolar.top/images/${image.path.replace(/\\/g, "/")}`
    }));
  } else {
    ElMessage.error(result.message ? result.message : "获取图片失败");
  }
  if (imageList.value.length === 0) {
    ElMessage.info("暂无图片，请上传");
  }
};

const beforeUpload = async (file) => {
  try {
    const result = await uploadImage(file);
    if (result.code === 0) {
      ElMessage.success("图片上传成功");
      await fetchImages();
    } else {
      ElMessage.error(result.message ? result.message : "图片上传失败");
    }
  } catch (error) {
    ElMessage.error("上传过程中出现错误");
  }
  return false;
};

const editImage = (image) => {
  console.log("edit image", image);
  // 使用查询参数传递图片路径
  router.push({
    name: "Annotation",
    query: {
      imagePath: encodeURIComponent(image.path), // 编码路径以处理特殊字符
      imageId: image.id, // 传递 imageId
      imageName: image.name,
      annotations: image.annotations // 传递标注数据
    }
  });
};

// 删除图片
const deleteImage = async (id) => {
  ElMessageBox.confirm(
      "这将永久删除该图片及其标注信息，是否继续？",
      "警告！",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }
  )
      .then(async () => {
        try {
          const result = await deleteImageById(id);
          if (result.code === 0) {
            ElMessage.success("图片删除成功");
            await fetchImages();
          } else {
            ElMessage.error(result.message ? result.message : "图片删除失败");
          }
        } catch (error) {
          ElMessage.error("删除图片时出错");
        }
      })
};

// 组件挂载时获取图片列表
onMounted(fetchImages);
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-main>
        <div class="upload-section">
          <el-upload :before-upload="beforeUpload">
            <el-button type="primary">上传照片</el-button>
          </el-upload>
        </div>
        <div class="gallery">
          <div v-for="(image, index) in imageList" :key="index" class="thumbnail">
            <div class="image-container">
              <img :src="image.path" :alt="image.name" @click="editImage(image)"/>
              <el-button size="small" type="danger" :icon="Delete" plain circle @click="deleteImage(image.id)"
                         class="delete-button"></el-button>
            </div>
          </div>
        </div>
      </el-main>
      <el-footer></el-footer>
    </el-container>
  </div>
</template>

<style scoped>
.common-layout {
  background-color: white;
  min-height: 100vh;
  padding: 0 100px;
  margin: 0;
}

.upload-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 5px; /* 调整间距 */
  align-items: flex-start; /* 确保图片紧贴顶部 */
}

.thumbnail {
  width: 100px;
  height: auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-container {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 维持1:1比例 */
  background-color: #f0f0f0;
}

.thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-button {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
}
</style>

