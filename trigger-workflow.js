#!/usr/bin/env node

/**
 * Script para activar el GitHub Action
 * Hace commit y push para trigger el workflow
 */

import { execSync } from 'child_process';

console.log('🚀 Activando GitHub Action...\n');

try {
    // 1. Verificar estado de git
    console.log('📋 Verificando estado de git...');
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });

    if (gitStatus.trim()) {
        console.log('📝 Archivos modificados encontrados:');
        console.log(gitStatus);

        // 2. Agregar archivos
        console.log('\n📦 Agregando archivos...');
        execSync('git add .');

        // 3. Hacer commit
        console.log('💾 Haciendo commit...');
        const commitMessage = `🧪 Test GitHub Action - ${new Date().toISOString()}`;
        execSync(`git commit -m "${commitMessage}"`);

        console.log('✅ Commit creado:', commitMessage);
    } else {
        console.log('ℹ️ No hay cambios para commitear');
    }

    // 4. Hacer push
    console.log('\n🚀 Haciendo push...');
    execSync('git push origin master');

    console.log('\n🎉 GitHub Action activado!');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Ve a GitHub → Actions');
    console.log('   2. Busca "Update Currency Rates"');
    console.log('   3. Click en el workflow que se ejecutó');
    console.log('   4. Revisa los logs');

    console.log('\n⏱️ El workflow puede tardar 5-10 minutos');
    console.log('   (porque /api/currencies tarda ~5 minutos)');

} catch (error) {
    console.error('❌ Error activando workflow:', error.message);
    console.log('\n🔧 Soluciones posibles:');
    console.log('   1. Verificar que estés en la rama master/main');
    console.log('   2. Verificar que tengas permisos de push');
    console.log('   3. Verificar conexión a internet');
}
