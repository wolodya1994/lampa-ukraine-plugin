export class UIManager {
    constructor() {
        this.currentProvider = 'animeon';
    }
    
    init() {
        this.addBalancerButtons();
        this.addSettingsMenu();
        this.setupEventListeners();
    }
    
    addBalancerButtons() {
        // Слухаємо коли користувач обирає фільм/серіал
        Lampa.Listener.follow('full', (event) => {
            if (event.type === 'complite') {
                this.showBalancerSelection(event.data.object);
            }
        });
    }
    
    showBalancerSelection(mediaObject) {
        const providers = this.getAvailableProviders(mediaObject);
        
        providers.forEach(provider => {
            const button = this.createBalancerButton(provider, mediaObject);
            $('.full-start__buttons').append(button);
        });
    }
    
    createBalancerButton(provider, mediaObject) {
        const button = $(`
            <div class="full-start__button balancer-btn" data-provider="${provider.key}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 12l4 4 4-4" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>${provider.name}</span>
            </div>
        `);
        
        button.on('hover:enter', () => {
            this.selectBalancer(provider.key, mediaObject);
        });
        
        return button;
    }
    
    selectBalancer(providerKey, mediaObject) {
        console.log(`Обрано балансер: ${providerKey}`);
        this.currentProvider = providerKey;
        
        // Тут логіка пошуку та програвання
        this.searchAndPlay(providerKey, mediaObject);
    }
    
    async searchAndPlay(providerKey, mediaObject) {
        try {
            Lampa.Loading.start();
            
            const provider = providers[providerKey];
            const results = await provider.search(mediaObject.title || mediaObject.name);
            
            if (results.length > 0) {
                // Показати результати або відразу грати
                this.showSearchResults(results);
            } else {
                Lampa.Noty.show('Контент не знайдено');
            }
            
        } catch (error) {
            console.error('Playback error:', error);
            Lampa.Noty.show('Помилка завантаження');
        } finally {
            Lampa.Loading.stop();
        }
    }
    
    getAvailableProviders(mediaObject) {
        // Фільтруємо провайдери за типом контенту
        return Object.entries(providers)
            .filter(([key, provider]) => {
                if (!provider.enabled) return false;
                
                const mediaType = this.detectMediaType(mediaObject);
                return provider.types.includes(mediaType);
            })
            .map(([key, provider]) => ({
                key,
                name: provider.name
            }));
    }
    
    detectMediaType(mediaObject) {
        if (mediaObject.number_of_seasons || mediaObject.seasons) return 'tv';
        if (mediaObject.first_air_date) return 'tv';
        return 'movie';
    }
}
