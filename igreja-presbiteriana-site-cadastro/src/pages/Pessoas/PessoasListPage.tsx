import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, User, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { Select } from '../../components/Common/Select';
import { getAllPessoas, deletePessoa } from '../../services/pessoaService';
import { getAllTiposPessoa } from '../../services/tipoPessoaService';
import { getAllSociedades } from '../../services/sociedadeService';
import type { PessoaCompleta, TipoPessoa } from '../../types';

import styles from './PessoasListPage.module.css';

export const PessoasListPage: React.FC = () => {
  const navigate = useNavigate();
  const [pessoas, setPessoas] = useState<PessoaCompleta[]>([]);
  const [tiposPessoa, setTiposPessoa] = useState<TipoPessoa[]>([]);
  const [sociedades, setSociedades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroAtivo, setFiltroAtivo] = useState<string>('true');
  const [filtroSociedade, setFiltroSociedade] = useState<string>('');

  // Carregar dados
  useEffect(() => {
    loadData();
  }, [filtroTipo, filtroAtivo, filtroSociedade]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar tipos e sociedades para os filtros
      const [tipos, socs] = await Promise.all([
        getAllTiposPessoa(),
        getAllSociedades(),
      ]);
      setTiposPessoa(tipos);
      setSociedades(socs || []);

      // Carregar pessoas com filtros
      const filters: any = {};

      if (filtroTipo) {
        filters.tipoPessoa = parseInt(filtroTipo);
      }

      if (filtroSociedade) {
        filters.sociedade = parseInt(filtroSociedade);
      }

      if (filtroAtivo !== '') {
        filters.ativo = filtroAtivo === 'true';
      }

      if (busca) {
        filters.busca = busca;
      }

      const data = await getAllPessoas(filters);
      // getAllPessoas agora já retorna cargoLabel/cargoLabels e vínculos, evitar N+1
      setPessoas(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar pessoas');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  const handleDelete = async (id: number, nome: string) => {
    if (!window.confirm(`Deseja realmente desativar ${nome}?`)) {
      return;
    }

    try {
      await deletePessoa(id);
      toast.success('Pessoa desativada com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao desativar pessoa');
    }
  };

  // Filtrar pessoas pela busca local
  const pessoasFiltradas = busca
    ? pessoas.filter((p) =>
        p.nmPessoa.toLowerCase().includes(busca.toLowerCase())
      )
    : pessoas;

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Carregando pessoas...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Button
            variant='outline'
            onClick={() => navigate('/dashboard')}
            className={styles.backButton}
          >
            <ArrowLeft size={20} />
            Voltar ao Dashboard
          </Button>
          <div>
            <h1 className={styles.title}>
              <User size={24} />
              Pessoas
            </h1>
            <p className={styles.subtitle}>
              Gerenciar cadastro de membros, visitantes e líderes
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate('/pessoas/novo')}
          className={styles.newButton}
        >
          <Plus size={16} />
          Nova Pessoa
        </Button>
      </div>

      {/* Filtros */}
      <div className={styles.filtersSection}>
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <Input
              type='text'
              placeholder='Buscar pessoas...'
              value={busca}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setBusca(e.target.value)
              }
              className={styles.searchInput}
            />
          </div>

          <Button variant='secondary' onClick={handleSearch}>
            <Search size={16} />
            Buscar
          </Button>
        </div>

        <div className={styles.filtersRow}>
          <Select
            label='Tipo de Pessoa'
            options={[
              { value: '', label: 'Todos os tipos' },
              ...tiposPessoa.map((t) => ({
                value: t.cdTipoPessoa.toString(),
                label: t.nmTipoPessoa,
              })),
            ]}
            value={filtroTipo}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFiltroTipo(e.target.value)
            }
          />

          <Select
            label='Status'
            options={[
              { value: 'true', label: 'Apenas ativos' },
              { value: 'false', label: 'Apenas inativos' },
              { value: '', label: 'Todos' },
            ]}
            value={filtroAtivo}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFiltroAtivo(e.target.value)
            }
          />

          <Select
            label='Sociedade'
            options={[
              { value: '', label: 'Todas as sociedades' },
              ...sociedades.map((s) => ({
                value: s.cdSociedade.toString(),
                label: s.sigla && s.sigla.trim() ? s.sigla : s.nmSociedade,
              })),
            ]}
            value={filtroSociedade}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFiltroSociedade(e.target.value)
            }
          />
        </div>
      </div>

      {/* Tabela */}
      <div className={styles.tableContainer}>
        {pessoasFiltradas.length === 0 ? (
          <div className={styles.emptyState}>
            <User size={48} />
            <h3>Nenhuma pessoa encontrada</h3>
            <p>
              {busca || filtroTipo || filtroAtivo !== 'true'
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece cadastrando a primeira pessoa.'}
            </p>
            <Button onClick={() => navigate('/pessoas/novo')}>
              <Plus size={16} />
              Cadastrar Primeira Pessoa
            </Button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Idade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pessoasFiltradas.map((pessoa) => (
                <tr key={pessoa.cdpessoa}>
                  <td>
                    <div className={styles.avatarCell}>
                      {pessoa.fotoPessoa ? (
                        <img
                          src={pessoa.fotoPessoa}
                          alt={pessoa.nmPessoa}
                          className={styles.avatar}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          <User size={20} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className={styles.nameCell}>{pessoa.nmPessoa}</td>
                  <td>
                    <div>
                      <span className={styles.badge}>
                        {pessoa.nmTipoPessoa}
                      </span>
                    </div>
                  </td>
                  <td>{pessoa.telefone || '-'}</td>
                  <td>{pessoa.email || '-'}</td>
                  <td>{pessoa.idade ? `${pessoa.idade} anos` : '-'}</td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        pessoa.ativo ? styles.active : styles.inactive
                      }`}
                    >
                      {pessoa.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => navigate(`/pessoas/${pessoa.cdpessoa}`)}
                        title='Visualizar'
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() =>
                          navigate(`/pessoas/editar/${pessoa.cdpessoa}`)
                        }
                        title='Editar'
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() =>
                          handleDelete(pessoa.cdpessoa, pessoa.nmPessoa)
                        }
                        title='Desativar'
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Estatísticas */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{pessoasFiltradas.length}</span>
          <span className={styles.statLabel}>Total de Pessoas</span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statNumber}>
            {pessoasFiltradas.filter((p) => p.ativo).length}
          </span>
          <span className={styles.statLabel}>Pessoas Ativas</span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statNumber}>
            {pessoasFiltradas.filter((p) => p.nmTipoPessoa === 'Membro').length}
          </span>
          <span className={styles.statLabel}>Membros</span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statNumber}>
            {pessoasFiltradas.filter((p) => p.idade && p.idade < 18).length}
          </span>
          <span className={styles.statLabel}>Menores de 18</span>
        </div>
      </div>
    </div>
  );
};
