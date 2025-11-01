import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, Church } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { loginSchema, type LoginFormData } from '../../utils/validators';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      await login(data);
      // O redirecionamento é feito automaticamente no AuthContext
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Church size={48} />
          </div>
          <h1 className={styles.title}>Sistema Administrativo</h1>
          <p className={styles.subtitle}>Igreja Presbiteriana do Crato</p>
        </div>

        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.inputGroup}>
            <Input
              {...register('nmLogin')}
              id='nmLogin'
              type='text'
              label='Usuário'
              placeholder='Digite seu usuário'
              error={errors.nmLogin?.message}
              required
              autoComplete='username'
              autoFocus
            />

            <Input
              {...register('senha')}
              id='senha'
              type='password'
              label='Senha'
              placeholder='Digite sua senha'
              error={errors.senha?.message}
              required
              autoComplete='current-password'
            />
          </div>

          <Button
            type='submit'
            variant='primary'
            size='large'
            fullWidth
            disabled={isLoading}
            icon={<LogIn size={20} />}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className={styles.footer}>
          <p>
            Em caso de problemas com acesso, entre em contato com o
            administrador.
          </p>
        </div>
      </div>
    </div>
  );
};
