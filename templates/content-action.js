var tabId = null;
var tabkey = null;
chrome.runtime.sendMessage(
	{
		action: "getTabId",
	},
	function (response) {
		tabId = response.tabId;
		tabkey = get_tabkey(tabId);

		var MutationObserver =
			window.MutationObserver || window.WebKitMutationObserver;
		var MutationObserverConfig = {
			childList: true,
			subtree: true,
			characterData: true,
		};
		var observer = new MutationObserver(function (mutations) {
			chrome.storage.local.get(["settings", tabkey], function (result) {
				var settings = result.settings;
				var tabinfo = result[tabkey];
				hl_refresh(tabinfo.keywords, settings, tabinfo);
			});
		});
		observer.observe(document.body, MutationObserverConfig);

		chrome.runtime.onMessage.addListener(function (
			request,
			sender,
			sendResponse
		) {
			if (request.action == "hl_clearall") {
				chrome.storage.local.get(["settings", tabkey], function (result) {
					var settings = result.settings;
					var tabinfo = result[tabkey];
					hl_clearall(settings, tabinfo);
				});
				sendResponse({ action: "null"});
			} else if (request.action == "hl_refresh") {
				chrome.storage.local.get(["settings", tabkey], function (result) {
					var settings = result.settings;
					var tabinfo = result[tabkey];
					hl_refresh(request.inputKws, settings, tabinfo);
				});
				sendResponse({ action: "null"});
			} else if (request.action == "_hl_search") {
				chrome.storage.local.get(["settings", tabkey], function (result) {
					var settings = result.settings;
					var tabinfo = result[tabkey];
					_hl_search(request.addedKws, settings, tabinfo);
				});
				sendResponse({ action: "null"});
			} else if (request.action == "_hl_clear") {
				chrome.storage.local.get(["settings", tabkey], function (result) {
					var settings = result.settings;
					var tabinfo = result[tabkey];
					_hl_clear(request.removedKws, settings, tabinfo);
				});
				sendResponse({ action: "null"});
			}
		});

		function hl_refresh(Kws, settings, tabinfo) {
			hl_clearall(settings, tabinfo);
			_hl_search(Kws, settings, tabinfo);
		}

		function _hl_search(addedKws, settings, tabinfo) {

			isWholeWord = TrueOrFalse(settings.isWholeWord);
			isCasesensitive = TrueOrFalse(settings.isCasesensitive);
			clsPrefix = settings.CSSprefix1 + " " + settings.CSSprefix2;

			addedKws.sort((firstElem, secondElem) => {
				return secondElem.kwStr.length - firstElem.kwStr.length;
			});
			var code = addedKws
				.map((kw) => {
					var cls =
						clsPrefix +
						kw.kwGrp +
						" " +
						settings.CSSprefix3 +
						encodeURI(kw.kwStr);
					return (
						"$(document.body).highlight(" +
						`'${KeywordEscape(kw.kwStr)}', ` +
						`{className: '${cls}', wordsOnly: ${isWholeWord}, caseSensitive: ${isCasesensitive}  ` +
						"});"
					);
				})
				.join("\n");
			observer.disconnect();
			eval(code);
			observer.observe(document.body, MutationObserverConfig);
		}

		function _hl_clear(removedKws, settings, tabinfo) {
			code = removedKws
				.flatMap((kw) => {
					className = (settings.CSSprefix3 + encodeURI(kw.kwStr)).replace(
						/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g,
						"\\\\$&"
					);
					return (
						"$(document.body).unhighlight({className:'" + className + "'})"
					);
				})
				.join(";\n");
	
			observer.disconnect();
			eval(code);
			observer.observe(document.body, MutationObserverConfig);

		}

		function hl_clearall(settings, tabinfo) {
			var code =
				"$(document.body).unhighlight({className:'" +
				settings.CSSprefix1 +
				"'})";
			observer.disconnect();
			eval(code);
			observer.observe(document.body, MutationObserverConfig);

		}
	}
);


