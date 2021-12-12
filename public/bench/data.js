window.BENCHMARK_DATA = {
  "lastUpdate": 1639325823582,
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
      },
      {
        "commit": {
          "author": {
            "email": "devongovett@gmail.com",
            "name": "Devon Govett",
            "username": "devongovett"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "48793a712c4063eb8be310ab972f19483f4500d1",
          "message": "Use normal arrays + rkyv for improved perf (#67)\n\n* Use normal arrays + rkyv for improved perf\r\n\r\n* Update rkyv",
          "timestamp": "2021-06-27T20:40:33+02:00",
          "tree_id": "16421e2b23ed7fc7fd397362e72724d51959de5a",
          "url": "https://github.com/parcel-bundler/source-map/commit/48793a712c4063eb8be310ab972f19483f4500d1"
        },
        "date": 1624819633692,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume vlq mappings",
            "value": 85382,
            "range": "±2.29%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "consume#consume buffer",
            "value": 211953,
            "range": "±4.83%",
            "unit": "ops/sec",
            "extra": "73 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 49619,
            "range": "±3.37%",
            "unit": "ops/sec",
            "extra": "78 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 196,
            "range": "±30.62%",
            "unit": "ops/sec",
            "extra": "34 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 304,
            "range": "±1.63%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 128,
            "range": "±99.4%",
            "unit": "ops/sec",
            "extra": "5 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 56,
            "range": "±1.14%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 4029262,
            "range": "±0.74%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 3946245,
            "range": "±1.1%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "append#addSourceMap",
            "value": 2422443,
            "range": "±0.69%",
            "unit": "ops/sec",
            "extra": "90 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "devongovett@gmail.com",
            "name": "Devon Govett",
            "username": "devongovett"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "55abc58a3ce8d0f3e14621972d016a9805da1bd4",
          "message": "Don't include project root in serialized buffers (#73)",
          "timestamp": "2021-06-28T09:21:08+02:00",
          "tree_id": "ea39e89d7e1af682eca9c4f442228d9d7e5a6a79",
          "url": "https://github.com/parcel-bundler/source-map/commit/55abc58a3ce8d0f3e14621972d016a9805da1bd4"
        },
        "date": 1624865245759,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume vlq mappings",
            "value": 82710,
            "range": "±2.61%",
            "unit": "ops/sec",
            "extra": "79 samples"
          },
          {
            "name": "consume#consume buffer",
            "value": 215361,
            "range": "±5.3%",
            "unit": "ops/sec",
            "extra": "73 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 48557,
            "range": "±3.82%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 178,
            "range": "±28.19%",
            "unit": "ops/sec",
            "extra": "30 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 301,
            "range": "±2.87%",
            "unit": "ops/sec",
            "extra": "73 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 143,
            "range": "±101.33%",
            "unit": "ops/sec",
            "extra": "5 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 62,
            "range": "±1.02%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 4030959,
            "range": "±1.01%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 4095557,
            "range": "±1.3%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "append#addSourceMap",
            "value": 2373442,
            "range": "±1.44%",
            "unit": "ops/sec",
            "extra": "80 samples"
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
          "id": "98658f989ecaa6588ea1b7b156c99fa8d316cf4c",
          "message": "Correctly handle non-ascii chars in make_relative_path (#75)\n\n* Update package version version in lockfile\r\n\r\n* Add test for non-ascii characters at the 7th position in source\r\n\r\n* Correctly handle non-ascii chars in make_relative_path",
          "timestamp": "2021-07-18T10:24:15+02:00",
          "tree_id": "71ed38c16ab262bbb96bf262cc6d1d67d82b15ac",
          "url": "https://github.com/parcel-bundler/source-map/commit/98658f989ecaa6588ea1b7b156c99fa8d316cf4c"
        },
        "date": 1626596969080,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume vlq mappings",
            "value": 80519,
            "range": "±2.2%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "consume#consume buffer",
            "value": 221221,
            "range": "±5.7%",
            "unit": "ops/sec",
            "extra": "79 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 51526,
            "range": "±4.43%",
            "unit": "ops/sec",
            "extra": "74 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 182,
            "range": "±31.27%",
            "unit": "ops/sec",
            "extra": "30 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 298,
            "range": "±1.95%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 206,
            "range": "±96.41%",
            "unit": "ops/sec",
            "extra": "5 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 89,
            "range": "±1.1%",
            "unit": "ops/sec",
            "extra": "75 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 4181956,
            "range": "±1.03%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 4013494,
            "range": "±1.07%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "append#addSourceMap",
            "value": 2344356,
            "range": "±1.62%",
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
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "04729f7e61a61362012dbf3ec3b9b0fb892051c4",
          "message": "2.0.0 rc.6 (#76)\n\n* Release v2.0.0-rc.6\r\n\r\n* (cargo-release) version 2.0.0-rc.6\r\n\r\n* (cargo-release) version 2.0.0-rc.6\r\n\r\n* (cargo-release) version 2.0.0-rc.6\r\n\r\n* fix build pipeline",
          "timestamp": "2021-07-31T14:46:55+02:00",
          "tree_id": "e407a100517b71ee10ba8f5b6df69c03c212ba9d",
          "url": "https://github.com/parcel-bundler/source-map/commit/04729f7e61a61362012dbf3ec3b9b0fb892051c4"
        },
        "date": 1627735954593,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume vlq mappings",
            "value": 90922,
            "range": "±2.55%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "consume#consume buffer",
            "value": 222876,
            "range": "±6.34%",
            "unit": "ops/sec",
            "extra": "78 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 58478,
            "range": "±3.57%",
            "unit": "ops/sec",
            "extra": "77 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 146,
            "range": "±27.49%",
            "unit": "ops/sec",
            "extra": "23 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 332,
            "range": "±0.93%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 156,
            "range": "±95.84%",
            "unit": "ops/sec",
            "extra": "5 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 68,
            "range": "±0.72%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 4558868,
            "range": "±1.7%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 4369544,
            "range": "±1.98%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "append#addSourceMap",
            "value": 2827725,
            "range": "±0.43%",
            "unit": "ops/sec",
            "extra": "98 samples"
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
          "id": "af450f9d09c176105d786b81b634719764010094",
          "message": "Build for more platform (#78)",
          "timestamp": "2021-08-18T08:38:06+02:00",
          "tree_id": "4f98f260ddb2604cf5d2544c3c742e81069a3884",
          "url": "https://github.com/parcel-bundler/source-map/commit/af450f9d09c176105d786b81b634719764010094"
        },
        "date": 1629268988725,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume vlq mappings",
            "value": 78882,
            "range": "±2.46%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "consume#consume buffer",
            "value": 206361,
            "range": "±6.27%",
            "unit": "ops/sec",
            "extra": "78 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 50399,
            "range": "±5.08%",
            "unit": "ops/sec",
            "extra": "78 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 200,
            "range": "±26.35%",
            "unit": "ops/sec",
            "extra": "34 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 282,
            "range": "±1.91%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 227,
            "range": "±90.9%",
            "unit": "ops/sec",
            "extra": "5 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 99,
            "range": "±0.61%",
            "unit": "ops/sec",
            "extra": "72 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 3818292,
            "range": "±1.76%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 3856105,
            "range": "±1.32%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "append#addSourceMap",
            "value": 2281903,
            "range": "±0.93%",
            "unit": "ops/sec",
            "extra": "94 samples"
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
          "id": "06326f06df4aeda6297016783aeac90900a099d1",
          "message": "2.0.0 rc.7 (#79)\n\n* Release v2.0.0-rc.7\r\n\r\n* (cargo-release) version 2.0.0-rc.7\r\n\r\n* (cargo-release) version 2.0.0-rc.7\r\n\r\n* (cargo-release) version 2.0.0-rc.7",
          "timestamp": "2021-08-24T18:50:20+02:00",
          "tree_id": "05cd455439bffc7c30a2ef13a75e165f84999cab",
          "url": "https://github.com/parcel-bundler/source-map/commit/06326f06df4aeda6297016783aeac90900a099d1"
        },
        "date": 1629830735625,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume buffer",
            "value": 146519,
            "range": "±11%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 55429,
            "range": "±6.3%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "consume#consume vlq mappings",
            "value": 53154,
            "range": "±14%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 452,
            "range": "±0.67%",
            "unit": "ops/sec",
            "extra": "75 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 317,
            "range": "±0.73%",
            "unit": "ops/sec",
            "extra": "75 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 111780,
            "range": "±17%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 89629,
            "range": "±20%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 44222,
            "range": "±7.4%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 42142,
            "range": "±5.2%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "append#addSourceMap",
            "value": 187,
            "range": "±0.30%",
            "unit": "ops/sec",
            "extra": "10 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "devongovett@gmail.com",
            "name": "Devon Govett",
            "username": "devongovett"
          },
          "committer": {
            "email": "devongovett@gmail.com",
            "name": "Devon Govett",
            "username": "devongovett"
          },
          "distinct": true,
          "id": "ab4806e821359286823925116bb292dfafcad1a8",
          "message": "Release v2.0.0",
          "timestamp": "2021-10-08T15:07:02-07:00",
          "tree_id": "a3349dfc1eceea094a78528d808542b7a702c987",
          "url": "https://github.com/parcel-bundler/source-map/commit/ab4806e821359286823925116bb292dfafcad1a8"
        },
        "date": 1633731066636,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume buffer",
            "value": 142104,
            "range": "±11%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 52034,
            "range": "±7.5%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "consume#consume vlq mappings",
            "value": 51926,
            "range": "±14%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 428,
            "range": "±0.71%",
            "unit": "ops/sec",
            "extra": "75 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 306,
            "range": "±1.1%",
            "unit": "ops/sec",
            "extra": "75 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 60738,
            "range": "±11%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 60008,
            "range": "±17%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 32049,
            "range": "±5.5%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 31238,
            "range": "±7.4%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "append#addSourceMap",
            "value": 205,
            "range": "±0.58%",
            "unit": "ops/sec",
            "extra": "10 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "devongovett@gmail.com",
            "name": "Devon Govett",
            "username": "devongovett"
          },
          "committer": {
            "email": "devongovett@gmail.com",
            "name": "Devon Govett",
            "username": "devongovett"
          },
          "distinct": true,
          "id": "ed75bcff5727eb598fc8e8ada158b0449f67a15f",
          "message": "(cargo-release) version 2.0.0",
          "timestamp": "2021-10-08T15:12:35-07:00",
          "tree_id": "97e4dc0fe3b61a3c3c10d24ee9f872c14e9acd7b",
          "url": "https://github.com/parcel-bundler/source-map/commit/ed75bcff5727eb598fc8e8ada158b0449f67a15f"
        },
        "date": 1633731297032,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume buffer",
            "value": 44426,
            "range": "±1.0e+2%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "consume#consume vlq mappings",
            "value": 42024,
            "range": "±17%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 41399,
            "range": "±8.3%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 433,
            "range": "±3.5%",
            "unit": "ops/sec",
            "extra": "75 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 309,
            "range": "±2.9%",
            "unit": "ops/sec",
            "extra": "75 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 75878,
            "range": "±34%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 63359,
            "range": "±28%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 22455,
            "range": "±6.4%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 21668,
            "range": "±5.9%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "append#addSourceMap",
            "value": 226,
            "range": "±5.4%",
            "unit": "ops/sec",
            "extra": "10 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "v-rr@microsoft.com",
            "name": "rancyr",
            "username": "v-rr"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "93c0627a91eebaad2592f7ccbc900fccd6101a4e",
          "message": " Update package.json to include the repository (#82)\n\nHi there!\r\nThis change adds the repository property to your package.json file(s). Having this available provides a number of benefits to security tooling. For example, it allows for greater trust by checking for signed commits, contributors to a release and validating history with the project. It also allows for comparison between the source code and the published artifact in order to detect attacks on authors during the publication process.\r\nWe validate that we're making a PR against the correct repository by comparing the metadata for the published artifact on [npmjs.com](www.npmjs.com) against the metadata in the package.json file in the repository.\r\nThis change is provided by a team at Microsoft -- we're happy to answer any questions you may have. (Members of this team include [@s-tuli](https://github.com/s-tuli), [@iarna](https://github.com/iarna), [@rancyr](https://github.com/v-rr), [@Jaydon Peng](https://github.com/v-jiepeng), [@Zhongpeng Zhou](https://github.com/v-zhzhou) and [@Jingying Gu](https://github.com/v-gjy)). If you would prefer that we not make these sorts of PRs to projects you maintain, please just say. If you'd like to learn more about what we're doing here, we've prepared a document talking about both this project and some of our other activities around supply chain security here: [microsoft/Secure-Supply-Chain](https://github.com/microsoft/Secure-Supply-Chain)\r\nThis PR provides repository metadata for the following packages:\r\n*@parcel/source-map",
          "timestamp": "2021-10-19T18:38:21+02:00",
          "tree_id": "f8485ae42b0b5c269d1e5f43ba9ca030898b2804",
          "url": "https://github.com/parcel-bundler/source-map/commit/93c0627a91eebaad2592f7ccbc900fccd6101a4e"
        },
        "date": 1634661621158,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume buffer",
            "value": 126155,
            "range": "±8.9%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 45897,
            "range": "±5.7%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "consume#consume vlq mappings",
            "value": 45033,
            "range": "±13%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 414,
            "range": "±0.85%",
            "unit": "ops/sec",
            "extra": "75 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 291,
            "range": "±1.6%",
            "unit": "ops/sec",
            "extra": "75 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 105143,
            "range": "±17%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 99950,
            "range": "±25%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 38577,
            "range": "±6.8%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 36065,
            "range": "±6.5%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "append#addSourceMap",
            "value": 176,
            "range": "±1.4%",
            "unit": "ops/sec",
            "extra": "10 samples"
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
          "id": "27def14b6db5350572fd537e4f035febbd466a34",
          "message": "fix: Properly remap source_content to source_index (#87)",
          "timestamp": "2021-12-12T17:14:54+01:00",
          "tree_id": "683c6a7c2cc8727fd182b5ff06ab26f6b8bb495b",
          "url": "https://github.com/parcel-bundler/source-map/commit/27def14b6db5350572fd537e4f035febbd466a34"
        },
        "date": 1639325822775,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "consume#consume buffer",
            "value": 56009,
            "range": "±1.2e+2%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "consume#consume vlq mappings",
            "value": 54404,
            "range": "±14%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "consume#consume JS Mappings",
            "value": 53737,
            "range": "±6.1%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "serialize#Save buffer",
            "value": 413,
            "range": "±1.1%",
            "unit": "ops/sec",
            "extra": "75 samples"
          },
          {
            "name": "serialize#Serialize to vlq",
            "value": 321,
            "range": "±1.2%",
            "unit": "ops/sec",
            "extra": "75 samples"
          },
          {
            "name": "modify#negative column offset",
            "value": 99959,
            "range": "±17%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "modify#positive column offset",
            "value": 90309,
            "range": "±23%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "modify#positive line offset",
            "value": 40427,
            "range": "±7.0%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "modify#negative line offset",
            "value": 38988,
            "range": "±6.5%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "append#addSourceMap",
            "value": 200,
            "range": "±0.44%",
            "unit": "ops/sec",
            "extra": "10 samples"
          }
        ]
      }
    ]
  }
}