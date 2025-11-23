# Guía de Despliegue - delfin-pedidos-1

Esta guía te ayudará a desplegar la aplicación en Vercel, similar a delfin-14.

## 🚀 Despliegue Rápido con Vercel

### Opción 1: Desde GitHub (Recomendado)

1. **Sube tu código a GitHub**:
   ```bash
   cd c:\Users\tomas\Downloads\delfin-pedidos-1
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/delfin-pedidos-1.git
   git push -u origin main
   ```

2. **Conecta con Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "New Project"
   - Importa tu repositorio de GitHub
   - Haz clic en "Deploy"
   - ¡Listo! Vercel te dará una URL

### Opción 2: Desde la Terminal (CLI)

```bash
# 1. Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# 2. Navegar al proyecto
cd c:\Users\tomas\Downloads\delfin-pedidos-1

# 3. Desplegar
vercel

# 4. Para producción
vercel --prod
```

## 📋 Pasos Detallados

### 1. Preparar el Repositorio Git

```bash
# Inicializar Git (si no está inicializado)
git init

# Añadir todos los archivos
git add .

# Hacer commit
git commit -m "feat: Initial commit - Order analysis PWA"

# Crear rama main
git branch -M main
```

### 2. Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Haz clic en "New repository"
3. Nombre: `delfin-pedidos-1`
4. Descripción: "PWA para análisis de pedidos con IA"
5. Público o Privado (tu elección)
6. **NO** inicialices con README (ya tienes uno)
7. Haz clic en "Create repository"

### 3. Subir a GitHub

```bash
# Añadir el remote
git remote add origin https://github.com/TU_USUARIO/delfin-pedidos-1.git

# Subir el código
git push -u origin main
```

### 4. Desplegar en Vercel

#### Desde la Web:

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Selecciona "Import Git Repository"
3. Busca `delfin-pedidos-1`
4. Haz clic en "Import"
5. Configuración:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (dejar vacío)
   - **Output Directory**: (dejar vacío)
6. Haz clic en "Deploy"

#### Desde la Terminal:

```bash
vercel
```

Sigue las instrucciones:
- ¿Set up and deploy? → `Y`
- ¿Which scope? → Selecciona tu cuenta
- ¿Link to existing project? → `N`
- ¿What's your project's name? → `delfin-pedidos-1`
- ¿In which directory? → `./`
- ¿Override settings? → `N`

## 🔗 Configurar Dominio Personalizado (Opcional)

1. En Vercel, ve a tu proyecto
2. Settings → Domains
3. Añade tu dominio personalizado
4. Sigue las instrucciones de DNS

## 🔄 Actualizar la Aplicación

### Desde GitHub:

```bash
# Hacer cambios en el código
git add .
git commit -m "feat: Nueva funcionalidad"
git push

# Vercel desplegará automáticamente
```

### Desde la Terminal:

```bash
# Hacer cambios en el código
vercel --prod
```

## 📱 Compartir con Usuarios

Una vez desplegado, comparte la URL:

```
https://delfin-pedidos-1.vercel.app
```

O tu dominio personalizado:

```
https://tu-dominio.com
```

## ⚙️ Variables de Entorno (Opcional)

Si quieres configurar la API key como variable de entorno:

1. En Vercel → Settings → Environment Variables
2. Añade: `VITE_GEMINI_API_KEY` = tu_api_key
3. Redeploy el proyecto

**Nota**: Para esta app, la API key se configura desde la interfaz, no necesitas variables de entorno.

## 🔍 Verificar el Despliegue

1. Abre la URL de Vercel
2. Verifica que la app carga correctamente
3. Prueba el botón "Probar Ejemplo"
4. Configura tu API key
5. Prueba capturar una foto

## 📊 Monitoreo

En el dashboard de Vercel puedes ver:
- Visitas
- Rendimiento
- Errores
- Analytics

## 🆘 Solución de Problemas

**Error: "Failed to deploy"**
- Verifica que todos los archivos estén en el repositorio
- Asegúrate de que no hay errores en el código

**La app no carga**
- Verifica la consola del navegador
- Revisa los logs en Vercel

**Service Worker no funciona**
- Asegúrate de usar HTTPS (Vercel lo proporciona automáticamente)
- Limpia la caché del navegador

## 📝 Checklist de Despliegue

- [ ] Código subido a GitHub
- [ ] Proyecto importado en Vercel
- [ ] Despliegue exitoso
- [ ] URL funcionando
- [ ] PWA instalable
- [ ] API key configurada
- [ ] Funcionalidad probada
- [ ] Compartido con usuarios

## 🎯 Próximos Pasos

1. ✅ Desplegar en Vercel
2. ✅ Configurar API key
3. ✅ Probar en móvil
4. ✅ Instalar como PWA
5. ✅ Compartir con equipo

---

¿Necesitas ayuda? Abre un issue en GitHub o contacta al equipo de desarrollo.
