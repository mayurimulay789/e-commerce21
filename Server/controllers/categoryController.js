const Category = require("../models/Category");
const Product = require("../models/Product");
const { uploadToCloudinary } = require("../utils/cloudinary");

// Get all categories
const getCategories = async (req, res) => {
  try {
    const { showOnHomepage } = req.query;

    const query = { isActive: true };
    if (showOnHomepage === "true") {
      query.showOnHomepage = true;
    }

    const categories = await Category.find(query)
      .populate("subcategories")
      .sort({ sortOrder: 1, createdAt: -1 });

    res.status(200).json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// Get category by slug
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug, isActive: true })
      .populate("subcategories")
      .populate("parentCategory");

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ category });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({ message: "Failed to fetch category" });
  }
};

// Create category (Admin only)
const createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory, showOnHomepage, sortOrder } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    let imageData = {};
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "categories");
      imageData = {
        url: result.secure_url,
        alt: name,
      };
    }

    const category = new Category({
      name,
      description,
      image: imageData,
      parentCategory: parentCategory || null,
      showOnHomepage: showOnHomepage !== undefined ? showOnHomepage : true,
      sortOrder: sortOrder || 0,
    });

    await category.save();

    // Update parent category if exists
    if (parentCategory) {
      await Category.findByIdAndUpdate(parentCategory, { $push: { subcategories: category._id } });
    }

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
};

// Update category (Admin only)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, showOnHomepage, sortOrder, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Update image if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "categories");
      category.image = {
        url: result.secure_url,
        alt: name || category.name,
      };
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (showOnHomepage !== undefined) category.showOnHomepage = showOnHomepage;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Failed to update category" });
  }
};

// Delete category (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({
        message: "Cannot delete category with existing products",
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
