window.BENCHMARK_DATA = {
  "lastUpdate": 1621849665456,
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
      }
    ]
  }
}