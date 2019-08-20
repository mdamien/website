/* eslint no-console: 0 */
import deburr from 'lodash/deburr';
import debounce from 'lodash/debounce';

// Wait for helper
function waitFor(check, cb, params) {
  params = params || {};
  if (typeof cb === 'object') {
    params = cb;
    cb = params.done;
  }

  const milliseconds = params.interval || 30;

  let j = 0;

  // First synchronous check
  if (check()) {
    cb();
    return;
  }

  const i = setInterval(function() {
    if (check()) {
      clearInterval(i);
      cb(null);
    }

    if (params.timeout && params.timeout - (j * milliseconds) <= 0) {
      clearInterval(i);
      cb(new Error('timeout'));
    }

    j++;
  }, milliseconds);
}

// Hilitor class used by search
function Hilitor(id, tag) {

  // private variables
  const targetNode = document.getElementById(id) || document.body;
  const hiliteTag = tag || 'MARK';
  const skipTags = new RegExp('^(?:' + hiliteTag + '|SCRIPT|FORM)$');
  // const colors = ['rgb(247, 50, 63)', 'rgb(247, 50, 63)', 'rgb(247, 50, 63)', 'rgb(247, 50, 63)', 'rgb(247, 50, 63)'];
  // const wordColor = [];
  // const colorIdx = 0;
  let matchRegExp = '';
  // const openLeft = true;
  // const openRight = true;
  let matchIndex = 0;

  // characters to strip from start and end of the input string
  let endRegExp = new RegExp('^[^\\w]+|[^\\w]+$', 'g');

  // characters used to break up the input string into words
  let breakRegExp = new RegExp('[\'\|\'-]+', 'g');//new RegExp('[^\\w\'-]+', 'g');

  this.setEndRegExp = function(regex) {
    endRegExp = regex;
    return endRegExp;
  };

  this.setBreakRegExp = function(regex) {
    breakRegExp = regex;
    return breakRegExp;
  };

  this.setMatchType = function(type) {
    switch (type) {
      case 'left':
        this.openLeft = false;
        this.openRight = true;
        break;

      case 'right':
        this.openLeft = true;
        this.openRight = false;
        break;

      case 'open':
        this.openLeft = this.openRight = true;
        break;

      default:
        this.openLeft = this.openRight = false;

    }
  };

  this.setRegex = function(input) {
    input = input.replace(endRegExp, '');
    input = input.replace(breakRegExp, '|');
    // avoid searching for spaces which can be generated by splitting
    input = input.replace(/\| *\|/, '|');
    input = input.replace(/^\||\|$/g, '');
    if (input) {
      let re = '(' + input + ')';
      if (!this.openLeft) re = '\\b' + re;
      if (!this.openRight) re = re + '\\b';
      matchRegExp = new RegExp(re, 'i');
      return matchRegExp;
    }
    return false;
  };

  this.getRegex = function() {
    let retval = matchRegExp.toString();
    retval = retval.replace(/(^\/(\\b)?|\(|\)|(\\b)?\/i$)/g, '');
    retval = retval.replace(/\|/g, ' ');
    return retval;
  };

  this.scrollToElement = function(node) {
    if (node) {
      node.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
    }
  };

  // highlight current match
  this.highlightCurrentMatch = function() {
    // filtering for keeping only visible elements as potential targets
    const targets = Array.prototype.filter.call(
      document.querySelectorAll(hiliteTag),
      function(element) {
        return element.offsetParent !== null;
      }
    );
    Array.prototype.forEach.call(
      targets,
      function(element, index) {
        if (index === matchIndex) {
          element.style.opacity = 1;
        }
 else {
          element.style.opacity = 0.5;
        }
      }
    );
  };

  // recursively apply word highlighting
  this.hiliteWords = function(node) {
    matchIndex = 0;
    if (node === undefined || !node) return;
    if (!matchRegExp) return;
    if (skipTags.test(node.nodeName)) return;

    if (node.hasChildNodes()) {
      for (let i = 0; i < node.childNodes.length; i++)
        this.hiliteWords(node.childNodes[i]);
    }
    if (node.nodeType === 3) { // NODE_TEXT
      const nv = node.nodeValue;
      if (nv) {
        const regs = matchRegExp.exec(deburr(nv));
        if (regs) {
          // if(!wordColor[regs[0].toLowerCase()]) {
          // wordColor[regs[0].toLowerCase()] = colors[colorIdx++ % colors.length];
          // }

          const match = document.createElement(hiliteTag);

          match.appendChild(document.createTextNode(nv.slice(regs.index, regs.index + regs[0].length)));
          match.style.backgroundColor = 'rgb(247, 50, 63)';//wordColor[regs[0].toLowerCase()];
          match.style.color = '#FFF';

          const after = node.splitText(regs.index);
          after.nodeValue = after.nodeValue.substring(regs[0].length);
          node.parentNode.insertBefore(match, after);
          this.highlightCurrentMatch();
          this.scrollToElement(document.querySelector(hiliteTag));
        }
      }
    }
  };

  // remove highlighting
  this.remove = function() {
    const arr = document.getElementsByTagName(hiliteTag);
    let el;
    while (arr.length && (el = arr[0])) {
        const parent = el.parentNode;
        parent.replaceChild(el.firstChild, el);
        parent.normalize();

    }
  };

  // start highlighting at target node
  this.apply = function(input) {
    this.remove();
    if (input === undefined || !input) return;
    if (this.setRegex(deburr(input))) {
      this.hiliteWords(targetNode);
    }
    return matchRegExp;
  };

  // scroll to next item
  this.next = function() {
    // filtering for keeping only visible elements as potential targets
    const targets = Array.prototype.filter.call(
      document.querySelectorAll(hiliteTag),
      function(element) {
        return element.offsetParent !== null;
      }
    );
    matchIndex = matchIndex < targets.length - 1 ? matchIndex + 1 : 0;
    this.highlightCurrentMatch();
    this.scrollToElement(targets[matchIndex]);
  };

}

const CUSTOM_SCRIPTS = [

  // zotero update
  {
    name: 'zotero',
    condition: () => true,
    fn() {
      document.dispatchEvent(new Event('ZoteroItemUpdated', {
          bubbles: true,
          cancelable: true
      }));
    }
  },

  // Custom JS search input
  {
    name: 'search',
    condition: () => !!document.querySelector('#search'),
    fn() {

      const searchInput = document.querySelector('#search');

      searchInput.style.display = 'block';

      const hilitor = new Hilitor('liste');
      hilitor.setMatchType('open');

      const search = debounce(function(evt) {
        const val = evt.target.value;
        if (val.length > 2 || val.length === 0) {
          hilitor.apply(evt.target.value);
        }
      }, 300);

      const onEnter = function(evt) {
        if (evt.keyCode === 13) {
          hilitor.next();
        }
      };

      searchInput.addEventListener('input', search);
      searchInput.addEventListener('keyup', onEnter);
    }
  },

  // Sticky title on people pages
  {
    name: 'people-sticky-title',
    condition: () => !!document.querySelector('#container-biographie') && window.innerWidth < 700,
    fn() {
      document.querySelector('#nav-inside-article [data-type=topbar] a').href = '#main';

      const sticky = () => {
        const navPeople = document.getElementById('toggle-nav_label');
        const stickyTitle = document.getElementById('titre-sticky');
        const navArticle = document.getElementById('nav-inside-article');

        if (window.scrollY > 550) {
          navPeople.style.top = '70px';
          stickyTitle.style.top = '70px';
          navArticle.style.top = '';
        }
        else {
          navPeople.style.top = '0px';
          stickyTitle.style.top = '0px';
          navArticle.style.top = '-250px';
        }
      };

      window.addEventListener('scroll', sticky);

      return () => {
        window.removeEventListener('scroll', sticky);
      };
    }
  },

  // Activities listing UX enhancements
  {
    name: 'activities-listing-ux',
    condition: () => !!document.querySelector('.filtre-activity') && window.innerWidth < 700,
    fn() {
      const filterLabels = document.querySelectorAll('.filtre-activity');

      const goTop = () => (location.hash = '#liste');

      Array.from(filterLabels).forEach(label => {
        label.addEventListener('click', goTop);
      });
    }
  },

  // Productions listing UX enhancements
  {
    name: 'productions-listing-ux',
    condition: () => !!document.querySelector('.filtre-production') && window.innerWidth < 700,
    fn() {
      const filterLabels = document.querySelectorAll('.filter-group label');

      const goTop = () => (location.hash = '#liste');

      Array.from(filterLabels).forEach(label => {
        label.addEventListener('click', goTop);
      });

      const years = document.querySelectorAll('#list-years li a');

      const closeFilters = () => {
        document.getElementById('radio-phone-close').checked = true;
      };

      Array.from(years).forEach(year => {
        year.addEventListener('click', closeFilters);
      });
    }
  },

  // News listing UX enhancements
  {
    name: 'news-listing-ux',
    condition: () => !!document.querySelector('.filtre-actu') && window.innerWidth < 700,
    fn() {
      const filterLabels = document.querySelectorAll('.filtre-actu');

      const goTop = () => (location.hash = '#liste');

      Array.from(filterLabels).forEach(label => {
        label.addEventListener('click', goTop);
      });

      const years = document.querySelectorAll('#list-years li a');

      const closeFilters = () => {
        document.getElementById('radio-phone-close').checked = true;
      };

      Array.from(years).forEach(year => {
        year.addEventListener('click', closeFilters);
      });
    }
  }
];

const listeners = [];

function injectCustomScript(spec) {
  waitFor(
    () => !!document.querySelector(spec.waitFor || 'main'),
    () => {
      if (!spec.condition())
        return;

      console.log(`Injecting "${spec.name}"`);

      const unsubscribe = spec.fn();

      if (unsubscribe)
        listeners.push(unsubscribe);
    }
  );
}

function inject() {

  // Cleanup
  while (listeners.length) {
    const unsubscribe = listeners.pop();
    unsubscribe();
  }

  CUSTOM_SCRIPTS.forEach(spec => injectCustomScript(spec));
}

export function onRouteUpdate() {
  inject();
}
