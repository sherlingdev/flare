#!/usr/bin/env node

/**
 * Script para cambiar el horario del cron job
 */

import fs from 'fs';

const schedules = {
    '6am-rd': '0 10 * * *',      // 6:00 AM República Dominicana
    '12pm-rd': '0 16 * * *',     // 12:00 PM República Dominicana  
    '6pm-rd': '0 22 * * *',      // 6:00 PM República Dominicana
    '6am-utc': '0 6 * * *',      // 6:00 AM UTC
    '12pm-utc': '0 12 * * *',    // 12:00 PM UTC
    '6pm-utc': '0 18 * * *',     // 6:00 PM UTC
    'test-5min': '*/5 * * * *',  // Cada 5 minutos (solo para pruebas)
    'test-1hour': '0 * * * *'    // Cada hora (para pruebas)
};

function showHelp() {
    console.log('🕐 Cambiar Horario del Cron Job\n');
    console.log('Uso: node change-cron-schedule.js <opción>\n');
    console.log('Opciones disponibles:');
    console.log('  6am-rd     - 6:00 AM República Dominicana (recomendado)');
    console.log('  12pm-rd    - 12:00 PM República Dominicana');
    console.log('  6pm-rd     - 6:00 PM República Dominicana');
    console.log('  6am-utc    - 6:00 AM UTC');
    console.log('  12pm-utc   - 12:00 PM UTC');
    console.log('  6pm-utc    - 6:00 PM UTC');
    console.log('  test-5min  - Cada 5 minutos (solo pruebas)');
    console.log('  test-1hour - Cada hora (pruebas)\n');
    console.log('Ejemplo: node change-cron-schedule.js 6am-rd');
}

function changeSchedule(scheduleKey) {
    if (!schedules[scheduleKey]) {
        console.error(`❌ Opción '${scheduleKey}' no válida`);
        showHelp();
        return;
    }

    const newCron = schedules[scheduleKey];
    const workflowPath = '.github/workflows/update-rates.yml';

    try {
        // Leer el archivo actual
        let content = fs.readFileSync(workflowPath, 'utf8');

        // Reemplazar la línea del cron
        const cronRegex = /cron:\s*'[^']*'/;
        const newCronLine = `cron: '${newCron}'`;

        if (cronRegex.test(content)) {
            content = content.replace(cronRegex, newCronLine);
        } else {
            console.error('❌ No se encontró la línea del cron en el workflow');
            return;
        }

        // Escribir el archivo actualizado
        fs.writeFileSync(workflowPath, content);

        console.log('✅ Horario del cron actualizado!');
        console.log(`📅 Nuevo horario: ${newCron}`);
        console.log(`📝 Archivo actualizado: ${workflowPath}`);

        // Mostrar información adicional
        if (scheduleKey.includes('rd')) {
            console.log('\n🇩🇴 Horario configurado para República Dominicana');
        } else if (scheduleKey.includes('utc')) {
            console.log('\n🌍 Horario configurado para UTC');
        } else if (scheduleKey.includes('test')) {
            console.log('\n🧪 Horario de prueba configurado');
            console.log('⚠️ Recuerda cambiar a horario de producción después');
        }

        console.log('\n🚀 Para aplicar los cambios:');
        console.log('   1. npm run trigger:workflow');
        console.log('   2. O hacer commit y push manual');

    } catch (error) {
        console.error('❌ Error actualizando el horario:', error.message);
    }
}

// Ejecutar
const scheduleKey = process.argv[2];

if (!scheduleKey) {
    showHelp();
} else {
    changeSchedule(scheduleKey);
}
