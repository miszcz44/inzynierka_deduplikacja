import pandas as pd
import numpy as np
from fuzzywuzzy import fuzz
from jellyfish import soundex
import json


class BlockBuilding:
    def __init__(self, data, method):
        self.data = data
        self.method = method
        self.blocks = None
        self.num_blocks = 0
        self.parameters = {}

    def build_blocks(self, columns=None, window_size=None, max_window_size=None, match_threshold=None, n_letters=3,
                     block_index=1):
        if columns is None:
            raise ValueError("You must specify the columns for generating keys.")

        self.parameters = {
            'columns': columns,
            'window_size': window_size,
            'max_window_size': max_window_size,
            'match_threshold': match_threshold,
            'n_letters': n_letters,
        }

        if self.method == 'standardBlocking':
            self.standard_blocking(columns)
        elif self.method == 'sortedNeighborhood':
            if window_size is None:
                raise ValueError("Window size must be provided for the sorted neighborhood method.")
            self.sorted_neighborhood(columns, window_size, n_letters)
        elif self.method == 'dynamicSortedNeighborhood':
            if max_window_size is None or match_threshold is None:
                raise ValueError(
                    "Both max_window_size and match_threshold must be provided for the dynamic sorted neighborhood method.")
            self.dynamic_sorted_neighborhood(columns, max_window_size, match_threshold, n_letters)
        else:
            raise ValueError(
                "Invalid method. Use 'standardBlocking', 'sortedNeighborhood', or 'dynamicSortedNeighborhood'.")

        return self.display_block(block_index)

    def standard_blocking(self, columns):
        self.blocks = self.data.copy()

        self.blocks['BKV'] = self.blocks[columns].apply(
            lambda col: col.map(lambda x: soundex(x) if isinstance(x, str) else '')
        ).agg(' '.join, axis=1)

        self.blocks['block_id'] = self.blocks.groupby('BKV').ngroup() + 1

        self.num_blocks = self.blocks['block_id'].nunique()

    def sorted_neighborhood(self, columns, window_size, n_letters):
        self.blocks = self.data.copy()

        self.blocks['SKV'] = self.blocks[columns].apply(
            lambda col: col.map(lambda x: x[:min(n_letters + 1, len(x))] if isinstance(x, str) else '')
        ).agg(''.join, axis=1)

        self.blocks = self.blocks.sort_values(by='SKV').reset_index(drop=True)

        self.blocks['block_id'] = (self.blocks.index // window_size) + 1

        self.num_blocks = self.blocks['block_id'].nunique()

    def dynamic_sorted_neighborhood(self, columns, max_window_size, match_threshold, n_letters):
        self.blocks = self.data.copy()

        self.blocks['SKV'] = self.blocks[columns].apply(
            lambda col: col.map(lambda x: x[:min(n_letters + 1, len(x))] if isinstance(x, str) else '')
        ).agg(''.join, axis=1)
        self.blocks = self.blocks.sort_values(by='SKV').reset_index(drop=True)

        block_ids = []
        current_block_id = 1
        window_start = 0

        while window_start < len(self.blocks):
            # Start with a single row
            window_end = window_start + 1

            while window_end < len(self.blocks) and (window_end - window_start) < max_window_size:
                similarity = fuzz.ratio(
                    self.blocks['SKV'].iloc[window_start],
                    self.blocks['SKV'].iloc[window_end]
                )
                if similarity >= match_threshold * 100:
                    window_end += 1
                else:
                    break

            block_ids.extend([current_block_id] * (window_end - window_start))

            window_start = window_end
            current_block_id += 1

        self.blocks['block_id'] = block_ids

        self.num_blocks = current_block_id - 1

    def get_num_blocks(self):
        return self.num_blocks

    def used_methods(self):
        return self.method

    def used_parameters(self):
        return self.parameters

    def display_block(self, block_index=1):
        if self.blocks is None:
            raise ValueError("No blocks have been generated. Run block building first.")

        return self.blocks[self.blocks['block_id'] == block_index]

    def get_blocks(self):
        if self.blocks is None:
            raise ValueError("No blocks have been generated. Run block building first.")

        return self.blocks

    def dataframe_to_jsonb(self):
        json_data = self.blocks.to_json(orient='records', date_format='iso')
        return json.loads(json_data)