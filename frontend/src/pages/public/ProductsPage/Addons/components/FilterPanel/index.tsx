import { FC } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Select, Slider, Typography } from 'antd';

import { Category } from '@/types/common.ts';

import {
  FilterSectionStyled,
  PriceRangeText,
  PriceSliderWrapperStyled,
  SearchCompactStyled,
} from './styles.ts';

const { Title } = Typography;

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
  <>
    <FilterSectionStyled>
      <Title level={5}>Search</Title>
      <SearchCompactStyled>
        <Input
          placeholder="Search artworks..."
          allowClear
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={() => handleSearch(searchInput)}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => handleSearch(searchInput)}
        />
      </SearchCompactStyled>
    </FilterSectionStyled>

    <FilterSectionStyled>
      <Title level={5}>Categories</Title>
      <Select
        mode="multiple"
        placeholder="Select categories"
        allowClear
        value={selectedCategories}
        onChange={handleCategoryChange}
        maxTagCount="responsive"
        css={{ width: '100%' }}
      >
        {categories.map((cat) => (
          <Select.Option key={cat.id} value={cat.slug}>
            {cat.name}
          </Select.Option>
        ))}
      </Select>
    </FilterSectionStyled>

    <FilterSectionStyled>
      <Title level={5}>Price Range</Title>
      <PriceRangeText type="secondary">
        ${priceRange[0]} - ${priceRange[1]}
      </PriceRangeText>
      <PriceSliderWrapperStyled>
        <Slider
          range
          min={0}
          max={10000}
          step={100}
          value={priceRange}
          onChange={handlePriceChange}
          tooltip={{ formatter: (value) => `$${value}` }}
        />
      </PriceSliderWrapperStyled>
    </FilterSectionStyled>

    <Button block onClick={handleClearFilters}>
      Clear All Filters
    </Button>
  </>
);

export default FilterPanel;
