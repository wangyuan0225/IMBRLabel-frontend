import request from "@/utils/request.js";

// 获取图片列表
export const getImageList = () => {
    return request.get("/images");
}

// 上传图片
export const uploadImage = (imageFile) => {
    let formData = new FormData();
    formData.append("file", imageFile);
    return request.post("/images", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
}

// 删除图片
export function deleteImageById(id) {
    return request.delete(`/images?id=${id}`);
}
