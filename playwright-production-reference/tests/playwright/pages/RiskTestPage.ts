import { Page } from '@playwright/test';

export class RiskTestPage {
  private readonly forMyselfButton;
  private readonly under18Button;
  private readonly manButton;
  private readonly yesButton;
  private readonly noButton;
  private readonly notHispanicButton;
  private readonly asianButton;
  private readonly heightDropdown;
  private readonly weightDropdown;
  private readonly showResultsButton;

  constructor(private readonly page: Page) {
    this.forMyselfButton = this.page.getByRole('button', {
      name: 'For Myself',
    });

    this.under18Button = this.page.getByRole('button', {
      name: 'Less than 18 years',
    });

    this.manButton = this.page.getByRole('button', {
      name: 'Man',
      exact: true,
    });

    this.yesButton = this.page.getByRole('button', {
      name: 'Yes',
    });

    this.noButton = this.page.getByRole('button', {
      name: 'No',
    });

    this.notHispanicButton = this.page.getByRole('button', {
      name: 'Not Hispanic, Latino, or',
    });

    this.asianButton = this.page.getByRole('button', {
      name: 'Asian',
    });

    this.heightDropdown = this.page.getByRole('combobox').first();

    this.weightDropdown = this.page
      .getByRole('combobox')
      .filter({ hasText: 'Weight' });

    this.showResultsButton = this.page.getByRole('button', {
      name: 'Show My Results',
    });
  }

async open() {
  await this.page.goto('/diabetes-risk-test');
}

  async selectForMyself() {
    await this.forMyselfButton.click();
  }

  async selectAgeUnder18() {
    await this.under18Button.click();
  }

  async selectGenderMan() {
    await this.manButton.click();
  }

  async selectYes() {
    await this.yesButton.click();
  }

  async selectNo() {
    await this.noButton.click();
  }

  async selectNotHispanic() {
    await this.notHispanicButton.click();
  }

  async selectAsian() {
    await this.asianButton.click();
  }

  async selectHeight() {
    await this.heightDropdown.click();
    await this.page.getByText("' 0\" (152cm)").click();
  }

  async selectWeight() {
    await this.weightDropdown.click();

    await this.page
      .getByRole('option', { name: '-152 lbs. (54-69kg)' })
      .click();
  }

  async showResults() {
    await this.showResultsButton.click();
  }
}