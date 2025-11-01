import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Users } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { Textarea } from '../../components/Common/Textarea';
import { Select } from '../../components/Common/Select';
import { getAllPessoas } from '../../services/pessoaService';
import {
  getAllConselhos,
  getConselhoById,
  createConselho,
  updateConselho,
} from '../../services/conselhoService';
import type { PessoaCompleta } from '../../types';

import styles from './ConselhoFormPage.module.css';

// Schema de validação
const conselhoSchema = z.object({
  cdpessoa: z.number().min(1, 'Pessoa é obrigatória'),
  datainicio: z.string().min(1, 'Data de início é obrigatória'),
  datafim: z.string().optional(),
  observacao: z.string().optional(),
  ativo: z.boolean(),
});

type ConselhoFormData = z.infer<typeof conselhoSchema>;

const ConselhoFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [pessoas, setPessoas] = useState<PessoaCompleta[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConselhoFormData>({
    resolver: zodResolver(conselhoSchema),
    defaultValues: {
      ativo: true,
    },
  });

  useEffect(() => {
    loadPessoas();
    if (isEditing && id) {
      loadConselho(parseInt(id));
    }
  }, [isEditing, id]);

  const loadPessoas = async () => {
    try {
      const data = await getAllPessoas();
      // Filtrar apenas pessoas ativas com cargos de liderança (Pastor, Presbítero, Diácono)
      const pessoasLideranca = data.filter(
        (pessoa) =>
          pessoa.ativo &&
          (pessoa.nmTipoPessoa === 'Pastor' ||
            pessoa.nmTipoPessoa === 'Presbítero' ||
            pessoa.nmTipoPessoa === 'Diácono')
      );
      setPessoas(pessoasLideranca);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
      toast.error('Erro ao carregar lista de pessoas');
    }
  };

  const loadConselho = async (conselhoId: number) => {
    try {
      setLoading(true);
      const data = await getConselhoById(conselhoId);
      if (data) {
        reset({
          cdpessoa: data.cdpessoa,
          datainicio: data.datainicio,
          datafim: data.datafim || '',
          observacao: data.observacao || '',
          ativo: data.ativo,
        });
      } else {
        toast.error('Conselho não encontrado');
        navigate('/conselho');
      }
    } catch (error) {
      console.error('Erro ao carregar conselho:', error);
      toast.error('Erro ao carregar dados do conselho');
      navigate('/conselho');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ConselhoFormData) => {
    try {
      setLoading(true);

      // Verificar se a pessoa já está no conselho ativo
      if (data.ativo) {
        const conselhosAtivos = await getAllConselhos();
        const pessoaJaNoConselho = conselhosAtivos.find(
          (c) =>
            c.cdpessoa === data.cdpessoa &&
            c.ativo &&
            (!isEditing || c.cdLider !== parseInt(id!))
        );

        if (pessoaJaNoConselho) {
          toast.error('Esta pessoa já está ativa no conselho');
          return;
        }
      }

      const conselhoData = {
        cdpessoa: data.cdpessoa,
        datainicio: data.datainicio,
        datafim: data.datafim || undefined,
        observacao: data.observacao || undefined,
        ativo: data.ativo,
      };

      if (isEditing && id) {
        await updateConselho(parseInt(id), conselhoData);
        toast.success('Membro do conselho atualizado com sucesso!');
      } else {
        await createConselho(conselhoData);
        toast.success('Membro adicionado ao conselho com sucesso!');
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar conselho:', error);
      toast.error('Erro ao salvar membro do conselho');
    } finally {
      setLoading(false);
    }
  };

  const pessoaOptions = [
    { value: 0, label: 'Selecione uma pessoa' },
    ...pessoas.map((pessoa) => ({
      value: pessoa.cdpessoa,
      label: `${pessoa.nmPessoa} - ${pessoa.nmTipoPessoa}`,
    })),
  ];

  if (loading && isEditing) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando dados do conselho...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Button
          variant='outline'
          onClick={() => navigate('/dashboard')}
          className={styles.backButton}
        >
          <ArrowLeft size={20} />
          Voltar ao Dashboard
        </Button>
        <div className={styles.titleSection}>
          <Users className={styles.titleIcon} size={32} />
          <div>
            <h1 className={styles.title}>
              {isEditing
                ? 'Editar Membro do Conselho'
                : 'Adicionar Membro ao Conselho'}
            </h1>
            <p className={styles.subtitle}>
              {isEditing
                ? 'Atualize as informações do membro do conselho'
                : 'Adicione um novo membro ao conselho da igreja'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Pessoa */}
            <div className={styles.formColumn}>
              <Select
                label='Pessoa (Pastor, Presbítero ou Diácono) *'
                options={pessoaOptions}
                error={errors.cdpessoa?.message}
                {...register('cdpessoa', { valueAsNumber: true })}
                required
              />
              <p className={styles.helpText}>
                Apenas pessoas com cargo de liderança podem ser adicionadas ao
                conselho
              </p>
            </div>

            {/* Data Início */}
            <div className={styles.formColumn}>
              <Input
                label='Data de Início *'
                type='date'
                error={errors.datainicio?.message}
                {...register('datainicio')}
                required
              />
            </div>

            {/* Data Fim */}
            <div className={styles.formColumn}>
              <Input
                label='Data de Fim (opcional)'
                type='date'
                error={errors.datafim?.message}
                {...register('datafim')}
              />
            </div>

            {/* Status */}
            <div className={styles.formColumn}>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type='checkbox'
                    {...register('ativo')}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>Ativo no Conselho</span>
                </label>
              </div>
            </div>
          </div>

          {/* Observação */}
          <div className={styles.formRow}>
            <Textarea
              label='Observação'
              placeholder='Observações adicionais sobre o membro do conselho...'
              error={errors.observacao?.message}
              {...register('observacao')}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className={styles.formActions}>
            <Button
              type='button'
              variant='secondary'
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type='submit' variant='primary' disabled={loading}>
              <Save size={20} />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConselhoFormPage;
