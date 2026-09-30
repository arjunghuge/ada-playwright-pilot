import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base-page.js';

/**
 * Page Object for the Calendar Events listing page at /events/calendar-events
 *
 * Manages interactions with the calendar event listing, including:
 * - Event card discovery and counting
 * - Load More pagination
 * - Event search and filtering (if available)
 * - Event card interactions (view, register, etc.)
 * - Event content validation (titles, dates, locations, images)
 * - Filtering and search functionality
 * - Sorting options
 */
export class CalendarEventPage extends BasePage {
  readonly heading: Locator;
  readonly eventCards: Locator;
  readonly loadMoreButton: Locator;
  readonly noEventsMessage: Locator;

  // Filter selectors
  readonly dateFromInput: Locator;
  readonly dateToInput: Locator;
  readonly categorySelect: Locator;
  readonly locationSelect: Locator;
  readonly searchInput: Locator;
  readonly applyFiltersButton: Locator;
  readonly clearFiltersButton: Locator;

  // Sort selectors
  readonly sortSelect: Locator;
  readonly sortByDateAscBtn: Locator;
  readonly sortByDateDescBtn: Locator;
  readonly sortByPopularityBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /calendar.*events|events/i, level: 1 });
    // Event cards use a specific container class for reliable selection
    this.eventCards = page.locator('div.search-event-content');
    this.loadMoreButton = page.getByRole('link', { name: /load more/i });
    this.noEventsMessage = page.getByText(/no events|no calendar events/i);

    // Filter controls - try multiple selectors for robustness
    this.dateFromInput = page.locator('input[name="dateFrom"], input[name="start_date"], input[placeholder*="From"], input[aria-label*="from"]').first();
    this.dateToInput = page.locator('input[name="dateTo"], input[name="end_date"], input[placeholder*="To"], input[aria-label*="to"]').first();
    this.categorySelect = page.locator('select[name*="category"], select[name*="type"], [role="combobox"][aria-label*="category"]').first();
    this.locationSelect = page.locator('select[name*="location"], select[name*="venue"], [role="combobox"][aria-label*="location"]').first();
    this.searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name="q"]').first();
    this.applyFiltersButton = page.getByRole('button', { name: /apply|filter|search/i }).first();
    this.clearFiltersButton = page.getByRole('button', { name: /clear|reset/i }).first();

    // Sort controls
    this.sortSelect = page.locator('select[name*="sort"], [role="combobox"][aria-label*="sort"]').first();
    this.sortByDateAscBtn = page.getByRole('button', { name: /date.*asc|upcoming|earliest/i }).first();
    this.sortByDateDescBtn = page.getByRole('button', { name: /date.*desc|recent|latest/i }).first();
    this.sortByPopularityBtn = page.getByRole('button', { name: /popular|trending|most registered/i }).first();
  }

  /**
   * Navigate to the calendar events listing page
   */
  async goto(): Promise<void> {
    await super.goto('/events/calendar-events');
  }

  /**
   * Get the current count of visible event cards
   */
  async getEventCardCount(): Promise<number> {
    return await this.eventCards.count();
  }

  /**
   * Verify the page is loaded and ready
   */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/events\/calendar-events/);
    // Either heading is visible OR no-events message, indicating page is ready
    const headingVisible = await this.heading.isVisible().catch(() => false);
    const noEventsVisible = await this.noEventsMessage.isVisible().catch(() => false);
    expect(headingVisible || noEventsVisible, 'Calendar events page should display either heading or no-events message').toBeTruthy();
  }

  /**
   * Verify at least one event card is visible
   */
  async expectEventsPresent(): Promise<void> {
    const count = await this.getEventCardCount();
    expect(count, 'Expected at least one event card to be visible').toBeGreaterThan(0);
  }

  /**
   * Verify no events are currently visible
   */
  async expectNoEvents(): Promise<void> {
    const count = await this.getEventCardCount();
    expect(count, 'Expected no event cards to be visible').toBe(0);
  }

  /**
   * Verify the load more button is visible
   */
  async expectLoadMoreButtonVisible(): Promise<void> {
    await expect(this.loadMoreButton).toBeVisible();
  }

  /**
   * Verify the load more button is not visible (all events loaded)
   */
  async expectLoadMoreButtonHidden(): Promise<void> {
    await expect(this.loadMoreButton).toBeHidden();
  }

  /**
   * Click the Load More button and wait for additional events to appear.
   * This polls until the event count increases.
   */
  async clickLoadMoreButton(): Promise<void> {
    const initialCount = await this.getEventCardCount();
    await this.loadMoreButton.click();
    // Poll until more cards are loaded
    await expect.poll(async () => await this.getEventCardCount()).toBeGreaterThan(initialCount);
  }

  /**
   * Get all visible event card locators (useful for iterating or further inspection)
   */
  getEventCardLocators(): Locator {
    return this.eventCards;
  }

  /**
   * Get a specific event card by index (0-based)
   */
  getEventCardByIndex(index: number): Locator {
    return this.eventCards.nth(index);
  }

  /**
   * Verify the Load More button exists and attempt pagination if present.
   * Returns true if more events were loaded, false if no more button is available.
   */
  async loadMoreIfAvailable(): Promise<boolean> {
    const isVisible = await this.loadMoreButton.isVisible().catch(() => false);
    if (isVisible) {
      await this.clickLoadMoreButton();
      return true;
    }
    return false;
  }

  // ============================================
  // Event Card Content Methods
  // ============================================

  /**
   * Extract event title from a specific card
   */
  async getEventTitle(cardIndex: number): Promise<string> {
    const card = this.getEventCardByIndex(cardIndex);
    // Try multiple selector patterns for title
    const titleLocator = card.locator('h2, h3, [role="heading"], .event-title, .card-title').first();
    const title = await titleLocator.textContent().catch(() => '');
    return title?.trim() || '';
  }

  /**
   * Extract event date from a specific card
   */
  async getEventDate(cardIndex: number): Promise<string> {
    const card = this.getEventCardByIndex(cardIndex);
    // Try multiple selector patterns for date
    const dateLocator = card.locator('.event-date, [data-testid="event-date"], .date, time, .card-date').first();
    const date = await dateLocator.textContent().catch(() => '');
    return date?.trim() || '';
  }

  /**
   * Extract event location from a specific card
   */
  async getEventLocation(cardIndex: number): Promise<string> {
    const card = this.getEventCardByIndex(cardIndex);
    // Try multiple selector patterns for location
    const locationLocator = card.locator('.event-location, .venue, .location, [data-testid="location"]').first();
    const location = await locationLocator.textContent().catch(() => '');
    return location?.trim() || '';
  }

  /**
   * Extract event description from a specific card
   */
  async getEventDescription(cardIndex: number): Promise<string> {
    try {
      const card = this.getEventCardByIndex(cardIndex);
      // Try specific selectors with timeout
      let descLocator = card.locator('.event-description').first();
      let desc = await descLocator.textContent({ timeout: 1000 }).catch(() => null);
      if (desc) return desc.trim();

      descLocator = card.locator('.description').first();
      desc = await descLocator.textContent({ timeout: 1000 }).catch(() => null);
      if (desc) return desc.trim();

      descLocator = card.locator('.summary').first();
      desc = await descLocator.textContent({ timeout: 1000 }).catch(() => null);
      if (desc) return desc.trim();

      return '';
    } catch {
      return '';
    }
  }

  /**
   * Get event image element from a specific card
   */
  getEventImage(cardIndex: number): Locator {
    const card = this.getEventCardByIndex(cardIndex);
    // Try specific image selectors
    return card.locator('img').first();
  }

  /**
   * Get registration button from a specific card
   */
  getRegistrationButton(cardIndex: number): Locator {
    const card = this.getEventCardByIndex(cardIndex);
    // Try to find button with register-like text
    return card.locator('button, a[role="button"]').first();
  }

  /**
   * Get event status/badge (e.g., "Full", "Limited Spots", etc.)
   */
  async getEventStatus(cardIndex: number): Promise<string> {
    try {
      const card = this.getEventCardByIndex(cardIndex);
      // Try specific selectors with timeout
      let statusLocator = card.locator('.status').first();
      let status = await statusLocator.textContent({ timeout: 1000 }).catch(() => null);
      if (status) return status.trim();

      statusLocator = card.locator('.badge').first();
      status = await statusLocator.textContent({ timeout: 1000 }).catch(() => null);
      if (status) return status.trim();

      return '';
    } catch {
      return '';
    }
  }

  /**
   * Verify multiple content fields are present in an event card
   */
  async verifyEventCardHasContent(cardIndex: number, fields: ('title' | 'date' | 'location' | 'description' | 'image')[]): Promise<void> {
    for (const field of fields) {
      switch (field) {
        case 'title':
          await this.expectEventTitlePresent(cardIndex);
          break;
        case 'date':
          await this.expectEventDateFormatValid(cardIndex);
          break;
        case 'location':
          await this.expectEventLocationPresent(cardIndex);
          break;
        case 'description':
          await this.expectEventDescriptionPresent(cardIndex);
          break;
        case 'image':
          await this.expectEventImageLoadable(cardIndex);
          break;
      }
    }
  }

  // ============================================
  // Filter Methods
  // ============================================

  /**
   * Fill date range filter (from and to dates)
   */
  async fillDateRangeFilter(startDate: string, endDate: string): Promise<void> {
    const dateFromVisible = await this.dateFromInput.isVisible().catch(() => false);
    if (dateFromVisible) {
      await this.dateFromInput.fill(startDate);
      await this.dateToInput.fill(endDate);
    }
  }

  /**
   * Select a category filter option
   */
  async selectCategoryFilter(category: string): Promise<void> {
    const categoryVisible = await this.categorySelect.isVisible().catch(() => false);
    if (categoryVisible) {
      await this.categorySelect.selectOption(category);
    }
  }

  /**
   * Select a location filter option
   */
  async selectLocationFilter(location: string): Promise<void> {
    const locationVisible = await this.locationSelect.isVisible().catch(() => false);
    if (locationVisible) {
      await this.locationSelect.selectOption(location);
    }
  }

  /**
   * Fill search input with keyword
   */
  async fillSearchInput(keyword: string): Promise<void> {
    const searchVisible = await this.searchInput.isVisible().catch(() => false);
    if (searchVisible) {
      await this.searchInput.fill(keyword);
    }
  }

  /**
   * Apply filters by clicking the apply button (if exists)
   */
  async applyFilters(): Promise<void> {
    const applyVisible = await this.applyFiltersButton.isVisible().catch(() => false);
    if (applyVisible) {
      await this.applyFiltersButton.click();
      // Wait for potential content to update (with reasonable timeout)
      await this.page.waitForTimeout(800);
    }
  }

  /**
   * Clear all filters
   */
  async clearAllFilters(): Promise<void> {
    const clearVisible = await this.clearFiltersButton.isVisible().catch(() => false);
    if (clearVisible) {
      await this.clearFiltersButton.click();
      // Wait for results to update
      await this.page.waitForTimeout(500);
    }
  }

  // ============================================
  // Sort Methods
  // ============================================

  /**
   * Sort events by date ascending (upcoming first)
   */
  async sortByDateAscending(): Promise<void> {
    // Try dropdown first
    const sortDropdownVisible = await this.sortSelect.isVisible().catch(() => false);
    if (sortDropdownVisible) {
      const options = await this.sortSelect.locator('option').allTextContents();
      const ascOption = options.find((opt) => /asc|upcoming|earliest/i.test(opt));
      if (ascOption) {
        await this.sortSelect.selectOption(ascOption);
      }
      await this.page.waitForTimeout(300);
      return;
    }

    // Try button
    const sortBtnVisible = await this.sortByDateAscBtn.isVisible().catch(() => false);
    if (sortBtnVisible) {
      await this.sortByDateAscBtn.click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Sort events by date descending (most recent first)
   */
  async sortByDateDescending(): Promise<void> {
    // Try dropdown first
    const sortDropdownVisible = await this.sortSelect.isVisible().catch(() => false);
    if (sortDropdownVisible) {
      const options = await this.sortSelect.locator('option').allTextContents();
      const descOption = options.find((opt) => /desc|recent|latest/i.test(opt));
      if (descOption) {
        await this.sortSelect.selectOption(descOption);
      }
      await this.page.waitForTimeout(300);
      return;
    }

    // Try button
    const sortBtnVisible = await this.sortByDateDescBtn.isVisible().catch(() => false);
    if (sortBtnVisible) {
      await this.sortByDateDescBtn.click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Sort events by popularity (registration count)
   */
  async sortByPopularity(): Promise<void> {
    // Try dropdown first
    const sortDropdownVisible = await this.sortSelect.isVisible().catch(() => false);
    if (sortDropdownVisible) {
      const options = await this.sortSelect.locator('option').allTextContents();
      const popularOption = options.find((opt) => /popular|trending/i.test(opt));
      if (popularOption) {
        await this.sortSelect.selectOption(popularOption);
      }
      await this.page.waitForTimeout(300);
      return;
    }

    // Try button
    const sortBtnVisible = await this.sortByPopularityBtn.isVisible().catch(() => false);
    if (sortBtnVisible) {
      await this.sortByPopularityBtn.click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Get current sort order
   */
  async getCurrentSortOrder(): Promise<string> {
    const sortDropdownVisible = await this.sortSelect.isVisible().catch(() => false);
    if (sortDropdownVisible) {
      const selected = await this.sortSelect.inputValue().catch(() => '');
      return selected;
    }
    return '';
  }

  // ============================================
  // Verification Methods
  // ============================================

  /**
   * Verify event title is present and non-empty
   */
  async expectEventTitlePresent(cardIndex: number): Promise<void> {
    const title = await this.getEventTitle(cardIndex);
    expect(title, `Event card ${cardIndex} should have a non-empty title`).toBeTruthy();
  }

  /**
   * Verify event date format is valid
   */
  async expectEventDateFormatValid(cardIndex: number): Promise<void> {
    const date = await this.getEventDate(cardIndex);
    expect(date, `Event card ${cardIndex} should display a date`).toBeTruthy();
    // Basic check for date-like content (not foolproof but catches obvious issues)
    const hasDatePatterns = /\d{1,2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(date);
    expect(hasDatePatterns, `Event card ${cardIndex} date should contain date-like content`).toBeTruthy();
  }

  /**
   * Verify event location is present
   */
  async expectEventLocationPresent(cardIndex: number): Promise<void> {
    const location = await this.getEventLocation(cardIndex);
    expect(location, `Event card ${cardIndex} should display location information`).toBeTruthy();
  }

  /**
   * Verify event description is present
   */
  async expectEventDescriptionPresent(cardIndex: number): Promise<void> {
    const description = await this.getEventDescription(cardIndex);
    expect(description, `Event card ${cardIndex} should display description`).toBeTruthy();
  }

  /**
   * Verify event image is loadable
   */
  async expectEventImageLoadable(cardIndex: number): Promise<void> {
    const image = this.getEventImage(cardIndex);
    const imageVisible = await image.isVisible().catch(() => false);
    expect(imageVisible, `Event card ${cardIndex} should display an image`).toBeTruthy();

    // Verify alt text exists
    const altText = await image.getAttribute('alt').catch(() => '');
    expect(altText, `Event card ${cardIndex} image should have alt text for accessibility`).toBeTruthy();
  }

  /**
   * Verify registration button is visible
   */
  async expectRegistrationButtonVisible(cardIndex: number): Promise<void> {
    const button = this.getRegistrationButton(cardIndex);
    const isVisible = await button.isVisible().catch(() => false);
    expect(isVisible || (await this.getEventStatus(cardIndex)).length > 0, `Event card ${cardIndex} should have register button or status indicator`).toBeTruthy();
  }

  /**
   * Verify filter results (event count) matches expected value
   */
  async verifyFilterResults(expectedCount: number): Promise<void> {
    const actualCount = await this.getEventCardCount();
    expect(actualCount, `Expected ${expectedCount} events after filtering, got ${actualCount}`).toBe(expectedCount);
  }

  /**
   * Verify no events are displayed (empty filter result)
   */
  async expectNoEventsFiltered(): Promise<void> {
    const count = await this.getEventCardCount();
    expect(count, 'Expected no events after filtering').toBe(0);
  }

  /**
   * Verify sort order by checking dates (basic validation)
   */
  async verifySortOrderByDates(ascending: boolean): Promise<boolean> {
    const count = await this.getEventCardCount();
    if (count < 2) return true; // Can't verify sort with less than 2 items

    const dates: (Date | null)[] = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      const dateStr = await this.getEventDate(i);
      // Try to parse date - this is basic and may need adjustment based on actual date format
      const parsed = new Date(dateStr);
      dates.push(isNaN(parsed.getTime()) ? null : parsed);
    }

    // Filter out null dates and verify order
    const validDates = dates.filter((d) => d !== null) as Date[];
    if (validDates.length < 2) return true; // Can't verify

    for (let i = 1; i < validDates.length; i++) {
      if (ascending && validDates[i] < validDates[i - 1]) {
        return false;
      }
      if (!ascending && validDates[i] > validDates[i - 1]) {
        return false;
      }
    }

    return true;
  }
}
