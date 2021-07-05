import { browser, by, element, WebElement } from 'protractor';

var path = require('path');

export class AppPage {
  navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl) as Promise<unknown>;
  }

  getAppTitle(): Promise<string> {
    return element(by.id('app-title')).getText() as Promise<string>;
  }

  getCodeInEditor(): Promise<string> {
    return element(by.css('.ace_content')).getText() as Promise<string>;
  }

  clearCode(): Promise<void> {
    return element(by.css('.clear-button')).click() as Promise<void>;
  }

  getUploadElement(): WebElement {
    let uploadInput = element(by.css("input[type=file]"));
    browser.executeScript(
      "arguments[0].style.visibility = 'visible'; arguments[0].style.height = '1px'; arguments[0].style.width = '1px'; arguments[0].style.opacity = 1",
      uploadInput);
    return uploadInput;
  }

  uploadInvalidCode(): Promise<void> {
    let uploadInput = this.getUploadElement();
    let absolutePath = path.resolve('e2e/resources/test_invalid_code.txt');
    return uploadInput.sendKeys(absolutePath) as Promise<void>;
  }

  assembleCode(): Promise<void> {
    return element(by.css('.assemble-button')).click() as Promise<void>;
  }

  isAssembleError(): Promise<boolean> {
    return element(by.css('.alert-danger')).isDisplayed() as Promise<boolean>;
  }

  isClearButtonDisplayed(): Promise<boolean> {
    return element(by.css('.clear-button')).isDisplayed() as Promise<boolean>;
  }

  isAssembleButtonDisplayed(): Promise<boolean> {
    return element(by.css('.assemble-button')).isDisplayed() as Promise<boolean>;
  }

  isBrowseButtonDisplayed(): Promise<boolean> {
    return element(by.css('.browse-button')).isDisplayed() as Promise<boolean>;
  }

  isSlideExampleDropdownDisplayed(): Promise<boolean> {
    return element(by.css('.slide-examples-dropdown')).isDisplayed() as Promise<boolean>;
  }
}
