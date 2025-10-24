import fs from "fs";
import path from "path";

export const deleteFile = (filePath) => {
  if (!filePath) return;

  // Normalize slashes
  let normalizedPath = filePath.replace(/\\/g, "/");

  // Remove leading 'public/' if present
  let cleanPath = normalizedPath.replace(/^public\//, "");

  const fullPath = path.join(process.cwd(), "public", cleanPath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`🗑️ Deleted file: ${fullPath}`);
  } else {
    console.warn(`⚠️ File not found: ${fullPath}`);
  }
};
