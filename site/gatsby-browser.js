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
  const colors = ['rgb(247, 50, 63)', 'rgb(247, 50, 63)', 'rgb(247, 50, 63)', 'rgb(247, 50, 63)', 'rgb(247, 50, 63)'];
  const wordColor = [];
  const colorIdx = 0;
  let matchRegExp = '';
  const openLeft = true;
  const openRight = true;

  // characters to strip from start and end of the input string
  const endRegExp = new RegExp('^[^\\w]+|[^\\w]+$', 'g');

  // characters used to break up the input string into words
  const breakRegExp = new RegExp('[\'\|\'-]+', 'g');//new RegExp('[^\\w\'-]+', 'g');

  this.setEndRegExp = function(regex) {
    endRegExp = regex;
    return endRegExp;
  };

  this.setBreakRegExp = function(regex) {
    breakRegExp = regex;
    return breakRegExp;
  };

  this.setMatchType = function(type)
  {
    switch(type)
    {
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

  this.setRegex = function(input)
  {
    input = input.replace(endRegExp, '');
    input = input.replace(breakRegExp, '|');
    // avoid searching for spaces which can be generated by splitting
    input = input.replace(/\| *\|/,'|');
    input = input.replace(/^\||\|$/g, '');
    if(input) {
      const re = '(' + input + ')';
      if(!this.openLeft) re = '\\b' + re;
      if(!this.openRight) re = re + '\\b';
      matchRegExp = new RegExp(re, 'i');
      return matchRegExp;
    }
    return false;
  };

  this.getRegex = function()
  {
    const retval = matchRegExp.toString();
    retval = retval.replace(/(^\/(\\b)?|\(|\)|(\\b)?\/i$)/g, '');
    retval = retval.replace(/\|/g, ' ');
    return retval;
  };

  // recursively apply word highlighting
  this.hiliteWords = function(node)
  {
    if(node === undefined || !node) return;
    if(!matchRegExp) return;
    if(skipTags.test(node.nodeName)) return;

    if(node.hasChildNodes()) {
      for(let i=0; i < node.childNodes.length; i++)
        this.hiliteWords(node.childNodes[i]);
    }
    if(node.nodeType == 3) { // NODE_TEXT
      const nv = node.nodeValue;
      if(nv) {
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
          document.querySelector(hiliteTag).scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
        }
      }
    };
  };

  // remove highlighting
  this.remove = function()
  {
    const arr = document.getElementsByTagName(hiliteTag);
    let el;
    while(arr.length && (el = arr[0])) {
        const parent = el.parentNode;
        parent.replaceChild(el.firstChild, el);
        parent.normalize();

    }
  };

  // start highlighting at target node
  this.apply = function(input)
  {
    this.remove();
    if(input === undefined || !input) return;
    if(this.setRegex(deburr(input))) {
      this.hiliteWords(targetNode);
    }
    return matchRegExp;
  };

}

const CUSTOM_SCRIPS = [

  // Custom JS search input
  {
    waitFor: '.type_title',
    sel: '#search',
    fn(el) {

      const searchInput = el;

      console.debug('search enabled');

      searchInput.style.display = 'block';

      const hilitor = new Hilitor('liste');
      hilitor.setMatchType('open');

      const search = debounce(function(evt) {
        hilitor.apply(evt.target.value);
      }, 300);

      searchInput.addEventListener('input', search);
    }
  }
];

function injectCustomScript(spec) {
  waitFor(
    () => !!document.querySelector(spec.waitFor),
    () => {
      const el = document.querySelector(spec.sel);

      if (!el)
        return;

      spec.fn(el);
    }
  );
}

function inject() {
  CUSTOM_SCRIPS.forEach(spec => injectCustomScript(spec));
}

export function onRouteUpdate() {
  inject();
}
