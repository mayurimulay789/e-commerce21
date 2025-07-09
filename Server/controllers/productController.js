const Product = require("../models/Product")
const Category = require("../models/Category")
const { uploadToCloudinary } = require("../utils/cloudinary")

// Get all products with filters
exports.getProducts = async (req, res) => {
  try {
    const { category, tag, minPrice, maxPrice, sort, page = 1, limit = 12, search } = req.query

    const query = { isActive: true }

    // Category filter
    if (category) {
      query.category = category
    }

    // Tag filter
    if (tag) {
      query.tags = { $in: [tag] }
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    // Search filter
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    // Sort options
    let sortOption = {}
    switch (sort) {
      case "price-low":
        sortOption = { price: 1 }
        break
      case "price-high":
        sortOption = { price: -1 }
        break
      case "rating":
        sortOption = { "rating.average": -1 }
        break
      case "newest":
        sortOption = { createdAt: -1 }
        break
      default:
        sortOption = { createdAt: -1 }
    }

    const skip = (page - 1) * limit

    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))

    const total = await Product.countDocuments(query)

    res.status(200).json({
      products,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get products error:", error)
    res.status(500).json({ message: "Failed to fetch products" })
  }
}

// Get trending products
exports.getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      tags: { $in: ["trending"] },
    })
      .populate("category", "name slug")
      .sort({ "rating.average": -1, createdAt: -1 })
      .limit(12)

    res.status(200).json({ products })
  } catch (error) {
    console.error("Get trending products error:", error)
    res.status(500).json({ message: "Failed to fetch trending products" })
  }
}

// Get new arrivals
exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      tags: { $in: ["new-arrival"] },
    })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(12)

    res.status(200).json({ products })
  } catch (error) {
    console.error("Get new arrivals error:", error)
    res.status(500).json({ message: "Failed to fetch new arrivals" })
  }
}

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params

    const product = await Product.findById(id).populate("category", "name slug").populate("reviews.user", "name")

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.status(200).json({ product })
  } catch (error) {
    console.error("Get product error:", error)
    res.status(500).json({ message: "Failed to fetch product" })
  }
}

// Create product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      subcategory,
      sizes,
      colors,
      tags,
      stock,
      weight,
      dimensions,
    } = req.body

    // Upload images to Cloudinary
    const images = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "products")
        images.push({
          url: result.secure_url,
          alt: name,
        })
      }
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      images,
      category,
      subcategory,
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      tags: tags ? JSON.parse(tags) : [],
      stock: Number(stock) || 0,
      weight: weight ? Number(weight) : undefined,
      dimensions: dimensions ? JSON.parse(dimensions) : undefined,
    })

    await product.save()

    // Update category product count
    await Category.findByIdAndUpdate(category, { $inc: { productCount: 1 } })

    res.status(201).json({
      message: "Product created successfully",
      product,
    })
  } catch (error) {
    console.error("Create product error:", error)
    res.status(500).json({ message: "Failed to create product" })
  }
}

// Update product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const newImages = []
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "products")
        newImages.push({
          url: result.secure_url,
          alt: updateData.name || product.name,
        })
      }
      updateData.images = [...product.images, ...newImages]
    }

    // Parse JSON fields
    if (updateData.sizes) updateData.sizes = JSON.parse(updateData.sizes)
    if (updateData.colors) updateData.colors = JSON.parse(updateData.colors)
    if (updateData.tags) updateData.tags = JSON.parse(updateData.tags)
    if (updateData.dimensions) updateData.dimensions = JSON.parse(updateData.dimensions)

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate(
      "category",
      "name slug",
    )

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    })
  } catch (error) {
    console.error("Update product error:", error)
    res.status(500).json({ message: "Failed to update product" })
  }
}

// Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params

    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    await Product.findByIdAndDelete(id)

    // Update category product count
    await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } })

    res.status(200).json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Delete product error:", error)
    res.status(500).json({ message: "Failed to delete product" })
  }
}

// Add product review
exports.addReview = async (req, res) => {
  try {
    const { id } = req.params
    const { rating, comment } = req.body
    const userId = req.user.userId

    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find((review) => review.user.toString() === userId)

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" })
    }

    // Upload review images if provided
    const reviewImages = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "reviews")
        reviewImages.push(result.secure_url)
      }
    }

    // Add review
    product.reviews.push({
      user: userId,
      rating: Number(rating),
      comment,
      images: reviewImages,
    })

    // Update product rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0)
    product.rating = {
      average: totalRating / product.reviews.length,
      count: product.reviews.length,
    }

    await product.save()

    res.status(201).json({
      message: "Review added successfully",
      product,
    })
  } catch (error) {
    console.error("Add review error:", error)
    res.status(500).json({ message: "Failed to add review" })
  }
}
