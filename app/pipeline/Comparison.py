import pandas as pd
import numpy as np
from fuzzywuzzy import fuzz
from jellyfish import soundex
import itertools
import json


class Comparison:
    def __init__(self, data):
        self.data = data
        self.comparison_results = None
        self.methods = {}
        self.parameters = {}

    @staticmethod
    def levenshtein_similarity(str1, str2):
        if not str1 or not str2 or pd.isna(str1) or pd.isna(str2):
            return 0
        str1 = str(str1)
        str2 = str(str2)
        from rapidfuzz.distance import Levenshtein
        score = Levenshtein.normalized_similarity(str1, str2)
        return max(0, min(1, score))

    @staticmethod
    def jaro_winkler_similarity(str1, str2):
        if not str1 or not str2 or pd.isna(str1) or pd.isna(str2):
            return 0
        str1 = str(str1)
        str2 = str(str2)
        from rapidfuzz.distance import JaroWinkler
        score = JaroWinkler.similarity(str1, str2)
        return max(0, min(1, score))

    @staticmethod
    def qgram_similarity(str1, str2, q=10):
        if not str1 or not str2 or pd.isna(str1) or pd.isna(str2):
            return 0

        def generate_qgrams(s, q):
            return [s[i:i + q] for i in range(len(s) - q + 1)]

        str1 = str(str1)
        str2 = str(str2)
        qgrams1 = generate_qgrams(str1, q)
        qgrams2 = generate_qgrams(str2, q)
        matches = sum(1 for q in qgrams1 if q in qgrams2)
        total_qgrams = len(set(qgrams1 + qgrams2))
        score = matches / total_qgrams if total_qgrams > 0 else 0
        return max(0, min(1, score))

    def compare_within_blocks(self, column_algorithms):
        block_col = "block_id"
        if block_col not in self.data.columns:
            raise ValueError(f"Block column '{block_col}' not found in data.")

        for col in column_algorithms:
            if col not in self.data.columns:
                raise ValueError(f"Comparison column '{col}' not found in data.")

        self.methods = list(column_algorithms.keys())
        self.parameters = {col: func.__name__ for col, func in column_algorithms.items()}

        results = []

        grouped = self.data.groupby(block_col)

        for block_id, group in grouped:
            pairs = list(itertools.combinations(group.iterrows(), 2))

            for (idx1, row1), (idx2, row2) in pairs:
                result = {
                    "block_id": block_id,
                    "row1": row1["ID"],
                    "row2": row2["ID"],
                }

                for col, comparison_func in column_algorithms.items():
                    result[f"{col}_similarity"] = comparison_func(row1[col], row2[col])

                results.append(result)

        self.comparison_results = pd.DataFrame(results)
        return self.comparison_results.sort_values(by=block_col).reset_index(drop=True)

    def get_comparison_results(self):
        if self.comparison_results is None:
            raise ValueError("No comparison results available. Run 'compare_within_blocks' first.")
        return self.comparison_results

    def used_methods(self):
        return self.methods

    def used_parameters(self):
        return self.parameters

    def dataframe_to_jsonb(self):
        json_data = self.comparison_results.to_json(orient='records', date_format='iso')
        return json.loads(json_data)
