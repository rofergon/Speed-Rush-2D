import { resizeImage } from '../utils/imageUtils';

export type CarStyle = 'cartoon' | 'realistic' | 'anime';

interface CarResponse {
  image: {
    data: string;
    content_type: string;
    filename: string;
  };
  metadata: {
    traits: {
      speed: number;
      acceleration: number;
      handling: number;
      drift_factor: number;
      turn_factor: number;
      max_speed: number;
    };
  };
}

export interface CarMetadata {
  traits: {
    speed: number;
    acceleration: number;
    handling: number;
    drift_factor: number;
    turn_factor: number;
    max_speed: number;
  };
}

const API_URL = "https://speed-rush-2d-backend-production.up.railway.app";

export const generateCarNFT = async (prompt: string, style: CarStyle): Promise<{
  imageUrl: string;
  metadata: CarMetadata;
}> => {
  try {
    const response = await fetch(`${API_URL}/api/cars/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, style }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `Error: ${response.status}`);
    }

    const data: CarResponse = await response.json();
    
    // Create optimized image URL from base64
    const imageUrl = `data:${data.image.content_type};base64,${data.image.data}`;
    const optimizedImageUrl = await resizeImage(imageUrl);

    return {
      imageUrl: optimizedImageUrl,
      metadata: data.metadata
    };
  } catch (error) {
    console.error('Error in generateCarNFT:', error);
    throw error instanceof Error ? error : new Error('Unknown error generating car');
  }
}; 