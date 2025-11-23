# delfin-pedidos-1

Aplicación web progresiva (PWA) para capturar y analizar pedidos mediante fotografías con procesamiento de IA usando Google Gemini.

## 🚀 Demo

Visita la aplicación en: [https://delfin-pedidos-1.vercel.app](https://delfin-pedidos-1.vercel.app)

## ✨ Características

- 📸 **Captura de fotos** con cámara del dispositivo
- 🤖 **Procesamiento con IA** usando Google Gemini para extracción automática de datos
- 💾 **Base de datos local** con IndexedDB (sin servidor backend)
- 📱 **PWA instalable** en dispositivos móviles
- 🌐 **Funciona offline** con Service Worker
- 🔍 **Búsqueda y filtrado** de pedidos
- 📊 **Estadísticas en tiempo real**
- 💾 **Exportación de datos** a JSON

## 📋 Datos Capturados

- **Cliente**: Nombre y número de cliente
- **Pedido**: Número de pedido y fecha
- **Productos**: Número de referencia, denominación, cantidad en metros lineales
- **Estado**: Pendiente, En Proceso, Completado
- **Notas**: Información adicional

## 🛠️ Tecnologías

- HTML5, CSS3, JavaScript ES6+
- IndexedDB para almacenamiento local
- Google Gemini API para procesamiento de imágenes
- Service Worker para funcionalidad offline
- PWA Manifest para instalación en móviles

## 📦 Instalación

### Opción 1: Despliegue en Vercel (Recomendado)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TU_USUARIO/delfin-pedidos-1)

O manualmente:

```bash
# Instalar Vercel CLI
npm install -g vercel

# Clonar el repositorio
git clone https://github.com/TU_USUARIO/delfin-pedidos-1.git
cd delfin-pedidos-1

# Desplegar
vercel
```

### Opción 2: Uso Local

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/delfin-pedidos-1.git
cd delfin-pedidos-1

# Abrir index.html en tu navegador
# O usar un servidor local:
npx serve
```

## 🔑 Configuración

### 1. Obtener API Key de Google Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Crea una nueva API key
4. Copia la API key generada

### 2. Configurar en la Aplicación

1. Abre la aplicación
2. Ve a la sección "Configuración" (⚙️)
3. Pega tu API key en el campo correspondiente
4. Haz clic en "Guardar Configuración"

**Nota**: La API key se guarda localmente en tu dispositivo y nunca se comparte.

## 📱 Instalación en Móvil

### Android (Chrome)
1. Abre la URL de la aplicación en Chrome
2. Toca el menú (⋮) → "Instalar aplicación"
3. La app se instalará como aplicación nativa

### iOS (Safari)
1. Abre la URL de la aplicación en Safari
2. Toca el botón de compartir (□↑)
3. Selecciona "Añadir a pantalla de inicio"
4. La app se instalará como aplicación nativa

## 📖 Uso

1. **Capturar Pedido**: Usa la cámara o sube una imagen
2. **Procesamiento IA**: La IA extrae automáticamente los datos
3. **Revisar**: Verifica y edita los datos extraídos
4. **Guardar**: Los datos se guardan en tu dispositivo
5. **Gestionar**: Visualiza, busca y exporta tus pedidos

## 🔒 Privacidad

- ✅ Todos los datos se almacenan localmente en tu dispositivo
- ✅ No hay servidor backend que almacene información
- ✅ La API key se guarda solo en tu navegador
- ✅ Las imágenes se procesan solo para extracción de datos

## 📁 Estructura del Proyecto

```
delfin-pedidos-1/
├── index.html          # Página principal
├── styles.css          # Estilos
├── app.js             # Lógica de la aplicación
├── manifest.json      # Configuración PWA
├── service-worker.js  # Service Worker
├── icon-192.png       # Icono 192x192
├── icon-512.png       # Icono 512x512
├── README.md          # Este archivo
└── DEPLOY.md          # Guía de despliegue
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autor

Desarrollado por Delfin Team

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la [documentación completa](README.md)
2. Consulta la [guía de despliegue](DEPLOY.md)
3. Abre un [issue](https://github.com/TU_USUARIO/delfin-pedidos-1/issues)

---

**Versión**: 1.0.0  
**Última actualización**: Noviembre 2024
# delfin_pedidos_1
# delfin_pedidos_1
