# 🚀 Comandos Disponibles

## 📋 Scripts de Prueba

```bash
# Prueba completa del sistema
npm run test:flow

# Pruebas individuales
npm run test:manual      # Flujo manual
npm run test:github      # Simular GitHub Action
npm run test:frontend     # Probar frontend
```

## 🔧 Scripts de GitHub Actions

```bash
# Activar workflow (hacer commit y push)
npm run trigger:workflow

# Cambiar horario del cron
npm run cron:change <opción>
```

## ⏰ Opciones de Horario

```bash
# Horarios para República Dominicana
npm run cron:change 6am-rd     # 6:00 AM RD (recomendado)
npm run cron:change 12pm-rd    # 12:00 PM RD
npm run cron:change 6pm-rd     # 6:00 PM RD

# Horarios UTC
npm run cron:change 6am-utc    # 6:00 AM UTC
npm run cron:change 12pm-utc   # 12:00 PM UTC
npm run cron:change 6pm-utc    # 6:00 PM UTC

# Horarios de prueba
npm run cron:change test-5min   # Cada 5 minutos (solo pruebas)
npm run cron:change test-1hour # Cada hora (pruebas)
```

## 🎯 Flujo de Trabajo Recomendado

### **Paso 1: Configurar Secrets**
1. Ve a GitHub → Settings → Secrets and variables → Actions
2. Agrega `SITE_URL` con tu URL de Netlify
3. Agrega `NETLIFY_AUTH_TOKEN` (opcional por ahora)

### **Paso 2: Probar Localmente**
```bash
# Iniciar servidor
npm run dev

# En otra terminal, probar
npm run test:flow
```

### **Paso 3: Activar GitHub Action**
```bash
# Activar workflow inmediatamente
npm run trigger:workflow
```

### **Paso 4: Configurar Horario**
```bash
# Para República Dominicana (recomendado)
npm run cron:change 6am-rd

# Para pruebas
npm run cron:change test-5min
```

### **Paso 5: Verificar Resultados**
1. Ve a GitHub → Actions
2. Busca "Update Currency Rates"
3. Revisa los logs del workflow

## 📊 Monitoreo

### **Logs a Revisar:**
- ✅ `🔄 Calling /api/currencies endpoint...`
- ✅ `📊 Response size: X bytes`
- ✅ `💾 Saving rates to Netlify Blobs...`
- ✅ `✅ Rates saved to Netlify Blobs`

### **En el Frontend:**
- Abrir DevTools → Console
- Buscar: `⚠️ Usando tasas hardcodeadas (fallback)`
- Verificar que las banderas se muestren

## 🐛 Troubleshooting

### **Error: SITE_URL not found**
```bash
# Verificar que el secret esté configurado en GitHub
# Verificar que la URL sea correcta
```

### **Error: API timeout**
```bash
# Normal, el endpoint tarda ~5 minutos
# El workflow esperará automáticamente
```

### **Error: Git push failed**
```bash
# Verificar que estés en la rama master/main
# Verificar permisos de push
```

## 🎉 ¡Listo!

Una vez configurado, el sistema funcionará automáticamente:

1. **GitHub Action** se ejecuta según el horario configurado
2. **Llama a** `/api/currencies` (tarda ~5 minutos)
3. **Guarda datos** en Netlify Blobs (simulado por ahora)
4. **Frontend** usa datos dinámicos o fallback hardcoded
5. **Banderas** se muestran correctamente
6. **Conversiones** funcionan perfectamente
