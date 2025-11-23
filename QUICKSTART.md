# 🚀 Guía Rápida - GitHub y Vercel

## Paso 1: Inicializar Git

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
cd c:\Users\tomas\Downloads\delfin-pedidos-1
.\init-git.ps1
```

O manualmente:

```powershell
git init
git add .
git commit -m "feat: Initial commit - Order analysis PWA"
git branch -M main
```

## Paso 2: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. **Nombre**: `delfin-pedidos-1`
3. **Descripción**: "PWA para análisis de pedidos con IA"
4. **Público** o **Privado** (tu elección)
5. **NO** marques "Initialize with README"
6. Click en "Create repository"

## Paso 3: Subir a GitHub

Copia el comando que GitHub te muestra (reemplaza TU_USUARIO):

```powershell
git remote add origin https://github.com/TU_USUARIO/delfin-pedidos-1.git
git push -u origin main
```

## Paso 4: Desplegar en Vercel

### Opción A: Desde la Web (Más Fácil)

1. Ve a https://vercel.com/new
2. Click en "Import Git Repository"
3. Selecciona `delfin-pedidos-1`
4. Click en "Deploy"
5. ¡Listo! Copia la URL que te da

### Opción B: Desde Terminal

```powershell
vercel
```

Sigue las instrucciones y listo.

## Paso 5: Configurar API Key

1. Abre la URL de Vercel en tu navegador
2. Ve a "Configuración" (⚙️)
3. Pega tu API key de Google Gemini
4. Guarda

## Paso 6: Probar en Móvil

1. Abre la URL en tu teléfono
2. Instala como PWA:
   - **Android**: Menú → "Instalar aplicación"
   - **iOS**: Compartir → "Añadir a pantalla de inicio"

## 🎉 ¡Listo!

Tu aplicación está desplegada y lista para usar.

---

## Comandos Útiles

```powershell
# Ver estado de Git
git status

# Hacer cambios y actualizar
git add .
git commit -m "feat: Nueva funcionalidad"
git push

# Redesplegar en Vercel
vercel --prod
```

## 📁 Archivos Importantes

- `README.md` - Documentación principal
- `DEPLOY.md` - Guía detallada de despliegue
- `.gitignore` - Archivos a ignorar en Git
- `vercel.json` - Configuración de Vercel
- `LICENSE` - Licencia MIT

## 🆘 Ayuda

Si tienes problemas, revisa `DEPLOY.md` para instrucciones detalladas.
