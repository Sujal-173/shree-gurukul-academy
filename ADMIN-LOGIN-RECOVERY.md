# Admin login recovery

## 1. Check the environment file

The project ZIP intentionally excludes `.env.local`. Create it in the same directory as `package.json`, not inside `app/`. Keep existing MongoDB, Cloudinary, Resend and site URL variables.

For local Next.js `.env.local`, every dollar sign in a bcrypt hash must be escaped (`\$`) so dotenv expansion does not alter the 60-character hash. An unescaped hash can make a correct password look incorrect. The hash helper now prints a local escaped line and a raw line for hosting dashboards.

## 2. Login values

- Email: `aventracreative@gmail.com`
- Password: the private password you chose when generating `ADMIN_PASSWORD_HASH`. Never store the plaintext password in project documentation or source control.
- `AUTH_SECRET`: at least 32 characters.

For a hosting dashboard, enter a raw bcrypt hash and the secret as separate server-side environment variables. Do not add backslashes to the hash in a hosting dashboard.

## 3. Restart and test

Stop the development server and run `npm run dev` again after changing `.env.local`. Try `/admin/login`. If it returns a 503, inspect `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (must be 60 characters at runtime) and `AUTH_SECRET`. If it returns 401, check the exact email/password and ensure the hash wasn't changed by dotenv expansion. If it returns 403 `Invalid request origin`, access the site using the same hostname/protocol as the browser address bar and review reverse-proxy forwarded host/protocol configuration.

## 4. Security

Do not commit `.env.local`, publish its contents, or include it in a source ZIP. Use a unique password of at least 16 characters before public deployment. If the password was shared in chat or another insecure channel, replace it and generate a fresh bcrypt hash.
