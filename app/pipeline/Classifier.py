import pandas as pd
import numpy as np
import json


class Classifier:
    def __init__(self, blocked_data, comparison_table):
        self.blocked_data = blocked_data
        self.comparison_table = comparison_table
        self.classification_results = None  # To store classification results

    def classify_matches(self, method='threshold_based', thresholds=None, weights=None, possible_match=False,
                         costs=None, probabilities=None):

        self.method = method
        self.parameters = {
            'thresholds': thresholds,
            'weights': weights,
            'possible_match': possible_match,
            'costs': costs,
            'probabilities': probabilities,
        }

        if method == 'threshold_based':
            if thresholds is None:
                raise ValueError("Thresholds must be provided for threshold-based classification.")
            self.classification_results = self._threshold_based_classification(thresholds, possible_match)

        elif method == 'weighted':
            if thresholds is None or weights is None:
                raise ValueError("Both thresholds and weights must be provided for weighted classification.")
            self.classification_results = self._weighted_classification(thresholds, weights)

        elif method == 'cost_based':
            if costs is None or probabilities is None:
                raise ValueError("Costs and probabilities must be provided for cost-based classification.")
            self.classification_results = self._cost_based_classification(costs, probabilities)

        else:
            raise ValueError(f"Unknown classification method: {method}")

        return self.classification_results

    def _threshold_based_classification(self, thresholds, possible_match):
        merged_data = self._merge_row_details()
        similarity_columns = [col for col in self.comparison_table.columns if col.endswith('_similarity')]
        merged_data['average_similarity'] = merged_data[similarity_columns].mean(axis=1)

        merged_data['classification'] = merged_data['average_similarity'].apply(
            lambda similarity: self._classify_by_thresholds(similarity, thresholds, possible_match)
        )
        return merged_data

    def _weighted_classification(self, thresholds, weights):
        merged_data = self._merge_row_details()
        similarity_columns = [col for col in self.comparison_table.columns if col.endswith('_similarity')]

        if not set(weights.keys()).issubset(set(similarity_columns)):
            raise ValueError("All keys in weights must match similarity columns.")

        merged_data['weighted_similarity'] = sum(
            merged_data[col] * weight for col, weight in weights.items()
        )

        min_similarity = merged_data['weighted_similarity'].min()
        max_similarity = merged_data['weighted_similarity'].max()
        merged_data['normalized_similarity'] = (
            (merged_data['weighted_similarity'] - min_similarity) /
            (max_similarity - min_similarity)
            if max_similarity > min_similarity else 0
        )

        merged_data['classification'] = merged_data['normalized_similarity'].apply(
            lambda similarity: 'Match' if similarity >= thresholds['match'] else 'Non-Match'
        )

        return merged_data

    def _cost_based_classification(self, costs, probabilities):
        merged_data = self._merge_row_details()
        similarity_columns = [col for col in self.comparison_table.columns if col.endswith('_similarity')]
        merged_data['average_similarity'] = merged_data[similarity_columns].mean(axis=1)

        P_M = probabilities['M']
        P_U = probabilities['U']
        merged_data['cost_non_match'] = (
                costs['non_match_true_match'] * merged_data['average_similarity'] * P_M +
                costs['non_match_true_non_match'] * (1 - merged_data['average_similarity']) * P_U
        )
        merged_data['cost_match'] = (
                costs['match_true_match'] * merged_data['average_similarity'] * P_M +
                costs['match_true_non_match'] * (1 - merged_data['average_similarity']) * P_U
        )

        merged_data['classification'] = merged_data.apply(
            lambda row: 'Match' if row['cost_match'] < row['cost_non_match'] else 'Non-Match',
            axis=1
        )

        return merged_data

    def _merge_row_details(self):
        row1_details = self.blocked_data.set_index('ID').loc[self.comparison_table['row1']].reset_index(drop=True)
        row2_details = self.blocked_data.set_index('ID').loc[self.comparison_table['row2']].reset_index(drop=True)

        merged_data = self.comparison_table.copy()
        for col in self.blocked_data.columns:
            if col not in ['block_id', 'SKV', 'BKV', 'ID']:  # Exclude metadata columns
                merged_data[f'row1_{col}'] = row1_details[col].values
                merged_data[f'row2_{col}'] = row2_details[col].values
        return merged_data

    def _classify_by_thresholds(self, similarity, thresholds, possible_match):
        if possible_match:
            if similarity < thresholds['not_match']:
                return 'Not Match'
            elif thresholds['not_match'] <= similarity < thresholds['match']:
                return 'Possible Match'
            else:
                return 'Match'
        else:
            if similarity < thresholds['match']:
                return 'Not Match'
            else:
                return 'Match'

    def get_classification_results(self):
        if self.classification_results is None:
            raise ValueError("No classification results available. Run 'classify_matches' first.")
        return self.classification_results

    def used_methods(self):
        return self.method

    def used_parameters(self):
        return self.parameters

    def dataframe_to_jsonb(self):
        json_data = self.classification_results.to_json(orient='records', date_format='iso')
        return json.loads(json_data)
