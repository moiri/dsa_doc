$(document).ready(function() {
    var doc = new Doc( $( '#chap', 'index.json' ) );
    doc.printDoc( 'chap', 'intro' );
    doc.printToc( $( '#toc-chap' ), 'chap' );
    doc.registerSearch( $( '#query' ) );
    $('#toc-chap-intro').click( function( e ) {
        doc.printDoc( 'chap', 'intro' );
    });
});

