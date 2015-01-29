var library;
if (!library)
    library = {};

library.json = {
    replacer: function(match, pIndent, pKey, pVal, pEnd) {
        var key = '<span class=json-key>';
        var val = '<span class=json-value>';
        var str = '<span class=json-string>';
        var r = pIndent || '';
        if (pKey)
            r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
        if (pVal)
            r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
        return r + (pEnd || '');
    },
    prettyPrint: function(obj) {
        var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
        return JSON.stringify(obj, null, 4)
            .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(jsonLine, library.json.replacer);
    }
};

(function () {
    var originalQuerySelectorAll = document.querySelectorAll;
    Element.prototype.siblings = function () {
        var that = this, siblings = [];
        Array.prototype.filter.call(this.parentNode.children, function (child) {
            if (child !== that) {
                siblings.push(child);
            }
        });
        return siblings;
    };

    document.querySelectorAll = function () {
        return Array.prototype.slice.call(originalQuerySelectorAll.apply(document, arguments));
    };
})();

var app = app || (function (){
    var container = document.querySelector('#container'),
        isPretty = false,
        inputs = {
            text: document.querySelector('#url-input'),
            button: document.querySelector('#url-pull'),
            prettyPrint: document.querySelector('#pretty-print-checkbox')
        },
        displayType = {
            NONE: 'none',
            TABLE: {
                ROW: 'table-row',
                GROUP: 'table-row-group'
            }
        },
        debug = {
            isPretty: isPretty,
            inputs: inputs,
            dom: null
        };

    inputs.text.value = './sampleData/data.json';

    inputs.button.addEventListener('click', function (evt) {
        var t = inputs.text.value;
        if (t !== '') {
            fetchData(t);
        } else {
            alert('Provide URL address to the JSON');
        }
    });

    inputs.prettyPrint.addEventListener('click', function (evt) {
        isPretty = evt.target.checked;
        inputs.button.click();
    });

    function fetchData(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            var cont = document.body.querySelector('#container');

            while (cont.firstChild) {
                cont.removeChild(cont.firstChild);
            }

            if (isPretty) {
                prettyPrintJSON(this.response, cont);
            } else {
                prettyStringify(this.response, cont);
            }
        };
        xhr.send();
    }

    function prettyPrintJSON(data, container) {
        var r;
        data = JSON.parse(data);

        r = prettyPrint(data, {
            expanded: true,
            maxDepth: -1
        });
        debug.dom = r;
        container.appendChild(r);
        attachClick(container);
    }

    function prettyStringify(data, container) {
        var p = document.createElement('pre'),
            c = document.createElement('code');

        c.innerHTML = library.json.prettyPrint(JSON.parse(data));
        debug.dom = c.innerHTML;
        p.appendChild(c);
        container.appendChild(p);
    }

    function attachClick(cont) {
        var heads = document.querySelectorAll('table thead');

        heads.forEach(function (head) {
            var firstRow = head.querySelector('tr');
            firstRow.addEventListener('click', function (evt) {
                var headerSiblingEl = evt.target.parentElement.siblings()[0],
                    bodyEl = evt.target.parentElement.parentElement.siblings()[0],
                    displayStyle = {
                        header: headerSiblingEl.style.display,
                        body: bodyEl.style.display
                    };

                if (displayStyle.header === '' && displayStyle.body === '') {
                    headerSiblingEl.style.display = displayType.TABLE.ROW;
                    bodyEl.style.display = displayType.TABLE.GROUP;

                    displayStyle = {
                        header: headerSiblingEl.style.display,
                        body: bodyEl.style.display
                    };
                }

                if (displayStyle.header === displayType.TABLE.ROW &&
                    displayStyle.body === displayType.TABLE.GROUP) {
                    // HIDE
                    headerSiblingEl.style.display = displayType.NONE;
                    bodyEl.style.display = displayType.NONE;
                } else {
                    // SHOW
                    headerSiblingEl.style.display = displayType.TABLE.ROW;
                    bodyEl.style.display = displayType.TABLE.GROUP;
                }
            });
        });
    }

    return debug;
})();