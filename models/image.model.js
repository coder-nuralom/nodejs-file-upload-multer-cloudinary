import mongoose from "mongoose";
const imageSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  public_id: { type: String, require: true, unique: true },
  image_url: { type: String, required: true, unique: true },
});

export const Image = mongoose.model("Image", imageSchema);
