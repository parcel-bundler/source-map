window.BENCHMARK_DATA = {
  "lastUpdate": 1624818970253,
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
      },
      {
        "commit": {
          "author": {
            "email": "lynweklm@gmail.com",
            "name": "LongYinan",
            "username": "Brooooooklyn"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d0ff1e03ca5781a28d8ceb6263b7f7b156902eaa",
          "message": "Upgrade to latest napi, accept cargo clippy suggestions (#66)\n\n* Upgrade to latest napi\r\n\r\n* Accept cargo clippy suggestions, add clippy check in CI",
          "timestamp": "2021-05-25T08:55:59+02:00",
          "tree_id": "5befd47568649ff19f462971aa521f30ffe18994",
          "url": "https://github.com/parcel-bundler/source-map/commit/d0ff1e03ca5781a28d8ceb6263b7f7b156902eaa"
        },
        "date": 1621926016945,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume vlq mappings",
            "value": 60938,
            "range": "±1.58%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "consume#consume buffer",
            "value": 96265,
            "range": "±2.42%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 44930,
            "range": "±5.24%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 210,
            "range": "±25.33%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 262,
            "range": "±1.81%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 93510,
            "range": "±1.07%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 92707,
            "range": "±0.69%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 3951140,
            "range": "±0.88%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 3961049,
            "range": "±1%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "append#addSourceMap",
            "value": 2378921,
            "range": "±0.98%",
            "unit": "ops/sec",
            "extra": "92 samples"
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
          "id": "32401c9eb98abdd12f6aba21c6be2d18856901e7",
          "message": "Release 2.0.0-rc.4 (#64)\n\n* Release v2.0.0-rc.3\r\n\r\n* (cargo-release) version 2.0.0-rc.3\r\n\r\n* (cargo-release) version 2.0.0-rc.3\r\n\r\n* (cargo-release) version 2.0.0-rc.3\r\n\r\n* actually fail on failed build\r\n\r\n* apple silicon, seperate workflow\r\n\r\n* Release v2.0.0-rc.4\r\n\r\n* update cargo file\r\n\r\n* (cargo-release) version 2.0.0-rc.4\r\n\r\n* (cargo-release) version 2.0.0-rc.4\r\n\r\n* (cargo-release) version 2.0.0-rc.4\r\n\r\n* remove toolchain on apple silicon workflow\r\n\r\n* update napi",
          "timestamp": "2021-05-30T12:55:19+02:00",
          "tree_id": "ceb5b3e54d75ffc564a35b129c98380bdc28ffd1",
          "url": "https://github.com/parcel-bundler/source-map/commit/32401c9eb98abdd12f6aba21c6be2d18856901e7"
        },
        "date": 1622372376439,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume vlq mappings",
            "value": 68299,
            "range": "±1.59%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "consume#consume buffer",
            "value": 106097,
            "range": "±3.44%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 43127,
            "range": "±9.56%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 175,
            "range": "±36.14%",
            "unit": "ops/sec",
            "extra": "34 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 268,
            "range": "±1.06%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 92899,
            "range": "±1.96%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 97061,
            "range": "±0.98%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 4471872,
            "range": "±0.94%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 4433321,
            "range": "±1.18%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "append#addSourceMap",
            "value": 2808533,
            "range": "±1.11%",
            "unit": "ops/sec",
            "extra": "88 samples"
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
          "id": "3f57cef5503340d7c7aff159360c4551f499c0e8",
          "message": "Set macOS deployment target (#72)",
          "timestamp": "2021-06-27T20:31:28+02:00",
          "tree_id": "5d4186dad6745c0b271455c021073cb14e8914bc",
          "url": "https://github.com/parcel-bundler/source-map/commit/3f57cef5503340d7c7aff159360c4551f499c0e8"
        },
        "date": 1624818969349,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume vlq mappings",
            "value": 64293,
            "range": "±2.17%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "consume#consume buffer",
            "value": 96720,
            "range": "±3.6%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 45228,
            "range": "±3.38%",
            "unit": "ops/sec",
            "extra": "79 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 180,
            "range": "±36.22%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 267,
            "range": "±1.59%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 84053,
            "range": "±1.35%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 85713,
            "range": "±1.21%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 4159712,
            "range": "±0.84%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 4152329,
            "range": "±0.7%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "append#addSourceMap",
            "value": 2503676,
            "range": "±0.63%",
            "unit": "ops/sec",
            "extra": "91 samples"
          }
        ]
      }
    ]
  }
}