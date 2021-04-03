.PHONY: build-node build-node-release debug

build-node:
	cd ./parcel_sourcemap_node && napi build --platform -c ../package.json

build-node-release:
	cd ./parcel_sourcemap_node && napi build --platform -c ../package.json --release
	