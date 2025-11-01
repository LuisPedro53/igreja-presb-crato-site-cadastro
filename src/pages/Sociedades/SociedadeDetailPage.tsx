import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  getSociedadeById,
  getMembrosBySociedade,
} from '../../services/sociedadeService';
import {
  getAllPessoas,
  addPessoaToSociedade,
  removePessoaFromSociedade,
} from '../../services/pessoaService';
import type { Sociedades } from '../../types';

import { Button } from '../../components/Common/Button';
import { Select } from '../../components/Common/Select';

import styles from './SociedadeDetailPage.module.css';

const SociedadeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const socId = id ? parseInt(id) : null;

  const [sociedade, setSociedade] = useState<Sociedades | null>(null);
  const [membros, setMembros] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [selectedPessoa, setSelectedPessoa] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (socId) loadAll();
  }, [id]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [s, membrosData, pessoasData] = await Promise.all([
        getSociedadeById(socId!),
        getMembrosBySociedade(socId!),
        getAllPessoas({ ativo: true }),
      ]);

      setSociedade(s);
      setMembros(membrosData);
      setPessoas(pessoasData);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedPessoa || !socId) return;
    try {
      setLoading(true);
      await addPessoaToSociedade({
        cdpessoa: Number(selectedPessoa),
        cdSociedade: socId,
      });
      toast.success('Membro adicionado');
      setSelectedPessoa('');
      loadAll();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar membro');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (cdpessoaSociedade: number) => {
    if (!window.confirm('Deseja remover este membro da sociedade?')) return;
    try {
      setLoading(true);
      await removePessoaFromSociedade(cdpessoaSociedade);
      toast.success('Membro removido');
      loadAll();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover membro');
    } finally {
      setLoading(false);
    }
  };

  if (!socId) return <div className={styles.container}>Sociedade inválida</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant='outline'
          onClick={() => navigate('/sociedades')}
          className={styles.backButton}
        >
          <ArrowLeft size={18} /> Voltar
        </Button>
        <div>
          <h1 className={styles.title}>
            {sociedade?.nmSociedade || 'Sociedade'}
          </h1>
          <p className={styles.subtitle}>{sociedade?.sigla}</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.addRow}>
          <Select
            label='Adicionar pessoa'
            value={selectedPessoa}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedPessoa(e.target.value ? Number(e.target.value) : '')
            }
            options={[
              { value: '', label: 'Selecione uma pessoa' },
              ...pessoas.map((p) => ({ value: p.cdpessoa, label: p.nmPessoa })),
            ]}
          />
          <Button
            onClick={handleAdd}
            className={styles.addButton}
            disabled={loading || selectedPessoa === ''}
          >
            <Plus size={14} /> Adicionar
          </Button>
        </div>

        <div className={styles.membersList}>
          {membros.length === 0 ? (
            <p>Nenhum membro encontrado.</p>
          ) : (
            membros.map((m) => (
              <div key={m.cdpessoaSociedade} className={styles.memberItem}>
                <div className={styles.memberInfo}>
                  <strong>{m.pessoa?.nmpessoa}</strong>
                  <span>{m.cargo || ''}</span>
                </div>
                <div className={styles.memberActions}>
                  <Button
                    variant='error'
                    size='small'
                    onClick={() => handleRemove(m.cdpessoaSociedade)}
                    disabled={loading}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SociedadeDetailPage;
