# Data dedup app
## Dedup workflow:
### Data reading:
* Reading CSV/JSON files
* Saving raw data to database as JSONB
### Data Pre-processing:
* Normalisation (lowercasing, diacritics removal, punctuations removal)
* Dropping exact duplicates
### Block builing:
* Standard blocking (group by BKV - blocking key value - selected by user columns)
* Sorted Neighbourhood Approach - sorting database according to the sorting key and applying sliding window of fixed size w (w > 1)
* TBD
### Field and Record Comparison:
* Fuzzy matching - based on phonetic similarities of each column, then the score of each pair is summed up and added to each pair
* Longest Common substring comparison?
* TBD
### Classification:
* Treshold-based - ex. (80%+ -> match; 50-79% -> possible match; 0-49% -> not match)
* Cost-Based
* TBD  
### Evaluation:
* Maybe manual review of rows with possible matches?
* Comparison of DB size before and after dedup - number of rows matched
* TBD
