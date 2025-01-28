from .base_strategy import BaseStrategy


class ClassifierStrategy(BaseStrategy):
    def __init__(self, dataframe, blocked_data, parameters):
        super().__init__(dataframe, parameters)
        self.blocked_data = blocked_data

    def execute(self):
        from pipeline.Classifier import Classifier

        classifier = Classifier(blocked_data=self.blocked_data, comparison_table=self.dataframe)
        classification_type = self.parameters.get("classificationType")

        if classification_type == "cost-based":
            return self._cost_based_classification(classifier)

        elif classification_type == "weighted-threshold":
            return self._weighted_threshold_classification(classifier)

        elif classification_type == "threshold":
            return self._threshold_classification(classifier)

        else:
            raise ValueError(f"Unsupported classification type: {classification_type}")

    def _cost_based_classification(self, classifier):
        costs = {
            "non_match_true_match": self.parameters.get("costTrueMatchAsNonMatch", 1),
            "non_match_true_non_match": self.parameters.get("costTrueNonMatchAsNonMatch", 1),
            "match_true_match": self.parameters.get("costTrueMatchAsMatch", 1),
            "match_true_non_match": self.parameters.get("costTrueNonMatchAsMatch", 1.9)
        }
        probabilities = {
            "M": self.parameters.get("probabilityM", 0.74),
            "U": 1 - self.parameters.get("probabilityM", 0.74)
        }

        return classifier.classify_matches(
            method="cost_based",
            costs=costs,
            probabilities=probabilities
        )

    def _weighted_threshold_classification(self, classifier):
        thresholds = {"match": self.parameters.get("thresholdMatch", 0.5)}
        weights = self.parameters.get("columnWeights", {})

        return classifier.classify_matches(
            method="weighted",
            thresholds=thresholds,
            weights=weights
        )

    def _threshold_classification(self, classifier):
        thresholds = {
            "match": self.parameters.get("thresholdMatch", 0.5),
            "not_match": self.parameters.get("thresholdNotMatch", 0.3)
        }
        possible_match = self.parameters.get("possibleMatch", False)

        return classifier.classify_matches(
            method="threshold_based",
            thresholds=thresholds,
            possible_match=possible_match
        )