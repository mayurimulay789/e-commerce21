const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    image: {
      url: String,
      alt: String,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    showOnHomepage: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    seoTitle: String,
    seoDescription: String,
    productCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Generate unique slug before saving
categorySchema.pre("save", async function (next) {
  if (!this.slug) {
    let newSlug = slugify(this.name, { lower: true, strict: true });
    let slugExists = await mongoose.models.Category.findOne({ slug: newSlug });

    let suffix = 1;
    while (slugExists) {
      newSlug = `${slugify(this.name, { lower: true, strict: true })}-${suffix}`;
      slugExists = await mongoose.models.Category.findOne({ slug: newSlug });
      suffix++;
    }

    this.slug = newSlug;
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
