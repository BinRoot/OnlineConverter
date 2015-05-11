var files = [];

$(function() {

    showUploadFiles();

    resetFormats();

    $('#file').change(function (e) {
	if (e && e.target && e.target.files[0]) {
	    for (var i = 0; i < e.target.files.length; i++) {
		console.log('searching ' + e.target.files[i]);
		var found = false;
		for (var j = 0; j < files.length; j++) {
		    if (files[j] == e.target.files[i]) {
			found = true;
			console.log('found ' + e.target.files[i]);
			break;
		    }
		}
		if (!found) {
		    files.push(e.target.files[i])
		    console.log('files is now ' + files);
		}
	    }
	    showFiles(files);
	    showBrowseOptionsAbridged();
	}
	return false;
    });

    $("ol.file-list").sortable();


    $(".meter > span").each(function() {
	$(this)
	    .data("origWidth", $(this).width())
	    .width(0)
	    .animate({
		width: $(this).data("origWidth")
	    }, 1200);
    });
});

$('.browse-options-text').click(function () {
    showBrowseOptions();
    return false; 
});

function showBrowseOptions() {
    $('.tl-menu > .full').addClass("tl");
    $('.tl-menu > .full').removeClass("full");
    $('.browse-options-text').hide();
    $('.button2').text('Browse');
    $('.tl-menu > .tl').addClass('black1');
}

function showBrowseOptionsAbridged() {
    $('.browse-options-text').hide();
    $('.button2').text('Browse');
}


function squeezeBrowse() {
    $('.meter').hide();
    $('.top-half').addClass('tl');
    $('.top-half').removeClass('top-half');
    $('.tr-menu').parent().show();
    $('.tr-menu > .files-title').text('Files')
    $('.file-list').show();
}

function expandBrowse() {
    $('.tl-menu').parent()[0].addClass('top-half');
    $('.tl-menu').parent()[0].removeClass('tl');
}

$('.button2').click(function() {
    $('#file').click();
    return false;
});

function showUploadFiles() {
    $('body > .tl > .quad-text').hide();
    $('.tl-menu').show();
}


function hideUploadFiles() {
    $('body > .tl > .quad-text').show();
    $('.tl-menu').hide();
}

function getCurrentFileTypes() {
    var fileTypes = '';
    var lis = $('.file-list > li');
    for (var i = 0; i < lis.length; i++) {
	if ($(lis[i]).attr('filetype') == '') {
	    fileTypes = fileTypes + 'ERR,';
	} else {
	    fileTypes = fileTypes + ($(lis[i]).attr('filetype')) + ',';	    
	}
    }
    if (fileTypes.length > 1) { 
	fileTypes = fileTypes.slice(0,-1);
    }
    return fileTypes;
}

function showFiles(files) {
    $('.file-list').empty();
    $('body > .tr > .quad-text').hide();
    $('.tr-menu').show();
    for (var i = 0; i < files.length; i = i + 1) {
	console.log(files[i]);
	var typeStr = files[i].type.replace('/', '-');
	var imgUrl = 'http://darvin.github.io/mimetype-icon/Icons/Icons/32_' + typeStr + '.png'
	if (files[i].type === '') {
	    imgUrl = 'static/img/file.png';
	}

	var imgElem = '<img src="' + imgUrl + '"/> '
	var delElem = '<a href="" class="delete-item">×</a>'
	$('.file-list').append('<li filetype="' + 
			       files[i].type + '">' + delElem + 
			       imgElem + files[i].name + '</li>');
    }
    console.log('getCurrentFileTypes')
    var fileTypes = getCurrentFileTypes();
    console.log(fileTypes)
    if (files.length > 0) {
	squeezeBrowse();
	$.post('/api/formats', fileTypes, function(data) {
	    console.log('got data');
	    console.log(data.split(','));
	    showFormats(data.split(','));
	});
    } else {
	resetFormats();
    }
    $('.delete-item').click(function() {
	$(this).parent().remove();
	if ($('.file-list').children().length === 0) {
	    hideFiles();
	    expandBrowse();
	    resetFormats();
	} else {
	    var fileTypes = getCurrentFileTypes();

	    // TODO: file removal is broken

	    $.post('/api/formats', fileTypes, function(data) {
		console.log('got data');
		console.log(data.split(','));
		showFormats(data.split(','));
	    });
	}
	return false;
    });
}

function hideFiles() {
    $('body > .tr > .quad-text').show();
    $('.tr-menu').hide();
}

function convertFilesTo(fileType) {
    console.log('converting files to ' + fileType);
    var num_files = files.length;

    if (num_files > 0) {
	var data = new FormData();    
	data.append('num', num_files);
	console.log('num files: ' + num_files)
	for (var i = 0; i < num_files; i++)
	    data.append('file-'+i, files[i]);	
	data.append('mime', fileType);

	var xhr = new XMLHttpRequest;
	$('.tr-menu > .files-title').text('Progress')
	$('.file-list').hide();
	$('.meter').show();
	$('.meter').removeClass('nostripes')
	xhr.upload.addEventListener('progress', function(e) {
	    console.log('progress');
	    console.log(e);
	    if (e.lengthComputable) {
		var percent = (e.loaded / e.total) * 100;
		$('.meter > span').css('width', percent + '%')
	    }
	});
	xhr.open('POST', '/api/convert', true);
	xhr.send(data);
	xhr.onreadystatechange = function(e) {
	    if (this.readyState == 4 && this.status == 200) {
		$('.meter > span').css('width', '100%')
		$('.meter').addClass('nostripes')
		$('.tr-menu > .files-title').text('Done!')
		window.location.href = this.responseText;
	    }
	}
    }
}

function showFormats(formats) {
    $('body > .bl > .quad-text').hide();
    $('.bl-menu').show();
    $('.format-list').empty();
    for (var i = 0; i < formats.length; i = i+1) {
	var format = formats[i];

	var name = format.split('/')[1].toUpperCase();

	if (name === 'POSTSCRIPT') {
	    name = 'PS';
	} else if (name === 'X-PCX') {
	    name = 'PCX';
	} else if (name === 'X-ICON') {
	    name = 'ICO'
	}
	
	var li = '<li filetype="' + format + 
	    '" style="background:' + 
	    colorLuminance(stringToColor(name), -0.3) + 
	    '">' + name + '</li>';
	$('.format-list').append(li);
    }
    $('.format-list > li').click(function () {
	var fileType = $(this).attr('filetype');
	convertFilesTo(fileType)
    });
}

function colorLuminance(hex, lum) {
	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}

function stringToColor(str) {
    str += str + 'almao' + str;
    // str to hash
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));

    // int/hash to hex
    for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));

    return colour;
}

function resetFormats() {
    $.post('/api/formats', '', function(data) {
	showFormats(data.split(','));
    });
}
