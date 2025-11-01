import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  getAllSociedades,
  deleteSociedade,
} from '../../services/sociedadeService';
import type { Sociedades } from '../../types';

import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';

import styles from './SociedadesListPage.module.css';

const SociedadesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [sociedades, setSociedades] = useState<Sociedades[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAtivo, setFilterAtivo] = useState('true');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Buscar todas (inclui inativos) e filtrar localmente conforme seleção
      const all = await getAllSociedades(false);
      setSociedades(all);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar sociedades');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (s: Sociedades) => {
    if (!window.confirm(`Deseja desativar a sociedade "${s.nmSociedade}"?`))
      return;
    try {
      await deleteSociedade(s.cdSociedade);
      toast.success('Sociedade desativada');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao desativar sociedade');
    }
  };

  const filtered = sociedades.filter((s) => {
    const matchesSearch =
      searchTerm === '' ||
      s.nmSociedade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.sigla || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAtivo =
      filterAtivo === ''
        ? true
        : filterAtivo === 'true'
        ? s.ativo === true
        : s.ativo === false;

    return matchesSearch && matchesAtivo;
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Carregando sociedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant='outline'
          onClick={() => navigate('/dashboard')}
          className={styles.backButton}
        >
          <ArrowLeft size={18} />
          Voltar ao Dashboard
        </Button>

        <div className={styles.titleSection}>
          <div className={styles.titleContent}>
            <h1 className={styles.title}>Sociedades</h1>
            <p className={styles.subtitle}>Gerencie as sociedades da igreja</p>
          </div>

          <Button
            onClick={() => navigate('/sociedades/novo')}
            className={styles.newButton}
          >
            <Plus size={14} />
            Nova Sociedade
          </Button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={14} />
          <Input
            placeholder='Buscar sociedades...'
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className={styles.searchInput}
          />
        </div>

        <select
          value={filterAtivo}
          onChange={(e) => setFilterAtivo(e.target.value)}
          className={styles.selectFilter}
        >
          <option value=''>Todos</option>
          <option value='true'>Ativos</option>
          <option value='false'>Inativos</option>
        </select>
      </div>

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <h3>Nenhuma sociedade encontrada</h3>
            <p>Crie a primeira sociedade para começar.</p>
            <Button onClick={() => navigate('/sociedades/novo')}>
              <Plus size={14} /> Criar Sociedade
            </Button>
          </div>
        ) : (
          filtered.map((s) => (
            <div key={s.cdSociedade} className={styles.item}>
              <div className={styles.itemInfo}>
                <h4 className={styles.itemTitle}>{s.nmSociedade}</h4>
                {s.sigla && (
                  <span className={styles.itemSigla}>({s.sigla})</span>
                )}
                <p className={styles.itemDesc}>{s.descricao}</p>
              </div>

              <div className={styles.itemActions}>
                <Button
                  variant='secondary'
                  size='small'
                  onClick={() =>
                    navigate(`/sociedades/editar/${s.cdSociedade}`)
                  }
                >
                  <Edit size={14} />
                </Button>

                <Button
                  variant='error'
                  size='small'
                  onClick={() => handleDelete(s)}
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

export default SociedadesListPage;
