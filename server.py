from flask import Flask
from flask import render_template
import jyserver.Flask as jsf
from main import get_result

app = Flask(__name__)


@jsf.use(app)
class App:
    def __init__(self):
        self.result = ""

    def get_change(self):
        text = self.js.document.getElementById('wordEntry').value
        text = str(text)
        print(text)
        self.result = get_result(text)
        print(self.result)
        self.js.document.getElementById('highlightWords').innerHTML = self.result


@app.route('/')
@app.route('/jquery/jquery.js')
@app.route('/jquery/jquery.highlight.js')
@app.route('/lib.js')
@app.route('/popup.js')
@app.route('/live-copy.js')
@app.route('/server.js')
def index():
    return App.render(render_template('popup.html'))


if __name__ == '__main__':
    app.run(host='0.0.0.0')
