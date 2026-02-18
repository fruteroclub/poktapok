import { NextRequest, NextResponse } from "next/server";

/**
 * Studio Chat API
 * 
 * This endpoint handles chat messages for the Frutero Studio.
 * It will connect to an AI agent (OpenClaw channel) to generate code.
 * 
 * For MVP, we use a simple response generator.
 * TODO: Connect to Frutero agent via OpenClaw channel
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, userId } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // TODO: Connect to OpenClaw channel for Frutero agent
    // For now, generate a simple response
    const response = await generateResponse(message, history);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Studio chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateResponse(
  message: string,
  history: any[]
): Promise<{ message: string; code?: string }> {
  const lowerMessage = message.toLowerCase();

  // Simple keyword-based responses for MVP demo
  // This will be replaced with actual AI agent integration

  if (lowerMessage.includes("landing") || lowerMessage.includes("pagina principal")) {
    return {
      message: "Aqui tienes una landing page basica con hero section, features y CTA. Puedes personalizarla cambiando los textos y colores.",
      code: generateLandingPage(),
    };
  }

  if (lowerMessage.includes("formulario") || lowerMessage.includes("form") || lowerMessage.includes("contacto")) {
    return {
      message: "He creado un formulario de contacto con validacion basica. Incluye campos para nombre, email y mensaje.",
      code: generateContactForm(),
    };
  }

  if (lowerMessage.includes("card") || lowerMessage.includes("tarjeta") || lowerMessage.includes("perfil")) {
    return {
      message: "Aqui tienes una tarjeta de perfil con avatar, nombre y descripcion. Perfecta para mostrar miembros de equipo.",
      code: generateProfileCard(),
    };
  }

  if (lowerMessage.includes("boton") || lowerMessage.includes("button")) {
    return {
      message: "He creado varios estilos de botones que puedes usar en tu proyecto.",
      code: generateButtons(),
    };
  }

  if (lowerMessage.includes("navbar") || lowerMessage.includes("menu") || lowerMessage.includes("navegacion")) {
    return {
      message: "Aqui tienes una barra de navegacion responsive con logo y menu hamburguesa para movil.",
      code: generateNavbar(),
    };
  }

  if (lowerMessage.includes("grid") || lowerMessage.includes("galeria") || lowerMessage.includes("gallery")) {
    return {
      message: "He creado una galeria responsive con CSS Grid. Perfecta para mostrar proyectos o imagenes.",
      code: generateGallery(),
    };
  }

  // Default response with a simple starter template
  return {
    message: "Entendido! He creado un template basico para comenzar. Dime que quieres agregar o modificar:\n\n- Landing page\n- Formulario de contacto\n- Tarjetas de perfil\n- Galeria de imagenes\n- Navbar responsive",
    code: generateStarterTemplate(),
  };
}

function generateLandingPage(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi Landing Page</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    
    .hero {
      min-height: 100vh;
      background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: white;
      padding: 2rem;
    }
    
    .hero h1 {
      font-size: 3.5rem;
      margin-bottom: 1rem;
      font-weight: 800;
    }
    
    .hero p {
      font-size: 1.25rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto 2rem;
    }
    
    .btn {
      display: inline-block;
      padding: 1rem 2.5rem;
      background: white;
      color: #FF6B35;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 1.1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    
    .features {
      padding: 5rem 2rem;
      background: #FFF8F0;
    }
    
    .features h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 3rem;
      color: #333;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    
    .feature-card .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .feature-card h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: #333;
    }
    
    .feature-card p {
      color: #666;
      line-height: 1.6;
    }
    
    .cta {
      padding: 5rem 2rem;
      background: #333;
      text-align: center;
      color: white;
    }
    
    .cta h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    
    .cta .btn {
      background: #FF6B35;
      color: white;
    }
  </style>
</head>
<body>
  <section class="hero">
    <div>
      <h1>Construye el Futuro</h1>
      <p>Aprende a crear aplicaciones web increibles con el Vibe Coding Bootcamp de Frutero Club</p>
      <a href="#" class="btn">Comenzar Ahora</a>
    </div>
  </section>
  
  <section class="features">
    <h2>Por que elegirnos</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="icon">🚀</div>
        <h3>Aprende Rapido</h3>
        <p>Metodologia practica enfocada en proyectos reales desde el primer dia.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🤖</div>
        <h3>AI-First</h3>
        <p>Usa inteligencia artificial como copiloto para acelerar tu desarrollo.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🌐</div>
        <h3>Comunidad</h3>
        <p>Conecta con otros desarrolladores y construye tu red profesional.</p>
      </div>
    </div>
  </section>
  
  <section class="cta">
    <h2>Listo para empezar?</h2>
    <p style="margin-bottom: 2rem; opacity: 0.8;">Unete a la proxima cohorte del bootcamp</p>
    <a href="#" class="btn">Inscribirme</a>
  </section>
</body>
</html>`;
}

function generateContactForm(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Formulario de Contacto</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #FFF8F0 0%, #FFE4CC 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .form-container {
      background: white;
      padding: 3rem;
      border-radius: 1.5rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 500px;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 0.5rem;
      color: #333;
    }
    
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 2rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
    }
    
    input, textarea {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid #eee;
      border-radius: 0.75rem;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    
    input:focus, textarea:focus {
      outline: none;
      border-color: #FF6B35;
    }
    
    textarea {
      min-height: 120px;
      resize: vertical;
    }
    
    button {
      width: 100%;
      padding: 1rem;
      background: #FF6B35;
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
    }
    
    button:hover {
      background: #E85A28;
      transform: translateY(-2px);
    }
    
    .success-message {
      display: none;
      text-align: center;
      padding: 1rem;
      background: #D4EDDA;
      color: #155724;
      border-radius: 0.75rem;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="form-container">
    <h1>Contactanos</h1>
    <p class="subtitle">Te respondemos en menos de 24 horas</p>
    
    <form id="contactForm">
      <div class="form-group">
        <label for="name">Nombre</label>
        <input type="text" id="name" name="name" placeholder="Tu nombre" required>
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" placeholder="tu@email.com" required>
      </div>
      
      <div class="form-group">
        <label for="message">Mensaje</label>
        <textarea id="message" name="message" placeholder="Como podemos ayudarte?" required></textarea>
      </div>
      
      <button type="submit">Enviar Mensaje</button>
    </form>
    
    <div class="success-message" id="successMessage">
      Mensaje enviado! Te contactaremos pronto.
    </div>
  </div>
  
  <script>
    document.getElementById('contactForm').addEventListener('submit', function(e) {
      e.preventDefault();
      // Show success message
      document.getElementById('successMessage').style.display = 'block';
      this.reset();
      setTimeout(() => {
        document.getElementById('successMessage').style.display = 'none';
      }, 3000);
    });
  </script>
</body>
</html>`;
}

function generateProfileCard(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tarjeta de Perfil</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .cards-container {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .card {
      background: white;
      border-radius: 1.5rem;
      padding: 2rem;
      width: 280px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      transition: transform 0.3s;
    }
    
    .card:hover {
      transform: translateY(-10px);
    }
    
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
    }
    
    .card h2 {
      color: #333;
      margin-bottom: 0.25rem;
    }
    
    .card .role {
      color: #FF6B35;
      font-weight: 500;
      margin-bottom: 1rem;
    }
    
    .card p {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    
    .social-links {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    
    .social-links a {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      font-size: 1.2rem;
      transition: background 0.2s;
    }
    
    .social-links a:hover {
      background: #FF6B35;
    }
  </style>
</head>
<body>
  <div class="cards-container">
    <div class="card">
      <div class="avatar">🧑‍💻</div>
      <h2>Ana Garcia</h2>
      <div class="role">Frontend Developer</div>
      <p>Apasionada por crear experiencias web increibles. Especialista en React y CSS.</p>
      <div class="social-links">
        <a href="#">🐦</a>
        <a href="#">💼</a>
        <a href="#">🐙</a>
      </div>
    </div>
    
    <div class="card">
      <div class="avatar">👨‍🔬</div>
      <h2>Carlos Lopez</h2>
      <div class="role">Backend Engineer</div>
      <p>Construyendo APIs robustas y sistemas escalables. Fan de Node.js y Python.</p>
      <div class="social-links">
        <a href="#">🐦</a>
        <a href="#">💼</a>
        <a href="#">🐙</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function generateButtons(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Estilos de Botones</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #FFF8F0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3rem;
      padding: 2rem;
    }
    
    h2 {
      color: #333;
      margin-bottom: 1rem;
    }
    
    .button-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .btn {
      padding: 0.875rem 1.75rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #FF6B35;
      color: white;
    }
    .btn-primary:hover {
      background: #E85A28;
      transform: translateY(-2px);
    }
    
    .btn-secondary {
      background: #333;
      color: white;
    }
    .btn-secondary:hover {
      background: #555;
    }
    
    .btn-outline {
      background: transparent;
      color: #FF6B35;
      border: 2px solid #FF6B35;
    }
    .btn-outline:hover {
      background: #FF6B35;
      color: white;
    }
    
    .btn-ghost {
      background: transparent;
      color: #333;
    }
    .btn-ghost:hover {
      background: rgba(0,0,0,0.05);
    }
    
    .btn-pill {
      border-radius: 50px;
    }
    
    .btn-lg {
      padding: 1.125rem 2.25rem;
      font-size: 1.125rem;
    }
    
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
    
    .btn-icon {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-gradient {
      background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
      color: white;
      border: none;
    }
    .btn-gradient:hover {
      background: linear-gradient(135deg, #E85A28 0%, #FF6B35 100%);
    }
  </style>
</head>
<body>
  <section>
    <h2>Botones Basicos</h2>
    <div class="button-group">
      <button class="btn btn-primary">Primary</button>
      <button class="btn btn-secondary">Secondary</button>
      <button class="btn btn-outline">Outline</button>
      <button class="btn btn-ghost">Ghost</button>
    </div>
  </section>
  
  <section>
    <h2>Tamaños</h2>
    <div class="button-group">
      <button class="btn btn-primary btn-sm">Small</button>
      <button class="btn btn-primary">Medium</button>
      <button class="btn btn-primary btn-lg">Large</button>
    </div>
  </section>
  
  <section>
    <h2>Estilos Especiales</h2>
    <div class="button-group">
      <button class="btn btn-primary btn-pill">Pill Button</button>
      <button class="btn btn-gradient btn-pill">Gradient</button>
      <button class="btn btn-primary btn-icon">🚀 Con Icono</button>
    </div>
  </section>
</body>
</html>`;
}

function generateNavbar(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Navbar Responsive</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    
    nav {
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: fixed;
      width: 100%;
      top: 0;
      z-index: 1000;
    }
    
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
    }
    
    .logo {
      font-size: 1.5rem;
      font-weight: 800;
      color: #FF6B35;
      text-decoration: none;
    }
    
    .nav-links {
      display: flex;
      gap: 2rem;
      list-style: none;
    }
    
    .nav-links a {
      text-decoration: none;
      color: #333;
      font-weight: 500;
      transition: color 0.2s;
    }
    
    .nav-links a:hover {
      color: #FF6B35;
    }
    
    .nav-cta {
      padding: 0.75rem 1.5rem;
      background: #FF6B35;
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      transition: background 0.2s;
    }
    
    .nav-cta:hover {
      background: #E85A28;
    }
    
    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      cursor: pointer;
      padding: 10px;
    }
    
    .hamburger span {
      width: 25px;
      height: 3px;
      background: #333;
      transition: all 0.3s;
    }
    
    @media (max-width: 768px) {
      .nav-links, .nav-cta {
        display: none;
      }
      
      .hamburger {
        display: flex;
      }
      
      .nav-links.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 70px;
        left: 0;
        right: 0;
        background: white;
        padding: 2rem;
        gap: 1.5rem;
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
      }
    }
    
    .hero {
      min-height: 100vh;
      background: linear-gradient(135deg, #FFF8F0 0%, #FFE4CC 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
    }
    
    .hero h1 {
      font-size: 3rem;
      color: #333;
    }
  </style>
</head>
<body>
  <nav>
    <div class="nav-container">
      <a href="#" class="logo">Frutero</a>
      <ul class="nav-links" id="navLinks">
        <li><a href="#">Inicio</a></li>
        <li><a href="#">Servicios</a></li>
        <li><a href="#">Nosotros</a></li>
        <li><a href="#">Contacto</a></li>
      </ul>
      <a href="#" class="nav-cta">Comenzar</a>
      <div class="hamburger" onclick="toggleMenu()">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </nav>
  
  <section class="hero">
    <h1>Navbar Responsive</h1>
  </section>
  
  <script>
    function toggleMenu() {
      document.getElementById('navLinks').classList.toggle('active');
    }
  </script>
</body>
</html>`;
}

function generateGallery(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galeria de Proyectos</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #FFF8F0;
      padding: 2rem;
    }
    
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 3rem;
    }
    
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .gallery-item {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .gallery-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    
    .gallery-image {
      width: 100%;
      height: 200px;
      background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
    }
    
    .gallery-content {
      padding: 1.5rem;
    }
    
    .gallery-content h3 {
      color: #333;
      margin-bottom: 0.5rem;
    }
    
    .gallery-content p {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 1rem;
    }
    
    .tags {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .tag {
      padding: 0.25rem 0.75rem;
      background: #f0f0f0;
      border-radius: 50px;
      font-size: 0.75rem;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>Mis Proyectos</h1>
  <p class="subtitle">Una coleccion de mis trabajos mas recientes</p>
  
  <div class="gallery">
    <div class="gallery-item">
      <div class="gallery-image">🎨</div>
      <div class="gallery-content">
        <h3>App de Diseño</h3>
        <p>Herramienta colaborativa para equipos de diseño con sync en tiempo real.</p>
        <div class="tags">
          <span class="tag">React</span>
          <span class="tag">Figma API</span>
          <span class="tag">WebSocket</span>
        </div>
      </div>
    </div>
    
    <div class="gallery-item">
      <div class="gallery-image">📊</div>
      <div class="gallery-content">
        <h3>Dashboard Analytics</h3>
        <p>Panel de metricas en tiempo real con visualizaciones interactivas.</p>
        <div class="tags">
          <span class="tag">Next.js</span>
          <span class="tag">D3.js</span>
          <span class="tag">PostgreSQL</span>
        </div>
      </div>
    </div>
    
    <div class="gallery-item">
      <div class="gallery-image">🛒</div>
      <div class="gallery-content">
        <h3>E-commerce Platform</h3>
        <p>Tienda en linea con carrito, pagos y gestion de inventario.</p>
        <div class="tags">
          <span class="tag">Vue.js</span>
          <span class="tag">Stripe</span>
          <span class="tag">Node.js</span>
        </div>
      </div>
    </div>
    
    <div class="gallery-item">
      <div class="gallery-image">🤖</div>
      <div class="gallery-content">
        <h3>AI Chat Assistant</h3>
        <p>Asistente inteligente con procesamiento de lenguaje natural.</p>
        <div class="tags">
          <span class="tag">Python</span>
          <span class="tag">OpenAI</span>
          <span class="tag">FastAPI</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function generateStarterTemplate(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi Proyecto</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #FFF8F0 0%, #FFE4CC 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
    }
    
    .container {
      max-width: 600px;
    }
    
    h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 1rem;
    }
    
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    
    .btn {
      display: inline-block;
      padding: 1rem 2rem;
      background: #FF6B35;
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      transition: transform 0.2s, background 0.2s;
    }
    
    .btn:hover {
      background: #E85A28;
      transform: translateY(-2px);
    }
    
    .emoji {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="emoji">🍊</div>
    <h1>Hola Mundo!</h1>
    <p>Este es tu punto de partida. Dime que quieres crear y lo construimos juntos.</p>
    <a href="#" class="btn">Comenzar</a>
  </div>
</body>
</html>`;
}
