// File: my-spa/src/components/RecordProductSaleForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';


interface Product {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
}

interface RecordProductSaleFormData {
  productId: string; // Usamos string para el select
  quantity: string;   // Usamos string para el input
  pricePerUnit: string; // Usamos string para el input
}

interface RecordProductSaleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const RecordProductSaleForm: React.FC<RecordProductSaleFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<RecordProductSaleFormData>({
    productId: '',
    quantity: '1', // Cantidad por defecto
    pricePerUnit: '',
  });
  const [products, setProducts] = useState<Product[]>([]); // Lista de productos para el selector
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- NUEVOS ESTADOS PARA EL BUSCADOR DE PRODUCTOS ---
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProductDisplay, setSelectedProductDisplay] = useState<string>(''); // Para mostrar el nombre del producto seleccionado
  const [showProductSuggestions, setShowProductSuggestions] = useState<boolean>(false); // Para controlar la visibilidad de las sugerencias
  // --- FIN NUEVOS ESTADOS ---

  // Cargar la lista de productos al montar el formulario
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>(`${API_BASE_URL}/products`);
        // Filtrar solo productos activos para la venta
        setProducts(response.data.filter(p => p.isActive));
      } catch (err: any) {
        console.error("Error loading products for sale form:", err);
        setError("Error al cargar la lista de productos.");
      }
    };
    fetchProducts();
  }, []);

  // Manejar cambio de producto para auto-rellenar precio (AHORA DESDE EL BUSCADOR)
  const handleProductSelect = (product: Product) => {
    setFormData(prev => ({
      ...prev,
      productId: product.id.toString(),
      pricePerUnit: parseFloat(product.price.toString()).toFixed(2), // Auto-rellena precio
    }));
    setSelectedProductDisplay(product.name);
    setSearchTerm(''); // Limpiar el término de búsqueda
    setShowProductSuggestions(false); // Ocultar sugerencias
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- NUEVAS FUNCIONES PARA EL BUSCADOR DE PRODUCTOS ---
  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowProductSuggestions(true); // Mostrar sugerencias al escribir
    setFormData(prev => ({ ...prev, productId: '', pricePerUnit: '' })); // Limpiar productId y precio si se empieza a buscar de nuevo
    setSelectedProductDisplay(''); // Limpiar display
  };

  const filteredProducts = searchTerm.length > 0
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  // --- FIN NUEVAS FUNCIONES ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validaciones frontend
      if (!formData.productId || !formData.quantity || !formData.pricePerUnit) {
        throw new Error('Por favor, completa todos los campos obligatorios.');
      }

      const parsedQuantity = parseInt(formData.quantity, 10);
      if (isNaN(parsedQuantity) || parsedQuantity < 1) {
        throw new Error('La cantidad debe ser un número entero mayor o igual a 1.');
      }

      const parsedPricePerUnit = parseFloat(formData.pricePerUnit);
      if (isNaN(parsedPricePerUnit) || parsedPricePerUnit < 0) {
        throw new Error('El precio por unidad debe ser un número válido mayor o igual a 0.');
      }

      const submitData = {
        productId: parseInt(formData.productId, 10),
        quantity: parsedQuantity,
        pricePerUnit: parsedPricePerUnit,
      };

      await axios.post(`${API_BASE_URL}/product-sales`, submitData);
      onSuccess();
      toast.success("Venta de producto registrada exitosamente.");

    } catch (err: any) {
      console.error("Error recording product sale:", err);
      if (err.response?.status === 401) {
        setError("No tienes autorización para registrar ventas. Por favor, inicia sesión nuevamente.");
      } else if (err.response?.status === 400) {
        const backendMessage = err.response?.data?.message;
        if (Array.isArray(backendMessage)) {
          setError(`Errores de validación: ${backendMessage.join(', ')}`);
        } else {
          setError(backendMessage || 'Error de validación en los datos enviados.');
        }
      } else {
        setError(err.message || "Error al registrar la venta del producto.");
      }
      toast.error(error || "Error al registrar la venta del producto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="message-error">
          {error}
        </div>
      )}

      {/* Campo Producto (Buscador) */}
      <div className="form-group">
        <label htmlFor="productSearch" className="form-label">Producto *</label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            id="productSearch"
            name="productSearch"
            value={searchTerm || selectedProductDisplay} // Muestra el término de búsqueda o el producto seleccionado
            onChange={handleSearchTermChange}
            onFocus={() => setShowProductSuggestions(true)} // Mostrar sugerencias al enfocar
            onBlur={() => setTimeout(() => setShowProductSuggestions(false), 100)} // Ocultar con un pequeño retraso
            placeholder="Buscar producto por nombre..."
            className="form-input"
            required={!formData.productId} // Requerido si no hay producto seleccionado
          />

          {/* Sugerencias de Productos */}
          {showProductSuggestions && filteredProducts.length > 0 && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'var(--color-white-figurbell)', // Usar variable
              border: '1px solid var(--color-border)', // Usar variable
              borderRadius: 'var(--border-radius-sm)', // Usar variable
              maxHeight: '150px',
              overflowY: 'auto',
              zIndex: 100,
              listStyle: 'none',
              padding: 0,
              margin: '5px 0 0 0'
            }}>
              {filteredProducts.map(product => (
                <li
                  key={product.id}
                  onMouseDown={() => handleProductSelect(product)} // Usar onMouseDown para que se dispare antes de onBlur
                  style={{
                    padding: 'var(--spacing-sm)', // Usar variable
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--color-border)' // Usar variable
                  }}
                >
                  {product.name} (${parseFloat(product.price.toString()).toFixed(2)})
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Campo oculto para enviar el productId real */}
        <input type="hidden" name="productId" value={formData.productId} required={!formData.productId} />
        {formData.productId && (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)', marginTop: 'var(--spacing-xs)' }}>
            Producto seleccionado: <strong>{selectedProductDisplay}</strong>
          </p>
        )}
      </div>

      {/* Campo Cantidad */}
      <div className="form-group">
        <label htmlFor="quantity" className="form-label">Cantidad *</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleInputChange}
          className="form-input"
          min="1"
          required
        />
      </div>

      {/* Campo Precio por Unidad */}
      <div className="form-group">
        <label htmlFor="pricePerUnit" className="form-label">Precio por Unidad *</label>
        <input
          type="number"
          id="pricePerUnit"
          name="pricePerUnit"
          value={formData.pricePerUnit}
          onChange={handleInputChange}
          className="form-input"
          min="0"
          step="0.01"
          required
        />
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
        <button type="button" onClick={onCancel} className="action-button" style={{ backgroundColor: 'var(--color-secondary)' }}>
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="action-button" style={{ backgroundColor: 'var(--color-primary)' }}>
          {isSubmitting ? 'Registrando...' : 'Registrar Venta'}
        </button>
      </div>
    </form>
  );
};

export default RecordProductSaleForm;
