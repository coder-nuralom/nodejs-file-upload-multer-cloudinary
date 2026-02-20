import express from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Image } from "./models/image.model.js";

const app = express();

cloudinary.config({
  cloud_name: "duttrhriu",
  api_key: "725736616378549",
  api_secret: "M_COJBslP2puDFJFA6hyVKC_PEY",
});

app.set("view engine", "ejs");
app.use(express.static(path.join(path.resolve(), "public")));

app.get("/", (req, res) => {
  res.render("index", { imageUrl: null });
});

const uploadDir = "./public/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error("Only image files are allowed!"), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log(req.file);
    if (!req.file) {
      res.status(400).json({
        message: "Failed.! No image selected.",
        success: false,
      });
    }
    const cloudinaryRes = await cloudinary.uploader.upload(req.file.path, {
      folder: "nodejs_file_upload",
    });
    fs.unlinkSync(req.file.path);
    //save to database
    const saveImage = await Image.create({
      fileName: req.file.originalname,
      public_id: cloudinaryRes.public_id,
      image_url: cloudinaryRes.secure_url,
    });

    res.render("index", { imageUrl: cloudinaryRes.secure_url });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return res.status(500).json({
      message: "Image upload failed..!",
      error: error.message,
    });
  }
});

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://codernuralom_db_user:BK6XCyhMk5E73AxX@cluster0.sgvlnpl.mongodb.net/",
      { dbName: "nodejs_file_upload_project" },
    );
    console.log("mongodb connected successfully..!");
  } catch (error) {
    console.erroe("Failed to connect database:", error.message);
    process.exit(1);
  }
};

const port = 3000;
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });
});
