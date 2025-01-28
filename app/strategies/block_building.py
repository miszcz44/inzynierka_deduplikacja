from .base_strategy import BaseStrategy


class BlockBuildingStrategy(BaseStrategy):
    def execute(self):
        from pipeline.BlockBuilding import BlockBuilding

        algorithm = self.parameters.get("algorithm")
        inputs = self.parameters.get("inputs", {})

        block_builder = BlockBuilding(self.dataframe, algorithm)

        if algorithm == "standardBlocking":
            return block_builder.build_blocks(columns=inputs.get("columns", []))

        elif algorithm == "sortedNeighborhood":
            return block_builder.build_blocks(
                columns=inputs.get("columns", []),
                window_size=inputs.get("windowSize", 5),
                n_letters=inputs.get("nLetters", 3)
            )

        elif algorithm == "dynamicSortedNeighborhood":
            return block_builder.build_blocks(
                columns=inputs.get("columns", []),
                max_window_size=inputs.get("maxWindowSize", 10),
                match_threshold=inputs.get("threshold", 0.8),
                n_letters=inputs.get("nLetters", 3)
            )

        else:
            raise ValueError("Invalid blocking algorithm specified.")