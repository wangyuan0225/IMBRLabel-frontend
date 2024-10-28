import request from "@/utils/request.js";

// 添加标注到图片
export const addAnnotationToImage = (imageId, annotations) => {
    return request.patch("/annotations", null, {
        params: {
            imageId: imageId,
            annotations: annotations
        }
    });
};

// 添加标注到模板
export const addAnnotation = (annotationData) => {
    return request.post("/annotations", annotationData);
};

// 获取模板列表
export const getTemplates = () => {
    return request.get("/annotations");
};

export function exportAnnotations(imageId, type) {
    return request.get("/annotations/export", {
        params: {
            imageId: imageId,
            type: type
        }
    });
}

// 根据坐标添加标注
export function autoAnnotation(annotations) {
    return request.patch("/annotations/auto", null, {
        params: {
            annotations: annotations
        }
    });
}