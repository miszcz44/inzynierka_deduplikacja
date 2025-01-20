import pytest
import pandas as pd
from ..BlockBuilding import BlockBuilding

@pytest.fixture
def dummy_data_frame():
    return pd.DataFrame({'col1': ['abcd', 'abcd'], 'col2': ['delta', 'gamma']})

def test_blockBuildingNoBlockingMethod(dummy_data_frame):
    with pytest.raises(TypeError):
        BlockBuilding(dummy_data_frame).build_blocks()

def test_blockBuildingInvalidBlockingMethod(dummy_data_frame):
    with pytest.raises(ValueError):
        BlockBuilding(dummy_data_frame, "madeUpBlocking").build_blocks()

def test_blockBuildingStandardBlockingNoColumns(dummy_data_frame):
    with pytest.raises(ValueError):
        BlockBuilding(dummy_data_frame, 'standardBlocking').build_blocks()

def test_blockBuildingSortedNeighborhoodNoWindowSize(dummy_data_frame):
    with pytest.raises(ValueError):
        BlockBuilding(dummy_data_frame, 'sortedNeighborhood').build_blocks(['col1'])

def test_blockBuildingDynamicSortedNeighborhoodNoMatchTreshold(dummy_data_frame):
    with pytest.raises(ValueError):
        BlockBuilding(dummy_data_frame, 'dynamicSortedNeighborhood').build_blocks(['col1'], 3)

def test_blockBuildingDynamicSortedNeighborhoodNoWindowSize(dummy_data_frame):
    with pytest.raises(ValueError):
        BlockBuilding(dummy_data_frame, 'dynamicSortedNeighborhood').build_blocks(['col1'], None, 3)

def test_blockBuildingStandardBlockingIdenticalRows(dummy_data_frame):
    blockBuilding = BlockBuilding(dummy_data_frame, 'standardBlocking')
    blockBuilding.build_blocks(['col1'])
    assert blockBuilding.get_num_blocks() == 1

def test_blockBuildingStandardBlockingDifferentRows(dummy_data_frame):
    blockBuilding = BlockBuilding(dummy_data_frame, 'standardBlocking')
    blockBuilding.build_blocks(['col2'])
    assert blockBuilding.get_num_blocks() == 2
