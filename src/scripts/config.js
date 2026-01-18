module.exports = {
    siteName: "AfroMint",
    description: "Automated African News Aggregator",
    // Categories matching the user request
    categories: [
        { id: "world", name: "World News", keywords: ["world", "global", "un", "usa", "china", "ukraine", "gaza"] },
        { id: "politics", name: "Politics", keywords: ["politics", "election", "president", "parliament", "minister", "cabinet"] },
        { id: "government", name: "Government", keywords: ["government", "policy", "law", "court", "legal"] },
        { id: "business", name: "Business & Finance", keywords: ["business", "economy", "market", "trade", "money", "finance", "stock"] },
        { id: "jobs", name: "Jobs", keywords: ["job", "career", "hiring", "vacancy", "employment"] },
        { id: "sports", name: "Sports", keywords: ["football", "soccer", "caf", "concol", "league", "sport"] },
        { id: "entertainment", name: "Entertainment", keywords: ["music", "afrobeats", "movie", "celebrity", "drama"] },
        { id: "technology", name: "Technology", keywords: ["tech", "startup", "innovation", "mobile", "digital", "ai"] },
        { id: "health", name: "Health", keywords: ["health", "doctor", "virus", "hospital", "medicine"] }
    ],
    // Public RSS feeds (Examples - user can replace these)
    rssFeeds: [
        "http://feeds.bbci.co.uk/news/world/africa/rss.xml",
        "https://www.aljazeera.com/xml/rss/all.xml",
        "https://allafrica.com/tools/headlines/v2/00/headlines.xml",
        "http://feeds.reuters.com/reuters/AFRICA",
        "http://feeds.bbci.co.uk/news/world/rss.xml",
        "http://feeds.bbci.co.uk/sport/football/rss.xml"
    ],
    // API Configuration constants
    MAX_ARTICLES_PER_CATEGORY: 5,
    ITEMS_PER_FEED: 50 // Increased to target ~85% of daily free tier (50 * 6 feeds * 4 runs = ~1200 reqs/day max)
};
