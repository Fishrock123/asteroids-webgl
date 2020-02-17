
build:
	@echo "running browserify for app"

	@mkdir -p build/dev

	@cp web/index.css build/dev/index.css
	@cp web/index.html build/dev/index.html
	@cp -r web/fonts build/dev/fonts

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
	@cp -r web/fonts build/release/fonts

	@echo "running release browserify for app"

	@-rm -f web/index.js.tmp-browserify-*
	@NODE_ENV=production time node_modules/.bin/browserify \
		src/app.js \
		--transform [ babelify --plugins [ styled-components ] ] \
		--transform brfs \
		--outfile build/release/index.js

	@echo "Asteroids WebGL has been rebuilt as release."

watchify:
	make build-watchify & make serve-watchify

serve-watchify:
	@echo "serving build/dev/*"

	@mkdir -p build/dev

	@cd build/dev
	node_modules/.bin/live-server \
		--open=build/dev \
		--watch=build/dev

build-watchify:
	@echo "running watchify for app"

	@mkdir -p build/dev

	@cp web/index.css build/dev/index.css
	@cp web/index.html build/dev/index.html
	@cp -r web/fonts build/dev/fonts

	@-rm -f web/index.js.tmp-browserify-*
	@NODE_ENV=dev time node_modules/.bin/watchify \
		src/app.js \
		--transform [ babelify --plugins [ styled-components ] ] \
		--transform brfs \
		--outfile build/dev/index.js \
		--debug \
		--verbose

release-compress:
	@echo "Making zip archive"

	@zip -9r build/release/Asteroids.zip \
		build/release/fonts \
		build/release/index.html \
		build/release/index.css \
		build/release/index.js

confirm:
	@echo "Are you sure? [y/N] " && read ans && [ $${ans:-N} = y ]

release: clean build-release release-compress confirm
	@echo "Uploading to itch.io"

	@butler push build/release/Asteroids.zip fishrock/asteroids:html5

lint:
	node_modules/.bin/standard

clean:
	@echo "Cleaning build"

	@rm -rf build

gitclean: confirm
	git clean -fdx

.PHONY: build build-release watchify release-compress confirm release lint clean gitclean
