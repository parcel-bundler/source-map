.PHONY: build-node build-node-release debug

build-node:
	cd ./parcel_sourcemap_node && rm -rf artifacts && mkdir artifacts && napi build --platform -c ../package.json ./artifacts

build-node-release:
	cd ./parcel_sourcemap_node && rm -rf artifacts && mkdir artifacts && napi build --platform -c ../package.json ./artifacts --release
	