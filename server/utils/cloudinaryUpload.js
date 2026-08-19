import cloudinary from "../configs/cloudinary.js";


export const uploadToCloudinary = (
  file,
  folder = "freelancer-platform/chat"
) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error("File is required."));
    }

    const resourceType = getResourceType(file.mimetype);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};


export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

const getResourceType = (mimeType) => {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  return "raw";
};