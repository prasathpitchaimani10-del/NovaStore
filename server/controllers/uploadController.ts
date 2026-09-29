import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth.ts';

// @desc    Generate Cloudinary upload signature server-side (Secret is never sent to frontend)
// @route   POST /api/upload/sign
export const getCloudinarySignature = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'mock_cloudinary_secret_key_abcdef';
    const apiKey = process.env.CLOUDINARY_API_KEY || '123456789012345';
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'novastore-assets';
    const folder = 'novastore/products';

    // Cloudinary signature hash: sorted string params + secret
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    // ONLY public parameters are returned - API secret is kept secure on server
    res.json({
      success: true,
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error creating upload signature',
    });
  }
};

// @desc    Server-side direct image upload handler
// @route   POST /api/upload
export const handleDirectUpload = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { imageBase64, imageName } = req.body;

    if (!imageBase64) {
      res.status(400).json({ success: false, message: 'Image data is required' });
      return;
    }

    // In production, backend transmits directly to Cloudinary via server-to-server API
    // Returning a secure image URL
    const mockCloudinaryUrl = imageBase64.startsWith('http')
      ? imageBase64
      : `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: mockCloudinaryUrl,
      publicId: `novastore/products/${imageName || Date.now()}`,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error processing image upload',
    });
  }
};
