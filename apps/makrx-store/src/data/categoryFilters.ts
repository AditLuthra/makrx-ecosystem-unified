export interface CategoryFilter {
  id: string;
  name: string;
  type: 'checkbox' | 'range' | 'select';
  options?: {
    value: string;
    label: string;
    count?: number;
  }[];
}

export const categoryFilterSets = [
  {
    category: '3d-printers',
    filters: [
      {
        id: 'price',
        name: 'Price Range',
        type: 'range' as const,
        options: [
          { value: '0-500', label: '$0 - $500' },
          { value: '500-1000', label: '$500 - $1,000' },
          { value: '1000-2000', label: '$1,000 - $2,000' },
          { value: '2000+', label: '$2,000+' },
        ],
      },
      {
        id: 'brand',
        name: 'Brand',
        type: 'checkbox' as const,
        options: [
          { value: 'prusa', label: 'Prusa' },
          { value: 'ultimaker', label: 'Ultimaker' },
          { value: 'creality', label: 'Creality' },
        ],
      },
    ],
  },
];

export const getAllFiltersForCategory = (category: string): CategoryFilter[] => {
  const filterSet = categoryFilterSets.find((set) => set.category === category);
  return filterSet?.filters || [];
};
