const fs = require('fs-extra');
const path = require('path');
const config = require('./config');

const TEMPLATE_PATH = path.join(__dirname, '../template.html');
const NEWS_JSON_PATH = path.join(__dirname, '../assets/news.json');
const DIST_DIR = path.join(__dirname, '../../dist');

async function generateSite() {
    console.log("Starting Static Site Generation...");

    // Ensure dist exists
    fs.ensureDirSync(DIST_DIR);
    fs.ensureDirSync(path.join(DIST_DIR, 'category'));
    fs.ensureDirSync(path.join(DIST_DIR, 'article'));

    // Copy CSS
    fs.copySync(path.join(__dirname, '../styles.css'), path.join(DIST_DIR, 'styles.css'));
    console.log("Copied styles.css");

    // Read Data
    let articles = [];
    if (fs.existsSync(NEWS_JSON_PATH)) {
        articles = JSON.parse(fs.readFileSync(NEWS_JSON_PATH, 'utf8'));
    } else {
        console.warn("⚠️ No news.json found. Building empty site.");
    }

    const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

    // 0.5 Copy news.json for client-side search
    if (fs.existsSync(NEWS_JSON_PATH)) {
        fs.copySync(NEWS_JSON_PATH, path.join(DIST_DIR, 'news.json'));
    }

    // Helper to render a page
    const renderPage = (title, description, contentHtml, activeNav = '') => {
        let html = template
            .replace('{{TITLE}}', title)
            .replace('{{DESCRIPTION}}', description)
            .replace('{{CONTENT}}', contentHtml);

        // Featured News Logic - Just picking the first one as "Breaking" or random
        let featuredHtml = '';
        if (articles.length > 0) {
            const feat = articles[0]; // Simplest "Breaking" is the newest one
            featuredHtml = `
                <div class="container" style="padding: 0 16px;">
                    <span class="featured-label">BREAKING NEWS</span>
                    <h3><a href="/article/${feat.urlSlug}.html" style="text-decoration:none; color:inherit;">${feat.title}</a></h3>
                </div>
            `;
        }
        html = html.replace('{{FEATURED_NEWS}}', featuredHtml);

        // Handle Nav Active States
        // Dynamic replacement for all categories
        const allNavKeys = ['HOME', ...config.categories.map(c => c.id.toUpperCase())];

        allNavKeys.forEach(key => {
            // Check specific logic since some IDs might not match strictly if we changed them (but we didn't)
            // The template uses {{NAV_AFRICA_ACTIVE}} etc.
            html = html.replace(`{{NAV_${key}_ACTIVE}}`, activeNav === key ? 'active' : '');
        });

        return html;
    };

    // 1. Generate Article Pages
    articles.forEach(article => {
        const articleHtml = `
            <article class="article-full">
                <p class="meta">${article.date.split('T')[0]} | ${article.category.toUpperCase()}</p>
                <h1>${article.title}</h1>
                <img src="${article.image}" alt="${article.title}" loading="lazy">
                
                <div class="why-matters">
                    <h3>Why this matters</h3>
                    <p>${article.whyMatters}</p>
                </div>

                <div class="article-content">
                    ${article.content.replace(/\n/g, '<br>')}
                </div>

                <hr>
                <div class="summary">
                    <h3>Quick Summary</h3>
                    <p>${article.summary}</p>
                </div>
                <a href="/" class="btn">Back to Home</a>
            </article>
        `;

        // Pass 'null' or determine category for active state if we wanted
        const finalHtml = renderPage(article.title, article.summary, articleHtml, article.category.toUpperCase());
        fs.writeFileSync(path.join(DIST_DIR, 'article', `${article.urlSlug}.html`), finalHtml);
    });
    console.log(`Generated ${articles.length} article pages.`);

    // 2. Generate Category Pages
    config.categories.forEach(cat => {
        const catArticles = articles.filter(a => a.category === cat.id);
        const cardHtml = catArticles.map(a => `
            <div class="article-card">
                <img src="${a.image}" alt="${a.title}" class="lazy" data-src="${a.image}">
                <p class="meta">${a.date.split('T')[0]}</p>
                <h2><a href="/article/${a.urlSlug}.html">${a.title}</a></h2>
                <p class="summary">${a.summary}</p>
            </div>
        `).join('');

        const pageHtml = `
            <h2>${cat.name}</h2>
            ${cardHtml || '<p>No news in this category yet. Check back later!</p>'}
        `;

        // Active key is just the ID uppercased
        const activeKey = cat.id.toUpperCase();

        const finalHtml = renderPage(cat.name, `Latest ${cat.name} news`, pageHtml, activeKey);
        fs.writeFileSync(path.join(DIST_DIR, 'category', `${cat.id}.html`), finalHtml);
    });
    console.log("Generated category pages.");

    // 3. Generate Homepage (Index)
    const latestArticles = articles.slice(0, 10); // Top 10 latest
    const homeHtml = `
        <h2>Latest News</h2>
        ${latestArticles.map(a => `
            <div class="article-card">
                <img src="${a.image}" alt="${a.title}" class="lazy" data-src="${a.image}">
                <p class="meta"><span style="color:red">${a.category.toUpperCase()}</span> | ${a.date.split('T')[0]}</p>
                <h2><a href="/article/${a.urlSlug}.html">${a.title}</a></h2>
                <p class="summary">${a.summary}</p>
            </div>
        `).join('')}
        ${latestArticles.length === 0 ? '<p>Welcome to AfroMint! Setup complete. Waiting for first update...</p>' : ''}
    `;

    const indexHtml = renderPage("Home", "Daily Simple News for Africa", homeHtml, 'HOME');
    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml);
    console.log("Generated Homepage.");

    // Create _redirects for Netlify (SPA fallback if needed, or simple redirect)
    // Not strictly needed for static site but good practice
    fs.writeFileSync(path.join(DIST_DIR, '_redirects'), "/* /index.html 200");

}

generateSite();
