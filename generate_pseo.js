const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const dataPath = path.join(rootDir, 'data', 'keywords_database.json');
const pagesDir = path.join(rootDir, 'pages');

if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
}

if (!fs.existsSync(dataPath)) {
    console.error('Error: keywords_database.json not found!');
    process.exit(1);
}

const keywordDb = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const pseoPages = keywordDb.keyword_clusters;

const domain = "https://search.sturio.io";

// --- 1. GENERATE INDIVIDUAL PSEO LANDING PAGES ---
function generateHTML(page) {
    const allPseoLinks = pseoPages.map(p => `
        <li>
            <a href="./${p.slug}" class="text-xs text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5 py-1">
                <i class="fa-solid fa-angle-right text-[10px] text-brand-500"></i> ${p.h1}
            </a>
        </li>
    `).join('');

    const primaryKwBadges = page.primaryKeywords.map(kw => 
        `<span class="text-xs bg-brand-500/10 text-brand-700 dark:text-brand-300 font-medium px-2.5 py-1 rounded-md border border-brand-500/20">${kw}</span>`
    ).join(' ');

    const lsiKwBadges = page.lsiKeywords.map(kw => 
        `<span class="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-mono px-2 py-0.5 rounded">${kw}</span>`
    ).join(' ');

    const faqs = page.customFaqs || [
        {
            q: `How do I search for ${page.primaryKeywords[0]}?`,
            a: `Select the ${page.category.toUpperCase()} category in SearchPro, enter your keyword, and enable the Index Of switch to generate precise dork filters.`
        },
        {
            q: `Is SearchPro free for ${page.h1}?`,
            a: `Yes, SearchPro is 100% free, client-side, and requires no registration or software installation.`
        }
    ];

    const faqEntities = faqs.map(f => `{
        "@type": "Question",
        "name": ${JSON.stringify(f.q)},
        "acceptedAnswer": {
            "@type": "Answer",
            "text": ${JSON.stringify(f.a)}
        }
    }`).join(',');

    const faqsHTML = faqs.map(f => `
        <div class="border-b border-gray-100 dark:border-zinc-800 pb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white text-base mb-1">${f.q}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">${f.a}</p>
        </div>
    `).join('');

    const canonicalUrl = `${domain}/pages/${page.slug}`;
    const customIntro = page.customIntro || `Finding open directories and public cloud storage for <strong>${page.primaryKeywords.join(', ')}</strong> requires targeted search dorks. SearchPro isolates raw web server folder indexes allowing you to access public files directly.`;
    const customDorkGuide = page.customDorkGuide || `SearchPro dynamically constructs the exact payload based on your selected file categories and parameters, automatically inserting negative keywords to exclude spam landing pages.`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-2J4P56JGT5"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-2J4P56JGT5');
    </script>

    <title>${page.title.replace(/OmniSearch Pro/g, 'SearchPro')}</title>
    
    <meta name="description" content="${page.metaDescription.replace(/OmniSearch Pro/g, 'SearchPro')}">
    <meta name="keywords" content="${page.primaryKeywords.join(', ')}, ${page.lsiKeywords.join(', ')}">
    <meta name="author" content="lofedev | SearchPro (Sturio Ecosystem)">
    <meta name="robots" content="index, follow, max-image-preview:large">
    
    <link rel="canonical" href="${canonicalUrl}">
    <meta name="theme-color" content="#eab308">
        <!-- Favicon & Search Indexing Icons -->
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link rel="alternate icon" type="image/x-icon" href="../favicon.ico">
    <link rel="icon" type="image/png" sizes="48x48" href="../favicon-48.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png">
    <link rel="manifest" href="../manifest.json">
    <link rel="alternate" type="application/rss+xml" title="SearchPro PSEO Feed" href="../feed.xml">

    <!-- Speed Optimization -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${page.title.replace(/OmniSearch Pro/g, 'SearchPro')}">
    <meta property="og:description" content="${page.metaDescription.replace(/OmniSearch Pro/g, 'SearchPro')}">
    <meta property="og:image" content="${domain}/og-image.png">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${page.title.replace(/OmniSearch Pro/g, 'SearchPro')}">
    <meta name="twitter:description" content="${page.metaDescription.replace(/OmniSearch Pro/g, 'SearchPro')}">

    <!-- Multi-Schema JSON-LD (HowTo + TechArticle + FAQPage + Breadcrumbs) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "${domain}/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "PSEO Hub",
              "item": "${domain}/pages/"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": ${JSON.stringify(page.h1)},
              "item": "${canonicalUrl}"
            }
          ]
        },
        {
          "@type": "HowTo",
          "name": ${JSON.stringify(`How to Search for ${page.primaryKeywords[0]}`)},
          "description": ${JSON.stringify(page.metaDescription.replace(/OmniSearch Pro/g, 'SearchPro'))},
          "step": [
            {
              "@type": "HowToStep",
              "position": 1,
              "name": "Select File Category",
              "text": ${JSON.stringify(`Choose the ${page.category.toUpperCase()} category in SearchPro.`)}
            },
            {
              "@type": "HowToStep",
              "position": 2,
              "name": "Enter Target Keyword",
              "text": ${JSON.stringify(`Input keywords such as ${page.searchQuery} into the search pill.`)}
            },
            {
              "@type": "HowToStep",
              "position": 3,
              "name": "Execute Google Dork Query",
              "text": "Click Execute Search to open direct web directory indexes in Google."
            }
          ]
        },
        {
          "@type": "TechArticle",
          "headline": ${JSON.stringify(page.h1)},
          "description": ${JSON.stringify(page.metaDescription.replace(/OmniSearch Pro/g, 'SearchPro'))},
          "author": {
            "@type": "Person",
            "name": "lofedev",
            "worksFor": {
              "@type": "Organization",
              "name": "Sturio",
              "url": "https://sturio.io/"
            }
          },
          "publisher": {
            "@type": "Organization",
            "name": "SearchPro",
            "logo": {
              "@type": "ImageObject",
              "url": "${domain}/og-image.png"
            }
          },
          "mainEntityOfPage": "${canonicalUrl}"
        },
        {
          "@type": "FAQPage",
          "mainEntity": [${faqEntities}]
        }
      ]
    }
    </script>

    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'], mono: ['Fira Code', 'monospace'] },
                    colors: { brand: { 500: '#eab308', 600: '#ca8a04' }, darkBg: '#09090b', darkCard: '#18181b' }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 text-gray-900 dark:bg-darkBg dark:text-gray-100 min-h-screen flex flex-col antialiased">

    <!-- Header Navigation -->
    <header class="w-full border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3.5">
        <div class="max-w-5xl mx-auto flex items-center justify-between">
            <a href="../index.html" class="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                Search<span class="text-brand-500">Pro</span> <span class="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/20">PSEO Hub</span>
            </a>
            <a href="../index.html?cat=${page.category}&q=${encodeURIComponent(page.searchQuery)}" onclick="navigateWithFallback(event, '../index.html', 'cat=${page.category}&q=${encodeURIComponent(page.searchQuery)}')" class="bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs md:text-sm px-4 py-2 rounded-full transition-all shadow-sm flex items-center gap-2">
                Launch Search Engine <i class="fa-solid fa-arrow-right"></i>
            </a>
        </div>
    </header>

    <!-- Hero Header -->
    <div class="w-full bg-gradient-to-b from-amber-500/5 via-transparent to-transparent py-10 px-4 border-b border-gray-100 dark:border-zinc-800/50">
        <div class="max-w-4xl mx-auto text-center">
            <nav class="flex justify-center items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">
                <a href="../index.html" class="hover:text-brand-500 transition-colors">Home</a>
                <i class="fa-solid fa-chevron-right text-[9px] opacity-40"></i>
                <a href="./index.html" class="hover:text-brand-500 transition-colors">PSEO Hub</a>
                <i class="fa-solid fa-chevron-right text-[9px] opacity-40"></i>
                <span class="text-gray-800 dark:text-gray-200">Guide</span>
            </nav>
            <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 leading-tight">${page.h1}</h1>
            <p class="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-normal mb-3">${page.summary.replace(/OmniSearch Pro/g, 'SearchPro')}</p>
            
            <!-- E-E-A-T Author Badge -->
            <div class="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-zinc-900/60 px-3 py-1.5 rounded-full border border-gray-200/50 dark:border-zinc-800/50 mb-6">
                <i class="fa-solid fa-code text-brand-500"></i> Developed by <span class="font-bold text-gray-800 dark:text-gray-200">lofedev</span> (Sub-product of <a href="https://sturio.io/" target="_blank" rel="noopener" class="text-brand-500 font-semibold hover:underline">Sturio</a>)
            </div>

            <!-- Embedded Quick Search Launcher -->
            <div class="max-w-xl mx-auto bg-white dark:bg-darkCard rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800 p-3 flex items-center gap-2">
                <i class="fa-solid fa-magnifying-glass text-gray-400 pl-3"></i>
                <input type="text" id="pseoQueryInput" value="${page.searchQuery}" placeholder="Enter search keyword..." class="flex-grow bg-transparent text-sm md:text-base outline-none text-gray-900 dark:text-white font-medium">
                <button onclick="launchSearch()" class="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all flex-shrink-0">
                    Execute Search
                </button>
            </div>
        </div>
    </div>

    <!-- Main Content Body -->
    <main class="w-full max-w-4xl mx-auto px-4 py-10 flex-grow">
        
        <!-- Target Extensions & Dork Syntax Badge -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div class="bg-white dark:bg-darkCard p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <h3 class="text-xs uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2">Primary Keyword Targets</h3>
                <div class="flex flex-wrap gap-1.5 mb-3">
                    ${primaryKwBadges}
                </div>
                <h3 class="text-xs uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2">Target Extensions</h3>
                <div class="flex flex-wrap gap-1">
                    ${page.targetExtensions.map(ext => `<span class="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded font-mono">${ext}</span>`).join(' ')}
                </div>
            </div>
            <div class="bg-white dark:bg-darkCard p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-xs uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500">Automated Dork Pattern</h3>
                    <button onclick="copyDork()" class="text-xs text-brand-500 hover:underline font-medium flex items-center gap-1">
                        <i class="fa-regular fa-copy"></i> <span id="copyText">Copy Payload</span>
                    </button>
                </div>
                <code id="dorkCode" class="text-xs text-brand-600 dark:text-brand-400 font-mono break-all block bg-gray-50 dark:bg-black/40 p-3 rounded-lg border border-gray-100 dark:border-zinc-800 mb-3">${page.dorkExample}</code>
                <h3 class="text-xs uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2">LSI Search Keywords</h3>
                <div class="flex flex-wrap gap-1">
                    ${lsiKwBadges}
                </div>
            </div>
        </div>

        <!-- 100% Unique Longform Article Sections -->
        <article class="bg-white dark:bg-darkCard p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-10 space-y-6">
            <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <i class="fa-solid fa-magnifying-glass-location text-brand-500"></i> Understanding ${page.h1}
                </h2>
                <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    ${customIntro.replace(/OmniSearch Pro/g, 'SearchPro')}
                </p>
            </div>

            <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <i class="fa-solid fa-code text-brand-500"></i> Technical Dork Syntax Breakdown
                </h2>
                <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    ${customDorkGuide.replace(/OmniSearch Pro/g, 'SearchPro')}
                </p>
            </div>

            <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <i class="fa-solid fa-shield-halved text-brand-500"></i> Safety & Checksum Guidelines
                </h2>
                <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    When downloading files from open web directories or public cloud folders, always compute and verify SHA256/MD5 checksum hashes against official repository releases, and ensure antivirus scanning is active on your device.
                </p>
            </div>
        </article>

        <!-- Tailored FAQs Section -->
        <section class="bg-white dark:bg-darkCard p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-12">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <i class="fa-solid fa-circle-question text-brand-500"></i> Frequently Asked Questions
            </h2>
            <div class="space-y-4">
                ${faqsHTML}
            </div>
        </section>

        <!-- PSEO Internal Links Network -->
        <section class="bg-gray-100/70 dark:bg-zinc-900/50 p-6 rounded-2xl border border-gray-200/60 dark:border-zinc-800/60">
            <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">PSEO Keyword Intent Network (${pseoPages.length} Topics)</h3>
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-2">
                ${allPseoLinks}
            </ul>
        </section>

    </main>

    <!-- White-Hat Trust Footer -->
    <footer class="w-full border-t border-gray-200 dark:border-zinc-800 py-8 bg-white dark:bg-zinc-900 text-center text-xs text-gray-500 dark:text-gray-400">
        <div class="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div class="font-semibold text-gray-700 dark:text-gray-300">Search<span class="text-brand-500">Pro</span> Engine — Developed by <strong>lofedev</strong> (Sub-product of <a href="https://sturio.io/" target="_blank" rel="noopener" class="text-brand-500 hover:underline font-bold">Sturio</a>)</div>
            <div class="flex flex-wrap justify-center gap-4">
                <a href="../index.html" class="hover:text-brand-500 transition-colors">Main Engine</a>
                <a href="./index.html" class="hover:text-brand-500 transition-colors">PSEO Hub</a>
                <a href="../sitemap.html" class="hover:text-brand-500 transition-colors">HTML Sitemap</a>
                <a href="../privacy.html" class="hover:text-brand-500 transition-colors">Privacy Policy</a>
                <a href="../terms.html" class="hover:text-brand-500 transition-colors">Terms & Disclaimer</a>
                <a href="../about.html" class="hover:text-brand-500 transition-colors">About Us</a>
            </div>
        </div>
        <p>&copy; ${new Date().getFullYear()} Search<span class="text-brand-500">Pro</span>. Developed by <strong>lofedev</strong> (A Sub-product of <a href="https://sturio.io/" target="_blank" rel="noopener" class="text-brand-500 hover:underline font-semibold">Sturio</a>).</p>
    </footer>

    <script>
        function getSafeTargetUrl(baseUrl, queryParamStr) {
            const isFile = window.location.protocol === 'file:';
            const delimiter = isFile ? '#' : '?';
            return baseUrl + delimiter + queryParamStr;
        }

        function navigateWithFallback(event, baseUrl, queryParamStr) {
            if (window.location.protocol === 'file:') {
                if (event) event.preventDefault();
                window.location.href = baseUrl + '#' + queryParamStr;
            }
        }

        function launchSearch() {
            const val = document.getElementById('pseoQueryInput').value.trim();
            const queryStr = 'cat=${page.category}' + (val ? '&q=' + encodeURIComponent(val) : '');
            window.location.href = getSafeTargetUrl('../index.html', queryStr);
        }

        function copyDork() {
            const text = document.getElementById('dorkCode').innerText;
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById('copyText');
                btn.innerText = 'Copied!';
                setTimeout(() => { btn.innerText = 'Copy Payload'; }, 2000);
            });
        }

        document.getElementById('pseoQueryInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') launchSearch();
        });
    </script>
</body>
</html>`;
}

// Generate PSEO Landing Pages
let generatedCount = 0;
pseoPages.forEach(page => {
    const htmlContent = generateHTML(page);
    const filePath = path.join(pagesDir, page.slug);
    fs.writeFileSync(filePath, htmlContent, 'utf8');
    console.log(`Generated PSEO page: ${page.slug}`);
    generatedCount++;
});

// --- 2. GENERATE PSEO GUIDE HUB (`pages/index.html`) WITH 6 TOPICAL CATEGORY SILOES ---
const categories = [
    { id: 'video', name: '<i class="fa-solid fa-film text-brand-500"></i> Video & Movies', desc: '4K Movies, Anime, MKV, Stock Videos, and Google Drive Video Directories' },
    { id: 'text', name: '<i class="fa-solid fa-book-open text-brand-500"></i> Documents & eBooks', desc: 'PDFs, College Textbooks, Research Papers, Dorks Cheat Sheet, and Programming Books' },
    { id: 'software', name: '<i class="fa-solid fa-floppy-disk text-brand-500"></i> Software & Gaming', desc: 'ISOs, APKs, Dork Generator Tool, Kali Linux, Retro ROMs, and Developer Tools' },
    { id: 'audio', name: '<i class="fa-solid fa-music text-brand-500"></i> Audio & Music', desc: 'FLAC Lossless Audio, Audiobooks, VST Plugins, OST Soundtracks, and Sample Packs' },
    { id: 'compressed', name: '<i class="fa-solid fa-cloud text-brand-500"></i> Cloud Storage & Dorks', desc: 'Google Drive, Mega.nz, OneDrive, Dropbox, Mediafire, Archive.org, and FTP' },
    { id: 'pictures', name: '<i class="fa-solid fa-image text-brand-500"></i> Graphics & Media Assets', desc: 'Comics CBZ, 4K Wallpapers, Fonts TTF, 3D STL Models, and Subtitles' }
];

const categorySiloHTML = categories.map(cat => {
    const matchingPages = pseoPages.filter(p => p.category === cat.id || (cat.id === 'compressed' && ['compressed','video','text','software'].includes(p.category) && (p.slug.includes('mega') || p.slug.includes('drive') || p.slug.includes('dropbox') || p.slug.includes('mediafire') || p.slug.includes('onedrive') || p.slug.includes('ftp') || p.slug.includes('telegram') || p.slug.includes('discord') || p.slug.includes('archive'))));
    return `
        <div class="mb-10">
            <div class="border-b border-gray-200 dark:border-zinc-800 pb-3 mb-4">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">${cat.name}</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${cat.desc}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${matchingPages.map(p => `
                    <a href="./${p.slug}" class="group bg-white dark:bg-darkCard p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-brand-500 transition-all flex flex-col">
                        <h3 class="text-base font-bold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors mb-2 leading-snug">${p.h1}</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 font-normal">${p.summary.replace(/OmniSearch Pro/g, 'SearchPro')}</p>
                        <span class="mt-auto text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                            Explore Guide <i class="fa-solid fa-arrow-right text-[10px]"></i>
                        </span>
                    </a>
                `).join('')}
            </div>
        </div>
    `;
}).join('');

const hubHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-2J4P56JGT5"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-2J4P56JGT5');
    </script>

    <title>PSEO Search Guides & Knowledge Base | SearchPro</title>
    
    <meta name="description" content="Explore SearchPro Knowledge Base & PSEO Guides. Index of open directories, public Google Drive search tricks, cloud storage links, and file search operators. Developed by lofedev.">
    <meta name="robots" content="index, follow">
    
    <link rel="canonical" href="${domain}/pages/">
    <meta name="theme-color" content="#eab308">
        <!-- Favicon & Search Indexing Icons -->
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link rel="alternate icon" type="image/x-icon" href="../favicon.ico">
    <link rel="icon" type="image/png" sizes="48x48" href="../favicon-48.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png">
    <link rel="manifest" href="../manifest.json">

    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: { brand: { 500: '#eab308', 600: '#ca8a04' }, darkBg: '#09090b', darkCard: '#18181b' }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 text-gray-900 dark:bg-darkBg dark:text-gray-100 min-h-screen flex flex-col antialiased">
    <header class="w-full border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3.5">
        <div class="max-w-5xl mx-auto flex items-center justify-between">
            <a href="../index.html" class="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                Search<span class="text-brand-500">Pro</span>
            </a>
            <a href="../index.html" class="bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs md:text-sm px-4 py-2 rounded-full transition-all">
                Launch Application
            </a>
        </div>
    </header>

    <main class="w-full max-w-5xl mx-auto px-4 py-12 flex-grow">
        <div class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">PSEO Knowledge Base & Guides</h1>
            <p class="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Categorized directory of ${pseoPages.length} specialized search guides, dork operators, tools, and public cloud file indexing topics.</p>
        </div>

        ${categorySiloHTML}
    </main>

    <footer class="w-full border-t border-gray-200 dark:border-zinc-800 py-6 text-center text-xs text-gray-500">
        <div class="flex flex-wrap justify-center gap-4 mb-2">
            <a href="../sitemap.html" class="hover:underline">HTML Sitemap</a>
            <a href="../privacy.html" class="hover:underline">Privacy Policy</a>
            <a href="../terms.html" class="hover:underline">Terms of Service</a>
            <a href="../about.html" class="hover:underline">About Us</a>
            <a href="https://sturio.io/" target="_blank" rel="noopener" class="hover:underline font-bold text-brand-500">Sturio Main Site</a>
        </div>
        <p>&copy; ${new Date().getFullYear()} Search<span class="text-brand-500">Pro</span> Engine — Developed by <strong>lofedev</strong> (A Sub-product of <a href="https://sturio.io/" target="_blank" rel="noopener" class="text-brand-500 font-bold hover:underline">Sturio</a>).</p>
    </footer>
</body>
</html>`;
fs.writeFileSync(path.join(pagesDir, 'index.html'), hubHTML, 'utf8');

// --- 3. GENERATE VISUAL HTML SITEMAP (`sitemap.html`) WITH LIGHT & DARK MODE SUPPORT ---
const mainPages = [
    { title: "Home - SearchPro Main Engine", url: "index.html", icon: "fa-house", desc: "Primary Google Dork & Open Directory Search Engine App" },
    { title: "SearchPro Minimal App", url: "omnisearch_pro_minimal.html", icon: "fa-bolt", desc: "Ultra-fast lightweight search interface" },
    { title: "PSEO Knowledge Base & Guide Hub", url: "pages/index.html", icon: "fa-book-atlas", desc: "Browse all 50 specialized file search guides and tools" },
    { title: "404 Error Page", url: "404.html", icon: "fa-magnifying-glass-minus", desc: "Custom error page for broken or non-existent URLs" },
    { title: "Privacy Policy", url: "privacy.html", icon: "fa-shield-halved", desc: "Client-side privacy architecture & zero tracking commitment" },
    { title: "Terms of Service & Disclaimer", url: "terms.html", icon: "fa-file-contract", desc: "Terms of service and search query disclaimer" },
    { title: "About SearchPro Engine", url: "about.html", icon: "fa-circle-info", desc: "Developed by lofedev (Sub-product of Sturio ecosystem)" },
    { title: "Sturio Main Portal", url: "https://sturio.io/", icon: "fa-globe", desc: "Official parent software ecosystem (sturio.io)", external: true }
];

const mainEntryCards = mainPages.map(p => `
    <a href="${p.url}" ${p.external ? 'target="_blank" rel="noopener"' : ''} class="group bg-white dark:bg-darkCard p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-brand-500 dark:hover:border-brand-500 transition-all flex items-start gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500 group-hover:text-white transition-all">
            <i class="fa-solid ${p.icon} text-lg"></i>
        </div>
        <div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors flex items-center gap-1.5">
                ${p.title} ${p.external ? '<i class="fa-solid fa-up-right-from-square text-[10px] opacity-60"></i>' : ''}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">${p.desc}</p>
        </div>
    </a>
`).join('');

const pseoGuideLinks = pseoPages.map(p => `
    <a href="pages/${p.slug}" class="group bg-white dark:bg-darkCard p-3.5 rounded-xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm hover:border-brand-500 dark:hover:border-brand-500 transition-all flex items-center gap-3">
        <i class="fa-solid fa-file-lines text-brand-500 text-sm flex-shrink-0"></i>
        <span class="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-brand-500 transition-colors line-clamp-1">${p.h1}</span>
        <i class="fa-solid fa-chevron-right text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"></i>
    </a>
`).join('');

const htmlSitemap = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-2J4P56JGT5"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-2J4P56JGT5');
    </script>

    <title>HTML Sitemap - All Pages & Guides | SearchPro</title>
    
    <meta name="description" content="Visual HTML Sitemap for SearchPro. Access all open directory search tools, public Google Drive finders, and PSEO guides. Developed by lofedev (Sturio Ecosystem).">
    <meta name="author" content="lofedev | SearchPro (Sturio Ecosystem)">
    <meta name="robots" content="index, follow">
    
    <link rel="canonical" href="${domain}/sitemap.html">
    <meta name="theme-color" content="#eab308">
        <!-- Favicon & Search Indexing Icons -->
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="alternate icon" type="image/x-icon" href="favicon.ico">
    <link rel="icon" type="image/png" sizes="48x48" href="favicon-48.png">
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
    <link rel="manifest" href="manifest.json">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: { brand: { 500: '#eab308', 600: '#ca8a04' }, darkBg: '#09090b', darkCard: '#18181b' }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 text-gray-900 dark:bg-darkBg dark:text-gray-100 min-h-screen flex flex-col antialiased">
    <!-- Header with Light/Dark Mode Switcher -->
    <header class="w-full border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3.5">
        <div class="max-w-5xl mx-auto flex items-center justify-between">
            <a href="index.html" class="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                Search<span class="text-brand-500">Pro</span> <span class="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/20">HTML Sitemap</span>
            </a>
            <div class="flex items-center gap-3">
                <button type="button" id="themeToggleBtn" class="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors">
                    <i class="fa-solid fa-moon text-sm"></i>
                </button>
                <a href="index.html" class="bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs md:text-sm px-4 py-2 rounded-full transition-all shadow-sm">
                    Launch Application
                </a>
            </div>
        </div>
    </header>

    <!-- Main Container -->
    <main class="w-full max-w-5xl mx-auto px-4 py-10 flex-grow">
        
        <!-- Hero Header -->
        <div class="text-center mb-10">
            <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">Complete Site Directory</h1>
            <p class="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-normal">Indexed overview of all primary engine entry points, trust pages, legal disclosures, and ${pseoPages.length} specialized PSEO guides.</p>
            
            <div class="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-zinc-900/60 px-3 py-1.5 rounded-full border border-gray-200/50 dark:border-zinc-800/50 mt-4">
                <i class="fa-solid fa-code text-brand-500"></i> Developed by <span class="font-bold text-gray-800 dark:text-gray-200">lofedev</span> (Sub-product of <a href="https://sturio.io/" target="_blank" rel="noopener" class="text-brand-500 font-semibold hover:underline">Sturio</a>)
            </div>
        </div>

        <!-- Section 1: Main Entry Points & Trust Pages -->
        <section class="mb-12">
            <h2 class="text-lg font-extrabold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-2">
                <i class="fa-solid fa-compass text-brand-500"></i> Primary Entry Points & Legal Trust Pages
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${mainEntryCards}
            </div>
        </section>

        <!-- Section 2: PSEO Search Guides Directory -->
        <section>
            <h2 class="text-lg font-extrabold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-2">
                <i class="fa-solid fa-sitemap text-brand-500"></i> PSEO Search Guides & Keyword Intent Directory (${pseoPages.length} Topics)
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${pseoGuideLinks}
            </div>
        </section>

    </main>

    <!-- Footer -->
    <footer class="w-full border-t border-gray-200 dark:border-zinc-800 py-8 bg-white dark:bg-zinc-900 text-center text-xs text-gray-500 dark:text-gray-400">
        <div class="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div class="font-semibold text-gray-700 dark:text-gray-300">Search<span class="text-brand-500">Pro</span> Engine — Developed by <strong>lofedev</strong> (Sub-product of <a href="https://sturio.io/" target="_blank" rel="noopener" class="text-brand-500 hover:underline font-bold">Sturio</a>)</div>
            <div class="flex flex-wrap justify-center gap-4">
                <a href="index.html" class="hover:text-brand-500 transition-colors">Main Engine</a>
                <a href="pages/index.html" class="hover:text-brand-500 transition-colors">PSEO Hub</a>
                <a href="privacy.html" class="hover:text-brand-500 transition-colors">Privacy Policy</a>
                <a href="terms.html" class="hover:text-brand-500 transition-colors">Terms & Disclaimer</a>
                <a href="about.html" class="hover:text-brand-500 transition-colors">About Us</a>
            </div>
        </div>
        <p>&copy; ${new Date().getFullYear()} Search<span class="text-brand-500">Pro</span>. Developed by <strong>lofedev</strong> (A Sub-product of <a href="https://sturio.io/" target="_blank" rel="noopener" class="text-brand-500 hover:underline font-semibold">Sturio</a>).</p>
    </footer>

    <!-- Theme Switcher Script -->
    <script>
        const html = document.documentElement;
        const themeBtn = document.getElementById('themeToggleBtn');
        const themeIcon = themeBtn.querySelector('i');

        let isDark = localStorage.getItem('omni_theme') === 'dark';
        
        function applyTheme() {
            if (isDark) {
                html.classList.add('dark');
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                html.classList.remove('dark');
                themeIcon.classList.replace('fa-sun', 'fa-moon');
            }
        }
        applyTheme();

        themeBtn.addEventListener('click', () => {
            isDark = !isDark;
            localStorage.setItem('omni_theme', isDark ? 'dark' : 'light');
            applyTheme();
        });
    </script>
</body>
</html>`;
fs.writeFileSync(path.join(rootDir, 'sitemap.html'), htmlSitemap, 'utf8');

// --- 4. GENERATE RSS FEED (`feed.xml`) ---
const rssItems = pseoPages.map(p => `
    <item>
        <title>${p.h1}</title>
        <link>${domain}/pages/${p.slug}</link>
        <guid>${domain}/pages/${p.slug}</guid>
        <description>${p.metaDescription.replace(/OmniSearch Pro/g, 'SearchPro')}</description>
        <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
`).join('');

const rssXML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SearchPro - PSEO Search Guides</title>
    <link>${domain}/</link>
    <description>Latest PSEO guides for open directories, public Google Drive files, and cloud storage dorks. Developed by Rakib Ahmed (Sturio Ecosystem).</description>
    <language>en-us</language>
    <atom:link href="${domain}/feed.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;
fs.writeFileSync(path.join(rootDir, 'feed.xml'), rssXML, 'utf8');

// --- 5. GENERATE COMPREHENSIVE XML SITEMAP (`sitemap.xml`) ---
const sitemapUrls = [
    { loc: `${domain}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${domain}/index.html`, priority: '0.9', changefreq: 'daily' },
    { loc: `${domain}/omnisearch_pro_minimal.html`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${domain}/pages/`, priority: '0.8', changefreq: 'daily' },
    { loc: `${domain}/sitemap.html`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${domain}/privacy.html`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${domain}/terms.html`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${domain}/about.html`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${domain}/404.html`, priority: '0.3', changefreq: 'monthly' },
    { loc: `${domain}/llms.txt`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${domain}/llms-full.txt`, priority: '0.7', changefreq: 'weekly' },
    ...pseoPages.map(p => ({
        loc: `${domain}/pages/${p.slug}`,
        priority: '0.8',
        changefreq: 'weekly'
    }))
];

const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>2026-08-29</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), sitemapXML, 'utf8');
console.log(`Updated sitemap.xml with ${sitemapUrls.length} total URLs for domain ${domain}.`);

console.log(`\nAll 50 Master-Level SearchPro PSEO assets successfully built with yellow Pro & no G icon!`);
