'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductGrid from '@/components/ProductGrid';
import EnhancedCategoryFilters, { useFiltersToggle } from '@/components/EnhancedCategoryFilters';
import { CategorySEO } from '@/components/SEOMetaTags';
import SortSelect from '@/components/SortSelect';
import { storeApi } from '@/services/storeApi';

import type { Category, Product } from '@/types';

interface SearchFacet {
  name: string;
  type: string;
  values: Array<{
    id?: number;
    name: string;
    count: number;
  }>;
}

interface ProductList {
  products: Product[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
  facets: SearchFacet[];
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string[];
  const categoryPath = slug.join('/');
  const { isFiltersOpen, toggleFilters } = useFiltersToggle();

  const [category, setCategory] = useState<Category | null>(null);
  const [productList, setProductList] = useState<ProductList | null>(null);
  const [loading, setLoading] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ name: string; href: string }>>([]);

  // URL query params
  const searchParamsKey = useMemo(() => searchParams.toString(), [searchParams]);
  const filters = useMemo(
    () => Object.fromEntries(new URLSearchParams(searchParamsKey).entries()),
    [searchParamsKey],
  );
  const page = parseInt((filters.page as string | undefined) ?? '1', 10);
  const sort = (filters.sort as string | undefined) ?? 'popularity';

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        // Resolve category by traversing category tree
        const tree = await storeApi.getCategoryTree(true);
        const parts = categoryPath.split('/').filter(Boolean);
        const findByPath = (nodes: Category[], idx = 0): Category | null => {
          if (idx >= parts.length) return null;
          const node = nodes.find((n) => n.slug === parts[idx]);
          if (!node) return null;
          if (idx === parts.length - 1) return node;
          return findByPath(node.children ?? [], idx + 1);
        };
        const node = findByPath(tree.categories ?? []);
        if (!node) throw new Error('Category not found');
        // Construct category shape
        const cat: Category = {
          ...node,
          path: node.path ?? categoryPath,
          description: node.description ?? '',
          product_count: node.product_count ?? 0,
          productCount: node.productCount ?? node.product_count ?? 0,
          children: node.children ?? [],
          subcategories: node.subcategories ?? node.children ?? [],
        };
        setCategory(cat);

        // Build breadcrumbs
        const crumbs = [{ name: 'Home', href: '/' }];
        if (cat.path) {
          const pathParts = cat.path.split('/');
          let currentPath = '';
          for (const part of pathParts) {
            currentPath += (currentPath ? '/' : '') + part;
            const name = part.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
            crumbs.push({ name, href: `/c/${currentPath}` });
          }
        }
        setBreadcrumbs(crumbs);

        // Fetch products in category
        const productsData = await storeApi.advancedSearch({
          filters: { category_ids: [cat.id], ...filters },
          sort_by: sort,
          page,
          per_page: 20,
          include_facets: true,
        });
        setProductList(productsData);
      } catch (error) {
        console.error('Failed to fetch category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryPath, filters, page, sort]);

  if (loading) {
    return <CategoryPageSkeleton />;
  }

  if (!category) {
    return <CategoryNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white dark:bg-gray-800">
        {category.banner_image && (
          <div className="relative h-64 md:h-80">
            <Image
              src={category.banner_image}
              alt={category.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="container mx-auto px-4 pb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{category.name}</h1>
                {category.description && (
                  <p className="text-gray-200 text-lg max-w-2xl">{category.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {!category.banner_image && (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl">
                {category.description}
              </p>
            )}
          </div>
        )}

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="container mx-auto px-4 py-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Browse Subcategories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/c/${child.path}`}
                  className="group p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {child.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {child.product_count} items
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          {productList?.facets && (
            <EnhancedCategoryFilters
              facets={productList.facets.map((facet) => ({
                ...facet,
                values: facet.values.map((v) => ({
                  ...v,
                  id: v.id !== undefined ? String(v.id) : '',
                })),
              }))}
              activeFilters={Object.fromEntries(
                Object.entries(filters).map(([k, v]) => [k, v.split(',')]),
              )}
              isOpen={isFiltersOpen}
              onToggle={toggleFilters}
              onFilterChange={(newFilters) => {
                const url = new URL(window.location.href);
                Object.entries(newFilters).forEach(([key, value]) => {
                  if (value && value.length > 0) {
                    url.searchParams.set(key, value.join(','));
                  } else {
                    url.searchParams.delete(key);
                  }
                });
                window.history.pushState({}, '', url.toString());
                window.location.reload();
              }}
              className="lg:w-64 flex-shrink-0"
            />
          )}

          {/* Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex items-center justify-between w-full sm:w-auto">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {productList?.total_count || 0} products
                  </span>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                    <SortSelect
                      value={sort}
                      onChange={(newSort) => {
                        const url = new URL(window.location.href);
                        url.searchParams.set('sort', newSort);
                        window.history.pushState({}, '', url.toString());
                        window.location.reload();
                      }}
                    />
                  </div>
                </div>

                {/* Mobile Filter Button */}
                {productList?.facets && (
                  <div className="lg:hidden">
                    <EnhancedCategoryFilters
                      facets={productList.facets.map((facet) => ({
                        ...facet,
                        values: facet.values.map((v) => ({
                          ...v,
                          id: v.id !== undefined ? String(v.id) : '',
                        })),
                      }))}
                      activeFilters={Object.fromEntries(
                        Object.entries(filters).map(([k, v]) => [k, v.split(',')]),
                      )}
                      isOpen={isFiltersOpen}
                      onToggle={toggleFilters}
                      onFilterChange={(newFilters) => {
                        const url = new URL(window.location.href);
                        Object.entries(newFilters).forEach(([key, value]) => {
                          if (value && value.length > 0) {
                            url.searchParams.set(key, value.join(','));
                          } else {
                            url.searchParams.delete(key);
                          }
                        });
                        window.history.pushState({}, '', url.toString());
                        window.location.reload();
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Mobile Sort */}
              <div className="sm:hidden flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                <SortSelect
                  value={sort}
                  onChange={(newSort) => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('sort', newSort);
                    window.history.pushState({}, '', url.toString());
                    window.location.reload();
                  }}
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button className="p-2 rounded border border-gray-300 dark:border-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm8 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm8 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button className="p-2 rounded border border-gray-300 dark:border-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Product Grid */}
            {productList && (
              <ProductGrid
                products={productList.products}
                page={productList.page}
                totalPages={productList.total_pages}
                onPageChange={(newPage) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('page', newPage.toString());
                  window.history.pushState({}, '', url.toString());
                  window.location.reload();
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800">
        <div className="h-64 bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="w-64 h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Category Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The category you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/c"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Browse All Categories
        </Link>
      </div>
    </div>
  );
}
