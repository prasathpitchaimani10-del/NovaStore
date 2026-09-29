import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore.ts';

// Helper to generate slug from name
const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// @desc    Fetch all products with filtering, search, sorting & pagination
// @route   GET /api/products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      inStock,
      sort,
      page,
      limit,
    } = req.query;

    const data = await dbStore.getProducts({
      category: category as string,
      brand: brand as string,
      search: search as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      inStock: inStock === 'true',
      sort: sort as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 12,
    });

    res.json({
      success: true,
      products: data.products,
      total: data.total,
      page: data.page,
      pages: data.pages,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching products',
    });
  }
};

// @desc    Get category summary with counts
// @route   GET /api/products/categories
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await dbStore.getCategories();
    res.json({
      success: true,
      categories,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching categories',
    });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await dbStore.getProductById(req.params.id);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }
    res.json({
      success: true,
      product,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching product',
    });
  }
};

// @desc    Fetch single product by Slug
// @route   GET /api/products/slug/:slug
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await dbStore.getProductBySlug(req.params.slug);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }
    res.json({
      success: true,
      product,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching product',
    });
  }
};

// @desc    Create a new product (Admin Only)
// @route   POST /api/products
export const adminCreateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      compareAtPrice,
      category,
      brand,
      stock,
      sku,
      images,
      isFeatured,
      tags,
    } = req.body;

    if (!name || !description || price === undefined || !category || !brand || stock === undefined) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required product details: name, description, price, category, brand, and stock.',
      });
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      res.status(400).json({
        success: false,
        message: 'Product price must be a positive number greater than 0',
      });
      return;
    }

    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      res.status(400).json({
        success: false,
        message: 'Product stock must be a non-negative number',
      });
      return;
    }

    let slug = slugify(name);
    let existing = await dbStore.getProductBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const validatedImages = Array.isArray(images) && images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'];

    const newProduct = await dbStore.createProduct({
      name: name.trim(),
      slug,
      description: description.trim(),
      price: numPrice,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      category: category.trim(),
      brand: brand.trim(),
      stock: numStock,
      sku: (sku && sku.trim()) || `SKU-${Date.now().toString().slice(-6)}`,
      images: validatedImages,
      isFeatured: Boolean(isFeatured),
      tags: Array.isArray(tags) ? tags : [],
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error creating product',
    });
  }
};

// @desc    Update a product (Admin Only)
// @route   PUT /api/products/:id
export const adminUpdateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await dbStore.getProductById(req.params.id);
    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    const {
      name,
      description,
      price,
      compareAtPrice,
      category,
      brand,
      stock,
      sku,
      images,
      isFeatured,
      tags,
    } = req.body;

    const updates: any = {};
    if (name) {
      updates.name = name.trim();
      updates.slug = slugify(name);
    }
    if (description) updates.description = description.trim();
    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        res.status(400).json({ success: false, message: 'Price must be positive' });
        return;
      }
      updates.price = numPrice;
    }
    if (compareAtPrice !== undefined) updates.compareAtPrice = Number(compareAtPrice);
    if (category) updates.category = category.trim();
    if (brand) updates.brand = brand.trim();
    if (stock !== undefined) {
      const numStock = Number(stock);
      if (isNaN(numStock) || numStock < 0) {
        res.status(400).json({ success: false, message: 'Stock cannot be negative' });
        return;
      }
      updates.stock = numStock;
    }
    if (sku) updates.sku = sku.trim();
    if (Array.isArray(images) && images.length > 0) updates.images = images;
    if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured);
    if (Array.isArray(tags)) updates.tags = tags;

    const updated = await dbStore.updateProduct(req.params.id, updates);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error updating product',
    });
  }
};

// @desc    Delete a product (Admin Only)
// @route   DELETE /api/products/:id
export const adminDeleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await dbStore.getProductById(req.params.id);
    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    await dbStore.deleteProduct(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error deleting product',
    });
  }
};
