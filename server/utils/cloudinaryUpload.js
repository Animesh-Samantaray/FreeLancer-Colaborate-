import cloudinary from "../configs/cloudinary.js";

export const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    // Determine the resource type based on mime type
    let resourceType = "raw";
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      resourceType = "image";
    } else if (file.mimetype && file.mimetype.startsWith("video/")) {
      resourceType = "video";
    }

    // Extract extension and clean base name 
    const originalName = file.originalname || "file";
    const lastDotIndex = originalName.lastIndexOf(".");
    const ext = lastDotIndex !== -1 ? originalName.slice(lastDotIndex) : "";
    const baseName = lastDotIndex !== -1 ? originalName.slice(0, lastDotIndex) : originalName;
    
    //  Cloudinary public_id 
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");
    const uniquePublicId = `${cleanBaseName}-${Date.now()}${ext}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "freelancer-platform/chat",
        resource_type: resourceType,
        public_id: uniquePublicId,
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