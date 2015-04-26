import os
from flask import Flask
from flask import request

app = Flask(__name__)


@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/formats', methods=['POST'])
def formats():
    print(request.get_data())
    return str(request.get_data())

