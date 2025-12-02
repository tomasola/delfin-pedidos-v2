# Delfín Suite v2.0 - Guía de Instalación Completa

## 📋 Descripción del Proyecto

**Delfín Suite** es una aplicación web progresiva (PWA) diseñada para la gestión industrial de etiquetas y pedidos. Incluye tres módulos principales:

### Módulos

1. **Delfin-14 (Escáner de Etiquetas)**
   - Escaneo de etiquetas mediante cámara o galería
   - Análisis automático con IA (Google Gemini)
   - Extracción de datos: referencia, longitud, cantidad
   - Almacenamiento local y sincronización con Firebase

2. **Análisis de Pedidos**
   - Escaneo de pedidos completos
   - Búsqueda y filtrado de pedidos
   - Historial completo con detalles
   - Exportación de datos

3. **Administración**
   - Gestión de seguridad con PINs configurables
   - Sincronización bidireccional con Firebase
   - Exportación/Importación de datos (JSON)
   - Borrado selectivo (local/nube)

### Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Base de Datos Local**: IndexedDB (idb)
- **Base de Datos Nube**: Firebase Firestore
- **Autenticación**: Firebase Auth (anónima)
- **IA**: Google Gemini API
- **Cámara**: react-webcam
- **Deployment**: Vercel

---

## 🚀 Instalación desde Cero

### Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

```bash
# Node.js (versión 18 o superior)
node --version

# npm (viene con Node.js)
npm --version

# Git
git --version
```

Si no tienes Node.js instalado:
- Descarga desde: https://nodejs.org/
- Instala la versión LTS (Long Term Support)

Si no tienes Git instalado:
- Descarga desde: https://git-scm.com/

---

## 📦 Paso 1: Clonar o Copiar el Proyecto

### Opción A: Si tienes el código localmente

```bash
# Navega a la carpeta donde quieres trabajar
cd C:\Users\TuUsuario\Proyectos

# Copia la carpeta del proyecto
# (O usa el backup ya creado en delfin-pedidos-backup)
```

### Opción B: Si vas a clonar desde GitHub (después de subirlo)

```bash
# Clona el repositorio
git clone https://github.com/TU_USUARIO/delfin-pedidos-v2.git

# Entra a la carpeta
cd delfin-pedidos-v2
```

---

## 🔧 Paso 2: Instalar Dependencias

```bash
# Asegúrate de estar en la carpeta del proyecto
cd delfin-pedidos-v2

# Instala todas las dependencias
npm install

# Esto puede tardar 1-3 minutos
```

---

## 🔑 Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo de configuración

```bash
# Crea el archivo .env.local en la raíz del proyecto
# En Windows PowerShell:
New-Item -Path .env.local -ItemType File

# O simplemente crea un archivo llamado .env.local
```

### 3.2 Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. En "Project Settings" > "General", copia la configuración de tu app web
4. Habilita **Firestore Database** y **Authentication (Anonymous)**

### 3.3 Configurar Google Gemini API

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crea una nueva API Key
3. Copia la clave

### 3.4 Contenido del archivo `.env.local`

```env
# Google Gemini API Key
VITE_GEMINI_API_KEY=tu_api_key_de_gemini_aqui

# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**⚠️ IMPORTANTE**: 
- El archivo `.env.local` está en `.gitignore` y NO se sube a GitHub
- Nunca compartas tus API keys públicamente
- Cada desarrollador debe crear su propio `.env.local`

---

## 🏃 Paso 4: Ejecutar en Desarrollo

```bash
# Inicia el servidor de desarrollo
npm run dev

# La aplicación se abrirá en:
# http://localhost:5173
```

**Prueba que funcione:**
1. Abre el navegador en `http://localhost:5173`
2. Deberías ver la pantalla de inicio (Splash Screen) por 3 segundos
3. Luego la pantalla principal con 3 botones

---

## 🌐 Paso 5: Subir a GitHub

### 5.1 Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com)
2. Click en "New repository"
3. Nombre: `delfin-pedidos-v2`
4. Descripción: "Sistema de gestión industrial de etiquetas y pedidos"
5. **NO** inicialices con README (ya tienes uno)
6. Click "Create repository"

### 5.2 Conectar tu proyecto local con GitHub

```bash
# Si es un proyecto nuevo (sin git)
git init
git add .
git commit -m "Initial commit - Delfín Suite v2.0"

# Conecta con tu repositorio de GitHub
git remote add origin https://github.com/TU_USUARIO/delfin-pedidos-v2.git

# Sube el código
git branch -M main
git push -u origin main
```

### 5.3 Si ya tienes Git configurado

```bash
# Verifica el estado
git status

# Añade todos los cambios
git add .

# Haz commit
git commit -m "Backup completo - Delfín Suite v2.0"

# Sube a GitHub
git push origin main
```

---

## ☁️ Paso 6: Desplegar en Vercel

### 6.1 Instalar Vercel CLI

```bash
# Instala Vercel globalmente
npm install -g vercel

# Verifica la instalación
vercel --version
```

### 6.2 Login en Vercel

```bash
# Inicia sesión (abrirá el navegador)
vercel login

# Sigue las instrucciones en el navegador
```

### 6.3 Primer Despliegue

```bash
# Desde la carpeta del proyecto
cd delfin-pedidos-v2

# Despliega a Vercel
vercel

# Responde las preguntas:
# ? Set up and deploy? [Y/n] Y
# ? Which scope? [Tu cuenta]
# ? Link to existing project? [N]
# ? What's your project's name? delfin-pedidos-v2
# ? In which directory is your code located? ./
# ? Want to override the settings? [N]
```

### 6.4 Configurar Variables de Entorno en Vercel

**Opción A: Desde la línea de comandos**

```bash
# Añade cada variable de entorno
vercel env add VITE_GEMINI_API_KEY
# Pega tu API key cuando te lo pida
# Selecciona: Production, Preview, Development

vercel env add VITE_FIREBASE_API_KEY
# Repite para todas las variables...
```

**Opción B: Desde el Dashboard de Vercel**

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `delfin-pedidos-v2`
3. Ve a "Settings" > "Environment Variables"
4. Añade cada variable:
   - `VITE_GEMINI_API_KEY`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

5. Marca las tres opciones: Production, Preview, Development

### 6.5 Desplegar a Producción

```bash
# Despliega a producción
vercel --prod

# Espera a que termine (15-30 segundos)
# Te dará una URL como:
# https://delfin-pedidos-v2-xxxxx.vercel.app
```

### 6.6 Configurar Dominio Personalizado (Opcional)

```bash
# Añade un dominio personalizado
vercel domains add tudominio.com

# Sigue las instrucciones para configurar DNS
```

---

## 🔄 Actualizaciones Futuras

### Hacer cambios y redesplegar

```bash
# 1. Haz tus cambios en el código

# 2. Guarda en Git
git add .
git commit -m "Descripción de los cambios"
git push origin main

# 3. Despliega a Vercel
vercel --prod

# ¡Listo! Los cambios están en producción
```

---

## 🔐 Configuración de Seguridad

### PINs por Defecto

- **PIN Admin**: `1234`
- **PIN Borrado Firebase**: `123456`
- **Clave Maestra**: `10061978` (permite acceso y cambio de PINs)

### Cambiar PINs

1. Accede al módulo "Administración"
2. Ingresa el PIN actual (o clave maestra)
3. Ve a "Configuración de Seguridad"
4. Ingresa el PIN actual o maestro
5. Ingresa el nuevo PIN
6. Click "Guardar"

---

## 📱 Instalar como PWA

### En Móvil (Android/iOS)

1. Abre la aplicación en el navegador
2. En el menú del navegador, selecciona "Agregar a pantalla de inicio"
3. La app se instalará como aplicación nativa

### En Escritorio (Chrome/Edge)

1. Abre la aplicación
2. En la barra de direcciones, click en el icono de instalación
3. Click "Instalar"

---

## 🐛 Solución de Problemas

### Error: "API key not valid"

**Problema**: La API key de Gemini no es válida

**Solución**:
1. Verifica que la key en `.env.local` sea correcta
2. Regenera la key en Google AI Studio
3. Reinicia el servidor de desarrollo: `npm run dev`

### Error: "Firebase auth/invalid-api-key"

**Problema**: Configuración de Firebase incorrecta

**Solución**:
1. Verifica todas las variables `VITE_FIREBASE_*` en `.env.local`
2. Copia de nuevo desde Firebase Console
3. Asegúrate de habilitar Authentication (Anonymous) en Firebase

### Error 404 al recargar en Vercel

**Problema**: Rutas de React Router no funcionan

**Solución**:
- Ya está solucionado con `vercel.json`
- Si persiste, verifica que `vercel.json` exista en la raíz

### Error: "Cannot find module"

**Problema**: Dependencias no instaladas

**Solución**:
```bash
# Borra node_modules y reinstala
rm -rf node_modules
npm install
```

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisa esta guía completa
2. Verifica los logs en la consola del navegador (F12)
3. Revisa los logs de Vercel en el dashboard

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

## 🎉 ¡Listo!

Tu aplicación Delfín Suite v2.0 está ahora:
- ✅ Instalada localmente
- ✅ Subida a GitHub
- ✅ Desplegada en Vercel
- ✅ Accesible desde cualquier dispositivo

**URL de Producción**: https://delfin-pedidos-v2-xxxxx.vercel.app

¡Disfruta de tu aplicación! 🚀
