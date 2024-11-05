<script setup>
import { ref, onMounted } from "vue";
import { deleteImageById, getImageList, uploadImage } from "@/api/images.js";
import { ElMessage, ElMessageBox } from "element-plus";
import router from "@/router/index.js";
import { Delete } from "@element-plus/icons-vue";

const imageList = ref([]);

// 获取图片列表
const fetchImages = async () => {
  try {
    const result = await getImageList();
    if (result.code === 0) {
      imageList.value = result.data.map(image => ({
        ...image,
        path: `http://192.168.232.129:8080/images/${image.path.replace(/\\/g, "/")}`
      }));
    } else {
      ElMessage.error(result.message || "获取图片失败");
    }
    if (imageList.value.length === 0) {
      ElMessage.info("暂无图片，请上传");
    }
  } catch (error) {
    ElMessage.error("获取图片时出现错误");
    console.error(error);
  }
};

// 上传单个图片
const uploadSingleFile = async (file) => {
  try {
    const result = await uploadImage(file);
    if (result.code === 0) {
      ElMessage.success(`图片 ${file.name} 上传成功`);
    } else {
      ElMessage.error(result.message ? result.message : `文件 ${file.name} 上传失败`);
    }
    await fetchImages(); // 重新获取图片列表
  } catch (error) {
    ElMessage.error("上传过程中出现错误");
  }
};

// 上传文件夹
const uploadFolder = async (files) => {
  // 清空之前的图片列表
  imageList.value = [];
  console.log('Selected files:', files);

  try {
    const uploadPromises = Array.from(files).map(async (file) => {
      console.log('Uploading file:', file);
      const result = await uploadImage(file);
      if (result.code === 0) {
        ElMessage.success(`文件 ${file.name} 上传成功`);
      } else {
        ElMessage.error(result.message ? result.message : `文件 ${files.name} 上传失败`);
      }
    });

    await Promise.all(uploadPromises);
    await fetchImages(); // 重新获取图片列表
  } catch (error) {
    ElMessage.error("上传过程中出现错误");
  }
};

// 编辑图片
const editImage = (image) => {
  router.push({
    name: "Annotation",
    query: {
      imageId: image.id
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
  ).then(async () => {
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
  });
};

// 组件挂载时获取图片列表
onMounted(fetchImages);
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-main>
        <div class="upload-section">
          <el-upload :before-upload="uploadSingleFile" accept="image/*">
            <el-button type="primary">上传图片</el-button>
          </el-upload>
          <input type="file" webkitdirectory multiple @change="(e) => uploadFolder(e.target.files)"
            style="display: none;" ref="folderInput">
          <el-button type="primary" @click="$refs.folderInput.click()">上传文件夹</el-button>
        </div>
        <div class="gallery">
          <div v-for="(image, index) in imageList" :key="index" class="thumbnail">
            <div class="image-container">
              <img :src="image.path" :alt="image.name" @click="editImage(image)" />
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

.upload-section el-button:first-child {
  margin-right: 20px;
}

.upload-section {
  display: flex;
  gap: 20px;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: flex-start;
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
  padding-top: 100%;
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
