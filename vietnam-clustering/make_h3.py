import h3
import csv
import json

with open('./data.csv', newline='') as csvfile:
    line = csv.reader(csvfile, delimiter=',')
    lines = 0
    results = {}
    for row in line:
        lines += 1
        if (lines == 1):
            continue
        lat, lng = float(row[8]), float(row[9])
        hexval = h3.geo_to_h3(lat, lng, 7)
        if hexval in results:
            results[hexval] += 1
        else:
            results[hexval] = 1
    hexarr = []
    for val in results:
        # skip the 1 off in this dataset, looks to be air combat?
        count = results[val]
        if count == 1 or count > 7000:
            continue
        obj = {}
        obj['hex'] = val
        obj['count'] = count
        hexarr.append(obj)

    print(json.dumps(hexarr, indent=2))

