import fs from 'fs';
import path from 'path';

const blogDir = '/Users/ania/Downloads/blog';
const outputFilePath = '/Users/ania/hrly-nowa strona 3d/HRLY-STRONA-2.0/src/hooks/useSiteConfig.ts';

// Helper to escape single quotes and backslashes for JS/TS string literals
function formatJsString(str) {
  if (!str) return '""';
  return JSON.stringify(str);
}

function run() {
  console.log('Rozpoczynam analizę katalogu bloga:', blogDir);
  const dirs = fs.readdirSync(blogDir).filter((file) => {
    const fullPath = path.join(blogDir, file);
    return fs.statSync(fullPath).isDirectory();
  });

  const parsedPosts = [];

  for (const slug of dirs) {
    const htmlPath = path.join(blogDir, slug, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      console.warn(`Brak pliku index.html w folderze: ${slug}`);
      continue;
    }

    const html = fs.readFileSync(htmlPath, 'utf8');

    // Parse Title
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    let title = titleMatch ? titleMatch[1].trim() : slug;
    // Strip suffix like " | HRly Blog"
    title = title.replace(/\s*\|\s*HRly Blog/g, '').replace(/\s*–\s*HRly/g, '');

    // Parse SEO Title
    const ogTitleMatch = html.match(/<meta property="og:title" content="(.*?)"/);
    const seoTitle = ogTitleMatch ? ogTitleMatch[1].trim().replace(/\s*\|\s*HRly Blog/g, '') : title;

    // Parse Description
    const descMatch = html.match(/<meta name="description" content="(.*?)"/);
    const seoDescription = descMatch ? descMatch[1].trim() : '';

    // Parse Date published
    const dateMatch = html.match(/"datePublished"\s*:\s*"(.*?)"/);
    let publishedAt = '2025-03-20'; // default fallback
    if (dateMatch) {
      publishedAt = dateMatch[1].substring(0, 10);
    }

    // Parse Image Url
    const imgMatch = html.match(/<meta property="og:image" content="(.*?)"/);
    let imageUrl = '';
    if (imgMatch) {
      imageUrl = imgMatch[1].trim();
      // Replace absolute old domain if any with relative path or keep absolute
      if (imageUrl.startsWith('https://hrly.pl')) {
        // Keep absolute or make relative, keeping absolute is safer for external WP uploads
      }
    }

    // Parse Category / Tag
    const tagMatch = html.match(/<span class="blog-tag">(.*?)<\/span>/);
    const category = tagMatch ? tagMatch[1].trim() : 'Ogólne';

    // Parse Content
    const contentMatch = html.match(/<div class="post-content">([\s\S]*?)<\/div>/);
    let content = contentMatch ? contentMatch[1].trim() : '';
    
    // Clean content comments and unnecessary tags
    content = content.replace(/<!--[\s\S]*?-->/g, '');

    const post = {
      id: `bp_${slug.replace(/[^a-zA-Z0-9]/g, '_')}`,
      title,
      slug,
      excerpt: seoDescription,
      content,
      category,
      tags: [category],
      author: 'Anna Kępczyńska',
      publishedAt,
      status: 'published',
      seoTitle,
      seoDescription,
      imageUrl,
      copywritingFramework: '',
      socialPosts: []
    };

    parsedPosts.push(post);
    console.log(`✓ Sparsowano pomyślnie: ${title} (${slug})`);
  }

  console.log(`Łącznie sparsowano artykułów: ${parsedPosts.length}`);

  // Now, update useSiteConfig.ts by replacing the blogPosts: [] line
  const siteConfigContent = fs.readFileSync(outputFilePath, 'utf8');

  // Format array to pretty JS string
  const formattedPostsArray = JSON.stringify(parsedPosts, null, 2);

  const targetLine = '  blogPosts: [],';
  const replacement = `  blogPosts: ${formattedPostsArray},`;

  if (!siteConfigContent.includes(targetLine)) {
    console.error('Błąd: Nie znaleziono linii "  blogPosts: []," w useSiteConfig.ts');
    process.exit(1);
  }

  const updatedContent = siteConfigContent.replace(targetLine, replacement);
  fs.writeFileSync(outputFilePath, updatedContent, 'utf8');
  console.log('✓ Zaktualizowano useSiteConfig.ts o sparsowane wpisy!');
}

run();
