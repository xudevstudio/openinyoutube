const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'public', 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

const authorBioHtml = `
            <div class="mt-12 mb-8 bg-gray-50 rounded-xl p-8 border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6">
                <div class="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">About the OpeninYoutube Technical Team</h3>
                    <p class="text-gray-600 leading-relaxed mb-4">
                        The OpeninYoutube team consists of deep-linking architects and creator economy growth specialists. With a combined 20+ years of experience in mobile app ecosystems and digital distribution, we build tools that eliminate friction between creators and their audiences. Our mission is to ensure every link click translates into meaningful engagement.
                    </p>
                    <a href="../About.html" class="text-red-600 font-semibold hover:text-red-700 transition-colors">Read our full story →</a>
                </div>
            </div>
`;

let linkFixCount = 0;
let bioInsertCount = 0;

files.forEach(file => {
    const filePath = path.join(blogDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix legal links
    const oldLegalLink = /<a href="\.\.\/Privacy-and-Terms\.html" class="text-sm text-gray-500 hover:text-gray-900">Privacy & Terms<\/a>/g;
    const newLegalLinks = `<a href="../privacy-policy.html" class="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a>
                        <a href="../terms-and-conditions.html" class="text-sm text-gray-500 hover:text-gray-900">Terms of Service</a>`;
    
    if (content.match(oldLegalLink)) {
        content = content.replace(oldLegalLink, newLegalLinks);
        linkFixCount++;
    } else {
        // Fallback for differently formatted links just in case
        content = content.replace(/href="\.\.\/Privacy-and-Terms\.html"/g, 'href="../privacy-policy.html"');
    }

    // 2. Inject Author Bio before the closing </article> tag
    if (!content.includes('About the OpeninYoutube Technical Team')) {
        const articleRegex = /<\/div>\s*<\/article>/;
        if (content.match(articleRegex)) {
            content = content.replace(articleRegex, `</div>\n${authorBioHtml}\n    </article>`);
            bioInsertCount++;
        }
    }

    fs.writeFileSync(filePath, content);
});

console.log(`Processed ${files.length} blog files.`);
console.log(`Fixed legal links in ${linkFixCount} files.`);
console.log(`Inserted Author Bio in ${bioInsertCount} files.`);
