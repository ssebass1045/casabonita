// File: my-spa/src/components/AdminPanel.tsx
import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import ManageTreatments from './ManageTreatments';
import ManageBlogs from './ManageBlogs';

const AdminPanel = () => {
  return (

    <>
        <h1>Panel de Administrador</h1>
        <nav>
          <ul>
            <li><Link to="/admin/treatments">Gestionar Tratamientos</Link></li>
            <li><Link to="/admin/blogs">Gestionar Blogs</Link></li>
          </ul>
        </nav>
        
          <Routes>
            <Route path="treatments" element={<ManageTreatments />} />
            <Route path="blogs" element={<ManageBlogs />} />
          </Routes>
    </>
        
      
    
  );
};

export default AdminPanel;
