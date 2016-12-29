$(document).ready(function() {
    var doc = new Doc( $( '#chap' ), $( '#query' ), 'index.json' );
    doc.printDoc( 'chap', 'intro' );
    $('[id|="toc"]').click( function( e ) {
        var path = $( this ).attr( 'id' ).split( '-' );
        doc.printDoc( path[1], path[2] );
    });
});

