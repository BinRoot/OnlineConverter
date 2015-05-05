var files = [];

$(function() {

    showUploadFiles();

    $.post('/api/formats', '', function(data) {
	showFormats(data.split(','));
    });


    $('#file').change(function (e) {
	if (e && e.target && e.target.files[0]) {
	    files = e.target.files;
	    showFiles(files);
	    showBrowseOptions();
	}
	return false;
    });

    $("ol.file-list").sortable()
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
    $('.tl-menu > .tl').removeClass('pink');
    $('.tl-menu > .tl').addClass('black1');
    $('.tl').unbind('mouseover');
    $('.tr').unbind('mouseover');
    $('.bl').unbind('mouseover');
    $('.br').unbind('mouseover');
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
    for (var i = 0; i < lis.length; i = i+1) {
	fileTypes = fileTypes + (lis.attr('filetype')) + ',';
    }
    fileTypes = fileTypes.slice(0,-1);
    return fileTypes;
}

function showFiles(files) {
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
    var fileTypes = getCurrentFileTypes();
    if (files.length > 0) {
	console.log(fileTypes);
	$.post('/api/formats', fileTypes, function(data) {
	    console.log('got data');
	    console.log(data.split(','));
	    showFormats(data.split(','));
	});
    } else {
	hideFormats();
    }
    $('.delete-item').click(function() {
	$(this).parent().remove();
	if ($('.file-list').children().length === 0) {
	    hideFiles();
	    hideFormats();
	} else {
	    var fileTypes = getCurrentFileTypes();
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
    var data = new FormData();
    data.append('file', files[0])
    jQuery.ajax({
	url: '/api/convert',
	data: data,
	cache: false,
	contentType: false,
	processData: false,
	type: 'POST',
	success: function(data){
	    console.log(data);
	}
    }); 
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

function hideFormats() {
    $('body > .bl > .quad-text').show();
    $('.bl-menu').hide();
}
