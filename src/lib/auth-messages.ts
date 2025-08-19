// Função para traduzir mensagens de erro do Supabase para português
export const getAuthErrorMessage = (error: string): string => {
  const errorMessages: { [key: string]: string } = {
    // Login errors
    'Invalid login credentials': 'Email ou senha incorretos. Verifique seus dados e tente novamente.',
    'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada e confirme seu email.',
    'Too many requests': 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.',
    'Invalid email': 'O email fornecido não é válido. Verifique o formato do email.',
    
    // Register errors
    'User already registered': 'Este email já está cadastrado. Tente fazer login ou use um email diferente.',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'Signup is disabled': 'O cadastro está temporariamente desabilitado. Tente novamente mais tarde.',
    'Invalid email format': 'Formato de email inválido. Verifique se digitou corretamente.',
    
    // Network errors
    'Network request failed': 'Erro de conexão. Verifique sua internet e tente novamente.',
    'Failed to fetch': 'Problema de conexão. Verifique sua internet e tente novamente.',
    
    // General errors
    'Database error': 'Erro interno do sistema. Tente novamente em alguns instantes.',
    'Internal server error': 'Erro interno do servidor. Nossa equipe foi notificada.',
  };

  // Procura por mensagens que contenham palavras-chave
  for (const [key, message] of Object.entries(errorMessages)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return message;
    }
  }

  // Se não encontrar uma tradução específica, retorna uma mensagem genérica amigável
  return 'Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.';
};

// Função para obter mensagens de sucesso personalizadas
export const getSuccessMessage = (action: 'login' | 'register'): { title: string; description: string } => {
  const messages = {
    login: {
      title: 'Login realizado com sucesso! 🎉',
      description: 'Bem-vindo de volta! Redirecionando para seus orçamentos...',
    },
    register: {
      title: 'Conta criada com sucesso! 🎉',
      description: 'Sua conta foi criada! Redirecionando para começar a usar o sistema...',
    },
  };

  return messages[action];
};