from .base_strategy import BaseStrategy


class DataPreprocessingStrategy(BaseStrategy):
    def execute(self):
        preprocessor = self._initialize_preprocessor()
        processed_data = preprocessor.apply_preprocessing(
            lowercase=self.parameters.get("lowercase", False),
            diacritics_removal=self.parameters.get("removeDiacritics", False),
            punctuation_removal=self.parameters.get("removePunctuation", False)
        )
        return preprocessor.dataframe_to_jsonb()

    def _initialize_preprocessor(self):
        from pipeline.DataPreprocessing import DataPreprocessing
        preprocessor = DataPreprocessing(self.dataframe)
        preprocessor.select_columns(['all'])
        return preprocessor