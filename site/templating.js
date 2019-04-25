const cheerio = require('cheerio');
const Entities = require('html-entities').AllHtmlEntities;
const _ = require('lodash');

const entities = new Entities();

const TITLE = /^H[123456]$/;

// TODO: iframe allowfullscreen & frameborder

function processHtml(pathPrefix, html) {
  const withPrefix = asset => `${pathPrefix}/static/${asset}`;

  const $ = cheerio.load(html, {
    decodeEntities: false
  });

  // Processing internal links
  $('a[data-internal=true]').each(function() {
    const $a = $(this);

    $a.removeAttr('data-internal');

    const href = $a.attr('href');

    $a.attr('href', withPrefix(href));
  });

  $('a').each(function() {
    const $a = $(this);

    $a.attr('target', '_blank');
    $a.attr('rel', 'noopener');
  });

  // Finding highest title
  const h2level = $('h1').length ? 4 : 3;

  const titleMap = {
    h1: 3,
    h2: h2level,
    h3: $('h2').length ? (h2level + 1) : ($('h1').length ? 4 : 3)
  };

  // Building custom output
  let output = '';

  $('body').contents().each(function() {

    // Raw text
    if (this.type === 'text') {
      output += `<p>${this.data.trim()}</p>`;
    }

    if (this.type !== 'tag')
      return;

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

      output += `<h${level} data-style-level="${level - 2}">${$this.html()}</h${level}>`;
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

        output += `<img class="${className}" src="${withPrefix(src)}" />`;
      }

      // Iframes
      else {
        const $iframe = $this.find('iframe');
        const internal = !!$iframe.data('internal');

        let src = $iframe.attr('src');

        if (internal)
          src = withPrefix(src);

        output += `<iframe src="${src}"></iframe>`;
      }
    }
  });

  return output;
}

exports.template = function template(pathPrefix, content) {
  let fr, en;

  if (content && content.fr)
    fr = processHtml(pathPrefix, content.fr);

  if (content && content.en)
    en = processHtml(pathPrefix, content.en);

  return {
    fr: fr ? fr : '',
    en: en ? en : ''
  };
};

exports.resolveAttachments = function resolveAttachments(pathPrefix, attachments) {
  return attachments.map(a => {
    if (a.type === 'attachment')
      return {
        ...a,
        url: `${pathPrefix}/static/${a.value}`
      };

    return a;
  });
};

// Testing
if (require.main === module) {
  console.log(processHtml('', '<h1>Test1</h1>'));
  console.log(processHtml('', '<h1>Test1</h1><h2>Test2</h2>'));
  console.log(processHtml('', '<h1>Test1</h1><h2>Test2</h2><h3>Test3</h3>'));
  console.log(processHtml('', '<h2>Test1</h2><h3>Test2</h3>'));
  console.log(processHtml('', '<h1>Test1</h1><h3>Test2</h3>'));
  console.log(processHtml('', '<h2>Test1</h2>'));
  console.log(processHtml('', '<h3>Test1</h3>'));
}
