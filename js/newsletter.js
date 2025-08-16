// Newsletter functionality
class TravelNewsletterApp {
    constructor() {
        this.currentFilter = 'all';
        this.newsData = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialNews();
        this.updateLastUpdated();
        this.loadDailyTip();
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.setActiveFilter(e.target);
                this.filterNews(e.target.dataset.category);
            });
        });
    }

    setActiveFilter(activeButton) {
        document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
        this.currentFilter = activeButton.dataset.category;
    }

    async loadInitialNews() {
        this.showLoading();
        try {
            // Try to fetch real news first, fallback to mock data
            const news = await this.fetchTravelNews();
            this.newsData = news;
            this.displayNews(news);
        } catch (error) {
            console.log('Using mock data for demonstration');
            this.newsData = this.getMockNews();
            this.displayNews(this.newsData);
        } finally {
            this.hideLoading();
        }
    }

    async fetchTravelNews() {
        // Try multiple news sources
        const sources = [
            () => this.fetchFromNewsAPI(),
            () => this.fetchFromRSS(),
            () => this.fetchFromPublicAPI()
        ];

        for (const source of sources) {
            try {
                const news = await source();
                if (news && news.length > 0) {
                    return news;
                }
            } catch (error) {
                console.log('Source failed, trying next...', error);
                continue;
            }
        }

        // If all sources fail, return mock data
        return this.getMockNews();
    }

    async fetchFromPublicAPI() {
        // Using a free, no-auth-required news API
        try {
            const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://feeds.skift.com/skift', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            return this.formatAPINews(data.items || []);
        } catch (error) {
            console.log('Public API failed:', error);
            throw error;
        }
    }

    async fetchFromRSS() {
        // Try to fetch from travel RSS feeds using a proxy service
        const rssSources = [
            'https://api.rss2json.com/v1/api.json?rss_url=https://www.travelandleisure.com/rss',
            'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/lonelyplanet/blog',
        ];

        for (const url of rssSources) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    if (data.items && data.items.length > 0) {
                        return this.formatRSSNews(data.items);
                    }
                }
            } catch (error) {
                console.log('RSS source failed:', error);
                continue;
            }
        }
        throw new Error('All RSS sources failed');
    }

    async fetchFromNewsAPI() {
        // This would require an API key - placeholder for when user adds one
        // const API_KEY = 'your-newsapi-key-here';
        // const response = await fetch(`https://newsapi.org/v2/everything?q=travel&sortBy=publishedAt&apiKey=${API_KEY}`);
        throw new Error('NewsAPI requires API key');
    }

    formatAPINews(articles) {
        return articles.slice(0, 12).map(article => ({
            title: article.title || 'Travel News Update',
            description: article.description || article.content?.substring(0, 150) + '...' || 'Latest travel news and updates.',
            url: article.link || '#',
            publishedAt: article.pubDate || new Date().toISOString(),
            category: this.categorizeNews(article.title + ' ' + article.description),
            source: article.author || 'Travel News'
        }));
    }

    formatRSSNews(articles) {
        return articles.slice(0, 12).map(article => ({
            title: article.title || 'Travel News Update',
            description: article.description?.replace(/<[^>]*>/g, '').substring(0, 150) + '...' || 'Latest travel news and updates.',
            url: article.link || '#',
            publishedAt: article.pubDate || new Date().toISOString(),
            category: this.categorizeNews(article.title + ' ' + article.description),
            source: 'Travel RSS'
        }));
    }



    categorizeNews(text) {
        const keywords = {
            airlines: ['airline', 'flight', 'airport', 'aviation', 'boeing', 'airbus'],
            destinations: ['destination', 'city', 'country', 'visit', 'explore', 'tourism'],
            safety: ['safety', 'warning', 'alert', 'security', 'health', 'covid'],
            deals: ['deal', 'discount', 'offer', 'sale', 'cheap', 'budget'],
            culture: ['culture', 'festival', 'food', 'tradition', 'local', 'heritage']
        };

        const lowerText = text.toLowerCase();
        for (const [category, words] of Object.entries(keywords)) {
            if (words.some(word => lowerText.includes(word))) {
                return category;
            }
        }
        return 'destinations';
    }

    getMockNews() {
        return [
            {
                title: "European Cities Implement New Sustainable Tourism Measures",
                description: "Major European destinations introduce eco-friendly policies to reduce overtourism and promote sustainable travel practices.",
                url: "#",
                publishedAt: new Date().toISOString(),
                category: "destinations",
                source: "Travel Today"
            },
            {
                title: "Airlines Announce New Routes to Emerging Destinations",
                description: "Major carriers expand their networks with new flight routes to lesser-known but stunning travel destinations across Asia and Africa.",
                url: "#",
                publishedAt: new Date(Date.now() - 3600000).toISOString(),
                category: "airlines",
                source: "Aviation Weekly"
            },
            {
                title: "Travel Safety Updates: New Health Protocols for 2024",
                description: "Updated health and safety guidelines for international travelers including vaccination requirements and health insurance recommendations.",
                url: "#",
                publishedAt: new Date(Date.now() - 7200000).toISOString(),
                category: "safety",
                source: "Health Travel"
            },
            {
                title: "Limited Time: 50% Off Summer Travel Packages",
                description: "Exclusive travel deals for summer 2024 including discounted flights, hotels, and vacation packages to popular destinations.",
                url: "#",
                publishedAt: new Date(Date.now() - 10800000).toISOString(),
                category: "deals",
                source: "Travel Deals Daily"
            },
            {
                title: "Cultural Festivals Around the World: 2024 Calendar",
                description: "Discover amazing cultural festivals and events happening worldwide. From music festivals to traditional celebrations, plan your cultural journey.",
                url: "#",
                publishedAt: new Date(Date.now() - 14400000).toISOString(),
                category: "culture",
                source: "Culture & Travel"
            },
            {
                title: "Hidden Gems: 10 Underrated Destinations to Visit This Year",
                description: "Escape the crowds and discover incredible destinations that offer authentic experiences away from the typical tourist trails.",
                url: "#",
                publishedAt: new Date(Date.now() - 18000000).toISOString(),
                category: "destinations",
                source: "Hidden Travel"
            },
            {
                title: "Airport Security Updates: Faster Processing Times",
                description: "New security technologies and procedures promise shorter wait times and improved passenger experience at major airports.",
                url: "#",
                publishedAt: new Date(Date.now() - 21600000).toISOString(),
                category: "airlines",
                source: "Airport News"
            },
            {
                title: "Digital Nomad Visas: New Programs Launched Worldwide",
                description: "Countries around the world introduce new digital nomad visa programs, making remote work travel easier than ever.",
                url: "#",
                publishedAt: new Date(Date.now() - 25200000).toISOString(),
                category: "destinations",
                source: "Digital Nomad Times"
            },
            {
                title: "Climate Change Impact on Popular Tourist Destinations",
                description: "How climate change is affecting top travel destinations and what travelers should know about sustainable tourism practices.",
                url: "#",
                publishedAt: new Date(Date.now() - 28800000).toISOString(),
                category: "safety",
                source: "Eco Travel News"
            }
        ];
    }



    displayNews(news) {
        const container = document.getElementById('newsContainer');
        container.innerHTML = '';

        news.forEach(article => {
            const newsCard = this.createNewsCard(article);
            container.appendChild(newsCard);
        });

        this.updateLastUpdated();
    }

    createNewsCard(article) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 col-sm-12';
        
        const categoryColors = {
            destinations: 'success',
            airlines: 'primary',
            safety: 'warning',
            deals: 'danger',
            culture: 'info'
        };

        const badgeColor = categoryColors[article.category] || 'secondary';
        const timeAgo = this.getTimeAgo(article.publishedAt);

        col.innerHTML = `
            <div class="card news-card h-100" data-category="${article.category}">
                <div class="card-header bg-light position-relative">
                    <span class="badge bg-${badgeColor}">${article.category.charAt(0).toUpperCase() + article.category.slice(1)}</span>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text flex-grow-1">${article.description}</p>
                    <div class="news-meta mb-3">
                        <i class="fas fa-clock me-1"></i> ${timeAgo}
                        <span class="mx-2">•</span>
                        <i class="fas fa-newspaper me-1"></i> ${article.source}
                    </div>
                    <a href="${article.url}" class="btn btn-outline-primary" target="_blank" rel="noopener">
                        Read Full Article <i class="fas fa-external-link-alt ms-1"></i>
                    </a>
                </div>
            </div>
        `;

        return col;
    }

    filterNews(category) {
        const filteredNews = category === 'all' 
            ? this.newsData 
            : this.newsData.filter(article => article.category === category);
        
        this.displayNews(filteredNews);
    }

    showLoading() {
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('newsContainer').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('newsContainer').style.display = 'flex';
    }

    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 60) {
            return `${diffInMinutes} minutes ago`;
        } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInMinutes / 1440);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }

    updateLastUpdated() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        document.getElementById('lastUpdated').textContent = timeString;
    }

    loadDailyTip() {
        const tips = [
            "Book flights on Tuesday afternoons for the best deals - airlines often release sales on Monday nights.",
            "Download offline maps before traveling to avoid data charges and navigation issues.",
            "Pack one outfit in your carry-on in case your checked luggage gets delayed.",
            "Use incognito mode when booking flights to avoid price increases from repeated searches.",
            "Research local customs and basic phrases before visiting a new country.",
            "Keep digital and physical copies of important documents in separate locations.",
            "Book accommodations with free cancellation when possible for maximum flexibility.",
            "Check visa requirements at least 3 months before your planned departure date.",
            "Consider travel insurance for trips involving expensive bookings or adventure activities.",
            "Use a VPN when connecting to public Wi-Fi to protect your personal information."
        ];

        const today = new Date().getDate();
        const tipIndex = today % tips.length;
        document.getElementById('dailyTip').textContent = tips[tipIndex];
    }
}

// Global functions for HTML event handlers
function refreshNews() {
    if (window.travelNewsletter) {
        window.travelNewsletter.loadInitialNews();
    }
}

function subscribeNewsletter() {
    const email = document.getElementById('subscriptionEmail').value;
    if (email && email.includes('@')) {
        alert(`Thank you! You've been subscribed to our travel newsletter with ${email}. You'll receive weekly updates about the latest travel news and exclusive deals.`);
        document.getElementById('subscriptionEmail').value = '';
    } else {
        alert('Please enter a valid email address.');
    }
}

// Initialize the newsletter app
let travelNewsletter;
document.addEventListener('DOMContentLoaded', () => {
    travelNewsletter = new TravelNewsletterApp();
    window.travelNewsletter = travelNewsletter;
});

// Export for global access
window.TravelNewsletterApp = TravelNewsletterApp; 