// File: my-spa/src/components/ManageProducts.tsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Modal from './Modal';
import ProductForm from './ProductForm';
import { toast } from 'react-toastify';
import { AuthContext, UserRole } from '../auth/authContext'; // Importa AuthContext y UserRole
import { ProductCategory } from './ProductStore';

import RecordProductSaleForm from './RecordProductSaleForm';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
 // Asegúrate que el puerto sea el de tu backend

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number; // Sigue siendo number en la interfaz
  isActive: boolean;
  imageUrl?: string;
  category?: ProductCategory;
}

const ManageProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const [isRecordSaleModalOpen, setIsRecordSaleModalOpen] = useState<boolean>(false);

  const { hasRole } = useContext(AuthContext); // Para permisos

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<Product[]>(`${API_BASE_URL}/products`);
      setProducts(response.data);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.message || "Error al cargar los productos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar el producto "${productName}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) {
      return;
    }

    setIsDeleting(productId);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/products/${productId}`);
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productId)
      );
      console.log(`Producto "${productName}" eliminado exitosamente.`);
    } catch (err: any) {
      console.error("Error deleting product:", err);
      if (err.response?.status === 401) {
        setError("No tienes autorización para eliminar productos. Por favor, inicia sesión nuevamente.");
      } else if (err.response?.status === 404) {
        setError("El producto no fue encontrado. Puede que ya haya sido eliminado.");
        setProducts(prevProducts => 
          prevProducts.filter(product => product.id !== productId)
        );
      } else {
        setError(err.message || "Error al eliminar el producto.");
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingProduct(undefined);
    fetchProducts(); // Recarga la lista
    toast.success('Producto guardado exitosamente');
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
    setEditingProduct(undefined);
  };

  // --- FUNCIONES PARA REGISTRAR VENTA ---
  const handleOpenRecordSaleModal = () => {
    setIsRecordSaleModalOpen(true);
  };

  const handleRecordSaleSuccess = () => {
    setIsRecordSaleModalOpen(false);
    // Opcional: Recargar productos si la venta afecta el stock (aunque no lo tenemos)
    // fetchProducts();
    // toast.success("Venta registrada exitosamente."); // El formulario ya muestra el toast
  };

  const handleRecordSaleCancel = () => {
    setIsRecordSaleModalOpen(false);
  };
  // --- FIN FUNCIONES REGISTRAR VENTA ---

  if (isLoading) {
    return (
      <div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Recargar Página</button>
      </div>
    );
  }

  return (
    <div className="admin-content-container">
      <h2>Gestionar Productos</h2>

      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          justifyContent: "flex-start",
        }}
      >
        {hasRole(UserRole.ADMIN) && (
          <button
            className="action-button"
            style={{ backgroundColor: "var(--color-success)" }}
            onClick={handleOpenCreateModal}
          >
            Añadir Nuevo Producto
          </button>
        )}
        {hasRole(UserRole.ADMIN) && ( // Ambos roles pueden registrar ventas
          <button
            className="action-button"
            style={{ backgroundColor: "var(--color-info)" }} // Un color diferente para registrar venta
            onClick={handleOpenRecordSaleModal}
          >
            Registrar Venta
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <p>No hay productos para mostrar.</p>
      ) : (
        <table border={1} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.description?.substring(0, 50)}...</td>
                <td>${parseFloat(product.price.toString()).toFixed(2)}</td>
                <td>{product.isActive ? "Activo" : "Inactivo"}</td>
                <td>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} width="50" />
                  ) : (
                    "No img"
                  )}
                </td>
                <td>
                  <button
                    style={{
                      marginRight: "5px",
                      backgroundColor: "#ffc107",
                      color: "black",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleOpenEditModal(product)}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() =>
                      handleDeleteProduct(product.id, product.name)
                    }
                    disabled={isDeleting === product.id}
                    style={{
                      backgroundColor:
                        isDeleting === product.id ? "#ccc" : "#ff4444",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      cursor:
                        isDeleting === product.id ? "not-allowed" : "pointer",
                    }}
                  >
                    {isDeleting === product.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={editingProduct ? "Editar Producto" : "Añadir Nuevo Producto"}
      >
        <ProductForm
          product={editingProduct}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* --- MODAL PARA REGISTRAR VENTA --- */}
      <Modal
        isOpen={isRecordSaleModalOpen}
        onClose={handleRecordSaleCancel}
        title="Registrar Venta de Producto"
      >
        <RecordProductSaleForm
          onSuccess={handleRecordSaleSuccess}
          onCancel={handleRecordSaleCancel}
        />
      </Modal>
    </div>
  );
};

export default ManageProducts;
