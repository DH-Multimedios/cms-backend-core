import { existsSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

/** Resolve the existing ancestor so symlink aliases cannot bypass the storage boundary. */
function physicalPath(value: string): string {
  let ancestor = resolve(value);
  const missing: string[] = [];
  while (!existsSync(ancestor)) {
    const parent = dirname(ancestor);
    if (parent === ancestor) throw new Error(`Upload directory cannot be resolved: ${value}`);
    missing.unshift(relative(parent, ancestor));
    ancestor = parent;
  }
  return join(realpathSync(ancestor), ...missing);
}

export function resolveUploadPaths(config?: { filesPath?: string; mediaPath?: string }): {
  files: string;
  media: string;
} {
  if (process.env.UPLOADS_PATH !== undefined) {
    throw new Error(
      'UPLOADS_PATH is unsafe: migrate files and set FILES_UPLOAD_PATH and MEDIA_UPLOAD_PATH separately',
    );
  }

  const files = process.env.FILES_UPLOAD_PATH ?? 'uploads/files';
  const media = process.env.MEDIA_UPLOAD_PATH ?? 'uploads/media';
  if (!files.trim() || !media.trim()) {
    throw new Error('FILES_UPLOAD_PATH and MEDIA_UPLOAD_PATH cannot be empty');
  }

  const privateRoot = physicalPath(files);
  const publicRoot = physicalPath(media);
  const location = relative(publicRoot, privateRoot);
  if (
    !location ||
    (location !== '..' && !location.startsWith(`..${sep}`) && !isAbsolute(location))
  ) {
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
