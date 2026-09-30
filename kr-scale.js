(function () {
  var KR_RE = /[가-힣ᄀ-ᇿ㄰-㆏]+/g;

  function scaleKorean(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !KR_RE.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        KR_RE.lastIndex = 0;
        var p = node.parentNode;
        if (!p || p.tagName === 'SCRIPT' || p.tagName === 'STYLE' || (p.classList && p.classList.contains('kr'))) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var nodes = [];
    var n;
    while ((n = walker.nextNode())) nodes.push(n);

    nodes.forEach(function (textNode) {
      var text = textNode.nodeValue;
      var frag = document.createDocumentFragment();
      var last = 0, m;
      KR_RE.lastIndex = 0;
      while ((m = KR_RE.exec(text))) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var span = document.createElement('span');
        span.className = 'kr';
        span.textContent = m[0];
        frag.appendChild(span);
        last = KR_RE.lastIndex;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      textNode.parentNode.replaceChild(frag, textNode);
    });
  }

  function run() {
    scaleKorean(document.body);
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mut) {
        mut.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) scaleKorean(node);
          else if (node.nodeType === 3 && node.parentNode) scaleKorean(node.parentNode);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
