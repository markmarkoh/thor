
# set up the index properly
curl -XPUT 'http://localhost:9200/testing2' -d '{
  "mappings": {
    "bomb": {
      "properties": {
        "anotherField": {
          "type": "keyword",
          "fielddata": true
        }
      }
    }
  }
}'

# Do a faceted search
curl -XGET 'http://localhost:9200/testing2/bomb/_search' -d '{
  "size": 0,
  "aggs": {
    "bomb_types": {
      "terms": {
        "field": "anotherField"
      }
    }
  }
}
' | jq


# Sort data by MSNDATE (col 4) (takes a few minutes)
 sort --field-separator=',' --key=4 THOR_DATA_VIETNAM_CLEAN.csv > THOR_SORTED.csv

# split into 5 files, strip unneeded columns
head -n 1000000 THOR_SORTED.csv| cut -d, -f3,4,7,9,10,11,14,24 >  THOR_1.csv
head -n 2000000 THOR_SORTED.csv| tail -n 1000000 | cut -d, -f3,4,7,9,10,11,14,24 >  THOR_2.csv
head -n 3000000 THOR_SORTED.csv| tail -n 1000000 | cut -d, -f3,4,7,9,10,11,14,24 >  THOR_3.csv
head -n 4000000 THOR_SORTED.csv| tail -n 1000000 | cut -d, -f3,4,7,9,10,11,14,24 >  THOR_4.csv
head -n 5000000 THOR_SORTED.csv| tail -n 1000000 | cut -d, -f3,4,7,9,10,11,14,24 >  THOR_5.csv

# remove rows with missing columns
sed '/,,,/d' THOR_1.csv > THOR_1_NOEMPTY.csv
sed '/,,,/d' THOR_2.csv > THOR_2_NOEMPTY.csv
sed '/,,,/d' THOR_3.csv > THOR_3_NOEMPTY.csv
sed '/,,,/d' THOR_4.csv > THOR_4_NOEMPTY.csv
sed '/,,,/d' THOR_5.csv > THOR_5_NOEMPTY.csv

# prepend header row to files
echo -e "$(tail -n 1 THOR_1.csv )\n$(cat THOR_2_NOEMPTY.csv)" > THOR_2_NOEMPTY_HEADER.csv
echo -e "$(head -n 1 THOR_1.csv )\n$(cat THOR_2_NOEMPTY.csv)" > THOR_2_NOEMPTY_HEADER.csv
echo -e "$(head -n 1 THOR_1.csv )\n$(cat THOR_3_NOEMPTY.csv)" > THOR_3_NOEMPTY_HEADER.csv
echo -e "$(head -n 1 THOR_1.csv )\n$(cat THOR_4_NOEMPTY.csv)" > THOR_4_NOEMPTY_HEADER.csv
echo -e "$(head -n 1 THOR_1.csv )\n$(cat THOR_5_NOEMPTY.csv)" > THOR_5_NOEMPTY_HEADER.csv
