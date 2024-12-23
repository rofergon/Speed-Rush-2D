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

export const generateCarNFT = async (prompt: string, style: string): Promise<{
  imageUrl: string;
  metadata: CarMetadata;
}> => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/cars/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, style }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Error al generar el carro');
    }

    const data: CarResponse = await response.json();
    
    // Crear URL para la imagen base64
    const imageUrl = `data:${data.image.content_type};base64,${data.image.data}`;

    return {
      imageUrl,
      metadata: data.metadata
    };
  } catch (error) {
    console.error('Error en generateCarNFT:', error);
    throw error instanceof Error ? error : new Error('Error desconocido al generar el carro');
  }
}; 