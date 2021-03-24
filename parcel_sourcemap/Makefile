.PHONY: generate-schema

# This isn's actually phony but the file will always exist so we only really run this for overwriting the file...
generate-schema:
	./flatc --rust -o ./src ./src/schema.fbs
