import pytest

import pandas as pd
from ..BlockBuilding import BlockBuilding
from ..Classifier import Classifier
from ..Comparison import Comparison
from ..DataPreprocessing import DataPreprocessing
from ..Evaluation import Evaluation
from ..ReadData import ReadData

def test_Integration():
    data = pd.DataFrame({
        'ID': [0,1,2,3,4,5,6,7],
        'col1': ['block', 'block', 'block', 'block', 'cube', 'cube', 'cube', 'cube'],
        'col2': ['rtyrt', 'block', 'block', 'block', 'cube', 'cube', 'cube', 'cube'],
        'col3': ['rty', 'block', 'block', 'block', 'cube', 'cube', 'cube', 'cube'],
        'col4': ['rtyrty', 'block', 'block', 'block', 'cube', 'cube', 'cube', 'cube']
    })
    pre_processing = DataPreprocessing(data)
    pre_processing.select_columns(['all'])
    processed_data = pre_processing.get_processed_data()

    block_building = BlockBuilding(processed_data, 'standardBlocking')
    block_building.build_blocks(['col1'])
    blocks = block_building.get_blocks()

    comparison = Comparison(blocks)
    comparison.compare_within_blocks({'col1': comparison.levenshtein_similarity, 'col2': comparison.levenshtein_similarity, 'col3': comparison.levenshtein_similarity, 'col4': comparison.levenshtein_similarity,})
    comparisons = comparison.get_comparison_results()

    classifier = Classifier(blocks, comparisons)
    classifier.classify_matches(thresholds = {'match': 0.5})
    classified_data = classifier.get_classification_results()
    result = classified_data

    evaluation = Evaluation(data, classified_data)
    result = evaluation.get_deduplicated_data()

    expected_output = pd.DataFrame({
        'ID': [0, 1, 4],
        'col1': ['block', 'block', 'cube'],
        'col2': ['rtyrt', 'block', 'cube'],
        'col3': ['rty', 'block', 'cube'],
        'col4': ['rtyrty', 'block', 'cube']
    })

    assert result.equals(expected_output)
