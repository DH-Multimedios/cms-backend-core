"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveUploadPaths = resolveUploadPaths;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function physicalPath(value) {
    let ancestor = (0, node_path_1.resolve)(value);
    const missing = [];
    while (!(0, node_fs_1.existsSync)(ancestor)) {
        const parent = (0, node_path_1.dirname)(ancestor);
        if (parent === ancestor)
            throw new Error(`Upload directory cannot be resolved: ${value}`);
        missing.unshift((0, node_path_1.relative)(parent, ancestor));
        ancestor = parent;
    }
    return (0, node_path_1.join)((0, node_fs_1.realpathSync)(ancestor), ...missing);
}
function resolveUploadPaths(config) {
    if (process.env.UPLOADS_PATH !== undefined) {
        throw new Error('UPLOADS_PATH is unsafe: migrate files and set FILES_UPLOAD_PATH and MEDIA_UPLOAD_PATH separately');
    }
    const files = process.env.FILES_UPLOAD_PATH ?? 'uploads/files';
    const media = process.env.MEDIA_UPLOAD_PATH ?? 'uploads/media';
    if (!files.trim() || !media.trim()) {
        throw new Error('FILES_UPLOAD_PATH and MEDIA_UPLOAD_PATH cannot be empty');
    }
    const privateRoot = physicalPath(files);
    const publicRoot = physicalPath(media);
    const location = (0, node_path_1.relative)(publicRoot, privateRoot);
    if (!location ||
        (location !== '..' && !location.startsWith(`..${node_path_1.sep}`) && !(0, node_path_1.isAbsolute)(location))) {
        throw new Error('FILES_UPLOAD_PATH must be outside the public MEDIA_UPLOAD_PATH directory');
    }
    if (config?.filesPath && physicalPath(config.filesPath) !== privateRoot) {
        throw new Error('modules.files.path must match FILES_UPLOAD_PATH');
    }
    if (config?.mediaPath && physicalPath(config.mediaPath) !== publicRoot) {
        throw new Error('modules.media.path must match MEDIA_UPLOAD_PATH');
    }
    return { files, media };
}
//# sourceMappingURL=upload-paths.js.map