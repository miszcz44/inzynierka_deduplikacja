import pytest
import pandas as pd
from ..DataPreprocessing import DataPreprocessing

@pytest.fixture
def duplicates_data_frame():
    return pd.DataFrame({'col1': ['data', 'data', 'other', 'other'], 'col2': ['data', 'other', 'data', 'data'], 'col3': ['data', 'other', 'data', 'data']})

def test_PreprocessingFullSteps():
    input = pd.DataFrame({'col1': ['pu,n;ctuati-on', 'diåćriticś', 'LOWERCASE']})
    preprocessing = DataPreprocessing(input)
    preprocessing.select_columns(["all"])
    result = preprocessing.apply_preprocessing(True, True, True)
    expected_output = pd.DataFrame({'col1': ['punctuation', 'diacritics', 'lowercase']})
    assert result.equals(expected_output)

def test_PreprocessingDropDuplicates1(duplicates_data_frame):
    preprocessing = DataPreprocessing(duplicates_data_frame)
    preprocessing.select_columns(['all'])
    preprocessing.drop_duplicates()
    result = preprocessing.get_processed_data()
    expected_output = pd.DataFrame({'col1': ['data', 'data', 'other'], 'col2': ['data', 'other', 'data'], 'col3': ['data', 'other', 'data']})
    assert result.equals(expected_output)

def test_PreprocessingDropDuplicates2(duplicates_data_frame):
    preprocessing = DataPreprocessing(duplicates_data_frame)
    preprocessing.select_columns(['col2'])
    preprocessing.drop_duplicates()
    result = preprocessing.get_processed_data()
    expected_output = pd.DataFrame({'col1': ['data', 'data'], 'col2': ['data', 'other'], 'col3': ['data', 'other']})
    assert result.equals(expected_output)

def test_PreprocessingDropDuplicates3(duplicates_data_frame):
    preprocessing = DataPreprocessing(duplicates_data_frame)
    preprocessing.select_columns(['col1', 'col2'])
    preprocessing.drop_duplicates()
    result = preprocessing.get_processed_data()
    expected_output = pd.DataFrame({'col1': ['data', 'data', 'other'], 'col2': ['data', 'other', 'data'], 'col3': ['data', 'other', 'data']})
    assert result.equals(expected_output)