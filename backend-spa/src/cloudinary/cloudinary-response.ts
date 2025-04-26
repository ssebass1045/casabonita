// File: backend-spa/src/cloudinary/cloudinary-response.ts
// Define la estructura básica de la respuesta de Cloudinary al subir
export interface CloudinaryResponse {
    public_id: string;
    version: number;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    tags: string[];
    bytes: number;
    type: string;
    etag: string;
    placeholder: boolean;
    url: string;
    secure_url: string; // La URL HTTPS que generalmente guardaremos
    original_filename: string;
    [key: string]: any; // Para otras posibles propiedades
}
