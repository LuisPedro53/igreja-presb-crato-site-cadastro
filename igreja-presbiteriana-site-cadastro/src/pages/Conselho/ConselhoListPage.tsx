import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { Select } from '../../components/Common/Select';
import {
  getAllConselhos,
  deleteConselho,
} from '../../services/conselhoService';
import type { ConselhoCompleto } from '../../types';

import styles from './ConselhoListPage.module.css';

const ConselhoListPage: React.FC = () => {
  const navigate = useNavigate();
  const [conselhos, setConselhos] = useState<ConselhoCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [cargoFilter, setCargoFilter] = useState<string>('todos');

  useEffect(() => {
    loadConselhos();
  }, []);

  const loadConselhos = async () => {
    try {
      setLoading(true);
      const data = await getAllConselhos();
      setConselhos(data);
    } catch (error) {
      console.error('Erro ao carregar conselhos:', error);
      toast.error('Erro ao carregar conselhos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir ${nome} do conselho?`)) {
      try {
        await deleteConselho(id);
        toast.success('Membro do conselho excluído com sucesso!');
        loadConselhos();
      } catch (error) {
        console.error('Erro ao excluir membro do conselho:', error);
        toast.error('Erro ao excluir membro do conselho');
      }
    }
  };

  const filteredConselhos = conselhos.filter((conselho) => {
    const matchesSearch =
      conselho.nmPessoa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conselho.cargo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativo' && conselho.ativo) ||
      (statusFilter === 'inativo' && !conselho.ativo);

    const matchesCargo =
      cargoFilter === 'todos' ||
      conselho.cargo.toLowerCase() === cargoFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCargo;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando conselhos...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Button
            variant='outline'
            onClick={() => navigate('/dashboard')}
            className={styles.backButton}
          >
            <ArrowLeft size={20} />
            Voltar ao Dashboard
          </Button>
        </div>
        <div className={styles.titleSection}>
          <div className={styles.titleContent}>
            <Users className={styles.titleIcon} size={32} />
            <div>
              <h1 className={styles.title}>Conselho</h1>
              <p className={styles.subtitle}>
                Gerencie os membros do conselho da igreja
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/conselho/novo')}
            className={styles.newButton}
          >
            <Plus size={20} />
            Novo Membro
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.searchRow}>
          <div className={styles.searchGroup}>
            <Search className={styles.searchIcon} size={20} />
            <Input
              type='text'
              placeholder='Buscar por nome ou cargo...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <Select
              options={[
                { value: 'todos', label: 'Todos os Cargos' },
                { value: 'pastor', label: 'Pastor' },
                { value: 'presbítero', label: 'Presbítero' },
                { value: 'diácono', label: 'Diácono' },
              ]}
              value={cargoFilter}
              onChange={(e) => setCargoFilter(e.target.value)}
              className={styles.cargoFilter}
            />
          </div>
          <div className={styles.filterGroup}>
            <Select
              options={[
                { value: 'todos', label: 'Todos os Status' },
                { value: 'ativo', label: 'Ativos' },
                { value: 'inativo', label: 'Inativos' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.statusFilter}
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className={styles.contentSection}>
        {filteredConselhos.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={64} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Nenhum membro encontrado</h3>
            <p className={styles.emptyText}>
              {searchTerm || statusFilter !== 'todos' || cargoFilter !== 'todos'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando o primeiro membro do conselho'}
            </p>
            {!searchTerm &&
              statusFilter === 'todos' &&
              cargoFilter === 'todos' && (
                <Button
                  onClick={() => navigate('/conselho/novo')}
                  className={styles.emptyButton}
                >
                  <Plus size={20} />
                  Adicionar Primeiro Membro
                </Button>
              )}
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Cargo</th>
                  <th>Data Início</th>
                  <th>Data Fim</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredConselhos.map((conselho) => (
                  <tr key={conselho.cdLider}>
                    <td>
                      <div className={styles.photoCell}>
                        {conselho.fotoPessoa ? (
                          <img
                            src={conselho.fotoPessoa}
                            alt={conselho.nmPessoa}
                            className={styles.photo}
                          />
                        ) : (
                          <div className={styles.photoPlaceholder}>
                            <Users size={24} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={styles.nameCell}>
                      <div className={styles.nameInfo}>
                        <span className={styles.name}>{conselho.nmPessoa}</span>
                        {conselho.email && (
                          <span className={styles.email}>{conselho.email}</span>
                        )}
                      </div>
                    </td>
                    <td>{conselho.cargo}</td>
                    <td>{formatDate(conselho.datainicio)}</td>
                    <td>
                      {conselho.datafim ? formatDate(conselho.datafim) : '-'}
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          conselho.ativo
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {conselho.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          variant='secondary'
                          size='small'
                          onClick={() =>
                            navigate(`/conselho/${conselho.cdLider}`)
                          }
                          title='Visualizar'
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant='secondary'
                          size='small'
                          onClick={() =>
                            navigate(`/conselho/editar/${conselho.cdLider}`)
                          }
                          title='Editar'
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant='error'
                          size='small'
                          onClick={() =>
                            handleDelete(conselho.cdLider, conselho.nmPessoa)
                          }
                          title='Excluir'
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConselhoListPage;
