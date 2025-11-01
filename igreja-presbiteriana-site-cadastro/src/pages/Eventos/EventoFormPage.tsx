import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Save, X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  createEvento,
  updateEvento,
  getEventoById,
  uploadImagemEvento,
} from '../../services/eventoService';
import { getAllTiposEvento } from '../../services/tipoEventoService';
import { getAllSociedades } from '../../services/sociedadeService';
import type { EventoInput, TipoEvento, Sociedades } from '../../types';

import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { Select } from '../../components/Common/Select';
import { Textarea } from '../../components/Common/Textarea';
import { ImageUpload } from '../../components/Common/ImageUpload';

import styles from './EventoFormPage.module.css';

// ============================================
// VALIDAÇÃO DO FORMULÁRIO
// ============================================

const eventoSchema = z.object({
  nmEvento: z
    .string()
    .min(1, 'Nome do evento é obrigatório')
    .max(100, 'Nome muito longo'),
  cdTipoEvento: z.number().min(1, 'Tipo de evento é obrigatório'),
  dtEvento: z.string().min(1, 'Data do evento é obrigatória'),
  horaEvento: z.string().min(1, 'Hora do evento é obrigatória'),
  enderecoEvento: z.string().optional(),
  cdSociedade: z.number().nullable().optional(),
  descricao: z.string().optional(),
  imagemEvento: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
  ativo: z.boolean().optional(),
});

type EventoFormData = z.infer<typeof eventoSchema>;

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const EventoFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  // Estados
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
  const [sociedades, setSociedades] = useState<Sociedades[]>([]);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      nmEvento: '',
      cdTipoEvento: 0,
      dtEvento: '',
      horaEvento: '',
      enderecoEvento: '',
      cdSociedade: null,
      descricao: '',
      imagemEvento: null,
      ativo: true,
    },
  });

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [tiposData, sociedadesData] = await Promise.all([
        getAllTiposEvento(),
        getAllSociedades(),
      ]);

      setTiposEvento(tiposData);
      setSociedades(sociedadesData);

      // Se estiver editando, carregar dados do evento
      if (isEditing && id) {
        const eventoData = await getEventoById(parseInt(id));
        if (eventoData) {
          reset({
            nmEvento: eventoData.nmEvento,
            cdTipoEvento: eventoData.cdTipoEvento,
            dtEvento: eventoData.dtEvento,
            horaEvento: eventoData.horaEvento,
            enderecoEvento: eventoData.enderecoEvento || '',
            cdSociedade: eventoData.cdSociedade,
            descricao: eventoData.descricao || '',
            imagemEvento: eventoData.imagemEvento,
            ativo: eventoData.ativo,
          });

          if (eventoData.imagemEvento) {
            setImagemPreview(eventoData.imagemEvento);
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Manipular upload de imagem
  const handleImageUpload = (file: File) => {
    setValue('imagemEvento', file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagemPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setValue('imagemEvento', null);
    setImagemPreview(null);
  };

  // Salvar evento
  const onSubmit = async (data: EventoFormData) => {
    try {
      setSaving(true);

      let imagemUrl = isEditing ? (watch('imagemEvento') as string) : null;

      // Upload da imagem se houver
      if (data.imagemEvento instanceof File) {
        if (isEditing && id) {
          imagemUrl = await uploadImagemEvento(data.imagemEvento, parseInt(id));
        } else {
          // Para novos eventos, primeiro criamos o evento e depois fazemos upload
          // Por enquanto, vamos criar sem imagem e depois atualizar
          imagemUrl = null;
        }
      }

      const eventoData: EventoInput = {
        nmEvento: data.nmEvento,
        cdTipoEvento: data.cdTipoEvento,
        dtEvento: data.dtEvento,
        horaEvento: data.horaEvento,
        enderecoEvento: data.enderecoEvento || undefined,
        cdSociedade: data.cdSociedade || null,
        descricao: data.descricao || undefined,
        imagemEvento: imagemUrl,
        ativo: data.ativo ?? true,
      };

      if (isEditing && id) {
        await updateEvento(parseInt(id), eventoData);
        toast.success('Evento atualizado com sucesso!');
        // se `imagemEvento` era um File, já fizemos upload antes e incluímos a URL
        // no payload (upload-first), portanto não precisamos enviar novamente
      } else {
        const novoEvento = await createEvento(eventoData);

        // Se tinha imagem, fazer upload agora
        if (data.imagemEvento instanceof File) {
          const uploadedUrl = await uploadImagemEvento(
            data.imagemEvento,
            novoEvento.cdEvento
          );
          await updateEvento(novoEvento.cdEvento, {
            imagemEvento: uploadedUrl,
          });
        }

        toast.success('Evento criado com sucesso!');
      }

      navigate('/eventos');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar evento');
    } finally {
      setSaving(false);
    }
  };

  // Cancelar
  const handleCancel = () => {
    if (
      window.confirm(
        'Deseja cancelar? As alterações não salvas serão perdidas.'
      )
    ) {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Carregando...</p>
        </div>
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
          <h1 className={styles.title}>
            <Calendar size={24} />
            {isEditing ? 'Editar Evento' : 'Novo Evento'}
          </h1>
          <p className={styles.subtitle}>
            {isEditing
              ? 'Atualize as informações do evento'
              : 'Preencha os dados do novo evento'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Coluna 1 */}
          <div className={styles.formColumn}>
            {/* Nome do Evento */}
            <div className={styles.formGroup}>
              <Input
                label='Nome do Evento *'
                placeholder='Digite o nome do evento'
                error={errors.nmEvento?.message}
                {...register('nmEvento')}
              />
            </div>

            {/* Tipo de Evento */}
            <div className={styles.formGroup}>
              <Select
                label='Tipo de Evento *'
                error={errors.cdTipoEvento?.message}
                {...register('cdTipoEvento', { valueAsNumber: true })}
                options={[
                  { value: '', label: 'Selecione o tipo' },
                  ...tiposEvento.map((te) => ({
                    value: te.cdTipoEvento.toString(),
                    label: te.nmTipoEvento,
                  })),
                ]}
              />
            </div>

            {/* Data e Hora */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  label='Data *'
                  type='date'
                  error={errors.dtEvento?.message}
                  {...register('dtEvento')}
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  label='Hora *'
                  type='time'
                  error={errors.horaEvento?.message}
                  {...register('horaEvento')}
                />
              </div>
            </div>

            {/* Sociedade */}
            <div className={styles.formGroup}>
              <Select
                label='Sociedade Organizadora'
                {...register('cdSociedade', {
                  setValueAs: (value) =>
                    value === '' ? null : parseInt(value),
                })}
                options={[
                  { value: '', label: 'Selecione a sociedade (opcional)' },
                  ...sociedades.map((s) => ({
                    value: s.cdSociedade.toString(),
                    label: s.nmSociedade,
                  })),
                ]}
              />
            </div>

            {/* Endereço */}
            <div className={styles.formGroup}>
              <Input
                label='Endereço'
                placeholder='Digite o endereço do evento (opcional)'
                error={errors.enderecoEvento?.message}
                {...register('enderecoEvento')}
              />
            </div>
          </div>

          {/* Coluna 2 */}
          <div className={styles.formColumn}>
            {/* Imagem */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Imagem do Evento</label>
              <ImageUpload
                label='Imagem do Evento'
                currentImage={imagemPreview}
                onImageSelect={handleImageUpload}
                onImageRemove={handleImageRemove}
                maxSizeMB={5}
              />
              <p className={styles.hint}>
                Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB.
              </p>
            </div>

            {/* Descrição */}
            <div className={styles.formGroup}>
              <Textarea
                label='Descrição'
                placeholder='Digite uma descrição para o evento (opcional)'
                rows={4}
                error={errors.descricao?.message}
                {...register('descricao')}
              />
            </div>

            {/* Status */}
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type='checkbox'
                  {...register('ativo')}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Evento ativo</span>
              </label>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className={styles.formActions}>
          <Button
            type='button'
            variant='secondary'
            onClick={handleCancel}
            disabled={saving}
          >
            <X size={16} />
            Cancelar
          </Button>

          <Button type='submit' disabled={saving}>
            {saving ? (
              <>
                <div className={styles.spinnerSmall}></div>
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />
                {isEditing ? 'Atualizar' : 'Criar'} Evento
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EventoFormPage;
