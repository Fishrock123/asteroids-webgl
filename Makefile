
build:
	@echo "running browserify for app"

	@mkdir -p build/dev

	@cp web/index.css build/dev/index.css
	@cp web/index.html build/dev/index.html

	@-rm -f web/index.js.tmp-browserify-*
	@NODE_ENV=dev time node_modules/.bin/browserify \
		src/app.js \
		--transform [ babelify --plugins [ styled-components ] ] \
		--transform brfs \
		--outfile build/dev/index.js \
		--debug

	@echo "Asteroids WebGL has been rebuilt as dev."

build-release:
	@mkdir -p build/release

	@cp web/index.css build/release/index.css
	@cp web/index.html build/release/index.html

	@echo "running release browserify for app"

	@-rm -f web/index.js.tmp-browserify-*
	@NODE_ENV=production time node_modules/.bin/browserify \
		src/app.js \
		--transform [ babelify --plugins [ styled-components ] ] \
		--transform brfs \
		--outfile build/release/index.js

	@# @-rm -f build/release/index.js.gz
	@#
	@# @# -9 is equivalent to --best
	@# @gzip -v -9 build/release/index.js
	@#
	@# @sed -ie "s/index\.js/index\.js\.gz/g" build/release/index.html

	@echo "Asteroids WebGL has been rebuilt as release."

watchify:
	make build-watchify & make serve-watchify

serve-watchify:
	@echo "serveing web/*"

	@cd build/dev
	node_modules/.bin/live-server \
		--open=build/dev \
		--watch=build/dev

build-watchify:
	@echo "running watchify for app"

	@mkdir -p build/dev

	@cp web/index.css build/dev/index.css
	@cp web/index.html build/dev/index.html

	@-rm -f web/index.js.tmp-browserify-*
	@NODE_ENV=dev time node_modules/.bin/watchify \
		src/app.js \
		--transform [ babelify --plugins [ styled-components ] ] \
		--transform brfs \
		--outfile build/dev/index.js \
		--debug \
		--verbose

confirm:
	@echo "Are you sure? [y/N] " && read ans && [ $${ans:-N} = y ]

release: build-release confirm
	@echo "Making zip archive"

	@zip -9 build/release/Asteroids.zip \
		build/release/index.html \
		build/release/index.css \
		build/release/index.js

	@echo "Uploading to itch.io"

	@butler push build/release/Asteroids.zip fishrock/asteroids:html5

lint:
	node_modules/.bin/standard

clean:
	@rm -rf node_modules
	@rm -rf build

gitclean: confirm
	git clean -fdx

.PHONY: build build-release watchify confirm release lint clean gitclean
