$(function() {

    $('#file').change(function (e) {
	if (e && e.target && e.target.files[0]) {
	    showFiles(e.target.files);
	    $('.tl').unbind('mouseover');
	    $('.tr').unbind('mouseover');
	    $('.bl').unbind('mouseover');
	    $('.br').unbind('mouseover');
	}
	return false;
    });

    $("ol.file-list").sortable()
});

$('.browse-options-text').click(function () {
    $('.tl-menu > .full').addClass("tl");
    $('.tl-menu > .full').removeClass("full");
    $('.browse-options-text').hide();
    $('.button2').text('Browse');
    return false; 
});

$( "body > .tl" ).mouseover(function() {
    showUploadFiles();
});

$( "body > .tr" ).mouseover(function() {
    hideUploadFiles();
});

$( "body > .bl" ).mouseover(function() {
    hideUploadFiles();
});

$( "body > .br" ).mouseover(function() {
    hideUploadFiles();
});

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

function showFiles(files) {
    $('body > .tr > .quad-text').hide();
    $('.tr-menu').show();
    var fileTypes = '';
    for (var i = 0; i < files.length; i = i + 1) {
	console.log(files[i]);

	var typeStr = files[i].type.replace('/', '-');
	if (typeStr) {
	    fileTypes = fileTypes + files[i].type + ",";
	} else {
	    if (files[i].name.indexOf('.') >= 0) {
		fileTypes = fileTypes + files[i].name.split('.')[1] + ",";		
	    } else {
		fileTypes = fileTypes + "ERR" + ",";
	    }
	}

	var imgUrl = 'http://darvin.github.io/mimetype-icon/Icons/Icons/32_' + typeStr + '.png'
	if (files[i].type === '') {
	    imgUrl = 'static/img/file.png';
	}

	var imgElem = '<img src="' + imgUrl + '"/> '
	var delElem = '<a href="" class="delete-item">×</a>'
	$('.file-list').append('<li>' + delElem + imgElem + files[i].name + '</li>');
    }
    fileTypes = fileTypes.slice(0, -1);
    if (files.length > 0) {
	console.log(fileTypes);
	$.post('/api/formats', fileTypes, function(data) {
	    console.log('got data');
	    console.log(data.split(','));
	    showFormats();
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
	    showFormats();
	}
	return false;
    });
}

function hideFiles() {
    $('body > .tr > .quad-text').show();
    $('.tr-menu').hide();
}

function showFormats() {
    $('body > .bl > .quad-text').hide();
    $('.bl-menu').show();
}

function hideFormats() {
    $('body > .bl > .quad-text').show();
    $('.bl-menu').hide();
}
