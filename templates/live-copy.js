const source = document.getElementById('wordEntry');
const result = document.getElementById('highlightWords');

const inputHandler = function (e) {
    result.innerHTML = e.target.value;
}

source.addEventListener('input', inputHandler);
source.addEventListener('propertychange', inputHandler);