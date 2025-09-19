/**
 * Product Recommendation System
 * Generates intelligent product recommendations based on user behavior,
 * product relationships, and purchase patterns
 */

import type { Product } from '@/types';

const normalize = (value?: string): string => value?.toLowerCase().trim() ?? '';

const getProductCategorySlug = (category: Product['category']): string => {
  if (!category) return '';
  if (typeof category === 'string') return category;
  if (category.slug) return category.slug;
  if (category.name) return category.name;
  return category.id ? String(category.id) : '';
};

const getProductCategoryName = (category: Product['category']): string => {
  if (!category) return '';
  if (typeof category === 'string') return category;
  return category.name || category.slug || '';
};

const matchesCategory = (product: Product, targetCategory: string): boolean => {
  const target = normalize(targetCategory);
  if (!target) return false;
  const slug = normalize(getProductCategorySlug(product.category));
  const name = normalize(getProductCategoryName(product.category));
  return slug === target || name === target;
};

const getRatingValue = (product: Product): number => {
  if (typeof product.rating === 'number') return product.rating;
  if (product.rating && typeof product.rating === 'object') return product.rating.average ?? 0;
  if (typeof product.ratingScore === 'number') return product.ratingScore;
  return 0;
};

const getReviewCountValue = (product: Product): number => {
  return product.review_count ?? product.reviewCount ?? 0;
};

const getPriceSafe = (value: number | undefined): number => (typeof value === 'number' ? value : 0);

const getCategoryKeywords = (product: Product): string[] => {
  const values = [getProductCategorySlug(product.category), getProductCategoryName(product.category)];
  return values.filter(Boolean).map((value) => value.toLowerCase());
};

const getPopularityScore = (product: Product): number => {
  return getRatingValue(product) * getReviewCountValue(product);
};

const haveSharedCategory = (productA: Product, productB: Product): boolean => {
  const slugA = normalize(getProductCategorySlug(productA.category));
  const slugB = normalize(getProductCategorySlug(productB.category));
  if (slugA && slugB && slugA === slugB) return true;
  const nameA = normalize(getProductCategoryName(productA.category));
  const nameB = normalize(getProductCategoryName(productB.category));
  return !!nameA && nameA === nameB;
};

export interface RecommendationOptions {
  baseProduct?: Product;
  category?: string;
  userPreferences?: string[];
  priceRange?: { min: number; max: number };
  maxResults?: number;
  excludeIds?: string[];
}

export interface RecommendationScore {
  productId: number;
  score: number;
  reasons: string[];
  type: 'similar' | 'complementary' | 'popular' | 'trending' | 'frequently_bought_together';
}

export interface RecommendationEngine {
  generateRecommendations(products: Product[], options: RecommendationOptions): Product[];
  getRelatedProducts(baseProduct: Product, allProducts: Product[]): Product[];
  getFrequentlyBoughtTogether(baseProduct: Product, allProducts: Product[]): Product[];
  getTrendingProducts(products: Product[]): Product[];
  getPopularInCategory(products: Product[], category: string): Product[];
}

export class SmartRecommendationEngine implements RecommendationEngine {
  generateRecommendations(products: Product[], options: RecommendationOptions): Product[] {
    let recommendations: Product[] = [];
    const maxResults = options.maxResults || 8;
    const excludeIds = new Set((options.excludeIds || []).map((id) => Number(id)));

    // Filter out excluded products
    const availableProducts = products.filter((p) => !excludeIds.has(p.id));

    if (options.baseProduct) {
      // Get product-based recommendations
      const similar = this.getRelatedProducts(options.baseProduct, availableProducts);
      const complementary = this.getFrequentlyBoughtTogether(
        options.baseProduct,
        availableProducts,
      );

      recommendations = [...similar.slice(0, 4), ...complementary.slice(0, 4)];
    } else if (options.category) {
      // Get category-based recommendations
      const popular = this.getPopularInCategory(availableProducts, options.category);
      const trending = this.getTrendingProducts(
        availableProducts.filter((p) => matchesCategory(p, options.category!)),
      );

      recommendations = [...popular.slice(0, 4), ...trending.slice(0, 4)];
    } else {
      // Get general recommendations
      const trending = this.getTrendingProducts(availableProducts);
      const popular = this.getPopularProducts(availableProducts);

      recommendations = [...trending.slice(0, 4), ...popular.slice(0, 4)];
    }

    // Apply price filtering if specified
    if (options.priceRange) {
      recommendations = recommendations.filter(
        (p) => p.price >= options.priceRange!.min && p.price <= options.priceRange!.max,
      );
    }

    // Remove duplicates and limit results
    const uniqueRecommendations = recommendations
      .filter((product, index, self) => index === self.findIndex((p) => p.id === product.id))
      .slice(0, maxResults);

    return uniqueRecommendations;
  }

  getRelatedProducts(baseProduct: Product, allProducts: Product[]): Product[] {
    const scores: RecommendationScore[] = [];

    allProducts.forEach((product) => {
      if (product.id === baseProduct.id) return;

      let score = 0;
      const reasons: string[] = [];

      // Same category bonus
      if (haveSharedCategory(product, baseProduct)) {
        score += 30;
        reasons.push('Same category');
      }

      // Same brand bonus
      if (product.brand && baseProduct.brand && product.brand === baseProduct.brand) {
        score += 25;
        reasons.push('Same brand');
      }

      // Price similarity (within 50% range)
      const basePrice = getPriceSafe(baseProduct.price);
      const productPrice = getPriceSafe(product.price);
      if (basePrice > 0) {
        const priceDiff = Math.abs(productPrice - basePrice) / basePrice;
        if (priceDiff <= 0.5) {
          score += 20 * (1 - priceDiff);
          reasons.push('Similar price range');
        }
      }

      // Tag/keyword matching
      const baseTags = this.extractTags(baseProduct);
      const productTags = this.extractTags(product);
      const commonTags = baseTags.filter((tag) => productTags.includes(tag));

      if (commonTags.length > 0) {
        score += commonTags.length * 10;
        reasons.push(`${commonTags.length} matching features`);
      }

      // Compatibility check
      if (this.areCompatible(baseProduct, product)) {
        score += 40;
        reasons.push('Compatible products');
      }

      if (score > 10) {
        scores.push({
          productId: product.id,
          score,
          reasons,
          type: 'similar',
        });
      }
    });

    // Sort by score and return top products
    return scores
      .sort((a, b) => b.score - a.score)
      .map((score) => allProducts.find((p) => p.id === score.productId)!)
      .filter(Boolean);
  }

  getFrequentlyBoughtTogether(baseProduct: Product, allProducts: Product[]): Product[] {
    const complementaryScores: RecommendationScore[] = [];

    allProducts.forEach((product) => {
      if (product.id === baseProduct.id) return;

      let score = 0;
      const reasons: string[] = [];

      // Complementary categories
      const complementaryCategories = this.getComplementaryCategories(baseProduct.category);
      if (complementaryCategories.some((category) => matchesCategory(product, category))) {
        score += 50;
        reasons.push('Complementary category');
      }

      // Accessory detection
      if (this.isAccessory(product)) {
        score += 60;
        reasons.push('Compatible accessory');
      }

      // Project completion logic
      if (this.completesProject(baseProduct, product)) {
        score += 70;
        reasons.push('Completes project');
      }

      // Price complementarity (accessories typically cheaper)
      if (product.price < baseProduct.price * 0.3) {
        score += 15;
        reasons.push('Affordable add-on');
      }

      if (score > 30) {
        complementaryScores.push({
          productId: product.id,
          score,
          reasons,
          type: 'complementary',
        });
      }
    });

    return complementaryScores
      .sort((a, b) => b.score - a.score)
      .map((score) => allProducts.find((p) => p.id === score.productId)!)
      .filter(Boolean);
  }

  getTrendingProducts(products: Product[]): Product[] {
    // Mock trending algorithm - fallback: sort by popularity score
    return [...products].sort((a, b) => getPopularityScore(b) - getPopularityScore(a));
  }

  getPopularInCategory(products: Product[], category: string): Product[] {
    return products
      .filter((product) => matchesCategory(product, category))
      .sort((a, b) => getPopularityScore(b) - getPopularityScore(a));
  }

  private getPopularProducts(products: Product[]): Product[] {
    // No 'popular' property in Product, fallback to top rated
    return [...products].sort((a, b) => getPopularityScore(b) - getPopularityScore(a));
  }

  private extractTags(product: Product): string[] {
    const tags: string[] = [];
    // Extract from name
    const nameWords = product.name.toLowerCase().split(/\s+/);
    tags.push(...nameWords);
    // Extract from brand
    if (product.brand) tags.push(product.brand.toLowerCase());
    // Extract from category
    tags.push(...getCategoryKeywords(product));
    // Extract from description
    if (product.description) tags.push(...product.description.toLowerCase().split(/\s+/));
    // No tags/specifications/compatibility in Product type
    return Array.from(new Set(tags));
  }

  private areCompatible(product1: Product, product2: Product): boolean {
    // Check if products are listed as compatible
    // No compatibility property, fallback: check for shared category or brand
    const shareCategory = haveSharedCategory(product1, product2);
    const shareBrand =
      Boolean(product1.brand) && Boolean(product2.brand) && product1.brand === product2.brand;
    return shareCategory || shareBrand;
  }

  private getComplementaryCategories(category: Product['category']): string[] {
    const complementaryMap: { [key: string]: string[] } = {
      electronics: ['components', 'tools', 'kits'],
      components: ['electronics', 'tools'],
      '3d-printers': ['materials', 'tools'],
      materials: ['3d-printers', 'tools'],
      tools: ['electronics', 'components', 'materials'],
      kits: ['tools', 'components'],
    };

    const key = normalize(getProductCategorySlug(category));
    return complementaryMap[key] || [];
  }

  private isAccessory(product: Product): boolean {
    // No tags/specifications, fallback: check name/description for accessory keywords
    const accessoryKeywords = [
      'cable',
      'wire',
      'connector',
      'adapter',
      'case',
      'cover',
      'mount',
      'bracket',
      'holder',
      'stand',
      'screw',
      'bolt',
    ];
    const text = (product.name + ' ' + product.description).toLowerCase();
    return accessoryKeywords.some((keyword) => text.includes(keyword));
  }

  private completesProject(baseProduct: Product, complementProduct: Product): boolean {
    // Fallback: check if complementProduct's category or name contains baseProduct's category or vice versa
    const cat1 = normalize(
      getProductCategoryName(baseProduct.category) || getProductCategorySlug(baseProduct.category),
    );
    const cat2 = normalize(
      getProductCategoryName(complementProduct.category) ||
        getProductCategorySlug(complementProduct.category),
    );
    const name1 = normalize(baseProduct.name);
    const name2 = normalize(complementProduct.name);
    const catMatch = !!cat1 && !!cat2 && (cat1.includes(cat2) || cat2.includes(cat1));
    const nameMatch = !!name1 && !!name2 && (name1.includes(name2) || name2.includes(name1));
    return Boolean(catMatch || nameMatch);
  }
}

// Export singleton instance
export const recommendationEngine = new SmartRecommendationEngine();

// Helper functions for easier usage
export const getRecommendations = (
  products: Product[],
  options: RecommendationOptions,
): Product[] => {
  return recommendationEngine.generateRecommendations(products, options);
};

export const getRelatedProducts = (
  baseProduct: Product,
  allProducts: Product[],
  maxResults: number = 6,
): Product[] => {
  return recommendationEngine.getRelatedProducts(baseProduct, allProducts).slice(0, maxResults);
};

export const getFrequentlyBoughtTogether = (
  baseProduct: Product,
  allProducts: Product[],
  maxResults: number = 4,
): Product[] => {
  return recommendationEngine
    .getFrequentlyBoughtTogether(baseProduct, allProducts)
    .slice(0, maxResults);
};
