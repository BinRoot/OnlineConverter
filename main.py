import os
from flask import Flask
from flask import request
from flask import url_for
from flask import redirect
import urllib 
from sets import Set
from werkzeug import secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

formatMap = {
    'image/jpg': [
        {'to': 'application/pdf', 'script': 'JPG_2_PDF'},
        {'to': 'application/postscript', 'script': 'JPG_2_PS'},
        {'to': 'image/bmp', 'script': 'JPG_2_BMP'},
        {'to': 'image/gif', 'script': 'JPG_2_GIF'},
        {'to': 'image/png', 'script': 'JPG_2_PNG'},
        {'to': 'image/tiff', 'script': 'JPG_2_TIFF'},
        {'to': 'image/x-icon', 'script': 'JPG_2_ICO'},
        {'to': 'image/x-pcx', 'script': 'JPG_2_PCX'},
    ],
    'image/png': [
        {'to': 'application/pdf', 'script': 'PNG_2_PDF'},
        {'to': 'application/postscript', 'script': 'PNG_2_PS'},
        {'to': 'image/bmp', 'script': 'PNG_2_BMP'},
        {'to': 'image/gif', 'script': 'PNG_2_GIF'},
        {'to': 'image/jpeg', 'script': 'PNG_2_PNG'},
        {'to': 'image/tiff', 'script': 'PNG_2_TIFF'},
        {'to': 'image/x-icon', 'script': 'PNG_2_ICO'},
        {'to': 'image/x-pcx', 'script': 'PNG_2_PCX'},
    ]
}

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/formats', methods=['POST'])
def formats():
    raw_data = request.get_data()
    raw_data = urllib.unquote(raw_data).decode('utf8') 
    formats_in = raw_data.split(',')
    formats_out = getFormats(formats_in)
    f_str = ""
    for f in formats_out:
        f_str += f + ","
    f_str = f_str[:-1]
    return f_str

def allCandidates():
    candidates = Set([])
    for key, value in formatMap.iteritems():
        for v in value:
            candidates.add(v['to'])
    return candidates

def getFormats(formats):
    candidates = allCandidates()
    for f in formats:
        if f in formatMap:
            possible = Set([])
            for fm in formatMap[f]:
                possible.add(fm['to'])
            candidates &= possible
            
    return list(candidates)


@app.route('/api/convert', methods=['POST'])
def convert():
    cwd = os.path.getcwd()
    fil = request.files['file']
    filename = secure_filename(fil.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    fil.save(filepath)
#    return redirect(url_for('uploaded_file', filename=filename))
    return filepath
