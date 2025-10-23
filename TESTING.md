# 🧪 Guía de Pruebas del Sistema Híbrido

## 📋 Resumen del Sistema

El sistema híbrido funciona de la siguiente manera:

1. **CurrencyConverter** intenta cargar datos desde `/api/netlify-blobs/currency-rates`
2. Si no hay datos o no son recientes, usa fallback hardcoded
3. **GitHub Actions** ejecuta diariamente para actualizar datos
4. **Netlify Blobs** almacena los datos dinámicos

## 🚀 Cómo Probar el Sistema

### **Paso 1: Prueba Local (Desarrollo)**

```bash
# 1. Iniciar el servidor de desarrollo
npm run dev

# 2. En otra terminal, ejecutar pruebas
npm run test:flow
```

### **Paso 2: Pruebas Individuales**

```bash
# Probar flujo manual
npm run test:manual

# Simular GitHub Action
npm run test:github

# Probar frontend
npm run test:frontend
```

### **Paso 3: Verificar en el Navegador**

1. Abrir `http://localhost:3000`
2. Verificar que las banderas se muestren
3. Probar conversiones
4. Abrir DevTools y verificar logs de consola

## 🔧 Configuración para Producción

### **GitHub Secrets Requeridos:**

```bash
SITE_URL=https://tu-sitio.netlify.app
NETLIFY_AUTH_TOKEN=tu-token-de-netlify
```

### **Netlify Blobs Setup:**

1. Ir a Netlify Dashboard
2. Crear Blob Store
3. Obtener Auth Token
4. Configurar en GitHub Secrets

## 📊 Flujo de Datos

```
GitHub Actions (Diario)
    ↓
/api/currencies (5 min)
    ↓
Netlify Blobs (Storage)
    ↓
CurrencyConverter (Frontend)
    ↓
Fallback Hardcoded (Si falla)
```

## 🐛 Troubleshooting

### **Problema: Banderas no se muestran**
- ✅ Verificar que `isLoadingCurrencies` se actualice
- ✅ Verificar que `currencies` array tenga datos
- ✅ Verificar URLs de banderas

### **Problema: GitHub Action falla**
- ✅ Verificar SITE_URL en secrets
- ✅ Verificar que el sitio esté desplegado
- ✅ Verificar logs de GitHub Actions

### **Problema: Netlify Blobs no funciona**
- ✅ Verificar NETLIFY_AUTH_TOKEN
- ✅ Verificar que el Blob Store esté creado
- ✅ Verificar permisos de la API

## 📈 Monitoreo

### **Logs a Revisar:**

1. **Console del navegador:**
   - `✅ Tasas y monedas cargadas desde Netlify Blobs`
   - `⚠️ Usando tasas hardcodeadas (fallback)`

2. **GitHub Actions logs:**
   - `🔄 Calling /api/currencies endpoint...`
   - `✅ Rates saved to Netlify Blobs`

3. **Netlify Function logs:**
   - Errores de API
   - Tiempos de respuesta

## 🎯 Próximos Pasos

1. **Implementar Netlify Blobs real** (reemplazar placeholders)
2. **Configurar GitHub Secrets**
3. **Activar GitHub Actions**
4. **Monitorear funcionamiento diario**
5. **Optimizar rendimiento si es necesario**
