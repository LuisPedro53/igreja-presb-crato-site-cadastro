import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { Textarea } from '../../components/Common/Textarea';

import {
  getSociedadeById,
  createSociedade,
  updateSociedade,
} from '../../services/sociedadeService';
import { sociedadeSchema } from '../../utils/validators';
import type { SociedadeInput } from '../../types';

import styles from './SociedadeFormPage.module.css';

const SociedadeFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SociedadeInput>({
    resolver: zodResolver(sociedadeSchema),
    defaultValues: { ativo: true },
  });

  useEffect(() => {
    if (isEdit && id) {
      loadSociedade(parseInt(id));
    }
  }, [id]);

  const loadSociedade = async (socId: number) => {
    try {
      setLoading(true);
      const s = await getSociedadeById(socId);
      if (s) {
        reset({
          nmSociedade: s.nmSociedade,
          sigla: s.sigla || undefined,
          descricao: s.descricao || undefined,
          ativo: s.ativo,
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar sociedade');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SociedadeInput) => {
    try {
      setLoading(true);
      if (isEdit && id) {
        await updateSociedade(parseInt(id), data);
        toast.success('Sociedade atualizada com sucesso');
      } else {
        await createSociedade(data);
        toast.success('Sociedade criada com sucesso');
      }

      navigate('/sociedades');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar sociedade');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className={styles.title}>
            {isEdit ? 'Editar Sociedade' : 'Nova Sociedade'}
          </h1>
          <p className={styles.subtitle}>
            {isEdit
              ? 'Atualize os dados da sociedade'
              : 'Preencha os dados da nova sociedade'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGroup}>
          <Input
            label='Nome da Sociedade'
            placeholder='Ex: União Feminina'
            error={errors.nmSociedade?.message}
            {...register('nmSociedade')}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroupInline}>
            <Input
              label='Sigla'
              placeholder='Ex: UMP'
              error={errors.sigla?.message}
              {...register('sigla')}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <Textarea
            label='Descrição'
            placeholder='Descrição opcional'
            rows={4}
            error={errors.descricao?.message}
            {...register('descricao')}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type='checkbox'
              className={styles.checkbox}
              {...register('ativo')}
            />
            <span className={styles.checkboxText}>Ativa</span>
          </label>
        </div>

        <div className={styles.formActions}>
          <Button
            type='button'
            variant='secondary'
            onClick={() => navigate('/sociedades')}
          >
            Cancelar
          </Button>

          <Button type='submit' disabled={loading}>
            {loading ? (
              <>
                <div className={styles.spinnerSmall}></div>
                Salvando...
              </>
            ) : (
              <>
                <Save size={14} /> {isEdit ? 'Atualizar' : 'Criar'} Sociedade
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SociedadeFormPage;
