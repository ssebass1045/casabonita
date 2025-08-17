// File: my-spa/src/components/MetricsDashboard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Sector, ResponsiveContainerProps } from 'recharts';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';


// --- INTERFACES PARA LAS MÉTRICAS ---
interface TopServiceMetric {
  serviceName: string;
  count: number;
}

interface TopProductMetric {
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

interface AppointmentStatusCount {
  status: string;
  count: number;
}

interface EmployeePerformance {
  employeeName: string;
  appointmentsCount: number;
  totalIncome: number;
}

interface MonthlyIncomeTrend {
  month: string;
  totalIncome: number;
}

interface UpcomingBirthday {
  id: number;
  name: string;
  dateOfBirth: string; 
  daysUntilBirthday: number;
}

// --- NUEVA INTERFAZ PARA EL HISTORIAL ---
interface DailyIncomeHistory {
  id: number;
  date: string;
  totalIncome: number;
  appointmentIncome: number;
  productSalesIncome: number;
  createdAt: string;
}


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const MetricsDashboard = () => {
  // --- ESTADOS PARA LAS MÉTRICAS ---
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
  const [dailyIncome, setDailyIncome] = useState<number | null>(null);
  const [productSalesIncome, setProductSalesIncome] = useState<number | null>(null);
  const [topServices, setTopServices] = useState<TopServiceMetric[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductMetric[]>([]);
  const [appointmentStatusCounts, setAppointmentStatusCounts] = useState<AppointmentStatusCount[]>([]);
  const [newClientsCount, setNewClientsCount] = useState<number | null>(null);
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance[]>([]);
  const [monthlyIncomeTrend, setMonthlyIncomeTrend] = useState<MonthlyIncomeTrend[]>([]);
  const [dailyProductSalesIncome, setDailyProductSalesIncome] = useState<number | null>(null);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<UpcomingBirthday[]>([]); 

  // --- NUEVOS ESTADOS PARA EL HISTORIAL ---
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [historicalIncome, setHistoricalIncome] = useState<DailyIncomeHistory | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);


  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  // --- RANGO DE FECHAS PARA LAS MÉTRICAS ---
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.toISOString().split('T')[0];

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [
          monthlyIncomeRes,
          dailyIncomeRes,
          topServicesRes,
          statusCountsRes,
          newClientsRes,
          employeePerformanceRes,
          productSalesIncomeRes,
          topProductsRes,
          dailyProductSalesIncomeRes,
          monthlyTrendRes,
          upcomingBirthdaysRes,
        ] = await Promise.all([
          axios.get<number>(`${API_BASE_URL}/metrics/income/monthly`, { params: { year: currentYear, month: currentMonth } }),
          axios.get<number>(`${API_BASE_URL}/metrics/income/daily`, { params: { date: currentDay } }),
          axios.get<TopServiceMetric[]>(`${API_BASE_URL}/metrics/services/top`),
          axios.get<any[]>(`${API_BASE_URL}/metrics/appointments/status-counts`, { params: { startDate: startDateStr, endDate: endDateStr } }),
          axios.get<number>(`${API_BASE_URL}/metrics/clients/new-count`, { params: { startDate: startDateStr, endDate: endDateStr } }),
          axios.get<any[]>(`${API_BASE_URL}/metrics/employees/performance`, { params: { startDate: startDateStr, endDate: endDateStr } }),
          axios.get<number>(`${API_BASE_URL}/metrics/products/sales-income`, { params: { startDate: startDateStr, endDate: endDateStr } }),
          axios.get<TopProductMetric[]>(`${API_BASE_URL}/metrics/products/top-selling`),
          axios.get<number>(`${API_BASE_URL}/metrics/products/sales-income/daily`, { params: { date: currentDay } }),
          axios.get<MonthlyIncomeTrend[]>(`${API_BASE_URL}/metrics/income/monthly-trend`),
          axios.get<UpcomingBirthday[]>(`${API_BASE_URL}/metrics/clients/upcoming-birthdays`),
        ]);

        setMonthlyIncome(monthlyIncomeRes.data);
        setDailyIncome(dailyIncomeRes.data);
        setTopServices(topServicesRes.data);
        setDailyProductSalesIncome(dailyProductSalesIncomeRes.data); 
        setMonthlyIncomeTrend(monthlyTrendRes.data);
        setUpcomingBirthdays(upcomingBirthdaysRes.data);
        
        setAppointmentStatusCounts(statusCountsRes.data.map(item => ({ ...item, count: parseInt(item.count, 10) })));
        setNewClientsCount(newClientsRes.data);
        setEmployeePerformance(employeePerformanceRes.data.map(item => ({
          ...item,
          appointmentsCount: parseInt(item.appointmentsCount, 10),
          totalIncome: parseFloat(item.totalIncome),
        })));
        setProductSalesIncome(productSalesIncomeRes.data);
        setTopProducts(topProductsRes.data);


      } catch (err: any) {
        console.error("Error fetching metrics:", err);
        if (err.response?.status === 401) {
          setError("No tienes autorización para ver las métricas. Por favor, inicia sesión nuevamente.");
        } else {
          setError(err.message || "Error al cargar las métricas.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [currentYear, currentMonth, currentDay, startDateStr, endDateStr]);

  // --- NUEVA FUNCIÓN PARA BUSCAR EN EL HISTORIAL ---
  const handleFetchHistoricalIncome = async (date: string) => {
    if (!date) return;
    setIsHistoryLoading(true);
    setHistoryError(null);
    setHistoricalIncome(null);
    try {
      const res = await axios.get<DailyIncomeHistory>(`${API_BASE_URL}/metrics/income/historical`, { params: { date } });
      setHistoricalIncome(res.data);
    } catch (err: any) {
      console.error("Error fetching historical income:", err);
      setHistoryError("Error al consultar el historial. Es posible que no haya datos para esta fecha.");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // --- NUEVA FUNCIÓN PARA GUARDAR EL DÍA ACTUAL ---
  const handleSaveDailyIncome = async () => {
    if (!window.confirm(`¿Estás seguro de que quieres guardar los ingresos del día ${currentDay}? Si ya existe un registro para hoy, se sobrescribirá.`)) {
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/metrics/income/save-daily`, { date: currentDay });
      alert(`Ingresos del día ${currentDay} guardados correctamente.`);
      // Opcional: volver a cargar el historial para la fecha actual
      handleFetchHistoricalIncome(currentDay);
    } catch (err: any) {
      console.error("Error saving daily income:", err);
      alert("Error al guardar los ingresos del día.");
    }
  };

  // Efecto para cargar el historial de la fecha seleccionada
  useEffect(() => {
    handleFetchHistoricalIncome(selectedDate);
  }, [selectedDate]);


  if (isLoading) {
    return <div>Cargando métricas...</div>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Panel de Métricas</h2>

      {/* Widgets Rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>💰 Ingreso del Mes (Citas)({currentMonth}/{currentYear})</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#28a745' }}>${monthlyIncome?.toFixed(2) || '0.00'}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>☀️ Ingreso del Día (Citas)({currentDay})</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#007bff' }}>${dailyIncome?.toFixed(2) || '0.00'}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>🛍️ Ingreso por Productos (últimos 30 días)</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#6f42c1' }}>${productSalesIncome?.toFixed(2) || '0.00'}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>☀️ Ingreso por Productos (Hoy)</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#6f42c1' }}>${dailyProductSalesIncome?.toFixed(2) || '0.00'}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>👥 Nuevos Clientes (últimos 30 días)</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#ffc107' }}>{newClientsCount ?? '0'}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <button onClick={handleSaveDailyIncome} style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
            Guardar Ingresos de Hoy
          </button>
          <p style={{ fontSize: '0.8em', color: '#6c757d', marginTop: '10px' }}>
            Guarda los ingresos de hoy en el historial. Úsalo al final del día.
          </p>
        </div>
      </div>

      {/* --- NUEVA SECCIÓN DE CONSULTA HISTÓRICA --- */}
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '40px', backgroundColor: '#f9f9f9' }}>
        <h3>📖 Consulta de Ingresos por Día</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="historical-date">Selecciona una fecha:</label>
            <input
              type="date"
              id="historical-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '8px', marginLeft: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          {isHistoryLoading && <p>Buscando...</p>}
        </div>

        {historyError && !isHistoryLoading && <p style={{ color: 'orange', marginTop: '15px' }}>{historyError}</p>}
        
        {historicalIncome && !isHistoryLoading && (
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ padding: '15px', backgroundColor: 'white', border: '1px solid #eee', borderRadius: '8px' }}>
              <h4>📈 Ingreso Total</h4>
              <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#dc3545' }}>${Number(historicalIncome.totalIncome).toFixed(2)}</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: 'white', border: '1px solid #eee', borderRadius: '8px' }}>
              <h4>🗓️ Ingreso por Citas</h4>
              <p style={{ fontSize: '1.5em', color: '#007bff' }}>${Number(historicalIncome.appointmentIncome).toFixed(2)}</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: 'white', border: '1px solid #eee', borderRadius: '8px' }}>
              <h4>🛍️ Ingreso por Productos</h4>
              <p style={{ fontSize: '1.5em', color: '#6f42c1' }}>${Number(historicalIncome.productSalesIncome).toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>


      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* ... (el resto de los gráficos no cambia) ... */}
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Crecimiento de Ingresos Mensuales (Citas + Productos)</h3>
          {monthlyIncomeTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={monthlyIncomeTrend} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']} />
                <Legend />
                <Area type="monotone" dataKey="totalIncome" stroke="#8884d8" fill="#8884d8" name="Ingresos Totales" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay datos suficientes para mostrar la tendencia de crecimiento.</p>
          )}
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Servicios Más Solicitados</h3>
          {topServices.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topServices} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="serviceName" angle={-45} textAnchor="end" interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Cantidad de Citas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay datos de servicios para mostrar.</p>
          )}
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Productos Más Vendidos</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" angle={-45} textAnchor="end" interval={0} />
                <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
                <YAxis yAxisId="right" orientation="right" stroke="#ffc658" />
                <Tooltip formatter={(value, name) => name === 'Ingresos' ? `$${Number(value).toFixed(2)}` : value} />
                <Legend />
                <Bar yAxisId="left" dataKey="totalQuantitySold" fill="#82ca9d" name="Cantidad Vendida" />
                <Bar yAxisId="right" dataKey="totalRevenue" fill="#ffc658" name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay datos de productos para mostrar.</p>
          )}
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Distribución de Estados de Citas (últimos 30 días)</h3>
          {appointmentStatusCounts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentStatusCounts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent ? `${name}: ${(percent * 100).toFixed(0)}%` : name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  >
                  {appointmentStatusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay datos de estados de citas para mostrar.</p>
          )}
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Rendimiento por Empleado (últimos 30 días)</h3>
          {employeePerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeePerformance} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="employeeName" angle={-45} textAnchor="end" interval={0} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip formatter={(value, name) => name === 'Ingresos' ? `$${Number(value).toFixed(2)}` : value} />
                <Legend />
                <Bar yAxisId="left" dataKey="appointmentsCount" fill="#8884d8" name="Citas Realizadas" />
                <Bar yAxisId="right" dataKey="totalIncome" fill="#82ca9d" name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay datos de rendimiento de empleados para mostrar.</p>
          )}
        </div>
         <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>🎂 Próximos Cumpleaños</h3>
          {upcomingBirthdays.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {upcomingBirthdays.map(client => (
                <li key={client.id} style={{ marginBottom: '5px' }}>
                  <strong>{client.name}</strong> - {client.dateOfBirth}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay cumpleaños próximos.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
