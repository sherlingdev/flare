# 🔧 Configuración de GitHub Secrets

## 📋 Secrets Requeridos

Para que el GitHub Action funcione, necesitas configurar estos secrets en tu repositorio:

### **1. SITE_URL**
- **Valor**: `https://tu-sitio.netlify.app`
- **Descripción**: URL de tu sitio desplegado en Netlify

### **2. NETLIFY_AUTH_TOKEN** (Opcional por ahora)
- **Valor**: `tu-token-de-netlify`
- **Descripción**: Token de autenticación para Netlify Blobs

## 🚀 Cómo Configurar los Secrets

### **Paso 1: Ir a GitHub Settings**
1. Ve a tu repositorio en GitHub
2. Click en **Settings** (pestaña superior)
3. En el menú lateral, click en **Secrets and variables**
4. Click en **Actions**

### **Paso 2: Agregar SITE_URL**
1. Click en **New repository secret**
2. **Name**: `SITE_URL`
3. **Secret**: `https://tu-sitio.netlify.app` (reemplaza con tu URL real)
4. Click **Add secret**

### **Paso 3: Agregar NETLIFY_AUTH_TOKEN** (Opcional)
1. Click en **New repository secret**
2. **Name**: `NETLIFY_AUTH_TOKEN`
3. **Secret**: `tu-token-de-netlify` (por ahora puedes usar un valor dummy)
4. Click **Add secret**

## 🧪 Probar el GitHub Action

### **Opción 1: Trigger Manual**
1. Ve a la pestaña **Actions** en tu repositorio
2. Click en **Update Currency Rates**
3. Click en **Run workflow**
4. Selecciona la rama (master/main)
5. Click **Run workflow**

### **Opción 2: Push Trigger**
1. Haz un commit y push a master/main
2. El workflow se ejecutará automáticamente

## 📊 Verificar el Resultado

Después de ejecutar el workflow:

1. **Ve a la pestaña Actions**
2. **Click en el workflow que se ejecutó**
3. **Click en "update-rates" job**
4. **Revisa los logs** para ver:
   - ✅ `🔄 Calling /api/currencies endpoint...`
   - ✅ `📊 Response size: X bytes`
   - ✅ `💾 Saving rates to Netlify Blobs...`
   - ✅ `✅ Rates saved to Netlify Blobs`

## 🐛 Troubleshooting

### **Error: SITE_URL not found**
- Verifica que el secret `SITE_URL` esté configurado
- Verifica que la URL sea correcta y accesible

### **Error: API timeout**
- El endpoint `/api/currencies` puede tardar 5 minutos
- Esto es normal, el workflow esperará

### **Error: Netlify Blobs**
- Por ahora es normal, estamos usando placeholders
- El sistema funcionará con fallback hardcoded

## 🎯 Próximos Pasos

1. **Configurar SITE_URL** con tu URL real
2. **Ejecutar workflow manualmente**
3. **Verificar logs**
4. **Probar en el frontend**
5. **Configurar horario deseado**
