import pandas as pd
import numpy as np
import unicodedata
import string
import re
import json


class DataPreprocessing:
    def __init__(self, data):
        """
        Initialize the DataPreprocessor with the data.
        :param data: pandas DataFrame containing the data to be processed.
        """
        self.data = data
        self.columns = None
        self.processed_data = data.copy()  # A copy of the data to avoid modifying the original

    def select_columns(self, columns):
        """
        Select the columns to apply preprocessing on.
        If 'all' is passed, all columns will be selected.
        :param columns: List of columns to be normalized, or 'all' to select all columns.
        """
        if columns[0] == 'all':
            # Select all columns except the 'ID' column
            self.columns = [col for col in self.data.columns if col != 'ID']
        else:
            # Otherwise, use the provided list of columns
            self.columns = columns

    def _ensure_non_numeric_string_columns(self):
        """
        Internal method to ensure that only non-numeric string columns are selected for string operations.
        """
        # Filter out non-string columns (Int64, Float64, etc.)
        self.columns = [
            col for col in self.columns if self.processed_data[col].dtype == 'object'
        ]

    def lowercase(self):
        """
        Convert text to lowercase in the selected columns.
        """
        if self.columns is None:
            raise ValueError("No columns selected for preprocessing. Use select_columns method first.")

        try:
            for col in self.columns:
                self.processed_data[col] = self.processed_data[col].str.lower()
        except Exception as e:
            print(f"Error applying lowercase operation: {e}")

    def remove_diacritics(self):
        """
        Remove diacritics from text in the selected columns.
        """
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
        """
        Remove punctuation from text in the selected columns.
        """
        if self.columns is None:
            raise ValueError("No columns selected for preprocessing. Use select_columns method first.")

        # Ensure only string columns are processed
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
        """
        Drop exact duplicates across all columns in the DataFrame, except 'ID'.
        """
        try:
            # Drop duplicates while preserving the 'ID' column
            self.processed_data = self.processed_data.drop_duplicates(subset=self.columns)
        except Exception as e:
            print(f"Error dropping duplicates: {e}")

    def apply_preprocessing(self, lowercase=False, diacritics_removal=False, punctuation_removal=False):
        """
        Apply preprocessing steps based on user selection.
        The order is: lowercase -> diacritics removal -> punctuation removal -> drop exact duplicates.
        :param lowercase: If True, apply lowercasing to the selected columns.
        :param diacritics_removal: If True, remove diacritics from the selected columns.
        :param punctuation_removal: If True, remove punctuation from the selected columns.
        :return: Preprocessed pandas DataFrame.
        """
        try:
            if punctuation_removal:
                self.remove_punctuation()

            # Ensure non-numeric string columns are processed
            self._ensure_non_numeric_string_columns()

            if lowercase:
                self.lowercase()

            if diacritics_removal:
                self.remove_diacritics()

            # Drop exact duplicates as the mandatory last step
            self.drop_duplicates()

        except Exception as e:
            print(f"Error during preprocessing: {e}")

        return self.processed_data

    def get_processed_data(self):
        """
        Return the preprocessed data.
        :return: Preprocessed pandas DataFrame.
        """
        return self.processed_data

    def dataframe_to_jsonb(self):
        """
        Convert a DataFrame to a JSONB-compatible string.
        :param dataframe: pandas DataFrame
        :return: JSON string
        """
        # Convert the DataFrame to a JSON string
        json_data = self.processed_data.to_json(orient='records', date_format='iso')
        return json.loads(json_data)
