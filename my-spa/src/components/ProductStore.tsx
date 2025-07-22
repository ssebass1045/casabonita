// File: my-spa/src/components/ProductStore.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './Card';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Definimos el enum y la interfaz aquí también
export enum ProductCategory {
  FACIAL = 'facial',
  CORPORAL = 'corporal',
  CABELLO = 'cabello',
  TRATAMIENTO_ESPECIAL = 'tratamiento_especial',
  OTROS = 'otros',
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: string;
  isActive: boolean;
  imageUrl?: string;
  category: ProductCategory;
}

const ProductStore = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | ''>('');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Construimos los parámetros de la URL para los filtros
        const params = new URLSearchParams();
        if (categoryFilter) {
          params.append('category', categoryFilter);
        }
        if (searchTerm) {
          params.append('search', searchTerm);
        }

        const response = await axios.get<Product[]>(`${API_BASE_URL}/products?${params.toString()}`);
        setProducts(response.data.filter(p => p.isActive)); // Mostramos solo activos
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("No se pudieron cargar los productos.");
      } finally {
        setIsLoading(false);
      }
    };

    // Hacemos la llamada a la API cada vez que un filtro cambia
    fetchProducts();
  }, [searchTerm, categoryFilter]);

  const handlePurchaseRequest = (productName: string, price: string) => {
    const numericPrice = parseFloat(price);
    const message = `¡Hola! Estoy interesado/a en comprar el producto \"${productName}\" por un valor de $${numericPrice.toFixed(
      2
    )}.`;
    const whatsappUrl = `https://wa.me/573217571992?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="store" className="section">
      <h2 className="section-title">Nuestra Tienda</h2>
      <p className="section-description">Explora nuestra selección de productos de alta calidad para el cuidado personal.</p>

      {/* Contenedor de Filtros */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px', minWidth: '250px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | '')}
          style={{ padding: '10px', minWidth: '200px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">Todas las categorías</option>
          <option value={ProductCategory.FACIAL}>Facial</option>
          <option value={ProductCategory.CORPORAL}>Corporal</option>
          <option value={ProductCategory.CABELLO}>Cabello</option>
          <option value={ProductCategory.TRATAMIENTO_ESPECIAL}>Tratamiento Especial</option>
          <option value={ProductCategory.OTROS}>Otros</option>
        </select>
      </div>

      {isLoading && <p>Cargando productos...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!isLoading && !error && (
        <div className="cards-grid">
          {products.length > 0 ? (
            products.map(product => (
              <Card
                key={product.id}
                title={`${product.name} - $${parseFloat(product.price).toFixed(2)}`}
                description={product.description || 'Descripción no disponible.'}
                imageUrl={product.imageUrl}
                buttonText="Comprar"
                onButtonClick={() => handlePurchaseRequest(product.name, product.price)}
              />
            ))
          ) : (
            <p>No se encontraron productos con los filtros seleccionados.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default ProductStore;
