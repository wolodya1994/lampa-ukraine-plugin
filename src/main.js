import { config } from './config/settings.js';
import { providers } from './modules/providers.js';
import { SearchManager } from './modules/search.js';
import { UIManager } from './modules/ui.js';

class UkrainianPlugin {
    constructor() {
        this.searchManager = new SearchManager();
        this.uiManager = new UIManager();
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) return;
        
        console.log(`🇺🇦 ${config.name} v${config.version} завантажено!`);
        
        this.uiManager.init();
        this.addSettings();
        this.setupGlobalHandlers();
        
        this.initialized = true;
    }
    
    addSettings() {
        // Додаємо розділ в налаштуваннях Lampa
        Lampa.SettingsApi.addComponent({
            component: 'ukrainian_sources',
            name: 'Українські джерела'
        });
        
        // Налаштування для кожного провайдера
        Object.entries(providers).forEach(([key, provider]) => {
            Lampa.SettingsApi.addParam({
                component: 'ukrainian_sources',
                param: {
                    name: `enable_${key}`,
                    type: 'select',
                    values: {
                        true: 'Увімкнено',
                        false: 'Вимкнено'
                    },
                    default: provider.enabled
                },
                field: {
                    name: provider.name,
                    description: `Увімкнути/вимкнути ${provider.name}`
                },
                onChange: (value) => {
                    provider.enabled = value === 'true';
                }
            });
        });
    }
    
    setupGlobalHandlers() {
        // Обробник помилок
        window.addEventListener('error', (event) => {
            if (event.filename.includes('ukraine-plugin')) {
                console.error('Ukrainian Plugin Error:', event.error);
            }
        });
        
        // Очищення при виході
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }
    
    cleanup() {
        console.log('Ukrainian Plugin cleanup');
    }
}

// Експорт для використання
export { UkrainianPlugin };
