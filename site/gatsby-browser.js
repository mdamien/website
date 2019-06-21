import deburr from 'lodash/deburr';
import debounce from 'lodash/debounce';

function Hilitor(id, tag) {

  // private variables
  var targetNode = document.getElementById(id) || document.body;
  var hiliteTag = tag || "MARK";
  var skipTags = new RegExp("^(?:" + hiliteTag + "|SCRIPT|FORM|SPAN)$");
  var colors = ["rgb(247, 50, 63)", "rgb(247, 50, 63)", "rgb(247, 50, 63)", "rgb(247, 50, 63)", "rgb(247, 50, 63)"];
  var wordColor = [];
  var colorIdx = 0;
  var matchRegExp = "";
  var openLeft = true;
  var openRight = true;

  // characters to strip from start and end of the input string
  var endRegExp = new RegExp('^[^\\w]+|[^\\w]+$', "g");

  // characters used to break up the input string into words
  var breakRegExp = new RegExp('["\|\'-]+', "g");//new RegExp('[^\\w\'-]+', "g");

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
      case "left":
        this.openLeft = false;
        this.openRight = true;
        break;

      case "right":
        this.openLeft = true;
        this.openRight = false;
        break;

      case "open":
        this.openLeft = this.openRight = true;
        break;

      default:
        this.openLeft = this.openRight = false;

    }
  };

  this.setRegex = function(input)
  {
    input = input.replace(endRegExp, "");
    input = input.replace(breakRegExp, "|");
    input = input.replace(/^\||\|$/g, "");
    if(input) {
      var re = "(" + input + ")";
      if(!this.openLeft) re = "\\b" + re;
      if(!this.openRight) re = re + "\\b";
      matchRegExp = new RegExp(re, "i");
      return matchRegExp;
    }
    return false;
  };

  this.getRegex = function()
  {
    var retval = matchRegExp.toString();
    retval = retval.replace(/(^\/(\\b)?|\(|\)|(\\b)?\/i$)/g, "");
    retval = retval.replace(/\|/g, " ");
    return retval;
  };

  // recursively apply word highlighting
  this.hiliteWords = function(node)
  {
    if(node === undefined || !node) return;
    if(!matchRegExp) return;
    if(skipTags.test(node.nodeName)) return;

    if(node.hasChildNodes()) {
      for(var i=0; i < node.childNodes.length; i++)
        this.hiliteWords(node.childNodes[i]);
    }
    if(node.nodeType == 3) { // NODE_TEXT
      var nv = node.nodeValue;
      if(nv) {
        var regs = matchRegExp.exec(deburr(nv));
        if (regs) {
          // if(!wordColor[regs[0].toLowerCase()]) {
          // wordColor[regs[0].toLowerCase()] = colors[colorIdx++ % colors.length];
          // }
          
          var match = document.createElement(hiliteTag);

          match.appendChild(document.createTextNode(nv.slice(regs.index, regs.index + regs[0].length)));
          match.style.backgroundColor = "rgb(247, 50, 63)";//wordColor[regs[0].toLowerCase()];
          match.style.color = "#FFF";

          var after = node.splitText(regs.index);
          after.nodeValue = after.nodeValue.substring(regs[0].length);
          node.parentNode.insertBefore(match, after);
          document.querySelector(hiliteTag).scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        }
      }
    };
  };

  // remove highlighting
  this.remove = function()
  {
    var arr = document.getElementsByTagName(hiliteTag);
    var el;
    while(arr.length && (el = arr[0])) {
        var parent = el.parentNode;
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

export function onRouteUpdate() {
  /**
   * SEARCH FILTER FUNCTION
   */
  var searchInput = document.querySelector('#search');
  if (searchInput) {
    searchInput.style.display = 'block';
    /**
     * LOGIQUE DE SEARCH
     */
    var hilitor = new Hilitor('liste');
    hilitor.setMatchType('open');
    var search = debounce(function(evt){
      hilitor.apply(evt.target.value);
    }, 300)
    searchInput.addEventListener('input', search);
  }
};

