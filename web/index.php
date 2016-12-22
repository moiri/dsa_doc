<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<title>DSA Doc</title>
<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
<meta name="DC.creator" content="Simon Maurer" />
<meta name="DC.contributor" content="Ulisses Spiele" />
<meta name="DC.title" content="DSA Doc" />
<meta name="DC.date" content="2016-07-12" />
<meta name="DC.language" content="en" />
<link rel="stylesheet" type="text/css" href="plugin/bootstrap/css/bootstrap.min.css" />
<link rel="stylesheet" type="text/css" href="plugin/bootstrap/css/bootstrap-theme.min.css" />
<script src="plugin/jquery/jquery.js" type="text/javascript"></script>
<script src="plugin/bootstrap/js/bootstrap.min.js" type="text/javascript"></script>
<script src="plugin/bootstrap/js/bootstrap3-typeahead.min.js" type="text/javascript"></script>
<script src="js/latex2html.js" type="text/javascript"></script>
<script src="js/test.js" type="text/javascript"></script>
</head>
<body>
<div class="container">
    <div class="jumbotron">
        <h1>Kampfregeln - kurz skizziert</h1>
        <p>Alternative Kampfregeln, inspiriert durch <a href="http://www.wiki-aventurica.de/wiki/QVAT">QVAT</a> aus längst vergangen DSA 3.0 Zeiten (<a href="app-doc/kampf.pdf">PDF</a>).</p>
        <p>Typos und Inhaltliche Fehler bitte <a href="https://github.com/moiri/dsa_doc/issues">hier</a> erfassen.</p>
    </div>
    <div class="panel panel-default"><div class="panel-body">
        <nav class="navbar navbar-default">
            <div class="container-fluid">
                <!-- Brand and toggle get grouped for better mobile display -->
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a id="toc-chap-intro" class="navbar-brand" href="#">
                        <span class="glyphicon glyphicon-home" aria-hidden="true"></span>
                    </a>
                </div>
                <!-- Collect the nav links, forms, and other content for toggling -->
                <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                    <ul class="nav navbar-nav">
<?php
$string = file_get_contents( "index.json" );
$json_a = json_decode( $string, true );
foreach( $json_a as $chap ) {
    echo '
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">'.$chap["title"].'<span class="caret"></span></a>
                            <ul class="dropdown-menu">';
    foreach( $chap['items'] as $item ) {
        echo '
                                <li><a href="#doc-item" id="toc-'.$chap['folder'].'-'.$item['file'].'">'.$item['name'].'</a></li>';
    }
    echo '
                            </ul>
                        </li>';
}
?>
                    </ul>
                    <form class="navbar-form navbar-right">
                        <div class="form-group">
                            <input id="query" type="text" class="form-control" placeholder="Search" data-provide="typeahead" autocomplete="off">
                        </div>
                    </form>
                </div><!-- /.navbar-collapse -->
            </div><!-- /.container-fluid -->
        </nav>
        <div class="" id="chap"><a name="doc-item"></a></div>
    </div></div>
</div>
</body>
</html>
