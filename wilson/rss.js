function buildRssRecord() {

}

exports.createRssFeeds = function createRssFeeds(db) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">',
    '  <channel>'
  ];

  lines.append('  </channel>');
  lines.append('</rss>');

  return lines.join('\n');
};
