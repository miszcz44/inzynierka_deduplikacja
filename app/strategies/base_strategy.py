from abc import ABC, abstractmethod
import pandas as pd


class BaseStrategy(ABC):
    def __init__(self, dataframe: pd.DataFrame, parameters: dict):
        self.dataframe = dataframe
        self.parameters = parameters

    @abstractmethod
    def execute(self):
        pass