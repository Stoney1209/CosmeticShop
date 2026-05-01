export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: "El email es requerido" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Formato de email inválido" };
  }

  const normalizedEmail = email.trim().toLowerCase();
  
  // Check for common disposable email domains
  const disposableDomains = [
    'tempmail.com', 'throwawaymail.com', 'guerrillamail.com', 
    'mailinator.com', '10minutemail.com', 'yopmail.com'
  ];
  
  const domain = normalizedEmail.split('@')[1];
  if (disposableDomains.includes(domain)) {
    return { valid: false, error: "No se permiten emails temporales" };
  }

  return { valid: true };
}
