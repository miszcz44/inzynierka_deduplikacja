import pandas as pd
import numpy as np
import json

class Evaluation:
    def __init__(self, source_data, classified_data):
        """
        Initialize the Evaluation class with the source data and classified data.
        :param source_data: DataFrame containing the original source data.
        :param classified_data: DataFrame containing classified match results.
        """
        self.source_data = source_data
        self.classified_data = classified_data
        self.evaluated_data = None

    def show_matches_side_by_side(self):
        """
        Show all rows classified as 'Match' in an unflattened format,
        with an additional 'dropped' column ('NO' for row1 and 'YES' for row2).
        :return: DataFrame with matched rows from source_data and 'dropped' column.
        """
        matches = self.classified_data[self.classified_data['classification'] == 'Match']
        rows = []
        dedup_id = 1

        for _, row in matches.iterrows():
            # Get rows for row1 and row2 from source data
            row1 = self.source_data.iloc[row['row1']].copy()
            row2 = self.source_data.iloc[row['row2']].copy()

            # Add 'dropped' column
            row1['dropped'] = 'NO'
            row2['dropped'] = 'YES'

            row1['dedup_id'] = dedup_id
            row2['dedup_id'] = dedup_id

            dedup_id += 1

            # Append both rows
            rows.append(row1)
            rows.append(row2)

            # Combine all rows into a single DataFrame
        result_df = pd.DataFrame(rows)
        columns = ['dedup_id'] + [col for col in result_df.columns if col != 'dedup_id']
        result_df = result_df[columns]
        self.evaluated_data = result_df

        return result_df

    def get_deduplicated_data(self):
        """
        Get deduplicated data by dropping all rows from source_data whose indexes are in row_2 of classified_data.
        :return: Deduplicated DataFrame.
        """
        to_drop = self.classified_data[self.classified_data['classification'] == 'Match']['row2'].unique()
        deduplicated_data = self.source_data.drop(index=to_drop).reset_index(drop=True)
        return deduplicated_data

    def get_statistics(self):
        """
        Get statistics about the deduplication process, including:
        - Row count before deduplication
        - Row count after deduplication
        - Duplicate percentage
        - Average similarity of rows in blocks (block_id).
        :return: DataFrame with statistics.
        """
        row_count_before = len(self.source_data)
        deduplicated_data = self.get_deduplicated_data()
        row_count_after = len(deduplicated_data)
        num_duplicates = row_count_before - row_count_after
        duplicate_percentage = ((row_count_before - row_count_after) / row_count_before) * 100

        # Average similarity within blocks
        avg_similarity_per_block = (
            self.classified_data.groupby('block_id')['normalized_similarity']
            .mean()
            .reset_index()
            .rename(columns={'normalized_similarity': 'avg_similarity'})
        )

        stats = {
            'Detected duplicates': num_duplicates,
            'Row count before deduplication': row_count_before,
            'Row count after deduplication': row_count_after,
            'Duplicate percentage': round(duplicate_percentage, 2),
            'Average similarity per block': round(avg_similarity_per_block['avg_similarity'].mean(), 2)
        }

        stats_df = pd.DataFrame([stats])
        return stats_df

    @staticmethod
    def used_methods_parameters(*workflow_objects):
        """
        Collect statistics about all workflow steps into a table.
        :param workflow_objects: Instances of classes (e.g., BlockBuilding, Comparison, Classifier).
        :return: DataFrame summarizing methods and parameters for each step.
        """
        stats = []
        for obj in workflow_objects:
            stats.append({
                'Step': obj.__class__.__name__,
                'Method': obj.used_methods(),
                'Parameters': obj.used_parameters(),
            })
        return pd.DataFrame(stats)

    def dataframe_to_jsonb(self):
        """
        Convert a DataFrame to a JSONB-compatible string.
        :param dataframe: pandas DataFrame
        :return: JSON string
        """
        # Convert the DataFrame to a JSON string
        json_data = self.evaluated_data.to_json(orient='records', date_format='iso')
        return json.loads(json_data)
