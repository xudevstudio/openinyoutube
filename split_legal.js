const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const sourceFile = path.join(publicDir, 'Privacy-and-Terms.html');

if (!fs.existsSync(sourceFile)) {
    console.error('Privacy-and-Terms.html not found!');
    process.exit(1);
}

const content = fs.readFileSync(sourceFile, 'utf8');

// The file has a container with:
// <h1>Terms and Conditions</h1> ...
// <hr style="...">
// <h1>Privacy Policy</h1> ...

// We will just copy the entire file to privacy-policy.html and terms-and-conditions.html, 
// then replace the title and inner container contents.
let privacyHtml = content.replace('<title>Privacy Policy & Terms - OpeninYoutube</title>', '<title>Privacy Policy - OpeninYoutube</title>');
privacyHtml = privacyHtml.replace(/<h1>Terms and Conditions<\/h1>[\s\S]*?<hr style="border:0; border-top:1px solid var\(--border\); margin: 3rem 0;">\s*<h1>Privacy Policy<\/h1>/, '<h1>Privacy Policy</h1>');

let termsHtml = content.replace('<title>Privacy Policy & Terms - OpeninYoutube</title>', '<title>Terms and Conditions - OpeninYoutube</title>');
termsHtml = termsHtml.replace(/<hr style="border:0; border-top:1px solid var\(--border\); margin: 3rem 0;">\s*<h1>Privacy Policy<\/h1>[\s\S]*?<!-- AdSense Content Unit -->/, '<!-- AdSense Content Unit -->');

fs.writeFileSync(path.join(publicDir, 'privacy-policy.html'), privacyHtml);
fs.writeFileSync(path.join(publicDir, 'terms-and-conditions.html'), termsHtml);

console.log('Created privacy-policy.html and terms-and-conditions.html');

// Now update links in all html files
const files = fs.readdirSync(publicDir);

for (const file of files) {
    if (file.endsWith('.html')) {
        const filePath = path.join(publicDir, file);
        let htmlContent = fs.readFileSync(filePath, 'utf8');
        
        let modified = false;

        // Replace `<a href="Privacy-and-Terms.html">Privacy &amp; Terms</a>`
        // or `<a href="Privacy-and-Terms.html" class="active">Privacy &amp; Terms</a>`
        const regex1 = /<a href="Privacy-and-Terms\.html"([^>]*)>Privacy &amp; Terms<\/a>/g;
        if (regex1.test(htmlContent)) {
            htmlContent = htmlContent.replace(regex1, '<a href="privacy-policy.html"$1>Privacy Policy</a>\n                <a href="terms-and-conditions.html">Terms of Service</a>');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, htmlContent);
            console.log(`Updated links in ${file}`);
        }
    }
}

// Ensure the new files themselves get updated links if they missed it during the regex or generation
const updateSelf = (f) => {
    let htmlContent = fs.readFileSync(path.join(publicDir, f), 'utf8');
    htmlContent = htmlContent.replace(/<a href="privacy-policy\.html" class="active">Privacy Policy<\/a>[\s\S]*?<a href="terms-and-conditions\.html">Terms of Service<\/a>/g, 
        f === 'privacy-policy.html' 
            ? '<a href="privacy-policy.html" class="active">Privacy Policy</a>\n                <a href="terms-and-conditions.html">Terms of Service</a>'
            : '<a href="privacy-policy.html">Privacy Policy</a>\n                <a href="terms-and-conditions.html" class="active">Terms of Service</a>');
    
    fs.writeFileSync(path.join(publicDir, f), htmlContent);
}

updateSelf('privacy-policy.html');
updateSelf('terms-and-conditions.html');

console.log('Done mapping legal files!');
