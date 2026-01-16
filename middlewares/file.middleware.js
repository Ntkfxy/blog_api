const multer = require("multer");
const path = require("path");
const firebaseConfig = require("../config/firebase.config");

const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} = require("firebase/storage");
const { log } = require("console");

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebaseStorage = getStorage(app);

// set storage engine
const upload = multer({
  //อัปโหลดไปที่ ram
  storage: multer.memoryStorage(),
  //ไฟล์ลิมิตที่เท่าไหร่
  limits: { fileSize: 1000000 }, // 1MB
  //ไฟล์ไหนที่ผ่านอัปโหลดบ้าง
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
  //อัปโหลดได้แค่ทีละรูป
}).single("file");
console.log("upload succ");

function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png|gif|webp/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extName) {
    cb(null, true);
  } else {
    cb(new Error("Images only!"));
  }
}

// upload to firebase storage
async function uploadToFirebase(req, res, next) {
  if (!req.file) {
    return next();
  }
  //save localtion
  const storageRef = ref(
    firebaseStorage,
    `uploads/${Date.now()}_${req.file.originalname}`
  );

  //ต้องบอกว่าไฟล์ที่เข้ามาเป็นไฟล์แบบไหน
  const metadata = {
    contentType: req.file.mimetype,
  };

  try {
    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata
    );

    //get url from firebase
    const downloadURL = await getDownloadURL(snapshot.ref);
    req.file.firebaseUrl = downloadURL;
    //ไปต่อที่ createPost.controller
    next();
  } catch (error) {
    res.status(500).json({
      message:
        error.message || "Something went wrong while uploading to Firebase",
    });
  }
}

module.exports = { upload, uploadToFirebase };
