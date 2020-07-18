import h3
import csv
import json

with open('./data.csv', newline='') as csvfile:
    line = csv.reader(csvfile, delimiter=',')
    lines = 0
    results = {}
    resultshigherres = {}
    resultshighestres = {}
    for row in line:
        lines += 1
        if (lines == 1):
            continue
        lat, lng = float(row[8]), float(row[9])
        #hexval = h3.geo_to_h3(lat, lng, 2)
        hexval2 = h3.geo_to_h3(lat, lng, 7)
        #hexval3 = h3.geo_to_h3(lat, lng, 10)
        #if hexval in results:
            #results[hexval].count += 1
        #else:
            #results[hexval] = {}
            #results[hexval]['count'] = 1
        if hexval2 in resultshigherres:
            resultshigherres[hexval2] += 1
#            if resultshigherres[hexval2] > 6000:
#                    print(row)
        else:
            resultshigherres[hexval2] = 1
        #if hexval3 in resultshighestres:
            #resultshighestres[hexval3].count += 1
        #else:
            #resultshighestres[hexval3]['count'] = 1
    #print(len(results))
    #print(len(resultshigherres))
    #print(len(resultshighestres))
    #ok = {k: v for k, v in sorted(resultshigherres.items(), key=lambda item: item[1])}
    hexarr = []
    for val in resultshigherres:
        # skip the 1 offs
        count = resultshigherres[val]
        if count == 1 or count > 7000:
            continue
        obj = {}
        obj['hex'] = val
        obj['count'] = count
        hexarr.append(obj)

    print(json.dumps(hexarr, indent=2))

