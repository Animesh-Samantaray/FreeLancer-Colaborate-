import dotenv from "dotenv";
dotenv.config();

console.log("Raw Env Check:", {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "PRESENT" : "MISSING",
});

const testUpload = async () => {
  try {
    const { uploadToCloudinary } = await import("./utils/cloudinaryUpload.js");

    const mockFile = {
      originalname: "Animesh Machine Learning Resume.pdf",
      mimetype: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 Mock PDF Content"), // This invalid PDF buffer will trigger the fallback to 'raw'!
    };

    console.log("Uploading via utility...");
    const result = await uploadToCloudinary(mockFile);
    console.log("Upload Success! Result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Execution Error:", err);
  }
};

testUpload();
