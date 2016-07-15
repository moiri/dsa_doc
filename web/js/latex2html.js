var regExSection = /\\section\{([^}]+)\}/;
var regExIgnores = /(\\label\{([^}]+)\}|\\hfill \\\\)/;
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
    // printDoc( 'sf', 'binden', 'sf1' );
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
    printDoc( 'sf', 'kampfgespuer', 'sf1' );
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
    var doc = $( '<div class="doc"></div>' );
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
    if( ( matches = regExSection.exec( line ) ) != null ) {
        dest.append('<h3>' + matches[1] + '</h3>');
        dest = createDocText( dest );
    }
    else if( ( matches = regExDesc.exec( line ) ) != null ) {
        dest = $('<div class="list-group"></div>').appendTo( dest );
    }
    else if( ( matches = regExBullet.exec( line ) ) != null ) {
        dest = $('<ul class="list-bullet"></ul>').appendTo( dest );
    }
    else if( ( matches = regExEndBullet.exec( line ) ) != null )
        dest = dest.parents( '.list-group-item,.doc' ).first();
    else if( ( matches = regExEndDesc.exec( line ) ) != null ) {
        dest = dest.parents( '.list-bullet-text,.doc' ).first();
    }
    else if( ( matches = regExItem.exec( line ) ) != null ) {
        dest = dest.parents( '.list-bullet-text,.doc' ).first();
        listElem = $('<div class="list-group-item"></div>')
        listElem.append('<h4 class="list-group-item-heading">' + matches[1] + '</h4>' );
        dest.append( listElem );
        line = line.replace( regExItem, "" );
        dest = $('<p class="list-group-item-text">' + line + '</p>' ).appendTo( listElem );
    }
    else if( ( matches = regExItemBullet.exec( line ) ) != null ) {
        line = line.replace( regExItemBullet, "" );
        dest = $( '<li class="list-bullet-text">' + line + '</li>' ).appendTo( dest );
    }
    else if( dest.hasClass( 'list-group-item-text' ) )
        dest.append( ' ' + line );
    else if( dest.hasClass( 'list-bullet-text' ) )
        dest.append( ' ' + line );
    else if( dest.hasClass( 'doc-text' ) ) {
        if( line === "" ) dest = createDocText( dest );
        dest.append( ' ' + line );
    }
    return dest;
}

function createDocText( dest ) {
    return $('<p class="doc-text"></p>').appendTo( dest );
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
