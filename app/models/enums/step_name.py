from enum import Enum


class StepName(str, Enum):
    DATA_READING = "data_reading"
    BLOCK_BUILDING = "block_building"
    BLOCK_CLEANING = "block_cleaning"
    COMPARISON_CLEANING = "comparison_cleaning"
    ENTITY_MATCHING = "entity_matching"
    ENTITY_CLUSTERING = "entity_clustering"
    EVALUATION = "evaluation"
