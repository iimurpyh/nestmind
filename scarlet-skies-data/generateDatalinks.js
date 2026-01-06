const { init } = require('server-text-width');
const fs = require('fs');

const TEXT_WIDTH_LOOKUP_TABLE = {
    "Arimo|11px|700|0": "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"
}

const { getTextWidth } = init(TEXT_WIDTH_LOOKUP_TABLE);

// If a line is of this length or longer and ends with a single linebreak,
// it will be considered a Manual Line Wrap (MLW)
// Set this string to the shortest example of a line with a MLW you can find
const manualLineWrapWidth = getTextWidth("It is fairly weak, but is as light as Wood, and so a good material for aircraft and");

// Each match captures an article's name (group #1) and its text body (group #2).
const regexDatalinksRaw = /(?:local)?(\w*) = \[\[\t?\n?([\S\s]*?)\]\]/g;

// To be run on an article body.
// Matches the entire article title/header. Group #1 is the article's type
const regexArticleTypeHeader = /^(PART|TOOL|SYSTEM|SUBSTANCE): .*?\n\n/;

// To be run on an article body.
// Matches the entire article footer (i.e. the section with fields like Malleability: Good)
const regexArticleFooter = /(?<=\n\n)(?:\n?.+?:.+?)+(?=\n$)/g;

const regexAlphabeticCharacters = /[a-zA-Z]/g;

const regexNumericCharacters = /[0-9]/g;

const regexParentheticalPhrase = / *\([^)]*\) */;

const partsData = JSON.parse(fs.readFileSync('./scarlet-skies-data/parts.json'));
const generateOptions = JSON.parse(fs.readFileSync('./scarlet-skies-data/datalinkGenerateOptions.json'));

function toTitleCase(text) {
    return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
}

function getArticleType(articleTitle, articleBodyText) {
    const articleTypeMatch = articleBodyText.match(regexArticleTypeHeader);

    if (generateOptions.overrides[articleTitle] && generateOptions.overrides[articleTitle]?.ignoreHeader) {
        return {
            articleType: "Page",
            articleTypeHeaderEndIndex: 0
        }
    }

    if (articleTypeMatch === null) {
        return {
            articleType: "Page",
            articleTypeHeaderEndIndex: 0
        }
    } else {
        return {
            articleType: toTitleCase(articleTypeMatch[1]),
            articleTypeHeaderEndIndex: articleTypeMatch[0].length
        };
    }
}

function getArticleFooterData(articleTitle, articleBodyText) {
    const fields = [];

    if (generateOptions.overrides[articleTitle] && generateOptions.overrides[articleTitle]?.ignoreFooter) {
        return {
            articleFooterData: fields,
            articleFooterEndIndex: 0
        }
    }

    const articleFooterMatch = articleBodyText.match(regexArticleFooter);

    if (articleFooterMatch === null) {
        return {
            articleFooterData: fields,
            articleFooterEndIndex: 0
        }
    } else {
        const footerText = articleFooterMatch[0];
        
        footerText.split('\n').forEach(line => {
            const split = line.split(':');
            const fieldName = split[0];
            const fieldDesc = split[1].substring(1);
            if (!generateOptions.ignoredFooterFields.find((e) => e === fieldName)) {
                fields.push({name: fieldName, desc: fieldDesc});
            }
        })

        // Plus two for the preceding \n\n, which isn't a part of the match,
        // and plus one for the ending \n
        return {
            articleFooterData: fields,
            articleFooterEndIndex: footerText.length + 3
        };
    }
}

function stripRichTextTags(text) {
    return text.replace(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, '');
}

function escapeFormattingChars(text) {
    text = text.replace("\\", "\\\\");
    text = text.replace("`", "\\`");
    text = text.replace("*", "\\*");
    text = text.replace("_", "\\_");
    return text;
}

function shouldArticleLineEndBeStripped(line) {
    if (line.indexOf(':') != -1) return false;
    return getTextWidth(line) >= manualLineWrapWidth;
}

function shouldArticleLineBeBold(line) {
    const lineNoParenPhrase = line.replace(regexParentheticalPhrase, '');
    return regexAlphabeticCharacters.test(line) && !regexNumericCharacters.test(line) && lineNoParenPhrase.toUpperCase() === lineNoParenPhrase;
}

function roundNumber(number) {
    return Math.round(number * 10) / 10;
}

function generateArticle(articleTitle, articleBodyText) {
    const { articleType, articleTypeHeaderEndIndex } = getArticleType(articleTitle, articleBodyText);
    const { articleFooterData, articleFooterEndIndex } = getArticleFooterData(articleTitle, articleBodyText);

    const article = {};

    const strippedBodyText = articleBodyText.substring(articleTypeHeaderEndIndex, articleBodyText.length - articleFooterEndIndex);
    let parsedBodyText = "";

    const splitBody = strippedBodyText.split('\n');
    const pageSubtitles = generateOptions.overrides[articleTitle]?.pageSubtitles;
    const pagesArray = [];

    for (let lineNumber = 0; lineNumber < splitBody.length; lineNumber++) {
        let line = stripRichTextTags(splitBody[lineNumber]);
        line = escapeFormattingChars(line);
        
        if (pageSubtitles && pageSubtitles.find((e) => e === line)) {
            pagesArray.push(parsedBodyText);
            parsedBodyText = "";
        }

        if (shouldArticleLineBeBold(line)) {
            line = "**" + line + "**";
        }

        parsedBodyText += line;
        if (!shouldArticleLineEndBeStripped(line) || splitBody[lineNumber + 1] === '') {
            parsedBodyText += '\n';
        } else {
            if (line.charAt(line.length - 1) != ' ') {
                parsedBodyText += ' ';
            }
        }
    }

    pagesArray.push(parsedBodyText);

    article.title = articleTitle;
    article.articleType = articleType;
    article.body = pagesArray;
    article.rawBody = strippedBodyText;
    article.footerData = articleFooterData;

    const partData = partsData[articleTitle];
    if (partData) {
        if (partData.Price) article.price = partData.Price;
        if (partData.Malleability != null) {
            if (partData.Malleability > 0) {
                article.footerData.push({
                    name: "Malleability", desc: partData.Malleability ** 2
                });
            } else {
                
                article.footerData.push({
                    name: "Fixed Size", desc: roundNumber(partData.DefaultSize.X) + ", " + roundNumber(partData.DefaultSize.Y) + ", " + roundNumber(partData.DefaultSize.Z)
                });
            }
            
        }
        if (partData.Recipe) {
            article.footerData.push({
                name: "Recipe", desc: partData.Recipe.join(', ')
            });
        }
    }

    return article;
}

function generateAllArticles(rawFileText) {
    const articles = {};

    for (const match of rawFileText.matchAll(regexDatalinksRaw)) {
        const articleName = match[1];
        const articleBody = match[2];

        const article = generateArticle(articleName, articleBody);
        articles[articleName.toLowerCase()] = article;
    }

    return JSON.stringify(articles, null, 4);
}

const rawFileText = fs.readFileSync('./scarlet-skies-data/datalinksRaw.txt').toString();
fs.writeFileSync('./scarlet-skies-data/datalinks.json', generateAllArticles(rawFileText));