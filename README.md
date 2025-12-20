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
- PostgreSQL (Railway)
- Drizzle ORM
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

   crea un archivo `.env.local` en la raíz de tu proyecto y añade las variables de acuerdo a tus necesidades, ejemplo:

   ```plaintext
   DATABASE_URL=tu_base_de_datos_url

   NEXT_PUBLIC_ALCHEMY_API_KEY=tu_alchemy_api_key

   NEXT_PUBLIC_PRIVY_APP_ID=tu_privy_app_id
   NEXT_PUBLIC_PRIVY_CLIENT_ID=tu_privy_client_id
   NEXT_PUBLIC_PRIVY_APP_SECRET=tu_privy_app_secret
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

## estructura del proyecto

```plaintext
frutero-app/
├── src/
│   ├── app/                 # next.js app router (páginas y rutas)
│   ├── components/          # componentes react
│   │   ├── ui/             # componentes shadcn/ui
│   │   ├── layout/         # navbar, footer, etc.
│   │   └── ...
│   ├── lib/                # utilidades y configuración
│   │   ├── db/             # drizzle client y queries
│   │   ├── auth/           # privy helpers
│   │   └── utils.ts
│   ├── providers/          # context providers
│   ├── store/              # zustand stores
│   └── styles/             # estilos globales
├── drizzle/
│   ├── schema/             # esquemas de base de datos
│   └── migrations/         # migraciones SQL
├── public/                 # archivos estáticos
└── ...                     # archivos de configuración
```

## contribuciones

¡damos la bienvenida a las contribuciones! siéntete libre de enviar issues o pull requests para ayudar a mejorar este proyecto para el club y la comunidad.

todo el código debe ser TypeScript con tipos apropiados.

---

construido por frutero club para builders latinoamericanos
