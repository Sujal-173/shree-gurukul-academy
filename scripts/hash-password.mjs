import bcrypt from 'bcryptjs';
const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Usage: npm run hash-password -- "your-unique-password" (minimum 12 characters)');
  process.exit(1);
}
const hash = await bcrypt.hash(password, 12);
console.log('For local .env.local (dollar signs escaped for Next.js):');
console.log(`ADMIN_PASSWORD_HASH=${hash.replaceAll('$', '\\$')}`);
console.log('For hosting provider environment settings, use this raw value (no backslashes):');
console.log(hash);
