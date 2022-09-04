function get_tabkey(tabId) {
    return "saiph_" + tabId;
}
function get_tabId(tabkey){
	return parseInt(tabkey.substring(6))
}
function makeSafeForCSS(name) {
    return name.replace(/[^a-z0-9]/g, function(s) {
        var c = s.charCodeAt(0);
        if (c == 32) return '-';
        if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
        return '__' + ('000' + c.toString(16)).slice(-4);
    });
}

function SetMinus(A, B){
	return A.filter(x => !B.includes(x) );
}

const TrueOrFalse = (opt) => opt? "true" : "false";

function KeywordEscape(kw){
	return kw.replace(/\n/sgi, '\\n');
}


function keywordsFromStr(inputStr, settings){
	if(settings.isNewlineNewColor){
		return inputStr.split(/\n/g).filter(i=>i).reduce((arr, line, lineCnt)=>{
			arr = arr.concat(line.split(settings.delim).filter(i=>i).map(kws=>{
				return {kwGrp: (lineCnt % 20), kwStr: kws};
			}));
			console.log(arr);
			return arr;
		}, []);
	}else{
		return inputStr.split(settings.delim).filter(i=>i).map((kws,cnt)=>{
			return {kwGrp: (cnt % 20), kwStr: kws};
		});
	}
}
function keywordsToStr(kws, settings){
	var str = "";
	if(settings.isNewlineNewColor){
		for(var i = 0, len = kws.length - 1; i < len; ++ i){
			str += kws[i].kwStr + ((kws[i].kwGrp != kws[i+1].kwGrp) ? "\n": settings.delim);
		}
		kws.length && (str += kws[kws.length-1].kwStr);
	}else{
		str = kws.map(kw=>kw.kwStr).join(settings.delim);
		str += str ? settings.delim : "";
	}
	return str
}
function KeywordsMinus(kwListA, kwListB){
	function KwListContain(kwList, kwA){
		for(const kw of kwList)	{
			if(kw.kwStr === kwA.kwStr && kw.kwGrp === kwA.kwGrp ){
				return true;
			}
		}
		return false;
	}
	return kwListA.filter(x=>!KwListContain(kwListB, x));

}

