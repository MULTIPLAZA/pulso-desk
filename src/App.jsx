import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './lib/theme'
import { AuthProvider, useAuth } from './lib/auth'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import SinPerfil from './pages/SinPerfil'
import Inicio from './pages/Inicio'
import Clientes from './pages/Clientes'
import NuevoCliente from './pages/NuevoCliente'
import ClienteDetalle from './pages/ClienteDetalle'
import Tickets from './pages/Tickets'
import NuevoTicket from './pages/NuevoTicket'
import TicketDetalle from './pages/TicketDetalle'
import Solicitudes from './pages/Solicitudes'
import NuevaSolicitud from './pages/NuevaSolicitud'
import SolicitudDetalle from './pages/SolicitudDetalle'
import Ordenes from './pages/Ordenes'
import NuevaOrden from './pages/NuevaOrden'
import OrdenDetalle from './pages/OrdenDetalle'
import Dashboard from './pages/Dashboard'
import Mas from './pages/Mas'

function AppShell() {
  const { session, perfil, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  if (!session) return <Login />
  if (!perfil || !perfil.activo) return <SinPerfil />

  return (
    <BrowserRouter>
      <Sidebar />
      <div className="lg:pl-56">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 max-w-lg lg:max-w-6xl mx-auto">
          <Routes>
            <Route path="/"                    element={<Inicio />} />
            <Route path="/dashboard"           element={<Dashboard />} />
            <Route path="/clientes"            element={<Clientes />} />
            <Route path="/clientes/nuevo"      element={<NuevoCliente />} />
            <Route path="/clientes/:id"        element={<ClienteDetalle />} />
            <Route path="/tickets"             element={<Tickets />} />
            <Route path="/tickets/nuevo"       element={<NuevoTicket />} />
            <Route path="/tickets/:id"         element={<TicketDetalle />} />
            <Route path="/solicitudes"         element={<Solicitudes />} />
            <Route path="/solicitudes/nueva"   element={<NuevaSolicitud />} />
            <Route path="/solicitudes/:id"     element={<SolicitudDetalle />} />
            <Route path="/ordenes"             element={<Ordenes />} />
            <Route path="/ordenes/nueva"       element={<NuevaOrden />} />
            <Route path="/ordenes/:id"         element={<OrdenDetalle />} />
            <Route path="/mas"                 element={<Mas />} />
            <Route path="*"                    element={<Navigate to="/" />} />
          </Routes>
          <BottomNav />
        </div>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  )
}
