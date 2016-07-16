var regExChapter = /\\chapter\{([^}]+)\}/;
var regExSection = /\\section\{([^}]+)\}/;
var regExIgnores = /(\\label\{([^}]+)\}|\\hfill \\\\|%.+)/;
var regExDesc = /\\begin\{description}/;
var regExEndDesc = /\\end\{description}/;
var regExItem = /\\item[\s]?\[([^}]+)\]/;
var regExBullet = /\\begin\{itemize}/;
var regExEndBullet = /\\end\{itemize}/;
var regExItemBullet = /\\item/;
var regExNameref = /\\nameref\{([^}]+)\}/g;
var regExStyleLink = /\\textStyle(M|SF)\{([^}]+)\}/g;
var regExStyle = /\\textStyle(VT|AT|Ta)\{([^}]+)\}/g;

function printDoc( path, name, id ) {
    $( '#' + id ).html( createDoc( path, name ) );
    $('span[id|="link"]').click( function( e ) {
        var path = $( this ).attr( 'id' ).split( '-' );
        printDoc( path[1], path[2], id );
    });
}

function createDoc( folder, file ) {
    var path = __PATH + folder + '/' + file + '.tex';
    var doc = $( '<div class="doc cont-root"></div>' );
    $.ajax({
        async: false,
        type: 'GET',
        url: path,
        success: function( data ) {
            var lines = data.split("\n");
            var dest = doc;
            $.each( lines, function( n, line ) {
                line = removeIgnores( line );
                line = replaceNameref( line );
                line = replaceStylesLink( line );
                line = replaceStyles( line );
                dest = appendDocLine( line, dest );
            });
        }
    });
    return doc;
}

function removeIgnores( line ) {
    var matches = null;
    if( ( matches = regExIgnores.exec( line ) ) != null )
        line = line.replace( regExIgnores, "" );
    return line;
}

function appendDocLine( line, dest ) {
    var matches = null;
    var listElem = null;
    if( ( matches = regExChapter.exec( line ) ) != null ) {
        dest = getParentRootDest( dest );
        dest.append('<h2>' + matches[1] + '</h2>');
        dest = createDocText( dest );
    }
    else if( ( matches = regExSection.exec( line ) ) != null ) {
        dest = getParentRootDest( dest );
        dest.append('<h3>' + matches[1] + '</h3>');
        dest = createDocText( dest );
    }
    else if( ( matches = regExDesc.exec( line ) ) != null ) {
        dest = getParentRootDest( dest );
        dest = $('<dl class="dl-horizontal cont-root"></dl>').appendTo( dest );
    }
    else if( ( matches = regExItem.exec( line ) ) != null ) {
        dest = getParentRootDest( dest, true );
        dest.append('<dt>' + matches[1] + '</dt>' );
        line = line.replace( regExItem, "" );
        dest = $('<dd class="list-desc-text cont-text cont-root">' + line
            + '</dd>' ).appendTo( dest );
    }
    else if( ( matches = regExEndDesc.exec( line ) ) != null ) {
        dest = dest.parent().parent();
    }
    else if( ( matches = regExBullet.exec( line ) ) != null ) {
        dest = getParentRootDest( dest );
        dest = $('<ul class="list-bullet cont-root"></ul>').appendTo( dest );
    }
    else if( ( matches = regExItemBullet.exec( line ) ) != null ) {
        dest = getParentRootDest( dest, true );
        line = line.replace( regExItemBullet, "" );
        dest = $( '<li class="list-bullet-text cont-text cont-root">' + line
            + '</li>' ).appendTo( dest );
    }
    else if( ( matches = regExEndBullet.exec( line ) ) != null ) {
        dest = dest.parent().parent();
    }
    else if( dest.hasClass( 'cont-text' ) ) {
        if( line === "" ) {
            dest = getParentRootDest( dest );
            dest = createDocText( dest );
        }
        dest.append( ' ' + line );
    }
    return dest;
}

function getParentRootDest( dest, exclusive ) {
    if( exclusive === undefined ) exclusive = false;
    if( exclusive && dest.hasClass( 'cont-text' ) )
        dest = dest.parent();
    if( !dest.hasClass( 'cont-root' ) )
        dest = dest.parents( '.cont-root' ).first();
    return dest;
}

function createDocText( dest ) {
    return $('<p class="doc-text cont-text"></p>').appendTo( dest );
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

function replaceStylesLink( line ) {
    var matches = null;
    if( ( matches = regExStyleLink.exec( line ) ) != null )
        line = line.replace( regExStyleLink,
            function( regExStr, type, name ) {
                return '<a class="link-' + type + '" href="#">' + name + '</a>';
        } );
    return line;
}

function replaceStyles( line ) {
    var matches = null;
    if( ( matches = regExStyle.exec( line ) ) != null )
        line = line.replace( regExStyle,
            function( regExStr, type, name ) {
                return '<span class="span-' + type + '">' + name + '</span>';
        } );
    return line;
}

function getTitle( folder, file ) {
    var title = null;
    var path = __PATH + folder + '/' + file + '.tex';
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
