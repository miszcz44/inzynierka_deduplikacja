import pandas as pd
import numpy as np
from fuzzywuzzy import fuzz
from jellyfish import soundex
import itertools
import json

class Comparison:
    def __init__(self, data):
        """
        Initialize the Comparison class with the data.
        :param data: pandas DataFrame containing the data to be compared.
        """
        self.data = data
        self.comparison_results = None
        self.methods = {}
        self.parameters = {}

    @staticmethod
    def levenshtein_similarity(str1, str2):
        """
        Calculate the normalized Levenshtein similarity between two strings.
        Ensures the result is between 0 and 1.
        """
        from rapidfuzz.distance import Levenshtein
        score = Levenshtein.normalized_similarity(str1, str2)
        return max(0, min(1, score))  # Ensure the value is between 0 and 1

    @staticmethod
    def jaro_winkler_similarity(str1, str2):
        """
        Calculate the normalized Jaro-Winkler similarity between two strings.
        Ensures the result is between 0 and 1.
        """
        from rapidfuzz.distance import JaroWinkler
        score = JaroWinkler.similarity(str1, str2)
        return max(0, min(1, score))  # Ensure the value is between 0 and 1

    @staticmethod
    def qgram_similarity(str1, str2, q=2):
        """
        Calculate the Q-gram similarity between two strings.
        Ensures the result is between 0 and 1.
        """

        def generate_qgrams(s, q):
            return [s[i:i + q] for i in range(len(s) - q + 1)]

        qgrams1 = generate_qgrams(str1, q)
        qgrams2 = generate_qgrams(str2, q)
        matches = sum(1 for q in qgrams1 if q in qgrams2)
        total_qgrams = len(set(qgrams1 + qgrams2))
        score = matches / total_qgrams if total_qgrams > 0 else 0
        return max(0, min(1, score))  # Ensure the value is between 0 and 1

    def compare_within_blocks(self, column_algorithms):
        """
        Compare all possible pairs within each block for specified columns.
        :param block_col: The column name containing block IDs.
        :param column_algorithms: Dictionary where keys are column names and values are comparison functions.
        :return: DataFrame with comparison results for all pairs in each block.
        """
        block_col = "block_id"
        if block_col not in self.data.columns:
            raise ValueError(f"Block column '{block_col}' not found in data.")

        for col in column_algorithms:
            if col not in self.data.columns:
                raise ValueError(f"Comparison column '{col}' not found in data.")

        # Store methods and parameters for statistics
        self.methods = list(column_algorithms.keys())
        self.parameters = {col: func.__name__ for col, func in column_algorithms.items()}

        # Store results in a list
        results = []

        # Group by block_id
        grouped = self.data.groupby(block_col)

        for block_id, group in grouped:
            # Get all possible pairs within the block
            pairs = list(itertools.combinations(group.iterrows(), 2))

            for (idx1, row1), (idx2, row2) in pairs:
                result = {
                    "block_id": block_id,
                    "row1": row1["ID"],  # Use the ID column instead of table index
                    "row2": row2["ID"],  # Use the ID column instead of table index
                }

                # Apply the specified algorithm to each column
                for col, comparison_func in column_algorithms.items():
                    result[f"{col}_similarity"] = comparison_func(row1[col], row2[col])

                results.append(result)

        self.comparison_results = pd.DataFrame(results)
        return self.comparison_results.sort_values(by=block_col).reset_index(drop=True)

    def get_comparison_results(self):
        """
        Get the comparison results.
        :return: DataFrame containing the comparison results.
        """
        if self.comparison_results is None:
            raise ValueError("No comparison results available. Run 'compare_within_blocks' first.")
        return self.comparison_results

    def used_methods(self):
        """
        Get the comparison methods used.
        :return: List of column names compared.
        """
        return self.methods

    def used_parameters(self):
        """
        Get the parameters used for the comparison methods.
        :return: Dictionary of methods and their parameters.
        """
        return self.parameters

    def dataframe_to_jsonb(self):
        """
        Convert a DataFrame to a JSONB-compatible string.
        :param dataframe: pandas DataFrame
        :return: JSON string
        """
        # Convert the DataFrame to a JSON string
        json_data = self.comparison_results.to_json(orient='records', date_format='iso')
        return json.loads(json_data)
