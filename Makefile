CWD := $(shell pwd)
BIN := node_modules/.bin
BROWSERIFY_FLAGS += -t babelify

export BROWSERIFY := $(BIN)/browserify
export BUDO := $(BIN)/budo


.PHONY: example/*
example/*: NODE_PATH="$(NODE_PATH):$(CWD)/example/"
example/*:
	$(BUDO) $@/index.js -p 3000 --dir $@ --dir public --live --verbose -- $(BROWSERIFY_FLAGS) --debug
