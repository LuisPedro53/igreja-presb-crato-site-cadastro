import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

import styles from './TiposConfigPage.module.css';
import { Input } from '../../components/Common/Input';
import { Button } from '../../components/Common/Button';

import {
  getAllTiposPessoa,
  createTipoPessoa,
  updateTipoPessoa,
  deleteTipoPessoa,
} from '../../services/tipoPessoaService';

import {
  getAllTiposEvento,
  createTipoEvento,
  updateTipoEvento,
  deleteTipoEvento,
} from '../../services/tipoEventoService';

import type { TipoPessoa, TipoEvento } from '../../types';

const TiposConfigPage: React.FC = () => {
  const [tiposPessoa, setTiposPessoa] = useState<TipoPessoa[]>([]);
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);

  const [loading, setLoading] = useState(false);

  const [novoTipoPessoa, setNovoTipoPessoa] = useState('');
  const [editingTipoPessoaId, setEditingTipoPessoaId] = useState<number | null>(
    null
  );
  const [editingTipoPessoaValue, setEditingTipoPessoaValue] = useState('');

  const [novoTipoEvento, setNovoTipoEvento] = useState('');
  const [editingTipoEventoId, setEditingTipoEventoId] = useState<number | null>(
    null
  );
  const [editingTipoEventoValue, setEditingTipoEventoValue] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [p, e] = await Promise.all([
        getAllTiposPessoa(),
        getAllTiposEvento(),
      ]);
      setTiposPessoa(p);
      setTiposEvento(e);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar tipos');
    } finally {
      setLoading(false);
    }
  };

  // Tipo Pessoa handlers
  const handleCreateTipoPessoa = async () => {
    if (!novoTipoPessoa.trim()) return toast.error('Informe o nome do tipo');
    try {
      await createTipoPessoa(novoTipoPessoa.trim());
      setNovoTipoPessoa('');
      toast.success('Tipo de pessoa criado');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar tipo');
    }
  };

  const startEditTipoPessoa = (t: TipoPessoa) => {
    setEditingTipoPessoaId(t.cdTipoPessoa);
    setEditingTipoPessoaValue(t.nmTipoPessoa);
  };

  const saveEditTipoPessoa = async () => {
    if (!editingTipoPessoaId) return;
    if (!editingTipoPessoaValue.trim())
      return toast.error('Informe o nome do tipo');
    try {
      await updateTipoPessoa(
        editingTipoPessoaId,
        editingTipoPessoaValue.trim()
      );
      setEditingTipoPessoaId(null);
      setEditingTipoPessoaValue('');
      toast.success('Tipo de pessoa atualizado');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar tipo');
    }
  };

  const handleDeleteTipoPessoa = async (id: number) => {
    if (!window.confirm('Confirma exclusão do tipo de pessoa?')) return;
    try {
      await deleteTipoPessoa(id);
      toast.success('Tipo removido');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir tipo');
    }
  };

  // Tipo Evento handlers
  const handleCreateTipoEvento = async () => {
    if (!novoTipoEvento.trim()) return toast.error('Informe o nome do tipo');
    try {
      await createTipoEvento(novoTipoEvento.trim());
      setNovoTipoEvento('');
      toast.success('Tipo de evento criado');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar tipo');
    }
  };

  const startEditTipoEvento = (t: TipoEvento) => {
    setEditingTipoEventoId(t.cdTipoEvento);
    setEditingTipoEventoValue(t.nmTipoEvento);
  };

  const saveEditTipoEvento = async () => {
    if (!editingTipoEventoId) return;
    if (!editingTipoEventoValue.trim())
      return toast.error('Informe o nome do tipo');
    try {
      await updateTipoEvento(
        editingTipoEventoId,
        editingTipoEventoValue.trim()
      );
      setEditingTipoEventoId(null);
      setEditingTipoEventoValue('');
      toast.success('Tipo de evento atualizado');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar tipo');
    }
  };

  const handleDeleteTipoEvento = async (id: number) => {
    if (!window.confirm('Confirma exclusão do tipo de evento?')) return;
    try {
      await deleteTipoEvento(id);
      toast.success('Tipo removido');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir tipo');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Configurações de Tipos</h1>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>Tipos de Pessoa</h2>

          <div className={styles.formRow}>
            <Input
              placeholder='Novo tipo de pessoa'
              value={novoTipoPessoa}
              onChange={(e) => setNovoTipoPessoa(e.target.value)}
            />
            <Button onClick={handleCreateTipoPessoa} icon={<Plus size={14} />}>
              Adicionar
            </Button>
          </div>

          <div className={styles.list}>
            {loading ? (
              <div>Carregando...</div>
            ) : tiposPessoa.length === 0 ? (
              <div>Nenhum tipo cadastrado</div>
            ) : (
              tiposPessoa.map((t) => (
                <div key={t.cdTipoPessoa} className={styles.listItem}>
                  {editingTipoPessoaId === t.cdTipoPessoa ? (
                    <>
                      <Input
                        value={editingTipoPessoaValue}
                        onChange={(e) =>
                          setEditingTipoPessoaValue(e.target.value)
                        }
                      />
                      <Button
                        onClick={saveEditTipoPessoa}
                        className={styles.smallBtn}
                      >
                        Salvar
                      </Button>
                      <Button
                        onClick={() => setEditingTipoPessoaId(null)}
                        variant='secondary'
                        className={styles.smallBtn}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className={styles.itemLabel}>{t.nmTipoPessoa}</div>
                      <div className={styles.itemActions}>
                        <Button
                          onClick={() => startEditTipoPessoa(t)}
                          variant='secondary'
                          size='small'
                          className={styles.iconBtn}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          onClick={() => handleDeleteTipoPessoa(t.cdTipoPessoa)}
                          variant='error'
                          size='small'
                          className={styles.iconBtn}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.card}>
          <h2>Tipos de Evento</h2>

          <div className={styles.formRow}>
            <Input
              placeholder='Novo tipo de evento'
              value={novoTipoEvento}
              onChange={(e) => setNovoTipoEvento(e.target.value)}
            />
            <Button onClick={handleCreateTipoEvento} icon={<Plus size={14} />}>
              Adicionar
            </Button>
          </div>

          <div className={styles.list}>
            {loading ? (
              <div>Carregando...</div>
            ) : tiposEvento.length === 0 ? (
              <div>Nenhum tipo cadastrado</div>
            ) : (
              tiposEvento.map((t) => (
                <div key={t.cdTipoEvento} className={styles.listItem}>
                  {editingTipoEventoId === t.cdTipoEvento ? (
                    <>
                      <Input
                        value={editingTipoEventoValue}
                        onChange={(e) =>
                          setEditingTipoEventoValue(e.target.value)
                        }
                      />
                      <Button
                        onClick={saveEditTipoEvento}
                        className={styles.smallBtn}
                      >
                        Salvar
                      </Button>
                      <Button
                        onClick={() => setEditingTipoEventoId(null)}
                        variant='secondary'
                        className={styles.smallBtn}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className={styles.itemLabel}>{t.nmTipoEvento}</div>
                      <div className={styles.itemActions}>
                        <Button
                          onClick={() => startEditTipoEvento(t)}
                          variant='secondary'
                          size='small'
                          className={styles.iconBtn}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          onClick={() => handleDeleteTipoEvento(t.cdTipoEvento)}
                          variant='error'
                          size='small'
                          className={styles.iconBtn}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiposConfigPage;
