# Delfín Suite v2.0

## 🎯 Descripción

**Delfín Suite** es una aplicación web progresiva (PWA) diseñada para la gestión industrial de etiquetas y pedidos mediante escaneo con cámara y análisis automático con inteligencia artificial.

## ✨ Características Principales

### 📱 Módulos

1. **Delfin-14 - Escáner de Etiquetas**
   - Escaneo mediante cámara o galería de imágenes
   - Análisis automático con Google Gemini AI
   - Extracción de datos: referencia, longitud, cantidad
   - Recorte y ajuste de imágenes
   - Almacenamiento local (IndexedDB) y sincronización con Firebase

2. **Análisis de Pedidos**
   - Escaneo de pedidos completos
   - Búsqueda y filtrado avanzado
   - Historial completo con detalles
   - Exportación de datos

3. **Administración**
   - Sistema de seguridad con PINs configurables
   - Clave maestra de recuperación
   - Sincronización bidireccional con Firebase
   - Exportación/Importación de datos (JSON)
   - Borrado selectivo (local/nube)

### 🔐 Seguridad

- **PIN de Administrador**: Protege el acceso al panel de admin (Default: `1234`)
- **PIN de Borrado Firebase**: Protección adicional para borrar datos en la nube (Default: `123456`)
- **Clave Maestra**: `10061978` - Permite recuperar acceso y cambiar PINs

### 🌐 Características Técnicas

- **PWA**: Instalable en móviles y escritorio
- **Offline-First**: Funciona sin conexión
- **Sincronización**: Bidireccional con Firebase
- **Responsive**: Optimizado para móviles y tablets
- **Splash Screen**: Pantalla de inicio de 3 segundos

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Crea .env.local con tus API keys

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Desplegar a Vercel
vercel --prod
```

## 📦 Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Base de Datos Local**: IndexedDB (idb)
- **Base de Datos Nube**: Firebase Firestore
- **Autenticación**: Firebase Auth (anónima)
- **IA**: Google Gemini API
- **Cámara**: react-webcam
- **Deployment**: Vercel

## 📖 Documentación Completa

Para instrucciones detalladas de instalación y despliegue, consulta:
- **[INSTALACION.md](./INSTALACION.md)** - Guía completa paso a paso

## 🔧 Configuración

### Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Google Gemini API
VITE_GEMINI_API_KEY=tu_api_key_aqui

# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Obtener API Keys

1. **Google Gemini**: https://aistudio.google.com/app/apikey
2. **Firebase**: https://console.firebase.google.com/

## 📱 Instalación como PWA

### Móvil (Android/iOS)
1. Abre la app en el navegador
2. Menú → "Agregar a pantalla de inicio"

### Escritorio (Chrome/Edge)
1. Abre la app
2. Click en el icono de instalación en la barra de direcciones

## 🌍 Despliegue

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Desplegar
vercel --prod
```

### GitHub

```bash
# Inicializar repositorio
git init
git add .
git commit -m "Initial commit"

# Conectar con GitHub
git remote add origin https://github.com/tu-usuario/delfin-pedidos-v2.git
git push -u origin main
```

## 📂 Estructura del Proyecto

```
delfin-pedidos-v2/
├── public/              # Archivos estáticos
│   ├── icon.png        # Logo de la aplicación
│   └── test-label.jpg  # Imagen de prueba
├── src/
│   ├── components/     # Componentes React
│   │   ├── Admin/      # Panel de administración
│   │   ├── Auth/       # Autenticación
│   │   ├── Delfin14/   # Módulo de etiquetas
│   │   ├── Orders/     # Módulo de pedidos
│   │   └── ui/         # Componentes UI reutilizables
│   ├── config/         # Configuración Firebase
│   └── services/       # Servicios (DB, Firebase, etc.)
├── .env.local          # Variables de entorno (no incluido)
├── vercel.json         # Configuración de Vercel
├── INSTALACION.md      # Guía de instalación completa
└── README.md           # Este archivo
```

## 🔄 Flujo de Trabajo

1. **Desarrollo Local**: `npm run dev`
2. **Commit**: `git add . && git commit -m "mensaje"`
3. **Push a GitHub**: `git push origin main`
4. **Deploy a Vercel**: `vercel --prod`

## 🐛 Solución de Problemas

### Error: API key not valid
- Verifica que la API key de Gemini sea correcta en `.env.local`
- Regenera la key en Google AI Studio

### Error 404 al recargar
- Ya solucionado con `vercel.json`
- Verifica que el archivo exista en la raíz

### Firebase auth error
- Verifica todas las variables `VITE_FIREBASE_*`
- Habilita Authentication (Anonymous) en Firebase Console

## 📊 Características de Datos

### Almacenamiento Local (IndexedDB)
- **Records**: Etiquetas escaneadas
- **Orders**: Pedidos completos
- Persistente entre sesiones
- Funciona offline

### Sincronización Firebase
- **Bidireccional**: Descarga y sube datos
- **Inteligente**: Evita duplicados
- **Progreso visual**: Barra de progreso en 3 fases
- **Selectiva**: Excluye imágenes grandes

## 🎨 Interfaz

- **Tema oscuro**: Diseño moderno con fondo slate-900
- **Iconos**: Lucide React
- **Animaciones**: Transiciones suaves
- **Responsive**: Optimizado para todos los tamaños

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👨‍💻 Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar
npm run build

# Preview de producción
npm run preview
```

## 🔗 Enlaces Útiles

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Firebase Console**: https://console.firebase.google.com/
- **Google AI Studio**: https://aistudio.google.com/

## 📞 Soporte

Para soporte técnico, consulta:
1. [INSTALACION.md](./INSTALACION.md) - Guía completa
2. Logs del navegador (F12)
3. Logs de Vercel Dashboard

---

**Versión**: 2.0.0  
**Última actualización**: Diciembre 2025

¡Disfruta de Delfín Suite! 🚀
