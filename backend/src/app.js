// Configura Express: seguridad, lectura de JSON y cookies, rutas y errores.
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Las peticiones llegan a través del proxy de Next.js (localhost): así req.ip es la IP real
// del visitante y el límite de intentos de login se aplica por persona, no a todos juntos.
app.set('trust proxy', 'loopback');

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // cabeceras de seguridad
app.use(cors({ origin: env.clientUrl, credentials: true }));               // credentials: permite enviar la cookie
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
if (!env.isProd) app.use(morgan('dev'));                                   // log de peticiones en consola

app.use('/uploads', express.static(env.uploadsDir, { maxAge: '7d' }));    // imágenes procesadas
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
