var __PATH = 'tex/';

$(document).ready(function() {
    var id = 'chap';
    var $input = $('#query');
    printDoc( 'chap', 'intro', id );
    $('[id|="toc"]').click( function( e ) {
        var path = $( this ).attr( 'id' ).split( '-' );
        printDoc( path[1], path[2], id );
    });
    $.get('query.json', function( data ) {
        $input.typeahead({
            source:data,
            autoSelect: true,
            displayText: function( item ){
                return ( item.folder === "sf" ) ? item.name + " (SF)" : item.name;
            },
            afterSelect: function(){ $input.val(''); $input.blur(); }
        });
    }, 'json' );
    $input.change(function() {
        var current = $input.typeahead("getActive");
        printDoc( current.folder, current.file, id );
    });
});

