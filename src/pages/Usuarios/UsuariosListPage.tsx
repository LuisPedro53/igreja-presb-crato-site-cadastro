import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { getAllUsuarios, deleteUsuario } from '../../services/usuarioService';
import { getAllPessoas } from '../../services/pessoaService';
import type { Usuario } from '../../types';

import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import styles from './UsuariosListPage.module.css';

const UsuariosListPage: React.FC = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [pessoasOptions, setPessoasOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [u, pessoas] = await Promise.all([
        getAllUsuarios(false),
        getAllPessoas(),
      ]);
      setUsuarios(u);
      setPessoasOptions(
        pessoas.map((p: any) => ({ value: p.cdpessoa, label: p.nmPessoa }))
      );
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user: Usuario) => {
    if (!window.confirm(`Deseja desativar o usuário ${user.nmLogin}?`)) return;
    try {
      await deleteUsuario(user.cdUsuario);
      toast.success('Usuário desativado');
      load();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao desativar usuário');
    }
  };

  const filtered = usuarios.filter(
    (u) =>
      search === '' ||
      u.nmLogin.toLowerCase().includes(search.toLowerCase()) ||
      (u.cdpessoa &&
        pessoasOptions
          .find((p) => p.value === u.cdpessoa)
          ?.label.toLowerCase()
          .includes(search.toLowerCase()))
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Usuários</h1>
        <div className={styles.headerActions}>
          <Input
            placeholder='Buscar...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <Button
            onClick={() => navigate('/usuarios/novo')}
            className={styles.newButton}
          >
            <Plus size={14} /> Novo Usuário
          </Button>
        </div>
      </div>

      <div className={styles.table}>
        <div className={styles.rowHeader}>
          <div>Login</div>
          <div>Pessoa</div>
          <div>Último Acesso</div>
          <div>Status</div>
          <div>Ações</div>
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>Nenhum usuário encontrado</div>
        ) : (
          filtered.map((u) => (
            <div key={u.cdUsuario} className={styles.row}>
              <div>{u.nmLogin}</div>
              <div>
                {pessoasOptions.find((p) => p.value === u.cdpessoa)?.label ||
                  '-'}
              </div>
              <div>
                {u.ultimo_acesso
                  ? new Date(u.ultimo_acesso).toLocaleString('pt-BR')
                  : '-'}
              </div>
              <div>{u.ativo ? 'Ativo' : 'Inativo'}</div>
              <div className={styles.actions}>
                <Button
                  variant='secondary'
                  size='small'
                  onClick={() => navigate(`/usuarios/editar/${u.cdUsuario}`)}
                >
                  <Edit size={14} />
                </Button>
                <Button
                  variant='error'
                  size='small'
                  onClick={() => handleDelete(u)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UsuariosListPage;
