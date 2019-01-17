const cheerio = require('cheerio');
const Entities = require('html-entities').AllHtmlEntities;
const {union} = require('mnemonist/set');
const _ = require('lodash');

const entities = new Entities();

const TITLE = /^H[123456]$/;

// TODO: iframe allowfullscreen & frameborder

function processHtml(html) {
  const $ = cheerio.load(html, {
    decodeEntities: false
  });

  const assets = new Set();

  // Processing internal links
  $('a[data-internal=true]').each(function() {
    const $a = $(this);

    $a.removeAttr('data-internal');

    assets.add($a.attr('href'));
  });

  // Finding highest title
  let titleOffset = 0;

  if (!$('h1').length)
    titleOffset = 1;

  if (!$('h2').length)
    titleOffset = 2;

  const titleMap = {
    h1: 3 - titleOffset,
    h2: 4 - titleOffset,
    h3: 5 - titleOffset
  };

  // Building custom output
  let output = '';

  $('body > *').each(function() {
    const $this = $(this);
    const tag = $this.prop('tagName');

    // Paragraphs
    if (tag === 'P') {
      output += `<p>${$this.html()}</p>`;
    }

    // Titles
    else if (TITLE.test(tag)) {
      const h = tag.toLowerCase();

      const level = titleMap[h];

      output += `<h${level}>${$this.html()}</h${level}>`;
    }

    // Lists
    else if (tag === 'UL') {
      output += `<ul>${$this.html()}</ul>`;
    }
    else if (tag === 'OL') {
      output += `<ol>${$this.html()}</ol>`;
    }

    // Raw blocks
    else if (tag === 'PRE') {
      output += entities.decode($this.text().replace(/^\s+/g, ''));
    }

    // Atomics
    else if (tag === 'FIGURE') {

      // Images
      if ($this.has('img').length) {
        const $img = $this.find('img');

        const src = $img.attr('src'),
              width = $img.data('width'),
              height = $img.data('height');

        // TODO: What about squares?
        // TODO: keep with and height to help with browser rendering
        const className = width > height ? 'landscape' : 'portrait';

        assets.add(src);

        output += `<img class="${className}" src="${src}" />`;
      }

      // Iframes
      else {
        const $iframe = $this.find('iframe');
        const internal = !!$iframe.data('internal');

        const src = $iframe.attr('src');

        if (internal)
          assets.add(src);

        output += `<iframe src="${src}"></iframe>`;
      }
    }
  });

  return {html: output, assets};
}

exports.template = function template(content) {
  let fr, en;

  if (content && content.fr)
    fr = processHtml(content.fr);

  if (content && content.en)
    en = processHtml(content.en);

  return {
    html: {
      fr: fr ? fr.html : '',
      en: en ? en.html : ''
    },
    assets: Array.from(union(fr ? fr.assets : new Set(), en ? en.assets : new Set()))
  };
};
