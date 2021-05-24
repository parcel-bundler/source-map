window.BENCHMARK_DATA = {
  "lastUpdate": 1621894334457,
  "repoUrl": "https://github.com/parcel-bundler/source-map",
  "entries": {
    "Parcel sourcemap benchmark": [
      {
        "commit": {
          "author": {
            "email": "jasperdemoor@gmail.com",
            "name": "Jasper De Moor",
            "username": "DeMoorJasper"
          },
          "committer": {
            "email": "jasperdemoor@gmail.com",
            "name": "Jasper De Moor",
            "username": "DeMoorJasper"
          },
          "distinct": true,
          "id": "377888599e8a99893ef2e5ea3040ca51d5289086",
          "message": "benchmark action is just outdated...",
          "timestamp": "2021-05-24T11:34:33+02:00",
          "tree_id": "3ea54c056a2152ce2dfcde422ade07be367eba92",
          "url": "https://github.com/parcel-bundler/source-map/commit/377888599e8a99893ef2e5ea3040ca51d5289086"
        },
        "date": 1621849150752,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume vlq mappings",
            "value": 62053,
            "range": "±1.74%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "consume#consume buffer",
            "value": 96228,
            "range": "±3.03%",
            "unit": "ops/sec",
            "extra": "79 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 44165,
            "range": "±3.01%",
            "unit": "ops/sec",
            "extra": "80 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 195,
            "range": "±28.48%",
            "unit": "ops/sec",
            "extra": "35 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 296,
            "range": "±1.86%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 101609,
            "range": "±1.46%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 104076,
            "range": "±1.29%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 3972106,
            "range": "±0.94%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 3985045,
            "range": "±1.1%",
            "unit": "ops/sec",
            "extra": "87 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "jasperdemoor@gmail.com",
            "name": "Jasper De Moor",
            "username": "DeMoorJasper"
          },
          "committer": {
            "email": "jasperdemoor@gmail.com",
            "name": "Jasper De Moor",
            "username": "DeMoorJasper"
          },
          "distinct": true,
          "id": "b8518743c4ddac08499acbca06bb35641ab7c5db",
          "message": "trigger new benchmark",
          "timestamp": "2021-05-24T11:42:56+02:00",
          "tree_id": "902d49ef2e3780a3e9f05392c143c526a1739584",
          "url": "https://github.com/parcel-bundler/source-map/commit/b8518743c4ddac08499acbca06bb35641ab7c5db"
        },
        "date": 1621849663957,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume vlq mappings",
            "value": 59862,
            "range": "±1.71%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "consume#consume buffer",
            "value": 90624,
            "range": "±2.5%",
            "unit": "ops/sec",
            "extra": "80 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 40773,
            "range": "±3.94%",
            "unit": "ops/sec",
            "extra": "77 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 278,
            "range": "±16.47%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 263,
            "range": "±6.58%",
            "unit": "ops/sec",
            "extra": "78 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 93215,
            "range": "±1.37%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 92218,
            "range": "±0.95%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 3678949,
            "range": "±1.24%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 3681396,
            "range": "±1.39%",
            "unit": "ops/sec",
            "extra": "88 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "jasperdemoor@gmail.com",
            "name": "Jasper De Moor",
            "username": "DeMoorJasper"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a7898c4a52721832b1c3ac131ce7fafff4764ff1",
          "message": "Use gh-pages for benchmark results (#62)\n\n* use gh-pages for benchmark\r\n\r\n* remove node_modules cache for now\r\n\r\n* rename github_token to github-token\r\n\r\n* tweak benchmark script\r\n\r\n* use public/bench\r\n\r\n* add deploy pages\r\n\r\n* fix deploy?\r\n\r\n* update name\r\n\r\n* benchmark action is just outdated...\r\n\r\n* trigger new benchmark\r\n\r\n* only push on master\r\n\r\n* fix merge issues",
          "timestamp": "2021-05-24T20:11:11+02:00",
          "tree_id": "de5941f89eae74a5a283426c87468f8b023c823d",
          "url": "https://github.com/parcel-bundler/source-map/commit/a7898c4a52721832b1c3ac131ce7fafff4764ff1"
        },
        "date": 1621880134653,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume vlq mappings",
            "value": 75772,
            "range": "±1.75%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "consume#consume buffer",
            "value": 112139,
            "range": "±3.19%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 38526,
            "range": "±26.6%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 222,
            "range": "±28.99%",
            "unit": "ops/sec",
            "extra": "38 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 328,
            "range": "±0.83%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 105444,
            "range": "±1.58%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 106707,
            "range": "±0.69%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 5338946,
            "range": "±0.52%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 5364125,
            "range": "±0.75%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "append#addSourceMap",
            "value": 3249939,
            "range": "±0.49%",
            "unit": "ops/sec",
            "extra": "96 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "4586894+mischnic@users.noreply.github.com",
            "name": "Niklas Mischkulnig",
            "username": "mischnic"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "eeaf8bdae41766956bfd0154dffdcf404431faa8",
          "message": "Fixup wasm loading in the browser (#65)\n\n* Fixup wasm loading in the browser\r\n\r\n* Test wasm build\r\n\r\n* Move wasm testing into separate job",
          "timestamp": "2021-05-25T00:07:33+02:00",
          "tree_id": "283df7a5ee78dae76807077f44851c2e5275d661",
          "url": "https://github.com/parcel-bundler/source-map/commit/eeaf8bdae41766956bfd0154dffdcf404431faa8"
        },
        "date": 1621894333539,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume vlq mappings",
            "value": 60156,
            "range": "±1.34%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "consume#consume buffer",
            "value": 90446,
            "range": "±2.58%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 42376,
            "range": "±4.3%",
            "unit": "ops/sec",
            "extra": "80 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 218,
            "range": "±28.33%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 245,
            "range": "±4.66%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 76257,
            "range": "±1.12%",
            "unit": "ops/sec",
            "extra": "79 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 75026,
            "range": "±1.08%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 3254218,
            "range": "±0.85%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 3245525,
            "range": "±1.08%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "append#addSourceMap",
            "value": 2171568,
            "range": "±0.99%",
            "unit": "ops/sec",
            "extra": "88 samples"
          }
        ]
      }
    ]
  }
}