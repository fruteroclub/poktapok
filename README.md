# poktapok - aplicación para builders de frutero club

poktapok es un tercer espacio digital creado especialmente para los builders de frutero club. esta plataforma está diseñada para fomentar el crecimiento colectivo de nuestra comunidad, permitiendo:

- compartir conocimientos y experiencias
- desarrollar nuevas habilidades
- explorar tendencias emergentes
- descubrir oportunidades de colaboración

nuestra visión es crear un ecosistema vibrante donde los builders puedan conectar, aprender y crecer juntos.

## características

- **Next.js** con App Router para una estructura y enrutamiento óptimos.
- **Shadcn** para componentes de UI bien diseñados y reutilizables.
- **Bun** como runtime para builds más rápidas y mejor rendimiento.
- pre-configurado para **Dynamic Wallet** (impulsado por [dynamic.xyz](https://dynamic.xyz)) para manejar la creación y conexión de wallets.

## primeros pasos

### requisitos Previos

- [Node.js](https://nodejs.org/) (asegúrate de tener Bun instalado como runtime)
- [Bun](https://bun.sh/docs/installation)
- [Git](https://git-scm.com/)

### instalación

1. **clona el repositorio:**

   ```bash
   git clone https://github.com/fruteroclub/poktapok.git
   cd poktapok
   ```

2. **instala las dependencias usando Bun:**

   ```bash
   bun install
   ```

3. **configura las variables de entorno:**

   crea un archivo `.env` en la raíz de tu proyecto y añade las siguientes variables:

   ```plaintext
   NEXT_PUBLIC_DYNAMIC_API_KEY=tu_dynamic_api_key
   ```

   reemplaza `tu_dynamic_api_key` con tu clave API de [dynamic.xyz](https://dynamic.xyz).

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
.
├── public/          # archivos estáticos
├── src/app/         # páginas y rutas de Next.js
├── src/components/  # componentes React personalizados
├── src/styles/      # hojas de estilo globales
├── .env             # variables de entorno
├── ...              # ¡otros archivos de configuración, revisa el repo!
```

## integración de Wallet

la plantilla inicial incluye integración con **Dynamic Wallet**, permitiendo una creación y conexión fluida de wallets para los usuarios:

- **Dynamic.xyz** proporciona una interfaz de usuario fácil de usar para la conexión de wallets.
- donfiguración plug-and-play para conectar con cadenas compatibles con EVM.

## Contribuciones

¡damos la bienvenida a las contribuciones! siéntete libre de enviar issues o pull requests para ayudar a mejorar este proyecto para el club y la comunidad.

## Licencia

este proyecto es de código abierto y está disponible bajo la [Licencia MIT](LICENSE).
