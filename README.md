# poktapok - frutero talent platform

poktapok es una plataforma de talento que conecta desarrolladores latinoamericanos con oportunidades globales a través de bounties y aprendizaje práctico.

## propósito

ayudar a estudiantes universitarios, recién graduados y personas en transición profesional a ganar dinero en 3 meses aprendiendo IA, cripto/DeFi, y privacidad, a través de desafíos del mundo real.

## arquitectura

```
talent directory → portfolio showcase → bounty marketplace → onchain funding
```

la plataforma sigue un modelo progresivo donde los usuarios crean perfiles, muestran su trabajo a través de bounties completados, y reciben pagos en criptomonedas.

## tech stack

**frontend**

- Next.js 16 (app router)
- React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Zustand + React Query

**backend**

- PostgreSQL (Neon DB via Vercel)
- Drizzle ORM + node-postgres
- Next.js API routes

**web3**

- Privy (autenticación + wallets)
- Wagmi (interacción blockchain)
- Ethereum Sepolia (testnet)
- Monad, Base, Polygon, Arbitrum (alpha)

## primeros pasos

### requisitos previos

- [Node.js](https://nodejs.org/) (asegúrate de tener Bun instalado como runtime)
- [Bun](https://bun.sh/docs/installation)
- [Git](https://git-scm.com/)
- [Alchemy](https://alchemy.com/)
- [Privy](https://privy.io/)

### instalación

1. **clona el repositorio:**

   ```bash
   git clone https://github.com/fruteroclub/frutero-app.git
   cd frutero-app
   ```

2. **instala las dependencias usando Bun:**

   ```bash
   bun install
   ```

3. **configura las variables de entorno:**

   **opción 1: vercel (recomendado)**

   ```bash
   vercel env pull .env.local
   ```

   **opción 2: manual**
   crea un archivo `.env.local` en la raíz de tu proyecto:

   ```plaintext
   DATABASE_URL=postgresql://...
   DATABASE_URL_UNPOOLED=postgresql://...

   NEXT_PUBLIC_ALCHEMY_API_KEY=tu_alchemy_api_key

   NEXT_PUBLIC_PRIVY_APP_ID=tu_privy_app_id
   NEXT_PUBLIC_PRIVY_CLIENT_ID=tu_privy_client_id
   PRIVY_APP_SECRET=tu_privy_app_secret
   ```

4. **configura la base de datos:**

   ejecuta las migraciones:

   ```bash
   bun run db:migrate
   ```

   verifica la conexión:

   ```bash
   bun run scripts/test-db-connection.ts
   ```

### ejecutando el proyecto

para iniciar el servidor de desarrollo, ejecuta:

```bash
bun run dev
```

esto lanzará la aplicación en `http://localhost:3000`.

### build y producción

para builds de producción, utiliza:

```bash
bun run build
bun run start
```

## base de datos

el proyecto utiliza **PostgreSQL** con **Drizzle ORM** para gestión de esquemas y migraciones.

### esquema

- **users** - identidad y autenticación (integración con Privy)
- **profiles** - datos extendidos del perfil de usuario
- **applications** - cola de solicitudes de incorporación
- **invitations** - sistema de referidos

### comandos disponibles

```bash
bun run db:generate   # generar migraciones desde cambios en esquema
bun run db:migrate    # aplicar migraciones pendientes
bun run db:studio     # abrir Drizzle Studio (navegador visual)
bun run db:check      # verificar drift del esquema
```

### documentación completa

consulta [docs/database-setup.md](docs/database-setup.md) para:

- guía de configuración completa
- referencia del esquema de tablas
- patrones de consulta comunes
- workflow de migraciones
- solución de problemas

## estructura del proyecto

```plaintext
poktapok/
├── src/
│   ├── app/                 # next.js app router (páginas y rutas)
│   ├── components/          # componentes react
│   │   ├── ui/             # componentes shadcn/ui
│   │   ├── layout/         # navbar, footer, etc.
│   │   └── ...
│   ├── lib/                # utilidades y configuración
│   │   ├── db/             # drizzle client y schema exports
│   │   ├── auth/           # privy helpers
│   │   └── utils.ts
│   ├── providers/          # context providers
│   ├── store/              # zustand stores
│   └── styles/             # estilos globales
├── drizzle/
│   ├── schema/             # definiciones del esquema
│   │   ├── utils.ts        # helpers compartidos
│   │   ├── users.ts        # tabla de usuarios
│   │   ├── profiles.ts     # perfiles de usuario
│   │   ├── applications.ts # solicitudes
│   │   ├── invitations.ts  # sistema de referidos
│   │   └── index.ts        # exports del esquema
│   └── migrations/         # migraciones SQL generadas
├── scripts/                # scripts de testing y verificación
├── docs/                   # documentación del proyecto
├── public/                 # archivos estáticos
└── ...                     # archivos de configuración
```

## contribuciones

¡damos la bienvenida a las contribuciones! siéntete libre de enviar issues o pull requests para ayudar a mejorar este proyecto para el club y la comunidad.

todo el código debe ser TypeScript con tipos apropiados.

---

construido por frutero club para builders latinoamericanos
