import pandas as pd
import numpy as np
from fuzzywuzzy import fuzz
from jellyfish import soundex


class BlockBuilding:
    def __init__(self, data, method):
        """
        Initialize the BlockBuilder with data and method.
        :param data: pandas DataFrame containing the entity data.
        :param method: The blocking method to use ('sorted_neighborhood', 'dynamic_sorted_neighborhood', or 'standard_blocking').
        """
        self.data = data
        self.method = method
        self.blocks = None
        self.num_blocks = 0
        self.parameters = {}  # To store parameters used for blocking

    def build_blocks(self, columns=None, window_size=None, max_window_size=None, match_threshold=None, n_letters=3,
                     block_index=1):
        """
        Main function to build blocks using the selected method.
        :param columns: List of columns to generate BKVs or SKVs.
        :param window_size: Window size for sorted neighborhood method.
        :param max_window_size: Maximum window size for dynamic sorted neighborhood.
        :param match_threshold: Match threshold for dynamic sorted neighborhood.
        :param n_letters: Number of letters to concatenate for SKVs.
        :param block_index: Index of the block to display (optional).
        :return: A specific block based on block_index.
        """
        if columns is None:
            raise ValueError("You must specify the columns for generating keys.")

        self.parameters = {  # Store parameters for statistics
            'columns': columns,
            'window_size': window_size,
            'max_window_size': max_window_size,
            'match_threshold': match_threshold,
            'n_letters': n_letters,
        }

        if self.method == 'standard_blocking':
            self.standard_blocking(columns)
        elif self.method == 'sorted_neighborhood':
            if window_size is None:
                raise ValueError("Window size must be provided for the sorted neighborhood method.")
            self.sorted_neighborhood(columns, window_size, n_letters)
        elif self.method == 'dynamic_sorted_neighborhood':
            if max_window_size is None or match_threshold is None:
                raise ValueError(
                    "Both max_window_size and match_threshold must be provided for the dynamic sorted neighborhood method.")
            self.dynamic_sorted_neighborhood(columns, max_window_size, match_threshold, n_letters)
        else:
            raise ValueError(
                "Invalid method. Use 'standard_blocking', 'sorted_neighborhood', or 'dynamic_sorted_neighborhood'.")

        return self.display_block(block_index)

    def standard_blocking(self, columns):
        """
        Perform standard blocking using Soundex codes for the selected columns.
        :param columns: List of columns to use for generating BKVs.
        """
        self.blocks = self.data.copy()

        # Generate Soundex code for each selected column and concatenate them
        self.blocks['BKV'] = self.blocks[columns].apply(
            lambda col: col.map(lambda x: soundex(x) if isinstance(x, str) else '')
        ).agg(' '.join, axis=1)

        # Group by BKV and assign block IDs
        self.blocks['block_id'] = self.blocks.groupby('BKV').ngroup() + 1

        # Update the number of blocks
        self.num_blocks = self.blocks['block_id'].nunique()

    def sorted_neighborhood(self, columns, window_size, n_letters):
        """
        Perform sorted neighborhood blocking using concatenated first `n` letters of selected columns as SKVs.
        :param columns: List of columns to use for generating SKVs.
        :param window_size: Size of the sliding window.
        :param n_letters: Number of letters to concatenate for SKVs.
        """
        self.blocks = self.data.copy()

        # Generate the SKV by concatenating the first `n_letters` of each column
        self.blocks['SKV'] = self.blocks[columns].apply(
            lambda col: col.map(lambda x: x[:min(n_letters + 1, len(x))] if isinstance(x, str) else '')
        ).agg(''.join, axis=1)

        # Sort by SKV
        self.blocks = self.blocks.sort_values(by='SKV').reset_index(drop=True)

        # Assign block IDs based on window size
        self.blocks['block_id'] = (self.blocks.index // window_size) + 1

        # Update the number of blocks
        self.num_blocks = self.blocks['block_id'].nunique()

    def dynamic_sorted_neighborhood(self, columns, max_window_size, match_threshold, n_letters):
        """
        Perform dynamic sorted neighborhood blocking using SKVs.
        :param columns: List of columns to use for generating SKVs.
        :param max_window_size: Maximum size of the sliding window.
        :param match_threshold: Match threshold for window expansion.
        :param n_letters: Number of letters to concatenate for SKVs.
        """
        self.blocks = self.data.copy()

        # Generate the SKV by concatenating the first `n_letters + 1` of each column
        self.blocks['SKV'] = self.blocks[columns].apply(
            lambda col: col.map(lambda x: x[:min(n_letters + 1, len(x))] if isinstance(x, str) else '')
        ).agg(''.join, axis=1)
        # Sort by SKV
        self.blocks = self.blocks.sort_values(by='SKV').reset_index(drop=True)

        # Initialize variables
        block_ids = []
        current_block_id = 1
        window_start = 0

        # Iterate over sorted data to assign dynamic block IDs
        while window_start < len(self.blocks):
            # Start with a single row
            window_end = window_start + 1

            # Expand window dynamically
            while window_end < len(self.blocks) and (window_end - window_start) < max_window_size:
                # Check similarity between SKVs of current and next record
                similarity = fuzz.ratio(
                    self.blocks['SKV'].iloc[window_start],
                    self.blocks['SKV'].iloc[window_end]
                )
                if similarity >= match_threshold * 100:  # Convert threshold to percentage
                    window_end += 1
                else:
                    break

            # Assign the same block ID to all rows in the current window
            block_ids.extend([current_block_id] * (window_end - window_start))

            # Move to the next record
            window_start = window_end
            current_block_id += 1

        # Assign block IDs back to the dataframe
        self.blocks['block_id'] = block_ids

        # Update the number of blocks
        self.num_blocks = current_block_id - 1

    def get_num_blocks(self):
        """
        Return the total number of blocks generated.
        :return: Integer count of blocks.
        """
        return self.num_blocks

    def used_methods(self):
        """
        Return the blocking method used.
        :return: String name of the blocking method.
        """
        return self.method

    def used_parameters(self):
        """
        Return the parameters used for the blocking method.
        :return: Dictionary of parameters.
        """
        return self.parameters

    def display_block(self, block_index=1):
        """
        Display a specific block by block_id.
        :param block_index: The index of the block to display.
        :return: DataFrame containing the specified block.
        """
        if self.blocks is None:
            raise ValueError("No blocks have been generated. Run block building first.")

        return self.blocks[self.blocks['block_id'] == block_index]

    def get_blocks(self):
        """
        Return all generated blocks.
        :return: DataFrame containing all blocks.
        """
        if self.blocks is None:
            raise ValueError("No blocks have been generated. Run block building first.")

        return self.blocks