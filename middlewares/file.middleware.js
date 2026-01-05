const multer = require("multer")
const path = require("path")
const firebaseConfig = require("../config/firebase.config")

const {getStorage, ref, uploadBytesResumable, getDownloadURL,} = require("firebase/storage");

// Intialize Firebase Storage
const {initializeApp} =require("firebase/app")
const app = initializeApp(firebaseConfig)
const firebaseConfig = getStorage(app);


//set storage engine
const upload = multer ({
storage: multer.memoryStorage(),
// ลิมิตในการเข้าไฟล์ เข้าได้สูงสุด
limits:{fileSize: 1000000}, //1mb
fileFilter:(req, file, cb) => {
    //ไฟล์ type ไหนที่สามารถเข้าได้บ้าง
    checkFileType(file, cb)
}
}).single("file")

function checkFileType(file, cb){
    const fileTypes = /jpeg|jpg|png|gif|webp/;
    const extName = fileTypes.test(path.extname(file.originalname).toLocaleLowerCase()
);
const mimetype = fileTypes.test(file.mimetype);
if(mimetype && extName){
    // เช็คแล้วรูปภาพตรง
    return cb(null, true);
}else{
    cb("Error image only!!")
}
}

//upload to firebase storage
async function uploadToFirebase(req, res, next){
    if(!req.file){
        next();
        return;
    }
    //save location img
    const storageRef = ref(firebaseStorage, `uploads/${req.cover.originalname}`)

    const metadata = {
        contentType: req.cover.mimetype
    }
    try {
        const snapshot = await uploadBytesResumable(storageRef, req.cover.buffer, metadata)
        //get url from firebase
        req,cover.firebaseUrl = await getDownloadURL(snapshot.ref)
        next();

    } catch (error) {
        res.status(500).json({message: error.message || "Something went wrong wile uploading to firebase"})
    }
}

module.exports = {upload, uploadToFirebase};