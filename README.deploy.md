# Deploy & Debug Checklist

## 1️⃣ Desactivar la extensión TON (o cualquier extensión que inyecte `window.ton`

1. Abre Chrome/Edge y navega a `chrome://extensions/`.
2. Busca extensiones con nombres como **TON Wallet**, **TonConnect**, **Ton**.
3. Desactiva el interruptor **ON/OFF** o pulsa **Remove** para eliminarla.
4. Recarga la aplicación (`Ctrl + R`).
5. Verifica en la consola que el error `window.ton.destroy is not a function` ya no aparece.

> Si necesitas la extensión para pruebas, abre la app en una ventana **Incógnito** (las extensiones están deshabilitadas por defecto) o usa otro navegador sin esa extensión.

---

## 2️⃣ Quitar la protección de acceso a `/assets` en Vercel

1. Entra al **Dashboard de Vercel** → tu proyecto → **Settings → General → Password Protection**.
2. Desactiva la opción **Protected**.
   - Si necesitas mantener la protección, crea una regla de **excepción** para `/assets/*` marcando *Allow public access*.
3. Guarda los cambios.

---

## 3️⃣ Volver a desplegar

```bash
cd C:\Users\tomas\Downloads\delfin-pedidos-1\delfin-pedidos-v2
npm run build   # genera dist/ con el manifest
npx vercel --prod   # despliega a producción
```

## 4️⃣ Verificar en producción

1. Abre la URL de producción (p.ej. `https://delfin-pedidos-v2-xxxx.vercel.app`).
2. Abre la consola del navegador (F12 → **Console**).
3. Asegúrate de que **NO** aparecen los siguientes errores:
   - `window.ton.destroy is not a function`
   - `manifest‑vfaVL8Az.json 401`
   - `A listener indicated an asynchronous response … message channel closed`
4. Prueba la **Sincronización con Firebase**; la barra de progreso debe avanzar y mostrar el número correcto de elementos.

---

## 5️⃣ (Opcional) Añadir al proyecto

Puedes añadir este archivo al repositorio para que cualquier colaborador tenga la guía a mano.

---

**Nota:** Los pasos 1 y 2 son configuraciones externas al código; no pueden modificarse mediante cambios en los archivos del proyecto.
