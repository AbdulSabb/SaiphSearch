defaultSettings = {
	delim: ",",
	isAlwaysSearch: false,
	isOn: true,
	isCasesensitive: true,
	isInstant: true,
	isNewlineNewColor: false,
	isSaveKws: false,
	isWholeWord: false,
	latest_keywords: [],
	popup_height: 50,
	popup_width: 400
};

document.addEventListener('DOMContentLoaded', function () {
	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		var currTab = tabs[0];
		if (currTab) { 
			var tabkey = get_tabkey(currTab.id);
			chrome.storage.local.get(['settings', tabkey], function (result) {
				var settings = Object.assign(defaultSettings, result.settings);
				var tabinfo = result[tabkey];
				kws = tabinfo.keywords;

				highlightWords.value = keywordsToStr(kws, settings)

				chrome.storage.local.set({[tabkey]: tabinfo, "settings": settings}, function () {
					handle_highlightWords_change(tabkey, {fromBackground: true});
				});

				container.style.width = settings.popup_width + "px";
				highlightWords.style.minHeight = settings.popup_height + "px";
				build_keywords_list(kws);
				$("#highlightWords").on("input", function () {
					handle_highlightWords_change(tabkey, {fromBackground: true});
				})
				$("#kw-list").on("click", function (event) {
					handle_keyword_removal(event, tabkey, {fromBackground: true});
				})
				$("#toggleMHL,#casesensitive, #wholeWord, #delimiter, #instant,"
					+ " #saveWords,#alwaysSearch,#newlineNewColor").on("input", function(event) {
					handle_option_change(tabkey, event);
				});
			});
		}
	});
	check_keywords_existence();
});



function build_keywords_list(inputKws){
	var html = inputKws.map(kw=>`<span class="keywords">${kw.kwStr}</span>`).join("");
	$('#kw-list>.keywords').remove();
	$(html).appendTo($('#kw-list'));
	check_keywords_existence();
}

function check_keywords_existence(){
	chrome.tabs.executeScript(null, {
		file: "get-pages-source.js"
	}, function() {
		if (chrome.runtime.lastError) {
			console.error( 'There was an error injecting script : \n' + chrome.runtime.lastError.message);
		}
	});
}

chrome.runtime.onMessage.addListener(function(request, sender) {
	if (request.action == "getVisibleText") {
		visibleText = request.source;
		chrome.storage.local.get(['settings'], function (result) {
			var settings = result.settings;
			document.querySelectorAll('#kw-list>.keywords').forEach(elem=>{
				var pattern = settings.isWholeWord
					? '\\b(' + elem.innerText + ')\\b'
					: '(' + elem.innerText + ')';
				visibleText.match(new RegExp(pattern, settings.isCasesensitive ? '': 'i'))
					?  elem.classList.remove("notAvailable")
					: elem.classList.add("notAvailable");
			});
		});
	}
});


function handle_keyword_removal(event, tabkey, option={}){
	console.log(event);
	if(event.ctrlKey && event.target.matches('.keywords')){
		chrome.storage.local.get(['settings'], function (result) {
			var settings = result.settings;
			event.target.remove();
			highlightWords.value = [...document.querySelectorAll('#kw-list>.keywords')].map(elem=>elem.innerText).join(settings.delim);
			handle_highlightWords_change(tabkey, option);
		});
	}
}


function handle_highlightWords_change(tabkey, option={}, callback=null) {
    chrome.storage.local.get(['settings', tabkey], function (result) {
        var settings = result.settings;
        var tabinfo = result[tabkey];
		var tabId = get_tabId(tabkey);

		if(!settings.isOn){
			chrome.tabs.sendMessage(tabId, {
				action: "hl_clearall",
			})
			return;
		}

		if (!option.useSavedKws){
			inputStr = highlightWords.value;
		} else {
			inputStr = keywordsToStr(tabinfo.keywords, settings)
		}

        if (settings.isInstant || inputStr.slice(-1) == settings.delim) {
			console.log(inputStr)
			inputKws = keywordsFromStr(inputStr, settings);
			savedKws = tabinfo.keywords;

			addedKws = KeywordsMinus(inputKws, savedKws);
			removedKws = KeywordsMinus(savedKws, inputKws);

			if(option.refresh){
				chrome.tabs.sendMessage(tabId, {
					action: "hl_refresh",
					inputKws: [...inputKws], 
				})
			}else{
				chrome.tabs.sendMessage(tabId, {
					action: "_hl_clear",
					removedKws: removedKws,
				}, function(response){
					chrome.tabs.sendMessage(tabId, {
						action: "_hl_search",
						addedKws: addedKws,
					});
				});
			}
          
            tabinfo.keywords = inputKws;
			if (option.fromBackground){
				build_keywords_list(inputKws);
			}
            settings.latest_keywords = inputKws;
            chrome.storage.local.set({[tabkey]: tabinfo, "settings": settings});
        } else if (!inputStr) {
            chrome.tabs.sendMessage(tabId, {
				action: "hl_clearall",
			})
            tabinfo.keywords = [];
            settings.latest_keywords = "";
            chrome.storage.local.set({[tabkey]: tabinfo, "settings": settings});
        }

		callback && callback();
    });
}


function handle_option_change(tabkey, event) { 
	chrome.storage.local.get(['settings'], function (result) {
		var settings = result.settings;

		

		settings.isOn              = true;
		settings.delim             = ",";
		settings.isInstant         = true;
		settings.isAlwaysSearch    = true;
		settings.isNewlineNewColor = true;
		settings.isCasesensitive   = casesensitive.checked;
		settings.isWholeWord       = wholeWord.checked;
		settings.isSaveKws         = true;

        if (settings.isSaveKws){
            $('#alwaysSearch').removeAttr('disabled'); 
        }else{
            $('#alwaysSearch').prop("checked", false);
            settings.isAlwaysSearch = false; 
            $('#alwaysSearch').attr('disabled', true); 
        }

		
	});
}


var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    } 
  });
}