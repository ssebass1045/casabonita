// File: my-spa/src/components/ProductsSection.tsx
import React from 'react';
import Card from './Card'; // Importa el componente Card

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number; // La interfaz espera un número, pero el JSON puede ser string
  isActive: boolean;
  imageUrl?: string;
}

interface ProductsSectionProps {
  products: Product[];
}

const ProductsSection: React.FC<ProductsSectionProps> = ({ products }) => {
  const handlePurchaseRequest = (productName: string, price: number) => {
    // CORRECCIÓN AQUÍ: Convertir a número antes de usar toFixed
    const message = `¡Hola! Estoy interesado/a en comprar el producto "${productName}" por un valor de $${parseFloat(price.toString()).toFixed(2)}.`;
    const whatsappUrl = `https://wa.me/573101234567?text=${encodeURIComponent(message)}`; // Reemplaza con tu número de WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const sectionStyle: React.CSSProperties = {
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9', // Un color de fondo diferente para distinguir la sección
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
    justifyItems: 'center',
  };

  // Filtra solo los productos activos
  const activeProducts = products.filter(product => product.isActive);

  return (
    <section id="products" style={sectionStyle}>
      <h2>Nuestros Productos</h2>
      <div style={gridStyle}>
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
    </section>
  );
};

export default ProductsSection;
