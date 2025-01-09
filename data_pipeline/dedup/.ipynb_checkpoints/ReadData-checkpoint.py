import pandas as pd
import numpy as np

class ReadData:
    def __init__(self, path):
        """
        Initialize with the path to the CSV file.
        """
        self.path = path  # Can be replaced by database connection later
        self.data = None

    def read_data(self):
        """
        Read data from the CSV file using pandas.
        Adds an 'ID' column for tracking original indexes.
        Returns a pandas DataFrame.
        """
        self.data = pd.read_csv(self.path)
        self.data['ID'] = self.data.index  # Add an ID column with the original row index
        return self.data