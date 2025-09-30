import { providers } from './providers.js';

export class SearchManager {
    constructor() {
        this.results = [];
    }
    
    async searchAll(query) {
        const enabledProviders = Object.values(providers).filter(p => p.enabled);
        const promises = enabledProviders.map(provider => 
            this.safeSearch(provider, query)
        );
        
        const results = await Promise.all(promises);
        this.results = results.flat().filter(Boolean);
        
        return this.results;
    }
    
    async safeSearch(provider, query) {
        try {
            return await provider.search(query);
        } catch (error) {
            console.error(`Search error in ${provider.name}:`, error);
            return [];
        }
    }
    
    filterByType(type) {
        return this.results.filter(item => item.type === type);
    }
    
    sortByRelevance(query) {
        return this.results.sort((a, b) => {
            const aScore = this.getRelevanceScore(a.title, query);
            const bScore = this.getRelevanceScore(b.title, query);
            return bScore - aScore;
        });
    }
    
    getRelevanceScore(title, query) {
        const lowerTitle = title.toLowerCase();
        const lowerQuery = query.toLowerCase();
        
        if (lowerTitle === lowerQuery) return 100;
        if (lowerTitle.includes(lowerQuery)) return 80;
        
        const words = lowerQuery.split(' ');
        const matchedWords = words.filter(word => lowerTitle.includes(word));
        
        return (matchedWords.length / words.length) * 60;
    }
}
