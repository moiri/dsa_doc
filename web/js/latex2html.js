function Doc( $target, index_path ) {

    this.config = [];
    this.config.doc_path = "tex/";

    var that = this;
    var index = new Index( index_path );
    var parser = new Parser( index );
    parser.config.fig_folder = 'fig';
    parser.config.fig_path = that.config.doc_path
        + parser.config.fig_folder + '/';

    function createDoc( folder, file ) {
        var path = that.config.doc_path + folder + '/' + file + '.tex';
        var doc = $( '<div class="doc cont-root cont-root-0"></div>' );
        $.ajax({
            async: false,
            type: 'GET',
            url: path,
            success: function( data ) {
                data = parser.replaceNL( data );
                var lines = data.split("\n");
                var dest = doc;
                $.each( lines, function( n, line ) {
                    line = parser.removeIgnores( line );
                    line = parser.replaceNameref( line );
                    line = parser.replaceStyles( line );
                    line = parser.replaceMath( line );
                    dest = parser.appendDocLine( line, dest );
                });
            }
        });
        return doc;
    }

    this.getIndex = function() {
        return index.j_index;
    };

    this.printDoc = function( path, name ) {
        $target.html( createDoc( path, name ) );
        var backLink = '';
        var subTitle = index.getTitle( 'chap', path );
        if( subTitle != '' )
            backLink = '<a href="#" id="link-chap-' + path
                + '"> <span style="transform: scale(-1, 1)" '
                + 'class="glyphicon glyphicon-share-alt"></span></a>';
        $('.sect-subtitle').html( subTitle + backLink );
        $('a[id|="link"]').click( function( e ) {
            var path = $( this ).attr( 'id' ).split( '-' );
            that.printDoc( path[1], path[2] );
        });
    };

    this.printToc = function( $target, folder ) {
        items = index.getList( folder );
        $target = $( '<ul class="dropdown-menu"></ul>' ).appendTo( $target );
        $.each( items, function( idx, item ) {
            $( '<li><a href="#">' + item.name + '</a></li>' )
                .appendTo( $target )
                .click( function( e ) {
                    that.printDoc( item.folder, item.file );
                });
        });
    };

    this.registerSearch = function( $input ) {
        $input.typeahead({
            source: index.j_index,
            displayText: function( item ) {
                return item.name + ' (' + item.folder + ')';
            },
            afterSelect: function() {
                $input.val('');
                $input.blur();
            }
        });
        $input.change(function() {
            var current = $input.typeahead( "getActive" );
            that.printDoc( current.folder, current.file );
        });
    };
}

function Index( path ) {
    var that = this;
    this.j_index;

    this.getTitle = function( folder, file ) {
        var title = "";
        $.each( that.j_index, function( idx, item ) {
            if( ( item.file == file ) && ( item.folder == folder ) ) {
                title = item.name;
                return false;
            }
        });
        return title;
    };

    this.getList = function( folder ) {
        var list = [];
        $.each( that.j_index, function( idx, item ) {
            if( item.folder == folder ) {
                list.push( item );
            }
        })
        return list;
    };

    $.ajax({
        dataType: 'json',
        async: false,
        type: 'GET',
        url: path,
        success: function( data ) {
            that.j_index = data;
        }
    });
}

function Parser( index ) {
    var that = this;
    var regEx = [];
    regEx.chapter = /\\chapter\{([^}]+)\}/;
    regEx.section = /\\section\{([^}]+)\}/;
    regEx.input = /\\input\{([^}]+)\}/;
    regEx.ignores = /(\\label\{([^}]+)\}|\\hfill \\\\|%.*)/;
    regEx.desc_begin = /\\begin\{description}/;
    regEx.desc_end = /\\end\{description}/;
    regEx.desc_elem = /\\item[\s]?\[([^}]+)\]/;
    regEx.item_begin = /\\begin\{itemize}/;
    regEx.item_end = /\\end\{itemize}/;
    regEx.item_elem = /\\item/;
    regEx.fig_begin = /\\begin\{figure}/;
    regEx.fig_end = /\\end\{figure}/;
    regEx.nameref = /\\(name|)ref\{([^}]+)\}/g;
    regEx.style_link = /\\textStyle(M|SF)\{([^}]+)\}/g;
    regEx.style_emph = /\\textStyle(VT|AT|Ta)\{([^}]+)\}/g;
    regEx.style_bold = /\\textStyleStrongEmphasis\{([^}]+)\}/g;
    regEx.math = /\\textrm\{[\s]?\$\{(.*?)\}\$[\s]?\}/g;
    regEx.nL = /\\newline/g;
    var math = [];
    math["\\leq"] = ' &le; ';
    math["\\geq"] = ' &ge; ';
    this.config = [];
    this.config.fig_folder = 'fig';
    this.config.fig_path = that.config.fig_folder + '/';

    function appendDocText( dest, line ) {
        if( dest.hasClass( 'cont-text' ) )
            return dest.append( ' ' + line );
        else
            return createDocText( line ).appendTo( dest );
    }

    function createDocText( line ) {
        return $( '<p class="doc-text cont-text">' + line + '</p>' );
    }
    function getBaseDest( dest ) {
        return dest.closest( '.cont-root' );
    }
    function getRootDest( dest ) {
        return dest.closest( '.cont-root-0' );
    }
    function getListDest( dest ) {
        return dest.closest( '.cont-list' );
    }

    /**
     * @depricated
     */
    function getTitle( folder, file ) {
        var title = "";
        var path = __PATH + folder + '/' + file + '.tex';
        $.ajax({
            async: false,
            type: 'GET',
            url: path,
            success: function( data ) {
                var lines = data.split( "\n" );
                $.each( lines, function( n, elem ) {
                    var matches = null;
                    if( ( ( matches = regEx.chapter.exec( elem ) ) != null ) ||
                        ( ( matches = regEx.section.exec( elem ) ) != null ) ) {
                        title = matches[1];
                        return false;
                    }
                });
            }
        });
        return title;
    }

    this.appendDocLine = function( line, dest ) {
        var matches = null;
        var listElem = null;
        if( line == "" ) {
            dest = getBaseDest( dest );
            dest = createDocText( line ).appendTo( dest );
        }
        else if( ( matches = regEx.chapter.exec( line ) ) != null ) {
            dest = getRootDest( dest );
            dest.append( '<h2>' + matches[1] + '</h2>' );
        }
        else if( ( matches = regEx.section.exec( line ) ) != null ) {
            dest = getRootDest( dest );
            dest.append( '<h3>' + matches[1]
                + ' <small class="sect-subtitle"></small></h3>' );
        }
        else if( ( matches = regEx.input.exec( line ) ) != null ) {
            var ids = matches[1].split( '/' );
            var list = getListDest( dest );
            if( list.length == 0 )
                dest = $( '<ul class="list-unstyled cont-list"></ul>' ).appendTo( dest );
            else
                dest = list;
            dest.append( '<li class="list-bullet-text"><a href=# id="link-'
                + ids[0] + '-' + ids[1] + '">'
                + index.getTitle( ids[0], ids[1] ) + '</a></li>');
        }
        else if( ( matches = regEx.desc_begin.exec( line ) ) != null ) {
            dest = getBaseDest( dest );
            dest = $( '<dl class="dl-horizontal cont-list"></dl>' ).appendTo( dest );
        }
        else if( ( matches = regEx.desc_elem.exec( line ) ) != null ) {
            dest = getListDest( dest );
            dest.append('<dt>' + matches[1] + '</dt>' );
            line = line.replace( regEx.desc_elem, "" );
            dest = $( '<dd class="list-desc-text cont-root"></dd>' ).appendTo( dest );
            dest = createDocText( line ).appendTo( dest );
        }
        else if( ( matches = regEx.desc_end.exec( line ) ) != null ) {
            dest = getListDest( dest );
            dest = getBaseDest( dest );
        }
        else if( ( matches = regEx.item_begin.exec( line ) ) != null ) {
            dest = getBaseDest( dest );
            dest = $( '<ul class="list-bullet cont-list"></ul>' ).appendTo( dest );
        }
        else if( ( matches = regEx.item_elem.exec( line ) ) != null ) {
            dest = getListDest( dest );
            line = line.replace( regEx.item_elem, "" );
            dest = $( '<li class="list-bullet-text cont-root"></li>' ).appendTo( dest );
            dest = createDocText( line ).appendTo( dest );
        }
        else if( ( matches = regEx.item_end.exec( line ) ) != null ) {
            dest = getListDest( dest );
            dest = getBaseDest( dest );
        }
        else if( ( matches = regEx.fig_begin.exec( line ) ) != null ) {
            dest = $( '<div class="hidden cont-list"></div>' ).appendTo( dest );
        }
        else if( ( matches = regEx.fig_end.exec( line ) ) != null ) {
            dest = getListDest( dest );
            dest = getBaseDest( dest );
        }
        else {
            dest = appendDocText( dest, line );
        }
        return dest;
    };

    this.removeIgnores = function( line ) {
        var matches = null;
        if( ( matches = regEx.ignores.exec( line ) ) != null )
            line = line.replace( regEx.ignores, "" );
        return line;
    };

    this.replaceMath = function( line ) {
        var matches = null;
        if( ( matches = regEx.math.exec( line ) ) != null ) {
            line = line.replace( regEx.math, math[ matches[1].trim() ] );
        }
        return line;
    };

    this.replaceNameref = function( line ) {
        var matches = null;
        if( ( matches = regEx.nameref.exec( line ) ) != null )
            line = line.replace( regEx.nameref, function( regExStr, type, name ) {
                var title = '';
                var href = '#';
                var names = name.split( '.' );
                var id = 'link-' + names[0] + '-' + names[1];
                if( names[0] == that.config.fig_folder ) {
                    title = '<span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span>';
                    id = '';
                    href = that.config.fig_path + names[1] + ".pdf";
                }
                else
                    title = index.getTitle( names[0], names[1] );
                return '<a href="' + href + '" id="' + id + '">' + title + '</a>';
            } );
        return line;
    };

    this.replaceNL = function( line ) {
        var matches = null;
        if( ( matches = regEx.nL.exec( line ) ) != null ) {
            line = line.replace( regEx.nL, "\n\n" );
        }
        return line;
    };

    this.replaceStyles = function( line ) {
        var matches = null;
        if( ( matches = regEx.style_emph.exec( line ) ) != null )
            line = line.replace( regEx.style_emph,
                function( regExStr, type, name ) {
                    return '<span class="span-' + type + '">' + name + '</span>';
            } );
        if( ( matches = regEx.style_link.exec( line ) ) != null )
            line = line.replace( regEx.style_link,
                function( regExStr, type, name ) {
                    return name;
            } );
        if( ( matches = regEx.style_bold.exec( line ) ) != null )
            line = line.replace( regEx.style_bold,
                function( regExStr, name ) {
                    return '<strong>' + name + '</strong>';
            } );
        return line;
    };
}
