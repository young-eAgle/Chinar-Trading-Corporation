import mongoose from "mongoose";

const DropCategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Category name (e.g., "Air Conditioner")
  subcategories: {
    type: Map,
    of: [Array], // Each key (subcategory group) contains an array of values
    default: {}
  }
});

export default mongoose.model("Categories", DropCategorySchema);
// const DropCategory = mongoose.model("DropCategory", DropCategorySchema);
// module.exports = DropCategory;
