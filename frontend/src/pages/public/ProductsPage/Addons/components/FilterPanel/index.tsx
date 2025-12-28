import { FC } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import {
  Button,
  TextField,
  Typography,
  Stack,
  Box,
  Autocomplete,
  Slider,
  InputAdornment,
  IconButton,
} from '@mui/material';

import { Category } from '@/types/common.ts';

interface FilterPanelProps {
  categories: Category[];
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleSearch: (value: string) => void;
  selectedCategories: string[];
  handleCategoryChange: (values: string[]) => void;
  priceRange: [number, number];
  handlePriceChange: (value: number | number[]) => void;
  handleClearFilters: () => void;
}

const FilterPanel: FC<FilterPanelProps> = ({
  categories,
  searchInput,
  setSearchInput,
  handleSearch,
  selectedCategories,
  handleCategoryChange,
  priceRange,
  handlePriceChange,
  handleClearFilters,
}) => (
  <Stack spacing={3}>
    {/* Search Section */}
    <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 1 }}>
      <Typography variant="h6" gutterBottom>
        Search
      </Typography>
      <TextField
        fullWidth
        placeholder="Search artworks..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(searchInput);
          }
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => handleSearch(searchInput)} edge="end">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>

    {/* Categories Section */}
    <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 1 }}>
      <Typography variant="h6" gutterBottom>
        Categories
      </Typography>
      <Autocomplete
        multiple
        options={categories}
        getOptionLabel={(option) => option.name}
        value={categories.filter((cat) => selectedCategories.includes(cat.slug))}
        onChange={(_, newValue) => {
          handleCategoryChange(newValue.map((cat) => cat.slug));
        }}
        renderInput={(params) => (
          <TextField {...params} placeholder="Select categories" />
        )}
        limitTags={2}
      />
    </Box>

    {/* Price Range Section */}
    <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 1 }}>
      <Typography variant="h6" gutterBottom>
        Price Range
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        ${priceRange[0]} - ${priceRange[1]}
      </Typography>
      <Box sx={{ px: 1, mt: 2 }}>
        <Slider
          value={priceRange}
          onChange={(_, newValue) => handlePriceChange(newValue)}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `$${value}`}
          min={0}
          max={10000}
          step={100}
        />
      </Box>
    </Box>

    <Button variant="outlined" fullWidth onClick={handleClearFilters}>
      Clear All Filters
    </Button>
  </Stack>
);

export default FilterPanel;
