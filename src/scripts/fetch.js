const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const axios = require('axios');
const slugify = require('slugify');

const parser = new Parser();

// AI Rewriting Logic (Simulated for setup, needs API Key)
async function rewriteContent(title, content, category) {
    if (!process.env.AI_API_KEY) {
        console.warn("⚠️ No AI API Key found. Skipping rewrite (using raw summary).");
        return {
            title: `[Preview] ${title}`,
            content: `Configuration Required: Please add your AI API Key to GitHub Secrets to enable automatic rewriting and simplification of this article about ${category}. \n\nOriginal Snippet: ${content.substring(0, 200)}...`,
            summary: "AI Key missing.",
            whyMatters: "Setup required to generate 'Why this matters'."
        };
    }

    try {
        const prompt = `
        You are a kid-friendly news reporter for Africa. 
        Rewrite this news item for a Class 2 student level (simple English).
        
        CRITICAL: The article must be at least 500 words long. Expand with context, "Did you know?" facts, and detailed simple explanations.
        
        Original Title: ${title}
        Original Content: ${content}
        
        Output JSON format only:
        {
            "title": "Simple headline here",
            "content": "Full simple article here (At least 500 words, use <h3> subheadings, short paragraphs)",
            "summary": "1 sentence summary",
            "whyMatters": "Why this is important in simple words"
        }
        `;

        // Gemini API Call
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.AI_API_KEY}`;

        const response = await axios.post(geminiUrl, {
            contents: [{
                parts: [{ text: prompt }]
            }]
        });

        const rawData = response.data.candidates[0].content.parts[0].text;
        // Clean markdown code blocks if present
        const jsonStr = rawData.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("AI Error:", error.response ? error.response.data : error.message);
        return {
            title: title,
            content: content, // Fallback
            summary: "Error rewriting content.",
            whyMatters: "Unknown"
        };
    }
}

async function getImage(query) {
    // Royalty free header image (Unsplash source or similar static placeholder generator)
    // Using source.unsplash.com is deprecated/unreliable, better to use specific keywords
    // For now, returning a reliable placeholder service with keywords
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=800&height=400&nologo=true`;
}

async function fetchNews() {
    console.log("Starting news fetch...");
    let allArticles = [];

    for (const feedUrl of config.rssFeeds) {
        try {
            console.log(`Fetching ${feedUrl}`);
            const feed = await parser.parseURL(feedUrl);

            // limit items per feed to avoid API quotas exploding
            const items = feed.items.slice(0, config.ITEMS_PER_FEED);

            for (const item of items) {
                // Determine Category
                let categoryId = 'world'; // default
                const combinedText = (item.title + " " + item.contentSnippet).toLowerCase();

                for (const cat of config.categories) {
                    if (cat.keywords.some(k => combinedText.includes(k))) {
                        categoryId = cat.id;
                        break;
                    }
                }

                console.log(`Processing: ${item.title} [${categoryId}]`);

                // Rewrite
                const rewritten = await rewriteContent(item.title, item.contentSnippet || item.content || "", config.categories.find(c => c.id === categoryId).name);

                // Image - Enhanced Prompt for Realism
                const imagePrompt = `${rewritten.title} realistic news photography context ${config.categories.find(c => c.id === categoryId).name} high quality`;
                const imageUrl = await getImage(imagePrompt);

                allArticles.push({
                    originalTitle: item.title,
                    title: rewritten.title,
                    content: rewritten.content,
                    summary: rewritten.summary,
                    whyMatters: rewritten.whyMatters,
                    category: categoryId,
                    date: new Date().toISOString(),
                    image: imageUrl,
                    urlSlug: slugify(rewritten.title, { lower: true, strict: true }),
                    originalLink: item.link
                });

                // RATE LIMITING PROTECTION
                // Gemini Free Tier allows 15 requests per minute (1 request every 4 seconds).
                // We wait 5 seconds here to be absolutely safe.
                console.log("Waiting 5s to respect API limits...");
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

        } catch (e) {
            console.error(`Failed to fetch/parse ${feedUrl}:`, e.message);
        }
    }

    // Save to JSON
    const outputPath = path.join(__dirname, '../assets/news.json');
    fs.writeFileSync(outputPath, JSON.stringify(allArticles, null, 2));
    console.log(`Saved ${allArticles.length} articles to news.json`);
}

fetchNews();
