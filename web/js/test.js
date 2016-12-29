$(document).ready(function() {
    var doc = new Doc( $( '#chap' ) );
    doc.printDoc( 'chap', 'intro' );
    doc.printToc( $( '#toc-chap' ), 'chap' );
    doc.registerSearch( $( '#query' ) );
});

