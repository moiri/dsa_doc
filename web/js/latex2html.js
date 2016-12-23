var regExChapter = /\\chapter\{([^}]+)\}/;
var regExSection = /\\section\{([^}]+)\}/;
var regExInput = /\\input\{([^}]+)\}/;
var regExIgnores = /(\\label\{([^}]+)\}|\\hfill \\\\|%.+)/;
var regExDesc = /\\begin\{description}/;
var regExEndDesc = /\\end\{description}/;
var regExItem = /\\item[\s]?\[([^}]+)\]/;
var regExBullet = /\\begin\{itemize}/;
var regExEndBullet = /\\end\{itemize}/;
var regExItemBullet = /\\item/;
var regExNameref = /\\(name|)ref\{([^}]+)\}/g;
var regExStyleLink = /\\textStyle(M|SF)\{([^}]+)\}/g;
var regExStyle = /\\textStyle(VT|AT|Ta)\{([^}]+)\}/g;
var regExStyleBold = /\\textStyleStrongEmphasis\{([^}]+)\}/g;
var regExMath = /\\textrm\{[\s]?\$\{(.*?)\}\$[\s]?\}/g;
var regExNL = /\\newline/g;
var math = [];
var index = null;
var figFolder = "fig";
var figPath = "tex/" + figFolder + "/";
math["\\leq"] = ' &le; ';
math["\\geq"] = ' &ge; ';

function printDoc( path, name, id ) {
    $( '#' + id ).html( createDoc( path, name ) );
    $('.sect-subtitle').html( getTitle( 'chap', path ) );
    $('a[id|="link"]').click( function( e ) {
        var path = $( this ).attr( 'id' ).split( '-' );
        printDoc( path[1], path[2], id );
    });
}

function createDoc( folder, file ) {
    var path = __PATH + folder + '/' + file + '.tex';
    var doc = $( '<div class="doc cont-root"></div>' );
    $.ajax({
        dataType: 'json',
        async: false,
        type: 'GET',
        url: 'index.json',
        success: function( data ) {
            index = data;
        }
    });
    $.ajax({
        async: false,
        type: 'GET',
        url: path,
        success: function( data ) {
            data = replaceNL( data );
            var lines = data.split("\n");
            var dest = doc;
            $.each( lines, function( n, line ) {
                line = removeIgnores( line );
                line = replaceNameref( line );
                line = replaceStyles( line );
                line = replaceMath( line );
                dest = appendDocLine( line, dest );
            });
        }
    });
    return doc;
}

function getIndex() {
    return index;
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
        dest.append('<h3>' + matches[1] + ' <small class="sect-subtitle"></small></h3>');
        dest = createDocText( dest );
    }
    else if( ( matches = regExInput.exec( line ) ) != null ) {
        dest = getParentRootDest( dest );
        var ids = matches[1].split( '/' );
        dest.append( '<a href=# id="link-' + ids[0] + '-' + ids[1] + '">'
            + getTitle( ids[0], ids[1] ) + '</a>' );
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
    while( exclusive && dest.hasClass( 'cont-text' ) )
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
        line = line.replace( regExNameref, function( regExStr, type, name ) {
            var title = '';
            var href = '#';
            var names = name.split( '.' );
            var id = 'link-' + names[0] + '-' + names[1];
            if( names[0] == figFolder ) {
                title = '<span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span>';
                id = '';
                href = figPath + names[1] + ".pdf";
            }
            else
                title = getTitle( names[0], names[1] );
            return '<a href="' + href + '" id="' + id + '">' + title + '</a>';
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
    if( ( matches = regExStyleLink.exec( line ) ) != null )
        line = line.replace( regExStyleLink,
            function( regExStr, type, name ) {
                return name;
        } );
    if( ( matches = regExStyleBold.exec( line ) ) != null )
        line = line.replace( regExStyleBold,
            function( regExStr, name ) {
                return '<strong>' + name + '</strong>';
        } );
    return line;
}

function replaceMath( line ) {
    var matches = null;
    if( ( matches = regExMath.exec( line ) ) != null ) {
        line = line.replace( regExMath, math[ matches[1].trim() ] );
    }
    return line;
}

function replaceNL( line ) {
    var matches = null;
    if( ( matches = regExNL.exec( line ) ) != null ) {
        line = line.replace( regExNL, "\n\n" );
    }
    return line;
}

function getTitle( folder, file ) {
    var title = "";
    $.each( index, function( idx, item ) {
        if( ( item.file == file ) && ( item.folder == folder ) ) {
            title = item.name;
            return false;
        }
    })
    return title;
}

function getTitleFromFile( folder, file ) {
    var title = "";
    var path = __PATH + folder + '/' + file + '.tex';
    $.ajax({
        async: false,
        type: 'GET',
        url: path,
        success: function( data ) {
            var lines = data.split("\n");
            $.each( lines, function( n, elem ) {
                var matches = null;
                if( ( ( matches = regExChapter.exec( elem ) ) != null ) ||
                    ( ( matches = regExSection.exec( elem ) ) != null ) ) {
                    title = matches[1];
                    return false;
                }
            });
        }
    });
    return title;
}
