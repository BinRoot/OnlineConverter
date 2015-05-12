import os
from flask import Flask
from flask import request
from flask import url_for
from flask import redirect
from flask import make_response
import time
import urllib 
from subprocess import call
from sets import Set
from werkzeug import secure_filename
import mimetypes
mimetypes.init()

app = Flask(__name__)

import logging
from logging import StreamHandler
file_handler = StreamHandler()
app.logger.setLevel(logging.DEBUG)  # set the desired logging level here
app.logger.addHandler(file_handler)
app.logger.debug('started...')

UPLOAD_FOLDER = 'files_in/'
CONVERT_FOLDER = 'files_out/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['CONVERT_FOLDER'] = CONVERT_FOLDER

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
    toBlocks = {}
    for imgType2 in imgCircle:
        if imgType2 == "application/pdf":
            toBlocks[imgType2] = 'convert -resize 565x800 -page A4 -gravity center $1 ${2%.*}' + getFileExtension(imgType2)
        else:
            toBlocks[imgType2] = 'convert $1 ${2%.*}' + getFileExtension(imgType2)
    formatMap[imgType1] = toBlocks

formatMap['application/pdf']['application/pdf-merge'] = 'gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile=$1 $2'

formatMap['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] = {}
formatMap['application/vnd.openxmlformats-officedocument.wordprocessingml.document']['application/pdf'] = 'doc2pdf -o ${2%.*}.pdf $1'

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/formats', methods=['POST'])
def formats():
    raw_data = request.get_data()
    raw_data = urllib.unquote(raw_data).decode('utf8') 
    formats_in = raw_data.split(',')
    app.logger.debug('formats_in: ' + str(formats_in));
    formats_out = getFormats(formats_in)
    app.logger.debug('formats_out: ' + str(formats_out));
    f_str = ""
    for f in formats_out:
        f_str += f + ","
    f_str = f_str[:-1]
    return f_str

def allCandidates():
    candidates = Set([])
    for key, value in formatMap.iteritems():
        for k, v in value.iteritems():
            candidates.add(k)
    return candidates

def getFormats(formats):
    candidates = allCandidates()
    if formats == ['']:
        return list(candidates)
    for f in formats:
        if f in formatMap:
            possible = Set([])
            for k, v in formatMap[f].iteritems():
                possible.add(k)
            candidates &= possible
        else:
            candidates &= Set([])
            break
    return list(candidates)


def generate_outputs(files, to_mime):
    filename_outs = []
    timestamp = int(time.time())
    if to_mime.endswith('-merge'):
        split = to_mime.split('-')
        split.pop()
        to_mime_actual = '-'.join(split)
        command = formatMap[to_mime_actual][to_mime]
        app.logger.debug('to mime: ' + to_mime)
        app.logger.debug('command: ' + command)
        filename = str(timestamp) + '_merged_' + secure_filename(files[0].filename)
        filepath = os.path.join(os.getcwd(), app.config['UPLOAD_FOLDER'], filename)
        in_filenames = ''
        for f in files:
            in_filename = app.config['UPLOAD_FOLDER'] + f.filename
            f.save(in_filename)
            in_filenames = in_filenames + in_filename + ' '
        command_to_call = ['bash', '-c', 
                           command, 'ignore',
                           app.config['CONVERT_FOLDER'] + filename, 
                           in_filenames]
        app.logger.debug(command_to_call)
        call(command_to_call)
        filename_outs.append(filename)
    else:
        for i in range(0, len(files)):
            from_mime = files[i].content_type;
            filename = str(timestamp) + '_' + secure_filename(files[i].filename)
            filepath = os.path.join(os.getcwd(), app.config['UPLOAD_FOLDER'], filename)
            files[i].save(filepath)
            command = formatMap[from_mime][to_mime]
            app.logger.debug('file: ' + filename)
            app.logger.debug('from mime: ' + from_mime)
            app.logger.debug('to mime: ' + to_mime)
            app.logger.debug('command: ' + command)
            call(['bash', '-c', 
                  command, 'ignore', 
                  app.config['UPLOAD_FOLDER'] + filename, 
                  app.config['CONVERT_FOLDER'] + filename])
            filename_outs.append(filename)
    return filename_outs

@app.route('/api/convert', methods=['POST'])
def convert():
    num_files = int(request.form['num'])
    files = []
    for i in range(0, num_files):
        files.append(request.files['file-' + str(i)])
    to_mime = request.form['mime']
    app.logger.debug(str(files))
    if num_files > 0 and to_mime:
        filename_outs = generate_outputs(files, to_mime);
        if len(filename_outs) == 1:
            return '/f/' + filename_outs[0].split('.')[0]            
        else:
            timestamp = int(time.time())
            zip_filename = str(timestamp) + '_' + to_mime.replace('/', '_') + '.zip'

            real_filename_outs = []
            for f_out in filename_outs:
                real_f_out = [ fname for fname in os.listdir(app.config['CONVERT_FOLDER']) 
                               if fname.startswith( f_out.split('.')[0] ) ]
                real_filename_outs.append(real_f_out[0])

            command_to_call = ['zip', app.config['CONVERT_FOLDER'] + zip_filename] + [ app.config['CONVERT_FOLDER'] + f_out for f_out in real_filename_outs ]
            app.logger.debug(str(command_to_call))
            call(command_to_call)
            return '/f/' + zip_filename.split('.')[0]

@app.route('/f/<filename>')
def file_serve(filename):
    prefixed = [fname for fname in os.listdir(app.config['CONVERT_FOLDER']) if fname.startswith(filename)]
    app.logger.debug(prefixed[0])
    f = open(app.config['CONVERT_FOLDER'] + prefixed[0], 'r')
    response = make_response(f.read())
    ts_length = len(prefixed[0].split('_')[0]) + 1
    filename_out = prefixed[0][ts_length:]
    response.headers['Content-Disposition']  = 'attachment; filename=' + filename_out
    return response
