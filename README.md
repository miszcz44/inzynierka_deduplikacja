# Data dedup app
## Dedup workflow:
### Data reading:
* Reading CSV/JSON files
* Saving raw data to database as JSONB
### Data Pre-processing:
* Normalisation (lowercasing, diacritics removal, punctuations removal) -> optional - user will be able to select each option
* Dropping exact duplicates -> mandatory
### Block builing:
* Standard blocking (group by BKV - blocking key value - selected by user columns) - user specifies BKV columns 
* Sorted Neighbourhood Approach - sorting database according to the sorting key and applying sliding window of fixed size w (w > 1) - user specifies sorting key and window size
* TBD
### Field and Record Comparison:
* Fuzzy matching - based on phonetic similarities of each column, then the score of each pair is summed up and added to each pair
* Longest Common substring comparison - scoring, for example -> longest substring from row A / length of string B
* TBD
### Classification:
* Treshold-based - ex. (80%+ -> match; 50-79% -> possible match; 0-49% -> not match) - will be able to specify the tresholds
* Cost-Based - user could specify costs/weights of important/not important columns
* TBD  
### Evaluation:
* Maybe manual review of rows with possible matches?
* Comparison of DB size before and after dedup - number of rows matched
* TBD
