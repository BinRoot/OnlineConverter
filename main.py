import os
from flask import Flask
from flask import request
from flask import url_for
from flask import redirect
import urllib 
from sets import Set
from werkzeug import secure_filename
import mimetypes
mimetypes.init()

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

imgCircle = [
    'application/pdf',
    'application/postscript',
    'image/bmp', # image/x-ms-bmp
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'image/x-icon', # image/vnd.microsoft.icon
    'image/x-rgb',
    'image/webp' # err
]

formatMap = {}

def getFileExtension(imgType):
    if imgType == 'image/bmp':
        return '.bmp'
    elif imgType == 'image/x-icon':
        return '.ico'
    elif imgType == 'image/webp':
        return '.webp'
    elif imgType == 'image/jpeg':
        return '.jpg'
    elif imgType == 'application/postscript':
        return '.ps'
    else:
        guess = mimetypes.guess_extension(imgType)
        if guess == None:
            if len(imgType.split('/')) > 1:
                return '.' + imgType.split('/')[1]
            else:
                return '.' + imgType
        return guess

for imgType1 in imgCircle:
    toBlocks = []
    for imgType2 in imgCircle:
        if imgType1 != imgType2:
            toBlocks.append({'to': imgType2, 'script': 'convert $1 $1{1%%.*}' + getFileExtension(imgType2)})
    formatMap[imgType1] = toBlocks

print(formatMap)
    

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
