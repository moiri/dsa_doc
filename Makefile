#
# Makefile for paper projects with pdflatex
# created: 04.06.2011 by SB,RK
#

PROJECT		= kampf
ADD_DEPS 	= Makefile 
EXTERNALSUPDATE = 

MAINTEXSRC	= $(PROJECT).tex
TEX_SRC		= \
		title.tex \
		chap/* \
		sf/* \
		bAT/* \
		bPA/* \

FIGDIR		= ./fig

# dot sources:
DOT_SRC		= \

# tgif figures:
OBJ_SRC		= \

# gnuplot sources:
PLOT_SRC	= \
#		$(FIGDIR)/sccp_results.gnu

PDF_SRC 	= \
#		$(FIGDIR)/sccp_results.pdf \

FIG_PDF_SRC	= \

FIG_PDFTEX_SRC  = \
#		$(FIGDIR)/prog_trans.fig \

DIA_PGFTEX_SRC  = \
#		$(FIGDIR)/fig_service_system.dia \

BITMP_PDF_SRC	= \

#==================================================================

SOURCES		= $(MAINTEXSRC) $(TEX_SRC) $(PDF_SRC)

BUILTPDF	= $(OBJSRC:.obj=.pdf) $(PLOTSRC:.gnu=.pdf) \
		  $(FIG_PDF_SRC:.fig=.pdf) \
		  $(DIA_PGFTEX_SRC:.dia=.tex) \
		  $(FIG_PDFTEX_SRC:.fig=.pdf_t) \
		  $(patsubst %.bmp,%.pdf, $(patsubst %.tiff,%.pdf, \
		  $(patsubst %.jpg,%.pdf, $(patsubst %.png,%.pdf, \
		  $(patsubst %.gif,%.pdf, $(BITMP_PDF_SRC))))))

#==================================================================

LATEX		= pdflatex
SPELLPRG	= aspell -C -t -d british -p ./aspell_personal.txt -c
##		  opts for aspell: -d deutsch british american
BITMP2PDF	= convert  #http://www.imagemagick.org/script/convert.php

#==================================================================

.SUFFIXES:
.SUFFIXES: .bbl .tex
.SUFFIXES: .pdf .aux .tex
.SUFFIXES: .pdf .fig
.SUFFIXES: .pdf_t .pstex_t .pdf .tex .fig
.SUFFIXES: .tex .dia
.SUFFIXES: .pdf .obj
.SUFFIXES: .pdf .png
.SUFFIXES: .pdf .bmp
.SUFFIXES: .pdf .gif
.SUFFIXES: .pdf .tiff
.SUFFIXES: .pdf .jpg
.SUFFIXES: .pdf .dot
.SUFFIXES: .idx .ind
.SUFFIXES: .pdf .dvi
.SUFFIXES: .pdf .gnu .dat

.gnu.pdf:
	echo "Plotting PDF file for $< ..."
	gnuplot $<

.fig.pdf_t:
	@echo "Generating PDFTEX_T file for $< ...\n"
	@printf '\\begin{picture}(0,0)%%\n' > $@
	@printf '\\includegraphics{$(@:.pdf_t=.pdf)}%%\n' >> $@
	@printf '\\end{picture}%%\n' >> $@; 
	fig2dev -L pdftex_t $< >> $@
	fig2dev -L pdftex  $< > $(@:.pdf_t=.pdf)

.fig.pdf:
	@echo "Generating PDF file for $< ..."
	fig2dev -L pdf $< > $@

.dia.tex:
	@dia --filter=pgf-tex --export=$@ $<

.jpg.pdf:
	$(BITMP2PDF) $< $@

.png.pdf:
	$(BITMP2PDF) $< $@

.gif.pdf:
	$(BITMP2PDF) $< $@

.tiff.pdf:
	$(BITMP2PDF) $< $@

.bmp.pdf:
	$(BITMP2PDF) $< $@

#==================================================================

.PHONY: all latex
all: $(PROJECT).pdf

latex: $(SOURCES) $(BUILTPDF) $(ADD_DEPS)
	$(LATEX) $(MAINTEXSRC)

$(PROJECT).aux: $(PROJECT).pdf

$(PROJECT).pdf: $(SOURCES) $(BUILTPDF) $(ADD_DEPS)
	$(LATEX) $(MAINTEXSRC)  
	$(LATEX) $(MAINTEXSRC)
	@cnt='0;'; \
	while grep -s "Rerun to get cross-references right" $(PROJECT).log ; \
	do \
		cnt=`expr $$cnt + 1`; \
		if test $$cnt -ge "3"; then echo ERROR: Too many Reruns...; \
		break; fi; \
		$(LATEX) $< ;\
	done 

#==================================================================


#==================================================================

.PHONY: spell status update commit sync count
.PHONY: work edit view help clean

spell: $(MAINTEXSRC) $(TEX_SRC)
	for i in $(MAINTEXSRC) $(TEX_SRC); do $(SPELLPRG) $$i; done

status:
	svn status

update:
	svn update

commit:
	svn commit -m "Update by $(USER)."
	for i in $(EXTERNALSUPDATE); do \
	(cd $$i && svn commit -m "Update by $(USER)."); done

sync: update commit

count: $(PROJECT).pdf
	@t=`pdftotext $< - | wc -l -w -m`; \
	tt=`pdfinfo paper.pdf | grep Pages | sed -e "s/[^0-9]*//"`; \
	echo "Statistics of \"$<\":"; \
	echo "   Text ... Lines=`echo $$t | cut -d' ' -f 1`, Words=`echo $$t | cut -d' ' -f 2`, Chars=`echo $$t | cut -d' ' -f 3`"; \
	echo "   PDF .... Pages=$$tt"

work: edit view

edit: $(MAINTEXSRC)
	open $^

view: $(PROJECT).pdf
	open $^

help:
	@echo "Supported targets:"
	@echo "  all:          create \"$(PROJECT).pdf\""
	@echo "  spell:        perform spell check"
	@echo "  svn commands: status update commit sync"
	@echo "  count:        print statistics: nr. of pages, lines, words, chars"
	@echo "  help:         print this message"
	@echo "  clean:        cleanup temporary files"

clean:
	rm -f $(PROJECT).toc
	rm -f $(PROJECT).log
	rm -f $(PROJECT).pdf
	rm -f *.aux
	rm -f $(PROJECT).bbl
	rm -f $(PROJECT).out
	rm -f $(PROJECT).blg
	rm -f $(DOTTEXSRC)
	rm -f ./*\~

#==================================================================
#
# Some predefined variables in makefile rules:
#
# $@ ... the target of the rule
# $< ... the first dependency
# $? ... all dependencies that are newer than the target
# $^ ... all dependencies (without duplicates)
# $+ ...     - " -        (with duplicates)
# $% ... used for archives
#
# $* ... used for source and target in generic rules
#        (file name without extension)
#
# $(xD),$(xF) ... the directory/file part of variable $x, where x stands
#                 for @,*,%,<,^,+,?
#
# $${X} ... reference to the shell variable $X
#

#==================================================================
#
# Some predefined functions for text manipulation:
#
# $(list:.oldext=.newext) ... renames the extension from ".oldext" into ".newext".
#                             e.g., $(<:.html=.pdf)
# $(addprefix prefix, names...) ... adds to each word the prefix "prefix".
# $(addsuffix suffix, names...) ... adds to each word the suffix "suffix".
# $(basename names...) ... extract the base name, i.e., without file extension.
# $(dir names...) ... extracts from each file the directory part.
# $(notdir names...) ... extracts from each file all but the directory part.
# $(sort list) ... sorts the entries of "list" and removes dublicate entries.
# $(suffix names...) ... extracts the last dot and remaining chars from each entry.
#
# $(shell find . -name \*.tex) ... store file names in variable
#

