function Doc( $target ) {

    this.config = [];
    this.config.doc_path = "tex/";
    this.config.index_path = "index.json";

    var that = this;
    var index = new Index( that.config.index_path );
    var parser = new Parser( index );
    parser.config.fig_folder = 'fig';
    parser.config.fig_path = that.config.doc_path + that.config.fig_older + '/';

    function createDoc( folder, file ) {
        var path = that.config.doc_path + folder + '/' + file + '.tex';
        var doc = $( '<div class="doc cont-root"></div>' );
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
    regEx.ignores = /(\\label\{([^}]+)\}|\\hfill \\\\|%.+)/;
    regEx.desc = /\\begin\{description}/;
    regEx.endDesc = /\\end\{description}/;
    regEx.item = /\\item[\s]?\[([^}]+)\]/;
    regEx.bullet = /\\begin\{itemize}/;
    regEx.endBullet = /\\end\{itemize}/;
    regEx.fig = /\\begin\{figure}/;
    regEx.endFig = /\\end\{figure}/;
    regEx.itemBullet = /\\item/;
    regEx.nameref = /\\(name|)ref\{([^}]+)\}/g;
    regEx.styleLink = /\\textStyle(M|SF)\{([^}]+)\}/g;
    regEx.style = /\\textStyle(VT|AT|Ta)\{([^}]+)\}/g;
    regEx.styleBold = /\\textStyleStrongEmphasis\{([^}]+)\}/g;
    regEx.math = /\\textrm\{[\s]?\$\{(.*?)\}\$[\s]?\}/g;
    regEx.nL = /\\newline/g;
    var math = [];
    math["\\leq"] = ' &le; ';
    math["\\geq"] = ' &ge; ';
    this.config = [];
    this.config.fig_folder = 'fig';
    this.config.fig_path = that.config.fig_older + '/';

    function createDocText( dest ) {
        return $('<p class="doc-text cont-text"></p>').appendTo( dest );
    }

    function getParentRootDest( dest, exclusive ) {
        if( exclusive === undefined ) exclusive = false;
        while( exclusive && dest.hasClass( 'cont-text' ) )
            dest = dest.parent();
        if( !dest.hasClass( 'cont-root' ) )
            dest = dest.parents( '.cont-root' ).first();
        return dest;
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
        if( ( matches = regEx.chapter.exec( line ) ) != null ) {
            dest = getParentRootDest( dest );
            dest.append( '<h2>' + matches[1] + '</h2>' );
            dest = createDocText( dest );
        }
        else if( ( matches = regEx.section.exec( line ) ) != null ) {
            dest = getParentRootDest( dest );
            dest.append( '<h3>' + matches[1]
                + ' <small class="sect-subtitle"></small></h3>' );
            dest = createDocText( dest );
        }
        else if( ( matches = regEx.input.exec( line ) ) != null ) {
            dest = getParentRootDest( dest );
            var ids = matches[1].split( '/' );
            dest.append( '<a href=# id="link-' + ids[0] + '-' + ids[1] + '">'
                + index.getTitle( ids[0], ids[1] ) + '</a>' );
            dest = createDocText( dest );
        }
        else if( ( matches = regEx.desc.exec( line ) ) != null ) {
            dest = getParentRootDest( dest );
            dest = $( '<dl class="dl-horizontal cont-root"></dl>' )
                .appendTo( dest );
        }
        else if( ( matches = regEx.item.exec( line ) ) != null ) {
            dest = getParentRootDest( dest, true );
            dest.append('<dt>' + matches[1] + '</dt>' );
            line = line.replace( regEx.item, "" );
            dest = $( '<dd class="list-desc-text cont-text cont-root">' + line
                + '</dd>' ).appendTo( dest );
        }
        else if( ( matches = regEx.endDesc.exec( line ) ) != null ) {
            dest = dest.parent().parent();
        }
        else if( ( matches = regEx.bullet.exec( line ) ) != null ) {
            dest = getParentRootDest( dest );
            dest = $( '<ul class="list-bullet cont-root"></ul>' )
                .appendTo( dest );
        }
        else if( ( matches = regEx.itemBullet.exec( line ) ) != null ) {
            dest = getParentRootDest( dest, true );
            line = line.replace( regEx.itemBullet, "" );
            dest = $( '<li class="list-bullet-text cont-text cont-root">' + line
                + '</li>' ).appendTo( dest );
        }
        else if( ( matches = regEx.endBullet.exec( line ) ) != null ) {
            dest = dest.parent().parent();
        }
        else if( ( matches = regEx.fig.exec( line ) ) != null ) {
            dest = $( '<div class="hidden"></div>' ).appendTo( dest );
        }
        else if( ( matches = regEx.endFig.exec( line ) ) != null ) {
            dest = dest.parent()
        }
        else if( dest.hasClass( 'cont-text' ) ) {
            if( line === "" ) {
                dest = getParentRootDest( dest );
                dest = createDocText( dest );
            }
            dest.append( ' ' + line );
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
        if( ( matches = regEx.style.exec( line ) ) != null )
            line = line.replace( regEx.style,
                function( regExStr, type, name ) {
                    return '<span class="span-' + type + '">' + name + '</span>';
            } );
        if( ( matches = regEx.styleLink.exec( line ) ) != null )
            line = line.replace( regEx.styleLink,
                function( regExStr, type, name ) {
                    return name;
            } );
        if( ( matches = regEx.styleBold.exec( line ) ) != null )
            line = line.replace( regEx.styleBold,
                function( regExStr, name ) {
                    return '<strong>' + name + '</strong>';
            } );
        return line;
    };
}
