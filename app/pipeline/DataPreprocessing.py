import pandas as pd
import numpy as np
import unicodedata
import string
import re
import json


class DataPreprocessing:
    def __init__(self, data):
        self.data = data
        self.columns = None
        self.processed_data = data.copy()

    def select_columns(self, columns):
        if columns[0] == 'all':
            self.columns = [col for col in self.data.columns if col != 'ID']
        else:
            self.columns = columns

    def _ensure_non_numeric_string_columns(self):
        self.columns = [
            col for col in self.columns if self.processed_data[col].dtype == 'object'
        ]

    def lowercase(self):
        if self.columns is None:
            raise ValueError("No columns selected for preprocessing. Use select_columns method first.")

        try:
            for col in self.columns:
                self.processed_data[col] = self.processed_data[col].str.lower()
        except Exception as e:
            print(f"Error applying lowercase operation: {e}")

    def remove_diacritics(self):
        if self.columns is None:
            raise ValueError("No columns selected for preprocessing. Use select_columns method first.")

        def _remove_diacritics(text):
            if isinstance(text, str):
                return ''.join(
                    c for c in unicodedata.normalize('NFKD', text)
                    if unicodedata.category(c) != 'Mn'
                )
            return text

        try:
            for col in self.columns:
                self.processed_data[col] = self.processed_data[col].apply(_remove_diacritics)
        except Exception as e:
            print(f"Error removing diacritics: {e}")

    def remove_punctuation(self):
        if self.columns is None:
            raise ValueError("No columns selected for preprocessing. Use select_columns method first.")

        self._ensure_non_numeric_string_columns()

        punctuation_pattern = f"[{re.escape(string.punctuation)}]"

        try:
            for col in self.columns:
                self.processed_data[col] = self.processed_data[col].str.replace(
                    punctuation_pattern, '', regex=True
                )
        except Exception as e:
            print(f"Error removing punctuation: {e}")

    def drop_duplicates(self):
        try:
            self.processed_data = self.processed_data.drop_duplicates(subset=self.columns)
        except Exception as e:
            print(f"Error dropping duplicates: {e}")

    def apply_preprocessing(self, lowercase=False, diacritics_removal=False, punctuation_removal=False):
        try:
            if punctuation_removal:
                self.remove_punctuation()

            self._ensure_non_numeric_string_columns()

            if lowercase:
                self.lowercase()

            if diacritics_removal:
                self.remove_diacritics()

            self.drop_duplicates()

        except Exception as e:
            print(f"Error during preprocessing: {e}")

        return self.processed_data

    def get_processed_data(self):
        return self.processed_data

    def dataframe_to_jsonb(self):
        json_data = self.processed_data.to_json(orient='records', date_format='iso')
        return json.loads(json_data)
