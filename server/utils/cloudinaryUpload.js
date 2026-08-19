import cloudinary from "../configs/cloudinary.js";
import path from "path";
import crypto from "crypto";

export const uploadToCloudinary = (
  file,
  folder = "freelancer-platform/chat"
) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error("File is required."));
    }

    const resourceType = getResourceType(file.mimetype);

    const options = {
      folder,
      resource_type: resourceType,
    };

    // For raw resources (e.g., pdf, docx, zip), we must include the extension in public_id
    // for Cloudinary to deliver it with the correct extension in the URL.
    if (resourceType === "raw" && file.originalname) {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueId = crypto.randomBytes(16).toString("hex");
      options.public_id = `${uniqueId}${ext}`;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }

        resolve(result);
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

const getResourceType = (mimeType = "") => {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  return "raw";
};

export const extractCloudinaryMetadata = (url) => {
  if (!url || !url.includes("cloudinary.com")) {
    return null;
  }

  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) {
      return null;
    }

    const resourceType = parts[uploadIndex - 1];
    const versionIndex = parts.findIndex(
      (part, index) =>
        index > uploadIndex &&
        part.startsWith("v") &&
        /^\d+$/.test(part.slice(1))
    );

    const startIdx =
      versionIndex !== -1
        ? versionIndex + 1
        : uploadIndex + 1;

    const publicIdWithExt = parts.slice(startIdx).join("/");
    let publicId = publicIdWithExt;

    // Only remove extension for image/video resources.
    if (resourceType !== "raw") {
      const dotIndex = publicIdWithExt.lastIndexOf(".");
      if (dotIndex !== -1) {
        publicId = publicIdWithExt.substring(0, dotIndex);
      }
    }

    return {
      publicId,
      resourceType,
    };
  } catch (error) {
    console.error("Error parsing Cloudinary URL:", error);
    return null;
  }
};