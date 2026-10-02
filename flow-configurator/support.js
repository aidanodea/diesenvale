/* ---------------------------------------------------------------------------
   support.js — a minimal stand-in for the Claude Design runtime.

   Main.dc.html was authored as a Claude Design artboard and expects the Design
   runtime, which is not redistributable. This file implements only the parts
   that file actually uses, so the configurator runs as an ordinary web page:

     <x-dc>                     the component root
     <helmet>                   head content, hoisted on boot
     {{dotted.path}}            interpolation in text and attribute values
     <sc-for list="{{xs}}" as="x">  repetition, nestable
     onClick / onInput / onPointerDown|Move|Up|Leave="{{handler}}"
     class Component extends DCLogic { renderVals() }  with this.state / setState

   Rendering is a full re-render into a detached tree followed by a morph into
   the live DOM, so node identity survives. That matters here: the rotate and
   draw interactions hold a pointer capture across re-renders, and a naive
   innerHTML swap would drop the drag.
--------------------------------------------------------------------------- */

(function () {
  'use strict';

  var EXPR = /\{\{([^}]+)\}\}/g;
  var WHOLE = /^\s*\{\{([^}]+)\}\}\s*$/;

  var EVENTS = {
    onclick: 'onclick',
    oninput: 'oninput',
    onchange: 'onchange',
    onpointerdown: 'onpointerdown',
    onpointermove: 'onpointermove',
    onpointerup: 'onpointerup',
    onpointerleave: 'onpointerleave',
    onpointercancel: 'onpointercancel'
  };

  function DCLogic() { this.state = {}; }
  DCLogic.prototype.renderVals = function () { return {}; };
  DCLogic.prototype.setState = function (patch) {
    this.state = Object.assign({}, this.state, patch);
    if (this.__paint) { this.__paint(); }
  };
  window.DCLogic = DCLogic;

  function lookup(scope, path) {
    var parts = String(path).trim().split('.');
    var value = scope;
    for (var i = 0; i < parts.length; i += 1) {
      if (value == null) { return undefined; }
      value = value[parts[i]];
    }
    return value;
  }

  function interpolate(text, scope) {
    return text.replace(EXPR, function (_, path) {
      var v = lookup(scope, path);
      return v == null ? '' : String(v);
    });
  }

  /* -- template -> detached DOM ------------------------------------------- */

  function renderNodes(sourceNodes, scope, target) {
    for (var i = 0; i < sourceNodes.length; i += 1) {
      renderNode(sourceNodes[i], scope, target);
    }
  }

  function renderNode(node, scope, target) {
    if (node.nodeType === 3) {
      var text = node.data;
      target.appendChild(document.createTextNode(
        text.indexOf('{{') === -1 ? text : interpolate(text, scope)
      ));
      return;
    }
    if (node.nodeType !== 1) { return; }

    var tag = node.tagName.toLowerCase();

    if (tag === 'sc-for') {
      var list = lookup(scope, (node.getAttribute('list') || '').replace(/[{}]/g, ''));
      var name = node.getAttribute('as') || 'item';
      if (!list || !list.length) { return; }
      for (var j = 0; j < list.length; j += 1) {
        var inner = Object.create(scope);
        inner[name] = list[j];
        inner[name + 'Index'] = j;
        renderNodes(node.childNodes, inner, target);
      }
      return;
    }

    if (tag === 'helmet') { return; }

    var el = document.createElement(node.tagName);
    var attrs = node.attributes;
    for (var k = 0; k < attrs.length; k += 1) {
      var an = attrs[k].name;
      var av = attrs[k].value;
      var whole = WHOLE.exec(av);
      var lower = an.toLowerCase();

      if (EVENTS[lower] && whole) {
        var fn = lookup(scope, whole[1]);
        el[EVENTS[lower]] = typeof fn === 'function' ? fn : null;
        continue;
      }
      if (lower === 'value' && whole) {
        var val = lookup(scope, whole[1]);
        el.setAttribute('value', val == null ? '' : String(val));
        el.__dcValue = val == null ? '' : String(val);
        continue;
      }
      el.setAttribute(an, av.indexOf('{{') === -1 ? av : interpolate(av, scope));
    }

    renderNodes(node.childNodes, scope, el);
    target.appendChild(el);
  }

  /* -- morph detached tree into the live one ------------------------------ */

  /* Staged nodes are moved into the live tree rather than cloned: cloneNode
     does not carry DOM property handlers, and these elements hold theirs as
     properties so a re-render replaces rather than stacks them. */
  function morphChildren(live, next) {
    var staged = Array.prototype.slice.call(next.childNodes);
    for (var i = 0; i < staged.length; i += 1) {
      var liveChild = live.childNodes[i];
      if (!liveChild) {
        live.appendChild(staged[i]);
        continue;
      }
      morphNode(liveChild, staged[i], live);
    }
    while (live.childNodes.length > staged.length) {
      live.removeChild(live.lastChild);
    }
  }

  function morphNode(liveNode, nextNode, parent) {
    if (liveNode.nodeType !== nextNode.nodeType ||
        (liveNode.nodeType === 1 && liveNode.tagName !== nextNode.tagName)) {
      parent.replaceChild(nextNode, liveNode);
      return;
    }

    if (liveNode.nodeType === 3) {
      if (liveNode.data !== nextNode.data) { liveNode.data = nextNode.data; }
      return;
    }
    if (liveNode.nodeType !== 1) { return; }

    var nextAttrs = nextNode.attributes;
    var n;
    for (n = 0; n < nextAttrs.length; n += 1) {
      var name = nextAttrs[n].name;
      var value = nextAttrs[n].value;
      if (name === 'value') {
        /* Do not fight the caret while somebody is typing. */
        if (document.activeElement !== liveNode && liveNode.value !== value) {
          liveNode.value = value;
        }
        continue;
      }
      if (liveNode.getAttribute(name) !== value) { liveNode.setAttribute(name, value); }
    }
    var liveAttrs = liveNode.attributes;
    for (n = liveAttrs.length - 1; n >= 0; n -= 1) {
      if (!nextNode.hasAttribute(liveAttrs[n].name)) {
        liveNode.removeAttribute(liveAttrs[n].name);
      }
    }

    /* Event handlers are properties, so they are replaced rather than stacked. */
    for (var key in EVENTS) {
      if (Object.prototype.hasOwnProperty.call(EVENTS, key)) {
        var prop = EVENTS[key];
        if (liveNode[prop] !== nextNode[prop]) { liveNode[prop] = nextNode[prop] || null; }
      }
    }

    morphChildren(liveNode, nextNode);
  }

  /* -- boot --------------------------------------------------------------- */

  function boot() {
    var host = document.querySelector('x-dc');
    if (!host) { return; }

    var helmet = host.querySelector('helmet');
    if (helmet) {
      while (helmet.firstChild) { document.head.appendChild(helmet.firstChild); }
      helmet.parentNode.removeChild(helmet);
    }

    var scriptEl = document.querySelector('script[data-dc-script]');
    if (!scriptEl) { return; }

    var Component;
    try {
      Component = new Function(scriptEl.textContent + '\nreturn Component;')();
    } catch (err) {
      host.innerHTML = '<pre style="padding:24px;font:14px ui-monospace,monospace">' +
        'The configurator script did not evaluate:\n\n' + String(err) + '</pre>';
      return;
    }

    var template = document.createElement('template');
    while (host.firstChild) { template.content.appendChild(host.firstChild); }

    var root = document.createElement('div');
    host.appendChild(root);

    var instance = new Component();
    if (!instance.state) { instance.state = {}; }

    instance.__paint = function () {
      var vals;
      try {
        vals = instance.renderVals() || {};
      } catch (err) {
        console.error('renderVals threw', err);
        return;
      }
      var staged = document.createElement('div');
      renderNodes(template.content.childNodes, vals, staged);
      morphChildren(root, staged);
    };

    instance.__paint();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
