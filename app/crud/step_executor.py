from models.enums.step_name import StepName
from typing import List, Dict, Any
import pandas as pd
from pipeline.DataPreprocessing import DataPreprocessing
from pipeline.BlockBuilding import BlockBuilding
from pipeline.Comparison import Comparison
from pipeline.Classifier import Classifier


async def execute(file_content: List[Dict], step: StepName, parameters: Dict[str, Any],
                  block_building_data: List[Dict]):
    if step == StepName.DATA_PREPROCESSING:
        df = pd.DataFrame(file_content)

        preprocessor = DataPreprocessing(df)

        preprocessor.select_columns(['all'])

        lowercase = parameters.get("lowercase", False)
        remove_diacritics = parameters.get("removeDiacritics", False)
        remove_punctuation = parameters.get("removePunctuation", False)

        processed_data = preprocessor.apply_preprocessing(
            lowercase=lowercase,
            diacritics_removal=remove_diacritics,
            punctuation_removal=remove_punctuation
        )


        return preprocessor.dataframe_to_jsonb()
    elif step == StepName.BLOCK_BUILDING:
        df = pd.DataFrame(file_content)

        algorithm = parameters.get("algorithm")
        inputs = parameters.get("inputs", {})

        window_size = inputs.get("windowSize", 5)
        n_letters = inputs.get("nLetters", 3)
        max_window_size = inputs.get("maxWindowSize", 10)
        match_threshold = inputs.get("threshold", 0.8)

        block_builder = BlockBuilding(df, algorithm)

        if algorithm == "standardBlocking":
            blocks = block_builder.build_blocks(columns=inputs.get("columns", []))
        elif algorithm == "sortedNeighborhood":
            blocks = block_builder.build_blocks(
                columns=inputs.get("columns", []),
                window_size=window_size,
                n_letters=n_letters
            )
        elif algorithm == "dynamicSortedNeighborhood":
            blocks = block_builder.build_blocks(
                columns=inputs.get("columns", []),
                max_window_size=max_window_size,
                match_threshold=match_threshold,
                n_letters=n_letters
            )
        else:
            raise ValueError("Invalid blocking algorithm specified.")

        return block_builder.dataframe_to_jsonb()
    elif step == StepName.FIELD_AND_RECORD_COMPARISON:
        df = pd.DataFrame(file_content)

        selected_algorithms = parameters.get("selectedAlgorithms", {})
        q_value = parameters.get("qValue", 2)

        comparison = Comparison(df)

        column_algorithms = {}
        for column, algo in selected_algorithms.items():
            if column not in df.columns:
                raise ValueError(f"Column '{column}' not found in the data.")
            if algo == "Q-gram":
                column_algorithms[column] = lambda str1, str2: comparison.qgram_similarity(str1, str2, q=q_value)
            elif algo == "Levenshtein":
                column_algorithms[column] = comparison.levenshtein_similarity
            elif algo == "Jaro-Winkler":
                column_algorithms[column] = comparison.jaro_winkler_similarity
            else:
                raise ValueError(f"Unsupported algorithm '{algo}' for column '{column}'.")

        comparison_results = comparison.compare_within_blocks(column_algorithms)

        return comparison.dataframe_to_jsonb()
    elif step == StepName.CLASSIFICATION:
        blocked_data = pd.DataFrame(block_building_data)
        comparison_table = pd.DataFrame(file_content)

        classification_type = parameters.get("classificationType")

        classifier = Classifier(blocked_data=blocked_data, comparison_table=comparison_table)

        if classification_type == "cost-based":
            costs = {
                "non_match_true_match": parameters.get("costTrueMatchAsNonMatch", 1),
                "non_match_true_non_match": parameters.get("costTrueNonMatchAsNonMatch", 1),
                "match_true_match": parameters.get("costTrueMatchAsMatch", 1),
                "match_true_non_match": parameters.get("costTrueNonMatchAsMatch", 1.9)
            }
            probabilities = {
                "M": parameters.get("probabilityM", 0.74),
                "U": 1 - parameters.get("probabilityM", 0.74)
            }

            classification_results = classifier.classify_matches(
                method="cost_based",
                costs=costs,
                probabilities=probabilities
            )

        elif classification_type == "weighted-threshold":
            thresholds = {"match": parameters.get("thresholdMatch", 0.5)}
            weights = parameters.get("columnWeights", {})

            classification_results = classifier.classify_matches(
                method="weighted",
                thresholds=thresholds,
                weights=weights
            )

        elif classification_type == "threshold":
            thresholds = {
                "match": parameters.get("thresholdMatch", 0.5),
                "not_match": parameters.get("thresholdNotMatch", 0.3)
            }
            possible_match = parameters.get("possibleMatch", False)

            classification_results = classifier.classify_matches(
                method="threshold_based",
                thresholds=thresholds,
                possible_match=possible_match
            )

        else:
            raise ValueError(f"Unsupported classification type: {classification_type}")

        return classifier.dataframe_to_jsonb()
