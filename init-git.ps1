# Script para inicializar Git y subir a GitHub
# Ejecutar desde PowerShell en la carpeta del proyecto

Write-Host "🚀 Inicializando repositorio Git..." -ForegroundColor Cyan

# Inicializar Git
git init

# Añadir todos los archivos
Write-Host "📦 Añadiendo archivos..." -ForegroundColor Cyan
git add .

# Hacer commit inicial
Write-Host "💾 Creando commit inicial..." -ForegroundColor Cyan
git commit -m "feat: Initial commit - Order analysis PWA with AI processing"

# Crear rama main
Write-Host "🌿 Creando rama main..." -ForegroundColor Cyan
git branch -M main

Write-Host ""
Write-Host "✅ Repositorio Git inicializado correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Crea un repositorio en GitHub: https://github.com/new" -ForegroundColor White
Write-Host "   - Nombre: delfin-pedidos-1" -ForegroundColor White
Write-Host "   - NO inicialices con README" -ForegroundColor White
Write-Host ""
Write-Host "2. Ejecuta estos comandos (reemplaza TU_USUARIO):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/TU_USUARIO/delfin-pedidos-1.git" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Despliega en Vercel:" -ForegroundColor White
Write-Host "   vercel" -ForegroundColor Gray
Write-Host ""
