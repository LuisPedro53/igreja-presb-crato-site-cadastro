import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { Select } from '../../components/Common/Select';
import { usuarioSchema } from '../../utils/validators';
import type { UsuarioFormData } from '../../utils/validators';

import {
  getUsuarioById,
  createUsuario,
  updateUsuario,
} from '../../services/usuarioService';
import { getAllPessoas } from '../../services/pessoaService';

import styles from './UsuarioFormPage.module.css';

const UsuarioFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [pessoas, setPessoas] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(usuarioSchema),
    defaultValues: { ativo: true },
  });

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const pessoasData = await getAllPessoas();
      setPessoas(pessoasData);

      if (isEdit && id) {
        const u = await getUsuarioById(parseInt(id));
        if (u) {
          reset({
            nmLogin: u.nmLogin,
            cdpessoa: u.cdpessoa || undefined,
            ativo: u.ativo,
          });
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      setLoading(true);
      if (isEdit && id) {
        await updateUsuario(parseInt(id), {
          nmLogin: data.nmLogin,
          cdpessoa: data.cdpessoa || null,
          ativo: data.ativo,
          senha: data.senha,
        });
        toast.success('Usuário atualizado');
      } else {
        await createUsuario({
          nmLogin: data.nmLogin,
          senha: data.senha,
          cdpessoa: data.cdpessoa || null,
          ativo: data.ativo,
        });
        toast.success('Usuário criado');
      }
      navigate('/usuarios');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant='outline'
          onClick={() => navigate('/usuarios')}
          className={styles.backButton}
        >
          <ArrowLeft size={18} /> Voltar
        </Button>
        <div>
          <h1 className={styles.title}>
            {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGroup}>
          <Input
            label='Login'
            placeholder='Login de acesso'
            error={errors.nmLogin?.message}
            {...register('nmLogin')}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroupInline}>
            <Input
              label='Senha'
              type='password'
              placeholder='Senha'
              error={errors.senha?.message}
              {...register('senha')}
            />
          </div>
          <div className={styles.formGroupInline}>
            <Input
              label='Confirmar Senha'
              type='password'
              placeholder='Confirmar senha'
              error={errors.confirmarSenha?.message}
              {...register('confirmarSenha')}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <Select
            label='Vincular a Pessoa (opcional)'
            placeholder='Selecione uma pessoa'
            options={[
              { value: '', label: 'Nenhuma' },
              ...pessoas.map((p) => ({ value: p.cdpessoa, label: p.nmPessoa })),
            ]}
            {...register('cdpessoa', { valueAsNumber: true })}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input type='checkbox' {...register('ativo')} />{' '}
            <span className={styles.checkboxText}>Ativo</span>
          </label>
        </div>

        <div className={styles.formActions}>
          <Button
            type='button'
            variant='secondary'
            onClick={() => navigate('/usuarios')}
          >
            Cancelar
          </Button>
          <Button type='submit' disabled={loading}>
            {loading ? (
              'Salvando...'
            ) : (
              <>
                <Save size={14} /> Salvar
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UsuarioFormPage;
