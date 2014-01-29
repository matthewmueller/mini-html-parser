
build: components index.js
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

dist: components dist-build dist-minify

dist-build:
	@component build -s mini-html-parser -o dist -n mini-html-parser

dist-minify: dist/mini-html-parser.js
	@curl -s \
		-d compilation_level=SIMPLE_OPTIMIZATIONS \
		-d output_format=text \
		-d output_info=compiled_code \
		--data-urlencode "js_code@$<" \
		http://closure-compiler.appspot.com/compile \
		> $<.tmp
	@mv $<.tmp dist/mini-html-parser.min.js

.PHONY: clean
