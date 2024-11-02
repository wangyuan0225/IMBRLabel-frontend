import request from "@/utils/request.js";

// 添加标注到图片
export const addAnnotationToImage = (imageId, annotations) => {
    return request.patch("/annotations", {
        imageId: imageId,
        annotations: annotations
    }, {
        headers: {
            'Content-Type': 'application/json'
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

// 半自动根据坐标添加标注
export function autoAnnotation(annotations, polygonSides, imageId) {
    return request.patch("/annotations/auto", {
        annotations: annotations,
        polygonSides: polygonSides,
        imageId: imageId
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

// 全自动根据坐标添加标注
export function fullAutoAnnotation(annotations, polygonSides, imageId, selectedId) {
    return request.patch("/annotations/fullauto", {
        annotations: annotations,
        polygonSides: polygonSides,
        imageId: imageId,
        selectedId: selectedId
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}


export function getImageDetails(imageId) {
    return request.get("/annotations/details", {
        params: {
            imageId: imageId
        }
    });
}