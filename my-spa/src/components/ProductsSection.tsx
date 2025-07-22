// File: my-spa/src/components/ProductsSection.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  imageUrl?: string;
  category?: string;
}

interface ProductsSectionProps {
  products: Product[];
}

const ProductsSection: React.FC<ProductsSectionProps> = ({ products }) => {
  const handlePurchaseRequest = (productName: string, price: number) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    const message = `¡Hola! Estoy interesado/a en comprar el producto "${productName}" por un valor de $${numericPrice.toFixed(2)}.`;
    const whatsappUrl = `https://wa.me/573217571992?text=${encodeURIComponent(message)}`; // Reemplaza con tu número de WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const activeProducts = products
    .filter((product) => product.isActive)
    .slice(0, 3);

  return (
    <section id="products" className="section section-custom-bg-3"> {/* Aplicamos clases */}
      <h2 className="section-title">Nuestros Productos Destacados</h2> {/* Aplicamos clase */}
      <div className="cards-grid"> {/* Aplicamos clase */}
        {activeProducts.map(product => (
          <Card
            key={product.id}
            title={`${product.name} - $${parseFloat(product.price.toString()).toFixed(2)}`}
            description={product.description || 'Descripción no disponible.'}
            imageUrl={product.imageUrl}
            buttonText="Comprar"
            onButtonClick={() => handlePurchaseRequest(product.name, product.price)}
          />
        ))}
      </div>
      {/* NUEVO: Botón para ir a la tienda */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link to="/store" className="elementor-button book-now">
          Ver todos los productos
        </Link>
      </div>
    </section>
  );
};

export default ProductsSection;
