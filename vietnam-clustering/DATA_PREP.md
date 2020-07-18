  749  awk -F, '$12 != 0 {print}' vietnam_1968_1.csv > filtered.csv
  750  csvhead filtered.csv
  758  awk -F, '$12 != 0 {print}' thor_data_vietnam.csv > filtered_weapon_drops.csv
  760  csvhead filtered_weapon_drops.csv
  761  grep "PASSENGERS" filtered_weapon_drops.csv| csvhead
  763  awk -F, '$12 != 0 {print}' filtered_weapon_drops.csv| wc -l
  764  awk -F, '$14 != "PASSENGERS" {print}' filtered_weapon_drops.csv| wc -l
  765  grep "PASSENGERS" filtered_weapon_drops.csv | wc -l
  766  awk -F, '$14 != "PASSENGERS" {print}' filtered_weapon_drops.csv > filtered_WeaponDrops_NoPassengers.csv
  767  csv filtered_WeaponDrops_NoPassengers.csv
  768  csvhead filtered_WeaponDrops_NoPassengers.csv
  780  csvhead filtered_WeaponDrops_NoPassengers.csv
  781  awk -F, '$40 == "KINETIC" {print}' filtered_WeaponDrops_NoPassengers.csv| wc -l
  782  awk -F, '$40 == "KINETIC" {print}' filtered_WeaponDrops_NoPassengers.csv > filtered_Kinetic_WeaponDrops.csv
  784  csvhead filtered_WeaponDrops_NoPassengers.csv
  786  csvhead filtered_Kinetic_WeaponDrops.csv
  788  head filtered_WeaponDrops_NoPassengers.csv
  789  head filtered_Kinetic_WeaponDrops.csv
  790  awk -F, '$40 != "NONKINETIC" {print}' filtered_WeaponDrops_NoPassengers.csv| wc -l
  792  csvhead filtered_Kinetic_WeaponDrops.csv
  797  vim filtered_WeaponDrops_NoPassengers.csv
  798  rm filtered_Kinetic_WeaponDrops.csv
  799  awk -F, '$40 != "NONKINETIC" {print}' filtered_WeaponDrops_NoPassengers.csv > filtered_Kinetic_WeaponDrops.csv
  801  csvhead filtered_Kinetic_WeaponDrops.csv
  803  wc -l filtered_Kinetic_WeaponDrops.csv
  804  csvhead filtered_Kinetic_WeaponDrops.csv
  805  awk -F, '$9 != "" {print}' filtered_Kinetic_WeaponDrops.csv
  806  awk -F, '$9 == "" {print}' filtered_Kinetic_WeaponDrops.csv
  807  awk -F, '$9 != "" {print}' filtered_Kinetic_WeaponDrops.csv > filtered_HasGeo_Kinetic_WeaponDrops.csv
  809  csvhead filtered_HasGeo_Kinetic_WeaponDrops.csv
  811  csvhead filtered_HasGeo_Kinetic_WeaponDrops.csv
  821  cut -d, -f8,9 < filtered_HasGeo_Kinetic_WeaponDrops.csv
  822  cut -d, -f9,10 < filtered_HasGeo_Kinetic_WeaponDrops.csv
  823  cut -d, -f9,10 < filtered_HasGeo_Kinetic_WeaponDrops.csv > cut.csv
  833  history | grep filtered
