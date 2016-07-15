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

$(document).ready(function() {
    // printDoc( 'sf', 'aufmerksamkeit', 'sf1' );
    // printDoc( 'sf', 'ausfall', 'sf1' );
    // printDoc( 'sf', 'ausweichen', 'sf1' );
    // printDoc( 'sf', 'befreiungsschlag', 'sf1' );
    // printDoc( 'sf', 'beidhaendiger_kampf', 'sf1' );
    // printDoc( 'sf', 'berittener_schuetze', 'sf1' );
    // printDoc( 'sf', 'betaeubungsschlag', 'sf1' );
    printDoc( 'chap', 'wunden', 'chap' );
    printDoc( 'sf', 'binden', 'box' );
    // printDoc( 'sf', 'blindkampf', 'sf1' );
    // printDoc( 'sf', 'defensiver_kampfstil', 'sf1' );
    // printDoc( 'sf', 'doppelangriff', 'sf1' );
    // printDoc( 'sf', 'eisenhagel', 'sf1' );
    // printDoc( 'sf', 'entwaffnen', 'sf1' );
    // printDoc( 'sf', 'festnageln', 'sf1' );
    // printDoc( 'sf', 'finte', 'sf1' );
    // printDoc( 'sf', 'formation', 'sf1' );
    // printDoc( 'sf', 'gegenhalten', 'sf1' );
    // printDoc( 'sf', 'gezielter_stich', 'sf1' );
    // printDoc( 'sf', 'halbschwert', 'sf1' );
    // printDoc( 'sf', 'hammerschlag', 'sf1' );
    // printDoc( 'sf', 'improvisierte_waffen', 'sf1' );
    // printDoc( 'sf', 'kampfgespuer', 'sf1' );
    // printDoc( 'sf', 'kampf_im_wasser', 'sf1' );
    // printDoc( 'sf', 'kampfreflexe', 'sf1' );
    // printDoc( 'sf', 'klingensturm', 'sf1' );
    // printDoc( 'sf', 'klingentaenzer', 'sf1' );
    // printDoc( 'sf', 'klingenwand', 'sf1' );
    // printDoc( 'sf', 'kriegsreiterei', 'sf1' );
    // printDoc( 'sf', 'linkhand', 'sf1' );
    // printDoc( 'sf', 'meisterliches_entwaffnen', 'sf1' );
    // printDoc( 'sf', 'meisterparade', 'sf1' );
    // printDoc( 'sf', 'meisterschuetze', 'sf1' );
    // printDoc( 'sf', 'niederwerfen', 'sf1' );
    // printDoc( 'sf', 'parierwaffen', 'sf1' );
    // printDoc( 'sf', 'reiterkampf', 'sf1' );
    // printDoc( 'sf', 'ruestungsgewoehnung', 'sf1' );
    // printDoc( 'sf', 'scharfschuetze', 'sf1' );
    // printDoc( 'sf', 'schildkampf', 'sf1' );
    // printDoc( 'sf', 'schildspalter', 'sf1' );
    // printDoc( 'sf', 'schnellladen', 'sf1' );
    // printDoc( 'sf', 'schnellziehen', 'sf1' );
    // printDoc( 'sf', 'spiessgespann', 'sf1' );
    // printDoc( 'sf', 'sturmangriff', 'sf1' );
    // printDoc( 'sf', 'todesstoss', 'sf1' );
    // printDoc( 'sf', 'tod_von_links', 'sf1' );
    // printDoc( 'sf', 'turnierreiterei', 'sf1' );
    // printDoc( 'sf', 'umreissen', 'sf1' );
    // printDoc( 'sf', 'unterwasserkampf', 'sf1' );
    // printDoc( 'sf', 'waffe_zerbrechen', 'sf1' );
    // printDoc( 'sf', 'windmuehle', 'sf1' );
    // printDoc( 'sf', 'wuchtschlag', 'sf1' );
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
