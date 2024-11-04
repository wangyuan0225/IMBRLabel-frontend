import request from "@/utils/request.js";

// 获取图片列表
export const getImageList = () => {
    return request.get("/images");
}

// 上传图片/文件夹
export const uploadImage = (imageFile) => {
    let formData = new FormData();

    // 判断是单个文件还是多个文件
    if (imageFile instanceof File) {
        formData.append("file", imageFile);
    } else {
        Array.from(imageFile).forEach(file => {
            formData.append("file", file);
        });
    }

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
