import { config } from 'dotenv';
config({ path: '.env.local' });
import { ensureIngresosExtColumns } from '../src/actions/ingresos';
console.log("Database URL:", process.env.DATABASE_URL?.substring(0, 20) + "...");
ensureIngresosExtColumns().then(console.log).catch(console.error);
