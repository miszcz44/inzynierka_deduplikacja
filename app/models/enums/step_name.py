from enum import Enum


class StepName(str, Enum):
    DATA_READING = "data_reading"
    DATA_PREPROCESSING = "data_preprocessing"
    BLOCK_BUILDING = "block_building"
    FIELD_AND_RECORD_COMPARISON = "field_and_record_comparison"
    ClASSIFICATION = "classification"
    EVALUATION = "evaluation"
