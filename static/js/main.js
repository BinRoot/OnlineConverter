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

$( ".tl" ).mouseover(function() {
    showUploadFiles();
});

$( ".tr" ).mouseover(function() {
    hideUploadFiles();
});

$( ".bl" ).mouseover(function() {
    hideUploadFiles();
});

$( ".br" ).mouseover(function() {
    hideUploadFiles();
});

$('.button2').click(function() {
    $('#file').click();
    return false;
});


function adjustTLMenu() {
    var h1 = $('.tl-menu > .tl div').height()
    var h2 = $('.tl-menu > .tl').height()
    var mtop = (h2 - h1)/2;
    $('.tl-menu > .tl div').css('margin-top', mtop + 'px')

    h1 = $('.tl-menu > .tr div').height()
    h2 = $('.tl-menu > .tr').height()
    mtop = (h2 - h1)/2;
    $('.tl-menu > .tr div').css('margin-top', mtop + 'px')

    h1 = $('.tl-menu > .bl div').height()
    h2 = $('.tl-menu > .bl').height()
    mtop = (h2 - h1)/2;
    $('.tl-menu > .bl div').css('margin-top', mtop + 'px')

    h1 = $('.tl-menu > .br div').height()
    h2 = $('.tl-menu > .br').height()
    mtop = (h2 - h1)/2;
    $('.tl-menu > .br div').css('margin-top', mtop + 'px')

}

function showUploadFiles() {
    $('.tl > .quad-text').hide();
    $('.tl-menu').show();
}


function hideUploadFiles() {
    $('.tl > .quad-text').show();
    $('.tl-menu').hide();
}

function showFiles(files) {
    $('.tr > .quad-text').hide();
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
	$.post('/api/formats', {'formats': fileTypes}, function(data) {
	    console.log('got data');
	    console.log(data);
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
    $('.tr > .quad-text').show();
    $('.tr-menu').hide();
}

function showFormats() {
    $('.bl > .quad-text').hide();
    $('.bl-menu').show();
}

function hideFormats() {
    $('.bl > .quad-text').show();
    $('.bl-menu').hide();
}
