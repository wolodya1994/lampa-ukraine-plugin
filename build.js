import fs from 'fs';
import path from 'path';

// Читаємо всі модулі та збираємо в один файл для Lampa
const modules = [
    'src/config/settings.js',
    'src/modules/providers.js', 
    'src/modules/search.js',
    'src/modules/ui.js',
    'src/main.js'
];

let bundledCode = `
(function() {
    'use strict';
    
    // Перевірка чи плагін вже завантажений
    if (window.ukraine_plugin) return;
    window.ukraine_plugin = true;
    
    // Мініатюрний module loader
    const modules = {};
    const exports = {};
    
    function require(name) {
        return modules[name] || exports[name];
    }
    
    function define(name, deps, factory) {
        modules[name] = factory.apply(null, deps.map(require));
    }
    
`;

// Додаємо код модулів
modules.forEach(modulePath => {
    const code = fs.readFileSync(modulePath, 'utf8');
    const moduleName = path.basename(modulePath, '.js');
    
    // Простенька обробка import/export
    let processedCode = code
        .replace(/export\s+{([^}]+)}/g, 'modules["$1"] = {$1}')
        .replace(/export\s+const\s+(\w+)/g, 'const $1; modules["$1"] = $1')
        .replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g, 
                'const {$1} = require("$2")');
    
    bundledCode += `\n// === ${moduleName}.js ===\n${processedCode}\n`;
});

bundledCode += `
    // Запуск плагіна
    const { UkrainianPlugin } = require('main');
    const plugin = new UkrainianPlugin();
    
    if (window.appready) {
        plugin.init();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready') {
                plugin.init();
            }
        });
    }
})();
`;

// Записуємо фінальний файл
fs.writeFileSync('ukraine-plugin.js', bundledCode);
console.log('✅ Плагін зібрано в ukraine-plugin.js');
