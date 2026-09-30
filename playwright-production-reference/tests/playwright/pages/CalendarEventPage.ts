import { expect, Page } from '@playwright/test';


export class CalendarEventPage {
  private readonly loadMoreButton;
  private readonly eventCards;

  constructor( readonly page:Page) {
    this.loadMoreButton = page.getByRole('link', { name: 'Load More' });
    this.eventCards = page.locator('//div[@class="search-event-content"]');
  }

  async open() {
    await this.page.goto('/events/calendar-events');
  }
  
  async CountEventCards(): Promise<number> {
    return await this.eventCards.count();
  } 
  async clickLoadMoreButton(initialCount: number): Promise<void> {
    await this.loadMoreButton.click();
    await expect.poll(async () => await this.eventCards.count()).toBeGreaterThan(initialCount);
  } 
}