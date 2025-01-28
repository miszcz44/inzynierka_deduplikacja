from .base_strategy import BaseStrategy


class ComparisonStrategy(BaseStrategy):
    def execute(self):
        from pipeline.Comparison import Comparison

        selected_algorithms = self.parameters.get("selectedAlgorithms", {})
        q_value = self.parameters.get("qValue", 2)

        comparison = Comparison(self.dataframe)
        column_algorithms = {
            column: self._get_algorithm(algo, comparison, q_value)
            for column, algo in selected_algorithms.items()
        }

        return comparison.compare_within_blocks(column_algorithms)

    def _get_algorithm(self, algo, comparison, q_value):
        if algo == "Q-gram":
            return lambda str1, str2: comparison.qgram_similarity(str1, str2, q=q_value)
        elif algo == "Levenshtein":
            return comparison.levenshtein_similarity
        elif algo == "Jaro-Winkler":
            return comparison.jaro_winkler_similarity
        else:
            raise ValueError(f"Unsupported algorithm: {algo}")