export const providers = {
    animeon: {
        name: 'AnimeON',
        url: 'https://animeon.club/api/anime',
        searchUrl: '/search?text=',
        enabled: true,
        types: ['anime'],
        
        async search(query) {
            try {
                const response = await fetch(this.url + this.searchUrl + encodeURIComponent(query));
                const data = await response.json();
                return this.parseSearch(data);
            } catch (error) {
                console.error('AnimeON search error:', error);
                return [];
            }
        },
        
        parseSearch(data) {
            if (!data.result) return [];
            
            return data.result.map(item => ({
                id: item.id,
                title: item.titleUa || item.title,
                poster: item.image ? `https://animeon.club/api/uploads/images/${item.image.preview}` : '',
                year: item.releaseDate,
                type: 'anime',
                provider: 'animeon'
            }));
        }
    },
    
    uaflix: {
        name: 'UAFlix',
        url: 'https://uaflix.com/api',
        enabled: true,
        types: ['movie', 'tv'],
        
        async search(query) {
            // Логіка для UAFlix
            console.log('Searching UAFlix for:', query);
            return [];
        }
    }
    
    // Легко додавати нові балансери!
};
