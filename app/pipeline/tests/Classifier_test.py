import pytest
import pandas as pd
from ..Classifier import Classifier


def test_Classifier1():
    blocks = pd.DataFrame({
        'ID': [0,1,2,3,4,5],
        'block_id': [1, 1, 1, 2, 2, 2],
        'a': ['a', 'a', 'a', 'a', 'a', 'a'],
        'b': ['b', 'b', 'b', 'b', 'b', 'b']
    })
    comparisons = pd.DataFrame({
        'ID': [0,1,2,3,4,5],
        'block_id': [1, 1, 1, 2, 2, 2],
        'row1': [1, 1, 2, 1, 1, 2],
        'row2': [2, 3, 3, 2, 3, 3],
        'a': [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
        'b': [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]
    })
    classifier = Classifier(blocks, comparisons)
    result = classifier.classify_matches(thresholds = {'match': 0.5})
    assert result[['classification']].equals(pd.DataFrame({'classification': ['Match', 'Match', 'Match', 'Match', 'Match', 'Match']}))