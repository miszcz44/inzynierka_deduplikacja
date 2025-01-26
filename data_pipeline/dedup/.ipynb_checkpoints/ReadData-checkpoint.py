import pandas as pd
import numpy as np

class ReadData:
    def __init__(self, path):
        self.path = path
        self.data = None

    def read_data(self):
        self.data = pd.read_csv(self.path)
        self.data['ID'] = self.data.index 
        return self.data