import cloudinary from "../configs/cloudinary.js";

export const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "freelancer-platform/chat",
        resource_type: "auto",
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