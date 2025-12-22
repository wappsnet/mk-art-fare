import { FC } from 'react';
import { Button, Flex, Input, Select, Slider, Space, Typography } from 'antd';
import {
  CustomFieldFilterLabelStyled,
  FilterSectionStyled,
  PriceRangeText,
  PriceSliderWrapperStyled,
  SearchCompactStyled,
} from './styles.ts';
import { FieldDefinition } from '@/types/customFields.ts';
import { Category } from '@/types/common.ts';
import { SearchOutlined } from '@ant-design/icons';
import { CustomFieldFilter } from '@/components/CustomFieldFilter';

const { Title } = Typography;

interface FilterPanelProps {
  filterFields: FieldDefinition[];
  categories: Category[];
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleSearch: (value: string) => void;
  selectedCategories: string[];
  handleCategoryChange: (values: string[]) => void;
  priceRange: [number, number];
  handlePriceChange: (value: number | number[]) => void;
  customFieldFilters: Record<string, string>;
  handleChangeCustomFilter: ({ id, value }: { id: number; value: string }) => void;
  handleClearFilters: () => void;
}

const FilterPanel: FC<FilterPanelProps> = ({
  filterFields,
  categories,
  searchInput,
  setSearchInput,
  handleSearch,
  selectedCategories,
  handleCategoryChange,
  priceRange,
  handlePriceChange,
  customFieldFilters,
  handleChangeCustomFilter,
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
        style={{ width: '100%' }}
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

    {filterFields.length > 0 && (
      <FilterSectionStyled>
        <Title level={5}>Custom Filters</Title>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {filterFields.map((field) => (
            <Flex vertical gap={8} key={field.id}>
              <CustomFieldFilterLabelStyled strong>
                {field.label || field.name}
              </CustomFieldFilterLabelStyled>
              <CustomFieldFilter
                field={field}
                value={customFieldFilters[field.id] || ''}
                onChange={(value) => {
                  handleChangeCustomFilter({
                    id: field.id,
                    value,
                  });
                }}
              />
            </Flex>
          ))}
        </Space>
      </FilterSectionStyled>
    )}

    <Button block onClick={handleClearFilters}>
      Clear All Filters
    </Button>
  </>
);

export default FilterPanel;
