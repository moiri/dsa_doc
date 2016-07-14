var regExSection = /\\section\{([^}]+)\}/;
var regExLabel = /\\label\{([^}]+)\}/;
var regExDesc = /\\begin\{description}/;
var regExEndDesc = /\\end\{description}/;
var regExItem = /\\item[\s]?\[([^}]+)\]/;
var regExNameref = /\\nameref\{([^}]+)\}/g;
var regExStyle = /\\textStyle(M|SF)\{([^}]+)\}/g;

$(document).ready(function() {
    printDoc( 'sf', 'klingenwand', 'sf1' );
});

function printDoc( path, name, id ) {
    $( '#' + id ).html( createDoc( path, name ) );
    $('span[id|="link"]').click( function( e ) {
        var path = $( this ).attr( 'id' ).split( '-' );
        printDoc( path[1], path[2], id );
    });
}

function createDoc( folder, file ) {
    var path = '../' + folder + '/' + file + '.tex';
    var doc = $( '<div></div>' );
    $.ajax({
        async: false,
        type: 'GET',
        url: path,
        success: function( data ) {
            var lines = data.split("\n");
            var list = null;
            $.each( lines, function( n, line ) {
                line = replaceNameref( line );
                line = replaceStyles( line );
                list = appendDocLine( line, doc, list );
            });
        }
    });
    return doc;
}

function appendDocLine( line, doc, list ) {
    var matches = null;
    var listElem = null;
    if( ( matches = regExSection.exec( line ) ) != null )
        doc.append('<h3>' + matches[1] + '</h3>');
    else if( ( matches = regExDesc.exec( line ) ) != null ) {
        list = $('<div class="list-group"></div>')
        doc.append( list );
    }
    else if( ( matches = regExEndDesc.exec( line ) ) != null )
        list = null;
    else if( ( matches = regExItem.exec( line ) ) != null ) {
        if( list.hasClass("list-group-item") ) list = list.parent();
        listElem = $('<div class="list-group-item"></div>')
        listElem.append('<h4 class="list-group-item-heading">' + matches[1] + '</h4>' );
        list.append( listElem );
        list = listElem;
    }
    else if( list != null )
        list.append('<p class="list-group-item-text">' + line + '</p>' );
    else if( ( matches = regExLabel.exec( line ) ) != null )
        return list;
    else
        doc.append('<p>' + line + '</p>');
    return list;
}

function replaceNameref( line ) {
    var matches = null;
    if( ( matches = regExNameref.exec( line ) ) != null )
        line = line.replace( regExNameref, function( regExStr, name ) {
            var names = name.split( '.' );
            var title = getTitle( names[0], names[1] );
            var id = 'link-' + names[0] + '-' + names[1];
            return '<span id="' + id + '">' + title + '</span>';
        } );
    return line;
}

function replaceStyles( line ) {
    var matches = null;
    if( ( matches = regExStyle.exec( line ) ) != null )
        line = line.replace( regExStyle,
            function( regExStr, type, name ) {
                return '<a class="link-' + type + '" href="#">' + name + '</a>';
        } );
    return line;
}

function getTitle( folder, file ) {
    var title = null;
    var path = '../' + folder + '/' + file + '.tex';
    $.ajax({
        async: false,
        type: 'GET',
        url: path,
        success: function( data ) {
            var lines = data.split("\n");
            $.each( lines, function( n, elem ) {
                var matches = null;
                if( ( matches = regExSection.exec( elem ) ) != null ) {
                    title = matches[1];
                    return false;
                }
            });
        }
    });
    return title;
}
