import pytest
import pandas as pd
from ..Comparison import Comparison

@pytest.fixture
def dummy_data_frame():
    return pd.DataFrame({'col1': ['abcd', 'abcd'], 'col2': ['delta', 'gamma']})

def test_ComparisonNoInputData():
    with pytest.raises(TypeError):
        Comparison()

def test_ComparisonLevehnsteinIdentical(dummy_data_frame):
    assert Comparison(dummy_data_frame).levenshtein_similarity("canada", "canada") == 1

def test_ComparisonLevehnsteinSimilar(dummy_data_frame):
    assert 0 < Comparison(dummy_data_frame).levenshtein_similarity("canada", "banana") < 1

def test_ComparisonLevehnsteinDifferent(dummy_data_frame):
    assert Comparison(dummy_data_frame).levenshtein_similarity("canada", "fstuew") == 0

def test_ComparisonJaroWinklerIdentical(dummy_data_frame):
    assert Comparison(dummy_data_frame).jaro_winkler_similarity("canada", "canada") == 1

def test_ComparisonJaroWinklerSimilar(dummy_data_frame):
    assert 0 < Comparison(dummy_data_frame).jaro_winkler_similarity("canada", "banana") < 1

def test_ComparisonJaroWinklerDifferent(dummy_data_frame):
    assert Comparison(dummy_data_frame).jaro_winkler_similarity("canada", "fstuew") == 0

def test_ComparisonQgramIdentical(dummy_data_frame):
    assert Comparison(dummy_data_frame).qgram_similarity("canada", "canada") == 1

def test_ComparisonQgramSimilar(dummy_data_frame):
    assert 0 < Comparison(dummy_data_frame).qgram_similarity("canada", "banana") < 1

def test_ComparisonQgramDifferent(dummy_data_frame):
    assert Comparison(dummy_data_frame).qgram_similarity("canada", "fstuew") == 0