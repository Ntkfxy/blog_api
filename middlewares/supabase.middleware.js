const multer = require("multer");
const path = require("path");

// ตั้งค่า multer สำหรับรับไฟล์
const upload = multer({
  // เก็บไฟล์ไว้ใน memory (buffer)
  storage: multer.memoryStorage(),

  // จำกัดขนาดไฟล์ไม่เกิน 1MB
  limits: { fileSize: 1000000 },

  // ตรวจสอบชนิดไฟล์
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single("file"); // รับไฟล์เดียว ชื่อ field = file

// ฟังก์ชันตรวจสอบชนิดไฟล์ (รับเฉพาะรูป)
function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png|gif|webp/;

  // ตรวจนามสกุลไฟล์
  const extName = fileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  // ตรวจ mime type
  const mimetype = fileTypes.test(file.mimetype);

  // ต้องผ่านทั้งสองอย่าง
  if (mimetype && extName) {
    return cb(null, true);
  } else {
    cb("Error: Images only!");
  }
}

// import Supabase client
const supabase = require("../config/supabase.config");

// middleware สำหรับอัปโหลดไฟล์ไป Supabase
async function uploadToSupabase(req, res, next) {
  // ถ้าไม่มีไฟล์ ให้ผ่านไปเลย
  if (!req.file) {
    next();
    return;
  }

  try {
    // สร้างชื่อไฟล์ใหม่
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${Date.now()}${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // อัปโหลดไฟล์ไป Supabase Storage
    const { error } = await supabase.storage
      .from("Cover") // ชื่อ bucket
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    // ดึง public URL
    const { data } = supabase.storage
      .from("Cover")
      .getPublicUrl(filePath);

    // แนบ URL ไว้ใน req.file
    req.file.supabaseUrl = data.publicUrl;

    next();
  } catch (error) {
    res.status(500).json({
      message:
        error.message || "Something went wrong while uploading to Supabase.",
    });
  }
}

// export middleware
module.exports = {
  upload,
  uploadToSupabase,
};
