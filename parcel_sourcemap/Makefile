.PHONY: generate-schema test

# This isn's actually phony but the file will always exist so we only really run this for overwriting the file...
generate-schema:
	./flatc --rust -o ./src ./src/schema.fbs

test:
	cargo test  -- --nocapture
