import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Multer (em memória) para uploads via API
const upload = multer({ storage: multer.memoryStorage() });

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Pessoa
app.post('/api/pessoa', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload?.nmpessoa)
      return res.status(400).json({ error: 'Campo nmpessoa é obrigatório' });

    const insertObj = {
      nmpessoa: payload.nmpessoa,
      cdtipopessoa: payload.cdtipopessoa ?? null,
      fotopessoa: payload.fotopessoa ?? null,
      dtnascimento: payload.dtnascimento ?? null,
      telefone: payload.telefone ?? null,
      email: payload.email ?? null,
      endereco: payload.endereco ?? null,
      ativo: payload.ativo ?? true,
    };

    const { data, error } = await supabase
      .from('pessoa')
      .insert(insertObj)
      .select()
      .single();
    if (error) {
      console.error('Supabase insert pessoa error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({ pessoa: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.patch('/api/pessoa/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body || {};
    payload.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('pessoa')
      .update(payload)
      .eq('cdpessoa', id)
      .select()
      .single();
    if (error) {
      console.error('Supabase update pessoa error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ pessoa: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Pessoa x Sociedade
app.post('/api/pessoassociedade', async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.cdpessoa || !payload.cdsociedade)
      return res
        .status(400)
        .json({ error: 'cdpessoa e cdsociedade são obrigatórios' });
    const insertObj = {
      cdpessoa: payload.cdpessoa,
      cdsociedade: payload.cdsociedade,
      // aceitar tanto o texto "cargo" quanto o FK cdpessoatiposociedade
      cargo: payload.cargo || null,
      cdpessoatiposociedade: payload.cdpessoatiposociedade ?? null,
      dataentrada:
        payload.dataentrada || new Date().toISOString().split('T')[0],
      ativo: true,
    };
    const { data, error } = await supabase
      .from('pessoassociedade')
      .insert(insertObj)
      .select()
      .single();
    if (error) {
      console.error('Supabase insert pessoassociedade error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({ pessoassociedade: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.patch('/api/pessoassociedade/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body || {};
    // Se o payload estiver vazio, assumir desativação
    const updateObj =
      Object.keys(payload).length === 0
        ? { ativo: false, updated_at: new Date().toISOString() }
        : {
            ...payload,
            // permitir atualizar o FK do tipo de cargo
            cdpessoatiposociedade:
              payload.cdpessoatiposociedade !== undefined
                ? payload.cdpessoatiposociedade
                : undefined,
            updated_at: new Date().toISOString(),
          };

    const { data, error } = await supabase
      .from('pessoassociedade')
      .update(updateObj)
      .eq('cdpessoasociedade', id)
      .select()
      .single();
    if (error) {
      console.error('Supabase update pessoassociedade error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ pessoassociedade: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// TIPOS DE CARGO (pessoatiposociedade)
app.get('/api/pessoatiposociedade', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('pessoatiposociedade')
      .select('*')
      .order('nmcargo', { ascending: true });
    if (error) {
      console.error('Erro ao buscar tipos de cargo:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ tipos: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.post('/api/pessoatiposociedade', async (req, res) => {
  try {
    const { nmcargo } = req.body || {};
    if (!nmcargo)
      return res.status(400).json({ error: 'nmcargo é obrigatório' });
    const { data, error } = await supabase
      .from('pessoatiposociedade')
      .insert({ nmcargo })
      .select()
      .single();
    if (error) {
      console.error('Erro ao criar tipo de cargo:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({ tipo: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.patch('/api/pessoatiposociedade/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body || {};
    const { data, error } = await supabase
      .from('pessoatiposociedade')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('cdpessoatiposociedade', id)
      .select()
      .single();
    if (error) {
      console.error('Erro ao atualizar tipo de cargo:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ tipo: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.delete('/api/pessoatiposociedade/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { error } = await supabase
      .from('pessoatiposociedade')
      .delete()
      .eq('cdpessoatiposociedade', id);
    if (error) {
      console.error('Erro ao deletar tipo de cargo:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Usuário
app.post('/api/usuario', async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.nmlogin || !payload.senha)
      return res
        .status(400)
        .json({ error: 'nmlogin e senha são obrigatórios' });
    // verificar existência
    const { data: existing, error: existErr } = await supabase
      .from('usuario')
      .select('cdusuario')
      .eq('nmlogin', payload.nmlogin)
      .single();
    if (existErr && existErr.code !== 'PGRST116') {
      console.error('Supabase select usuario error:', existErr);
      return res.status(500).json({ error: existErr.message });
    }
    if (existing) return res.status(400).json({ error: 'Login já existe' });
    const senhaHash = await bcrypt.hash(payload.senha, 10);
    const insertObj = {
      nmlogin: payload.nmlogin,
      senha: senhaHash,
      cdpessoa: payload.cdpessoa ?? null,
      ativo: payload.ativo ?? true,
    };
    const { data, error } = await supabase
      .from('usuario')
      .insert(insertObj)
      .select()
      .single();
    if (error) {
      console.error('Supabase insert usuario error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({ usuario: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.patch('/api/usuario/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body || {};
    const updateObj = { ...payload };
    if (payload.senha) updateObj.senha = await bcrypt.hash(payload.senha, 10);
    updateObj.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('usuario')
      .update(updateObj)
      .eq('cdusuario', id)
      .select()
      .single();
    if (error) {
      console.error('Supabase update usuario error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ usuario: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.patch('/api/usuario/:id/deactivate', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { data, error } = await supabase
      .from('usuario')
      .update({ ativo: false, updated_at: new Date().toISOString() })
      .eq('cdusuario', id)
      .select()
      .single();
    if (error) {
      console.error('Supabase deactivate usuario error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ usuario: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Tipos de Pessoa
app.post('/api/tipopessoa', async (req, res) => {
  try {
    const { nmtipopessoa } = req.body || {};
    if (!nmtipopessoa)
      return res.status(400).json({ error: 'nmtipopessoa é obrigatório' });
    const { data, error } = await supabase
      .from('tipopessoa')
      .insert({ nmtipopessoa })
      .select()
      .single();
    if (error) {
      console.error('Supabase insert tipopessoa error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({ tipopessoa: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.patch('/api/tipopessoa/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nmtipopessoa } = req.body || {};
    const { data, error } = await supabase
      .from('tipopessoa')
      .update({ nmtipopessoa, updated_at: new Date().toISOString() })
      .eq('cdtipopessoa', id)
      .select()
      .single();
    if (error) {
      console.error('Supabase update tipopessoa error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ tipopessoa: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.delete('/api/tipopessoa/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { error } = await supabase
      .from('tipopessoa')
      .delete()
      .eq('cdtipopessoa', id);
    if (error) {
      console.error('Supabase delete tipopessoa error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Tipos de Evento
app.post('/api/tipoevento', async (req, res) => {
  try {
    const { nmtipoevento } = req.body || {};
    if (!nmtipoevento)
      return res.status(400).json({ error: 'nmtipoevento é obrigatório' });
    const { data, error } = await supabase
      .from('tipoevento')
      .insert({ nmtipoevento })
      .select()
      .single();
    if (error) {
      console.error('Supabase insert tipoevento error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({ tipoevento: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.patch('/api/tipoevento/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nmtipoevento } = req.body || {};
    const { data, error } = await supabase
      .from('tipoevento')
      .update({ nmtipoevento, updated_at: new Date().toISOString() })
      .eq('cdtipoevento', id)
      .select()
      .single();
    if (error) {
      console.error('Supabase update tipoevento error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ tipoevento: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.delete('/api/tipoevento/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { error } = await supabase
      .from('tipoevento')
      .delete()
      .eq('cdtipoevento', id);
    if (error) {
      console.error('Supabase delete tipoevento error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Sociedades CRUD
app.post('/api/sociedades', async (req, res) => {
  try {
    const payload = req.body || {};
    const { data, error } = await supabase
      .from('sociedades')
      .insert({
        nmsociedade: payload.nmSociedade,
        sigla: payload.sigla ?? null,
        descricao: payload.descricao ?? null,
        ativo: payload.ativo ?? true,
      })
      .select()
      .single();
    if (error) {
      console.error('Supabase insert sociedades error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({ sociedade: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.patch('/api/sociedades/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body || {};
    const updateData = { ...payload, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('sociedades')
      .update(updateData)
      .eq('cdsociedade', id)
      .select()
      .single();
    if (error) {
      console.error('Supabase update sociedades error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ sociedade: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.patch('/api/sociedades/:id/deactivate', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { data, error } = await supabase
      .from('sociedades')
      .update({ ativo: false, updated_at: new Date().toISOString() })
      .eq('cdsociedade', id)
      .select()
      .single();
    if (error) {
      console.error('Supabase deactivate sociedades error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ sociedade: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Eventos
app.post('/api/eventos', async (req, res) => {
  try {
    const body = req.body || {};
    // Mapear campos do frontend para a tabela `eventos` (schema usa dtevento e horaevento)
    if (!body?.nmEvento || !body?.dtEvento || !body?.horaEvento) {
      return res
        .status(400)
        .json({ error: 'nmEvento, dtEvento e horaEvento são obrigatórios' });
    }
    const insertObj = {
      nmevento: body.nmEvento,
      cdtipoevento: body.cdTipoEvento ?? null,
      dtevento: body.dtEvento,
      horaevento: body.horaEvento,
      enderecoevento: body.enderecoEvento ?? null,
      cdsociedade: body.cdSociedade ?? null,
      descricao: body.descricao ?? null,
      imagemevento: body.imagemEvento ?? null,
      ativo: body.ativo ?? true,
    };
    const { data, error } = await supabase
      .from('eventos')
      .insert(insertObj)
      .select(
        'cdevento, cdtipoevento, nmevento, descricao, dtevento, horaevento, enderecoevento, cdsociedade, imagemevento, ativo, created_at, updated_at'
      )
      .single();
    if (error) {
      console.error('Supabase insert eventos error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({ evento: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.patch('/api/eventos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body;
    const updateData = { ...body, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('eventos')
      .update(updateData)
      .eq('cdevento', id)
      .select(
        'cdevento, cdtipoevento, nmevento, descricao, dtevento, horaevento, enderecoevento, cdsociedade, imagemevento, ativo, created_at, updated_at'
      )
      .single();
    if (error) {
      console.error('Supabase update eventos error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ evento: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.patch('/api/eventos/:id/deactivate', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { data, error } = await supabase
      .from('eventos')
      .update({ ativo: false, updated_at: new Date().toISOString() })
      .eq('cdevento', id)
      .select()
      .single();
    if (error) {
      console.error('Supabase deactivate eventos error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ evento: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Conselho CRUD
app.post('/api/conselho', async (req, res) => {
  try {
    const conselho = req.body;
    const { data, error } = await supabase
      .from('conselho')
      .insert([conselho])
      .select()
      .single();
    if (error) {
      console.error('Supabase insert conselho error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({ conselho: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.patch('/api/conselho/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const conselho = req.body;
    const { data, error } = await supabase
      .from('conselho')
      .update(conselho)
      .eq('cdlider', id)
      .select()
      .single();
    if (error) {
      console.error('Supabase update conselho error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ conselho: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.delete('/api/conselho/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { error } = await supabase
      .from('conselho')
      .delete()
      .eq('cdlider', id);
    if (error) {
      console.error('Supabase delete conselho error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Upload de foto (server-side) -> salva no bucket 'fotos-pessoas' usando service_role
app.post('/api/upload/pessoa/:id', upload.single('file'), async (req, res) => {
  try {
    const pessoaId = Number(req.params.id);
    if (!req.file)
      return res.status(400).json({ error: 'Arquivo não enviado' });

    const originalName = req.file.originalname || 'upload';
    const ext = path.extname(originalName) || '';
    const fileName = `pessoa_${pessoaId}_${Date.now()}${ext}`;

    // upload usando buffer (node)
    const { error: uploadError } = await supabase.storage
      .from('fotos-pessoas')
      .upload(fileName, req.file.buffer, { upsert: true });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return res
        .status(500)
        .json({ error: uploadError.message || 'Erro no upload' });
    }

    // obter URL pública
    const { data } = supabase.storage
      .from('fotos-pessoas')
      .getPublicUrl(fileName);
    const publicUrl = data?.publicUrl || null;

    // atualizar pessoa com a URL (opcional)
    if (publicUrl) {
      const { data: pessoaData, error: pessoaErr } = await supabase
        .from('pessoa')
        .update({ fotopessoa: publicUrl })
        .eq('cdpessoa', pessoaId)
        .select()
        .single();

      if (pessoaErr) {
        console.error('Erro ao atualizar pessoa com fotopessoa:', pessoaErr);
        // não falha o upload, apenas retorna warning
      }
    }

    return res.status(201).json({ url: publicUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Upload de imagem do evento (server-side) -> salva no bucket 'imagens-eventos' usando service_role
app.post('/api/upload/evento/:id', upload.single('file'), async (req, res) => {
  try {
    const eventoId = Number(req.params.id);
    if (!req.file)
      return res.status(400).json({ error: 'Arquivo não enviado' });

    const originalName = req.file.originalname || 'upload';
    const ext = path.extname(originalName) || '';
    const fileName = `evento_${eventoId}_${Date.now()}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('imagens-eventos')
      .upload(fileName, req.file.buffer, { upsert: true });

    if (uploadError) {
      console.error('Storage upload evento error:', uploadError);
      return res
        .status(500)
        .json({ error: uploadError.message || 'Erro no upload' });
    }

    const { data } = supabase.storage
      .from('imagens-eventos')
      .getPublicUrl(fileName);
    const publicUrl = data?.publicUrl || null;

    // atualizar evento com a URL (opcional)
    if (publicUrl) {
      const { data: evtData, error: evtErr } = await supabase
        .from('eventos')
        .update({ imagemevento: publicUrl })
        .eq('cdevento', eventoId)
        .select()
        .single();

      if (evtErr) {
        console.error('Erro ao atualizar evento com imagemevento:', evtErr);
      }
    }

    return res.status(201).json({ url: publicUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
