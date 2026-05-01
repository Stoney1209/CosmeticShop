// Configuration constants that can be overridden by environment variables

export const config = {
  // Security settings
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  loginAttemptWindowMinutes: parseInt(process.env.LOGIN_ATTEMPT_WINDOW_MINUTES || '15'),
  blockDurationHours: parseInt(process.env.BLOCK_DURATION_HOURS || '24'),
  
  // Validation settings
  minUsernameLength: parseInt(process.env.MIN_USERNAME_LENGTH || '3'),
  maxUsernameLength: parseInt(process.env.MAX_USERNAME_LENGTH || '50'),
  minPasswordLength: parseInt(process.env.MIN_PASSWORD_LENGTH || '8'),
  minPhoneDigits: parseInt(process.env.MIN_PHONE_DIGITS || '10'),
  minStockDefault: parseInt(process.env.MIN_STOCK_DEFAULT || '5'),
  maxSkuLength: parseInt(process.env.MAX_SKU_LENGTH || '50'),
  maxNameLength: parseInt(process.env.MAX_NAME_LENGTH || '200'),
  maxSlugLength: parseInt(process.env.MAX_SLUG_LENGTH || '200'),
  maxAddressLength: parseInt(process.env.MAX_ADDRESS_LENGTH || '500'),
  minRfcLength: parseInt(process.env.MIN_RFC_LENGTH || '12'),
  maxRfcLength: parseInt(process.env.MAX_RFC_LENGTH || '13'),
  
  // Database settings
  transactionTimeoutMs: parseInt(process.env.TRANSACTION_TIMEOUT_MS || '30000'),
  
  // Pagination
  defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '50'),
  
  // Email settings
  emailMaxRetries: parseInt(process.env.EMAIL_MAX_RETRIES || '3'),
  
  // Session settings
  csrfTokenMaxAge: parseInt(process.env.CSRF_TOKEN_MAX_AGE || '3600'), // 1 hour
} as const;
