import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { LoginPage } from '../pages/Login/LoginPage';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { PessoasListPage } from '../pages/Pessoas/PessoasListPage';
import { PessoaFormPage } from '../pages/Pessoas/PessoaFormPage';
import { PessoaDetailPage } from '../pages/Pessoas/PessoaDetailPage';
import EventosListPage from '../pages/Eventos/EventosListPage';
import EventoFormPage from '../pages/Eventos/EventoFormPage';
import ConselhoListPage from '../pages/Conselho/ConselhoListPage';
import ConselhoFormPage from '../pages/Conselho/ConselhoFormPage';
import TiposConfigPage from '../pages/TiposConfig/TiposConfigPage';
import SociedadesListPage from '../pages/Sociedades/SociedadesListPage';
import SociedadeFormPage from '../pages/Sociedades/SociedadeFormPage';
import SociedadeDetailPage from '../pages/Sociedades/SociedadeDetailPage';
import SociedadeMembersPage from '../pages/Sociedades/SociedadeMembersPage';
import UsuariosListPage from '../pages/Usuarios/UsuariosListPage';
import UsuarioFormPage from '../pages/Usuarios/UsuarioFormPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path='/login' element={<LoginPage />} />

      {/* Rotas protegidas */}
      <Route
        path='/dashboard'
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      {/* Pessoas */}
      <Route
        path='/pessoas'
        element={
          <PrivateRoute>
            <PessoasListPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/pessoas/novo'
        element={
          <PrivateRoute>
            <PessoaFormPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/pessoas/editar/:id'
        element={
          <PrivateRoute>
            <PessoaFormPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/pessoas/:id'
        element={
          <PrivateRoute>
            <PessoaDetailPage />
          </PrivateRoute>
        }
      />

      {/* Eventos */}
      <Route
        path='/eventos'
        element={
          <PrivateRoute>
            <EventosListPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/eventos/novo'
        element={
          <PrivateRoute>
            <EventoFormPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/eventos/editar/:id'
        element={
          <PrivateRoute>
            <EventoFormPage />
          </PrivateRoute>
        }
      />

      {/* Conselho */}
      <Route
        path='/conselho'
        element={
          <PrivateRoute>
            <ConselhoListPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/conselho/novo'
        element={
          <PrivateRoute>
            <ConselhoFormPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/conselho/editar/:id'
        element={
          <PrivateRoute>
            <ConselhoFormPage />
          </PrivateRoute>
        }
      />

      {/* Sociedades */}
      <Route
        path='/sociedades'
        element={
          <PrivateRoute>
            <SociedadesListPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/sociedades/novo'
        element={
          <PrivateRoute>
            <SociedadeFormPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/sociedades/editar/:id'
        element={
          <PrivateRoute>
            <SociedadeFormPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/sociedades/:id'
        element={
          <PrivateRoute>
            <SociedadeDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/sociedades/:id/membros'
        element={
          <PrivateRoute>
            <SociedadeMembersPage />
          </PrivateRoute>
        }
      />

      {/* Usuários (Admin) */}
      <Route
        path='/usuarios'
        element={
          <PrivateRoute>
            <UsuariosListPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/usuarios/novo'
        element={
          <PrivateRoute>
            <UsuarioFormPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/usuarios/editar/:id'
        element={
          <PrivateRoute>
            <UsuarioFormPage />
          </PrivateRoute>
        }
      />

      {/* Tipos */}
      <Route
        path='/tipos'
        element={
          <PrivateRoute>
            <TiposConfigPage />
          </PrivateRoute>
        }
      />

      {/* Redirecionar / para /dashboard */}
      <Route path='/' element={<Navigate to='/dashboard' replace />} />

      {/* Rota 404 */}
      <Route path='*' element={<Navigate to='/dashboard' replace />} />
    </Routes>
  );
};
