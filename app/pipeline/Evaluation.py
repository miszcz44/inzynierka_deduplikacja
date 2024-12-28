import pandas as pd
import json


class Evaluation:
    def __init__(self, source_data, classified_data):
        """
        Initialize the Evaluation class with the source data and classified data.
        :param source_data: DataFrame containing the original source data.
        :param classified_data: DataFrame containing classified match results.
        """
        self.json_data = None
        self.source_data = source_data
        self.classified_data = classified_data
        self.evaluated_data = None
        self.matches = None
        self.statistics = None
        self.used_parameters = None

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
            row1 = self.source_data.iloc[int(row['row1'])].copy()
            row2 = self.source_data.iloc[int(row['row2'])].copy()

            row1['dropped'] = 'NO'
            row2['dropped'] = 'YES'
            row1['dedup_id'] = dedup_id
            row2['dedup_id'] = dedup_id

            dedup_id += 1
            rows.append(row1)
            rows.append(row2)

        result_df = pd.DataFrame(rows)
        columns = ['dedup_id'] + [col for col in result_df.columns if col != 'dedup_id']
        self.matches = result_df[columns]
        return self.matches

    def get_deduplicated_data(self):
        """
        Get deduplicated data by dropping all rows from source_data whose indexes are in row_2 of classified_data.
        :return: Deduplicated DataFrame.
        """
        to_drop = self.classified_data[self.classified_data['classification'] == 'Match']['row2'].unique()
        self.evaluated_data = self.source_data.drop(index=to_drop).reset_index(drop=True)
        return self.evaluated_data

    def get_statistics(self):
        """
        Get statistics about the deduplication process.
        :return: DataFrame with statistics.
        """
        row_count_before = len(self.source_data)
        deduplicated_data = self.get_deduplicated_data()
        row_count_after = len(deduplicated_data)
        num_duplicates = row_count_before - row_count_after
        duplicate_percentage = (num_duplicates / row_count_before) * 100

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

        self.statistics = pd.DataFrame([stats])
        return self.statistics

    @staticmethod
    def used_methods_parameters(self, *workflow_objects):
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
        self.used_parameters = pd.DataFrame(stats)
        return self.used_parameters

    def dataframes_to_jsonb(self):
        """
        Convert multiple DataFrames to a JSONB-compatible string.
        :return: JSON-compatible string containing all DataFrames.
        """
        dataframes_dict = {
            'evaluated_data': self.evaluated_data,
            'matches': self.matches,
            'statistics': self.statistics,
        }

        json_data = {}
        for keyword, dataframe in dataframes_dict.items():
            if dataframe is not None:
                json_data[keyword] = json.loads(dataframe.to_json(orient='records', date_format='iso'))

        self.json_data = json.dumps(json_data, indent=4)
        return self.json_data

    def retrieve_dataframe_from_jsonb(self, keyword):
        """
        Retrieve a specific DataFrame from a JSONB-compatible string.
        :param keyword: The keyword of the desired DataFrame.
        :return: The reconstructed pandas DataFrame.
        """
        if not self.json_data:
            raise ValueError("No JSON data available. Call `dataframes_to_jsonb()` first.")

        json_dict = json.loads(self.json_data)
        if keyword not in json_dict:
            raise KeyError(f"Keyword '{keyword}' not found in the JSON data.")

        return pd.DataFrame(json_dict[keyword])
